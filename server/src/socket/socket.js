let io;
const env = require('../config/env');
const logger = require('../config/logger');

function initSocket(server) {
  const { Server } = require('socket.io');
  const allowed = [env.clientUrl, /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/].filter(Boolean);
  io = new Server(server, {
    cors: {
      origin: allowed,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info({ type: 'socket', event: 'connected', socketId: socket.id });
    socket.on('join-user', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info({ type: 'socket', event: 'disconnected', socketId: socket.id });
    });
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
