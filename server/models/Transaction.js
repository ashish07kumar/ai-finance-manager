const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify transaction type'],
      enum: ['income', 'expense'],
      lowercase: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0, 'Amount cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Salary',
        'Investment',
        'Business',
        'Food',
        'Travel',
        'Rent',
        'Shopping',
        'Health',
        'Entertainment',
        'Education',
        'Utilities',
        'Transportation',
        'Insurance',
        'Savings',
        'Other'
      ]
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot be more than 200 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    merchantName: {
      type: String,
      trim: true,
      maxlength: [120, 'Merchant name cannot be more than 120 characters'],
      index: true,
    },
    location: {
      city: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, trim: true, default: '' },
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    attachments: {
      type: [
        {
          url: String,
          name: String,
          mimeType: String,
          size: Number,
        },
      ],
      default: [],
    },
    recurringSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTransaction',
      default: null,
      index: true,
    },
    receiptUrl: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, accountId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, tags: 1, date: -1 });
transactionSchema.index({ userId: 1, merchantName: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
