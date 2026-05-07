# API Endpoint Reference

These are all the backend routes that React will call. The format is `METHOD /path — What it does`.

---

## Authentication Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| POST | `/api/auth/login` | All | Login with email + password. Returns a JWT token. |
| POST | `/api/auth/logout` | Logged-in users | Invalidates the session |
| GET | `/api/auth/me` | Logged-in users | Returns the currently logged-in user's profile |

### Example Requests & Responses

**POST /api/auth/login**
```json
// Request Body
{
  "email": "john@company.com",
  "password": "password123"
}

// Response (200 OK)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f2b1a0c45e1200123abc11",
    "name": "John Smith",
    "email": "john@company.com",
    "role": "employee",
    "department": "Engineering"
  }
}

// Response (401 Unauthorized)
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Leave Request Routes

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

### Example Requests & Responses

**POST /api/leaves**
```json
// Request Body
{
  "leaveType": "annual",
  "startDate": "2024-03-10",
  "endDate": "2024-03-14",
  "reason": "Family vacation"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "_id": "64f3a7b2c45e1200123abcde",
    "employeeId": "64f2b1a0c45e1200123abc11",
    "leaveType": "annual",
    "startDate": "2024-03-10",
    "endDate": "2024-03-14",
    "durationDays": 5,
    "status": "Pending",
    "submittedAt": "2024-03-01T09:00:00.000Z"
  }
}

// Response (400 Bad Request - insufficient balance)
{
  "success": false,
  "message": "Insufficient annual leave balance. Available: 3 days, Requested: 5 days"
}
```

**PATCH /api/leaves/:id/approve**
```json
// Request Body (comment optional)
{
  "comment": "Approved, have a great vacation!"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "64f3a7b2c45e1200123abcde",
    "status": "Approved",
    "managerComment": "Approved, have a great vacation!",
    "reviewedAt": "2024-03-02T14:30:00.000Z"
  }
}
```

**PATCH /api/leaves/:id/reject**
```json
// Request Body (comment required)
{
  "comment": "Cannot approve due to project deadline"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "64f3a7b2c45e1200123abcde",
    "status": "Rejected",
    "managerComment": "Cannot approve due to project deadline",
    "reviewedAt": "2024-03-02T14:30:00.000Z"
  }
}

// Response (400 Bad Request - no comment)
{
  "success": false,
  "message": "Comment is required when rejecting a leave request"
}
```

---

## Leave Balance Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| GET | `/api/balances/my` | Employee | Get own leave balance for current year |
| GET | `/api/balances/:employeeId` | HR Admin | Get a specific employee's balance |
| GET | `/api/balances` | HR Admin | Get all employees' balances |
| PATCH | `/api/balances/:employeeId` | HR Admin | Manually adjust an employee's balance |

### Example Requests & Responses

**GET /api/balances/my**
```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "64f3b5c2c45e1200123abcd1",
    "employeeId": "64f2b1a0c45e1200123abc11",
    "year": 2024,
    "annual": {
      "total": 20,
      "used": 8,
      "remaining": 12
    },
    "sick": {
      "total": 10,
      "used": 2,
      "remaining": 8
    },
    "unpaid": {
      "used": 0
    }
  }
}
```

**PATCH /api/balances/:employeeId**
```json
// Request Body
{
  "annual": { "total": 20, "used": 5 },
  "reason": "Carryover from last year + new adjustment"
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "64f3b5c2c45e1200123abcd1",
    "annual": { "total": 20, "used": 5 }
  }
}
```

---

## Admin / HR Routes

| Method | Path | Who Can Call | Description |
|---|---|---|---|
| GET | `/api/admin/calendar` | HR Admin | Get all approved leaves for calendar view |
| GET | `/api/admin/report` | HR Admin | Trigger JSP report generation (passes data to Tomcat) |
| GET | `/api/admin/users` | HR Admin | Get all users |
| POST | `/api/admin/users` | HR Admin | Create a new user account |

### Example Requests & Responses

**GET /api/admin/calendar?month=3&year=2024**
```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "64f3a7b2c45e1200123abcde",
      "employeeId": "64f2b1a0c45e1200123abc11",
      "employeeName": "John Smith",
      "leaveType": "annual",
      "startDate": "2024-03-10",
      "endDate": "2024-03-14",
      "durationDays": 5,
      "department": "Engineering"
    }
  ]
}
```

**GET /api/admin/report?month=3&year=2024**
```json
// Response (200 OK) — returns JSP URL or report HTML
{
  "success": true,
  "reportUrl": "http://localhost:8080/reports/monthly.jsp?month=3&year=2024"
}
```

**POST /api/admin/users**
```json
// Request Body
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "temporaryPassword123",
  "role": "employee",
  "department": "Marketing",
  "managerId": "64f2b1a0c45e1200123abc11"
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "_id": "64f4c8d3c45e1200123abfgh",
    "name": "Jane Doe",
    "email": "jane@company.com",
    "role": "employee",
    "department": "Marketing"
  }
}
```

---

## Authentication: JWT Tokens

When you log in, the backend sends back a **JSON Web Token (JWT)** — a string that proves who you are. Your React app stores this token and sends it in every API request via the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### How to Use JWT in Axios (Frontend)

```javascript
// api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

### Error Responses

All endpoints return standard error responses:

```json
// Response (401 Unauthorized - invalid/expired token)
{
  "success": false,
  "message": "Not authenticated"
}

// Response (403 Forbidden - user doesn't have permission)
{
  "success": false,
  "message": "Not authorized to access this resource"
}

// Response (404 Not Found)
{
  "success": false,
  "message": "Leave request not found"
}

// Response (500 Internal Server Error)
{
  "success": false,
  "message": "An error occurred on the server"
}
```

---

## Testing API Endpoints

Use **Postman** or **Thunder Client** (VS Code extension) to test these endpoints:

1. Create a login request to get a JWT token
2. Copy the token into your other requests' Authorization header
3. Test each endpoint with sample data
4. Verify responses match the examples above

