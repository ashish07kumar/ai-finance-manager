const { getRedisClient } = require('../config/redis');

const memoryCache = new Map();

function keyWithPrefix(key) {
  return `finance:${key}`;
}

async function get(key) {
  const redis = getRedisClient();
  const k = keyWithPrefix(key);

  if (redis) {
    const value = await redis.get(k);
    return value ? JSON.parse(value) : null;
  }

  const value = memoryCache.get(k);
  if (!value) return null;
  if (value.expiresAt < Date.now()) {
    memoryCache.delete(k);
    return null;
  }
  return value.payload;
}

async function set(key, payload, ttlSeconds = 120) {
  const redis = getRedisClient();
  const k = keyWithPrefix(key);

  if (redis) {
    await redis.set(k, JSON.stringify(payload), 'EX', ttlSeconds);
    return;
  }

  memoryCache.set(k, {
    payload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function delByPrefix(prefix) {
  const redis = getRedisClient();
  const match = keyWithPrefix(prefix);

  if (redis) {
    const keys = await redis.keys(`${match}*`);
    if (keys.length) await redis.del(keys);
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(match)) {
      memoryCache.delete(key);
    }
  }
}

module.exports = { get, set, delByPrefix };
