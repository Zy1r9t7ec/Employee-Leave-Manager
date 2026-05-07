import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleBadgeColor = {
    employee: { bg: '#dbeafe', color: '#1d4ed8' },
    manager: { bg: '#d1fae5', color: '#065f46' },
    admin: { bg: '#fef3c7', color: '#92400e' }
  };
  const badge = roleBadgeColor[user?.role] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">ELM</div>
          <span className="brand-name">Leave Management</span>
        </div>

        <div className="navbar-menu">
          {/* Non-admins can apply for leave */}
          {user?.role !== 'admin' && (
            <Link
              to="/submit-leave"
              className={`nav-item ${location.pathname === '/submit-leave' ? 'active' : ''}`}
            >
              Apply for Leave
            </Link>
          )}

          {/* Only managers see pending approvals */}
          {user?.role === 'manager' && (
            <Link
              to="/approvals"
              className={`nav-item ${location.pathname === '/approvals' ? 'active' : ''}`}
            >
              Pending Approvals
            </Link>
          )}

          {/* HR Admin features */}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/all-leaves"
                className={`nav-item ${location.pathname === '/admin/all-leaves' ? 'active' : ''}`}
              >
                Watch Leave Applications
              </Link>
              <Link
                to="/admin/reports"
                className={`nav-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}
              >
                HR Reports
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div style={{
              fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.5px', padding: '1px 6px', borderRadius: '4px',
              backgroundColor: badge.bg, color: badge.color, display: 'inline-block'
            }}>
              {user?.role}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            marginLeft: '12px', padding: '7px 14px', border: '1px solid #e2e8f0',
            borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', color: '#475569', fontFamily: 'inherit', transition: 'all 0.2s'
          }}>
            Sign Out
          </button>
        </div>
      </nav>
      <div className="main-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default Layout;
