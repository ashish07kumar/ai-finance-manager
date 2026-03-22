const Joi = require('joi');

const allowedCategories = [
  'Salary', 'Investment', 'Business',
  'Food', 'Travel', 'Rent', 'Shopping',
  'Health', 'Entertainment', 'Education',
  'Utilities', 'Transportation', 'Insurance',
  'Savings', 'Other',
];

const attachmentSchema = Joi.object({
  url: Joi.string().uri().required(),
  name: Joi.string().required(),
  mimeType: Joi.string().required(),
  size: Joi.number().min(0).required(),
});

const transactionSchema = Joi.object({
  accountId: Joi.string().required(),
  type: Joi.string().valid('income', 'expense').required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid(...allowedCategories).required(),
  note: Joi.string().max(200).allow('').optional(),
  notes: Joi.string().max(500).allow('').optional(),
  merchantName: Joi.string().max(120).allow('').optional(),
  location: Joi.object({
    city: Joi.string().max(120).allow('').optional(),
    country: Joi.string().max(120).allow('').optional(),
    latitude: Joi.number().optional().allow(null),
    longitude: Joi.number().optional().allow(null),
    address: Joi.string().max(250).allow('').optional(),
  }).optional(),
  receiptUrl: Joi.string().uri().allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  attachments: Joi.array().items(attachmentSchema).optional(),
  date: Joi.date().optional(),
});

const updateTransactionSchema = transactionSchema.fork(
  ['accountId', 'type', 'amount', 'category'],
  (s) => s.optional()
).min(1);

const recurringSchema = Joi.object({
  accountId: Joi.string().required(),
  type: Joi.string().valid('income', 'expense').required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid(...allowedCategories).required(),
  notes: Joi.string().max(500).allow('').optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional().allow(null),
});

module.exports = {
  transactionSchema,
  updateTransactionSchema,
  recurringSchema,
};
