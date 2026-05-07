# Glossary

A comprehensive reference of all technical terms and concepts used in this project.

---

## A

### API
**Application Programming Interface** — A set of URLs and rules that your frontend uses to communicate with the backend. Think of it as a contract: "If you send me this data at this URL, I'll respond with that data."

**Example:** `POST /api/leaves` — Send a new leave request to the backend API

### AXIOS
An npm package that makes HTTP requests easier. It's a modern alternative to the older `fetch()` function.

**Example:**
```javascript
axios.get('/api/leaves')
  .then(response => console.log(response.data));
```

### Authentication
The process of verifying **who you are**. When you log in with email and password, the backend verifies you're a real user and issues a token.

**Not to be confused with:** Authorization (see below)

### Authorization
The process of checking **what you can do**. Even if you're authenticated, you might not be authorized to approve leaves (if you're not a manager).

---

## B

### Backend
The server-side code that runs on a server (or your computer in development). The backend handles business logic, database queries, and sends responses to the frontend.

**Stack in this project:** Node.js + Express.js + MongoDB

### bcryptjs
An npm package that hashes passwords using a secure algorithm. Hashed passwords cannot be reversed, so even if the database is hacked, real passwords are protected.

**Why needed:** Never store plain text passwords in a database

### BSON
**Binary JSON** — MongoDB's internal format for storing JSON-like documents. You don't need to know the details; Mongoose handles it automatically.

### Backend for Frontend (BFF)
The Express.js server acts as a middleman between React (frontend) and MongoDB (database). React doesn't talk directly to MongoDB.

---

## C

### Collection
MongoDB's equivalent of a **table** in a SQL database. For example, the `users` collection stores all user documents.

### Component (React)
A reusable piece of UI. Think of it like a LEGO brick—components snap together to build pages.

**Example:** `<LeaveCard />` is a component that displays a single leave request

### CORS
**Cross-Origin Resource Sharing** — A security rule that allows a frontend on one port (3000) to talk to a backend on another port (5000).

**Without CORS:** React (port 3000) gets blocked when trying to call Express (port 5000)

### CREATE, READ, UPDATE, DELETE (CRUD)
The four basic database operations:
- **Create** — Add new data (INSERT)
- **Read** — Get existing data (SELECT)
- **Update** — Modify existing data (UPDATE)
- **Delete** — Remove data (DELETE)

---

## D

### Database
The storage system that persists all data. In this project: MongoDB.

**Without a database:** All data disappears when the server restarts

### Document (MongoDB)
MongoDB's equivalent of a **row** in a SQL database. A document is a JSON-like object with fields.

**Example:**
```json
{
  "_id": "12345",
  "employeeName": "John",
  "leaveType": "annual"
}
```

### dotenv
An npm package that loads environment variables from a `.env` file into your code.

**Example:** `process.env.JWT_SECRET` reads the value from `.env`

---

## E

### Environment Variables
Values that change between development, testing, and production (like API keys, database URLs). Stored in `.env` file, never committed to Git.

**Examples:** `PORT`, `MONGO_URI`, `JWT_SECRET`, `MAIL_PASSWORD`

### Express.js
A minimal web framework for Node.js that makes building APIs easy. Handles routing, middleware, request/response.

**Alternative frameworks:** Koa, Nest.js (but Express is most popular)

### Endpoint
A specific URL + HTTP method combination in your API.

**Example:** `POST /api/leaves` is an endpoint for creating a new leave

---

## F

### Frontend
The user-facing code that runs in the browser. The frontend displays the UI and sends requests to the backend.

**Stack in this project:** React.js + Axios

### Field
A property/attribute of a MongoDB document. Like a column in a SQL table.

**Example:** In a `users` collection, fields are: `name`, `email`, `role`, etc.

---

## H

### Hash (Password)
A one-way encryption of a password. When you log in, your entered password is hashed and compared against the stored hash.

**Security principle:** If database is hacked, plain passwords are never exposed

### Hooks (React)
Functions that let you use state and other features in React. Common ones: `useState`, `useEffect`, `useContext`

**Example:**
```javascript
const [count, setCount] = useState(0);
```

---

## J

### JSON
**JavaScript Object Notation** — A format for data: `{ "key": "value" }`. It's the standard format for APIs.

### JWT
**JSON Web Token** — A secure token string that proves who you are. Contains encoded information about the user (id, role, email).

**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## M

### Middleware
Code that runs **between** a request arriving and a response being sent. Used for authentication, validation, logging, error handling.

**Examples:**
```javascript
app.use(cors());           // Allow cross-origin requests
app.use(express.json());   // Parse JSON bodies
app.use(protect);          // Verify JWT token
```

### Model (Database)
A blueprint for data structure. In Mongoose, defines the fields and validation rules for a collection.

**Example:** `UserModel` defines that users must have `name`, `email`, `password` fields

### Model (MVC)
In MVC architecture: Models represent data (database layer), Views represent UI (frontend), Controllers represent business logic.

### Mongoose
An npm package that adds structure (schemas) and helper methods on top of MongoDB. Makes MongoDB easier to use in Node.js.

**Alternative:** Native MongoDB driver (lower level)

### MongoDB
A **NoSQL** document database. Stores data as JSON-like documents instead of rows/columns.

**Alternative:** PostgreSQL, MySQL (SQL databases)

---

## N

### Node.js
A JavaScript **runtime** that runs JavaScript on the server (outside of browsers). Enables JavaScript backend development.

**Alternative:** Python (Django, Flask), Java (Spring), etc.

