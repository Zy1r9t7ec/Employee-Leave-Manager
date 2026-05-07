const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const BalanceAdjustmentLog = require('../models/BalanceAdjustmentLog');

/**
 * POST /api/balances/reset
 * HR Admin manually triggers the reset for all employee balances for the current year.
 */
exports.resetAnnualBalances = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const allEmployees = await User.find({ role: 'employee' });
    
    for (const employee of allEmployees) {
      const existingBalance = await LeaveBalance.findOne({
        employeeId: employee._id,
        year: year
      });
      
      if (existingBalance) {
        existingBalance.annual.used = 0;
        existingBalance.sick.used = 0;
        existingBalance.unpaid.used = 0;
        await existingBalance.save();

        await BalanceAdjustmentLog.create({
          employeeId: employee._id,
          year: year,
          action: 'reset',
          actionBy: req.user.id,
          reason: 'Manual HR Reset'
        });
      } else {
        const newBalance = new LeaveBalance({
          employeeId: employee._id,
          year: year,
          annual: { total: 20, used: 0 },
          sick: { total: 10, used: 0 },
          unpaid: { used: 0 }
        });
        await newBalance.save();

        await BalanceAdjustmentLog.create({
          employeeId: employee._id,
          year: year,
          action: 'initialization',
          actionBy: req.user.id,
          reason: 'Initial Balance Setup'
        });
      }
    }
    
    res.json({ success: true, message: `All balances reset successfully for ${year}.` });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/balances/adjust
 * HR Admin adjusts a specific employee's balance (e.g. adding carryover or deducting).
 */
exports.adjustBalance = async (req, res, next) => {
  try {
    const { employeeId, leaveType, adjustmentType, value, reason } = req.body;
    
    const year = new Date().getFullYear();
    const balance = await LeaveBalance.findOne({ employeeId, year });
    
    if (!balance) return res.status(404).json({ success: false, message: 'Balance record not found.' });

    let prevValue = 0;
    let newValue = 0;

    if (leaveType === 'annual') {
      if (adjustmentType === 'add') {
        prevValue = balance.annual.total;
        balance.annual.total += value;
        newValue = balance.annual.total;
      } else if (adjustmentType === 'deduct') {
        prevValue = balance.annual.used;
        balance.annual.used += value;
        newValue = balance.annual.used;
      }
    } else if (leaveType === 'sick') {
      if (adjustmentType === 'add') {
        prevValue = balance.sick.total;
        balance.sick.total += value;
        newValue = balance.sick.total;
      }
    }
    
    await balance.save();

    await BalanceAdjustmentLog.create({
      employeeId,
      year,
      action: 'adjusted',
      leaveType,
      previousBalance: prevValue,
      newBalance: newValue,
      durationDays: value,
      reason,
      actionBy: req.user.id
    });
    
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/balances/my-balance
 * Returns the leave balance for the currently authenticated user.
 */
exports.getMyBalance = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const employeeId = req.user.id;
    
    const balance = await LeaveBalance.findOne({ employeeId, year });
    if (!balance) {
      return res.status(404).json({ success: false, message: 'Balance record not found.' });
    }
    
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
};
