# Development Workflow

This section covers how to develop the project day-to-day, the recommended build order, and debugging strategies.

---

## Day-to-Day Development Setup

### Morning Startup Checklist

Every time you start developing, follow this order:

```bash
# Terminal 1 - Backend
cd employee-leave-management/backend
npm run dev
# Watch for: "Server running on port 5000" + "MongoDB connected"

# Terminal 2 - Frontend
cd employee-leave-management/frontend
npm start
# Watch for: Browser opens at http://localhost:3000

# Terminal 3 - Check Optional Services
# Tomcat (for reports - not always needed for initial dev)
/usr/local/tomcat/bin/startup.sh

# Check Mailtrap inbox at mailtrap.io (for email testing)
```

### Editor Setup

**VS Code Extensions to Install:**
- ESLint - Real-time code quality
- Prettier - Auto-format on save
- Thunder Client - API testing (alternative to Postman)
- MongoDB for VS Code - Browse MongoDB collections
- Postman - API testing and documentation

### Keep Two Windows Side-by-Side

```
┌─────────────────────┬─────────────────────┐
│   Backend Code      │   React Component   │
│   (VS Code)         │   (VS Code)         │
│   + Terminal        │   + Browser DevTools│
└─────────────────────┴─────────────────────┘
```

---

## Recommended Build Order

Build the project in this specific sequence for the smoothest experience. Each week can be tackled in a day or two depending on your speed.

### Week 1 — Backend Foundation

**Goal:** Get all APIs working and testable before touching React.

#### Day 1: Setup & Authentication
- [ ] Initialize Node project and install dependencies
- [ ] Create MongoDB connection in `config/db.js`
- [ ] Create User model
- [ ] Build auth routes: POST `/api/auth/login`, POST `/api/auth/register`
- [ ] Implement JWT token generation
- [ ] Test with Postman: Login and receive token

#### Day 2: Leave Requests CRUD
- [ ] Create LeaveRequest model
- [ ] Create LeaveBalance model
- [ ] Build leave routes: POST, GET, GET/:id
- [ ] Build balance routes: GET, GET/:id
- [ ] Write working day calculation utility
- [ ] Test all routes with sample data

#### Day 3: Approval Logic
- [ ] Add PATCH `/api/leaves/:id/approve` route
- [ ] Add PATCH `/api/leaves/:id/reject` route
- [ ] Implement balance deduction on approval
- [ ] Test balance changes after approval
- [ ] Verify rejected requests don't deduct balance

---

### Week 2 — Email & Approval Workflow

**Goal:** Complete the end-to-end workflow with notifications.

#### Day 1: Email Setup
- [ ] Sign up for Mailtrap
- [ ] Create `utils/sendEmail.js` with Nodemailer config
- [ ] Create `utils/emailTemplates.js` with email templates
- [ ] Build template functions for all scenarios:
  - Submission confirmation
  - Approval notification
  - Rejection notification
- [ ] Test sending emails manually

#### Day 2: Wire Emails to Approval
- [ ] Trigger emails when leave is submitted
- [ ] Trigger emails when leave is approved
- [ ] Trigger emails when leave is rejected
- [ ] Test complete workflow end-to-end:
  1. Submit leave
  2. Check email in Mailtrap
  3. Approve leave
  4. Check approval email

#### Day 3: Manager Team Logic
- [ ] Create `restrictToOwnTeam` middleware
- [ ] Ensure managers can only approve their team's requests
- [ ] Implement HR Admin can approve anyone
- [ ] Test role-based access control

---

### Week 3 — React Frontend

**Goal:** Build the UI that connects to the backend.

#### Day 1: Setup & Login
- [ ] Create React project structure
- [ ] Build Login page component
- [ ] Create AuthContext for global auth state
- [ ] Test login and token storage
- [ ] Create ProtectedRoute component

