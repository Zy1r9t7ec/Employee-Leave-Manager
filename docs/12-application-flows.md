# Application Flow Diagrams

This section shows the step-by-step workflows for the main use cases in the system.

---

## Flow 1: Employee Submits Leave Request

Complete workflow from form submission to email notification.

```
EMPLOYEE SIDE (React Frontend)
┌─────────────────────────────────────┐
│ Employee fills leave form:          │
│ - Leave Type: "annual"              │
│ - Start Date: 2024-03-10            │
│ - End Date: 2024-03-14              │
│ - Reason: "Family vacation"         │
└─────────────────────────────────────┘
              │
              ▼ (on submit)
┌─────────────────────────────────────┐
│ Frontend Validation:                │
│ ✓ All required fields filled?       │
│ ✓ End date >= start date?           │
│ ✓ Start date not in past?           │
└─────────────────────────────────────┘
              │
         ┌────┴────┐
         │          │
      VALID      INVALID
         │          │
         ▼          ▼
      PROCEED   SHOW ERROR
                   │
                   └─→ Stop (user fixes)
         │
         ▼
POST /api/leaves
  {
    leaveType: "annual",
    startDate: "2024-03-10",
    endDate: "2024-03-14",
    durationDays: 5,  ← calculated
    reason: "Family vacation"
  }
         │
         ▼
BACKEND SIDE (Express + MongoDB)
┌─────────────────────────────────────┐
│ Verify JWT Token                    │
│ (middleware/auth.middleware.js)     │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
  VALID    INVALID
    │          │
    ▼          ▼
 PROCEED   401 ERROR
            └─→ Return to client
    │
    ▼
┌─────────────────────────────────────┐
│ Fetch Employee's Current Year       │
│ Leave Balance from MongoDB          │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Check: Is balance sufficient?       │
│ annual.total (20) - annual.used (5) │
│ = 15 remaining vs 5 requested       │
└─────────────────────────────────────┘
    │
    ├─────────┴─────────┐
    │                   │
  SUFFICIENT         INSUFFICIENT
    │                   │
    ▼                   ▼
CONTINUE            400 ERROR:
                    "Insufficient balance"
    │               └─→ Return to client
    ▼
┌─────────────────────────────────────┐
│ Save LeaveRequest to MongoDB:       │
│ {                                   │
│   employeeId: "user123",            │
│   leaveType: "annual",              │
│   startDate: 2024-03-10,            │
│   endDate: 2024-03-14,              │
│   durationDays: 5,                  │
│   status: "Pending",                │
│   submittedAt: now                  │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ DO NOT deduct from balance yet      │
│ (only when approved)                │
│                                     │
│ annual.used remains: 5              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Fetch Employee & Manager Email      │
│ (for email notifications)           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ NODEMAILER: Send Email to Employee  │
│                                     │
│ TO: john@company.com                │
│ SUBJECT: "Leave Request Submitted"  │
│ BODY: Confirmation with details     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ NODEMAILER: Send Email to Manager   │
│                                     │
│ TO: manager@company.com             │
│ SUBJECT: "John's Leave Requires     │
│           Review"                   │
│ BODY: Pending request details       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Return 201 Created to Frontend:     │
│ {                                   │
│   success: true,                    │
│   data: { _id, status, ...}         │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
EMPLOYEE'S BROWSER (React)
┌─────────────────────────────────────┐
│ Show Success Toast:                 │
│ "✓ Leave request submitted!"        │
│                                     │
│ Refresh UI:                         │
│ - Clear form                        │
│ - Add request to history list       │
│ - Mark as "Pending"                 │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Both employees receive emails       │
│ notifying them of the action        │
└─────────────────────────────────────┘
```

---

## Flow 2: Manager Approves Leave Request

Complete approval workflow with balance deduction.

