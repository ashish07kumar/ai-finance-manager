const RecurringTransaction = require('../../models/RecurringTransaction');
const Transaction = require('../../models/Transaction');
const Account = require('../../models/Account');
const logger = require('../config/logger');

function nextRunFromFrequency(date, frequency) {
  const d = new Date(date);
  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d;
}

function signedAmount(type, amount) {
  return type === 'income' ? amount : -amount;
}

async function processRecurringTransactions(limit = 500) {
  const now = new Date();
  const due = await RecurringTransaction.find({
    isActive: true,
    nextExecutionDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  }).limit(limit);

  for (const item of due) {
    const createdTx = await Transaction.create({
      userId: item.userId,
      accountId: item.accountId,
      type: item.type,
      amount: item.amount,
      category: item.category,
      notes: item.notes,
      tags: item.tags,
      recurringSourceId: item._id,
      date: now,
    });

    await Account.findByIdAndUpdate(item.accountId, {
      $inc: { balance: signedAmount(item.type, item.amount) },
    });

    item.lastExecutedAt = now;
    item.nextExecutionDate = nextRunFromFrequency(now, item.frequency);
    item.nextRunAt = item.nextExecutionDate;
    await item.save();

    logger.info({
      type: 'recurring',
      event: 'transaction_generated',
      recurringId: String(item._id),
      transactionId: String(createdTx._id),
      userId: String(item.userId),
    });
  }

  return due.length;
}

module.exports = { processRecurringTransactions, nextRunFromFrequency };
