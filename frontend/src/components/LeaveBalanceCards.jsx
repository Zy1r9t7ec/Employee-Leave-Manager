import React, { useState, useEffect } from 'react';
import api from '../api';

const LeaveBalanceCards = ({ refreshTrigger }) => {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [balRes, historyRes] = await Promise.all([
          api.get('/api/balances/my-balance', { headers }),
          api.get('/api/leaves/my-history', { headers })
        ]);

        setBalance(balRes.data.data);
        setHistory(historyRes.data.data || []);
      } catch (err) {
        console.error('Failed to load balance/history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', height: '120px', opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (!balance) return null;

  const annualRemaining = balance.annual.total - balance.annual.used;
  const sickRemaining = balance.sick.total - balance.sick.used;
  const annualPct = balance.annual.total > 0 ? (balance.annual.used / balance.annual.total) * 100 : 0;
  const sickPct = balance.sick.total > 0 ? (balance.sick.used / balance.sick.total) * 100 : 0;

  const statusColor = {
    Pending: { bg: '#fef3c7', color: '#d97706' },
    Approved: { bg: '#d1fae5', color: '#059669' },
    Rejected: { bg: '#fee2e2', color: '#dc2626' },
    Cancelled: { bg: '#f1f5f9', color: '#64748b' }
  };

  return (
    <div>
      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>

        {/* Annual Leave */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Leave</span>
            <span style={{ width: '32px', height: '32px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>A</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '40px', fontWeight: '700', color: '#1d4ed8', lineHeight: 1 }}>{annualRemaining}</span>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ {balance.annual.total} days</span>
          </div>
          <div style={{ backgroundColor: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${annualPct}%`, backgroundColor: '#3b82f6', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span>{balance.annual.used} days used</span>
            <span>{annualRemaining} remaining</span>
          </div>
        </div>

        {/* Sick Leave */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sick Leave</span>
            <span style={{ width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>S</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '40px', fontWeight: '700', color: '#059669', lineHeight: 1 }}>{sickRemaining}</span>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ {balance.sick.total} days</span>
          </div>
          <div style={{ backgroundColor: '#f1f5f9', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${sickPct}%`, backgroundColor: '#10b981', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
            <span>{balance.sick.used} days used</span>
            <span>{sickRemaining} remaining</span>
          </div>
        </div>

        {/* Unpaid Leave */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unpaid Leave</span>
            <span style={{ width: '32px', height: '32px', background: '#fffbeb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>U</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '40px', fontWeight: '700', color: '#d97706', lineHeight: 1 }}>{balance.unpaid.used}</span>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>days taken</span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginTop: '8px' }}>
            No quota limit. Requires manager approval.
          </p>
        </div>
      </div>

      {/* Leave History */}
      {history.length > 0 && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '30px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>My Leave History</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Reason'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(req => (
                  <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 24px', textTransform: 'capitalize', fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>{req.leaveType}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#475569' }}>{new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#475569' }}>{new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#475569' }}>{req.durationDays} day{req.durationDays !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: statusColor[req.status]?.bg || '#f1f5f9',
                        color: statusColor[req.status]?.color || '#64748b'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '14px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {req.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalanceCards;