```
MANAGER'S BROWSER
┌─────────────────────────────────────┐
│ Manager logs in → /manager          │
│ Sees: "Pending Leave Requests"      │
│ List shows: John's request          │
│ - Type: Annual                      │
│ - Dates: Mar 10-14 (5 days)         │
│ - Status: Pending                   │
│ - Submitted: 1 day ago              │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Manager clicks "Approve" button     │
│ Optional: Adds comment "Approved,   │
│ have a great vacation!"             │
│ Clicks Confirm                      │
└─────────────────────────────────────┘
    │
    ▼
PATCH /api/leaves/:id/approve
{
  comment: "Approved, have a great vacation!"
}
    │
    ▼
BACKEND SIDE
┌─────────────────────────────────────┐
│ Verify JWT Token                    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Check: Is user a manager or admin?  │
└─────────────────────────────────────┘
    │
    ├─────┴─────┐
    │           │
   YES          NO
    │           │
    ▼           ▼
 PROCEED    403 FORBIDDEN
            └─→ Return error
    │
    ▼
┌─────────────────────────────────────┐
│ If manager: Check team ownership    │
│ Is John under this manager?         │
└─────────────────────────────────────┘
    │
    ├─────┴─────┐
    │           │
   YES          NO
    │           │
    ▼           ▼
 PROCEED    403 FORBIDDEN
            "Not your team member"
    │
    ▼
┌─────────────────────────────────────┐
│ Fetch LeaveRequest from MongoDB     │
│ Status check: Is it "Pending"?      │
└─────────────────────────────────────┘
    │
    ├─────┴─────┐
    │           │
  PENDING      OTHER
    │           │
    ▼           ▼
 PROCEED    400 ERROR
            "Already decided"
    │
    ▼
┌─────────────────────────────────────┐
│ DOUBLE-CHECK balance (paranoid!)    │
│ In case other approvals happened    │
│                                     │
│ annual.total: 20                    │
│ annual.used: 5                      │
│ remaining: 15                       │
│ requested: 5 ✓                      │
└─────────────────────────────────────┘
    │
    ├─────┴─────┐
    │           │
 SUFFICIENT  INSUFFICIENT
    │           │
    ▼           ▼
 PROCEED    400 ERROR
            "Balance changed!"
    │
    ▼
┌─────────────────────────────────────┐
│ UPDATE LeaveRequest in MongoDB:     │
│ {                                   │
│   status: "Approved",               │
│   reviewedBy: managerId,            │
│   managerComment: "Approved...",    │
│   reviewedAt: now                   │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ CRITICAL: Deduct from balance       │
│                                     │
│ UPDATE LeaveBalance:                │
│ annual.used: 5 + 5 = 10             │
│ (now annual.total: 20, used: 10,    │
│  remaining: 10)                     │
│                                     │
│ ⚠️ This is the only place we        │
│    deduct. NOT at submission!       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Fetch Employee info                 │
│ (for email notification)            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ NODEMAILER: Send Email to Employee  │
│                                     │
│ TO: john@company.com                │
│ SUBJECT: "✅ Your Leave Approved"   │
│ BODY: "Your 5-day leave from        │
│       Mar 10-14 has been approved"  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Return 200 OK to Frontend:          │
│ {                                   │
│   success: true,                    │
│   data: { status: "Approved", ... } │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
MANAGER'S BROWSER
┌─────────────────────────────────────┐
│ Show Success Toast:                 │
│ "✓ Leave approved!"                 │
│                                     │
│ Refresh UI:                         │
│ - Remove John's request from list   │
│   (no longer "Pending")             │
│ - Refresh pending requests          │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ John receives approval email        │
│ "Your leave from Mar 10-14 has      │
│  been approved! Enjoy!"             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ HR Admin can now see John's         │
│ leave on the Company Calendar       │
│ (shows approved leaves only)        │
└─────────────────────────────────────┘
```

---

## Flow 3: Manager Rejects Leave Request

Complete rejection workflow (no balance change).

```
MANAGER'S BROWSER
┌─────────────────────────────────────┐
│ Sees John's pending request         │
│ Clicks "Reject" button              │
│ Modal opens requiring comment       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Manager types comment:              │
│ "Cannot approve due to project      │
│  deadline. Please resubmit in       │
│  April."                            │
│                                     │
│ Clicks Confirm                      │
└─────────────────────────────────────┘
    │
    ▼
PATCH /api/leaves/:id/reject
{
  comment: "Cannot approve due to project deadline..."
}
    │
    ▼
BACKEND SIDE (similar auth checks as approve)
    │
    ▼
┌─────────────────────────────────────┐
│ Verify JWT Token ✓                  │
│ Check role (manager/admin) ✓        │
│ Check team ownership ✓              │
│ Verify request is "Pending" ✓       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ UPDATE LeaveRequest in MongoDB:     │
│ {                                   │
│   status: "Rejected",               │
│   reviewedBy: managerId,            │
│   managerComment: "Cannot approve...",
│   reviewedAt: now                   │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ ✓ DO NOT deduct from balance        │
│   (rejection means no time off)     │
│                                     │
│ annual.used remains: 5              │
│ (unchanged)                         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ NODEMAILER: Send Email to Employee  │
│                                     │
│ TO: john@company.com                │
│ SUBJECT: "❌ Your Leave Rejected"   │
│ BODY: "Your request for Mar 10-14   │
│       has been rejected.            │
│       Reason: Cannot approve due    │
│       to project deadline..."       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Return 200 OK to Frontend           │
└─────────────────────────────────────┘
    │
    ▼
MANAGER'S BROWSER
┌─────────────────────────────────────┐
│ Request disappears from pending     │
│ list (no longer "Pending")          │
│ Show success toast                  │
└─────────────────────────────────────┘
    │
    ▼
JOHN'S EMAIL
┌─────────────────────────────────────┐
│ Receives rejection email            │
│ Can resubmit different dates        │
│ Balance unchanged (still has 15     │
│ annual days available)              │
└─────────────────────────────────────┘
```

