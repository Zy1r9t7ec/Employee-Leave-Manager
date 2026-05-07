# System Architecture

## The Big Picture

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

## What Does "MERN Stack" Mean?

You will often hear the term **MERN stack** in web development circles. This project is a modified MERN stack:

- **M**ongoDB — Database
- **E**xpress.js — Backend framework
- **R**eact.js — Frontend UI
- **N**ode.js — Runtime (JavaScript engine for the backend)

The "modification" is the addition of **JSP** (a Java technology) for the reporting module, which is an intentional design choice for server-side rendered HTML reports.

## How the Parts Talk to Each Other

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

## Architecture Principles

### Separation of Concerns
- **Frontend** handles user interface and interactions
- **Backend** handles business logic and data validation
- **Database** handles data persistence
- **Email Service** handles notifications
- **Report Service** (JSP) handles formatted report generation

### Stateless Backend
The Express.js backend is stateless—it doesn't store session data. Instead, it uses JWT tokens for authentication. This makes the backend scalable and allows multiple instances to be run in parallel.

### RESTful API Design
The backend follows REST (Representational State Transfer) principles:
- Resources are represented by URLs (`/api/leaves`, `/api/users`)
- HTTP methods define actions (GET=read, POST=create, PATCH=update, DELETE=delete)
- Data is exchanged in JSON format

## Technology Layers

### Presentation Layer (Frontend)
- **React.js** - Single Page Application (SPA)
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **CSS/Bootstrap** - Styling

### Business Logic Layer (Backend)
- **Node.js** - Runtime environment
- **Express.js** - Web framework and routing
- **Middleware** - Authentication, validation, error handling
- **Nodemailer** - Email notifications

### Data Layer
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Mapper) for MongoDB

### Reporting Layer
- **JSP** - Server-side templating
- **Apache Tomcat** - Java web server

## Data Flow Example: Submit Leave Request

```
1. User fills form (React component maintains state)
           ↓
2. Clicks Submit → form validation on frontend
           ↓
3. Valid? → POST /api/leaves with JSON data
           ↓
4. Express receives request → verify JWT token
           ↓
5. Check user's leave balance in MongoDB
           ↓
6. Create new LeaveRequest document in MongoDB
           ↓
7. Trigger Nodemailer → send confirmation emails
           ↓
8. Return success response to React
           ↓
9. React receives response → update UI (show success toast, refresh list)
           ↓
10. User sees confirmation and request appears in dashboard
```

## Deployment Considerations

In production, you would typically:
- Host the Node.js backend on a server (AWS EC2, Heroku, DigitalOcean, etc.)
- Host the React frontend on a CDN (AWS S3 + CloudFront, Netlify, Vercel, etc.)
- Host MongoDB on MongoDB Atlas (managed cloud service) or a dedicated database server
- Use a managed email service (SendGrid, AWS SES, MailChimp) instead of Mailtrap
- Run Apache Tomcat on a separate Java server for JSP reports
