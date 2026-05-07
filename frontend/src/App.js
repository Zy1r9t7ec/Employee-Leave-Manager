import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SubmitLeavePage from './pages/SubmitLeavePage';
import ManagerApprovalPage from './pages/ManagerApprovalPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminAllLeavesPage from './pages/AdminAllLeavesPage';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

// Default redirect based on role
const DefaultRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/all-leaves" replace />;
  if (user.role === 'manager') return <Navigate to="/approvals" replace />;
  return <Navigate to="/submit-leave" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DefaultRedirect />} />

      <Route path="/submit-leave" element={
        <ProtectedRoute allowedRoles={['employee', 'manager']}>
          <Layout><SubmitLeavePage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/approvals" element={
        <ProtectedRoute allowedRoles={['manager']}>
          <Layout><ManagerApprovalPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/all-leaves" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminAllLeavesPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminReportsPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
