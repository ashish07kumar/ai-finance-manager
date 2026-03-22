const asyncHandler = require('../../utils/asyncHandler');
const service = require('./transactions.service');

const create = asyncHandler(async (req, res) => {
  const tx = await service.create(req.user._id, req.body);
  res.status(201).json({ success: true, data: tx });
});

const list = asyncHandler(async (req, res) => {
  const result = await service.list(req.user._id, req.query);
  res.status(200).json({ success: true, count: result.items.length, pagination: result.pagination, data: result.items });
});

const getOne = asyncHandler(async (req, res) => {
  const tx = await service.get(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: tx });
});

const update = asyncHandler(async (req, res) => {
  const tx = await service.update(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: tx });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Transaction deleted' });
});

const createRecurring = asyncHandler(async (req, res) => {
  const rec = await service.createRecurring(req.user._id, req.body);
  res.status(201).json({ success: true, data: rec });
});

const listRecurring = asyncHandler(async (req, res) => {
  const items = await service.listRecurring(req.user._id);
  res.status(200).json({ success: true, count: items.length, data: items });
});

const uploadReceipt = asyncHandler(async (req, res) => {
  const result = await service.uploadTransactionReceipt(req.user._id, req.params.id, req.file);
  res.status(200).json({ success: true, data: result.transaction, uploaded: result.uploaded });
});

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  createRecurring,
  listRecurring,
  uploadReceipt,
};
