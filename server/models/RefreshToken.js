const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1, jti: 1 }, { unique: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
