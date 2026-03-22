const { Worker } = require('bullmq');
const env = require('../config/env');
const logger = require('../config/logger');
const User = require('../../models/User');
const cache = require('../services/cache.service');
const analyticsService = require('../modules/analytics/analytics.service');
const { getBullConnection } = require('../queue/queue.config');

const queueConfig = getBullConnection();

if (!queueConfig) {
  logger.warn('Analytics worker not started: REDIS_URL is not configured');
  process.exit(0);
}

const worker = new Worker(
  'analytics',
  async () => {
    const users = await User.find({}, { _id: 1 }).limit(1000);
    let refreshed = 0;

    for (const user of users) {
      await cache.delByPrefix(`dashboard:${user._id}`);
      await cache.delByPrefix(`analytics:${user._id}`);
      await analyticsService.getSummary(user._id, {});
      refreshed += 1;
    }

    return { refreshedUsers: refreshed };
  },
  {
    ...queueConfig,
    concurrency: 1,
  }
);

worker.on('failed', (job, err) => {
  logger.error({ type: 'worker', worker: 'analytics', jobId: job?.id, message: err.message });
});

worker.on('ready', () => {
  logger.info('Analytics worker started');
});
