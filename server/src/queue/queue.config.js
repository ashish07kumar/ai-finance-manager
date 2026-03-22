const env = require('../config/env');

function getBullConnection() {
  if (!env.redisUrl) {
    return null;
  }

  return {
    connection: {
      url: env.redisUrl,
      maxRetriesPerRequest: null,
    },
    prefix: env.queuePrefix,
  };
}

module.exports = { getBullConnection };
