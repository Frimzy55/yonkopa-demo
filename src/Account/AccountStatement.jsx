// Account/AccountStatement.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AccountStatement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [statementType, setStatementType] = useState('all');

  // Helper: parse number from string or return 0
  const toNumber = (val) => parseFloat(val) || 0;

  // Helper: format currency with two decimals
  const formatCurrency = (amount) => {
    const num = toNumber(amount);
    return `GHS ${num.toFixed(2)}`;
  };

  // Compute opening balance (balance before the first transaction in the list)
  const computeOpeningBalance = (txs) => {
    if (!txs || txs.length === 0) return 0;
    const first = txs[0];
    return first.balance - first.credit + first.debit;
  };

  // Fetch account details
  const fetchAccountDetails = async (accountNumber) => {
    try {
      const response = await apiClient.get(`/statements/account/${accountNumber}`);
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Account not found');
    }
  };

  // Fetch transactions – convert strings to numbers
  const fetchTransactions = async (accountNumber, startDate, endDate, type) => {
    try {
      const params = { accountNumber, startDate, endDate };
      if (type && type !== 'all') params.type = type;
      const response = await apiClient.get('/statements/transactions', { params });
      const rows = response.data.data.map(t => ({
        ...t,
        debit: toNumber(t.debit),
        credit: toNumber(t.credit),
        balance: toNumber(t.balance)
      }));
      return rows;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch transactions');
    }
  };

  // Resolve account number from Customer ID or Account Number
  const resolveAccountNumber = async (input) => {
    try {
      const response = await apiClient.get(`/api/tills/loan-account?customerId=${encodeURIComponent(input)}`);
      if (response.data && response.data.account_number) {
        return response.data.account_number;
      }
    } catch (err) {
      // Not a Customer ID, fall through
    }
    return input;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setError('Please enter a Customer ID or Account Number');
      return;
    }

    setLoading(true);
    setError('');
    setAccount(null);
    setTransactions([]);
    setOpeningBalance(0);

    try {
      const accountNumber = await resolveAccountNumber(trimmed);
      const accountData = await fetchAccountDetails(accountNumber);
      setAccount(accountData);

      const txData = await fetchTransactions(
        accountNumber,
        dateRange.startDate,
        dateRange.endDate,
        statementType
      );
      setTransactions(txData);
      setOpeningBalance(computeOpeningBalance(txData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (account) {
      fetchTransactionsAndUpdate(account.accountNumber, dateRange.startDate, dateRange.endDate, statementType);
    }
  };

  const fetchTransactionsAndUpdate = async (accountNumber, startDate, endDate, type) => {
    setLoading(true);
    try {
      const txData = await fetchTransactions(accountNumber, startDate, endDate, type);
      setTransactions(txData);
      setOpeningBalance(computeOpeningBalance(txData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!transactions.length) return;

    const headers = ['Date', 'Description', 'Transaction Type', 'Debit (GHS)', 'Credit (GHS)', 'Balance (GHS)'];
    const csvData = transactions.map(t => {
      const type = t.credit > 0 ? 'deposit' : (t.debit > 0 ? 'withdrawal' : 'other');
      return [
        new Date(t.transaction_date).toLocaleDateString(),
        t.description || t.narration,
        type,
        t.debit !== 0 ? t.debit.toFixed(2) : '',
        t.credit !== 0 ? t.credit.toFixed(2) : '',
        t.balance.toFixed(2)
      ];
    });

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${account.accountNumber}_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate summary using parsed numbers
  const calculateSummary = () => {
    const deposits = transactions.reduce((sum, t) => sum + (t.credit > 0 ? t.credit : 0), 0);
    const withdrawals = transactions.reduce((sum, t) => sum + (t.debit > 0 ? t.debit : 0), 0);
    return { deposits, withdrawals, net: deposits - withdrawals };
  };

  const summary = calculateSummary();
  const closingBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;

  return (
    <div className="account-statement-container">
      <h4 className="mb-4">Account Statement</h4>

      {/* Search Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Search by Customer ID or Account Number</h6>
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Customer ID or Account Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Loading...' : 'Load Account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {account && (
        <>
          {/* Account Header – now shows both opening and closing balances */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-1">{account.accountName}</h5>
                  <p className="text-muted mb-0">Account Number: {account.accountNumber}</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <p className="mb-0">Statement Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}</p>
                  <p className="mb-0">Opening Balance: {formatCurrency(openingBalance)}</p>
                  <p className="mb-0">Closing Balance: {formatCurrency(closingBalance)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleFilterSubmit} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Transaction Type</label>
                  <select
                    className="form-select"
                    value={statementType}
                    onChange={(e) => setStatementType(e.target.value)}
                  >
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits Only</option>
                    <option value="withdrawal">Withdrawals Only</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button type="submit" className="btn btn-primary w-100">
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <small className="text-muted">Total Deposits</small>
                  <h5 className="text-success mb-0">{formatCurrency(summary.deposits)}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <small className="text-muted">Total Withdrawals</small>
                  <h5 className="text-danger mb-0">{formatCurrency(summary.withdrawals)}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <small className="text-muted">Net Change</small>
                  <h5 className={summary.net >= 0 ? "text-success" : "text-danger"} style={{ marginBottom: 0 }}>
                    {formatCurrency(summary.net)}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-3 d-flex gap-2 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={handlePrint}>
              <i className="bi bi-printer me-1"></i> Print
            </button>
            <button className="btn btn-outline-success" onClick={handleExportCSV}>
              <i className="bi bi-download me-1"></i> Export CSV
            </button>
          </div>

          {/* Transactions Table */}
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Transaction Type</th>
                      <th className="text-end">Debit (GHS)</th>
                      <th className="text-end">Credit (GHS)</th>
                      <th className="text-end">Balance (GHS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No transactions found for the selected period
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, index) => {
                        const type = transaction.credit > 0 ? 'deposit' : 'withdrawal';
                        return (
                          <tr key={index}>
                            <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                            <td>{transaction.description || transaction.narration}</td>
                            <td>
                              <span className={`badge ${type === 'deposit' ? 'bg-success' : 'bg-danger'}`}>
                                {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                              </span>
                            </td>
                            <td className="text-end text-danger">
                              {transaction.debit !== 0 ? formatCurrency(transaction.debit) : '-'}
                            </td>
                            <td className="text-end text-success">
                              {transaction.credit !== 0 ? formatCurrency(transaction.credit) : '-'}
                            </td>
                            <td className="text-end fw-bold">{formatCurrency(transaction.balance)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Closing Balance Card at bottom */}
          {transactions.length > 0 && !loading && (
            <div className="card mt-3">
              <div className="card-body text-end">
                <strong>Closing Balance: {formatCurrency(closingBalance)}</strong>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccountStatement;