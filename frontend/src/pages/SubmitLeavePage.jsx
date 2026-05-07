import React, { useState } from 'react';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveBalanceCards from '../components/LeaveBalanceCards';
import UpcomingLeaves from '../components/UpcomingLeaves';

const SubmitLeavePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="page-layout">
      <header className="page-header">
        <h1 className="page-title">Leave Dashboard</h1>
        <p className="page-subtitle">View your balance and submit time off requests</p>
      </header>
      <main className="page-content">
        <LeaveBalanceCards refreshTrigger={refreshTrigger} />
        <UpcomingLeaves refreshTrigger={refreshTrigger} />
        <LeaveRequestForm onSuccess={handleRefresh} />
      </main>
    </div>
  );
};

export default SubmitLeavePage;
