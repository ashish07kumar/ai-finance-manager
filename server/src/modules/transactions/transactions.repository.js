const Transaction = require('../../../models/Transaction');
const RecurringTransaction = require('../../../models/RecurringTransaction');

const transactionsRepository = {
  create(payload) {
    return Transaction.create(payload);
  },

  findByUser(userId, query, { page, limit, sort }) {
    return Transaction.find({ userId, ...query })
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
  },

  countByUser(userId, query) {
    return Transaction.countDocuments({ userId, ...query });
  },

  findById(id) {
    return Transaction.findById(id);
  },

  updateById(id, payload) {
    return Transaction.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  },

  addAttachment(id, attachmentPayload) {
    return Transaction.findByIdAndUpdate(
      id,
      {
        receiptUrl: attachmentPayload.url,
        $push: { attachments: attachmentPayload },
      },
      { new: true, runValidators: true }
    );
  },

  deleteById(id) {
    return Transaction.findByIdAndDelete(id);
  },

  createRecurring(payload) {
    return RecurringTransaction.create(payload);
  },

  listRecurring(userId) {
    return RecurringTransaction.find({ userId }).sort({ createdAt: -1 });
  },
};

module.exports = transactionsRepository;
