const { Worker } = require('bullmq');
const env = require('../config/env');
const logger = require('../config/logger');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { getBullConnection } = require('../queue/queue.config');
const { buildMonthlyReport } = require('../modules/reports/reports.service');

const queueConfig = getBullConnection();

if (!queueConfig) {
  logger.warn('Reports worker not started: REDIS_URL is not configured');
  process.exit(0);
}

const worker = new Worker(
  'reports',
  async (job) => {
    if (job.name !== 'reports.generate') return { skipped: true };

    const { userId } = job.data;
    const targetUsers = userId ? [{ _id: userId }] : await User.find({}, { _id: 1 }).limit(1000);
    const results = [];

    for (const user of targetUsers) {
      const report = await buildMonthlyReport(user._id);

      await Notification.create({
        userId: user._id,
        type: 'report_generated',
        channel: 'in_app',
        title: 'Report generated',
        message: 'Your monthly report has been generated and is ready to export.',
        meta: {
          generatedAt: new Date(),
          incomeSummary: report.incomeSummary,
          expenseSummary: report.expenseSummary,
        },
        sentAt: new Date(),
      });

      results.push({
        userId: String(user._id),
        incomeSummary: report.incomeSummary,
        expenseSummary: report.expenseSummary,
      });
    }

    return { count: results.length, results };
  },
  {
    ...queueConfig,
    concurrency: 2,
  }
);

worker.on('failed', (job, err) => {
  logger.error({ type: 'worker', worker: 'reports', jobId: job?.id, jobName: job?.name, message: err.message });
});

worker.on('ready', () => {
  logger.info('Reports worker started');
});
