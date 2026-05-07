# Environment Setup Guide

Follow these steps exactly, in order. Do not skip steps. This guide assumes you're on macOS (with notes for Windows/Linux).

---

## Prerequisites — Install These First

### 1. Node.js (v18 or higher)

**Why:** Node.js is the JavaScript runtime that powers the Express backend.

**Installation:**
- Visit [nodejs.org](https://nodejs.org)
- Download the LTS (Long Term Support) version
- Run the installer and follow prompts
- Verify: Open Terminal and run `node --version` (should show v18 or higher)

```bash
$ node --version
v18.17.0
```

### 2. MongoDB Community Server

**Why:** MongoDB is the database that stores all leave data.

**Installation (Mac with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Verification:**
```bash
mongo --version
# Should show MongoDB version

# Test connection
mongosh
> show databases
```

**Installation (Windows):**
- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Run installer
- Choose "Install as a Service"
- MongoDB runs on port 27017

### 3. MongoDB Compass (Optional but Recommended)

**Why:** Graphical tool to visually browse MongoDB collections.

- Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- Helps debug database issues
- Can manually add test data

### 4. Java JDK 11 or Higher

**Why:** Required for Apache Tomcat (JSP report generation).

**Installation (Mac with Homebrew):**
```bash
brew install openjdk@11
```

**Verification:**
```bash
java -version
# Should show Java version 11+
```

### 5. Apache Tomcat 10

**Why:** Java web server that runs JSP report files.

**Installation (Mac with Homebrew):**
```bash
brew install tomcat
```

**Manual Installation:**
- Download from [tomcat.apache.org](https://tomcat.apache.org/download-10.cgi)
- Extract to `/usr/local/tomcat` (Mac/Linux) or `C:\tomcat` (Windows)

**Verification:**
```bash
# Start Tomcat
/usr/local/tomcat/bin/startup.sh

# Verify it's running: visit http://localhost:8080 in browser
# You should see Tomcat splash page
```

### 6. Git (for version control)

**Installation (Mac):**
```bash
brew install git
```

**Verification:**
```bash
git --version
```

### 7. VS Code (Recommended Editor)

- Download from [code.visualstudio.com](https://code.visualstudio.com)
- Install extensions:
  - ESLint (code linting)
  - Prettier (code formatting)
  - Thunder Client (API testing)
  - MongoDB for VS Code (optional)

---

## Step-by-Step Backend Setup

### Step 1: Create Backend Folder

```bash
mkdir employee-leave-management
cd employee-leave-management
mkdir backend
cd backend
```

### Step 2: Initialize Node Project

```bash
npm init -y
```

This creates `package.json` file.

### Step 3: Install Backend Dependencies

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken nodemailer cors
npm install --save-dev nodemon
```

**What each package does:**
- `express` - Web framework
- `mongoose` - MongoDB driver + schemas
- `dotenv` - Load environment variables
- `bcryptjs` - Hash passwords
- `jsonwebtoken` - Create JWT tokens
- `nodemailer` - Send emails
- `cors` - Allow frontend to call backend
- `nodemon` - Auto-restart server on file changes (dev only)

### Step 4: Create Directory Structure

```bash
mkdir config models routes controllers middleware utils seeds
```

### Step 5: Create `.env` File

Create file: `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/leavedb

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email (Mailtrap)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_username
MAIL_PASS=your_mailtrap_password
MAIL_FROM="HR System <hr@company.com>"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 6: Create `.env.example` (for Git)

Create file: `backend/.env.example`

```env
# Template only - copy this to .env and fill in your values
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/leavedb
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_pass
MAIL_FROM="HR System <hr@company.com>"
FRONTEND_URL=http://localhost:3000
```

### Step 7: Set Up Mailtrap for Email Testing

1. Visit [mailtrap.io](https://mailtrap.io) and sign up (free)
2. Go to **Email Testing** → **Inboxes**
3. Create an inbox (e.g., "Employee Leave System")
4. Click your inbox → **Show Credentials**
5. Copy SMTP settings into your `.env` file

### Step 8: Create Server Entry Point

Create file: `backend/server.js`

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// Routes (placeholder)
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 9: Update `package.json` Scripts

Edit `backend/package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 10: Test Backend Startup

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

---

## Step-by-Step Frontend Setup

### Step 1: Create React App

From project root:

```bash
cd employee-leave-management
npx create-react-app frontend
cd frontend
```

This takes 2-3 minutes.

### Step 2: Install Frontend Dependencies

```bash
npm install axios react-router-dom react-big-calendar moment
```

**What each package does:**
- `axios` - HTTP client for API calls
- `react-router-dom` - Client-side routing
- `react-big-calendar` - Calendar component
- `moment` - Date formatting (or use `date-fns`)

### Step 3: Configure Proxy for API Calls

Edit `frontend/package.json`:

```json
"proxy": "http://localhost:5000"
```

This allows `fetch('/api/...')` to call the backend automatically.

### Step 4: Create API Instance

Create file: `frontend/src/api/axios.js`

```javascript
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

### Step 5: Test Frontend Startup

```bash
npm start
```

Browser opens at `http://localhost:3000`. You should see React welcome screen.

---

## Step-by-Step Tomcat / JSP Setup

### Step 1: Verify Tomcat Installation

```bash
# Start Tomcat
/usr/local/tomcat/bin/startup.sh

# Visit http://localhost:8080 in browser
```

### Step 2: Create Reports Directory

```bash
mkdir -p /usr/local/tomcat/webapps/reports
```

### Step 3: Copy JSP Files

Copy `monthly.jsp` to `/usr/local/tomcat/webapps/reports/`

### Step 4: Restart Tomcat

```bash
/usr/local/tomcat/bin/shutdown.sh
/usr/local/tomcat/bin/startup.sh
```

### Step 5: Test JSP

Visit: `http://localhost:8080/reports/monthly.jsp`

You should see the JSP loads (may be empty if no data).

---

## Verify Everything is Running

Open three terminal windows and start each service:

**Terminal 1 - MongoDB:**
```bash
# MongoDB should auto-start with Homebrew, but if not:
brew services start mongodb-community
```

**Terminal 2 - Backend:**
```bash
cd employee-leave-management/backend
npm run dev
# Output: "Server running on port 5000"
```

**Terminal 3 - Frontend:**
```bash
cd employee-leave-management/frontend
npm start
# Browser opens at http://localhost:3000
```

**Check 4 - Tomcat:**
```bash
# Visit http://localhost:8080 in browser
# Should see Tomcat home page
```

If all four are running, you have a complete development environment!

---

## Troubleshooting

### MongoDB Won't Connect

```bash
# Check if MongoDB is running
brew services list
# Look for: mongodb-community

# Start it if stopped
brew services start mongodb-community

# Verify port 27017 is listening
lsof -i :27017
```

### Backend Crashes on Startup

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install
```

### React Can't Reach Backend

- Make sure backend is running on port 5000
- Check CORS is enabled in Express: `app.use(cors())`
- Check `.env` has correct MONGO_URI
- Look for errors in backend terminal

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>

# Same for port 5000
lsof -i :5000
kill -9 <PID>
```

### Tomcat Won't Start

```bash
# Check Java is installed
java -version

# Look at Tomcat logs
cat /usr/local/tomcat/logs/catalina.out

# Verify port 8080 is free
lsof -i :8080
```

---

## Environment Variables Checklist

Before running the app, verify your `.env` file has:

- ✅ PORT set (default 5000)
- ✅ MONGO_URI pointing to your MongoDB instance
- ✅ JWT_SECRET is a long random string
- ✅ MAIL credentials from Mailtrap
- ✅ FRONTEND_URL is http://localhost:3000

