const { Worker } = require('bullmq');
const env = require('../config/env');
const logger = require('../config/logger');
const { getBullConnection } = require('../queue/queue.config');
const { sendMonthlySummaries, detectUnusualSpending } = require('../services/notification.service');

const queueConfig = getBullConnection();

if (!queueConfig) {
  logger.warn('Notifications worker not started: REDIS_URL is not configured');
  process.exit(0);
}

const worker = new Worker(
  'notifications',
  async (job) => {
    if (job.name === 'notifications.monthly-summary') {
      const sent = await sendMonthlySummaries();
      return { sent };
    }

    if (job.name === 'notifications.unusual-spend') {
      const alerts = await detectUnusualSpending();
      return { alerts };
    }

    return { skipped: true };
  },
  {
    ...queueConfig,
    concurrency: Math.max(1, Math.floor(env.workerConcurrency / 2)),
  }
);

worker.on('failed', (job, err) => {
  logger.error({ type: 'worker', worker: 'notifications', jobId: job?.id, jobName: job?.name, message: err.message });
});

worker.on('ready', () => {
  logger.info('Notifications worker started');
});
