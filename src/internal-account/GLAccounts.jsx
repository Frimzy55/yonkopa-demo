import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GLAccountFormModal from './GLAccountFormModal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 📌 Grouped account names by type (for the dropdown)
const ACCOUNT_NAMES_BY_TYPE = [
  {
    type: 'Asset',
    names: [
      'Cash',
      'Bank',
      'Petty Cash',
      'Suspense asset',
    ],
  },
  {
   type: 'Liability',
    names: [
      'Suspense liability',          // ✅ new
      'Loan repayments account',     // ✅ new
      'Cash collateral',             // ✅ new
      'Borrowings account',          // ✅ new
      'Overage account',             // ✅ new
    ],
  },

  {
    type: 'Equity',
    names: [
      'Stated capital',   // ✅ new
      'Drawings',         // ✅ new
    ],
  },

  {
     type: 'Revenue',
    names: [
      'Interest income on loans',    // ✅ new
      'Penalty income',              // ✅ new
      'Loan processing fee',         // ✅ new
      'Insurance fee income',        // ✅ new
      'SMS income',                  // ✅ new
      'Other operating income',      // ✅ new
      'Registration fee',            // ✅ new
    ],
  },
  {
    type: 'Expense',
    names: [
      'Borrowing expense',
      'Interest on Borrowing suspense',
      'Interest on Borrowing expense',
      'SSNIT contribution',
      'Wages & Salaries',
      'Staff allowance',
      'Owners allowance',
      'Staff lunch',
      'Rent expenses',
      'Utility: electricity',
      'Utility: water',
      'Occupancy cost: cleaning & sanitation',
      'Bus. Licensing & subscription',
    ],
  },
];

const GLAccounts = () => {
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const statuses = ['Active', 'Inactive', 'Suspended'];

  useEffect(() => {
    fetchGLAccounts();
  }, []);

  const fetchGLAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/gl-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGlAccounts(response.data);
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
      toast.error('Failed to fetch GL accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this GL Account?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/gl-accounts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('GL Account deleted successfully');
        fetchGLAccounts();
      } catch (error) {
        console.error('Error deleting GL account:', error);
        toast.error('Failed to delete GL account');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const getBalanceTypeColor = (balance) => {
    return balance === 'Debit' ? 'text-success' : 'text-danger';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Active': 'bg-success',
      'Inactive': 'bg-secondary',
      'Suspended': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
  };

  return (
    <div className="gl-accounts-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Subsidiary GL Accounts Section</h4>
          <p className="text-muted mb-0">Manage chart of accounts and GL master data</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Create GL Account
        </button>
      </div>

      {/* Summary Cards - First Row */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Accounts</h6>
                  <h3 className="mb-0">{glAccounts.length}</h3>
                </div>
                <i className="bi bi-journal-bookmark-fill fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Active Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.status === 'Active').length}
                  </h3>
                </div>
                <i className="bi bi-check-circle-fill fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Asset Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.accountType === 'Asset').length}
                  </h3>
                </div>
                <i className="bi bi-cash-stack fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Liability Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.accountType === 'Liability').length}
                  </h3>
                </div>
                <i className="bi bi-bank fs-1 text-warning"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Second Row */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Equity Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.accountType === 'Equity').length}
                  </h3>
                </div>
                <i className="bi bi-pie-chart-fill fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Income (Revenue) Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.accountType === 'Revenue').length}
                  </h3>
                </div>
                <i className="bi bi-graph-up-arrow fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-danger bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Expense Accounts</h6>
                  <h3 className="mb-0">
                    {glAccounts.filter(acc => acc.accountType === 'Expense').length}
                  </h3>
                </div>
                <i className="bi bi-wallet2 fs-1 text-danger"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Account Type</label>
              <select className="form-select">
                <option value="">All Types</option>
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input type="text" className="form-control" placeholder="Account code or name..." />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100">
                <i className="bi bi-search me-2"></i>Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading && !glAccounts.length ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading GL accounts...</p>
            </div>
          ) : glAccounts.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-journal-bookmark fs-1 text-muted"></i>
              <p className="mt-2 text-muted">No GL accounts found. Create your first GL account!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Normal Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {glAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="fw-semibold">{account.accountCode}</td>
                      <td>{account.accountName}</td>
                      <td>
                        <span className={`badge ${account.accountType === 'Asset' ? 'bg-info' : 
                          account.accountType === 'Liability' ? 'bg-warning' : 
                          account.accountType === 'Equity' ? 'bg-success' : 
                          account.accountType === 'Revenue' ? 'bg-primary' : 'bg-secondary'}`}>
                          {account.accountType}
                        </span>
                      </td>
                      <td>{account.category || '—'}</td>
                      <td className={getBalanceTypeColor(account.normalBalance)}>
                        <i className={`bi ${account.normalBalance === 'Debit' ? 'bi-arrow-up' : 'bi-arrow-down'} me-1`}></i>
                        {account.normalBalance}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(account.status)}`}>
                          {account.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(account)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(account.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal with grouped account name options */}
      <GLAccountFormModal
        show={showModal}
        onClose={closeModal}
        onSave={fetchGLAccounts}
        initialData={editingAccount}
        accounts={glAccounts}
        accountNameOptions={ACCOUNT_NAMES_BY_TYPE}   // 👈 grouped structure
      />
    </div>
  );
};

export default GLAccounts;