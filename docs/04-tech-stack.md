# Tech Stack Documentation

This section explains every technology used, what it does, why it was chosen, and how you will interact with it as a developer.

---

## MongoDB — The Database

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

## Express.js — The Backend Framework

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

## React JS — The Frontend

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

## Node.js — The Runtime

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

## Nodemailer — Email Service (Node.js Package)

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

## JSP — Java Server Pages (Reporting Layer)

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

## Supporting Libraries & Tools

### Backend Libraries
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token creation and verification
- **dotenv** - Environment variable management
- **cors** - Enable cross-origin requests (for React → Express communication)

### Frontend Libraries
- **Axios** - HTTP client
- **react-router-dom** - Client-side routing
- **react-big-calendar** - Calendar component
- **moment** - Date/time formatting

### Development Tools
- **Nodemon** - Auto-restart Node.js on file changes
- **Postman/Thunder Client** - API testing
- **MongoDB Compass** - Visual database browser
- **VS Code** - Recommended code editor

