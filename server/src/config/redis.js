const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let redisClient = null;

function getRedisClient() {
  if (!env.redisUrl) return null;
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
  }

  return redisClient;
}

module.exports = { getRedisClient };
