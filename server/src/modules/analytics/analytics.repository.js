const Transaction = require('../../../models/Transaction');

const analyticsRepository = {
  aggregateSummary(userId, startDate, endDate) {
    return Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
  },

  aggregateCategory(userId, startDate, endDate, type = 'expense') {
    return Transaction.aggregate([
      { $match: { userId, type, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  },

  aggregateMonthly(userId, startDate, endDate) {
    return Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  },

  aggregateByAccount(userId, startDate, endDate) {
    return Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { accountId: '$accountId', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  },
};

module.exports = analyticsRepository;
