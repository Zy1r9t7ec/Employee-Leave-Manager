# JSP Report Module

This section covers the monthly leave report generation using Java Server Pages (JSP).

---

## How the Integration Works

The Node.js backend and Tomcat (JSP) server are two separate servers. Here is the flow:

```
HR Admin clicks "Generate Report"
         │
         ▼
React calls: GET /api/admin/report?month=3&year=2024
         │
         ▼
Express backend fetches report data from MongoDB
         │
         ▼
Express calls Tomcat JSP URL with data as query params or POST body:
  http://localhost:8080/reports/monthly.jsp?month=3&year=2024&data=...
         │
         ▼
JSP renders HTML report using the data
         │
         ▼
Tomcat returns the HTML to Express
Express forwards it back to React (or returns the JSP URL)
         │
         ▼
React opens the report in a new browser tab
```

---

## Backend Implementation

### Express Route for Report Generation

Create `routes/admin.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Only HR Admin can access
router.get('/report', protect, restrictTo('admin'), generateReport);

module.exports = router;
```

### Controller Function

Create `controllers/admin.controller.js`:

```javascript
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const axios = require('axios');

exports.generateReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year parameters are required'
      });
    }
    
    // Fetch all approved leaves for the given month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const approvedLeaves = await LeaveRequest.find({
      status: 'Approved',
      startDate: { $gte: startDate },
      endDate: { $lte: endDate }
    }).populate('employeeId');
    
    // Group leaves by department
    const departmentData = {};
    for (const leave of approvedLeaves) {
      const dept = leave.employeeId.department;
      if (!departmentData[dept]) {
        departmentData[dept] = {
          name: dept,
          totalEmployees: 0,
          totalDays: 0,
          leaveBreakdown: { annual: 0, sick: 0, unpaid: 0 }
        };
      }
      departmentData[dept].totalDays += leave.durationDays;
      departmentData[dept].leaveBreakdown[leave.leaveType]++;
    }
    
    // Get unique employees per department
    for (const leave of approvedLeaves) {
      const dept = leave.employeeId.department;
      // Count unique employees (simplified)
    }
    
    // Prepare data for JSP
    const reportData = {
      month: month,
      year: year,
      generatedDate: new Date().toLocaleDateString(),
      departments: Object.values(departmentData),
      allLeaves: approvedLeaves.map(leave => ({
        employeeName: leave.employeeId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate.toLocaleDateString(),
        endDate: leave.endDate.toLocaleDateString(),
        duration: leave.durationDays,
        department: leave.employeeId.department
      })),
      totalCompanyDays: approvedLeaves.reduce((sum, l) => sum + l.durationDays, 0)
    };
    
    // Option 1: Call JSP server and get rendered HTML
    try {
      const jspResponse = await axios.get('http://localhost:8080/reports/monthly.jsp', {
        params: { data: JSON.stringify(reportData) }
      });
      
      res.json({
        success: true,
        reportUrl: `http://localhost:8080/reports/monthly.jsp?data=${encodeURIComponent(JSON.stringify(reportData))}`
      });
    } catch (error) {
      // Fallback: return data and let frontend open URL
      res.json({
        success: true,
        reportUrl: `http://localhost:8080/reports/monthly.jsp?data=${encodeURIComponent(JSON.stringify(reportData))}`
      });
    }
    
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};
```

---

## JSP Implementation

### Sample JSP File: `monthly.jsp`

Create this file in Apache Tomcat at: `/usr/local/tomcat/webapps/reports/monthly.jsp`

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.*" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="org.json.*" %>

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Monthly Leave Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background-color: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #007bff;
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #007bff;
      font-size: 28px;
    }
    
    .header-info {
      text-align: right;
      font-size: 14px;
      color: #666;
    }
    
    .report-period {
      background-color: #f0f8ff;
      padding: 15px;
      border-left: 4px solid #007bff;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    
    .report-period p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    .report-period b {
      color: #007bff;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      background-color: #007bff;
      color: white;
      padding: 12px 15px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    table thead {
      background-color: #e8e8e8;
    }
    
    table th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ccc;
    }
    
    table td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    
    table tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    table tbody tr:hover {
      background-color: #f0f8ff;
    }
    
    .total-row {
      background-color: #e8e8e8;
      font-weight: bold;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 4px solid #007bff;
      border-radius: 4px;
    }
    
    .summary-card h3 {
      color: #007bff;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    
    .print-button {
      background-color: #007bff;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .print-button:hover {
      background-color: #0056b3;
    }
    
    @media print {
      body { background-color: white; }
      .print-button { display: none; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <button class="print-button" onclick="window.print()">🖨️ Print Report</button>
    
    <%
      try {
        String data = request.getParameter("data");
        
        if (data == null || data.isEmpty()) {
          out.println("<p style='color: red;'>No report data provided.</p>");
        } else {
          JSONObject reportData = new JSONObject(java.net.URLDecoder.decode(data, "UTF-8"));
          
          String month = reportData.optString("month");
          String year = reportData.optString("year");
          String generatedDate = reportData.optString("generatedDate");
          
          String[] monthNames = {"", "January", "February", "March", "April", "May", "June", 
                                "July", "August", "September", "October", "November", "December"};
          String monthName = monthNames[Integer.parseInt(month)];
    %>
    
    <div class="header">
      <div>
        <h1>Monthly Leave Utilisation Report</h1>
        <p style="color: #666; margin-top: 5px;">Human Resources Department</p>
      </div>
      <div class="header-info">
        <p>Report Generated: <%= generatedDate %></p>
        <p style="margin-top: 5px; font-weight: bold;">Company Confidential</p>
      </div>
    </div>
    
    <div class="report-period">
      <p><b>Reporting Period:</b> <%= monthName %> <%= year %></p>
      <p><b>Generated On:</b> <%= new java.text.SimpleDateFormat("dd-MM-yyyy HH:mm").format(new java.util.Date()) %></p>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <h3>Total Leave Days</h3>
        <div class="value"><%= reportData.optInt("totalCompanyDays", 0) %></div>
      </div>
      <div class="summary-card">
        <h3>Departments</h3>
        <div class="value"><%= reportData.optJSONArray("departments").length() %></div>
      </div>
      <div class="summary-card">
        <h3>Total Records</h3>
        <div class="value"><%= reportData.optJSONArray("allLeaves").length() %></div>
      </div>
    </div>
    
    <!-- Department Summary Table -->
    <div class="section">
      <div class="section-title">Leave Summary by Department</div>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th style="text-align: center;">Total Leave Days</th>
            <th style="text-align: center;">Annual</th>
            <th style="text-align: center;">Sick</th>
            <th style="text-align: center;">Unpaid</th>
          </tr>
        </thead>
        <tbody>
          <%
            JSONArray departments = reportData.optJSONArray("departments");
            if (departments != null) {
              for (int i = 0; i < departments.length(); i++) {
                JSONObject dept = departments.getJSONObject(i);
                JSONObject breakdown = dept.optJSONObject("leaveBreakdown");
          %>
          <tr>
            <td><b><%= dept.optString("name") %></b></td>
            <td style="text-align: center;"><%= dept.optInt("totalDays", 0) %></td>
            <td style="text-align: center;"><%= breakdown.optInt("annual", 0) %></td>
            <td style="text-align: center;"><%= breakdown.optInt("sick", 0) %></td>
            <td style="text-align: center;"><%= breakdown.optInt("unpaid", 0) %></td>
          </tr>
          <%
              }
            }
          %>
        </tbody>
      </table>
    </div>
    
    <!-- Individual Leave Records -->
    <div class="section">
      <div class="section-title">Individual Leave Records</div>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Leave Type</th>
            <th>From</th>
            <th>To</th>
            <th style="text-align: center;">Days</th>
          </tr>
        </thead>
        <tbody>
          <%
            JSONArray leaves = reportData.optJSONArray("allLeaves");
            int totalDays = 0;
            if (leaves != null) {
              for (int i = 0; i < leaves.length(); i++) {
                JSONObject leave = leaves.getJSONObject(i);
                totalDays += leave.optInt("duration", 0);
          %>
          <tr>
            <td><%= leave.optString("employeeName") %></td>
            <td><%= leave.optString("department") %></td>
            <td><span style="padding: 4px 8px; background-color: #e3f2fd; border-radius: 3px;"><%= leave.optString("leaveType") %></span></td>
            <td><%= leave.optString("startDate") %></td>
            <td><%= leave.optString("endDate") %></td>
            <td style="text-align: center;"><%= leave.optInt("duration", 0) %></td>
          </tr>
          <%
              }
            }
          %>
          <tr class="total-row">
            <td colspan="5">TOTAL</td>
            <td style="text-align: center;"><%= totalDays %></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This is an official document of the Human Resources Department.</p>
      <p>For questions regarding this report, please contact HR at hr@company.com</p>
      <p style="margin-top: 10px;">Generated by Employee Leave Management System</p>
    </div>
    
    <%
        }
      } catch (Exception e) {
        out.println("<p style='color: red;'>Error processing report: " + e.getMessage() + "</p>");
      }
    %>
  </div>
</body>
</html>
```

