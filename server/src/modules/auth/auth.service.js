const ApiError = require('../../utils/ApiError');
const authRepository = require('./auth.repository');
const { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken } = require('../../services/token.service');
const logger = require('../../config/logger');

async function buildAuthResponse(user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, req.headers['user-agent'], req.ip);

  return {
    accessToken,
    refreshToken,
    user,
  };
}

const authService = {
  async register(payload, req) {
    const existing = await authRepository.findUserByEmail(payload.email);
    if (existing) throw new ApiError(409, 'User with this email already exists');

    const user = await authRepository.createUser({
      ...payload,
      email: payload.email.toLowerCase(),
    });

    logger.info({
      type: 'auth_event',
      event: 'register_success',
      email: user.email,
      requestId: req.requestId,
      ip: req.ip,
    });

    return buildAuthResponse(user, req);
  },

  async login(payload, req) {
    const user = await authRepository.findUserByEmail(payload.email);
    if (!user) {
      logger.warn({
        type: 'auth_event',
        event: 'login_failed',
        reason: 'user_not_found',
        email: payload.email,
        requestId: req.requestId,
        ip: req.ip,
      });
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValid = await user.comparePassword(payload.password);
    if (!isValid) {
      logger.warn({
        type: 'auth_event',
        event: 'login_failed',
        reason: 'invalid_password',
        email: payload.email,
        requestId: req.requestId,
        ip: req.ip,
      });
      throw new ApiError(401, 'Invalid credentials');
    }

    logger.info({
      type: 'auth_event',
      event: 'login_success',
      email: user.email,
      requestId: req.requestId,
      ip: req.ip,
    });

    return buildAuthResponse(user, req);
  },

  async refresh(refreshToken, req) {
    if (!refreshToken) throw new ApiError(401, 'Refresh token is required');

    const newRefreshToken = await rotateRefreshToken(refreshToken, req.headers['user-agent'], req.ip);
    if (!newRefreshToken) throw new ApiError(401, 'Invalid refresh token');

    const payload = require('jsonwebtoken').verify(newRefreshToken, require('../../config/env').refreshTokenSecret);
    const user = await authRepository.findUserById(payload.sub);
    if (!user) throw new ApiError(401, 'User not found');

    return {
      accessToken: signAccessToken(user),
      refreshToken: newRefreshToken,
      user,
    };
  },

  async me(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateProfile(userId, payload) {
    const user = await authRepository.updateUserById(userId, payload);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async logout(refreshToken, userId) {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    if (userId) {
      await authRepository.revokeAllRefreshTokens(userId);
    }
  },

  async adminListUsers() {
    return authRepository.listUsers();
  },
};

module.exports = authService;
