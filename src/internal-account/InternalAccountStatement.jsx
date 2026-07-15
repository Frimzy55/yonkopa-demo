import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FaPrint, FaFileExcel } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const InternalAccountStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [form, setForm] = useState({
    accountNumber: '',
    reportMode: 'summary',
    fromDate: '',
    toDate: '',
  });
  const [statementData, setStatementData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const tableRef = useRef(null);

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/gl-accounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        toast.error('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  // Prepare options for react-select
  const accountOptions = accounts.map((acc) => ({
    value: acc.accountCode,
    label: `${acc.accountCode} - ${acc.accountName}`,
  }));

  // Find currently selected option
  const selectedOption = accountOptions.find(
    (opt) => opt.value === form.accountNumber
  );

  // Find the selected account details
  const selectedAccount = accounts.find(
    (acc) => acc.accountCode === form.accountNumber
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      accountNumber: selected ? selected.value : '',
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!form.accountNumber) {
      toast.error('Please select an account.');
      return;
    }
    if (!form.fromDate || !form.toDate) {
      toast.error('Please select both From and To dates.');
      return;
    }
    if (form.fromDate > form.toDate) {
      toast.error('From date cannot be later than To date.');
      return;
    }

    // TODO: Replace with actual API call to fetch statement data
    // For now, we set an empty array to show "No transactions found"
    setStatementData([]);
    setShowResults(true);
    toast.success('Statement generated successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (statementData.length === 0) {
      toast.warn('No data to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = statementData.map((t) => [
      t.date,
      t.description,
      t.debit.toFixed(2),
      t.credit.toFixed(2),
      t.balance.toFixed(2),
    ]);
    const totalDebit = statementData.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = statementData.reduce((sum, t) => sum + t.credit, 0);
    rows.push(['', 'TOTALS', totalDebit.toFixed(2), totalCredit.toFixed(2), '']);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `Statement_${form.accountNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `₵ ${Number(amount).toFixed(2)}`;
  };

  // Compute totals and balances (handle empty)
  const totalDebit = statementData.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = statementData.reduce((sum, t) => sum + t.credit, 0);
  const closingBalance =
    statementData.length > 0 ? statementData[statementData.length - 1].balance : 0;
  const openingBalance = statementData.length > 0 ? statementData[0].balance : 0;

  // Get today's date for "Generated On"
  const generatedOn = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '12px',
      borderColor: '#d1d5db',
      padding: '2px 4px',
      fontSize: '0.9rem',
      minHeight: '44px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
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
      '&:active': {
        backgroundColor: '#e5e7eb',
      },
    }),
  };

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
        <div style={{ marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#111827',
              margin: '0 0 6px 0',
              letterSpacing: '-0.025em',
            }}
          >
            Internal Account Statement
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
            View account transactions and balances for a specific period.
          </p>
          <div
            style={{
              height: '4px',
              width: '60px',
              backgroundColor: '#3b82f6',
              borderRadius: '2px',
              marginTop: '12px',
            }}
          />
        </div>

        {/* Filter Form */}
        <form onSubmit={handleGenerate} style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Account *</label>
            <Select
              options={accountOptions}
              value={selectedOption}
              onChange={handleAccountChange}
              placeholder="Select an account"
              isLoading={loadingAccounts}
              isDisabled={loadingAccounts}
              styles={customSelectStyles}
              noOptionsMessage={() => 'No accounts found'}
            />
            {loadingAccounts && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  marginTop: '4px',
                }}
              >
                Loading accounts...
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Report Mode</label>
            <select
              name="reportMode"
              value={form.reportMode}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="summary">Head Office</option>
              <option value="detailed">Consolidated</option>
            </select>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div>
              <label style={labelStyle}>From Date *</label>
              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>To Date *</label>
              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '24px',
            }}
          >
            <button
              type="submit"
              style={{
                padding: '10px 36px',
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
              Generate Statement
            </button>
          </div>
        </form>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Company Heading */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1f2937',
                  margin: 0,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                YONKOPA MICRO CREDIT ENTERPRISE
              </h2>
              <div
                style={{
                  height: '2px',
                  width: '80px',
                  backgroundColor: '#3b82f6',
                  margin: '8px auto 0',
                }}
              />
            </div>

            {/* Statement Header with Account Details */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 24px',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <span style={{ color: '#6b7280' }}>Account Name:</span>{' '}
                  <strong>{selectedAccount?.accountName || form.accountNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Account Number:</span>{' '}
                  <strong>{form.accountNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Currency:</span>{' '}
                  <strong>{selectedAccount?.currency || 'GHS'}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Generated On:</span>{' '}
                  <strong>{generatedOn}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Period:</span>{' '}
                  <strong>
                    {form.fromDate} to {form.toDate}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Opening Balance:</span>{' '}
                  <strong>{formatCurrency(openingBalance)}</strong>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Closing Balance:</span>{' '}
                  <strong>{formatCurrency(closingBalance)}</strong>
                </div>
              </div>
            </div>

            {/* Print & Export Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>
                  Transaction Details
                </h4>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                  }}
                >
                  {form.reportMode === 'summary' ? 'Head Office' : 'Consolidated'} view
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '30px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                >
                  <FaPrint size={14} />
                  Print
                </button>
                <button
                  onClick={handleExportExcel}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '30px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#059669')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#10b981')}
                >
                  <FaFileExcel size={14} />
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Statement Table or Empty Message */}
            <div ref={tableRef} style={{ overflowX: 'auto' }}>
              {statementData.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px dashed #d1d5db',
                    color: '#6b7280',
                  }}
                >
                  <p style={{ fontSize: '1rem', margin: 0 }}>
                    No transactions found for the selected period.
                  </p>
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f9fafb',
                        borderBottom: '2px solid #e5e7eb',
                      }}
                    >
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Description</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>
                        Debit (₵)
                      </th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>
                        Credit (₵)
                      </th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>
                        Balance (₵)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa',
                        }}
                      >
                        <td style={tdStyle}>{row.date}</td>
                        <td style={tdStyle}>{row.description}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            textAlign: 'right',
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        backgroundColor: '#f3f4f6',
                        fontWeight: 600,
                        borderTop: '2px solid #d1d5db',
                      }}
                    >
                      <td colSpan="2" style={{ ...tdStyle, textAlign: 'right' }}>
                        Totals
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {formatCurrency(totalDebit)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {formatCurrency(totalCredit)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {formatCurrency(closingBalance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Summary info (optional) */}
            {statementData.length > 0 && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#4b5563',
                  backgroundColor: '#f9fafb',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span>
                  Total Debits: <strong>{formatCurrency(totalDebit)}</strong>
                </span>
                <span>
                  Total Credits: <strong>{formatCurrency(totalCredit)}</strong>
                </span>
                <span>
                  Closing Balance: <strong>{formatCurrency(closingBalance)}</strong>
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
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
  boxSizing: 'border-box',
};

const thStyle = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#374151',
};

const tdStyle = {
  padding: '10px 12px',
  color: '#111827',
};

export default InternalAccountStatement;