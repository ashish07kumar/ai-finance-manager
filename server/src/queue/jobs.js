const logger = require('../config/logger');
const { queues, hasQueue } = require('./queues');

async function enqueue(queueName, jobName, data = {}, options = {}) {
  if (!hasQueue || !queues[queueName]) {
    logger.warn({ type: 'queue', event: 'enqueue_skipped', queueName, jobName, reason: 'redis_not_configured' });
    return null;
  }

  const queue = queues[queueName];
  const job = await queue.add(jobName, data, options);
  return job.id;
}

module.exports = { enqueue, hasQueue, queues };
