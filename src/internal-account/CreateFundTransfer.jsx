import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBuilding, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 📌 Grouped account names by type (reused from GLAccounts)
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
      'Suspense liability',
      'Loan repayments account',
      'Cash collateral',
      'Borrowings account',
      'Overage account',
    ],
  },
  {
    type: 'Equity',
    names: [
      'Stated capital',
      'Drawings',
    ],
  },
  {
    type: 'Revenue',
    names: [
      'Interest income on loans',
      'Penalty income',
      'Loan processing fee',
      'Insurance fee income',
      'SMS income',
      'Other operating income',
      'Registration fee',
    ],
  },
  
];

const CreateFundTransfer = () => {
const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reference: '',
    transferDate: new Date().toISOString().split('T')[0],
    fromAccountName: '',
    toAccountName: '',
    amount: '',
    currency: 'GHS',
    description: '',
    status: 'Pending',
    createdBy: '',
  });

  // Set default reference and createdBy on mount
  useEffect(() => {
    // Generate reference number (e.g., FT-000001)
    const ref = `FT-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm((prev) => ({
      ...prev,
      reference: ref,
      createdBy: user?.name || user?.username || 'Admin',
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!form.fromAccountName || !form.toAccountName) {
      toast.error('Please select both accounts');
      return;
    }
    if (form.fromAccountName === form.toAccountName) {
      toast.error('From and To accounts must be different');
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    // For now, just log; you can replace with API call
    console.log('Fund Transfer Data:', form);
    toast.success('Transfer submitted (demo)');
    // Reset or navigate...
  };

  // Format currency (always GHS)
  const formatCurrency = (amount) => {
    return `₵ ${Number(amount).toFixed(2)}`;
  };

  const amountNum = parseFloat(form.amount) || 0;

  return (
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
        {/* Header */}
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
          {/* Two-column layout for top fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            {/* Transfer Reference */}
            <div>
              <label style={labelStyle}>Transfer Reference</label>
              <input
                type="text"
                name="reference"
                value={form.reference}
                readOnly
                style={{
                  ...inputStyle,
                  backgroundColor: '#f9fafb',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            {/* Transfer Date - disabled */}
            <div>
              <label style={labelStyle}>Transfer Date</label>
              <input
                type="date"
                name="transferDate"
                value={form.transferDate}
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: '#f9fafb',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          {/* From Account & To Account - now using grouped dropdowns */}
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
              <select
                name="fromAccountName"
                value={form.fromAccountName}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Account</option>
                {ACCOUNT_NAMES_BY_TYPE.map((group) => (
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
            <div>
              <label style={labelStyle}>To Account (Destination)</label>
              <select
                name="toAccountName"
                value={form.toAccountName}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Account</option>
                {ACCOUNT_NAMES_BY_TYPE.map((group) => (
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

          {/* Amount & Currency */}
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
                  style={{
                    ...inputStyle,
                    paddingLeft: '36px',
                  }}
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

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Description / Reason</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Enter reason for transfer..."
              value={form.description}
              onChange={handleChange}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
          </div>

          {/* Accounting Preview - updated to show names */}
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
              {/* Debit */}
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  padding: '12px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ef4444',
                }}
              >
                <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>
                  Debit
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                  {form.toAccountName || '—'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                </div>
              </div>

              {/* Credit */}
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  padding: '12px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #10b981',
                }}
              >
                <div style={{ fontWeight: 600, color: '#065f46', marginBottom: '4px' }}>
                  Credit
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                  {form.fromAccountName || '—'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                  {amountNum > 0 ? formatCurrency(amountNum) : '₵ 0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Created By */}
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
                style={{
                  ...inputStyle,
                  backgroundColor: '#f9fafb',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              style={{
                padding: '10px 32px',
                borderRadius: '40px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#3b82f6')}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable styles
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
};

export default CreateFundTransfer;