---

## Setting Up Apache Tomcat

### Step 1: Download and Install Tomcat

```bash
# On Mac with Homebrew
brew install tomcat

# Or download from: https://tomcat.apache.org/download-10.cgi
# Extract to /usr/local/tomcat (or your preferred location)
```

### Step 2: Create Report Directory

```bash
mkdir -p /usr/local/tomcat/webapps/reports
```

### Step 3: Place JSP File

Copy your `monthly.jsp` file to `/usr/local/tomcat/webapps/reports/`

### Step 4: Start Tomcat

```bash
# On Mac/Linux
/usr/local/tomcat/bin/startup.sh

# On Windows
C:\tomcat\bin\startup.bat

# Verify it's running: http://localhost:8080
```

### Step 5: Test JSP

Visit in browser: `http://localhost:8080/reports/monthly.jsp?data={"month":"3","year":"2024","generatedDate":"12/03/2024","departments":[],"allLeaves":[],"totalCompanyDays":0}`

---

## Frontend Integration

### React Component to Generate Report

Create `pages/AdminPanel/ReportGenerator.jsx`:

```javascript
import React, { useState } from 'react';
import axios from '../../api/axios';

const ReportGenerator = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/report', {
        params: { month, year }
      });
      
      if (response.data.success) {
        // Open report in new tab
        window.open(response.data.reportUrl, '_blank');
      }
    } catch (error) {
      alert('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Monthly Report</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Month:
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{['', 'January', 'February', ...][i + 1]}</option>
            ))}
          </select>
        </label>
        
        <label style={{ marginLeft: '20px' }}>
          Year:
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>
      
      <button 
        onClick={handleGenerateReport}
        disabled={loading}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  );
};

export default ReportGenerator;
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| JSP page shows blank | Check Tomcat logs: `/usr/local/tomcat/logs/catalina.out` |
| 404 error for `.jsp` | Verify file location and Tomcat is running |
| JSON parsing error in JSP | Ensure data parameter is URL-encoded |
| Can't connect to Tomcat | Check if port 8080 is available; verify `startup.sh` ran successfully |

