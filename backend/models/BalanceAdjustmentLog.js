const mongoose = require('mongoose');

const balanceAdjustmentLogSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  leaveType: {
    type: String
  },
  previousBalance: Number,
  newBalance: Number,
  durationDays: Number,
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionAt: {
    type: Date,
    default: Date.now
  },
  reason: String
});

module.exports = mongoose.model('BalanceAdjustmentLog', balanceAdjustmentLogSchema);
