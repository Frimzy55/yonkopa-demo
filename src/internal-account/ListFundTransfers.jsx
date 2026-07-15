import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ListFundTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    transferType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  // Modal for viewing details
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch transfers with filters & pagination
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        transferType: filters.transferType || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const response = await axios.get(`${API_BASE_URL}/api/transfers`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      // Assuming API returns: { data: [], total, page, totalPages }
      setTransfers(response.data.data || []);
      setPagination({
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accounts for account name mapping
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re‑fetch when filters or pagination changes
  useEffect(() => {
    fetchTransfers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTransfers();
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getAccountName = (id) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.accountNumber} - ${acc.accountName || 'Account'}` : 'N/A';
  };

  const formatCurrency = (amount) => {
    return `₵ ${Number(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      Pending: { bg: '#fef3c7', color: '#92400e' },
      Approved: { bg: '#d1fae5', color: '#065f46' },
      Completed: { bg: '#d1fae5', color: '#065f46' },
      Rejected: { bg: '#fee2e2', color: '#991b1b' },
      Failed: { bg: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || { bg: '#f3f4f6', color: '#374151' };
  };

  // Approve transfer
  const handleApprove = async (id) => {
    if (!window.confirm('Approve this transfer?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/transfers/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Transfer approved');
      fetchTransfers(); // refresh
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast.error('Failed to approve transfer');
    }
  };

  // View modal
  const handleView = (transfer) => {
    setSelectedTransfer(transfer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTransfer(null);
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>List of Fund Transfers</h2>
        <div style={styles.headerUnderline} />
      </div>

      {/* Search & Filters */}
      <div style={styles.filterContainer}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            name="search"
            placeholder="Search by Reference / Account"
            value={filters.search}
            onChange={handleFilterChange}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Search
          </button>
        </form>

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Transfer Type</label>
            <select
              name="transferType"
              value={filters.transferType}
              onChange={handleFilterChange}
              style={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="Internal">Internal</option>
              <option value="GL Transfer">GL Transfer</option>
              <option value="Inter-Branch">Inter-Branch</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={styles.filterSelect}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date Range</label>
            <div style={styles.dateRange}>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                style={styles.dateInput}
              />
              <span style={{ margin: '0 8px', color: '#6b7280' }}>to</span>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                style={styles.dateInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <div style={styles.loading}>Loading transfers...</div>
        ) : transfers.length === 0 ? (
          <div style={styles.empty}>No transfers found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ref No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>From Account</th>
                <th style={styles.th}>To Account</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => {
                const statusStyle = getStatusBadgeStyle(t.status);
                return (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>{t.reference || t.id}</td>
                    <td style={styles.td}>{formatDate(t.transferDate || t.createdAt)}</td>
                    <td style={styles.td}>{getAccountName(t.fromAccountId)}</td>
                    <td style={styles.td}>{getAccountName(t.toAccountId)}</td>
                    <td style={styles.td}>{formatCurrency(t.amount)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleView(t)}
                        style={{ ...styles.actionButton, marginRight: '8px' }}
                      >
                        View
                      </button>
                      {t.status === 'Pending' && (
                        <button
                          onClick={() => handleApprove(t.id)}
                          style={{ ...styles.actionButton, backgroundColor: '#10b981' }}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && transfers.length > 0 && (
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Showing {pagination.page * pagination.limit - pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} Transfers
          </div>
          <div style={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{ ...styles.pageButton, ...(pagination.page <= 1 ? styles.pageButtonDisabled : {}) }}
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                style={{
                  ...styles.pageNumber,
                  ...(p === pagination.page ? styles.pageNumberActive : {}),
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{ ...styles.pageButton, ...(pagination.page >= pagination.totalPages ? styles.pageButtonDisabled : {}) }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && selectedTransfer && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Transfer Details</h3>
              <button onClick={closeModal} style={styles.modalClose}>
                &times;
              </button>
            </div>
            <div style={styles.modalBody}>
              <p><strong>Reference:</strong> {selectedTransfer.reference || selectedTransfer.id}</p>
              <p><strong>Date:</strong> {formatDate(selectedTransfer.transferDate || selectedTransfer.createdAt)}</p>
              <p><strong>From Account:</strong> {getAccountName(selectedTransfer.fromAccountId)}</p>
              <p><strong>To Account:</strong> {getAccountName(selectedTransfer.toAccountId)}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedTransfer.amount)}</p>
              <p><strong>Status:</strong> {selectedTransfer.status}</p>
              <p><strong>Description:</strong> {selectedTransfer.description || '—'}</p>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.modalButton}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0',
    letterSpacing: '-0.025em',
  },
  headerUnderline: {
    height: '4px',
    width: '60px',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    marginBottom: '28px',
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '0.95rem',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  searchButton: {
    padding: '10px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'inherit',
  },
  filtersRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#4b5563',
  },
  filterSelect: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    backgroundColor: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: '160px',
  },
  dateRange: {
    display: 'flex',
    alignItems: 'center',
  },
  dateInput: {
    padding: '8px 12px',
    fontSize: '0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: 'inherit',
    width: '150px',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    fontWeight: 600,
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'inline-block',
  },
  actionButton: {
    padding: '6px 16px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'inherit',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '12px 0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  paginationInfo: {
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  paginationControls: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pageButton: {
    padding: '8px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageNumber: {
    padding: '8px 14px',
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  pageNumberActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6',
  },
  loading: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1rem',
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '1rem',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    maxWidth: '560px',
    width: '90%',
    padding: '28px',
    boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0 4px',
  },
  modalBody: {
    marginBottom: '24px',
    fontSize: '0.95rem',
    lineHeight: '1.8',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: '8px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default ListFundTransfers;