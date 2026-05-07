# Project Folder Structure

This is the **simplified, clean folder structure** designed for easy onboarding and maintenance. All folders are created and ready to use.

---

## Complete Directory Tree

```
employee-leave-management/
│
├── frontend/                         ← React application (Create React App)
│   ├── package.json                  ← npm dependencies
│   ├── public/
│   │   └── index.html                ← HTML entry point
│   │
│   └── src/
│       ├── App.js                    ← Main app + routing setup
│       ├── index.js                  ← React entry point
│       ├── index.css                 ← Global styles
│       │
│       ├── pages/                    ← Full page components (4 pages)
│       │   ├── LoginPage.jsx
│       │   ├── EmployeeDashboard.jsx
│       │   ├── ManagerDashboard.jsx
│       │   └── AdminPanel.jsx
│       │
│       ├── components/               ← Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── LeaveRequestForm.jsx
│       │   ├── LeaveCard.jsx
│       │   ├── LeaveTable.jsx
│       │   ├── Modal.jsx
│       │   ├── Button.jsx
│       │   ├── StatusBadge.jsx
│       │   └── LoadingSpinner.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx       ← Global auth state (user, login, logout)
│       │
│       └── api/
│           └── axios.js              ← Axios instance with interceptors
│
├── backend/                          ← Node.js + Express server
│   ├── server.js                     ← Entry point (starts the server)
│   ├── package.json                  ← npm dependencies
│   ├── .env.example                  ← Template for environment variables
│   ├── .env                          ← Actual env (NEVER commit)
│   │
│   ├── config/
│   │   └── db.js                     ← MongoDB connection setup
│   │
│   ├── models/                       ← Mongoose schemas (3 models)
│   │   ├── User.js                   ← Employee, manager, admin users
│   │   ├── LeaveRequest.js           ← Leave request documents
│   │   └── LeaveBalance.js           ← Annual/sick/unpaid balance tracking
│   │
│   ├── routes/                       ← Express route files
│   │   ├── auth.routes.js            ← Login, register, logout
│   │   ├── leave.routes.js           ← Submit, view, approve leaves
│   │   ├── balance.routes.js         ← View leave balance
│   │   └── admin.routes.js           ← Admin-only endpoints
│   │
│   ├── controllers/                  ← Business logic for each route
│   │   ├── auth.controller.js        ← Login, register functions
│   │   ├── leave.controller.js       ← Leave CRUD + approval logic
│   │   ├── balance.controller.js     ← Balance calculations
│   │   └── admin.controller.js       ← Reports and admin functions
│   │
│   ├── middleware/
│   │   └── auth.middleware.js        ← JWT verification + role checking
│   │
│   └── utils/
│       ├── sendEmail.js              ← Nodemailer setup
│       ├── emailTemplates.js         ← HTML email templates (4 types)
│       └── calculateDays.js          ← Working days calculation (Mon-Fri)
│
├── jsp-reports/                      ← Apache Tomcat JSP files
│   └── reports/
│       └── monthly.jsp               ← Monthly leave report template
│
├── docs/                             ← All documentation files
│   ├── README.md                     ← Documentation index
│   ├── 01-project-overview.md
│   ├── 02-system-architecture.md
│   ├── ... (13 more doc files)
│   └── 16-glossary.md
│
├── README.md                         ← Project overview
└── .gitignore                        ← Git exclusions (.env, node_modules, etc.)
```

---

## Folder Descriptions

### Backend

#### `/config`
Database and other configuration files.
- `db.js` — MongoDB connection using Mongoose

#### `/models`
Mongoose schemas for MongoDB collections.
- `User.js` — Employees, managers, admins with roles and department
- `LeaveRequest.js` — Leave request documents with status and timeline
- `LeaveBalance.js` — Annual/sick/unpaid leave balances per year

#### `/routes`
Express.js route handlers. Each file groups related endpoints.
- `auth.routes.js` — Login, register, logout endpoints
- `leave.routes.js` — Submit, view, approve, reject leave endpoints
- `balance.routes.js` — View leave balance endpoints
- `admin.routes.js` — Admin-only endpoints (reports, user management)

#### `/controllers`
Business logic for each route. Controllers:
- Validate inputs
- Query/update database via models
- Call utilities (email, calculations)
- Send response

Example flow:
```javascript
// routes/leave.routes.js
router.post('/', protect, submitLeave);

// controllers/leave.controller.js
const submitLeave = async (req, res) => {
  const durationDays = calculateWorkingDays(req.body.startDate, req.body.endDate);
  const leave = await LeaveRequest.create({ ...req.body, durationDays });
  await sendEmail(...);
  res.json({ success: true, leave });
};
```

#### `/middleware`
Functions that run before controllers. Currently includes:
- `auth.middleware.js` — JWT verification, role-based access control

#### `/utils`
Reusable helper functions:
- `sendEmail.js` — Nodemailer SMTP configuration
- `emailTemplates.js` — HTML email templates (4 types: submitted, approved, rejected, confirmation)
- `calculateDays.js` — Calculate working days (Mon-Fri only, excludes weekends)

### Frontend

