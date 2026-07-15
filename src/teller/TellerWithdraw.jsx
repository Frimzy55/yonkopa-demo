import React, { useState } from 'react';
import axios from 'axios';
import TransactionDetails from './WithdrawalDetails';
import DenominationDetails from './DenominationDetails';

const ReverseWithdrawal = () => {
  const [customerId, setCustomerId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!customerId.trim() && !accountNumber.trim()) {
      setError('Please enter at least a Customer ID or Account Number');
      return;
    }

    setLoading(true);
    setError('');
    setTransaction(null);
    setStep(0);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (customerId.trim()) params.append('customerId', customerId.trim());
      if (accountNumber.trim()) params.append('accountNumber', accountNumber.trim());

      const response = await axios.get(
        `http://localhost:5002/api/teller/transactions?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        setTransaction(data[0]);
      } else {
        setError('No account found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Account not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/teller/transactions/${transaction.id}/reverse`,
        { reason: 'Reversal requested', reversedBy: 'Admin User' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Withdrawal reversed successfully!');
      setStep(0);
      setTimeout(() => {
        setSuccess('');
        setTransaction(null);
        setCustomerId('');
        setAccountNumber('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reverse withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(1);
  const handleBack = () => setStep(0);

  return (
    <div className="reverse-withdrawal-container">
      <h4 className="mb-4">Withdrawal</h4>

      <div className="card">
        <div className="card-body">
          <h6 className="card-title mb-3">Search Customer Account</h6>
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Customer ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {success && <div className="alert alert-success mt-3">{success}</div>}

      {transaction && step === 0 && (
        <TransactionDetails transaction={transaction} onNext={handleNext} loading={loading} />
      )}

      {transaction && step === 1 && (
        <DenominationDetails
          transaction={transaction}
          onConfirm={handleReverse}
          onBack={handleBack}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ReverseWithdrawal;