---

## Flow 4: Cancel Pending Request

Employee can cancel their own pending request before manager reviews.

```
EMPLOYEE SIDE
┌─────────────────────────────────────┐
│ Employee sees pending request       │
│ in "My Leaves" dashboard            │
│                                     │
│ Status shows: "Pending"             │
│ Clicks "Cancel Request" button      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Confirmation dialog:                │
│ "Are you sure? This cannot be       │
│  undone."                           │
│ Clicks "Yes, Cancel"                │
└─────────────────────────────────────┘
    │
    ▼
DELETE /api/leaves/:id
    │
    ▼
BACKEND SIDE
┌─────────────────────────────────────┐
│ Verify JWT Token ✓                  │
│ Check if user owns this request ✓   │
│ Verify status is "Pending" ✓        │
│ (can't cancel approved/rejected)    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Delete LeaveRequest from MongoDB    │
│ (or mark as "Cancelled")            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ ✓ Balance unchanged                 │
│   (never deducted since pending)    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Optional: Send email to manager     │
│ "John's pending request cancelled"  │
└─────────────────────────────────────┘
    │
    ▼
Return 200 OK to Frontend
    │
    ▼
EMPLOYEE BROWSER
┌─────────────────────────────────────┐
│ Request removed from list           │
│ Show success: "Request cancelled"   │
└─────────────────────────────────────┘
```

---

## Flow 5: HR Generates Monthly Report

```
HR ADMIN LOGS IN → /admin
    │
    ▼
┌─────────────────────────────────────┐
│ Clicks "Reports" tab                │
│ Selects Month: March, Year: 2024    │
│ Clicks "Generate Report"            │
└─────────────────────────────────────┘
    │
    ▼
GET /api/admin/report?month=3&year=2024
    │
    ▼
BACKEND SIDE
┌─────────────────────────────────────┐
│ Verify: User is admin ✓             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Query MongoDB:                      │
│ Find all LeaveRequests where:       │
│ - status: "Approved"                │
│ - startDate >= Mar 1, 2024          │
│ - endDate <= Mar 31, 2024           │
│ - Populate employee & department    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Process data:                       │
│ - Group by department               │
│ - Count leave types (annual/sick)   │
│ - Calculate totals                  │
│ - Format for JSP                    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ Return report URL to Frontend:      │
│ {                                   │
│   reportUrl: "http://localhost:8080 │
│   /reports/monthly.jsp?data=..."    │
│ }                                   │
└─────────────────────────────────────┘
    │
    ▼
BROWSER (React)
┌─────────────────────────────────────┐
│ Receives reportUrl                  │
│ Opens in NEW TAB                    │
└─────────────────────────────────────┘
    │
    ▼
HTTP://LOCALHOST:8080/REPORTS/MONTHLY.JSP
    │
    ▼
APACHE TOMCAT (JSP SERVER)
┌─────────────────────────────────────┐
│ JSP receives query parameters       │
│ (data object)                       │
│                                     │
│ Renders HTML report:                │
│ - Title & date                      │
│ - Summary cards                     │
│ - Department breakdown table        │
│ - Individual leave records          │
│ - Professional formatting           │
└─────────────────────────────────────┘
    │
    ▼
NEW BROWSER TAB
┌─────────────────────────────────────┐
│ Display formatted HTML report       │
│ User can:                           │
│ - View on screen                    │
│ - Print (Ctrl+P)                    │
│ - Download as PDF                   │
│ - Share with others                 │
└─────────────────────────────────────┘
```

---

## Error Scenarios

### Scenario: Employee Lacks Sufficient Balance

```
Employee submits 10-day leave request
         │
         ▼
Check balance: available 3 days, requesting 10
         │
         ▼
❌ 400 Bad Request:
{
  "success": false,
  "message": "Insufficient annual leave balance. 
              Available: 3 days, Requested: 10 days"
}
         │
         ▼
Frontend shows error message
Employee can submit different dates
```

### Scenario: Manager Tries to Approve Someone Else's Team

```
Manager (Smith) tries to approve employee (John)
who reports to Manager (Jones)
         │
         ▼
After auth checks:
Team ownership verification fails
         │
         ▼
❌ 403 Forbidden:
{
  "success": false,
  "message": "You can only approve leaves from 
              your own team members"
}
         │
         ▼
Frontend shows access denied
```