#### `/pages`
Full-screen page components corresponding to routes:
- `LoginPage.jsx` — User login form
- `EmployeeDashboard.jsx` — Employee view (submit leaves, view status)
- `ManagerDashboard.jsx` — Manager view (approve/reject team leaves)
- `AdminPanel.jsx` — Admin view (system overview, reports)

#### `/components`
Reusable UI components used by pages:
- `Navbar.jsx` — Top navigation bar
- `Sidebar.jsx` — Navigation sidebar
- `LeaveRequestForm.jsx` — Form to submit new leave
- `LeaveCard.jsx` — Display single leave request
- `LeaveTable.jsx` — Table view of multiple leaves
- `Modal.jsx` — Generic modal dialog
- `Button.jsx` — Reusable button component
- `StatusBadge.jsx` — Show Pending/Approved/Rejected status
- `LoadingSpinner.jsx` — Loading indicator

#### `/context`
Global state management using React Context:
- `AuthContext.jsx` — User authentication (user, login, logout)

#### `/api`
API communication:
- `axios.js` — Axios instance with base URL and JWT interceptors

---

## File Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| **Backend Models** | Singular, PascalCase | `User.js`, `LeaveRequest.js` |
| **Backend Controllers** | Lowercase, `.controller.js` | `auth.controller.js` |
| **Backend Routes** | Lowercase, `.routes.js` | `leave.routes.js` |
| **Backend Middleware** | Lowercase, `.middleware.js` | `auth.middleware.js` |
| **Backend Utils** | camelCase | `sendEmail.js`, `calculateDays.js` |
| **Frontend Pages** | PascalCase, `*Page.jsx` | `LoginPage.jsx` |
| **Frontend Components** | PascalCase, `.jsx` | `LeaveCard.jsx` |
| **Frontend Context** | PascalCase, `*Context.jsx` | `AuthContext.jsx` |

---

## Common Patterns

### Backend: Middleware Chain

Routes protect sensitive endpoints by chaining middleware:

```javascript
// routes/leave.routes.js
router.patch('/:id/approve', 
  protect,           // Verify JWT token
  restrictTo('manager', 'admin'),  // Check role
  approveLeave       // Controller function
);
```

### Frontend: Using Context

Global state is accessed throughout the app:

```javascript
// App.js
<AuthProvider>
  <Routes>
    {/* Pages inside here can access auth context */}
  </Routes>
</AuthProvider>

// Any page/component
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useContext(AuthContext);
  return <div>Hello {user.name}</div>;
}
```

### Email Sending

Controllers call email utilities after database updates:

```javascript
// controllers/leave.controller.js
exports.approveLeave = async (req, res) => {
  // Update leave status
  leave.status = 'Approved';
  await leave.save();
  
  // Send email
  const emailContent = leaveApprovedEmail(employee, leave, comment);
  await sendEmail(employee.email, emailContent.subject, emailContent.html);
  
  res.json({ success: true });
};
```

---

## ✅ What's Been Created

### Folders (Ready to use)
- ✅ All 13 directories created
- ✅ File stubs created for core functionality
- ✅ Configuration files ready (`.env.example`, `.gitignore`)

### Template Files (Ready to extend)
- ✅ `backend/server.js` — Express server entry point
- ✅ `backend/package.json` — npm dependencies
- ✅ `backend/.env.example` — Environment template
- ✅ `backend/config/db.js` — MongoDB connection
- ✅ `backend/models/*` — 3 Mongoose schemas (User, LeaveRequest, LeaveBalance)
- ✅ `backend/middleware/auth.middleware.js` — JWT + role checking
- ✅ `backend/utils/*` — Email and calculation utilities
- ✅ `frontend/package.json` — React dependencies
- ✅ `frontend/src/App.js` — React Router setup
- ✅ `frontend/src/context/AuthContext.jsx` — Global auth state
- ✅ `frontend/src/api/axios.js` — API client with interceptors
- ✅ `frontend/public/index.html` — HTML entry point
- ✅ `jsp-reports/reports/monthly.jsp` — JSP report template

---

## 📝 Next Steps

### Backend Development
1. **Routes**: Implement `/routes/auth.routes.js`, `/routes/leave.routes.js`, etc.
2. **Controllers**: Implement `/controllers/*` business logic
3. **Install dependencies**: `npm install` in `/backend`

### Frontend Development  
1. **Pages**: Implement `/pages/LoginPage.jsx`, `/pages/EmployeeDashboard.jsx`, etc.
2. **Components**: Implement `/components/*` UI elements
3. **Styling**: Add CSS to components as needed
4. **Install dependencies**: `npm install` in `/frontend`

### Running the Application
1. Start MongoDB: `mongod`
2. Start backend: `cd backend && npm run dev` (runs on http://localhost:5000)
3. Start frontend: `cd frontend && npm start` (runs on http://localhost:3000)
4. Setup Tomcat for JSP reports (see [09-jsp-reports.md](09-jsp-reports.md))

---

## 🎯 Design Principles

This simplified structure follows:
- **Single Responsibility**: Each file has one clear purpose
- **DRY (Don't Repeat Yourself)**: Reusable components, utilities, and middleware
- **Clean Separation**: Frontend, backend, and reports in separate folders
- **Easy Onboarding**: New team members can quickly understand the structure
- **Scalable**: Easy to add features without major refactoring



