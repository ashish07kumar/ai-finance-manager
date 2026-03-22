const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    tags: {
      type: [String],
      default: [],
    },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    nextExecutionDate: {
      type: Date,
      required: true,
      index: true,
    },
    nextRunAt: {
      type: Date,
      required: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastExecutedAt: Date,
  },
  { timestamps: true }
);

recurringTransactionSchema.index({ userId: 1, isActive: 1, nextRunAt: 1 });
recurringTransactionSchema.index({ userId: 1, isActive: 1, nextExecutionDate: 1 });

recurringTransactionSchema.pre('validate', function syncExecutionDate(next) {
  if (!this.nextExecutionDate && this.nextRunAt) {
    this.nextExecutionDate = this.nextRunAt;
  }
  if (!this.nextRunAt && this.nextExecutionDate) {
    this.nextRunAt = this.nextExecutionDate;
  }
  next();
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
