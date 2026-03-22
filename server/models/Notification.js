const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['budget_80', 'budget_exceeded', 'monthly_summary', 'insight', 'unusual_spending', 'report_generated'],
      index: true,
    },
    channel: {
      type: String,
      enum: ['email', 'in_app'],
      default: 'in_app',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
