const ApiError = require('../../utils/ApiError');
const repo = require('./accounts.repository');
const cache = require('../../services/cache.service');

const accountsService = {
  async create(userId, payload) {
    const openingBalance = Number(payload.openingBalance || 0);
    const account = await repo.create({
      ...payload,
      userId,
      openingBalance,
      balance: payload.balance ?? openingBalance,
    });
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    return account;
  },
  list(userId) {
    return repo.findByUser(userId);
  },
  async update(userId, id, payload) {
    const account = await repo.findById(id);
    if (!account || String(account.userId) !== String(userId)) {
      throw new ApiError(404, 'Account not found');
    }
    const updated = await repo.updateById(id, payload);
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
    return updated;
  },
  async remove(userId, id) {
    const account = await repo.findById(id);
    if (!account || String(account.userId) !== String(userId)) {
      throw new ApiError(404, 'Account not found');
    }
    await repo.deleteById(id);
    await cache.delByPrefix(`dashboard:${userId}`);
    await cache.delByPrefix(`analytics:${userId}`);
  },
};

module.exports = accountsService;
