# User Roles & Permissions

This section covers role-based access control (RBAC) and how to implement it.

---

## Role-Based Access Control (RBAC)

RBAC means different users have different levels of access. Every API route is protected by a middleware that checks the user's role before allowing the action.

There are **three roles** in this system:

| Role | Description | User Type |
|---|---|---|
| **employee** | Regular staff member | Most users |
| **manager** | Team lead/supervisor | Can approve leave |
| **admin** | HR administrator | Full system access |

---

## Permission Matrix

Here's exactly what each role can do:

| Action | Employee | Manager | Admin |
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
| Delete user accounts | ❌ | ❌ | ✅ |
| View system audit logs | ❌ | ❌ | ✅ |

---

## Authentication & Authorization Implementation

### Middleware Structure

#### 1. Authentication Middleware (`middleware/auth.middleware.js`)

First, verify the user is logged in:

```javascript
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.'
    });
  }
  
  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = decoded; // { id, email, role, name }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { protect };
```

#### 2. Authorization Middleware

Second, check if user has the right role:

```javascript
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Not authorized. This action requires: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
```

### Example Route Usage

```javascript
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { 
  submitLeave, 
  getMyLeaves, 
  approveLead, 
  getAllLeaves 
} = require('../controllers/leave.controller');

// Any authenticated user can submit their own leave
router.post('/', protect, submitLeave);

// Any authenticated user can see their own leaves
router.get('/my', protect, getMyLeaves);

// Only managers and admins can approve leaves
router.patch('/:id/approve', protect, restrictTo('manager', 'admin'), approveLeave);

// Only admins can see all leaves company-wide
router.get('/', protect, restrictTo('admin'), getAllLeaves);

module.exports = router;
```

---

## Manager-Specific Logic

Managers can only approve leaves **from their own team members**. This requires additional logic beyond just the role check:

### Team-Based Authorization

```javascript
const restrictToOwnTeam = async (req, res, next) => {
  try {
    const leaveId = req.params.id;
    const managerId = req.user.id;
    
    // Get the leave request
    const leave = await LeaveRequest.findById(leaveId).populate('employeeId');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Check if the employee is under this manager
    if (leave.employeeId.managerId.toString() !== managerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve leaves from your own team members'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { restrictToOwnTeam };
```

### Using Team Authorization in Routes

```javascript
router.patch(
  '/:id/approve',
  protect,                              // Authenticate user
  restrictTo('manager', 'admin'),       // Must be manager or admin
  restrictToOwnTeam,                    // Managers: check team ownership
  approveLeave                          // Proceed with action
);
```

---

## JWT Token Structure

When a user logs in, they receive a JWT token containing role information:

```javascript
// Login controller
exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  
  // ... password verification ...
  
  // Create JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,        // ← Role embedded in token
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
};
```

---

## Frontend Authorization

The React frontend should also check roles before showing UI elements:

### Context for Current User

```javascript
// context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally verify token with backend
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Components

```javascript
// components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ component: Component, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component />;
}

export default ProtectedRoute;
```

### Conditional UI Rendering

```javascript
// pages/ManagerDashboard.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ManagerDashboard() {
  const { user } = useContext(AuthContext);

  // Only show manager/admin features
  if (!['manager', 'admin'].includes(user?.role)) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Pending Leave Requests</h1>
      {/* Manager-only content */}
    </div>
  );
}

export default ManagerDashboard;
```

### Conditional Menu Items

```javascript
// components/Sidebar.jsx
function Sidebar({ user }) {
  return (
    <nav>
      {/* Everyone can see these */}
      <a href="/dashboard">Dashboard</a>
      <a href="/my-leaves">My Leaves</a>

      {/* Only managers and admins */}
      {['manager', 'admin'].includes(user?.role) && (
        <a href="/manager">Pending Reviews</a>
      )}

      {/* Only admins */}
      {user?.role === 'admin' && (
        <>
          <a href="/admin/calendar">Company Calendar</a>
          <a href="/admin/balances">Manage Balances</a>
          <a href="/admin/reports">Generate Reports</a>
          <a href="/admin/users">User Management</a>
        </>
      )}
    </nav>
  );
}
```

---

## API Response Handling

Handle authorization errors gracefully:

```javascript
// utils/errorHandler.js
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // User doesn't have permission
    return 'You do not have permission to perform this action';
  } else if (error.response?.status === 404) {
    return 'Resource not found';
  } else {
    return error.response?.data?.message || 'An error occurred';
  }
};

export default handleApiError;
```

---

## Role Hierarchy

Think of roles in a hierarchy:

```
admin (highest privileges)
  ↑
  └── can do everything an employee/manager can do

manager
  ↑
  └── can do everything an employee can do

employee (baseline)
```

This means:
- Admins can test as employees or managers
- Managers can test as employees
- Employees have the most restricted access

---

## Changing User Roles

Only admins can change user roles:

```javascript
exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  if (!['employee', 'manager', 'admin'].includes(newRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  );

  // Note: User's existing tokens remain valid with old role
  // They'll get new token with new role on next login
  res.json({
    success: true,
    message: 'User role updated. User must log in again.',
    data: user
  });
};
```

---

## Security Best Practices

### Do's ✅
- Always verify JWT token is valid and not expired
- Always check role in protected routes
- Store JWT securely (httpOnly cookie preferred over localStorage)
- Log all sensitive actions for audit trail
- Expire tokens regularly (7-30 days)
- Use HTTPS in production

### Don'ts ❌
- Don't store sensitive data in JWT (it's readable)
- Don't trust role from frontend alone - always verify on backend
- Don't allow role changes without proper authorization
- Don't expose error messages that leak information
- Don't store passwords in plain text (always hash with bcrypt)
- Don't mix authentication and authorization checks

