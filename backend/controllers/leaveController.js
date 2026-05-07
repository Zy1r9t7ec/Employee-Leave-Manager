const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const calculateWorkingDays = require('../utils/calculateDays');

/**
 * POST /api/leaves
 * Handles submission of a leave request (Submission Phase).
 * It performs a read‑only balance check and stores the request with status 'Pending'.
 */
exports.submitLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id; // assuming auth middleware sets req.user

    // 1️⃣ Calculate duration in working days
    const durationDays = calculateWorkingDays(startDate, endDate);

    // 2️⃣ Read‑only balance validation (no deduction)
    const balance = await LeaveBalance.findOne({ employeeId, year: new Date().getFullYear() });
    if (!balance) {
      return res.status(400).json({ success: false, message: 'Leave balance record not found.' });
    }
    let remaining;
    if (leaveType === 'annual') {
      remaining = balance.annual.total - balance.annual.used;
    } else if (leaveType === 'sick') {
      remaining = balance.sick.total - balance.sick.used;
    } else {
      // unpaid has no quota
      remaining = Infinity;
    }
    if (durationDays > remaining) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave. Available: ${remaining} days, Requested: ${durationDays} days`
      });
    }

    // 3️⃣ Persist the request with status Pending
    const leave = new LeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      durationDays,
      reason,
      status: 'Pending'
    });
    await leave.save();

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};
