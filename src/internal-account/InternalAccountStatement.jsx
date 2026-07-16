import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FaPrint, FaFileExcel } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const InternalAccountStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [form, setForm] = useState({
    accountNumber: '',
    reportMode: 'summary',
    fromDate: '',
    toDate: '',
  });
  const [statementData, setStatementData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const tableRef = useRef(null);

  // Fetch GL accounts for dropdown
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

  const accountOptions = accounts.map((acc) => ({
    value: acc.accountCode,
    label: `${acc.accountCode} - ${acc.accountName}`,
  }));

  const selectedOption = accountOptions.find(
    (opt) => opt.value === form.accountNumber
  );

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

  // --- Generate Statement ---
  const handleGenerate = async (e) => {
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

    setLoadingStatement(true);
    setShowResults(false);

    try {
      const token = localStorage.getItem('token');
      const url = `${API_BASE_URL}/api/internal-account-statement`;
      const params = {
        accountCode: form.accountNumber,
        fromDate: form.fromDate,
        toDate: form.toDate,
      };

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseData = response.data;
      let transactions = [];
      let accountInfo = {};

      if (responseData && responseData.data) {
        const { data } = responseData;
        transactions = data.transactions || [];
        accountInfo = {
          accountName: data.accountName || selectedAccount?.accountName || form.accountNumber,
          currency: data.currency || selectedAccount?.currency || 'GHS',
          openingBalance: data.openingBalance || 0,
          closingBalance: data.closingBalance || 0,
        };
      } else if (responseData && responseData.transactions) {
        transactions = responseData.transactions || [];
        accountInfo = {
          accountName: responseData.accountName || selectedAccount?.accountName || form.accountNumber,
          currency: responseData.currency || selectedAccount?.currency || 'GHS',
          openingBalance: responseData.openingBalance || 0,
          closingBalance: responseData.closingBalance || 0,
        };
      } else {
        toast.error('Unexpected response from server.');
        setLoadingStatement(false);
        return;
      }

      setAccountName(accountInfo.accountName);
      setCurrency(accountInfo.currency);
      setOpeningBalance(accountInfo.openingBalance);
      setClosingBalance(accountInfo.closingBalance);

      // Map transactions – only include description (narration removed)
      const mappedTransactions = transactions.map((item) => ({
        transactionDate: item.transactionDate || item.date || '',
        transactionDateTime: item.transactionDateTime || item.transactionDate || '',
        valueDate: item.transactionDate || item.date || '',
        description: item.description || item.narration || '', // fallback to narration if description empty
        debit: Number(item.debit || 0),
        credit: Number(item.credit || 0),
        balance: Number(item.balance || 0),
      }));

      setStatementData(mappedTransactions);
      setShowResults(true);
      toast.success('Statement generated successfully.');

    } catch (error) {
      console.error('Statement Error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate statement.');
    } finally {
      setLoadingStatement(false);
    }
  };

  // --- Print ---
  const handlePrint = () => {
    window.print();
  };

  // --- Export to Excel (CSV) – no narration column ---
  const handleExportExcel = () => {
    if (statementData.length === 0) {
      toast.warn('No data to export.');
      return;
    }

    const headers = ['S/N', 'Transaction Date', 'Value Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = statementData.map((t, idx) => [
      idx + 1,
      formatDateTime(t.transactionDateTime || t.transactionDate),
      formatDate(t.valueDate),
      t.description,
      Number(t.debit).toFixed(2),
      Number(t.credit).toFixed(2),
      Number(t.balance).toFixed(2),
    ]);
    const totalDebit = statementData.reduce((sum, t) => sum + Number(t.debit), 0);
    const totalCredit = statementData.reduce((sum, t) => sum + Number(t.credit), 0);
    rows.push(['', '', '', 'TOTALS', totalDebit.toFixed(2), totalCredit.toFixed(2), '']);

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

  // --- Helpers ---
  const formatCurrency = (amount) => {
    return `₵ ${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return dateString;
    }
  };

  const totalDebit = statementData.reduce((sum, t) => sum + Number(t.debit), 0);
  const totalCredit = statementData.reduce((sum, t) => sum + Number(t.credit), 0);

  const generatedOnFull = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '12px',
      borderColor: '#d1d9e6',
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
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          padding: '36px 40px',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '2px solid #eef2f6', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#0b1a33', margin: 0, letterSpacing: '-0.025em' }}>
            Internal Account Statement
          </h1>
          <p style={{ color: '#6b7a8a', margin: '4px 0 0', fontSize: '0.95rem' }}>
            View transactions and balances for a selected account over a period.
          </p>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleGenerate} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.5fr 1.5fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Account *</label>
              <Select
                options={accountOptions}
                value={selectedOption}
                onChange={handleAccountChange}
                placeholder="Select account"
                isLoading={loadingAccounts}
                isDisabled={loadingAccounts}
                styles={customSelectStyles}
                noOptionsMessage={() => 'No accounts found'}
              />
              {loadingAccounts && <p style={{ fontSize: '0.7rem', color: '#6b7a8a', margin: '2px 0 0' }}>Loading...</p>}
            </div>
            <div>
              <label style={labelStyle}>Report Mode</label>
              <select name="reportMode" value={form.reportMode} onChange={handleChange} style={inputStyle}>
                <option value="summary">Head Office</option>
                <option value="detailed">Consolidated</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>From Date *</label>
              <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>To Date *</label>
              <input type="date" name="toDate" value={form.toDate} onChange={handleChange} style={inputStyle} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e9f0', paddingTop: '24px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loadingStatement}
              style={{
                padding: '10px 40px',
                borderRadius: '40px',
                border: 'none',
                backgroundColor: loadingStatement ? '#94a3b8' : '#1e4f8a',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loadingStatement ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
                fontFamily: 'inherit',
                boxShadow: '0 4px 6px -1px rgba(30, 79, 138, 0.2)',
              }}
              onMouseEnter={(e) => { if (!loadingStatement) e.target.style.backgroundColor = '#163d6b'; }}
              onMouseLeave={(e) => { if (!loadingStatement) e.target.style.backgroundColor = '#1e4f8a'; }}
              onMouseDown={(e) => { if (!loadingStatement) e.target.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { if (!loadingStatement) e.target.style.transform = 'scale(1)'; }}
            >
              {loadingStatement ? 'Generating...' : 'Generate Statement'}
            </button>
          </div>
        </form>

        {/* Results Section */}
        {showResults && (
          <>
            {/* Company Heading */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-block', borderBottom: '3px solid #1e4f8a', paddingBottom: '6px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0b1a33', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  YONKOPA MICRO CREDIT ENTERPRISE
                </h2>
              </div>
            </div>

            {/* Account Details */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '12px 24px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Account Name:</span>
                <strong style={{ wordBreak: 'break-word' }}>{accountName}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Account Number:</span>
                <strong>{form.accountNumber}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Currency:</span>
                <strong>{currency}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Generated On:</span>
                <strong style={{ wordBreak: 'break-word' }}>{generatedOnFull}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>From:</span>
                <strong>{formatDate(form.fromDate)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>To:</span>
                <strong>{formatDate(form.toDate)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Opening Balance:</span>
                <strong>{formatCurrency(openingBalance)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Closing Balance:</span>
                <strong>{formatCurrency(closingBalance)}</strong>
              </div>
            </div>

            {/* Print & Export Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 600, color: '#0b1a33', fontSize: '1.1rem' }}>Transaction Details</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#6b7a8a' }}>
                  {form.reportMode === 'summary' ? 'Head Office' : 'Consolidated'} view
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handlePrint} style={{ padding: '8px 20px', borderRadius: '30px', border: '1px solid #d1d9e6', backgroundColor: '#fff', color: '#1e4f8a', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#f1f5f9'; e.target.style.borderColor = '#1e4f8a'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#d1d9e6'; }}
                >
                  <FaPrint size={14} /> Print
                </button>
                <button onClick={handleExportExcel} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', backgroundColor: '#0b7e3d', color: '#fff', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#09632f'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#0b7e3d'}
                >
                  <FaFileExcel size={14} /> Export to Excel
                </button>
              </div>
            </div>

            {/* Table – Narration removed, only Description */}
            <div ref={tableRef} style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 2px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f4f9' }}>
                    <th style={{ ...thStyle, borderTopLeftRadius: '8px', textAlign: 'center' }}>S/N</th>
                    <th style={thStyle}>Transaction Date</th>
                    <th style={thStyle}>Value Date</th>
                    <th style={thStyle}>Description</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Debit (₵)</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Credit (₵)</th>
                    <th style={{ ...thStyle, textAlign: 'right', borderTopRightRadius: '8px' }}>Balance (₵)</th>
                  </tr>
                </thead>
                <tbody>
                  {statementData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '32px 14px' }}>
                        No transactions found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {statementData.map((row, idx) => (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fbfd', transition: 'background-color 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef4ff'}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fbfd'; }}
                        >
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{idx + 1}</td>
                          <td style={tdStyle}>{formatDateTime(row.transactionDateTime || row.transactionDate)}</td>
                          <td style={tdStyle}>{formatDate(row.valueDate)}</td>
                          <td style={tdStyle}>{row.description}</td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>{Number(row.debit) > 0 ? formatCurrency(row.debit) : '—'}</td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>{Number(row.credit) > 0 ? formatCurrency(row.credit) : '—'}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500, color: '#0b1a33' }}>{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#e8edf5', fontWeight: 600 }}>
                        <td colSpan="4" style={{ ...tdStyle, textAlign: 'right', borderBottomLeftRadius: '8px' }}>Totals</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(totalDebit)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(totalCredit)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', borderBottomRightRadius: '8px' }}>{formatCurrency(closingBalance)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {statementData.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: '#3a4a5e', backgroundColor: '#f1f5f9', padding: '12px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <span>Total Debits: <strong>{formatCurrency(totalDebit)}</strong></span>
                <span>Total Credits: <strong>{formatCurrency(totalCredit)}</strong></span>
                <span>Closing Balance: <strong>{formatCurrency(closingBalance)}</strong></span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// --- Styles ---
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 500,
  color: '#4a5a6e',
  marginBottom: '6px',
  letterSpacing: '0.3px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '0.9rem',
  border: '1px solid #d1d9e6',
  borderRadius: '12px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const thStyle = {
  padding: '12px 14px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#1e2f4a',
  fontSize: '0.85rem',
  letterSpacing: '0.3px',
  borderBottom: '1px solid #d1d9e6',
};

const tdStyle = {
  padding: '10px 14px',
  color: '#1e2f4a',
  borderBottom: '1px solid #eef2f6',
};

export default InternalAccountStatement;