import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
    } catch (err) {
      setError('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request, type) => {
    setActiveRequest(request);
    setActionType(type);
    setComment('');
  };

  const closeModal = () => {
    setActiveRequest(null);
    setActionType('');
    setComment('');
  };

  const handleAction = async () => {
    if (actionType === 'reject' && !comment.trim()) {
      alert('Rejection requires a comment.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/leaves/${activeRequest._id}/${actionType}`, 
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the processed request from the list
      setRequests(requests.filter(r => r._id !== activeRequest._id));
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${actionType} request.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading requests...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="corporate-card" style={{ maxWidth: '1000px' }}>
      <div className="corporate-card-header">
        <h2 className="corporate-card-title">Pending Leave Approvals</h2>
      </div>
      <div className="corporate-card-body table-responsive">
        {requests.length === 0 ? (
          <p className="no-data">No pending requests to review.</p>
        ) : (
          <table className="corporate-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>
                    <div className="employee-info">
                      <strong>{req.employeeId?.name || 'Unknown'}</strong>
                      <span className="text-muted">{req.employeeId?.department || ''}</span>
                    </div>
                  </td>
                  <td className="capitalize">{req.leaveType}</td>
                  <td>
                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td>{req.durationDays}</td>
                  <td className="truncate-text" title={req.reason}>{req.reason}</td>
                  <td className="table-actions">
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={() => openModal(req, 'approve')}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => openModal(req, 'reject')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {activeRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">
              {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
            </h3>
            <p className="modal-subtitle">
              For <strong>{activeRequest.employeeId?.name}</strong> ({activeRequest.durationDays} days)
            </p>
            
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">
                Manager Comment {actionType === 'reject' && <span className="required-asterisk">*</span>}
              </label>
              <textarea 
                className="form-control"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter an optional note (required for rejection)..."
              ></textarea>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button 
                className={`btn ${actionType === 'approve' ? 'btn-primary' : 'btn-danger'}`} 
                onClick={handleAction} 
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsTable;
