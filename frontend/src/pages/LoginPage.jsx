import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', loginForm);
      login(res.data.token, res.data.data);
      // Redirect based on role
      const role = res.data.data.role;
      if (role === 'admin') navigate('/admin/reports');
      else if (role === 'manager') navigate('/approvals');
      else navigate('/submit-leave');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', registerForm);
      login(res.data.token, res.data.data);
      navigate('/submit-leave');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f4c81 0%, #1e40af 50%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', backdropFilter: 'blur(10px)',
            fontSize: '22px', fontWeight: '700', color: '#fff', letterSpacing: '1px'
          }}>ELM</div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            Employee Leave Manager
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px', fontSize: '14px' }}>
            Corporate Leave Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '28px'
          }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                flex: 1, padding: '12px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', textTransform: 'capitalize',
                color: tab === t ? '#1d4ed8' : '#94a3b8',
                borderBottom: tab === t ? '2px solid #1d4ed8' : '2px solid transparent',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}>{t === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', color: '#dc2626', fontSize: '14px', marginBottom: '20px'
            }}>{error}</div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email" required
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="you@company.com"
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit', transition: 'border-color 0.2s'
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password" required
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', background: '#1d4ed8', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit', transition: 'background 0.2s'
              }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
                Demo accounts: employee@company.com / manager@company.com / admin@company.com (password: <strong>password123</strong>)
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Full Name</label>
                <input type="text" required value={registerForm.name}
                  onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="John Smith"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Email Address</label>
                <input type="email" required value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="you@company.com"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Password</label>
                <input type="password" required value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Role</label>
                  <select value={registerForm.role}
                    onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' }}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">HR Admin</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '500', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Department</label>
                  <input type="text" value={registerForm.department}
                    onChange={e => setRegisterForm({ ...registerForm, department: e.target.value })}
                    placeholder="Engineering"
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', background: '#1d4ed8', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                fontFamily: 'inherit', marginTop: '8px'
              }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
