import React from 'react';
import PendingRequestsTable from '../components/PendingRequestsTable';

const ManagerApprovalPage = () => {
  return (
    <div className="page-layout">
      <header className="page-header">
        <h1 className="page-title">Manager Dashboard</h1>
        <p className="page-subtitle">Review and manage team leave requests</p>
      </header>
      <main className="page-content">
        <PendingRequestsTable />
      </main>
    </div>
  );
};

export default ManagerApprovalPage;
