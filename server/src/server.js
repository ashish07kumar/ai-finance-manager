const http = require('http');
const env = require('./config/env');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/socket');
const { startCronJobs } = require('./jobs/cron');

async function bootstrap() {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);
  startCronJobs();

  server.listen(env.port, () => {
    logger.info(`Finance Tracker API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Startup failed: ${err.message}`);
  process.exit(1);
});
