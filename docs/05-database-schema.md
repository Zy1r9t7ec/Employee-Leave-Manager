# Database Schema Design

A "schema" is the blueprint for how data is structured in your database. Even though MongoDB is "schemaless" (meaning it doesn't enforce structure), we use Mongoose to define schemas in code so that our application has consistent data.

---

## Collection 1: Users

Stores every user (employee, manager, HR admin) in the system.

```
users
├── _id          (ObjectId — auto-generated unique ID by MongoDB)
├── name         (String — full name, e.g. "John Smith")
├── email        (String — unique, used for login and email notifications)
├── password     (String — hashed using bcrypt, NEVER store plain text)
├── role         (String — "employee" | "manager" | "admin")
├── department   (String — e.g. "Engineering", "Marketing")
├── managerId    (ObjectId — references Users._id of their direct manager)
├── joinDate     (Date — when the employee joined the company)
└── createdAt    (Date — when the account was created)
```

### Mongoose Schema Example
```javascript
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  department: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'User' },
  joinDate: Date,
  createdAt: { type: Date, default: Date.now }
});
```

---

## Collection 2: LeaveRequests

Every leave request submitted by any employee.

```
leaverequests
├── _id            (ObjectId — unique ID for this request)
├── employeeId     (ObjectId — references Users._id)
├── leaveType      (String — "annual" | "sick" | "unpaid")
├── startDate      (Date)
├── endDate        (Date)
├── durationDays   (Number — calculated: endDate - startDate + 1, excluding weekends)
├── reason         (String — optional, employee's note)
├── status         (String — "Pending" | "Approved" | "Rejected")
├── managerComment (String — manager's note when approving/rejecting, optional)
├── reviewedBy     (ObjectId — references Users._id of the manager who acted on it)
├── submittedAt    (Date — auto-set to now when request is created)
└── reviewedAt     (Date — set when manager approves/rejects)
```

### Mongoose Schema Example
```javascript
const leaveRequestSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['annual', 'sick', 'unpaid'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  reason: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  managerComment: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});
```

---

## Collection 3: LeaveBalances

Tracks how many leave days each employee has used vs. their annual quota.

```
leavebalances
├── _id            (ObjectId)
├── employeeId     (ObjectId — references Users._id)
├── year           (Number — e.g. 2024, because balances reset each year)
├── annual
│   ├── total      (Number — total annual leave days this employee gets, e.g. 20)
│   └── used       (Number — how many annual days have been approved so far)
├── sick
│   ├── total      (Number — e.g. 10)
│   └── used       (Number)
└── unpaid
    └── used       (Number — no "total" for unpaid, it's unlimited)
```

### Mongoose Schema Example
```javascript
const leaveBalanceSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  year: { type: Number, required: true },
  annual: {
    total: { type: Number, default: 20 },
    used: { type: Number, default: 0 }
  },
  sick: {
    total: { type: Number, default: 10 },
    used: { type: Number, default: 0 }
  },
  unpaid: {
    used: { type: Number, default: 0 }
  }
});
```

**Derived field (calculated, not stored):**
```javascript
// In your code, calculate:
const remaining = {
  annual: balance.annual.total - balance.annual.used,
  sick: balance.sick.total - balance.sick.used
};
```

---

## Collection 4: LeaveTypes (Optional — Config Collection)

If HR admins need to manage leave types dynamically (add new types, change quotas), this collection stores those configs.

```
leavetypes
├── _id          (ObjectId)
├── name         (String — "Annual Leave", "Sick Leave", "Unpaid Leave")
├── code         (String — "annual", "sick", "unpaid")
├── defaultDays  (Number — default quota per employee per year)
├── isPaid       (Boolean — true for annual/sick, false for unpaid)
└── isActive     (Boolean — HR can deactivate a leave type)
```

### Mongoose Schema Example
```javascript
const leaveTypeSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  defaultDays: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
});
```

---

## Data Relationships

### User → LeaveRequest (One-to-Many)
- One user can have many leave requests
- Referenced via `leaveRequest.employeeId` pointing to `user._id`

### User → LeaveBalance (One-to-One)
- One employee has one leave balance per year
- Referenced via `leaveBalance.employeeId` pointing to `user._id`

### LeaveRequest → User (Reviews) (Many-to-One)
- Many leave requests can be reviewed by one manager
- Referenced via `leaveRequest.reviewedBy` pointing to `user._id`

---

## Database Indexing Recommendations

For performance, add indexes to frequently queried fields:

```javascript
// In your models:
leaveRequestSchema.index({ employeeId: 1, status: 1 }); // Find pending leaves for an employee
leaveRequestSchema.index({ startDate: 1, endDate: 1 }); // Calendar queries
leaveRequestSchema.index({ status: 1 }); // Find all pending requests
userSchema.index({ email: 1 }); // Login queries
leaveBalanceSchema.index({ employeeId: 1, year: 1 }); // Find balance for employee in a year
```

---

## Initial Data Setup

When setting up the system for the first time, seed MongoDB with:

1. **Leave Types** (annual, sick, unpaid)
2. **Users** (employee, manager, admin test accounts)
3. **Leave Balances** (for each employee, initialize for current year)

Example seed script location: `backend/seeds/seedDatabase.js`

