const express = require('express');
const router = express.Router();
const { submitLeaveRequest } = require('../controllers/leaveController');

// POST /api/leaves - Submission Phase
router.post('/leaves', submitLeaveRequest);

module.exports = router;
