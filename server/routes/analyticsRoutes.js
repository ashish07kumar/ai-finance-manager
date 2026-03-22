const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getTrends
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.get('/summary', protect, getSummary);
router.get('/category', protect, getCategoryAnalytics);
router.get('/monthly', protect, getMonthlyAnalytics);
router.get('/trends', protect, getTrends);

module.exports = router;
