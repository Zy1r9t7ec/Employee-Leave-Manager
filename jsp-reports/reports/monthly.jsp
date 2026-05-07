<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
  <title>Monthly Leave Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #007bff; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h1>Monthly Leave Utilisation Report</h1>
  <p>Generated: <%= new java.util.Date() %></p>
  
  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Leave Type</th>
        <th>From Date</th>
        <th>To Date</th>
        <th>Days</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="5" style="text-align: center;">No data available</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
