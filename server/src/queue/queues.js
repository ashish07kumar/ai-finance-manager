const { Queue } = require('bullmq');
const { getBullConnection } = require('./queue.config');

const connectionConfig = getBullConnection();

function createQueue(name) {
  if (!connectionConfig) return null;
  return new Queue(name, {
    ...connectionConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  });
}

const queues = {
  recurring: createQueue('recurring-transactions'),
  notifications: createQueue('notifications'),
  reports: createQueue('reports'),
  analytics: createQueue('analytics'),
};

module.exports = { queues, hasQueue: Boolean(connectionConfig) };
