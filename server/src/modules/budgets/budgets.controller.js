const asyncHandler = require('../../utils/asyncHandler');
const service = require('./budgets.service');

const create = asyncHandler(async (req, res) => {
  const budget = await service.create(req.user._id, req.body);
  res.status(201).json({ success: true, data: budget });
});

const list = asyncHandler(async (req, res) => {
  const budgets = await service.list(req.user._id, req.query);
  res.status(200).json({ success: true, count: budgets.length, data: budgets });
});

const getOne = asyncHandler(async (req, res) => {
  const budget = await service.get(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: budget });
});

const update = asyncHandler(async (req, res) => {
  const budget = await service.update(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: budget });
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Budget deleted' });
});

module.exports = { create, list, getOne, update, remove };
