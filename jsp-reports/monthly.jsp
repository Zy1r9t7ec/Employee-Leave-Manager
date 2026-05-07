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
    <button class="print-button" onclick="window.print()">Print Report</button>
    
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
