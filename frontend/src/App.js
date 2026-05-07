import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SubmitLeavePage from './pages/SubmitLeavePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/submit-leave" />} />
          <Route path="/submit-leave" element={<SubmitLeavePage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
