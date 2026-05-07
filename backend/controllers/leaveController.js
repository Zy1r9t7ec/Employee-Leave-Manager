// backend/controllers/leaveController.js

const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const BalanceAdjustmentLog = require('../models/BalanceAdjustmentLog');
const calculateWorkingDays = require('../utils/calculateDays');
const { sendEmail } = require('../utils/sendEmail');
const { leaveApprovedEmail, leaveRejectedEmail, leaveSubmittedConfirmation } = require('../utils/emailTemplates');

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

    // 4️⃣ Send Confirmation Email
    const employee = await User.findById(employeeId);
    if (employee && employee.email) {
      const emailContent = leaveSubmittedConfirmation(employee, leave);
      await sendEmail(employee.email, emailContent.subject, emailContent.html);
    }

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/leaves/pending
 * Retrieve all pending leave requests for the manager.
 */
exports.getPendingRequests = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ status: 'Pending' }).populate('employeeId', 'name email department');
    res.json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/leaves/:id/approve
 * Approve a leave request and deduct the balance.
 */
exports.approveLeave = async (req, res, next) => {
  try {
    const leaveId = req.params.id;
    const { comment } = req.body;
    const managerId = req.user.id; // Manager's ID from auth token

    const leave = await LeaveRequest.findById(leaveId).populate('employeeId', 'name email');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });
    if (leave.status !== 'Pending') return res.status(400).json({ success: false, message: 'Request is already processed.' });

    const currentYear = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId._id, year: currentYear });
    
    if (!balance) return res.status(400).json({ success: false, message: 'Balance record not found.' });

    // Validate balance once more before deducting
    let remaining;
    if (leave.leaveType === 'annual') remaining = balance.annual.total - balance.annual.used;
    else if (leave.leaveType === 'sick') remaining = balance.sick.total - balance.sick.used;
    else remaining = Infinity;

    if (leave.durationDays > remaining) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to approve this request.' });
    }

    // Deduct
    const prevBalance = leave.leaveType === 'annual' ? balance.annual.used : (leave.leaveType === 'sick' ? balance.sick.used : balance.unpaid.used);
    
    if (leave.leaveType === 'annual') balance.annual.used += leave.durationDays;
    else if (leave.leaveType === 'sick') balance.sick.used += leave.durationDays;
    else if (leave.leaveType === 'unpaid') balance.unpaid.used += leave.durationDays;

    await balance.save();

    // Log adjustment
    await BalanceAdjustmentLog.create({
      employeeId: leave.employeeId._id,
      year: currentYear,
      action: 'approved',
      leaveType: leave.leaveType,
      previousBalance: prevBalance,
      newBalance: prevBalance + leave.durationDays,
      durationDays: leave.durationDays,
      actionBy: managerId,
      reason: 'Leave Approved'
    });

    // Update status
    leave.status = 'Approved';
    leave.managerComment = comment || '';
    leave.reviewedBy = managerId;
    leave.reviewedAt = new Date();
    await leave.save();

    // Send email
    if (leave.employeeId.email) {
      const emailContent = leaveApprovedEmail(leave.employeeId, leave, comment);
      await sendEmail(leave.employeeId.email, emailContent.subject, emailContent.html);
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/leaves/:id/reject
 * Reject a leave request. Balances remain untouched.
 */
exports.rejectLeave = async (req, res, next) => {
  try {
    const leaveId = req.params.id;
    const { comment } = req.body;
    const managerId = req.user.id;

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Rejection comment is required.' });
    }

    const leave = await LeaveRequest.findById(leaveId).populate('employeeId', 'name email');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });
    if (leave.status !== 'Pending') return res.status(400).json({ success: false, message: 'Request is already processed.' });

    // Update status
    leave.status = 'Rejected';
    leave.managerComment = comment;
    leave.reviewedBy = managerId;
    leave.reviewedAt = new Date();
    await leave.save();

    // Send email
    if (leave.employeeId.email) {
      const emailContent = leaveRejectedEmail(leave.employeeId, leave, comment);
      await sendEmail(leave.employeeId.email, emailContent.subject, emailContent.html);
    }

    res.json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};
