const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user._id;

  const budget = await Budget.create(req.body);

  res.status(201).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Get all budgets for user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res, next) => {
  let query = { userId: req.user._id };

  // Filter by month and year if provided
  if (req.query.month) {
    query.month = parseInt(req.query.month);
  }
  if (req.query.year) {
    query.year = parseInt(req.query.year);
  }

  const budgets = await Budget.find(query).sort({ category: 1 });

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      // Get transactions for this category in the budget period
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

      const transactions = await Transaction.find({
        userId: req.user._id,
        category: budget.category,
        type: 'expense',
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budget.limit - spent;
      const percentageUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= 80 ? 'warning' : 'good'
      };
    })
  );

  res.status(200).json({
    success: true,
    count: budgetsWithSpending.length,
    data: budgetsWithSpending
  });
});

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Make sure user owns budget
  if (budget.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this budget'
    });
  }

  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res, next) => {
  let budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Make sure user owns budget
  if (budget.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this budget'
    });
  }

  budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: budget
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  // Make sure user owns budget
  if (budget.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this budget'
    });
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Budget deleted successfully',
    data: {}
  });
});

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget
};
