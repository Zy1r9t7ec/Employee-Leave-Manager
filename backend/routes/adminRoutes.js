const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/adminController');

// GET /api/admin/report - HR Admin Phase
router.get('/admin/report', generateReport);

module.exports = router;
