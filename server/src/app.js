const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./config/logger');
const { globalLimiter } = require('./middlewares/rateLimit.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { attachRequestContext, httpLogger } = require('./middlewares/request.middleware');
const { registerSwagger } = require('./docs/swagger');

const authRoutes = require('./modules/auth/auth.routes');
const accountRoutes = require('./modules/accounts/accounts.routes');
const transactionRoutes = require('./modules/transactions/transactions.routes');
const budgetRoutes = require('./modules/budgets/budgets.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const app = express();

app.use(helmet());
app.use(globalLimiter);

const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(attachRequestContext);
app.use(httpLogger);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Tracker API is running',
    version: '2.0.0',
    docs: '/api/docs',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

registerSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

process.on('unhandledRejection', (err) => logger.error(`Unhandled rejection: ${err.message}`));
process.on('uncaughtException', (err) => logger.error(`Uncaught exception: ${err.message}`));

module.exports = app;
