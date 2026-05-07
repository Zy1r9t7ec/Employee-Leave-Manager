import React from 'react';
import LeaveRequestForm from '../components/LeaveRequestForm';

const SubmitLeavePage = () => {
  return (
    <div className="page-layout">
      <header className="page-header">
        <h1 className="page-title">Leave Management System</h1>
        <p className="page-subtitle">Submit and track employee time off requests</p>
      </header>
      <main className="page-content">
        <LeaveRequestForm />
      </main>
    </div>
  );
};

export default SubmitLeavePage;
