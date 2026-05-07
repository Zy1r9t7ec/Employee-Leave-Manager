// backend/routes/leaveRoutes.js

const express = require('express');
const router = express.Router();
const { submitLeaveRequest, getPendingRequests, approveLeave, rejectLeave } = require('../controllers/leaveController');

// POST /api/leaves - Submission Phase
router.post('/leaves', submitLeaveRequest);

// GET /api/leaves/pending - Manager Phase
router.get('/leaves/pending', getPendingRequests);

// PATCH /api/leaves/:id/approve - Approval Phase
router.patch('/leaves/:id/approve', approveLeave);

// PATCH /api/leaves/:id/reject - Rejection Phase
router.patch('/leaves/:id/reject', rejectLeave);

module.exports = router;
