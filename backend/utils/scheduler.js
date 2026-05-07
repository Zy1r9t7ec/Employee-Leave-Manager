const cron = require('node-cron');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const BalanceAdjustmentLog = require('../models/BalanceAdjustmentLog');

// Maximum carryover limit (e.g., max 5 days can be carried to next year)
const MAX_CARRYOVER_DAYS = 5;

// Run on January 1st at 00:00 every year
cron.schedule('0 0 1 1 *', async () => {
  console.log('Running annual leave balance reset scheduler...');
  
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Process all employees
    const allEmployees = await User.find({ role: 'employee' });
    
    for (const employee of allEmployees) {
      // Find if they already have a balance for this year
      let currentBalance = await LeaveBalance.findOne({
        employeeId: employee._id,
        year: currentYear
      });
      
      // Get previous year's balance for carryover calculations
      const prevBalance = await LeaveBalance.findOne({
        employeeId: employee._id,
        year: previousYear
      });

      let carryoverDays = 0;
      if (prevBalance) {
        const unusedAnnual = prevBalance.annual.total - prevBalance.annual.used;
        carryoverDays = Math.min(unusedAnnual, MAX_CARRYOVER_DAYS);
      }

      if (!currentBalance) {
        // Create new balance for current year
        const newBalance = new LeaveBalance({
          employeeId: employee._id,
          year: currentYear,
          annual: { total: 20 + carryoverDays, used: 0 },
          sick: { total: 10, used: 0 },
          unpaid: { used: 0 }
        });
        await newBalance.save();

        if (carryoverDays > 0) {
          // Log the carryover adjustment
          await BalanceAdjustmentLog.create({
            employeeId: employee._id,
            year: currentYear,
            action: 'carryover',
            leaveType: 'annual',
            previousBalance: 20,
            newBalance: 20 + carryoverDays,
            durationDays: carryoverDays,
            reason: `Annual carryover from ${previousYear}`
          });
        }
      }
    }
    
    console.log(`Successfully completed annual leave balance reset for year ${currentYear}`);
  } catch (error) {
    console.error('Error during annual leave balance reset:', error);
  }
});
