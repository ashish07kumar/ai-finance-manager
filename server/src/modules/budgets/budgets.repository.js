const Budget = require('../../../models/Budget');
const Transaction = require('../../../models/Transaction');

const budgetsRepository = {
  create(payload) {
    return Budget.create(payload);
  },
  findByUser(userId, filters = {}) {
    return Budget.find({ userId, ...filters }).sort({ category: 1 });
  },
  findById(id) {
    return Budget.findById(id);
  },
  updateById(id, payload) {
    return Budget.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  },
  deleteById(id) {
    return Budget.findByIdAndDelete(id);
  },
  aggregateSpent(userId, category, startDate, endDate) {
    return Transaction.aggregate([
      { $match: { userId, type: 'expense', category, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, spent: { $sum: '$amount' } } },
    ]);
  },
};

module.exports = budgetsRepository;
