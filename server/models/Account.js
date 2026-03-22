const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    type: {
      type: String,
      required: true,
      enum: ['bank', 'credit_card', 'cash_wallet', 'investment'],
      index: true,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'],
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
      index: true,
    },
    metadata: {
      institutionName: { type: String, trim: true, default: '' },
      accountNumberMask: { type: String, trim: true, default: '' },
      creditLimit: { type: Number, default: 0 },
      color: { type: String, trim: true, default: '' },
      icon: { type: String, trim: true, default: '' },
      notes: { type: String, trim: true, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);
