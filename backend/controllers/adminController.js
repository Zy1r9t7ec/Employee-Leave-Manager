const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const axios = require('axios');

exports.generateReport = async (req, res, next) => {
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
      if (!leave.employeeId) continue;
      const dept = leave.employeeId.department || 'Unassigned';
      if (!departmentData[dept]) {
        departmentData[dept] = {
          name: dept,
          totalEmployees: 0,
          totalDays: 0,
          leaveBreakdown: { annual: 0, sick: 0, unpaid: 0 }
        };
      }
      departmentData[dept].totalDays += leave.durationDays;
      if (departmentData[dept].leaveBreakdown[leave.leaveType] !== undefined) {
        departmentData[dept].leaveBreakdown[leave.leaveType]++;
      }
    }
    
    // Prepare data for JSP
    const reportData = {
      month: month,
      year: year,
      generatedDate: new Date().toLocaleDateString(),
      departments: Object.values(departmentData),
      allLeaves: approvedLeaves.filter(l => l.employeeId).map(leave => ({
        employeeName: leave.employeeId.name,
        leaveType: leave.leaveType,
        startDate: leave.startDate.toLocaleDateString(),
        endDate: leave.endDate.toLocaleDateString(),
        duration: leave.durationDays,
        department: leave.employeeId.department || 'Unassigned'
      })),
      totalCompanyDays: approvedLeaves.reduce((sum, l) => sum + l.durationDays, 0)
    };
    
    // We return the URL that points to the Tomcat JSP server.
    // In production this URL would point to the real Tomcat server.
    const tomcatUrl = process.env.TOMCAT_URL || 'http://localhost:8080';
    res.json({
      success: true,
      reportUrl: `${tomcatUrl}/reports/monthly.jsp?data=${encodeURIComponent(JSON.stringify(reportData))}`
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    next(error);
  }
};
