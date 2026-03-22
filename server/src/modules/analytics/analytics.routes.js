const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const controller = require('./analytics.controller');

const router = express.Router();

router.use(authenticate);
router.get('/summary', controller.summary);
router.get('/category', controller.category);
router.get('/monthly', controller.monthly);
router.get('/trends', controller.trends);
router.get('/advanced', controller.advanced);
router.get('/insights', controller.insights);
router.get('/financial-health', controller.financialHealth);
router.get('/accounts', controller.accounts);

module.exports = router;
