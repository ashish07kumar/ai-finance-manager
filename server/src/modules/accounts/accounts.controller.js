const asyncHandler = require('../../utils/asyncHandler');
const service = require('./accounts.service');

const create = asyncHandler(async (req, res) => {
  const account = await service.create(req.user._id, req.body);
  res.status(201).json({ success: true, data: account });
});

const list = asyncHandler(async (req, res) => {
  const accounts = await service.list(req.user._id);
  res.status(200).json({ success: true, count: accounts.length, data: accounts });
});

const update = asyncHandler(async (req, res) => {
  const account = await service.update(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: account });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Account deleted' });
});

module.exports = { create, list, update, remove };
