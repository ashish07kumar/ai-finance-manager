const Joi = require('joi');

const accountSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  type: Joi.string().valid('bank', 'credit_card', 'cash_wallet', 'investment').required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD').optional(),
  openingBalance: Joi.number().min(0).optional(),
  balance: Joi.number().optional(),
  metadata: Joi.object({
    institutionName: Joi.string().max(100).allow('').optional(),
    accountNumberMask: Joi.string().max(20).allow('').optional(),
    creditLimit: Joi.number().min(0).optional(),
    color: Joi.string().max(30).allow('').optional(),
    icon: Joi.string().max(50).allow('').optional(),
    notes: Joi.string().max(500).allow('').optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});

const updateAccountSchema = accountSchema.fork(['name', 'type'], (s) => s.optional()).min(1);

module.exports = { accountSchema, updateAccountSchema };
