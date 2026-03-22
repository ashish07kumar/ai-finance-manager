const ApiError = require('../../utils/ApiError');
const repo = require('./budgets.repository');
const cache = require('../../services/cache.service');
const { emitToUser } = require('../../socket/socket');

async function hydrateBudget(userId, budget) {
  const startDate = new Date(budget.year, budget.month - 1, 1);
  const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);
  const agg = await repo.aggregateSpent(userId, budget.category, startDate, endDate);
  const spent = agg[0]?.spent || 0;
  const remaining = budget.limit - spent;
  const percentageUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

  return {
    ...budget.toObject(),
    spent,
    remaining,
    percentageUsed: Math.round(percentageUsed * 100) / 100,
    status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= 80 ? 'warning' : 'good',
  };
}

const budgetsService = {
  async create(userId, payload) {
    const budget = await repo.create({ ...payload, userId });
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'budget:created', budget);
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
    return budget;
  },

  async list(userId, query) {
    const filters = {};
    if (query.month) filters.month = Number(query.month);
    if (query.year) filters.year = Number(query.year);
    const budgets = await repo.findByUser(userId, filters);
    return Promise.all(budgets.map((b) => hydrateBudget(userId, b)));
  },

  async get(userId, id) {
    const budget = await repo.findById(id);
    if (!budget || String(budget.userId) !== String(userId)) throw new ApiError(404, 'Budget not found');
    return hydrateBudget(userId, budget);
  },

  async update(userId, id, payload) {
    const budget = await repo.findById(id);
    if (!budget || String(budget.userId) !== String(userId)) throw new ApiError(404, 'Budget not found');
    const updated = await repo.updateById(id, payload);
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'budget:updated', updated);
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
    return updated;
  },

  async remove(userId, id) {
    const budget = await repo.findById(id);
    if (!budget || String(budget.userId) !== String(userId)) throw new ApiError(404, 'Budget not found');
    await repo.deleteById(id);
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    emitToUser(String(userId), 'budget:deleted', { id });
    emitToUser(String(userId), 'analytics:recalculated', { at: new Date().toISOString() });
  },
};

module.exports = budgetsService;
