const { Worker } = require('bullmq');
const env = require('../config/env');
const logger = require('../config/logger');
const cache = require('../services/cache.service');
const { getBullConnection } = require('../queue/queue.config');
const { processRecurringTransactions } = require('../services/recurring.service');

const queueConfig = getBullConnection();

if (!queueConfig) {
  logger.warn('Recurring worker not started: REDIS_URL is not configured');
  process.exit(0);
}

const worker = new Worker(
  'recurring-transactions',
  async () => {
    const count = await processRecurringTransactions();
    if (count > 0) {
      await cache.delByPrefix('dashboard:');
      await cache.delByPrefix('analytics:');
      logger.info({ type: 'worker', worker: 'recurring', processed: count });
    }
    return { processed: count };
  },
  {
    ...queueConfig,
    concurrency: env.workerConcurrency,
  }
);

worker.on('failed', (job, err) => {
  logger.error({ type: 'worker', worker: 'recurring', jobId: job?.id, message: err.message });
});

worker.on('ready', () => {
  logger.info('Recurring worker started');
});
