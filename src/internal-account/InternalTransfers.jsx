import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InternalTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    currency: '₵',
    transferType: 'Internal',
    description: '',
    reference: '',
    transferDate: new Date().toISOString().split('T')[0]
  });

  const transferTypes = ['Internal', 'GL Transfer', 'Inter-Branch'];
  const currencies = ['GHS'];

  useEffect(() => {
    fetchTransfers();
    fetchAccounts();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/internal-transfers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch transfer history');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateTransfer = () => {
    if (formData.fromAccountId === formData.toAccountId) {
      toast.error('Cannot transfer to the same account');
      return false;
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return false;
    }
    const fromAccount = accounts.find(acc => acc.id === parseInt(formData.fromAccountId));
    if (fromAccount && fromAccount.balance < parseFloat(formData.amount)) {
      toast.error('Insufficient funds in source account');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateTransfer()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.post('http://localhost:5000/api/internal-transfers', formData, config);
      toast.success('Transfer completed successfully');
      resetForm();
      fetchTransfers();
      fetchAccounts();
    } catch (error) {
      console.error('Error processing transfer:', error);
      toast.error(error.response?.data?.message || 'Failed to process transfer');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      currency: 'USD',
      transferType: 'Internal',
      description: '',
      reference: '',
      transferDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Completed': 'bg-success',
      'Pending': 'bg-warning',
      'Failed': 'bg-danger',
      'Reversed': 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.accountNumber} - ${account.accountName || 'Account'}` : 'N/A';
  };

  return (
    <div className="internal-transfers-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Internal Transfers</h4>
          <p className="text-muted mb-0">Process and manage transfers between accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-arrow-left-right me-2"></i>
          New Transfer
        </button>
      </div>

      {/* Summary Cards – 3 cards (Pending removed) */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Transfers</h6>
                  <h3 className="mb-0">{transfers.length}</h3>
                </div>
                <i className="bi bi-arrow-left-right fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Volume</h6>
                  <h3 className="mb-0">
                    {formatCurrency(
                      transfers
                        .filter(t => t.status === 'Completed')
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    )}
                  </h3>
                </div>
                <i className="bi bi-cash-stack fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Today's Transfers</h6>
                  <h3 className="mb-0">
                    {transfers.filter(t => {
                      const today = new Date().toISOString().split('T')[0];
                      return t.transferDate === today;
                    }).length}
                  </h3>
                </div>
                <i className="bi bi-calendar-day fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Transfer Info */}
      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        <strong>Transfer Information:</strong> Internal transfers are processed instantly.
        Transfers between accounts within the same branch are free. Inter-branch transfers may incur charges.
      </div>

      {/* Transfers Table */}
      <div className="card">
        <div className="card-header bg-white">
          <h6 className="mb-0">Transfer History</h6>
        </div>
        <div className="card-body p-0">
          {loading && !transfers.length ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading transfer history...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-arrow-left-right fs-1 text-muted"></i>
              <p className="mt-2 text-muted">No transfers found. Initiate your first transfer!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td>{new Date(transfer.transferDate).toLocaleDateString()}</td>
                      <td className="fw-semibold">{transfer.reference || '—'}</td>
                      <td>{getAccountName(transfer.fromAccountId)}</td>
                      <td>{getAccountName(transfer.toAccountId)}</td>
                      <td className="fw-semibold">
                        {formatCurrency(transfer.amount, transfer.currency)}
                      </td>
                      <td>
                        <span className={`badge ${
                          transfer.transferType === 'Internal' ? 'bg-info' :
                          transfer.transferType === 'GL Transfer' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {transfer.transferType}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                          {transfer.description || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  New Internal Transfer
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">From Account *</label>
                      <select
                        className="form-select"
                        name="fromAccountId"
                        value={formData.fromAccountId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select source account</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.accountNumber} - {account.accountName || 'Account'}
                            (Balance: {formatCurrency(account.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">To Account *</label>
                      <select
                        className="form-select"
                        name="toAccountId"
                        value={formData.toAccountId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select destination account</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.accountNumber} - {account.accountName || 'Account'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Amount *</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          {formData.currency === 'GHS' ? '₵' :
                           formData.currency === 'EUR' ? '€' :
                           formData.currency === 'GBP' ? '£' :
                           formData.currency}
                        </span>
                        <input
                          type="number"
                          className="form-control"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          required
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Currency</label>
                      <select
                        className="form-select"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Transfer Type</label>
                      <select
                        className="form-select"
                        name="transferType"
                        value={formData.transferType}
                        onChange={handleInputChange}
                      >
                        {transferTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Transfer Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="transferDate"
                        value={formData.transferDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reference (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      placeholder="Transaction reference number"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter transfer description..."
                    ></textarea>
                  </div>

                  {formData.fromAccountId && formData.toAccountId && formData.amount && (
                    <div className="alert alert-secondary mt-3">
                      <h6 className="mb-2">Transfer Summary</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <small className="text-muted">Source Account:</small>
                          <p className="mb-0 fw-semibold">{getAccountName(formData.fromAccountId)}</p>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Destination Account:</small>
                          <p className="mb-0 fw-semibold">{getAccountName(formData.toAccountId)}</p>
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between">
                        <span>Transfer Amount:</span>
                        <strong className="text-primary">
                          {formatCurrency(formData.amount, formData.currency)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      'Process Transfer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalTransfers;