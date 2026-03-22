const User = require('../../models/User');
const Notification = require('../../models/Notification');
const Transaction = require('../../models/Transaction');
const analyticsService = require('../modules/analytics/analytics.service');
const { sendMail } = require('./email.service');

async function sendMonthlySummaries(limit = 1000) {
  const now = new Date();
  if (now.getDate() !== 1) return 0;

  const users = await User.find({ emailNotifications: true }).limit(limit);
  for (const user of users) {
    const summary = await analyticsService.getSummary(user._id, {});
    const text = `Income: ${summary.totalIncome.toFixed(2)}, Expense: ${summary.totalExpense.toFixed(2)}, Savings rate: ${summary.savingsRate}%`;

    await Notification.create({
      userId: user._id,
      type: 'monthly_summary',
      channel: 'in_app',
      title: 'Monthly spending summary',
      message: text,
      sentAt: new Date(),
    });

    await sendMail({
      to: user.email,
      subject: '[Finance Tracker] Monthly financial summary',
      text,
    });
  }

  return users.length;
}

async function detectUnusualSpending(limit = 1000) {
  const users = await User.find({}).limit(limit);
  let alerts = 0;

  for (const user of users) {
    const now = new Date();
    const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevious = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [current, previous] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'expense', date: { $gte: startCurrent, $lte: now } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'expense', date: { $gte: startPrevious, $lte: endPrevious } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const currentTotal = current[0]?.total || 0;
    const previousTotal = previous[0]?.total || 0;
    if (previousTotal <= 0) continue;

    const increaseRatio = currentTotal / previousTotal;
    if (increaseRatio < 1.5) continue;

    const message = `Unusual spending detected. Current month expenses are ${(increaseRatio * 100).toFixed(0)}% of last month.`;

    await Notification.create({
      userId: user._id,
      type: 'unusual_spending',
      channel: 'in_app',
      title: 'Unusual spending alert',
      message,
      meta: { currentTotal, previousTotal, increaseRatio },
      sentAt: new Date(),
    });

    if (user.emailNotifications) {
      await sendMail({
        to: user.email,
        subject: '[Finance Tracker] Unusual spending alert',
        text: message,
      });
    }

    alerts += 1;
  }

  return alerts;
}

module.exports = { sendMonthlySummaries, detectUnusualSpending };
