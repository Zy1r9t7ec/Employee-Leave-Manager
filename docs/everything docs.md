# Employee Leave Management System — Complete Developer Documentation

> **Project:** Employee Leave Management System (Project 11)
> **Difficulty:** Intermediate
> **Stack:** MongoDB · Express.js · React JS · Node.js · JSP
> **Audience:** Junior Developers

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Feature Set Documentation](#3-feature-set-documentation)
4. [Tech Stack Documentation](#4-tech-stack-documentation)
5. [Database Schema Design](#5-database-schema-design)
6. [API Endpoint Reference](#6-api-endpoint-reference)
7. [Frontend Component Breakdown](#7-frontend-component-breakdown)
8. [Email Notification System](#8-email-notification-system)
9. [JSP Report Module](#9-jsp-report-module)
10. [Leave Balance Logic](#10-leave-balance-logic)
11. [User Roles & Permissions](#11-user-roles--permissions)
12. [Application Flow Diagrams](#12-application-flow-diagrams)
13. [Project Folder Structure](#13-project-folder-structure)
14. [Environment Setup Guide](#14-environment-setup-guide)
15. [Development Workflow](#15-development-workflow)
16. [Glossary](#16-glossary)

---

## 1. Project Overview

### What Is This Application?

The **Employee Leave Management System** is a full-stack HR (Human Resources) web application that replaces manual leave tracking with an automated, role-based digital workflow.

Think of it as the digital version of filling out a paper leave request form and walking it to your manager. Except here, everything happens online — from submitting the request, to the manager approving it, to HR seeing it on a calendar, and the system automatically sending you an email at every step.

### Why Does It Exist?

In most companies, managing employee leaves is a painful manual process:
- Employees email managers, who forget to reply
- HR has no single view of who is absent on which days
- Leave balances are tracked in error-prone spreadsheets
- Reports for payroll or compliance are generated manually

This app solves all of that.

### Who Uses It?

There are three types of users (called "roles") in this system:

| Role | Who They Are | What They Can Do |
|---|---|---|
| **Employee** | Any staff member | Submit leave requests, view own history, check leave balance |
| **Manager** | Team lead / supervisor | Approve or reject leave requests for their team, add comments |
| **HR Admin** | HR department staff | Full company view, manage leave types, generate monthly reports |

---

## 2. System Architecture

### The Big Picture

This project uses a **3-tier architecture** — a very standard pattern in web development:

```
[ Browser (React JS) ]
        ↕  HTTP Requests (JSON)
[ Backend Server (Node.js + Express.js) ]
        ↕  Database Queries
[ Database (MongoDB) ]
```

Plus two additional "layers" for specific purposes:

- **Nodemailer** (runs inside Node.js) → sends emails to users when leave status changes
- **JSP** (Java Server Pages) → renders the monthly HR reports as server-side HTML pages

### What Does "MERN Stack" Mean?

You will often hear the term **MERN stack** in web development circles. This project is a modified MERN stack:

- **M**ongoDB — Database
- **E**xpress.js — Backend framework
- **R**eact.js — Frontend UI
- **N**ode.js — Runtime (JavaScript engine for the backend)

The "modification" is the addition of **JSP** (a Java technology) for the reporting module, which is an intentional design choice for server-side rendered HTML reports.

### How the Parts Talk to Each Other

```
User's Browser
    │
    │  Loads once (React Single Page Application)
    │
    ▼
React Frontend (port 3000 in dev)
    │
    │  REST API calls (GET, POST, PUT, PATCH)
    │  Data sent as JSON
    │
    ▼
Express.js Backend (port 5000 in dev)
    │
    ├──► MongoDB (reads/writes data)
    │
    ├──► Nodemailer (sends email on status changes)
    │
    └──► JSP Server (hands off report generation to Java layer)
```

---

## 3. Feature Set Documentation

This section explains every feature of the system in detail. Think of it as the complete "what the app can do" guide.

---

### Feature 1: Employee Self-Service Portal

**What it is:** A dashboard that every employee sees when they log in.

**What it includes:**
- A form to submit a new leave request
- A list of all past and pending leave requests with their current status
- A summary card showing remaining leave balance for each leave type (annual, sick, unpaid)
- A calendar view showing upcoming approved leaves

**How leave submission works (step-by-step):**
1. Employee clicks "New Leave Request"
2. Fills out the form: Leave Type, Start Date, End Date, Reason (optional)
3. Clicks Submit → a new request document is saved to MongoDB with status `"Pending"`
4. An email is immediately sent to the employee confirming the submission
5. The manager assigned to the employee gets a notification email
6. The request appears in the manager's dashboard

**Leave Types Available:**
- **Annual Leave** — paid vacation time (each employee has a fixed annual quota, e.g. 20 days/year)
- **Sick Leave** — paid medical absence (separate quota, e.g. 10 days/year)
- **Unpaid Leave** — time off without pay (no quota limit, but requires approval)

---

### Feature 2: Manager Approval Dashboard

**What it is:** A dedicated view that managers see, showing all pending leave requests from their team members.

**What managers can do:**
- See all pending requests sorted by date
- Click on a request to see full details (employee info, dates, leave type, reason)
- **Approve** the request → status changes to `"Approved"`
- **Reject** the request → status changes to `"Rejected"` (manager must write a comment explaining why)
- Add optional comments even when approving

**What happens after approval/rejection:**
1. The leave request document in MongoDB is updated (`status`, `managerComment`, `reviewedAt`)
2. The employee immediately receives an email:
   - If approved: "Your leave from [date] to [date] has been approved."
   - If rejected: "Your leave request was rejected. Reason: [manager comment]"
3. If approved, the employee's leave balance for that leave type is decremented
4. The leave appears on the HR company-wide calendar

---

### Feature 3: HR Admin Panel

**What it is:** The most powerful dashboard in the system, accessible only to HR Admin users.

**Sub-features of the HR Admin Panel:**

#### 3a. Company-Wide Leave Calendar
- A full-month calendar view
- Shows colored blocks for each employee's approved leave
- Different colors for different leave types
- HR can filter by department, leave type, or individual employee
- Helps HR identify when multiple people from the same team are on leave simultaneously (avoiding coverage gaps)

#### 3b. Leave Balance Tracker
- A table view showing every employee's current leave balances
- Columns: Employee Name, Annual Remaining, Sick Remaining, Unpaid Used
- HR can manually adjust balances (e.g., carry-over from last year, one-time grants)

#### 3c. Monthly Leave Utilisation Report (JSP)
- HR clicks "Generate Report" and selects a month + year
- The Express backend fetches all leave data for that period
- The data is passed to the JSP layer, which renders a formatted HTML report
- The report shows: total leave days taken per department, leave type breakdown, top leave-takers, days remaining in the company leave budget

---

### Feature 4: Email Notification System

**What it is:** Automatic email messages sent to users at every important status change.

**All email triggers:**

| Trigger | Recipient | Email Content |
|---|---|---|
| Employee submits leave | Employee | Submission confirmation with request ID and dates |
| Employee submits leave | Manager | "A new leave request from [Employee] requires your review" |
| Manager approves | Employee | Approval confirmation with leave dates |
| Manager rejects | Employee | Rejection notice with manager's comment |
| HR overrides a decision | Employee + Manager | Admin action notice |

**Technology used:** Nodemailer (an npm package for Node.js) connected to an SMTP email service (e.g., Gmail SMTP, SendGrid, or Mailtrap for development).

---

### Feature 5: JSP Report Pages

**What it is:** Monthly leave summary and HR report pages generated using Java Server Pages.

**Why JSP and not React?**
JSP is a server-side rendering technology commonly used in enterprise Java environments. For this project, JSP is used specifically for the reporting module because:
- Reports need to be easily printable as HTML pages
- JSP generates clean HTML server-side without requiring client-side JavaScript
- It's a deliberate educational component to expose you to Java-based web templates alongside the Node.js stack

**What the report shows:**
- Report header: Company name, Month, Generated date
- Table 1: Leave summary per department (department name, total employees, total leave days taken, average per employee)
- Table 2: Leave type breakdown (Annual, Sick, Unpaid — count of each)
- Table 3: Individual employee leave listing (name, type, dates, duration, status)
- Footer: HR Admin signature line

---

## 4. Tech Stack Documentation

This section explains every technology used, what it does, why it was chosen, and how you will interact with it as a developer.

---

### MongoDB — The Database

**What is it?**
MongoDB is a **NoSQL document database**. Unlike a traditional database (like MySQL) which stores data in rows and columns (like Excel), MongoDB stores data as **JSON-like documents** (called BSON internally).

**Key concept — Collections vs. Tables:**
- In SQL: `Table` → In MongoDB: `Collection`
- In SQL: `Row` → In MongoDB: `Document`
- In SQL: `Column` → In MongoDB: `Field`

**Example document (a leave request stored in MongoDB):**
```json
{
  "_id": "64f3a7b2c45e1200123abcde",
  "employeeId": "64f2b1a0c45e1200123abc11",
  "leaveType": "annual",
  "startDate": "2024-03-10",
  "endDate": "2024-03-14",
  "durationDays": 5,
  "reason": "Family vacation",
  "status": "Approved",
  "managerComment": "",
  "submittedAt": "2024-03-01T09:00:00.000Z",
  "reviewedAt": "2024-03-02T14:30:00.000Z"
}
```

**Why MongoDB for this project?**
- Leave request documents have flexible fields (some have `managerComment`, some don't) — MongoDB handles this gracefully
- JSON format matches perfectly with the JavaScript/Node.js backend
- Easy to scale without strict schema migration like SQL databases

**How you will use it:**
- You will use **Mongoose** (an npm package) to interact with MongoDB in Node.js
- Mongoose lets you define a "schema" (a blueprint) for your documents even though MongoDB doesn't require one
- You will write queries like: `LeaveRequest.find({ status: "Pending" })` to get all pending requests

---

### Express.js — The Backend Framework

**What is it?**
Express.js is a minimal, fast web framework for Node.js. It handles all the **routing** — meaning it decides which code runs when someone hits a specific URL.

**What does "routing" mean?**
When the React frontend sends a request like `GET /api/leaves/pending`, Express.js knows to run the function that fetches pending leaves from MongoDB and returns them.

**Basic structure of an Express route:**
```javascript
// When someone sends GET to /api/leaves
app.get('/api/leaves', async (req, res) => {
  const leaves = await LeaveRequest.find({ employeeId: req.user.id });
  res.json(leaves);  // sends data back as JSON
});
```

**What Express handles in this project:**
- Leave Request API (create, read, update)
- Approval workflow API (approve/reject with comments)
- Leave balance calculation API
- User authentication middleware (checks if the user is logged in and what role they have)
- Triggering Nodemailer after status changes
- Connecting to the JSP server for report generation

---

### React JS — The Frontend

**What is it?**
React is a JavaScript library for building **user interfaces** (what the user sees in the browser). It breaks the UI into reusable **components** — small, self-contained pieces of the page.

**Key concept — Components:**
Think of a component like a LEGO brick. You build complex UIs by snapping small components together. For example:
- `<LeaveRequestForm />` — the form employees use to submit requests
- `<LeaveCard />` — a single leave request card shown in lists
- `<ApprovalTable />` — the table managers use to see pending requests
- `<LeaveCalendar />` — the HR calendar view

**Key concept — State:**
React components can hold "state" — data that, when it changes, automatically updates what's displayed on screen. For example, when a manager approves a leave, the state updates and the request disappears from the "Pending" list without refreshing the page.

**Key concept — API calls from React:**
React uses `fetch()` or a library called **Axios** to call the Express.js backend:
```javascript
// Inside a React component
useEffect(() => {
  axios.get('/api/leaves')
    .then(response => setLeaves(response.data));
}, []);
```

**Pages in this project (React routes):**
- `/login` — Login page
- `/dashboard` — Employee dashboard (submit leave, view own history)
- `/manager` — Manager approval dashboard
- `/admin` — HR Admin panel with calendar, balances, report trigger
- `/profile` — User profile and settings

---

### Node.js — The Runtime

**What is it?**
Node.js is not a framework — it is the **JavaScript engine** that runs JavaScript code on your server (your computer or a cloud server), outside of the browser.

**Simple analogy:**
- Browser = the place JavaScript runs for websites
- Node.js = the place JavaScript runs on the server

**Why it matters:**
Without Node.js, JavaScript can only run in browsers. Node.js lets you write your backend server code in JavaScript — the same language as your frontend. This means you only need to know one language (JS) to build the entire app.

**What Node.js specifically powers in this project:**
- Running the Express.js server
- Running Nodemailer to send emails
- Connecting to MongoDB via Mongoose
- Handling environment variables via `dotenv`

---

### Nodemailer — Email Service (Node.js Package)

**What is it?**
Nodemailer is an npm package that lets your Node.js application send emails using an SMTP server.

**SMTP? What's that?**
SMTP (Simple Mail Transfer Protocol) is the standard protocol for sending emails. Gmail, Outlook, Yahoo — they all have SMTP servers. You connect to one of them to send email from your app.

**How it works in code:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: '"HR System" <hr@yourcompany.com>',
  to: employee.email,
  subject: 'Your leave request has been approved',
  html: '<p>Your leave from <b>March 10</b> to <b>March 14</b> has been approved.</p>',
});
```

**During development:**
Use **Mailtrap** (mailtrap.io) — a fake SMTP server that catches all your test emails without actually sending them to real inboxes. Sign up for free, get SMTP credentials, plug them into your `.env` file, and see all sent emails in the Mailtrap inbox.

---

### JSP — Java Server Pages (Reporting Layer)

**What is it?**
JSP is a technology used to create dynamic web pages using Java. It's like HTML, but with Java code embedded directly in the page using special `<% %>` tags.

**Why it's in a Node.js project:**
JSP is part of the Java EE (Enterprise Edition) ecosystem and runs on a Java web server like **Apache Tomcat**. For this project, the Node.js backend generates a report data object (JSON), passes it to a JSP endpoint, and JSP renders it as a formatted HTML page.

**Basic JSP syntax example:**
```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<body>
  <h1>Leave Report - <%= request.getParameter("month") %></h1>
  <%
    // Java code goes here
    String month = request.getParameter("month");
    out.println("<p>Report for: " + month + "</p>");
  %>
</body>
</html>
```

**For this project, your setup will be:**
- Apache Tomcat server (runs separately from Node.js)
- JSP files live in the Tomcat `webapps` directory
- The Express.js backend calls the Tomcat JSP endpoint with query parameters
- Tomcat renders and returns the HTML report page

---

## 5. Database Schema Design

A "schema" is the blueprint for how data is structured in your database. Even though MongoDB is "schemaless" (meaning it doesn't enforce structure), we use Mongoose to define schemas in code so that our application has consistent data.

---

### Collection 1: Users

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

---

### Collection 2: LeaveRequests

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

---

### Collection 3: LeaveBalances

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

**Derived field (calculated, not stored):**
`remaining = total - used` — This is calculated in code, not stored in the database, to avoid sync issues.

---

### Collection 4: LeaveTypes (Optional — Config Collection)

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

---

## 6. API Endpoint Reference

These are all the backend routes that React will call. The format is `METHOD /path — What it does`.

### Authentication Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| POST | `/api/auth/login` | All | Login with email + password. Returns a JWT token. |
| POST | `/api/auth/logout` | Logged-in users | Invalidates the session |
| GET | `/api/auth/me` | Logged-in users | Returns the currently logged-in user's profile |

---

### Leave Request Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| POST | `/api/leaves` | Employee | Submit a new leave request |
| GET | `/api/leaves/my` | Employee | Get all leave requests for the logged-in employee |
| GET | `/api/leaves/pending` | Manager | Get all pending requests for their team |
| GET | `/api/leaves/all` | HR Admin | Get all leave requests company-wide |
| GET | `/api/leaves/:id` | All | Get a single leave request by ID |
| PATCH | `/api/leaves/:id/approve` | Manager | Approve a leave request (with optional comment) |
| PATCH | `/api/leaves/:id/reject` | Manager | Reject a leave request (comment required) |
| DELETE | `/api/leaves/:id` | Employee | Cancel a pending request (cannot cancel approved ones) |

---

### Leave Balance Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| GET | `/api/balances/my` | Employee | Get own leave balance for current year |
| GET | `/api/balances/:employeeId` | HR Admin | Get a specific employee's balance |
| GET | `/api/balances` | HR Admin | Get all employees' balances |
| PATCH | `/api/balances/:employeeId` | HR Admin | Manually adjust an employee's balance |

---

### Admin / HR Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| GET | `/api/admin/calendar` | HR Admin | Get all approved leaves for calendar view |
| GET | `/api/admin/report` | HR Admin | Trigger JSP report generation (passes data to Tomcat) |
| GET | `/api/admin/users` | HR Admin | Get all users |
| POST | `/api/admin/users` | HR Admin | Create a new user account |

---

### What is a JWT Token?

When you log in, the backend sends back a **JSON Web Token (JWT)** — a string that proves who you are. Your React app stores this token and sends it in every API request via the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The Express backend checks this token before allowing access to protected routes. This is called **authentication middleware**.

---

## 7. Frontend Component Breakdown

Here is a map of every React component you will build, organized by page.

### Login Page (`/login`)

- `<LoginPage />` — Page container
  - `<LoginForm />` — Email/password form with validation
  - `<LoadingSpinner />` — Shows during login API call

### Employee Dashboard (`/dashboard`)

- `<EmployeeDashboard />` — Page container
  - `<LeaveBalanceSummary />` — Cards showing annual/sick/unpaid remaining days
  - `<NewLeaveRequestButton />` — Opens the request form
  - `<LeaveRequestModal />` — Modal overlay with the leave submission form
    - `<LeaveTypeSelector />` — Dropdown for Annual / Sick / Unpaid
    - `<DateRangePicker />` — Start date and end date pickers
    - `<ReasonInput />` — Optional text area for reason
    - `<SubmitButton />` — Submits the form
  - `<MyLeaveHistory />` — Table/list of all past requests
    - `<LeaveRequestRow />` — Single row per request (date, type, status badge)
    - `<StatusBadge />` — Colored badge: Pending (yellow) / Approved (green) / Rejected (red)

### Manager Dashboard (`/manager`)

- `<ManagerDashboard />` — Page container
  - `<PendingRequestsTable />` — Table of all pending leave requests
    - `<EmployeeLeaveRow />` — One row per pending request
      - `<ApproveButton />` — Opens approval confirmation
      - `<RejectButton />` — Opens reject form (requires comment)
  - `<ApprovalModal />` — Modal for approving (with optional comment)
  - `<RejectionModal />` — Modal for rejecting (comment required)

### HR Admin Panel (`/admin`)

- `<AdminPanel />` — Page container with tabs
  - Tab 1: `<CompanyLeaveCalendar />` — Monthly calendar
    - `<CalendarGrid />` — Grid of days
    - `<LeaveBlock />` — Colored block inside a calendar cell
    - `<CalendarFilters />` — Filter by department / leave type
  - Tab 2: `<LeaveBalanceTable />` — All employees' balances
    - `<BalanceRow />` — One row per employee
    - `<EditBalanceModal />` — HR can adjust balance values
  - Tab 3: `<ReportGenerator />` — Month/year picker + Generate button
    - `<MonthYearPicker />` — Inputs for selecting report period
    - `<GenerateReportButton />` — Calls the API and opens JSP report in new tab

### Shared / Reusable Components

- `<Navbar />` — Top navigation bar with user name, role, and logout button
- `<Sidebar />` — Navigation links (different links for each role)
- `<LoadingSpinner />` — Generic loading indicator
- `<ErrorMessage />` — Displays API error messages
- `<ConfirmDialog />` — Reusable "Are you sure?" dialog
- `<Toast />` — Small notification popup (e.g., "Leave submitted successfully!")

---

## 8. Email Notification System

### Setup (Development)

For development, you will use **Mailtrap** so that no real emails are sent:

1. Sign up at [mailtrap.io](https://mailtrap.io) (free account)
2. Go to "Email Testing" → "Inboxes" → create an inbox
3. Click on your inbox → "Show Credentials" → copy the SMTP settings
4. Add to your `.env` file:

```env
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username
MAIL_PASS=your_mailtrap_password
MAIL_FROM="HR System <hr@company.com>"
```

### Email Templates

Each email should be HTML-formatted. Create a `utils/emailTemplates.js` file:

```javascript
// Template: Leave submission confirmation
exports.leaveSubmittedEmail = (employee, leave) => ({
  subject: 'Leave Request Submitted - Pending Approval',
  html: `
    <h2>Hi ${employee.name},</h2>
    <p>Your leave request has been submitted and is pending manager approval.</p>
    <table>
      <tr><td><b>Leave Type:</b></td><td>${leave.leaveType}</td></tr>
      <tr><td><b>From:</b></td><td>${leave.startDate}</td></tr>
      <tr><td><b>To:</b></td><td>${leave.endDate}</td></tr>
      <tr><td><b>Duration:</b></td><td>${leave.durationDays} day(s)</td></tr>
    </table>
    <p>You will receive another email once your manager reviews your request.</p>
  `
});

// Template: Leave approved
exports.leaveApprovedEmail = (employee, leave) => ({
  subject: '✅ Your Leave Request Has Been Approved',
  html: `
    <h2>Great news, ${employee.name}!</h2>
    <p>Your leave request has been <b>approved</b>.</p>
    <p>Enjoy your time off from <b>${leave.startDate}</b> to <b>${leave.endDate}</b>.</p>
  `
});

// Template: Leave rejected
exports.leaveRejectedEmail = (employee, leave, comment) => ({
  subject: '❌ Your Leave Request Has Been Rejected',
  html: `
    <h2>Hi ${employee.name},</h2>
    <p>Unfortunately, your leave request has been <b>rejected</b>.</p>
    <p><b>Reason:</b> ${comment}</p>
    <p>Please contact your manager if you have questions.</p>
  `
});
```

---

## 9. JSP Report Module

### How the Integration Works

The Node.js backend and Tomcat (JSP) server are two separate servers. Here is the flow:

```
HR Admin clicks "Generate Report"
         │
         ▼
React calls: GET /api/admin/report?month=3&year=2024
         │
         ▼
Express backend fetches report data from MongoDB
         │
         ▼
Express calls Tomcat JSP URL with data as query params or POST body:
  http://localhost:8080/reports/monthly.jsp?month=3&year=2024&data=...
         │
         ▼
JSP renders HTML report using the data
         │
         ▼
Tomcat returns the HTML to Express
Express forwards it back to React (or returns the JSP URL)
         │
         ▼
React opens the report in a new browser tab
```

### Sample JSP File Structure (`monthly.jsp`)

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.*" %>
<!DOCTYPE html>
<html>
<head>
  <title>Monthly Leave Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
    th { background-color: #f4f4f4; }
    h1 { color: #333; }
    .header { display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monthly Leave Utilisation Report</h1>
    <p>Generated: <%= new java.util.Date() %></p>
  </div>

  <p><b>Month:</b> <%= request.getParameter("month") %></p>
  <p><b>Year:</b> <%= request.getParameter("year") %></p>

  <h2>Leave Summary by Department</h2>
  <table>
    <thead>
      <tr>
        <th>Department</th>
        <th>Total Employees</th>
        <th>Total Leave Days Taken</th>
        <th>Average Days per Employee</th>
      </tr>
    </thead>
    <tbody>
      <%-- Data rows injected here via Java/JSTL --%>
    </tbody>
  </table>
</body>
</html>
```

---

## 10. Leave Balance Logic

Understanding how leave balance is calculated is critical to building the approval workflow correctly.

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

### When to Deduct From Balance

> **Important:** Deduct from balance ONLY when the leave is **approved**, not when submitted.

Workflow:
1. Employee submits → `status = "Pending"` → balance NOT deducted
2. Manager approves → `status = "Approved"` → balance IS deducted
3. Manager rejects → `status = "Rejected"` → balance NOT deducted
4. Employee cancels pending request → `status = "Cancelled"` → no balance change needed

### What About Weekends and Public Holidays?

When calculating `durationDays`:
- By default, only count **working days** (Monday–Friday)
- Exclude weekends (Saturday and Sunday)
- Public holidays can optionally be stored in a `PublicHolidays` collection and excluded too

**Example calculation (JavaScript):**
```javascript
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  let current = new Date(startDate);
  while (current <= new Date(endDate)) {
    const day = current.getDay(); // 0=Sunday, 6=Saturday
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
```

---

## 11. User Roles & Permissions

### Role-Based Access Control (RBAC)

RBAC means different users have different levels of access. Every API route is protected by a middleware that checks the user's role before allowing the action.

### Permission Matrix

| Action | Employee | Manager | HR Admin |
|---|---|---|---|
| Submit own leave request | ✅ | ✅ | ✅ |
| View own leave history | ✅ | ✅ | ✅ |
| View own leave balance | ✅ | ✅ | ✅ |
| Cancel own pending request | ✅ | ✅ | ✅ |
| View team's pending requests | ❌ | ✅ | ✅ |
| Approve / Reject requests | ❌ | ✅ (own team only) | ✅ (all) |
| View company-wide calendar | ❌ | ❌ | ✅ |
| View all employees' balances | ❌ | ❌ | ✅ |
| Adjust leave balances | ❌ | ❌ | ✅ |
| Generate monthly reports | ❌ | ❌ | ✅ |
| Create user accounts | ❌ | ❌ | ✅ |

### How Middleware Enforces This

```javascript
// middleware/auth.js
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // { id, role, email }
  next();
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};

// Usage in routes:
router.patch('/:id/approve', protect, restrictTo('manager', 'admin'), approveLeave);
router.get('/admin/report', protect, restrictTo('admin'), generateReport);
```

---

## 12. Application Flow Diagrams

### Flow 1: Employee Submits Leave Request

```
Employee fills form → Clicks Submit
        │
        ▼
Frontend validates form (dates not in past, end >= start)
        │
        ▼ (if valid)
POST /api/leaves (sends leaveType, startDate, endDate, reason)
        │
        ▼
Backend checks: does employee have enough balance?
        │
  ┌─────┴─────┐
  │           │
 Yes          No
  │           │
  │           └──► Return 400 Error: "Insufficient leave balance"
  │
  ▼
Create LeaveRequest document in MongoDB (status: "Pending")
        │
        ▼
Update nothing in LeaveBalances (pending doesn't deduct)
        │
        ▼
Nodemailer sends email to Employee ("Request submitted")
Nodemailer sends email to Manager ("New request to review")
        │
        ▼
Return 201 Created → React shows success toast
```

### Flow 2: Manager Approves a Request

```
Manager sees pending request in dashboard
        │
        ▼
Clicks "Approve" → optional comment → Clicks Confirm
        │
        ▼
PATCH /api/leaves/:id/approve  (with optional comment)
        │
        ▼
Backend: Update LeaveRequest { status: "Approved", reviewedAt: now, reviewedBy: managerId }
        │
        ▼
Backend: Find employee's LeaveBalance for this year
         Increment: balance.annual.used += leave.durationDays
         (or sick.used, depending on leaveType)
         Save balance
        │
        ▼
Nodemailer: send approval email to Employee
        │
        ▼
Return 200 OK → React removes request from pending list
```

---

## 13. Project Folder Structure

Here is the recommended folder structure for your project:

```
employee-leave-management/
│
├── backend/                        ← Node.js + Express server
│   ├── server.js                   ← Entry point (starts the server)
│   ├── .env                        ← Environment variables (NEVER commit to Git)
│   ├── .env.example                ← Template showing what variables are needed
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js                   ← MongoDB connection setup
│   │
│   ├── models/                     ← Mongoose schemas
│   │   ├── User.js
│   │   ├── LeaveRequest.js
│   │   ├── LeaveBalance.js
│   │   └── LeaveType.js
│   │
│   ├── routes/                     ← Express route files
│   │   ├── auth.routes.js
│   │   ├── leave.routes.js
│   │   ├── balance.routes.js
│   │   └── admin.routes.js
│   │
│   ├── controllers/                ← Business logic (what each route actually does)
│   │   ├── auth.controller.js
│   │   ├── leave.controller.js
│   │   ├── balance.controller.js
│   │   └── admin.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      ← JWT verification + role checking
│   │   └── errorHandler.js        ← Global error handler
│   │
│   └── utils/
│       ├── emailTemplates.js       ← HTML email template functions
│       ├── sendEmail.js            ← Nodemailer setup and send function
│       └── calculateDays.js        ← Working days calculation logic
│
├── frontend/                       ← React application
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                  ← Main app + routing
│       ├── index.js
│       │
│       ├── pages/                  ← Top-level pages
│       │   ├── LoginPage.jsx
│       │   ├── EmployeeDashboard.jsx
│       │   ├── ManagerDashboard.jsx
│       │   └── AdminPanel.jsx
│       │
│       ├── components/             ← Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── LeaveRequestForm.jsx
│       │   ├── LeaveCard.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── LeaveCalendar.jsx
│       │   ├── BalanceCard.jsx
│       │   └── Toast.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx     ← Stores logged-in user globally
│       │
│       ├── api/
│       │   └── axios.js            ← Axios instance with base URL and auth header
│       │
│       └── utils/
│           └── helpers.js          ← Date formatting, etc.
│
└── jsp-reports/                    ← Apache Tomcat + JSP files
    └── webapps/
        └── reports/
            ├── monthly.jsp
            └── WEB-INF/
                └── web.xml
```

---

## 14. Environment Setup Guide

Follow these steps exactly, in order. Do not skip steps.

### Prerequisites — Install These First

1. **Node.js** (v18 or higher) — [nodejs.org](https://nodejs.org) → Download LTS version
2. **MongoDB Community Server** — [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) → Install and start the service
3. **MongoDB Compass** (optional GUI) — helpful for visually browsing your database
4. **Java JDK 11+** — [adoptium.net](https://adoptium.net) → Required for JSP/Tomcat
5. **Apache Tomcat 10** — [tomcat.apache.org](https://tomcat.apache.org) → Download and extract
6. **VS Code** — [code.visualstudio.com](https://code.visualstudio.com) (recommended editor)
7. **Git** — for version control

### Step-by-Step Setup

#### Backend Setup

```bash
# 1. Navigate into the backend folder
cd employee-leave-management/backend

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Open .env and fill in your values:
#    MONGO_URI=mongodb://localhost:27017/leavedb
#    JWT_SECRET=any_long_random_string_here
#    PORT=5000
#    MAIL_HOST=sandbox.smtp.mailtrap.io
#    MAIL_PORT=2525
#    MAIL_USER=your_mailtrap_user
#    MAIL_PASS=your_mailtrap_pass

# 5. Start the backend server
npm run dev
# You should see: "Server running on port 5000" and "MongoDB connected"
```

#### Frontend Setup

```bash
# 1. Open a NEW terminal window
cd employee-leave-management/frontend

# 2. Install dependencies
npm install

# 3. Start the React development server
npm start
# Browser opens at http://localhost:3000
```

#### Tomcat / JSP Setup

```bash
# 1. Copy the jsp-reports/webapps/reports folder into Tomcat's webapps directory
# On Mac: /usr/local/tomcat/webapps/
# On Windows: C:\tomcat\webapps\

# 2. Start Tomcat
# On Mac/Linux:
/usr/local/tomcat/bin/startup.sh

# On Windows:
C:\tomcat\bin\startup.bat

# 3. Verify Tomcat is running: http://localhost:8080
```

### Key npm Packages (Backend)

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken nodemailer cors
npm install --save-dev nodemon
```

### Key npm Packages (Frontend)

```bash
npm install axios react-router-dom react-big-calendar moment
```

---

## 15. Development Workflow

### Day-to-Day Development Steps

1. **Always run both servers** — backend on port 5000, React on port 3000. Keep two terminal windows open.
2. **Build backend first** — get all APIs working and testable before touching React
3. **Test APIs with Postman or Thunder Client** (VS Code extension) before connecting React
4. **Commit small, commit often** — after each feature works, `git commit`

### Recommended Build Order

Build the project in this order for the smoothest experience:

1. **Week 1 — Backend Foundation**
   - Setup Express server + MongoDB connection
   - Create all Mongoose models (User, LeaveRequest, LeaveBalance)
   - Implement auth routes (login, JWT)
   - Implement leave request CRUD routes

2. **Week 2 — Approval Workflow + Email**
   - Implement approve/reject endpoints with balance deduction
   - Setup Nodemailer with Mailtrap
   - Write email templates
   - Test full leave lifecycle via Postman

3. **Week 3 — React Frontend**
   - Setup React with routing (react-router-dom)
   - Build Login page + AuthContext
   - Build Employee Dashboard
   - Build Manager Dashboard

4. **Week 4 — HR Admin + Reports**
   - Build HR Admin panel with calendar
   - Build leave balance table
   - Setup Apache Tomcat and write JSP report
   - Connect report generation to frontend

### Debugging Tips for Beginners

- **Backend not starting?** Check if `MONGO_URI` in `.env` is correct and MongoDB is running.
- **React can't reach backend?** Check that Express has `cors()` enabled and the frontend is pointing to `http://localhost:5000`.
- **Email not sending?** Check Mailtrap credentials in `.env` and look in your Mailtrap inbox.
- **JWT errors?** Make sure the `JWT_SECRET` in `.env` is the same everywhere and your token is being sent in the `Authorization: Bearer <token>` header.
- **JSP not rendering?** Make sure Tomcat is running on port 8080 and the `.jsp` file is in the right `webapps` folder.

---

## 16. Glossary

| Term | Plain English Explanation |
|---|---|
| **API** | A set of URLs that your frontend calls to get or send data to the backend |
| **REST API** | A standard style of API that uses HTTP methods (GET, POST, PUT, DELETE) |
| **CRUD** | Create, Read, Update, Delete — the four basic database operations |
| **JWT** | A secure token string that proves who you are when making API calls |
| **Middleware** | Code that runs between a request arriving and a response being sent |
| **Schema** | A blueprint that defines the structure of data in a database |
| **Collection** | MongoDB's equivalent of a database table |
| **Document** | MongoDB's equivalent of a database row |
| **Mongoose** | An npm library that adds schemas and helper methods on top of MongoDB |
| **Nodemailer** | An npm package for sending emails from Node.js |
| **SMTP** | The protocol used to send emails across the internet |
| **Mailtrap** | A fake email inbox for testing — catches emails so they don't go to real addresses |
| **JSP** | Java Server Pages — HTML files with embedded Java code, run by Apache Tomcat |
| **Tomcat** | A Java web server that runs JSP files |
| **RBAC** | Role-Based Access Control — different users get different permissions based on their role |
| **State (React)** | Data stored in a component that, when changed, re-renders the UI automatically |
| **Component (React)** | A reusable piece of the UI — like a LEGO brick |
| **useEffect (React)** | A React hook used to run code when the component first loads (e.g., fetch data from API) |
| **Axios** | A popular npm library for making HTTP requests from React to the backend |
| **dotenv** | An npm library for loading environment variables from a `.env` file |
| **bcryptjs** | An npm library for hashing passwords (so plain passwords are never stored) |
| **CORS** | Cross-Origin Resource Sharing — a security rule that needs to be enabled so React (port 3000) can call Express (port 5000) |
| **Working Days** | Days from Monday to Friday, excluding weekends and public holidays |
| **Leave Balance** | The number of leave days an employee has remaining for the year |
| **Leave Utilisation** | How much of the available leave has been used — the subject of the HR monthly report |

---

*Documentation prepared for Employee Leave Management System — Project 11*
*Intended for junior developers building this project from scratch.*
*Version 1.0 — May 2026*
