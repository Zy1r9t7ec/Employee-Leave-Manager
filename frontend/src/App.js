import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SubmitLeavePage from './pages/SubmitLeavePage';
import ManagerApprovalPage from './pages/ManagerApprovalPage';
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/submit-leave" />} />
          <Route path="/submit-leave" element={<SubmitLeavePage />} />
          <Route path="/approvals" element={<ManagerApprovalPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
