import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaPrint, FaFileExcel, FaMoneyBillWave, FaCalendarAlt, FaUser, FaExchangeAlt } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CallOver = () => {
  const [tellers, setTellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [selectedTeller, setSelectedTeller] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [callOverType, setCallOverType] = useState('deposit');
  const [statementData, setStatementData] = useState([]);
  const [summary, setSummary] = useState({ opening: 0, closing: 0, count: 0, total: 0 });
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTellers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const tellersRes = await axios.get(`${API_BASE_URL}/api/tills/tellers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tellerData = Array.isArray(tellersRes.data)
          ? tellersRes.data
          : tellersRes.data?.data || [];
        setTellers(tellerData);
      } catch (err) {
        setError('Failed to load tellers. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTellers();
  }, []);

  const tellerOptions = useMemo(() => {
    return (tellers || []).map((t) => {
      const id = t.id || t.userId || t.user_id;
      const name = t.fullName || t.full_name || t.name || t.fullname || 'Unknown';
      const tellerId = t.tellerId || t.teller_id || id;
      return {
        value: `teller-${tellerId}`,
        label: `${name} (Teller ID: ${tellerId})`,
        type: 'teller',
        id: tellerId,
        name: name,
      };
    });
  }, [tellers]);

  const handleTellerChange = (selected) => {
    if (selected) {
      setSelectedTeller({
        id: selected.id,
        name: selected.name,
      });
    } else {
      setSelectedTeller(null);
    }
  };

  const processTransactions = (transactions, type) => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.transactionDate || a.date || 0) - new Date(b.transactionDate || b.date || 0)
    );

    let balance = 0;
    const mapped = sorted.map((t) => {
      balance += (t.credit || 0) - (t.debit || 0);
      return { ...t, balance };
    });

    const totalAmount = mapped.reduce((sum, t) => {
      return sum + (type === 'deposit' ? (t.credit || 0) : (t.debit || 0));
    }, 0);

    const closing = mapped.length > 0 ? mapped[mapped.length - 1].balance : 0;

    return {
      transactions: mapped,
      summary: {
        opening: 0,
        closing,
        count: mapped.length,
        total: totalAmount,
      },
    };
  };

  const handleGenerate = async () => {
    if (!selectedTeller) {
      setError('Please select a teller.');
      return;
    }
    if (!fromDate || !toDate) {
      setError('Please select both From and To dates.');
      return;
    }
    if (fromDate > toDate) {
      setError('From date cannot be later than To date.');
      return;
    }

    setError('');
    setSuccess('');
    setShowResults(false);
    setLoadingStatement(true);

    try {
      const token = localStorage.getItem('token');
      const fromDateTime = fromDate + 'T00:00:00';
      const toDateTime = toDate + 'T23:59:59';

      // Invert the type because the backend interprets it oppositely
      const invertedType = callOverType === 'deposit' ? 'withdrawal' : 'deposit';

      const params = {
        accountName: selectedTeller.name,
        fromDate: fromDateTime,
        toDate: toDateTime,
        type: invertedType,
      };

      console.log('🔁 User selected:', callOverType, '→ Sending type:', params.type);

      const response = await axios.get(`${API_BASE_URL}/api/teller-callover`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = response.data?.data || response.data;
      if (data && data.data && typeof data.data === 'object') {
        data = data.data;
      }

      const transactions = data.transactions || data.items || data.results || [];
      const info = {
        accountName: data.accountName || data.tellerName || selectedTeller.name,
        currency: data.currency || 'GHS',
        openingBalance: parseFloat(data.openingBalance) || 0,
        closingBalance: parseFloat(data.closingBalance) || 0,
      };

      setAccountName(info.accountName);
      setCurrency(info.currency);

      const result = processTransactions(transactions, callOverType);
      setStatementData(result.transactions);
      setSummary(result.summary);

      setShowResults(true);
      setSuccess(`${callOverType.charAt(0).toUpperCase() + callOverType.slice(1)} call-over generated successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate call-over.');
      console.error(err);
    } finally {
      setLoadingStatement(false);
    }
  };

  const handlePrint = () => window.print();

  // Headers: show amount + Inputer/Authorizer
  const getHeaders = () => {
    const baseHeaders = [
      { key: 'sn', label: 'S/N' },
      { key: 'transactionDate', label: 'Transaction Date' },
      { key: 'referenceNumber', label: 'Reference Number' },
      { key: 'accountNumber', label: 'Account Number' },
      { key: 'accountName', label: 'Account Name' },
      { key: 'narration', label: 'Narration' },
    ];
    if (callOverType === 'deposit') {
      return [
        ...baseHeaders,
        { key: 'debit', label: 'Debit (₵)' },
        { key: 'inputerAuthorizer', label: 'Inputer Authorizer' },
      ];
    } else {
      return [
        ...baseHeaders,
        { key: 'credit', label: 'Credit (₵)' },
        { key: 'inputerAuthorizer', label: 'Inputer Authorizer' },
      ];
    }
  };

  const handleExportExcel = () => {
    if (statementData.length === 0) {
      setError('No data to export.');
      return;
    }

    const headers = getHeaders().map(h => h.label);
    const rows = statementData.map((row, idx) => {
      const getValue = (key) => {
        switch (key) {
          case 'sn': return idx + 1;
          case 'transactionDate': return formatDateTime(row.transactionDateTime || row.transactionDate || row.date || '');
          case 'referenceNumber': return row.reference || row.referenceNumber || '';
          case 'accountNumber': return row.account_number || row.accountNumber || '';
          case 'accountName': return row.account_name || row.accountName || '';
          case 'narration': return row.description || row.description || row.narrative || '';
          case 'debit': {
            let amount = callOverType === 'deposit' ? row.credit : row.debit;
            if (!amount) amount = callOverType === 'deposit' ? row.debit : row.credit;
            return Number(amount || 0).toFixed(2);
          }
          case 'credit': {
            let amount = callOverType === 'withdrawal' ? row.debit : row.credit;
            if (!amount) amount = callOverType === 'withdrawal' ? row.credit : row.debit;
            return Number(amount || 0).toFixed(2);
          }
          case 'inputerAuthorizer':
            return row.inputerAuthorizer || row.inputer || row.authorizer || '';
          default: return '';
        }
      };
      return getHeaders().map(h => getValue(h.key));
    });

    const totalsRow = getHeaders().map(h => {
      if (h.key === 'sn') return 'TOTAL';
      if (h.key === 'debit' || h.key === 'credit') return summary.total.toFixed(2);
      return '';
    });
    rows.push(totalsRow);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${callOverType}_CallOver_${selectedTeller?.id || 'teller'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => `₵ ${Number(amount).toFixed(2)}`;

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
    } catch {
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
    } catch {
      return dateString;
    }
  };

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

  const selectedOption = tellerOptions.find(
    (opt) => opt.value === (selectedTeller ? `teller-${selectedTeller.id}` : '')
  );

  return (
    <div className="call-over-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0b1a33', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#1e4f8a', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '1.2rem' }}>
            <FaMoneyBillWave />
          </span>
          Teller Call‑Over
        </h2>
        <p style={{ color: '#6b7a8a', margin: '6px 0 0', fontSize: '0.95rem' }}>
          Generate deposit or withdrawal call-over reports for tellers.
        </p>
      </div>

      <div className="card" style={{ borderRadius: '16px', border: '1px solid #e5e9f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>
                <FaUser style={{ marginRight: '6px' }} /> Search Teller
              </label>
              <Select
                options={tellerOptions}
                value={selectedOption}
                onChange={handleTellerChange}
                placeholder={loading ? 'Loading...' : 'Type to search...'}
                isLoading={loading}
                isDisabled={loading}
                styles={customSelectStyles}
                noOptionsMessage={() => loading ? 'Loading...' : 'No tellers found'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>
                <FaCalendarAlt style={{ marginRight: '6px' }} /> From Date
              </label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #d1d9e6', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>
                <FaCalendarAlt style={{ marginRight: '6px' }} /> To Date
              </label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #d1d9e6', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>
                <FaExchangeAlt style={{ marginRight: '6px' }} /> Call‑Over Type
              </label>
              <select
                value={callOverType}
                onChange={(e) => setCallOverType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #d1d9e6', fontSize: '0.9rem', background: '#fff' }}
              >
                <option value="deposit">Deposits Only</option>
                <option value="withdrawal">Withdrawals Only</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!selectedTeller || loadingStatement}
              style={{
                padding: '10px 40px',
                borderRadius: '40px',
                border: 'none',
                backgroundColor: (!selectedTeller || loadingStatement) ? '#94a3b8' : '#1e4f8a',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: (!selectedTeller || loadingStatement) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 6px -1px rgba(30, 79, 138, 0.2)',
              }}
              onMouseEnter={(e) => { if (selectedTeller && !loadingStatement) e.target.style.backgroundColor = '#163d6b'; }}
              onMouseLeave={(e) => { if (selectedTeller && !loadingStatement) e.target.style.backgroundColor = '#1e4f8a'; }}
            >
              {loadingStatement ? 'Generating...' : `Generate ${callOverType === 'deposit' ? 'Deposit' : 'Withdrawal'} Call‑Over`}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '16px' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#166534', marginBottom: '16px' }}>{success}</div>}

      {showResults && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0b1a33', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
              YONKOPA MICRO CREDIT ENTERPRISE
            </h3>
            <div style={{ width: '60px', height: '3px', background: '#1e4f8a', margin: '6px auto 0' }} />
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 24px' }}>
            <div><span style={{ color: '#4a5a6e', fontSize: '0.8rem' }}>Teller</span><br /><strong>{accountName}</strong></div>
            <div><span style={{ color: '#4a5a6e', fontSize: '0.8rem' }}>Currency</span><br /><strong>{currency}</strong></div>
            <div><span style={{ color: '#4a5a6e', fontSize: '0.8rem' }}>Period</span><br /><strong>{formatDate(fromDate)} – {formatDate(toDate)}</strong></div>
            <div><span style={{ color: '#4a5a6e', fontSize: '0.8rem' }}>Generated</span><br /><strong style={{ fontSize: '0.85rem' }}>{generatedOnFull}</strong></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 18px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.75rem', color: '#4a5a6e' }}>Total {callOverType === 'deposit' ? 'Deposits' : 'Withdrawals'}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: callOverType === 'deposit' ? '#10b981' : '#ef4444' }}>
                {formatCurrency(summary.total)}
              </div>
            </div>
            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '14px 18px', border: '1px solid #dbeafe' }}>
              <div style={{ fontSize: '0.75rem', color: '#4a5a6e' }}>Transaction Count</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e4f8a' }}>
                {summary.count}
              </div>
            </div>
            <div style={{ background: '#fefce8', borderRadius: '10px', padding: '14px 18px', border: '1px solid #fef9c3' }}>
              <div style={{ fontSize: '0.75rem', color: '#4a5a6e' }}>Closing Balance</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0b1a33' }}>
                {formatCurrency(summary.closing)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h5 style={{ margin: 0, fontWeight: 600, color: '#0b1a33' }}>
              {callOverType === 'deposit' ? 'Deposit' : 'Withdrawal'} Transactions
            </h5>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handlePrint} style={{ padding: '6px 18px', borderRadius: '20px', border: '1px solid #d1d9e6', background: '#fff', color: '#1e4f8a', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; }}
              >
                <FaPrint size={12} /> Print
              </button>
              <button onClick={handleExportExcel} style={{ padding: '6px 18px', borderRadius: '20px', border: 'none', background: '#0b7e3d', color: '#fff', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#09632f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0b7e3d'}
              >
                <FaFileExcel size={12} /> Export
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e5e9f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#1e4f8a' }}>
                  {getHeaders().map((h) => (
                    <th
                      key={h.key}
                      style={{
                        padding: '12px 14px',
                        textAlign: h.key === 'sn' ? 'center' : 'left',
                        color: '#fff',
                      }}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statementData.length === 0 ? (
                  <tr>
                    <td colSpan={getHeaders().length} style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7a8a', fontStyle: 'italic' }}>
                      No {callOverType} transactions found for the selected period.
                    </td>
                  </tr>
                ) : (
                  statementData.map((row, idx) => {
                    const isEven = idx % 2 === 0;
                    if (idx === 0) console.log('First transaction:', row);

                    const getCellValue = (key) => {
                      switch (key) {
                        case 'sn': return idx + 1;
                        case 'transactionDate': return formatDateTime(row.transactionDateTime || row.transactionDate || row.date || '');
                        case 'referenceNumber': return row.reference || row.referenceNumber || '';
                        case 'accountNumber': return row.account_number || row.accountNumber || '';
                        case 'accountName': return row.account_name || row.accountName || '';
                        case 'narration': return row.description || row.description || row.narrative || '';
                        case 'debit': {
                          let amount = callOverType === 'deposit' ? row.credit : row.debit;
                          if (!amount || amount === 0) amount = callOverType === 'deposit' ? row.debit : row.credit;
                          return amount > 0 ? formatCurrency(amount) : '0.00';
                        }
                        case 'credit': {
                          let amount = callOverType === 'withdrawal' ? row.debit : row.credit;
                          if (!amount || amount === 0) amount = callOverType === 'withdrawal' ? row.credit : row.debit;
                          return amount > 0 ? formatCurrency(amount) : '0.00';
                        }
                        case 'inputerAuthorizer':
                          return row.inputerAuthorizer || row.inputer || row.authorizer || '';
                        default: return '';
                      }
                    };

                    return (
                      <tr key={idx} style={{ background: isEven ? '#ffffff' : '#f9fbfd' }}>
                        {getHeaders().map((h) => (
                          <td
                            key={h.key}
                            style={{
                              padding: '10px 14px',
                              textAlign: h.key === 'sn' ? 'center' : 'left',
                              fontWeight: (h.key === 'debit' || h.key === 'credit') ? 600 : 'normal',
                              color: h.key === 'debit' ? '#10b981' : (h.key === 'credit' ? '#ef4444' : 'inherit'),
                            }}
                          >
                            {getCellValue(h.key)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
                {statementData.length > 0 && (
                  <tr style={{ background: '#e8edf5', fontWeight: 700, borderTop: '2px solid #1e4f8a' }}>
                    {getHeaders().map((h) => {
                      let content = '';
                      if (h.key === 'sn') content = 'Totals';
                      else if (h.key === 'debit' || h.key === 'credit') content = formatCurrency(summary.total);
                      return (
                        <td
                          key={h.key}
                          style={{
                            padding: '10px 14px',
                            textAlign: h.key === 'sn' ? 'center' : (h.key === 'debit' || h.key === 'credit' ? 'right' : 'left'),
                          }}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {statementData.length > 0 && (
            <div style={{ marginTop: '14px', padding: '12px 18px', background: '#f1f5f9', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.85rem' }}>
              <span>Total {callOverType === 'deposit' ? 'Deposits' : 'Withdrawals'}: <strong>{formatCurrency(summary.total)}</strong></span>
              <span>Transaction Count: <strong>{summary.count}</strong></span>
              <span>Closing Balance: <strong>{formatCurrency(summary.closing)}</strong></span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CallOver;