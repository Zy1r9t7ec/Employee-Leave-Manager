import React, { useState, useEffect } from 'react';
import api from '../api';

const statusConfig = {
  Pending:  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Pending Approval' },
  Approved: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'Approved' },
  Rejected: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Rejected' },
};

const leaveTypeLabel = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
};

const UpcomingLeaves = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/leaves/my-history');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Show leaves where endDate >= today AND status is not Rejected/Cancelled
        const upcoming = (res.data.data || []).filter(l => {
          const end = new Date(l.endDate);
          return end >= today && l.status !== 'Rejected' && l.status !== 'Cancelled';
        });
        setLeaves(upcoming);
      } catch (err) {
        console.error('Failed to fetch upcoming leaves', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshTrigger]);

  if (loading || leaves.length === 0) return null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getDaysUntil = (startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const diff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Ongoing';
    if (diff === 0) return 'Starts today';
    if (diff === 1) return 'Starts tomorrow';
    return `Starts in ${diff} days`;
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '28px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            Upcoming Leaves
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
            Active and pending requests with future dates
          </p>
        </div>
        <span style={{
          background: '#eff6ff', color: '#1d4ed8', fontSize: '12px',
          fontWeight: '600', padding: '4px 10px', borderRadius: '9999px'
        }}>
          {leaves.length} {leaves.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      <div style={{ padding: '8px 0' }}>
        {leaves.map((leave, idx) => {
          const cfg = statusConfig[leave.status] || statusConfig.Pending;
          return (
            <div key={leave._id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: idx < leaves.length - 1 ? '1px solid #f8fafc' : 'none',
              gap: '16px',
              transition: 'background 0.15s'
            }}>
              {/* Color bar */}
              <div style={{
                width: '4px', height: '48px', borderRadius: '2px',
                backgroundColor: cfg.border, flexShrink: 0
              }} />

              {/* Leave type icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: cfg.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px', flexShrink: 0
              }}>
                {leave.leaveType === 'annual' ? 'A' : leave.leaveType === 'sick' ? 'S' : 'U'}
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b' }}>
                    {leaveTypeLabel[leave.leaveType]}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600',
                    backgroundColor: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.4px'
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
                  <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                    ({leave.durationDays} working {leave.durationDays === 1 ? 'day' : 'days'})
                  </span>
                </div>
                {leave.reason && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                    Reason: {leave.reason}
                  </div>
                )}
              </div>

              {/* Days countdown */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: '12px', fontWeight: '600', color: cfg.color,
                  padding: '4px 10px', background: cfg.bg, borderRadius: '6px'
                }}>
                  {getDaysUntil(leave.startDate)}
                </div>
                {leave.status === 'Pending' && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Awaiting manager review
                  </div>
                )}
                {leave.status === 'Approved' && leave.managerComment && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Note: {leave.managerComment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingLeaves;
