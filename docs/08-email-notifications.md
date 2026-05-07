# Email Notification System

This section covers email setup, templates, and implementation details for automated notifications.

---

## Setup (Development Environment)

For development, you will use **Mailtrap** so that no real emails are sent to employees:

### Step 1: Create Mailtrap Account

1. Sign up at [mailtrap.io](https://mailtrap.io) (free account)
2. Go to **Email Testing** → **Inboxes**
3. Create an inbox (e.g., "Employee Leave System")
4. Click on your inbox → **Show Credentials** → copy the SMTP settings

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username
MAIL_PASS=your_mailtrap_password
MAIL_FROM="HR System <hr@yourcompany.com>"
MAIL_FROM_NAME="Employee Leave Management"
```

### Step 3: Install Nodemailer

```bash
npm install nodemailer
```

---

## Email Setup Code

### Create Nodemailer Transporter (`utils/sendEmail.js`)

```javascript
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verify connection at startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email service ready:', success);
  }
});

// Generic send function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
};

module.exports = { sendEmail };
```

---

## Email Templates

### Create Email Templates (`utils/emailTemplates.js`)

```javascript
// Template: Employee submits leave request (employee receives this)
exports.leaveSubmittedConfirmation = (employee, leave) => ({
  subject: 'Leave Request Submitted - Pending Approval',
  html: `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 15px; border-radius: 5px; }
        .content { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #e8e8e8; font-weight: bold; }
        .button { 
          display: inline-block; 
          background-color: #007bff; 
          color: white; 
          padding: 10px 20px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin-top: 20px; 
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Leave Request Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Hi ${employee.name},</p>
          
          <p>Your leave request has been successfully submitted and is now pending your manager's review.</p>
          
          <table>
            <tr>
              <th>Detail</th>
              <th>Value</th>
            </tr>
            <tr>
              <td><b>Leave Type</b></td>
              <td>${leave.leaveType}</td>
            </tr>
            <tr>
              <td><b>From</b></td>
              <td>${new Date(leave.startDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><b>To</b></td>
              <td>${new Date(leave.endDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><b>Duration</b></td>
              <td>${leave.durationDays} day(s)</td>
            </tr>
            <tr>
              <td><b>Request ID</b></td>
              <td>#${leave._id}</td>
            </tr>
          </table>
          
          <p style="margin-top: 20px;">You will receive another email once your manager reviews your request.</p>
          
          <p>If you have any questions, please contact your HR department.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>Employee Leave Management System</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

// Template: Manager receives pending request notification
exports.managerPendingNotification = (manager, employee, leave) => ({
  subject: `Leave Request from ${employee.name} Requires Your Review`,
  html: `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #fff3cd; padding: 15px; border-radius: 5px; }
        .warning { color: #856404; }
        .action-buttons { margin-top: 20px; }
        .btn { 
          display: inline-block; 
          padding: 10px 20px; 
          margin-right: 10px; 
          border-radius: 5px; 
          text-decoration: none;
        }
        .btn-approve { background-color: #28a745; color: white; }
        .btn-reject { background-color: #dc3545; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="warning">⚠️ Action Required: Leave Request Review</h2>
        </div>
        
        <div class="content">
          <p>Hi ${manager.name},</p>
          
          <p><b>${employee.name}</b> from your team has submitted a leave request that requires your review.</p>
          
          <h3>Leave Details:</h3>
          <ul>
            <li><b>Employee:</b> ${employee.name} (${employee.email})</li>
            <li><b>Leave Type:</b> ${leave.leaveType}</li>
            <li><b>From:</b> ${new Date(leave.startDate).toLocaleDateString()}</li>
            <li><b>To:</b> ${new Date(leave.endDate).toLocaleDateString()}</li>
            <li><b>Duration:</b> ${leave.durationDays} day(s)</li>
            ${leave.reason ? `<li><b>Reason:</b> ${leave.reason}</li>` : ''}
          </ul>
          
          <p>Please log in to the HR System to approve or reject this request.</p>
          
          <div class="action-buttons">
            <a href="http://localhost:3000/manager" class="btn btn-approve">Review Request</a>
          </div>
        </div>
        
        <div class="footer" style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

// Template: Employee's request approved
exports.leaveApprovedEmail = (employee, leave, managerComment = '') => ({
  subject: '✅ Your Leave Request Has Been Approved',
  html: `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d4edda; padding: 15px; border-radius: 5px; }
        .success { color: #155724; }
        .details { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="success">✅ Great News!</h2>
        </div>
        
        <div class="content">
          <p>Hi ${employee.name},</p>
          
          <p>Your leave request has been <b>approved</b>!</p>
          
          <div class="details">
            <h3>Approved Leave Details:</h3>
            <p><b>Leave Type:</b> ${leave.leaveType}</p>
            <p><b>Period:</b> ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</p>
            <p><b>Duration:</b> ${leave.durationDays} day(s)</p>
          </div>
          
          ${managerComment ? `
            <h3 style="margin-top: 20px;">Manager's Note:</h3>
            <p style="background-color: #e7f3ff; padding: 10px; border-left: 3px solid #2196F3;">
              "${managerComment}"
            </p>
          ` : ''}
          
          <p style="margin-top: 20px;">Enjoy your time off! Don't forget to update your out-of-office status.</p>
        </div>
        
        <div class="footer" style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});

// Template: Employee's request rejected
exports.leaveRejectedEmail = (employee, leave, managerComment) => ({
  subject: '❌ Your Leave Request Has Been Rejected',
  html: `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8d7da; padding: 15px; border-radius: 5px; }
        .danger { color: #721c24; }
        .reason { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="danger">❌ Request Rejected</h2>
        </div>
        
        <div class="content">
          <p>Hi ${employee.name},</p>
          
          <p>Unfortunately, your leave request has been <b>rejected</b>.</p>
          
          <h3>Request Details:</h3>
          <p>
            <b>${leave.leaveType} Leave</b> from 
            ${new Date(leave.startDate).toLocaleDateString()} to 
            ${new Date(leave.endDate).toLocaleDateString()} 
            (${leave.durationDays} day(s))
          </p>
          
          <div class="reason">
            <h3>Reason for Rejection:</h3>
            <p>${managerComment}</p>
          </div>
          
          <p style="margin-top: 20px;">
            Please contact your manager directly if you would like to discuss this decision or if you have any questions.
          </p>
        </div>
        
        <div class="footer" style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
});
```

---

## Triggering Emails in Controller Functions

### When Employee Submits Leave (`controllers/leave.controller.js`)

```javascript
const { sendEmail } = require('../utils/sendEmail');
const { leaveSubmittedConfirmation, managerPendingNotification } = require('../utils/emailTemplates');

exports.submitLeaveRequest = async (req, res) => {
  // ... validation and database save code ...
  
  const leave = new LeaveRequest({
    employeeId: req.user.id,
    leaveType: req.body.leaveType,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    durationDays: calculateDays(req.body.startDate, req.body.endDate),
    reason: req.body.reason,
    status: 'Pending'
  });
  
  await leave.save();
  
  // Get employee and manager details
  const employee = await User.findById(req.user.id);
  const manager = await User.findById(employee.managerId);
  
  // Send confirmation email to employee
  const emailToEmployee = leaveSubmittedConfirmation(employee, leave);
  await sendEmail(employee.email, emailToEmployee.subject, emailToEmployee.html);
  
  // Send notification email to manager
  const emailToManager = managerPendingNotification(manager, employee, leave);
  await sendEmail(manager.email, emailToManager.subject, emailToManager.html);
  
  res.status(201).json({ success: true, data: leave });
};
```

### When Manager Approves Leave

```javascript
const { leaveApprovedEmail } = require('../utils/emailTemplates');

exports.approveLeave = async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id);
  
  // Update leave status
  leave.status = 'Approved';
  leave.reviewedBy = req.user.id;
  leave.managerComment = req.body.comment || '';
  leave.reviewedAt = new Date();
  await leave.save();
  
  // Deduct from employee's balance
  const balance = await LeaveBalance.findOne({ employeeId: leave.employeeId });
  if (leave.leaveType === 'annual') {
    balance.annual.used += leave.durationDays;
  } else if (leave.leaveType === 'sick') {
    balance.sick.used += leave.durationDays;
  }
  await balance.save();
  
  // Send approval email to employee
  const employee = await User.findById(leave.employeeId);
  const emailData = leaveApprovedEmail(employee, leave, leave.managerComment);
  await sendEmail(employee.email, emailData.subject, emailData.html);
  
  res.json({ success: true, data: leave });
};
```

### When Manager Rejects Leave

```javascript
const { leaveRejectedEmail } = require('../utils/emailTemplates');

exports.rejectLeave = async (req, res) => {
  if (!req.body.comment) {
    return res.status(400).json({ success: false, message: 'Comment is required' });
  }
  
  const leave = await LeaveRequest.findById(req.params.id);
  
  // Update leave status
  leave.status = 'Rejected';
  leave.reviewedBy = req.user.id;
  leave.managerComment = req.body.comment;
  leave.reviewedAt = new Date();
  await leave.save();
  
  // Send rejection email to employee
  const employee = await User.findById(leave.employeeId);
  const emailData = leaveRejectedEmail(employee, leave, leave.managerComment);
  await sendEmail(employee.email, emailData.subject, emailData.html);
  
  res.json({ success: true, data: leave });
};
```

---

## Testing Emails During Development

### Step 1: Monitor Mailtrap Inbox
- All emails sent will appear in your Mailtrap inbox
- You don't need to give real email addresses in your test data
- Use fake emails like `john@test.com`, `manager@test.com`

### Step 2: Test Email Sending
In your backend, you can create a test route:

```javascript
router.get('/test-email', async (req, res) => {
  const { sendEmail } = require('../utils/sendEmail');
  const { leaveSubmittedConfirmation } = require('../utils/emailTemplates');
  
  const testEmployee = { name: 'John Doe', email: 'john@test.com' };
  const testLeave = {
    _id: '12345',
    leaveType: 'annual',
    startDate: '2024-03-10',
    endDate: '2024-03-14',
    durationDays: 5
  };
  
  const emailData = leaveSubmittedConfirmation(testEmployee, testLeave);
  await sendEmail(testEmployee.email, emailData.subject, emailData.html);
  
  res.json({ success: true, message: 'Test email sent' });
});
```

Visit `http://localhost:5000/test-email` and check your Mailtrap inbox.

---

## Production Email Setup

When deploying to production, replace Mailtrap with a real email service:

### Option 1: Gmail SMTP
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-company-email@gmail.com
MAIL_PASS=your-app-specific-password
```

### Option 2: SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.your-sendgrid-api-key
```

### Option 3: AWS SES
```env
MAIL_HOST=email-smtp.region.amazonaws.com
MAIL_PORT=587
MAIL_USER=your-ses-username
MAIL_PASS=your-ses-password
```

