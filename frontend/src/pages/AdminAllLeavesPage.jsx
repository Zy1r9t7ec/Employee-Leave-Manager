import React, { useState, useEffect } from 'react';
import api from '../api';

const statusColor = {
  Pending: { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  Approved: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  Cancelled: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' }
};

const leaveTypeLabel = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
};

const AdminAllLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAllLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/leaves');
      setLeaves(res.data.data || []);
      setFilteredLeaves(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leave applications. Ensure you are signed in as an HR Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let result = leaves;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.employeeId?.name?.toLowerCase().includes(term) ||
        l.employeeId?.email?.toLowerCase().includes(term) ||
        l.reason?.toLowerCase().includes(term)
      );
    }

    if (deptFilter) {
      result = result.filter(l => l.employeeId?.department === deptFilter);
    }

    if (typeFilter) {
      result = result.filter(l => l.leaveType === typeFilter);
    }

    if (statusFilter) {
      result = result.filter(l => l.status === statusFilter);
    }

    setFilteredLeaves(result);
  }, [leaves, searchTerm, deptFilter, typeFilter, statusFilter]);

  // Extract unique departments for dropdown
  const uniqueDepts = [...new Set(leaves.map(l => l.employeeId?.department).filter(Boolean))];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="page-layout" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          Watch Leave Applications
        </h1>
        <p className="page-subtitle" style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          Overview of all submitted, approved, and rejected leave requests across the company.
        </p>
      </header>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Filters Card */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'
      }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Search Employee / Reason</label>
          <input
            type="text" placeholder="Type name, email, or reason..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Department Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Department</label>
          <select
            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          >
            <option value="">All Departments</option>
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Leave Type Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Leave Type</label>
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          >
            <option value="">All Leave Types</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Status</label>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading leave records...</div>
        ) : filteredLeaves.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No matching leave applications found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Employee', 'Department', 'Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Reason'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(l => {
                  const cfg = statusColor[l.status] || { bg: '#f1f5f9', color: '#475569' };
                  return (
                    <tr key={l._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      {/* Employee Info */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{l.employeeId?.name || 'Deleted User'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{l.employeeId?.email}</div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#334155' }}>
                        {l.employeeId?.department || 'Unassigned'}
                      </td>

                      {/* Type */}
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                        {leaveTypeLabel[l.leaveType]}
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569' }}>{formatDate(l.startDate)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569' }}>{formatDate(l.endDate)}</td>

                      {/* Duration */}
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>
                        {l.durationDays} {l.durationDays === 1 ? 'day' : 'days'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                          textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>
                          {l.status}
                        </span>
                      </td>

                      {/* Reason */}
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {l.reason || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAllLeavesPage;
