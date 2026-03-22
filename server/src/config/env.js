const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  accessTokenTtl: process.env.JWT_ACCESS_EXPIRE || '15m',
  refreshTokenTtl: process.env.JWT_REFRESH_EXPIRE || '30d',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  redisUrl: process.env.REDIS_URL || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || 'false') === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@finedge.local',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  receiptMaxFileSizeMb: Number(process.env.RECEIPT_MAX_FILE_SIZE_MB || 5),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  recurringJobCron: process.env.RECURRING_JOB_CRON || '*/5 * * * *',
  monthlySummaryCron: process.env.MONTHLY_SUMMARY_CRON || '0 8 * * *',
  unusualSpendCron: process.env.UNUSUAL_SPEND_CRON || '0 */6 * * *',
  queuePrefix: process.env.QUEUE_PREFIX || 'finance',
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY || 5),
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL || '',
};

if (!env.mongoUri) {
  // Keep warning non-fatal in dev to help local setup while still surfacing issue.
  console.warn('MONGO_URI is not set. Backend will fail to start without it.');
}

module.exports = env;
