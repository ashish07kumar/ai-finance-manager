const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const controller = require('./reports.controller');

const router = express.Router();

router.use(authenticate);
router.get('/monthly', controller.monthly);
router.get('/export/csv', controller.exportCsv);
router.get('/export/pdf', controller.exportPdf);
router.get('/export', (req, res, next) => {
	const format = (req.query.format || 'csv').toLowerCase();
	if (format === 'pdf') return controller.exportPdf(req, res, next);
	return controller.exportCsv(req, res, next);
});

module.exports = router;
