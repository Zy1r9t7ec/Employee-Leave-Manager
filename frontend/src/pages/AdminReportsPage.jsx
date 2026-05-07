import React, { useState } from 'react';
import axios from 'axios';

const AdminReportsPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/report', {
        params: { month, year },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Open the generated JSP report URL in a new browser tab
        window.open(response.data.reportUrl, '_blank');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="page-layout">
      <header className="page-header">
        <h1 className="page-title">HR Reports Generator</h1>
        <p className="page-subtitle">Generate and print official company leave reports</p>
      </header>

      <div className="corporate-card" style={{ maxWidth: '600px' }}>
        <div className="corporate-card-header">
          <h2 className="corporate-card-title">Monthly Utilisation Report</h2>
        </div>
        <div className="corporate-card-body">
          {error && <div className="alert alert-error">{error}</div>}
          
          <div className="form-row" style={{ marginBottom: '24px' }}>
            <div className="form-group form-col-half">
              <label className="form-label">Select Month</label>
              <select 
                className="form-control" 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
              >
                {monthNames.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group form-col-half">
              <label className="form-label">Select Year</label>
              <select 
                className="form-control" 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateReport}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Generating Report...' : 'Generate Official Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
