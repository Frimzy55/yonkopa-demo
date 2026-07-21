import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CreateFundTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [tellersLoading, setTellersLoading] = useState(true);
  const [accountOptions, setAccountOptions] = useState([]);
  const [tellerOptions, setTellerOptions] = useState([]);
  const [selectedTeller, setSelectedTeller] = useState(null);
  const [form, setForm] = useState({
    reference: '',
    transferDate: new Date().toISOString().split('T')[0],
    fromAccountCode: '',
    fromAccountName: '',
    toAccountCode: '',
    toAccountName: '',
    amount: '',
    currency: 'GHS',
    description: '',
    status: 'Pending',
    createdBy: '',
  });

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/gl-accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const accounts = response.data;
        const flatAccounts = accounts.map((acc) => ({
          value: `acc-${acc.accountCode}`,
          label: `${acc.accountCode} - ${acc.accountName}`,
          code: acc.accountCode,
          name: acc.accountName,
          type: 'account',
          searchString: `${acc.accountCode} ${acc.accountName}`.toLowerCase(),
        }));
        setAccountOptions(flatAccounts);
      } catch (error) {
        console.error('Failed to load accounts:', error);
        toast.error('Could not load accounts. Please refresh.');
      } finally {
        setAccountsLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch tellers
  useEffect(() => {
    const fetchTellers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/tills/tellers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tellers = response.data.data || response.data || [];
        const flatTellers = tellers.map((t) => {
          const id = t.id || t.userId || t.user_id;
          const name = t.fullName || t.full_name || t.name || 'Unknown';
          const tellerId = t.tellerId || t.teller_id || id;
          return {
            value: `teller-${tellerId}`,
            label: `${name} (${tellerId})`,
            name: name,
            tellerId: tellerId,
            type: 'teller',
            searchString: `${name} ${tellerId}`.toLowerCase(),
          };
        });
        setTellerOptions(flatTellers);
      } catch (error) {
        console.error('Failed to load tellers:', error);
        toast.error('Could not load tellers. Please refresh.');
      } finally {
        setTellersLoading(false);
      }
    };
    fetchTellers();
  }, []);

  const combinedOptions = useMemo(() => {
    const groups = [];
    if (accountOptions.length > 0) {
      groups.push({ label: 'Accounts', options: accountOptions });
    }
    if (tellerOptions.length > 0) {
      groups.push({ label: 'Tellers', options: tellerOptions });
    }
    return groups;
  }, [accountOptions, tellerOptions]);

  // Generate reference and creator
  useEffect(() => {
    const ref = `FT-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm((prev) => ({
      ...prev,
      reference: ref,
      createdBy: user?.name || user?.username || 'Admin',
    }));
  }, []);

  const resetForm = () => {
    const newRef = `FT-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    setForm({
      reference: newRef,
      transferDate: new Date().toISOString().split('T')[0],
      fromAccountCode: '',
      fromAccountName: '',
      toAccountCode: '',
      toAccountName: '',
      amount: '',
      currency: 'GHS',
      description: '',
      status: 'Pending',
      createdBy: form.createdBy,
    });
    setSelectedTeller(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Updated handler for From Account dropdown
  const handleFromChange = (selected) => {
    if (!selected) {
      setForm((prev) => ({ ...prev, fromAccountCode: '', fromAccountName: '' }));
      setSelectedTeller(null);
      return;
    }
    if (selected.type === 'account') {
      setForm((prev) => ({
        ...prev,
        fromAccountCode: selected.code,
        fromAccountName: selected.name,
      }));
      setSelectedTeller(null);
    } else if (selected.type === 'teller') {
      // Set from account to the teller's details
      setForm((prev) => ({
        ...prev,
        fromAccountCode: selected.tellerId,
        fromAccountName: selected.name,
      }));
      // Store teller info for backend (optional, but we'll send it)
      setSelectedTeller({
        name: selected.name,
        id: selected.tellerId,
      });
    }
  };

  // Updated handler for To Account dropdown
  const handleToChange = (selected) => {
    if (!selected) {
      setForm((prev) => ({ ...prev, toAccountCode: '', toAccountName: '' }));
      return;
    }
    if (selected.type === 'account') {
      setForm((prev) => ({
        ...prev,
        toAccountCode: selected.code,
        toAccountName: selected.name,
      }));
    } else if (selected.type === 'teller') {
      // Set to account to the teller's details
      setForm((prev) => ({
        ...prev,
        toAccountCode: selected.tellerId,
        toAccountName: selected.name,
      }));
      // Store teller info for backend
      setSelectedTeller({
        name: selected.name,
        id: selected.tellerId,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    // Ensure both accounts are selected
    if (!form.fromAccountCode || !form.fromAccountName || !form.toAccountCode || !form.toAccountName) {
      toast.error('Please select both From and To accounts');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        reference: form.reference,
        transferDate: form.transferDate,
        fromAccountCode: form.fromAccountCode,
        fromAccountName: form.fromAccountName,
        toAccountCode: form.toAccountCode,
        toAccountName: form.toAccountName,
        amount: parseFloat(form.amount),
        currency: form.currency,
        description: form.description,
        status: form.status,
        createdBy: form.createdBy,
      };
      // Only send teller info if selected (for backend reference)
      if (selectedTeller) {
        payload.tellerName = selectedTeller.name;
        payload.tellerId = selectedTeller.id;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/fund-transfers`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Transfer response:', response.data);
      toast.success(response.data.message || 'Transfer submitted successfully!');
      resetForm();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit transfer';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₵ ${Number(amount).toFixed(2)}`;
  const amountNum = parseFloat(form.amount) || 0;

  const selectedFrom = accountOptions.find(
    (opt) => opt.code === form.fromAccountCode
  );
  const selectedTo = accountOptions.find(
    (opt) => opt.code === form.toAccountCode
  );

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '12px',
      borderColor: '#d1d5db',
      padding: '0px 4px',
      fontSize: '0.9rem',
      minHeight: '44px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9ca3af' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '12px',
      marginTop: '4px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
      color: '#111827',
      '&:active': { backgroundColor: '#e5e7eb' },
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: '#1e293b',
      fontWeight: 600,
      fontSize: '0.85rem',
      padding: '8px 12px 4px 12px',
      backgroundColor: '#f8fafc',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    }),
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f3f4f6',
          padding: '16px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.1)',
            padding: '32px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 8px 0',
                letterSpacing: '-0.025em',
              }}
            >
              Create Fund Transfer
            </h2>
            <div
              style={{
                height: '4px',
                width: '60px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
              }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              <div>
                <label style={labelStyle}>Transfer Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  readOnly
                  style={{ ...inputStyle, backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Transfer Date</label>
                <input
                  type="date"
                  name="transferDate"
                  value={form.transferDate}
                  disabled
                  style={{ ...inputStyle, backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              <div>
                <label style={labelStyle}>From Account (Source)</label>
                <Select
                  options={combinedOptions}
                  value={selectedFrom}
                  onChange={handleFromChange}
                  placeholder={
                    accountsLoading || tellersLoading
                      ? 'Loading...'
                      : 'Search account or teller...'
                  }
                  isClearable={false}
                  isLoading={accountsLoading || tellersLoading}
                  styles={customSelectStyles}
                  noOptionsMessage={() => 'No accounts or tellers found'}
                  filterOption={(option, search) => {
                    const searchLower = search.toLowerCase();
                    return (
                      option.label.toLowerCase().includes(searchLower) ||
                      option.data.searchString?.includes(searchLower)
                    );
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>To Account (Destination)</label>
                <Select
                  options={combinedOptions}
                  value={selectedTo}
                  onChange={handleToChange}
                  placeholder={
                    accountsLoading || tellersLoading
                      ? 'Loading...'
                      : 'Search account or teller...'
                  }
                  isClearable={false}
                  isLoading={accountsLoading || tellersLoading}
                  styles={customSelectStyles}
                  noOptionsMessage={() => 'No accounts or tellers found'}
                  filterOption={(option, search) => {
                    const searchLower = search.toLowerCase();
                    return (
                      option.label.toLowerCase().includes(searchLower) ||
                      option.data.searchString?.includes(searchLower)
                    );
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              <div>
                <label style={labelStyle}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    ₵
                  </span>
                  <input
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, paddingLeft: '36px' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="GHS">GHS (₵)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Description / Reason</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Enter reason for transfer..."
                value={form.description}
                onChange={handleChange}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ ...labelStyle, fontWeight: 600, fontSize: '0.9rem' }}>
                Accounting Preview
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ef4444',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>
                    Debit (To Account)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                    {form.toAccountName || '—'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                    {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                    Debit Amount: {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #10b981',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                    Credit (From Account)
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                    {form.fromAccountName || '—'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                    {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                    Credit Amount: {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Created By</label>
                <input
                  type="text"
                  name="createdBy"
                  value={form.createdBy}
                  readOnly
                  style={{ ...inputStyle, backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '24px',
              }}
            >
              <button
                type="button"
                style={{
                  padding: '10px 28px',
                  borderRadius: '40px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'transparent',
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                onClick={() => toast.info('Draft saved (demo)')}
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading || accountsLoading || tellersLoading}
                style={{
                  padding: '10px 32px',
                  borderRadius: '40px',
                  border: 'none',
                  backgroundColor:
                    loading || accountsLoading || tellersLoading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: loading || accountsLoading || tellersLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!loading && !accountsLoading && !tellersLoading)
                    e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  if (!loading && !accountsLoading && !tellersLoading)
                    e.target.style.backgroundColor = '#3b82f6';
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#4b5563',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '0.9rem',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  outline: 'none',
  transition: 'all 0.2s',
  fontFamily: 'inherit',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

export default CreateFundTransfer;