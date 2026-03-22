const ApiError = require('../../utils/ApiError');
const repo = require('./transactions.repository');
const Budget = require('../../../models/Budget');
const Transaction = require('../../../models/Transaction');
const Notification = require('../../../models/Notification');
const User = require('../../../models/User');
const Account = require('../../../models/Account');
const { sendMail } = require('../../services/email.service');
const { uploadReceipt } = require('../../services/storage.service');
const cache = require('../../services/cache.service');
const { emitToUser } = require('../../socket/socket');

function parseFilters(query) {
  const filters = {};
  if (query.type) filters.type = query.type;
  if (query.category) filters.category = query.category;
  if (query.accountId) filters.accountId = query.accountId;
  if (query.tag) filters.tags = query.tag;
  if (query.merchant) filters.merchantName = { $regex: query.merchant, $options: 'i' };

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) filters.date.$gte = new Date(query.startDate);
    if (query.endDate) filters.date.$lte = new Date(query.endDate);
  }

  return filters;
}

async function assertAccountOwnership(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) throw new ApiError(404, 'Account not found for this user');
  return account;
}

function signedAmount(tx) {
  return tx.type === 'income' ? tx.amount : -tx.amount;
}

async function applyBalanceDelta(accountId, delta) {
  await Account.findByIdAndUpdate(accountId, { $inc: { balance: delta } });
}

function nextRunFromFrequency(date, frequency) {
  const d = new Date(date);
  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d;
}

async function createBudgetNotificationIfNeeded(userId, transaction) {
  if (transaction.type !== 'expense') return;

  const txDate = new Date(transaction.date);
  const month = txDate.getMonth() + 1;
  const year = txDate.getFullYear();

  const budget = await Budget.findOne({ userId, category: transaction.category, month, year });
  if (!budget) return;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const spendAgg = await Transaction.aggregate([
    { $match: { userId: transaction.userId, type: 'expense', category: transaction.category, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, spent: { $sum: '$amount' } } },
  ]);

  const spent = spendAgg[0]?.spent || 0;
  const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

  let type = null;
  if (percentage >= 100) type = 'budget_exceeded';
  else if (percentage >= 80) type = 'budget_80';
  if (!type) return;

  const title = type === 'budget_exceeded' ? 'Budget exceeded' : 'Budget warning';
  const message = `${transaction.category} budget is at ${percentage.toFixed(0)}% for ${month}/${year}.`;

  await Notification.create({ userId, type, title, message, channel: 'in_app' });

  const user = await User.findById(userId);
  if (user?.emailNotifications) {
    await sendMail({
      to: user.email,
      subject: `[Finance Tracker] ${title}`,
      text: message,
    });
  }
}

const transactionsService = {
  async create(userId, payload) {
    await assertAccountOwnership(userId, payload.accountId);
    const tx = await repo.create({ ...payload, userId });
    await applyBalanceDelta(tx.accountId, signedAmount(tx));
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    await createBudgetNotificationIfNeeded(userId, tx);
    emitToUser(String(userId), 'transaction:created', tx);
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
    return tx;
  },

  async list(userId, query) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const sort = query.sort || '-date';
    const filters = parseFilters(query);

    const [items, total] = await Promise.all([
      repo.findByUser(userId, filters, { page, limit, sort }),
      repo.countByUser(userId, filters),
    ]);

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalTransactions: total,
        limit,
      },
    };
  },

  async get(userId, id) {
    const item = await repo.findById(id);
    if (!item || String(item.userId) !== String(userId)) throw new ApiError(404, 'Transaction not found');
    return item;
  },

  async update(userId, id, payload) {
    const existing = await this.get(userId, id);
    if (payload.accountId) await assertAccountOwnership(userId, payload.accountId);
    const updated = await repo.updateById(id, payload);

    const oldSigned = signedAmount(existing);
    const newSigned = signedAmount(updated);
    if (String(existing.accountId) === String(updated.accountId)) {
      const delta = newSigned - oldSigned;
      if (delta !== 0) await applyBalanceDelta(updated.accountId, delta);
    } else {
      await applyBalanceDelta(existing.accountId, -oldSigned);
      await applyBalanceDelta(updated.accountId, newSigned);
    }

    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'transaction:updated', updated);
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
    return updated;
  },

  async remove(userId, id) {
    const existing = await this.get(userId, id);
    await repo.deleteById(id);
    await applyBalanceDelta(existing.accountId, -signedAmount(existing));
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'transaction:deleted', { id });
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
  },

  async createRecurring(userId, payload) {
    await assertAccountOwnership(userId, payload.accountId);
    const startDate = new Date(payload.startDate);
    const recurring = await repo.createRecurring({
      ...payload,
      userId,
      nextExecutionDate: startDate,
      nextRunAt: startDate,
    });
    return recurring;
  },

  listRecurring(userId) {
    return repo.listRecurring(userId);
  },

  async uploadTransactionReceipt(userId, id, file) {
    const tx = await this.get(userId, id);
    const uploaded = await uploadReceipt(file, userId);
    const updated = await repo.addAttachment(id, {
      url: uploaded.url,
      name: uploaded.name,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
    });

    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'transaction:updated', updated);

    return { transaction: updated, uploaded, transactionId: tx._id };
  },

  nextRunFromFrequency,
};

module.exports = transactionsService;
