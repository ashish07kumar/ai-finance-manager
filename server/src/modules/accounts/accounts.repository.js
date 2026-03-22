const Account = require('../../../models/Account');

const accountsRepository = {
  create(payload) {
    return Account.create(payload);
  },
  findByUser(userId) {
    return Account.find({ userId }).sort({ createdAt: -1 });
  },
  findById(id) {
    return Account.findById(id);
  },
  updateById(id, payload) {
    return Account.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  },
  deleteById(id) {
    return Account.findByIdAndDelete(id);
  },
};

module.exports = accountsRepository;
