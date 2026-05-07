# Feature Set Documentation

This section explains every feature of the system in detail. Think of it as the complete "what the app can do" guide.

---

## Feature 1: Employee Self-Service Portal

**What it is:** A dashboard that every employee sees when they log in.

**What it includes:**
- A form to submit a new leave request
- A list of all past and pending leave requests with their current status
- A summary card showing remaining leave balance for each leave type (annual, sick, unpaid)
- A calendar view showing upcoming approved leaves

### How leave submission works (step-by-step):
1. Employee clicks "New Leave Request"
2. Fills out the form: Leave Type, Start Date, End Date, Reason (optional)
3. Clicks Submit → a new request document is saved to MongoDB with status `"Pending"`
4. An email is immediately sent to the employee confirming the submission
5. The manager assigned to the employee gets a notification email
6. The request appears in the manager's dashboard

### Leave Types Available:
- **Annual Leave** — paid vacation time (each employee has a fixed annual quota, e.g. 20 days/year)
- **Sick Leave** — paid medical absence (separate quota, e.g. 10 days/year)
- **Unpaid Leave** — time off without pay (no quota limit, but requires approval)

---

## Feature 2: Manager Approval Dashboard

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

## Feature 3: HR Admin Panel

**What it is:** The most powerful dashboard in the system, accessible only to HR Admin users.

### 3a. Company-Wide Leave Calendar
- A full-month calendar view
- Shows colored blocks for each employee's approved leave
- Different colors for different leave types
- HR can filter by department, leave type, or individual employee
- Helps HR identify when multiple people from the same team are on leave simultaneously (avoiding coverage gaps)

### 3b. Leave Balance Tracker
- A table view showing every employee's current leave balances
- Columns: Employee Name, Annual Remaining, Sick Remaining, Unpaid Used
- HR can manually adjust balances (e.g., carry-over from last year, one-time grants)

### 3c. Monthly Leave Utilisation Report (JSP)
- HR clicks "Generate Report" and selects a month + year
- The Express backend fetches all leave data for that period
- The data is passed to the JSP layer, which renders a formatted HTML report
- The report shows: total leave days taken per department, leave type breakdown, top leave-takers, days remaining in the company leave budget

---

## Feature 4: Email Notification System

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

## Feature 5: JSP Report Pages

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

## User Workflows at a Glance

### Employee Workflow
```
Login → View Dashboard → Check Balance → Submit Leave Request → 
Wait for Manager → Receive Email Notification → View Status
```

### Manager Workflow
```
Login → View Pending Requests → Click Request Details → 
Approve/Reject with Comment → Automatic Email Sent to Employee
```

### HR Admin Workflow
```
Login → View Company Calendar → Check Employee Balances → 
Adjust Balances if Needed → Generate Monthly Report
```
