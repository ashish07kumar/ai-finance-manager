const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'finance-tracker-api' },
  transports: [
    new transports.Console({
      format: env.nodeEnv === 'production'
        ? format.json()
        : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;
