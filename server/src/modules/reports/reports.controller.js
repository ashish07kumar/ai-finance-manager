const asyncHandler = require('../../utils/asyncHandler');
const { buildMonthlyReport, generateCsv, generatePdf } = require('./reports.service');

const monthly = asyncHandler(async (req, res) => {
  const report = await buildMonthlyReport(req.user._id);
  res.status(200).json({ success: true, data: report });
});

const exportCsv = asyncHandler(async (req, res) => {
  const report = await buildMonthlyReport(req.user._id);
  const csv = generateCsv(report);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="financial-report.csv"');
  res.status(200).send(csv);
});

const exportPdf = asyncHandler(async (req, res) => {
  const report = await buildMonthlyReport(req.user._id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="financial-report.pdf"');
  const doc = generatePdf(report);
  doc.pipe(res);
  doc.end();
});

module.exports = { monthly, exportCsv, exportPdf };