#### Day 2: Employee Dashboard
- [ ] Build EmployeeDashboard page
- [ ] Display leave balance cards
- [ ] Build LeaveRequestForm component with modal
- [ ] Build MyLeaveHistory table
- [ ] Connect form to POST `/api/leaves`
- [ ] Show success/error messages

#### Day 3: Manager Dashboard
- [ ] Build ManagerDashboard page
- [ ] Build PendingRequestsTable component
- [ ] Show pending requests with approve/reject buttons
- [ ] Build ApprovalModal and RejectionModal
- [ ] Connect buttons to PATCH endpoints
- [ ] Test complete approval workflow

---

### Week 4 — Admin Panel & Reports

**Goal:** Complete advanced features for HR admins.

#### Day 1: HR Admin Dashboard
- [ ] Build AdminPanel page with tabs
- [ ] Build Company Leave Calendar component
- [ ] Build Leave Balance table with edit functionality
- [ ] Implement balance adjustment modal
- [ ] Test manual balance adjustments

#### Day 2: Report Generation
- [ ] Build ReportGenerator component
- [ ] Create backend report endpoint: GET `/api/admin/report`
- [ ] Verify Tomcat is running and JSP is accessible
- [ ] Test report data passing to JSP

#### Day 3: JSP Reports
- [ ] Update JSP with actual data rendering
- [ ] Test report generation end-to-end
- [ ] Add print and download functionality
- [ ] Test with different months/years

---

## Testing Your API with Thunder Client

**Why Thunder Client?** It's free, works in VS Code, and saves requests locally.

### Setup

1. Install Thunder Client extension in VS Code
2. Create a collection: `Employee Leave API`
3. Create requests:

```
REQUEST 1: POST /api/auth/login
Method: POST
URL: http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "john@company.com",
  "password": "password123"
}

SAVE THE TOKEN for next requests
```

```
REQUEST 2: GET /api/leaves/my
Method: GET
URL: http://localhost:5000/api/leaves/my
Headers:
  Authorization: Bearer <token_from_login>
```

```
REQUEST 3: POST /api/leaves
Method: POST
URL: http://localhost:5000/api/leaves
Headers:
  Authorization: Bearer <token_from_login>
Body (JSON):
{
  "leaveType": "annual",
  "startDate": "2024-03-10",
  "endDate": "2024-03-14",
  "reason": "Vacation"
}
```

---

## Debugging Tips for Beginners

### Issue: Backend won't start

**Problem:** Error in server.js or .env variables

**Solution:**
```bash
# 1. Check the error message carefully
npm run dev

# 2. Verify .env file exists and has MONGO_URI
ls -la .env

# 3. Check MongoDB is running
brew services list | grep mongodb

# 4. Check port 5000 is free
lsof -i :5000
```

### Issue: React can't reach backend

**Problem:** CORS error or wrong backend URL

**Solution:**
```javascript
// Check in browser DevTools Console (F12):
// Look for: "Access to XMLHttpRequest blocked by CORS"

// Fix: In backend/server.js, ensure CORS is enabled:
const cors = require('cors');
app.use(cors());

// Or restrict to frontend:
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Issue: JWT token not working

**Problem:** "Not authenticated" error despite having token

**Solution:**
```bash
# 1. Check token is being sent in header
# In Thunder Client, check Headers tab shows:
# Authorization: Bearer <token>

# 2. In backend, verify middleware is correct:
const token = req.headers.authorization?.split(' ')[1];
console.log('Token:', token);

# 3. Check JWT_SECRET in .env matches what was used to create token
```

### Issue: Email not sending

**Problem:** Nodemailer error or Mailtrap credentials wrong

**Solution:**
```bash
# 1. Check Mailtrap credentials in .env
# MAIL_HOST=sandbox.smtp.mailtrap.io
# MAIL_USER=your_username
# MAIL_PASS=your_password

# 2. Go to Mailtrap.io and verify inbox is created

# 3. In backend, test email directly:
# Create test route and visit http://localhost:5000/test-email

