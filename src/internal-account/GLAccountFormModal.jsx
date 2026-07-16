import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const GLAccountFormModal = ({
  show,
  onClose,
  onSave,
  initialData,
  accounts,
  accountNameOptions = [] // [{ type: 'Asset', names: ['Cash', ...] }, ...]
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

  // Transform accountNameOptions into react-select grouped options
  const groupedOptions = accountNameOptions.map((group) => ({
    label: group.type,
    options: group.names.map((name) => ({ value: name, label: name }))
  }));

  const selectedAccountNameOption = groupedOptions
    .flatMap((g) => g.options)
    .find((opt) => opt.value === formData.accountName);

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

  const handleAccountNameChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      accountName: selected ? selected.value : ''
    }));
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

  // 🎨 Custom styles for react-select with DARK group headings
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.375rem',
      borderColor: '#ced4da',
      fontSize: '1rem',
      minHeight: '38px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#86b7fe'
      },
      '&:focus-within': {
        borderColor: '#86b7fe',
        boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6c757d'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.375rem',
      marginTop: '4px',
      boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#e9ecef' : 'white',
      color: '#212529',
      '&:active': {
        backgroundColor: '#dee2e6'
      }
    }),
    // 🔥 Dark, bold group headings
    groupHeading: (provided) => ({
      ...provided,
      color: '#1e293b',        // dark slate
      fontWeight: 700,
      fontSize: '0.85rem',
      padding: '8px 12px 4px 12px',
      backgroundColor: '#f8fafc',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    })
  };

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
              {/* Account Name - full width with react-select */}
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Account Name *</label>
                  <Select
                    options={groupedOptions}
                    value={selectedAccountNameOption}
                    onChange={handleAccountNameChange}
                    placeholder="Select an account name"
                    isClearable
                    styles={customSelectStyles}
                    noOptionsMessage={() => 'No matching account names'}
                  />
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