const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get financial summary
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get date range from query or use current month
  let startDate, endDate;
  
  if (req.query.startDate && req.query.endDate) {
    startDate = new Date(req.query.startDate);
    endDate = new Date(req.query.endDate);
  } else {
    // Default to current month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  // Aggregate income and expenses
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Format the results
  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  summary.forEach(item => {
    if (item._id === 'income') {
      totalIncome = item.total;
      incomeCount = item.count;
    } else if (item._id === 'expense') {
      totalExpense = item.total;
      expenseCount = item.count;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      balance,
      savingsRate: parseFloat(savingsRate),
      incomeTransactions: incomeCount,
      expenseTransactions: expenseCount,
      period: {
        startDate,
        endDate
      }
    }
  });
});

/**
 * @desc    Get spending by category
 * @route   GET /api/analytics/category
 * @access  Private
 */
const getCategoryAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get date range from query or use current month
  let startDate, endDate;
  
  if (req.query.startDate && req.query.endDate) {
    startDate = new Date(req.query.startDate);
    endDate = new Date(req.query.endDate);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  // Get type filter (default to expense)
  const type = req.query.type || 'expense';

  // Aggregate by category
  const categoryData = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  // Calculate total for percentage
  const grandTotal = categoryData.reduce((sum, cat) => sum + cat.total, 0);

  // Format with percentages
  const formattedData = categoryData.map(cat => ({
    category: cat._id,
    total: cat.total,
    count: cat.count,
    avgAmount: Math.round(cat.avgAmount * 100) / 100,
    percentage: grandTotal > 0 ? Math.round((cat.total / grandTotal) * 10000) / 100 : 0
  }));

  res.status(200).json({
    success: true,
    data: {
      type,
      categories: formattedData,
      total: grandTotal,
      period: {
        startDate,
        endDate
      }
    }
  });
});

/**
 * @desc    Get monthly analytics
 * @route   GET /api/analytics/monthly
 * @access  Private
 */
const getMonthlyAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get year from query or use current year
  const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

  // Get number of months (default 12)
  const months = req.query.months ? parseInt(req.query.months) : 12;

  // Calculate date range
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Aggregate by month
  const monthlyData = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          year: { $year: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Format data by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formattedData = {};

  // Initialize all months
  for (let i = 1; i <= 12; i++) {
    formattedData[monthNames[i - 1]] = {
      month: i,
      monthName: monthNames[i - 1],
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0
    };
  }

  // Fill in actual data
  monthlyData.forEach(item => {
    const monthName = monthNames[item._id.month - 1];
    if (item._id.type === 'income') {
      formattedData[monthName].income = item.total;
      formattedData[monthName].transactions += item.count;
    } else {
      formattedData[monthName].expense = item.total;
      formattedData[monthName].transactions += item.count;
    }
  });

  // Calculate balance for each month
  Object.keys(formattedData).forEach(month => {
    formattedData[month].balance = 
      formattedData[month].income - formattedData[month].expense;
  });

  // Convert to array
  const dataArray = Object.values(formattedData);

  // Calculate year totals
  const yearTotals = dataArray.reduce(
    (acc, month) => ({
      income: acc.income + month.income,
      expense: acc.expense + month.expense,
      balance: acc.balance + month.balance
    }),
    { income: 0, expense: 0, balance: 0 }
  );

  res.status(200).json({
    success: true,
    data: {
      year,
      months: dataArray,
      yearTotals
    }
  });
});

/**
 * @desc    Get spending trends
 * @route   GET /api/analytics/trends
 * @access  Private
 */
const getTrends = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get last 6 months of data
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const trends = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: trends
  });
});

module.exports = {
  getSummary,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getTrends
};
