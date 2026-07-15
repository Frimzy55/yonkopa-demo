import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const GLAccountFormModal = ({ 
  show, 
  onClose, 
  onSave, 
  initialData, 
  accounts,
  accountNameOptions = []   // 👈 expects [{ type: 'Asset', names: ['Cash', ...] }, ...]
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'Asset',
    category: '',
    normalBalance: 'Debit',
    description: '',
    status: 'Active',
    parentAccount: '',
    isSubAccount: false
  });

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const normalBalances = ['Debit', 'Credit'];
  const statuses = ['Active', 'Inactive', 'Suspended'];
  const assetCategories = ['Current Assets', 'Fixed Assets'];
  const liabilityCategories = ['Short Liability', 'Long Liability'];

  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData({
          accountName: initialData.accountName,
          accountType: initialData.accountType,
          category: initialData.category || '',
          normalBalance: initialData.normalBalance,
          description: initialData.description || '',
          status: initialData.status,
          parentAccount: initialData.parentAccount || '',
          isSubAccount: initialData.isSubAccount || false
        });
      } else {
        setFormData({
          accountName: '',
          accountType: 'Asset',
          category: '',
          normalBalance: 'Debit',
          description: '',
          status: 'Active',
          parentAccount: '',
          isSubAccount: false
        });
      }
    }
  }, [show, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    if (name === 'accountType') {
      newFormData.category = '';
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (initialData) {
        await axios.put(`${API_BASE_URL}/api/gl-accounts/${initialData.id}`, formData, config);
        toast.success('GL Account updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/gl-accounts`, formData, config);
        toast.success('GL Account created successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving GL account:', error);
      toast.error(error.response?.data?.message || 'Failed to save GL account');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const hideCategory = ['Equity', 'Revenue', 'Expense'].includes(formData.accountType);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {initialData ? 'Edit GL Account' : 'Create New GL Account'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Account Name - full width */}
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Account Name *</label>
                  <select
                    className="form-select"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select an account name</option>
                    {accountNameOptions.map((group) => (
                      <optgroup key={group.type} label={group.type}>
                        {group.names.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className={hideCategory ? 'col-md-12' : 'col-md-6'}>
                  <label className="form-label">Account Type *</label>
                  <select
                    className="form-select"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    required
                  >
                    {accountTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {!hideCategory && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    {formData.accountType === 'Asset' ? (
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        {assetCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : formData.accountType === 'Liability' ? (
                      <select
                        className="form-select"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        {liabilityCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Enter category"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Normal Balance *</label>
                  <select
                    className="form-select"
                    name="normalBalance"
                    value={formData.normalBalance}
                    onChange={handleInputChange}
                    required
                  >
                    {normalBalances.map(balance => (
                      <option key={balance} value={balance}>{balance}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Parent Account</label>
                  <select
                    className="form-select"
                    name="parentAccount"
                    value={formData.parentAccount}
                    onChange={handleInputChange}
                  >
                    <option value="">None (Main Account)</option>
                    {accounts
                      .filter(acc => !acc.isSubAccount && acc.id !== initialData?.id)
                      .map(account => (
                        <option key={account.id} value={account.accountCode}>
                          {account.accountCode} - {account.accountName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check mt-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isSubAccount"
                      checked={formData.isSubAccount}
                      onChange={handleInputChange}
                      id="isSubAccount"
                    />
                    <label className="form-check-label" htmlFor="isSubAccount">
                      This is a sub-account
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  initialData ? 'Update Account' : 'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GLAccountFormModal;