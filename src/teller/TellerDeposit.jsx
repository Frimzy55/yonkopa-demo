// TellerDeposit.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const TellerDeposit = () => {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    depositType: 'cash',
    description: 'Cash deposited by: ',
    reference: '',
    tellerId: '',                 // Now auto‑filled from logged‑in user
    transactionReference: ''      // auto‑generated
  });

  // Store logged‑in teller’s full name for display
  const [loggedTellerName, setLoggedTellerName] = useState('');

  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ amount: 0, currency: 'GHS', reference: '' });

  const depositTypes = ['cash', 'cheque', 'transfer'];

  // On mount: read logged‑in user from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        // Use teller_id and full_name from the users1 table
        const tellerId = user.teller_id || user.tellerId || '';
        const fullName = user.full_name || user.fullName || user.name || 'Unknown Teller';

        setLoggedTellerName(fullName);
        setFormData(prev => ({
          ...prev,
          tellerId: tellerId
        }));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      setLoggedTellerName('Not logged in');
      setFormData(prev => ({ ...prev, tellerId: '' }));
    }
  }, []);

  // Generate a unique transaction reference
  const generateTransactionReference = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DEP-${year}${month}${day}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') return;

    if (name === 'reference') {
      setFormData(prev => ({
        ...prev,
        reference: value,
        description: 'Cash deposited by: ' + value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSearchAccount = async () => {
    if (!formData.customerId) {
      setError('Please enter a Customer ID');
      return;
    }

    setLoading(true);
    setError('');
    setAccountDetails(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tills/loan-account?customerId=${encodeURIComponent(formData.customerId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error");
      }

      const record = Array.isArray(data) ? data[0] : data;

      if (!record) {
        throw new Error('No loan account found for this customer');
      }

      setAccountDetails({
        accountNumber: record.account_number || record.customer_id || 'N/A',
        accountName: record.applicant_fullName || record.account_name || 'N/A',
        accountType: record.account_type || 'Loan Account',
        currentBalance: parseFloat(record.account_balance) || 0,
        currency: record.account_currency || 'GHS',
        status: record.account_status || 'Active',
        avatar: record.avatar || null,
        signature: record.signature || null
      });

    } catch (err) {
      setError(err.message || 'Failed to fetch customer account');
      setAccountDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountDetails) {
      setError('Please search and verify the customer first');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (!formData.tellerId) {
      setError('Teller information is missing. Please log in again.');
      return;
    }

    // Auto-generate transaction reference when opening the modal
    setFormData(prev => ({
      ...prev,
      transactionReference: generateTransactionReference()
    }));

    setShowConfirm(true);
  };

  const processDeposit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        customerId: formData.customerId,
        accountNumber: accountDetails.accountNumber,
        accountName: accountDetails.accountName,
        depositType: formData.depositType,
        amount: parseFloat(formData.amount),
        currency: accountDetails.currency || 'GHS',
        depositedBy: formData.reference || '',
        tellerId: formData.tellerId,
        transactionReference: formData.transactionReference,
        description: formData.description
      };

      console.log('🚀 Sending deposit payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/tills/deposits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status} - Deposit failed`);
      }

      const ref = data.transactionReference || data.reference || data.ref || formData.transactionReference;

      setSuccessData({
        amount: parseFloat(formData.amount),
        currency: accountDetails.currency || 'GHS',
        reference: ref
      });

      setShowSuccessModal(true);

      // Reset form after 3 seconds – keep the tellerId
      setTimeout(() => {
        setFormData({
          customerId: '',
          amount: '',
          depositType: 'cash',
          description: 'Cash deposited by: ',
          reference: '',
          tellerId: formData.tellerId,   // preserve logged‑in teller
          transactionReference: ''
        });
        setAccountDetails(null);
        setShowConfirm(false);
      }, 3000);

    } catch (error) {
      console.error('❌ Deposit error:', error);
      setError(error.message || 'Failed to process deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'GHS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="teller-deposit">
      <div className="mb-4">
        <h6 className="text-muted mb-2">Teller Deposit</h6>
        <p className="small text-secondary">Process cash and cheque deposits</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white">
              <h6 className="mb-0">Account Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Customer ID  <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    placeholder="Enter Customer ID"
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSearchAccount}
                    disabled={loading || !formData.customerId}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </button>
                </div>
              </div>

              {accountDetails && (
                <div className="bg-light p-3 rounded">
                  <div className="mb-3">
                    <div className="d-flex py-1">
                      <span className="fw-bold" style={{ width: '130px' }}>Customer ID:</span>
                      <span>{formData.customerId}</span>
                    </div>
                    <div className="d-flex py-1 border-top">
                      <span className="fw-bold" style={{ width: '130px' }}>Customer Name:</span>
                      <span className="fw-bold fs-6">{accountDetails.accountName}</span>
                    </div>
                    <div className="d-flex py-1 border-top">
                      <span className="fw-bold" style={{ width: '130px' }}>Account Number:</span>
                      <span>{accountDetails.accountNumber}</span>
                    </div>
                  </div>

                  <div className="row border-top pt-2">
                    <div className="col-6">
                      <small className="text-muted">Account Type:</small>
                      <div>{accountDetails.accountType}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Current Balance:</small>
                      <div className="fw-bold text-success">
                        {formatCurrency(accountDetails.currentBalance, accountDetails.currency)}
                      </div>
                    </div>
                    <div className="col-6 mt-2">
                      <small className="text-muted">Status:</small>
                      <div>
                        <span className={`badge ${accountDetails.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                          {accountDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mt-3 pt-2 border-top">
                    <div className="me-4 text-center">
                      <small className="text-muted d-block mb-1">Photo</small>
                      {accountDetails.avatar ? (
                        <img
                          src={`${API_BASE_URL}/uploads/${accountDetails.avatar}`}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const fallback = document.createElement('div');
                            fallback.className = 'rounded-circle bg-secondary d-flex align-items-center justify-content-center';
                            fallback.style.cssText = 'width: 120px; height: 120px; color: #fff; font-size: 48px;';
                            fallback.innerHTML = '<i class="bi bi-person-fill"></i>';
                            parent.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                          style={{ width: '120px', height: '120px', color: '#fff', fontSize: '48px' }}
                        >
                          <i className="bi bi-person-fill"></i>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <small className="text-muted d-block mb-1">Signature</small>
                      {accountDetails.signature ? (
                        <img
                          src={`${API_BASE_URL}/uploads/${accountDetails.signature}`}
                          alt="Signature"
                          style={{
                            maxWidth: '200px',
                            maxHeight: '100px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '4px',
                            backgroundColor: '#fff',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const fallback = document.createElement('span');
                            fallback.className = 'text-muted';
                            fallback.style.fontSize = '0.9rem';
                            fallback.innerHTML = '<i class="bi bi-file-earmark-x me-1"></i>None';
                            parent.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                          <i className="bi bi-file-earmark-x me-1"></i>None
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Deposit Details</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Deposit Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="depositType"
                    value={formData.depositType}
                    onChange={handleChange}
                  >
                    {depositTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Amount <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">₵</span>
                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Deposited By</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    placeholder="Enter depositor's name"
                  />
                </div>

                {/* ✅ Teller field – auto‑filled from logged‑in user, read‑only */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Teller  <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={`${loggedTellerName} (${formData.tellerId})`}
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                  </div>
                  <small className="text-muted">
                    The logged‑in teller is automatically assigned.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    readOnly
                    rows="2"
                    style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                  <small className="text-muted">
                    Automatically updated from 'Deposited By' field.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading || !accountDetails || !formData.tellerId}
                >
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  Process Deposit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deposit</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Please confirm the deposit details:</p>
                <div className="bg-light p-3 rounded mb-3">
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Customer ID (from):</span>
                    <span>{formData.customerId}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Account Number:</span>
                    <span>{accountDetails?.accountNumber}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Account Name:</span>
                    <span>{accountDetails?.accountName}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Deposit Type:</span>
                    <span>{formData.depositType.charAt(0).toUpperCase() + formData.depositType.slice(1)}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Amount:</span>
                    <span className="fw-bold text-success">
                      {formatCurrency(parseFloat(formData.amount), accountDetails?.currency)}
                    </span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Transaction Reference:</span>
                    <span className="fw-bold text-primary">{formData.transactionReference}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Deposited By:</span>
                    <span>{formData.reference || '—'}</span>
                  </div>
                  <div className="d-flex py-1 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Teller (logged‑in):</span>
                    <span>{loggedTellerName} ({formData.tellerId})</span>
                  </div>
                  <div className="d-flex py-1">
                    <span className="fw-bold" style={{ width: '140px' }}>Description:</span>
                    <span>{formData.description}</span>
                  </div>
                </div>
                <p className="text-warning mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Please verify the account details before confirming.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={processDeposit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Confirm Deposit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title text-white">
                  <i className="bi bi-check-circle me-2"></i>
                  Deposit Successful
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessData({ amount: 0, currency: 'GHS', reference: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="fs-5 mb-3">Your deposit has been processed successfully.</p>
                <div className="bg-light p-3 rounded">
                  <div className="d-flex py-2 border-bottom">
                    <span className="fw-bold" style={{ width: '140px' }}>Amount:</span>
                    <span className="fw-bold text-success">
                      {formatCurrency(successData.amount, successData.currency)}
                    </span>
                  </div>
                  <div className="d-flex py-2">
                    <span className="fw-bold" style={{ width: '140px' }}>Reference:</span>
                    <span className="fw-bold text-primary">{successData.reference}</span>
                  </div>
                </div>
                <p className="text-muted mt-3 small">
                  The deposit has been recorded in the system. You can close this window.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessData({ amount: 0, currency: 'GHS', reference: '' });
                  }}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TellerDeposit;