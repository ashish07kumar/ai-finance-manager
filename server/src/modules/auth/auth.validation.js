const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD').optional(),
  emailNotifications: Joi.boolean().optional(),
}).min(1);

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
};
