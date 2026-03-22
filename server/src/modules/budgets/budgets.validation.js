const Joi = require('joi');

const categories = [
  'Food', 'Travel', 'Rent', 'Shopping', 'Health',
  'Entertainment', 'Education', 'Utilities',
  'Transportation', 'Insurance', 'Savings', 'Other',
];

const budgetSchema = Joi.object({
  category: Joi.string().valid(...categories).required(),
  limit: Joi.number().positive().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
});

const updateBudgetSchema = budgetSchema.fork(['category', 'limit', 'month', 'year'], (s) => s.optional()).min(1);

module.exports = { budgetSchema, updateBudgetSchema };
