const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createTransaction,
    getTransactions,
    getTransaction,
    updateTransaction,
    deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation rules
const transactionValidation = [
    body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be either income or expense'),
    body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
    body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
        'Salary', 'Investment', 'Business',
        'Food', 'Travel', 'Rent', 'Shopping',
        'Health', 'Entertainment', 'Education',
        'Utilities', 'Transportation', 'Insurance',
        'Savings', 'Other'
    ])
    .withMessage('Invalid category'),
    body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
    body('note')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters')
];

// Routes
router.route('/')
    .get(protect, getTransactions)
    .post(protect, transactionValidation, validate, createTransaction);

router.route('/:id')
    .get(protect, getTransaction)
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

module.exports = router;