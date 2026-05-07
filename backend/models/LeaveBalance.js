const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  annual: {
    total: {
      type: Number,
      default: 20
    },
    used: {
      type: Number,
      default: 0
    }
  },
  sick: {
    total: {
      type: Number,
      default: 10
    },
    used: {
      type: Number,
      default: 0
    }
  },
  unpaid: {
    used: {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
