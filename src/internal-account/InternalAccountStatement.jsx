import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { FaPrint, FaFileExcel } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const InternalAccountStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [tellers, setTellers] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTellers, setLoadingTellers] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [form, setForm] = useState({
    accountNumber: '',
    reportMode: 'summary',
    fromDate: '',
    toDate: '',
    tellerId: '',
  });
  const [statementData, setStatementData] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [selectedTellerName, setSelectedTellerName] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ rawResponse: null, extractedCount: 0, entityId: null });
  const tableRef = useRef(null);

  // Fetch GL accounts
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

  // Fetch tellers
  useEffect(() => {
    const fetchTellers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/tills/tellers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tellerData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setTellers(tellerData);
      } catch (error) {
        console.error('Error fetching tellers:', error);
        toast.error('Failed to load tellers');
      } finally {
        setLoadingTellers(false);
      }
    };
    fetchTellers();
  }, []);

  // Build combined options
  const combinedOptions = React.useMemo(() => {
    const accountOpts = (accounts || []).map((acc) => ({
      value: `acc-${acc.accountCode}`,
      label: `${acc.accountCode} - ${acc.accountName} (Account)`,
      type: 'account',
      id: acc.accountCode,
      name: acc.accountName,
      tellerId: null,
    }));
    const tellerOpts = (tellers || []).map((t) => {
      const id = t.id || t.userId || t.user_id;
      const name = t.fullName || t.full_name || t.name || t.fullname || 'Unknown';
      const tellerId = t.tellerId || t.teller_id || id;
      const displayId = tellerId || 'N/A';
      return {
        value: `teller-${tellerId}`,
        label: `${name} (${displayId}) (Teller)`,
        type: 'teller',
        id: tellerId,
        name: name,
        userId: id,
      };
    });
    return [...accountOpts, ...tellerOpts];
  }, [accounts, tellers]);

  const selectedOption = combinedOptions.find(
    (opt) => opt.value === (selectedEntity ? `${selectedEntity.type}-${selectedEntity.id}` : '')
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntityChange = (selected) => {
    if (selected) {
      setSelectedEntity({
        type: selected.type,
        id: selected.id,
        name: selected.name,
        userId: selected.userId || null,
      });
      if (selected.type === 'account') {
        setForm((prev) => ({ ...prev, accountNumber: selected.id, tellerId: '' }));
        setSelectedTellerName('');
      } else {
        setForm((prev) => ({ ...prev, tellerId: selected.id, accountNumber: '' }));
        setSelectedTellerName(selected.name);
      }
    } else {
      setSelectedEntity(null);
      setForm((prev) => ({ ...prev, accountNumber: '', tellerId: '' }));
      setSelectedTellerName('');
    }
  };

  // Extract transactions and info from response
  const extractData = (responseData) => {
    let transactions = [];
    let info = {
      accountName: '',
      currency: 'GHS',
      openingBalance: 0,
      closingBalance: 0,
      tellerName: '',
      tellerId: '',
    };

    console.log('🔍 Full API Response:', JSON.stringify(responseData, null, 2));

    let data = responseData?.data || responseData;
    if (data && data.data && typeof data.data === 'object') {
      data = data.data;
    }

    if (data) {
      transactions = data.transactions || data.items || data.results || data.records || [];
      if (!Array.isArray(transactions)) transactions = [];

      if (transactions.length === 0 && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key]) && data[key].length > 0) {
            console.log(`Found array in key "${key}"`, data[key]);
            transactions = data[key];
            break;
          }
        }
      }

      info.accountName = data.accountName || data.tellerName || data.name || '';
      info.currency = data.currency || 'GHS';
      info.openingBalance = parseFloat(data.openingBalance) || 0;
      info.closingBalance = parseFloat(data.closingBalance) || 0;
      info.tellerName = data.tellerName || data.teller_name || '';
      info.tellerId = data.tellerId || data.teller_id || '';
    }

    console.log(`📊 Extracted ${transactions.length} transactions.`, transactions);
    console.log('ℹ️ Info:', info);

    return { transactions, info };
  };

  // --- Generate Statement ---
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (form.reportMode === 'teller') {
      if (!selectedEntity || selectedEntity.type !== 'teller') {
        toast.error('Please select a teller.');
        return;
      }
    } else {
      if (!selectedEntity || selectedEntity.type !== 'account') {
        toast.error('Please select an account.');
        return;
      }
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
      let url, params;

      const fromDateTime = form.fromDate + 'T00:00:00';
      const toDateTime = form.toDate + 'T23:59:59';

      if (form.reportMode === 'teller') {
        url = `${API_BASE_URL}/api/teller-statement`;
        params = {
          //tellerId: selectedEntity.id,
          accountName: selectedEntity.name, // send the account name
          fromDate: fromDateTime,
          toDate: toDateTime,
        };
      } else {
        url = `${API_BASE_URL}/api/internal-account-statement`;
        params = {
          accountCode: selectedEntity.id,
          fromDate: fromDateTime,
          toDate: toDateTime,
          tellerId: form.tellerId || undefined,
        };
      }

      console.log('🚀 Request params:', params);

      const response = await axios.get(url, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const { transactions, info } = extractData(response.data);

      setAccountName(info.accountName || selectedEntity.name);
      setCurrency(info.currency);
      setOpeningBalance(info.openingBalance);
      setClosingBalance(info.closingBalance);
      if (info.tellerName) setSelectedTellerName(info.tellerName);

      const mappedTransactions = transactions.map((item) => ({
        transactionDate: item.transactionDate || item.transaction_date || item.date || '',
        transactionDateTime: item.transactionDateTime || item.created_at || item.transaction_date || item.date || '',
        valueDate: item.valueDate || item.transactionDate || item.transaction_date || item.date || '',
        description: item.description || item.narration || item.remarks || '',
        debit: parseFloat(item.debit) || parseFloat(item.Debit) || parseFloat(item.debitAmount) || 0,
        credit: parseFloat(item.credit) || parseFloat(item.Credit) || parseFloat(item.creditAmount) || 0,
        balance: parseFloat(item.balance) || parseFloat(item.Balance) || parseFloat(item.balanceAmount) || 0,
        _raw: item,
      }));

      const hasRealTransactions = mappedTransactions.length > 0;

      const openingRow = {
        transactionDate: '',
        transactionDateTime: '',
        valueDate: '',
        description: 'Opening Balance',
        debit: 0,
        credit: 0,
        balance: info.openingBalance,
        isOpening: true,
      };

      const closingRow = {
        transactionDate: '',
        transactionDateTime: '',
        valueDate: '',
        description: 'Closing Balance',
        debit: 0,
        credit: 0,
        balance: info.closingBalance,
        isClosing: true,
      };

      let rows = [openingRow];
      if (hasRealTransactions) {
        rows = rows.concat(mappedTransactions);
      } else {
        rows.push({
          transactionDate: '',
          transactionDateTime: '',
          valueDate: '',
          description: 'No transactions found for the selected period.',
          debit: 0,
          credit: 0,
          balance: 0,
          isNoData: true,
        });
      }
      rows.push(closingRow);

      setStatementData(rows);
      setHasTransactions(hasRealTransactions);
      setDebugInfo({
        rawResponse: response.data,
        extractedCount: transactions.length,
        entityId: selectedEntity.id,
      });
      setShowResults(true);
      toast.success('Statement generated successfully.');
    } catch (error) {
      console.error('Statement Error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate statement.');
    } finally {
      setLoadingStatement(false);
    }
  };

  // --- Print & Export ---
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (statementData.length === 0) {
      toast.warn('No data to export.');
      return;
    }

    const headers = ['S/N', 'Transaction Date', 'Value Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = statementData.map((t, idx) => [
      idx + 1,
      t.isOpening || t.isClosing || t.isNoData ? '' : formatDateTime(t.transactionDateTime || t.transactionDate),
      t.isOpening || t.isClosing || t.isNoData ? '' : formatDate(t.valueDate),
      t.description,
      Number(t.debit).toFixed(2),
      Number(t.credit).toFixed(2),
      Number(t.balance).toFixed(2),
    ]);
    const totalDebit = statementData.reduce((sum, t) => sum + Number(t.debit), 0);
    const totalCredit = statementData.reduce((sum, t) => sum + Number(t.credit), 0);
    rows.push(['', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), '']);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `Statement_${selectedEntity?.id || 'entity'}.csv`);
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
            View transactions and balances for a selected account or teller over a period.
          </p>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleGenerate} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.5fr 1.5fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>
                {form.reportMode === 'teller' ? 'Teller *' : 'Account *'}
              </label>
              <Select
                options={combinedOptions}
                value={selectedOption}
                onChange={handleEntityChange}
                placeholder={form.reportMode === 'teller' ? 'Search teller...' : 'Search account...'}
                isLoading={loadingAccounts || loadingTellers}
                isDisabled={loadingAccounts || loadingTellers}
                styles={customSelectStyles}
                noOptionsMessage={() => 'No options found'}
              />
              {(loadingAccounts || loadingTellers) && (
                <p style={{ fontSize: '0.7rem', color: '#6b7a8a', margin: '2px 0 0' }}>Loading...</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Report Mode</label>
              <select name="reportMode" value={form.reportMode} onChange={handleChange} style={inputStyle}>
                <option value="summary">Head Office</option>
                <option value="detailed">Consolidated</option>
                <option value="teller">Teller Statement</option>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
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

        {/* Results */}
        {showResults && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-block', borderBottom: '3px solid #1e4f8a', paddingBottom: '6px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0b1a33', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  YONKOPA MICRO CREDIT ENTERPRISE
                </h2>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '12px 24px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>
                  {form.reportMode === 'teller' ? 'Teller Name:' : 'Account Name:'}
                </span>
                <strong style={{ wordBreak: 'break-word' }}>{accountName}</strong>
              </div>

              {form.reportMode === 'teller' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Teller ID:</span>
                  <strong>{selectedEntity?.id}</strong>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Account Number:</span>
                  <strong>{selectedEntity?.id}</strong>
                </div>
              )}

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
              {form.reportMode !== 'teller' && selectedTellerName && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Teller (Filter):</span>
                  <strong>{selectedTellerName}</strong>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Opening Balance:</span>
                <strong style={{ color: '#1e4f8a' }}>{formatCurrency(openingBalance)}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ color: '#4a5a6e', fontWeight: 500, width: '160px', flexShrink: 0 }}>Closing Balance:</span>
                <strong style={{ color: '#0b7e3d' }}>{formatCurrency(closingBalance)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 600, color: '#0b1a33', fontSize: '1.1rem' }}>Transaction Details</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#6b7a8a' }}>
                  {form.reportMode === 'teller'
                    ? `Teller Statement for ${selectedTellerName || selectedEntity?.id}`
                    : `${form.reportMode === 'summary' ? 'Head Office' : 'Consolidated'} view`}
                  {selectedTellerName && form.reportMode !== 'teller' && ` • Filtered by Teller: ${selectedTellerName}`}
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

            <div ref={tableRef} style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e9f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif", tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e4f8a' }}>
                    <th style={{ ...thStyle, width: '6%', textAlign: 'center', padding: '14px 8px', color: '#fff' }}>#</th>
                    <th style={{ ...thStyle, width: '18%', padding: '14px 8px', color: '#fff' }}>Transaction Date</th>
                    <th style={{ ...thStyle, width: '16%', padding: '14px 8px', color: '#fff' }}>Value Date</th>
                    <th style={{ ...thStyle, width: '28%', maxWidth: '200px', padding: '14px 8px', wordBreak: 'break-word', color: '#fff' }}>Description</th>
                    <th style={{ ...thStyle, width: '12%', textAlign: 'right', padding: '14px 8px', color: '#fff' }}>Debit (₵)</th>
                    <th style={{ ...thStyle, width: '12%', textAlign: 'right', padding: '14px 8px', color: '#fff' }}>Credit (₵)</th>
                    <th style={{ ...thStyle, width: '12%', textAlign: 'right', padding: '14px 8px', color: '#fff' }}>Balance (₵)</th>
                  </tr>
                </thead>
                <tbody>
                  {statementData.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', padding: '40px 20px', color: '#6b7a8a', fontStyle: 'italic' }}>
                        No transactions found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {statementData.map((row, idx) => {
                        const isOpening = row.isOpening;
                        const isClosing = row.isClosing;
                        const isNoData = row.isNoData;
                        const isSpecial = isOpening || isClosing || isNoData;
                        const isEven = idx % 2 === 0;
                        let bgColor = '#ffffff';
                        if (isOpening) bgColor = '#f0f4ff';
                        else if (isClosing) bgColor = '#e6f7ed';
                        else if (isNoData) bgColor = '#fef9e7';
                        else bgColor = isEven ? '#ffffff' : '#f9fbfd';

                        return (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: bgColor,
                              transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSpecial) e.currentTarget.style.backgroundColor = '#eef4ff';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSpecial) {
                                e.currentTarget.style.backgroundColor = isEven ? '#ffffff' : '#f9fbfd';
                              }
                            }}
                          >
                            <td style={{ ...tdStyle, textAlign: 'center', fontWeight: isSpecial ? 700 : 400, padding: '8px 6px' }}>
                              {isSpecial ? '' : idx}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: isSpecial ? 700 : 400, padding: '8px 6px' }}>
                              {isSpecial ? '' : formatDateTime(row.transactionDateTime || row.transactionDate)}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: isSpecial ? 700 : 400, padding: '8px 6px' }}>
                              {isSpecial ? '' : formatDate(row.valueDate)}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: isSpecial ? 700 : 400, fontStyle: isSpecial ? 'italic' : 'normal', padding: '8px 6px', wordBreak: 'break-word' }}>
                              {row.description}
                            </td>
                            {/* Changed debit and credit columns: show "0.00" instead of "—" for regular rows */}
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: isSpecial ? 700 : 400, padding: '8px 6px' }}>
                              {isSpecial ? '' : (row.debit > 0 ? formatCurrency(row.debit) : '0.00')}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: isSpecial ? 700 : 400, padding: '8px 6px' }}>
                              {isSpecial ? '' : (row.credit > 0 ? formatCurrency(row.credit) : '0.00')}
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: isSpecial ? 700 : 500, color: isOpening ? '#1e4f8a' : (isClosing ? '#0b7e3d' : (isNoData ? '#b8860b' : '#0b1a33')), padding: '8px 6px' }}>
                              {isNoData ? '' : formatCurrency(row.balance)}
                            </td>
                          </tr>
                        );
                      })}
                      {hasTransactions && (
                        <tr style={{ backgroundColor: '#e8edf5', fontWeight: 700, borderTop: '2px solid #1e4f8a' }}>
                          <td colSpan="4" style={{ ...tdStyle, textAlign: 'right', padding: '10px 8px', borderBottomLeftRadius: '12px' }}>Totals</td>
                          <td style={{ ...tdStyle, textAlign: 'right', padding: '10px 8px' }}>{formatCurrency(totalDebit)}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', padding: '10px 8px' }}>{formatCurrency(totalCredit)}</td>
                          <td style={{ ...tdStyle, textAlign: 'right', padding: '10px 8px', borderBottomRightRadius: '12px' }}>{formatCurrency(closingBalance)}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {statementData.length > 0 && hasTransactions && (
              <div style={{ fontSize: '0.85rem', color: '#3a4a5e', backgroundColor: '#f1f5f9', padding: '12px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                <span>Total Debits: <strong>{formatCurrency(totalDebit)}</strong></span>
                <span>Total Credits: <strong>{formatCurrency(totalCredit)}</strong></span>
                <span>Closing Balance: <strong>{formatCurrency(closingBalance)}</strong></span>
              </div>
            )}

            {/* Debug Info Panel */}
            {debugInfo.rawResponse && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid #b0d4f1', fontSize: '0.85rem' }}>
                <h5 style={{ margin: '0 0 8px', color: '#1e4f8a' }}>🔍 Debug Information</h5>
                <div><strong>Selected Entity ID:</strong> {debugInfo.entityId}</div>
                <div><strong>Transactions extracted:</strong> {debugInfo.extractedCount}</div>
                <details>
                  <summary style={{ cursor: 'pointer', color: '#1e4f8a', fontWeight: 500 }}>View Raw API Response</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflow: 'auto', backgroundColor: '#fff', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    {JSON.stringify(debugInfo.rawResponse, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </>
        )}
      </div>

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