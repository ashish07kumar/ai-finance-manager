const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation rules
const budgetValidation = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Food', 'Travel', 'Rent', 'Shopping', 
      'Health', 'Entertainment', 'Education',
      'Utilities', 'Transportation', 'Insurance',
      'Savings', 'Other'
    ])
    .withMessage('Invalid category'),
  body('limit')
    .notEmpty()
    .withMessage('Budget limit is required')
    .isFloat({ min: 0 })
    .withMessage('Budget limit must be a positive number'),
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100')
];

// Routes
router.route('/')
  .get(protect, getBudgets)
  .post(protect, budgetValidation, validate, createBudget);

router.route('/:id')
  .get(protect, getBudget)
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

module.exports = router;
