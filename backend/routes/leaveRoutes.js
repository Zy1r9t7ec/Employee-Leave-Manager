const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitLeaveRequest, getPendingRequests, approveLeave, rejectLeave, getMyHistory } = require('../controllers/leaveController');

// Employee routes
router.post('/leaves', protect, submitLeaveRequest);
router.get('/leaves/my-history', protect, getMyHistory);

// Manager routes
router.get('/leaves/pending', protect, getPendingRequests);
router.patch('/leaves/:id/approve', protect, approveLeave);
router.patch('/leaves/:id/reject', protect, rejectLeave);

module.exports = router;
