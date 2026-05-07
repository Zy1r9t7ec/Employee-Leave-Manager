import React, { useState } from 'react';
import api from '../api';

const LeaveRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Client-side validation
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before or equal to end date.');
      setLoading(false);
      return;
    }

    try {
      
      await api.post('/api/leaves', formData);
      setMessage('Leave request submitted successfully.');
      setFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="corporate-card">
      <div className="corporate-card-header">
        <h2 className="corporate-card-title">Submit Leave Request</h2>
      </div>
      <div className="corporate-card-body">
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        
        <form onSubmit={handleSubmit} className="corporate-form">
          <div className="form-group">
            <label htmlFor="leaveType" className="form-label">Leave Type</label>
            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="form-control"
            >
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group form-col-half">
              <label htmlFor="startDate" className="form-label">Start Date <span className="required-asterisk">*</span></label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group form-col-half">
              <label htmlFor="endDate" className="form-label">End Date <span className="required-asterisk">*</span></label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason for Leave <span className="required-asterisk">*</span></label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="form-control"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
