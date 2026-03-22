const User = require('../../../models/User');
const RefreshToken = require('../../../models/RefreshToken');

const authRepository = {
  findUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  },

  findUserById(id) {
    return User.findById(id);
  },

  createUser(payload) {
    return User.create(payload);
  },

  updateUserById(id, payload) {
    return User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  },

  listUsers() {
    return User.find().sort({ createdAt: -1 }).limit(200);
  },

  revokeAllRefreshTokens(userId) {
    return RefreshToken.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
  },
};

module.exports = authRepository;
