const asyncHandler = require('../../utils/asyncHandler');
const service = require('./analytics.service');

const summary = asyncHandler(async (req, res) => {
  const data = await service.getSummary(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

const category = asyncHandler(async (req, res) => {
  const data = await service.getCategoryAnalytics(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

const monthly = asyncHandler(async (req, res) => {
  const data = await service.getMonthlyAnalytics(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

const trends = asyncHandler(async (req, res) => {
  const data = await service.getTrends(req.user._id);
  res.status(200).json({ success: true, data });
});

const advanced = asyncHandler(async (req, res) => {
  const data = await service.getAdvanced(req.user._id);
  res.status(200).json({ success: true, data });
});

const insights = asyncHandler(async (req, res) => {
  const data = await service.getInsights(req.user._id);
  res.status(200).json({ success: true, data });
});

const financialHealth = asyncHandler(async (req, res) => {
  const data = await service.getFinancialHealth(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

const accounts = asyncHandler(async (req, res) => {
  const data = await service.getAccountAnalytics(req.user._id, req.query);
  res.status(200).json({ success: true, data });
});

module.exports = { summary, category, monthly, trends, advanced, insights, financialHealth, accounts };
