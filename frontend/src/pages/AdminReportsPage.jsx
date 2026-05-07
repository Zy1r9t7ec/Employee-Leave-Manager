import React, { useState } from 'react';
import api from '../api';

const AdminReportsPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      setReport(null);
      
      const response = await api.get('/api/admin/report', {
        params: { month, year },
      });
      
      if (response.data.success) {
        setReport(response.data.reportData);
        // Attempt to open official Tomcat report link as an extra option
        try {
          window.open(response.data.reportUrl, '_blank');
        } catch (e) {
          console.warn('Popup blocked or Tomcat unavailable', e);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!report || !report.allLeaves || report.allLeaves.length === 0) return;

    const headers = ['Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Duration (Days)'];
    const csvRows = [headers.join(',')];

    for (const leave of report.allLeaves) {
      const row = [
        `"${leave.employeeName.replace(/"/g, '""')}"`,
        `"${leave.department.replace(/"/g, '""')}"`,
        `"${leave.leaveType}"`,
        leave.startDate,
        leave.endDate,
        leave.duration
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Leave_Report_${month}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="page-layout" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          HR Reports Generator
        </h1>
        <p className="page-subtitle" style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          Generate, preview, and download official monthly leave utilization reports.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {/* Generator Controls Card */}
        <div className="corporate-card" style={{ maxWidth: '600px', margin: '0' }}>
          <div className="corporate-card-header">
            <h2 className="corporate-card-title" style={{ fontSize: '16px', fontWeight: '600' }}>Monthly Utilization Report</h2>
          </div>
          <div className="corporate-card-body">
            {error && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Month</label>
                <select 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
                  value={month} 
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {monthNames.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Year</label>
                <select 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}
                  value={year} 
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {[2023, 2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateReport}
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '600' }}
            >
              {loading ? 'Generating Report...' : 'Generate Report & Preview'}
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {report && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Report Preview: {monthNames[month - 1]} {year}
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleDownloadCSV}
                  style={{
                    padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none',
                    borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                >
                  Download CSV
                </button>
                <button 
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 16px', backgroundColor: '#64748b', color: '#fff', border: 'none',
                    borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                >
                  Print Report
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px'
            }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Total Leave Days Utilized</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8', marginTop: '8px' }}>{report.totalCompanyDays}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Departments Active</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669', marginTop: '8px' }}>{report.departments.length}</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Generated On</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#475569', marginTop: '16px' }}>{report.generatedDate}</div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: 0 }}>Departmental Utilisation Breakdown</h3>
              </div>
              {report.departments.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No departmental leave activity found.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>DEPARTMENT</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>TOTAL DAYS</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>ANNUAL</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>SICK</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>UNPAID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.departments.map(dept => (
                      <tr key={dept.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: '600', color: '#1e293b' }}>{dept.name}</td>
                        <td style={{ padding: '12px 20px', color: '#1d4ed8', fontWeight: '700', textAlign: 'right' }}>{dept.totalDays}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center', color: '#475569' }}>{dept.leaveBreakdown.annual}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center', color: '#475569' }}>{dept.leaveBreakdown.sick}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'center', color: '#475569' }}>{dept.leaveBreakdown.unpaid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Individual Records Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: 0 }}>Approved Leaves Log</h3>
              </div>
              {report.allLeaves.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No approved leaves recorded in this month.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>EMPLOYEE</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>DEPARTMENT</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>TYPE</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>DATES</th>
                      <th style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>DURATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.allLeaves.map((leave, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: '500', color: '#1e293b' }}>{leave.employeeName}</td>
                        <td style={{ padding: '12px 20px', color: '#475569' }}>{leave.department}</td>
                        <td style={{ padding: '12px 20px', textTransform: 'capitalize', color: '#475569' }}>{leave.leaveType}</td>
                        <td style={{ padding: '12px 20px', color: '#64748b', fontSize: '13px' }}>{leave.startDate} &rarr; {leave.endDate}</td>
                        <td style={{ padding: '12px 20px', color: '#1e293b', fontWeight: '600', textAlign: 'right' }}>{leave.duration} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
