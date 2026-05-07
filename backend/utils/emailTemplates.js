exports.leaveSubmittedConfirmation = (employee, leave) => ({
  subject: 'Leave Request Submitted - Pending Approval',
  html: `
    <h2>Hi ${employee.name},</h2>
    <p>Your leave request has been successfully submitted and is now pending manager approval.</p>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><b>Leave Type</b></td>
        <td style="border: 1px solid #ccc; padding: 8px;">${leave.leaveType}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><b>From</b></td>
        <td style="border: 1px solid #ccc; padding: 8px;">${new Date(leave.startDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><b>To</b></td>
        <td style="border: 1px solid #ccc; padding: 8px;">${new Date(leave.endDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;"><b>Duration</b></td>
        <td style="border: 1px solid #ccc; padding: 8px;">${leave.durationDays} day(s)</td>
      </tr>
    </table>
    <p>You will receive another email once your manager reviews your request.</p>
  `
});

exports.leaveApprovedEmail = (employee, leave, comment = '') => ({
  subject: '✅ Your Leave Request Has Been Approved',
  html: `
    <h2>Great news, ${employee.name}!</h2>
    <p>Your leave request has been <b>approved</b>!</p>
    <p>Period: ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</p>
    <p>Duration: ${leave.durationDays} day(s)</p>
    ${comment ? `<p><b>Manager Note:</b> ${comment}</p>` : ''}
  `
});

exports.leaveRejectedEmail = (employee, leave, comment) => ({
  subject: '❌ Your Leave Request Has Been Rejected',
  html: `
    <h2>Hi ${employee.name},</h2>
    <p>Unfortunately, your leave request has been <b>rejected</b>.</p>
    <p>Period: ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</p>
    <p><b>Reason:</b> ${comment}</p>
    <p>Please contact your manager if you have questions.</p>
  `
});
