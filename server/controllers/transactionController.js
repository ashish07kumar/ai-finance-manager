const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.userId = req.user._id;

  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Get all transactions with filtering, pagination, and sorting
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res, next) => {
  // Build query
  let query = { userId: req.user._id };

  // Filter by type (income or expense)
  if (req.query.type) {
    query.type = req.query.type.toLowerCase();
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query.date = {};
    if (req.query.startDate) {
      query.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.date.$lte = new Date(req.query.endDate);
    }
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Sorting (default: newest first)
  const sort = req.query.sort || '-date';

  // Execute query
  const transactions = await Transaction.find(query)
    .sort(sort)
    .limit(limit)
    .skip(startIndex);

  // Get total count
  const total = await Transaction.countDocuments(query);

  // Pagination result
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalTransactions: total,
    limit
  };

  res.status(200).json({
    success: true,
    count: transactions.length,
    pagination,
    data: transactions
  });
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Make sure user owns transaction
  if (transaction.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this transaction'
    });
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Make sure user owns transaction
  if (transaction.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this transaction'
    });
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Make sure user owns transaction
  if (transaction.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this transaction'
    });
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully',
    data: {}
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
};
