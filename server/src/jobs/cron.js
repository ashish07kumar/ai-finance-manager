const cron = require('node-cron');
const env = require('../config/env');
const logger = require('../config/logger');
const { enqueue, hasQueue } = require('../queue/jobs');
const { processRecurringTransactions } = require('../services/recurring.service');
const { sendMonthlySummaries, detectUnusualSpending } = require('../services/notification.service');

async function queueOrRun(queueName, jobName, fallbackFn) {
  try {
    if (hasQueue) {
      await enqueue(queueName, jobName, { scheduledAt: new Date().toISOString() });
      return;
    }

    await fallbackFn();
  } catch (error) {
    logger.error({ type: 'cron', queueName, jobName, message: error.message });
  }
}

function startCronJobs() {
  cron.schedule(env.recurringJobCron, async () => {
    await queueOrRun('recurring', 'recurring.process', processRecurringTransactions);
  });

  cron.schedule(env.monthlySummaryCron, async () => {
    await queueOrRun('notifications', 'notifications.monthly-summary', sendMonthlySummaries);
  });

  cron.schedule(env.unusualSpendCron, async () => {
    await queueOrRun('notifications', 'notifications.unusual-spend', detectUnusualSpending);
  });

  cron.schedule('0 2 * * *', async () => {
    await queueOrRun('analytics', 'analytics.compute-monthly', async () => {});
  });

  cron.schedule('30 2 * * *', async () => {
    await queueOrRun('reports', 'reports.generate', async () => {});
  });

  logger.info('Cron jobs initialized');
}

module.exports = { startCronJobs };
