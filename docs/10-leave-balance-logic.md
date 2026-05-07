# Leave Balance Logic

Understanding how leave balance is calculated is critical to building the approval workflow correctly.

---

## Core Balance Calculation

### Annual Leave Balance Calculation

Every employee starts the year with a fixed number of annual leave days (e.g., 20). Every time a leave request with `leaveType: "annual"` is **approved**, the `used` count increases.

```
Annual Leave Remaining = annual.total - annual.used
```

**Example:**
- Employee gets 20 annual days
- They had a 5-day vacation in January (approved): `used = 5`
- They had a 3-day trip in March (approved): `used = 8`
- Now trying to take 15 days in April: `remaining = 20 - 8 = 12` → **BLOCKED** (can't take 15 days when only 12 remain)

### Sick Leave Balance

Similar to annual leave but with a separate quota:
```
Sick Leave Remaining = sick.total - sick.used
```

### Unpaid Leave Balance

Unpaid leave has no limit:
```
Unpaid Leave Used = used (informational only, no quota enforced)
```

---

## When to Deduct From Balance

> **⚠️ CRITICAL:** Deduct from balance ONLY when the leave is **APPROVED**, not when submitted.

### State Transitions and Balance Updates

```
┌─────────────────────────────────────────────────────────────┐
│ Employee Submits Leave Request                              │
│ Status: "Pending"                                           │
│ Action: Check if BALANCE AVAILABLE (read-only check)        │
│ Balance Update: NONE                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌────────────────────┐          ┌────────────────────────┐
│ Manager Approves   │          │ Manager Rejects        │
│ Status: "Approved" │          │ Status: "Rejected"     │
│ Action: DEDUCT     │          │ Action: NO CHANGE      │
│ Balance Deducted   │          │ Balance: UNCHANGED     │
└────────────────────┘          └────────────────────────┘
        ↓                                     ↓
    Balance Updated              Balance Not Touched
    (permanent)                  (can resubmit)
```

### Detailed Example

**Scenario:** Employee with 20 annual days submits request for 5 days

1. **Submission Phase**
   - Request created with `status: "Pending"`
   - Balance CHECK: available = 20 - 0 = 20 ✅ (sufficient)
   - Balance NOT DEDUCTED
   - `LeaveBalance.annual.used` remains 0

2. **Approval Phase**
   - Manager approves request
   - Request updated: `status: "Approved"`, `reviewedAt: now`
   - Balance DEDUCTED: `LeaveBalance.annual.used` = 0 + 5 = 5
   - Employee email sent
   - Now: remaining = 20 - 5 = 15

3. **Employee Submits Another 10 Days**
   - Request created with `status: "Pending"`
   - Balance CHECK: available = 20 - 5 = 15 ✅ (sufficient)
   - Balance NOT DEDUCTED

4. **Second Request Approved**
   - `LeaveBalance.annual.used` = 5 + 10 = 15
   - Now: remaining = 20 - 15 = 5

5. **Employee Tries 10 More Days**
   - Balance CHECK: available = 20 - 15 = 5 ❌ (insufficient)
   - Request REJECTED automatically
   - Error message: "Insufficient annual leave balance"

---

## Working Days Calculation

When calculating `durationDays`, only count **working days** (Monday–Friday):

### Algorithm

```javascript
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  let current = new Date(startDate);
  
  while (current <= new Date(endDate)) {
    const day = current.getDay(); // 0=Sunday, 6=Saturday
    
    if (day !== 0 && day !== 6) { // Not weekend
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

### Example Calculation

**Request:** March 10-14, 2024

```
March 2024:
10 - Sunday    (weekend, skip)
11 - Monday    ✓ (count = 1)
12 - Tuesday   ✓ (count = 2)
13 - Wednesday ✓ (count = 3)
14 - Thursday  ✓ (count = 4)
15 - Friday    ✓ (count = 5)

Total: 5 working days
```

### Advanced: Excluding Public Holidays

If you want to exclude public holidays:

```javascript
async function calculateWorkingDays(startDate, endDate, excludePublicHolidays = true) {
  let count = 0;
  let current = new Date(startDate);
  
  // Fetch public holidays for this year
  let publicHolidays = [];
  if (excludePublicHolidays) {
    const holidays = await PublicHoliday.find({
      date: { $gte: startDate, $lte: endDate }
    });
    publicHolidays = holidays.map(h => h.date.toDateString());
  }
  
  while (current <= new Date(endDate)) {
    const day = current.getDay();
    const dateString = current.toDateString();
    
    // Skip weekends and public holidays
    if (day !== 0 && day !== 6 && !publicHolidays.includes(dateString)) {
      count++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

---

## Balance Validation Logic

### Pre-Approval Validation

Before allowing an employee to submit or saving an approved request, check:

```javascript
async function validateLeaveBalance(employeeId, leaveType, durationDays, year) {
  const balance = await LeaveBalance.findOne({ employeeId, year });
  
  if (!balance) {
    throw new Error('Balance record not found for employee');
  }
  
  if (leaveType === 'annual') {
    const remaining = balance.annual.total - balance.annual.used;
    if (durationDays > remaining) {
      throw new Error(
        `Insufficient annual leave. Available: ${remaining} days, Requested: ${durationDays} days`
      );
    }
  } else if (leaveType === 'sick') {
    const remaining = balance.sick.total - balance.sick.used;
    if (durationDays > remaining) {
      throw new Error(
        `Insufficient sick leave. Available: ${remaining} days, Requested: ${durationDays} days`
      );
    }
  }
  
  return true; // Validation passed
}
```

### Backend Validation (in controller)

```javascript
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate } = req.body;
    const employeeId = req.user.id;
    const year = new Date().getFullYear();
    
    // Calculate duration
    const durationDays = calculateWorkingDays(startDate, endDate);
    
    // Validate balance
    await validateLeaveBalance(employeeId, leaveType, durationDays, year);
    
    // Create and save request
    const leave = new LeaveRequest({
      employeeId,
      leaveType,
      startDate,
      endDate,
      durationDays,
      reason: req.body.reason,
      status: 'Pending'
    });
    
    await leave.save();
    
    res.status(201).json({ success: true, data: leave });
    
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    
    // Double-check balance at approval time (in case other requests were approved)
    await validateLeaveBalance(leave.employeeId, leave.leaveType, leave.durationDays, new Date().getFullYear());
    
    // Update leave
    leave.status = 'Approved';
    leave.reviewedBy = req.user.id;
    leave.managerComment = req.body.comment || '';
    leave.reviewedAt = new Date();
    await leave.save();
    
    // Update balance
    const balance = await LeaveBalance.findOne({
      employeeId: leave.employeeId,
      year: new Date().getFullYear()
    });
    
    if (leave.leaveType === 'annual') {
      balance.annual.used += leave.durationDays;
    } else if (leave.leaveType === 'sick') {
      balance.sick.used += leave.durationDays;
    } else if (leave.leaveType === 'unpaid') {
      balance.unpaid.used += leave.durationDays;
    }
    
    await balance.save();
    
    // Send email...
    
    res.json({ success: true, data: leave });
    
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

---

## Annual Reset Logic

At the start of each year, reset all employee balances:

### Option 1: Automatic Scheduled Task

```javascript
// In a separate scheduler file (e.g., using node-cron)
const cron = require('node-cron');
const LeaveBalance = require('./models/LeaveBalance');
const User = require('./models/User');

// Run on January 1st at 00:00
cron.schedule('0 0 1 1 *', async () => {
  console.log('Running annual leave balance reset...');
  
  try {
    const currentYear = new Date().getFullYear();
    const allEmployees = await User.find({ role: 'employee' });
    
    for (const employee of allEmployees) {
      const balance = await LeaveBalance.findOne({
        employeeId: employee._id,
        year: currentYear
      });
      
      if (!balance) {
        // Create new balance for current year
        const newBalance = new LeaveBalance({
          employeeId: employee._id,
          year: currentYear,
          annual: { total: 20, used: 0 },
          sick: { total: 10, used: 0 },
          unpaid: { used: 0 }
        });
        await newBalance.save();
      }
    }
    
    console.log('Balance reset completed');
  } catch (error) {
    console.error('Error resetting balances:', error);
  }
});
```

### Option 2: Manual HR Admin Action

Provide an API endpoint for HR to trigger reset:

```javascript
exports.resetAnnualBalances = async (req, res) => {
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
        await existingBalance.save();
      } else {
        const newBalance = new LeaveBalance({
          employeeId: employee._id,
          year: year,
          annual: { total: 20, used: 0 },
          sick: { total: 10, used: 0 },
          unpaid: { used: 0 }
        });
        await newBalance.save();
      }
    }
    
    res.json({ success: true, message: 'All balances reset for ' + year });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Carryover and Adjustments

Some companies allow unused leave to carry over to the next year:

```javascript
// HR Admin adjusts balance (e.g., adding carryover)
exports.adjustBalance = async (req, res) => {
  try {
    const { employeeId, adjustmentType, value, reason } = req.body;
    
    const balance = await LeaveBalance.findOne({
      employeeId,
      year: new Date().getFullYear()
    });
    
    if (adjustmentType === 'add_annual') {
      balance.annual.total += value;
    } else if (adjustmentType === 'deduct_annual') {
      balance.annual.used += value;
    } else if (adjustmentType === 'add_sick') {
      balance.sick.total += value;
    }
    
    // Optional: Log adjustment for audit
    await BalanceAdjustmentLog.create({
      employeeId,
      adjustmentType,
      value,
      reason,
      adjustedBy: req.user.id,
      adjustedAt: new Date()
    });
    
    await balance.save();
    
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Balance History

To maintain audit trail:

```javascript
// balanceSchema with history tracking
const balanceHistorySchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User' },
  year: Number,
  action: String, // 'submitted', 'approved', 'rejected', 'adjusted'
  leaveType: String,
  previousBalance: Number,
  newBalance: Number,
  durationDays: Number,
  actionBy: { type: Schema.Types.ObjectId, ref: 'User' },
  actionAt: { type: Date, default: Date.now },
  reason: String
});
```

---

## Frontend Balance Display

Display remaining balance clearly to employees:

```javascript
// Calculate and display remaining balance
const getRemainingBalance = (balance, leaveType) => {
  if (leaveType === 'annual') {
    return balance.annual.total - balance.annual.used;
  } else if (leaveType === 'sick') {
    return balance.sick.total - balance.sick.used;
  }
  return 0;
};

// Component
function BalanceCard({ balance }) {
  return (
    <div>
      <h3>Annual Leave</h3>
      <p>{getRemainingBalance(balance, 'annual')} / {balance.annual.total} days remaining</p>
      <ProgressBar value={getRemainingBalance(balance, 'annual')} max={balance.annual.total} />
      
      <h3>Sick Leave</h3>
      <p>{getRemainingBalance(balance, 'sick')} / {balance.sick.total} days remaining</p>
      <ProgressBar value={getRemainingBalance(balance, 'sick')} max={balance.sick.total} />
    </div>
  );
}
```

