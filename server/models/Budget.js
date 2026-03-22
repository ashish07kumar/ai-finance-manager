const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
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
    limit: {
      type: Number,
      required: [true, 'Please provide a budget limit'],
      min: [0, 'Budget limit cannot be negative']
    },
    month: {
      type: Number,
      required: [true, 'Please provide a month'],
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: [true, 'Please provide a year'],
      min: 2000,
      max: 2100
    }
  },
  {
    timestamps: true
  }
);

// Ensure user can only have one budget per category per month/year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
