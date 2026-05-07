const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { generateReport, getAllLeaves } = require('../controllers/adminController');

router.get('/admin/report', protect, restrictTo('admin'), generateReport);
router.get('/admin/leaves', protect, restrictTo('admin'), getAllLeaves);

module.exports = router;
