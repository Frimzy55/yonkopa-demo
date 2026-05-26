// Account/AccountEnquiry.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AccountEnquiry = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('accountNumber'); // accountNumber, customerId, phoneNumber

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter search criteria');
      return;
    }

    setLoading(true);
    setError('');
    setAccount(null);

    try {
      const token = localStorage.getItem('token');
      let response;
      
      switch(searchType) {
        case 'accountNumber':
          response = await axios.get(`/api/accounts/${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'customerId':
          response = await axios.get(`/api/accounts/customer/${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'phoneNumber':
          response = await axios.get(`/api/accounts/phone/${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        default:
          response = await axios.get(`/api/accounts/${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
      }
      
      setAccount(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Account not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="account-enquiry-container">
      <h4 className="mb-4">Customer Enquiry</h4>

      {/* Search Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title mb-3">Search Account</h6>
          <form onSubmit={handleSearch}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Search By</label>
                <select 
                  className="form-select" 
                  value={searchType} 
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="accountNumber">Account Number</option>
                  <option value="customerId">Customer ID</option>
                  <option value="phoneNumber">Phone Number</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  {searchType === 'accountNumber' && 'Enter Account Number'}
                  {searchType === 'customerId' && 'Enter Customer ID'}
                  {searchType === 'phoneNumber' && 'Enter Phone Number'}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    searchType === 'accountNumber' ? 'e.g., ACC001234' :
                    searchType === 'customerId' ? 'e.g., CUST001' :
                    'e.g., 233241234567'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">&nbsp;</label>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Account Details */}
      {account && (
        <div className="row g-4">
          {/* Account Summary Card */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Account Summary</h6>
                <div className="mb-3">
                  <small className="text-muted d-block">Account Number</small>
                  <strong className="fs-5">{account.accountNumber}</strong>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Account Name</small>
                  <strong>{account.accountName}</strong>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Account Type</small>
                  <span className="badge bg-info">{account.accountType}</span>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Status</small>
                  <span className={`badge ${account.accountStatus === 'Active' ? 'bg-success' : 'bg-warning'}`}>
                    {account.accountStatus}
                  </span>
                </div>
                <div>
                  <small className="text-muted d-block">Opening Date</small>
                  <span>{formatDate(account.openingDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Balance Information</h6>
                <div className="mb-3">
                  <small className="text-muted d-block">Current Balance</small>
                  <strong className="fs-4 text-primary">GHS {account.balance?.toLocaleString() || 0}</strong>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Available Balance</small>
                  <strong className="text-success">GHS {(account.balance - (account.lien?.amount || 0)).toLocaleString()}</strong>
                </div>
                {account.lien && (
                  <div>
                    <small className="text-muted d-block">Lien Amount</small>
                    <strong className="text-danger">GHS {account.lien.amount?.toLocaleString()}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Customer Information</h6>
                <div className="mb-2">
                  <small className="text-muted">Customer ID</small>
                  <p className="mb-0">{account.customerId || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Phone Number</small>
                  <p className="mb-0">{account.phoneNumber || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Email</small>
                  <p className="mb-0">{account.email || 'N/A'}</p>
                </div>
                <div>
                  <small className="text-muted">Branch</small>
                  <p className="mb-0">{account.branch || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Card */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Account Settings</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted d-block">Interest Rate</small>
                    <span>{account.interestRate || 0}%</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Minimum Balance</small>
                    <span>GHS {account.minimumBalance?.toLocaleString() || 0}</span>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted d-block">Overdraft Limit</small>
                    <span>GHS {account.overdraftLimit?.toLocaleString() || 0}</span>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted d-block">Branch Code</small>
                    <span>{account.branchCode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title text-muted mb-3">Address Information</h6>
                <p className="mb-0">{account.address || 'No address on file'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountEnquiry;