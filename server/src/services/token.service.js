const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const RefreshToken = require('../../models/RefreshToken');

function signAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    env.accessTokenSecret,
    {
      subject: String(user._id),
      expiresIn: env.accessTokenTtl,
    }
  );
}

async function issueRefreshToken(user, userAgent, ipAddress) {
  const jti = crypto.randomUUID();
  const rawToken = jwt.sign(
    { jti, role: user.role },
    env.refreshTokenSecret,
    {
      subject: String(user._id),
      expiresIn: env.refreshTokenTtl,
    }
  );

  const decoded = jwt.decode(rawToken);
  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = await bcrypt.hash(rawToken, 10);

  await RefreshToken.create({
    userId: user._id,
    jti,
    tokenHash,
    expiresAt,
    userAgent,
    ipAddress,
  });

  return rawToken;
}

async function rotateRefreshToken(refreshToken, userAgent, ipAddress) {
  const payload = jwt.verify(refreshToken, env.refreshTokenSecret);
  const tokenDoc = await RefreshToken.findOne({
    userId: payload.sub,
    jti: payload.jti,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) return null;

  const matches = await bcrypt.compare(refreshToken, tokenDoc.tokenHash);
  if (!matches) return null;

  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();

  return issueRefreshToken({ _id: payload.sub, role: payload.role }, userAgent, ipAddress);
}

async function revokeRefreshToken(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, env.refreshTokenSecret);
    await RefreshToken.findOneAndUpdate(
      { userId: payload.sub, jti: payload.jti, revokedAt: null },
      { revokedAt: new Date() }
    );
  } catch (error) {
    // Ignore token parse errors on logout.
  }
}

module.exports = {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};