### NoSQL
**Not Only SQL** — A type of database that doesn't use SQL queries. MongoDB is NoSQL.

**Alternative:** SQL databases like PostgreSQL

### Nodemailer
An npm package that sends emails from Node.js. Connects to an SMTP server.

### npm
**Node Package Manager** — The tool for installing JavaScript packages. Similar to Composer (PHP) or pip (Python).

**Command:** `npm install package-name`

---

## O

### Object-Relational Mapping (ORM)
A pattern for converting between object-oriented code and databases. Mongoose is similar (often called ODM—Object Document Mapper).

---

## P

### Postman
A tool for testing APIs. Send HTTP requests and see responses without writing code.

**Alternative:** Thunder Client (VS Code extension)

### Port
A number that identifies a service on a computer.

**Common ports in this project:**
- 3000 — React frontend
- 5000 — Express backend
- 27017 — MongoDB
- 8080 — Tomcat (JSP)

---

## R

### RBAC
**Role-Based Access Control** — Different users have different permissions based on their role (employee, manager, admin).

**Example:** Only managers can approve leaves

### REST API
**Representational State Transfer** — A style for building APIs using HTTP methods (GET, POST, PUT, DELETE) on URLs (resources).

**Not to be confused with:** GraphQL, SOAP (other API styles)

### Route (Backend)
A URL pattern + HTTP method that Express listens for.

**Example:** `app.get('/api/leaves', handler)` creates a route for `GET /api/leaves`

### Route (Frontend)
A URL pattern that React Router listens for (client-side navigation).

**Example:** When user visits `/manager`, React loads the ManagerDashboard page

---

## S

### Schema
A blueprint that defines the structure of data in a database. Mongoose schemas enforce structure (even though MongoDB is schemaless).

**Example:**
```javascript
const userSchema = new Schema({
  name: String,
  email: String
});
```

### SMTP
**Simple Mail Transfer Protocol** — The protocol for sending emails. Mailtrap and Gmail both provide SMTP servers.

### SQL
**Structured Query Language** — Language for querying databases. Used by PostgreSQL, MySQL, etc. (not MongoDB)

### State (React)
Data that a React component holds. When state changes, the UI updates automatically.

**Example:** When you approve a leave, the `status` state changes from "Pending" to "Approved"

---

## T

### Token (JWT)
See JWT above. A string that proves authentication.

### Tomcat
An Apache Java web server that runs JSP files. Used in this project for report generation.

### Transporter (Nodemailer)
The email-sending engine created by Nodemailer. Holds SMTP credentials and sends emails.

---

## U

### URL
**Uniform Resource Locator** — A web address. In this project: `http://localhost:3000` or `http://localhost:5000/api/leaves`

---

## V

### Validation
Checking that data meets requirements before saving. Example: Email format validation, date range checks.

**In this project:** Validate that end date >= start date, that balance is sufficient, etc.

### View (Frontend)
The UI that users see. In React, views are components/pages.

---

## W

### Working Days
Days from Monday to Friday, excluding weekends. When calculating leave duration, only count working days.

**Example:** Mar 10-14, 2024 = 5 working days (not 7, because Mar 10 is Sunday)

---

## X

### XML
**eXtensible Markup Language** — An older data format. You mostly won't see this in modern projects (JSON replaced it).

---

## Y

### YAML
A human-readable data format often used in configuration files. Less common in this project but may appear in deployment configs.

---

## Z

### Zero Downtime Deployment
Deploying updates without taking the server offline. Advanced topic not covered in this beginner project.

---

## Acronyms Cheat Sheet

| Acronym | Full Form | What It Does |
|---|---|---|
| API | Application Programming Interface | Bridge between frontend and backend |
| CRUD | Create, Read, Update, Delete | Four basic database operations |
| CORS | Cross-Origin Resource Sharing | Security rule for cross-port communication |
| JWT | JSON Web Token | Secure authentication token |
| RBAC | Role-Based Access Control | Permissions based on user roles |
| REST | Representational State Transfer | API design style using HTTP methods |
| SMTP | Simple Mail Transfer Protocol | Protocol for sending emails |
| SQL | Structured Query Language | Language for SQL databases |
| BSON | Binary JSON | MongoDB's internal format |
| ORM | Object-Relational Mapping | Bridge between code and database |
| ODM | Object Document Mapper | ORM for document databases (like Mongoose) |

---

## Common Phrases Explained

### "The backend validated the request"
The Express server checked that the incoming data is correct before saving to database.

### "The token expired"
The JWT token has a lifetime (e.g., 7 days). After that, user must log in again.

### "CORS blocked the request"
The frontend tried to call the backend on a different port, and the browser blocked it for security. Enable CORS on the backend to fix.

### "Balance insufficient"
Employee doesn't have enough leave days to make the requested request. They must request fewer days.

### "Middleware chain"
A series of middleware functions that run in order: authenticate → authorize → validate → process → respond.

### "Seeding the database"
Adding initial test data to the database (users, leave types, etc.) so you can start developing without manually creating data.

### "State management"
Storing and updating data that React components need. Done with `useState`, Context API, or Redux.

### "Mounting/Unmounting"
When a React component loads (mounts) or is removed (unmounts). Used to know when to fetch data.

---

## Further Learning

- **MDN Web Docs** — Learn JavaScript, React, HTTP
- **MongoDB Documentation** — Learn database queries
- **Express.js Guide** — Learn routing and middleware
- **React Official Docs** — Learn component patterns