# 4. Check Mailtrap inbox for test email

# 5. Look at backend terminal for error messages
```

### Issue: Balance not deducting after approval

**Problem:** Logic error in approval controller

**Solution:**
```javascript
// Verify this happens in approveLeave controller:

// 1. Get the leave request
const leave = await LeaveRequest.findById(req.params.id);

// 2. Get the balance
const balance = await LeaveBalance.findOne({
  employeeId: leave.employeeId,
  year: new Date().getFullYear()
});

// 3. Deduct BEFORE saving leave
if (leave.leaveType === 'annual') {
  balance.annual.used += leave.durationDays;  // <- This line is critical
}

// 4. Save balance
await balance.save();

// 5. THEN update leave
leave.status = 'Approved';
await leave.save();
```

### Issue: Calendar not showing leaves

**Problem:** React component not fetching data or filtering wrong

**Solution:**
```javascript
// 1. Check backend returns correct data
// In Thunder Client, test: GET /api/admin/calendar

// 2. Check React is calling the endpoint
// In React DevTools Console:
// Add console.log in useEffect

// 3. Check data structure matches calendar component expectations
// Component expects: { startDate, endDate, employeeName, leaveType, ... }
```

---

## Git Workflow

### Commit After Each Feature

```bash
# After completing a feature:
git add .
git commit -m "Add leave submission form to employee dashboard"

# Good commit messages are descriptive and start with action:
# ✅ "Add leave submission form"
# ✅ "Fix balance not deducting on approval"
# ✅ "Connect email notifications to approval workflow"
# ❌ "fixed stuff"
# ❌ "changes"
```

### Create `.gitignore`

```
# Root .gitignore
backend/.env
frontend/.env
backend/node_modules/
frontend/node_modules/
*.log
.DS_Store
```

### Never Commit Sensitive Data

```bash
# NEVER commit:
.env files
node_modules/
API keys
passwords
tokens
```

---

## Common Development Tasks

### Reset Database

```bash
# Delete all data and start fresh
mongosh
> use leavedb
> db.dropDatabase()
> exit
```

### Create Test Data

Create `backend/seeds/seedDatabase.js`:

```javascript
const { User, LeaveType } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  // Create leave types
  await LeaveType.insertMany([
    { name: 'Annual Leave', code: 'annual', defaultDays: 20 },
    { name: 'Sick Leave', code: 'sick', defaultDays: 10 }
  ]);

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.insertMany([
    {
      name: 'John Employee',
      email: 'john@company.com',
      password: hashedPassword,
      role: 'employee',
      department: 'Engineering'
    },
    {
      name: 'Manager Smith',
      email: 'smith@company.com',
      password: hashedPassword,
      role: 'manager',
      department: 'Engineering'
    },
    {
      name: 'HR Admin',
      email: 'hr@company.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Human Resources'
    }
  ]);

  console.log('Database seeded');
};

seedDatabase();
```

Run: `node backend/seeds/seedDatabase.js`

### Switch User in Browser

```javascript
// In browser console (F12):
localStorage.setItem('token', 'new_token_here');
localStorage.setItem('user', JSON.stringify({
  id: 'user_id',
  role: 'admin',
  email: 'admin@company.com',
  name: 'Admin User'
}));
location.reload();
```

---

## Performance Monitoring

### Check API Response Time

In Thunder Client, after each request:
- Response time shown at top
- If > 500ms, optimize your query

### Monitor Database Performance

```bash
# Connect to MongoDB and check indexes
mongosh
> use leavedb
> db.leaverequests.getIndexes()

# Create index if needed:
> db.leaverequests.createIndex({ status: 1 })
```

---

## Code Quality

### ESLint & Prettier Setup

**Backend:**
```bash
npm install --save-dev eslint prettier eslint-config-prettier
npx eslint --init
```

**Frontend:**
Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

### Run Before Committing

```bash
# Backend
npx eslint . --fix

# Frontend
npx prettier --write src/
```

