const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Transaction = require('../../../models/Transaction');

function monthRange(date) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
  };
}

async function buildMonthlyReport(userId, date = new Date()) {
  const { start, end } = monthRange(date);
  const tx = await Transaction.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 });

  const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryMap = {};
  for (const t of tx) {
    if (t.type !== 'expense') continue;
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  }

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return {
    period: { start, end },
    incomeSummary: income,
    expenseSummary: expense,
    savingsSummary: income - expense,
    net: income - expense,
    categoryBreakdown,
    transactions: tx,
  };
}

function generateCsv(report) {
  const parser = new Parser({
    fields: ['date', 'type', 'amount', 'category', 'accountId', 'merchantName', 'note'],
  });

  return parser.parse(
    report.transactions.map((t) => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      category: t.category,
      accountId: t.accountId,
      merchantName: t.merchantName || '',
      note: t.note || t.notes || '',
    }))
  );
}

function generatePdf(report) {
  const doc = new PDFDocument({ margin: 40 });

  doc.fontSize(20).text('Financial Report', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Income Summary: ${report.incomeSummary.toFixed(2)}`);
  doc.text(`Expense Summary: ${report.expenseSummary.toFixed(2)}`);
  doc.text(`Savings Summary: ${report.savingsSummary.toFixed(2)}`);
  doc.text(`Net: ${report.net.toFixed(2)}`);

  doc.moveDown().fontSize(14).text('Category Breakdown');
  report.categoryBreakdown.forEach((c) => {
    doc.fontSize(11).text(`- ${c.category}: ${c.total.toFixed(2)}`);
  });

  doc.moveDown().fontSize(14).text('Transactions');
  report.transactions.slice(0, 200).forEach((t) => {
    doc.fontSize(10).text(`${new Date(t.date).toISOString().slice(0, 10)} | ${t.type} | ${t.category} | ${t.amount.toFixed(2)}`);
  });

  return doc;
}

module.exports = { buildMonthlyReport, generateCsv, generatePdf };
