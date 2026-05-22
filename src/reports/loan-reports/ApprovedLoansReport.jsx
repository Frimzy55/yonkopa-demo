// ApprovedLoans.jsx - Added Customer ID column
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './ApprovedLoans.css';

const ApprovedLoansReport = () => {
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [statsView, setStatsView] = useState('cards');

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  const fetchApprovedLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/approved-loan`
      );
      setApprovedLoans(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching approved loans:", err);
      setError("Failed to load approved loans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setShowFilters(false);
  };

  const hasFilter = searchTerm || fromDate || toDate;

  const filteredLoans = approvedLoans.filter((loan) => {
    const nameMatch = loan.applicant_fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const loanDate = loan.approved_date
      ? new Date(loan.approved_date)
      : null;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const fromMatch = from ? loanDate && loanDate >= from : true;
    const toMatch = to ? loanDate && loanDate <= to : true;

    return nameMatch && fromMatch && toMatch;
  });

  const dataToShow = hasFilter ? filteredLoans : [];
  const totalItems = dataToShow.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dataToShow.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper function to safely extract loan amount
  const getLoanAmount = (loan) => {
    const amount = loan.kyc_loan_amount || 
                   loan.loan_amount || 
                   loan.amount || 
                   loan.approved_amount ||
                   0;
    const numAmount = parseFloat(amount);
    return isNaN(numAmount) ? 0 : numAmount;
  };

  // Calculate Statistics (unchanged)
  const calculateStatistics = (loans) => {
    if (!loans || loans.length === 0) {
      return {
        totalAmount: 0,
        highestAmount: 0,
        lowestAmount: 0,
        totalCount: 0,
        monthlyBreakdown: [],
        weeklyBreakdown: [],
        topCustomers: [],
        amountRanges: {
          '0-1000': 0,
          '1001-5000': 0,
          '5001-10000': 0,
          '10001-50000': 0,
          '50000+': 0
        }
      };
    }

    const amounts = loans.map(loan => getLoanAmount(loan));
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const highestAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestAmount = amounts.length > 0 ? Math.min(...amounts) : 0;

    // Monthly breakdown
    const monthlyMap = new Map();
    loans.forEach(loan => {
      if (loan.approved_date) {
        const date = new Date(loan.approved_date);
        const monthKey = format(date, 'MMMM yyyy');
        const amount = getLoanAmount(loan);
        monthlyMap.set(monthKey, {
          count: (monthlyMap.get(monthKey)?.count || 0) + 1,
          amount: (monthlyMap.get(monthKey)?.amount || 0) + amount
        });
      }
    });
    const monthlyBreakdown = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Weekly breakdown (last 4 weeks)
    const weeklyMap = new Map();
    const now = new Date();
    loans.forEach(loan => {
      if (loan.approved_date) {
        const date = new Date(loan.approved_date);
        const weekDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7));
        if (weekDiff < 4) {
          const weekKey = `${weekDiff === 0 ? 'This' : `${weekDiff}`} week${weekDiff !== 1 ? 's' : ''} ago`;
          const amount = getLoanAmount(loan);
          weeklyMap.set(weekKey, {
            count: (weeklyMap.get(weekKey)?.count || 0) + 1,
            amount: (weeklyMap.get(weekKey)?.amount || 0) + amount
          });
        }
      }
    });
    const weeklyBreakdown = Array.from(weeklyMap.entries())
      .map(([period, data]) => ({ period, ...data }));

    // Top customers by loan amount
    const customerMap = new Map();
    loans.forEach(loan => {
      const name = loan.applicant_fullName || 'Unknown';
      const amount = getLoanAmount(loan);
      customerMap.set(name, {
        amount: (customerMap.get(name)?.amount || 0) + amount,
        count: (customerMap.get(name)?.count || 0) + 1,
        phone: loan.mobileNumber || loan.applicant_phone
      });
    });
    const topCustomers = Array.from(customerMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Amount ranges
    const amountRanges = {
      '0-1000': 0,
      '1001-5000': 0,
      '5001-10000': 0,
      '10001-50000': 0,
      '50000+': 0
    };
    
    amounts.forEach(amount => {
      if (amount <= 1000) amountRanges['0-1000']++;
      else if (amount <= 5000) amountRanges['1001-5000']++;
      else if (amount <= 10000) amountRanges['5001-10000']++;
      else if (amount <= 50000) amountRanges['10001-50000']++;
      else amountRanges['50000+']++;
    });

    return {
      totalAmount,
      highestAmount,
      lowestAmount,
      totalCount: loans.length,
      monthlyBreakdown,
      weeklyBreakdown,
      topCustomers,
      amountRanges
    };
  };

  const stats = calculateStatistics(dataToShow);
  const allStats = calculateStatistics(approvedLoans);

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = () => {
    return (
      <span className="badge bg-success">
        <i className="bi bi-check-circle me-1"></i>Approved
      </span>
    );
  };

  // Statistics Cards Component (unchanged)
  const StatisticsCards = ({ stats, title }) => (
    <div className="stats-section mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold">{title}</h5>
        <small className="text-muted">
          <i className="bi bi-bar-chart-steps me-1"></i>
          Updated: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </small>
      </div>
      
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stats-card bg-primary bg-gradient text-white">
            <div className="stats-card-icon">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div className="stats-card-content">
              <h6 className="stats-label">Total Approved Amount</h6>
              <h3 className="stats-value">{formatCurrency(stats.totalAmount)}</h3>
              <small className="stats-sub">
                {stats.totalCount} Loan(s)
              </small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="stats-card bg-primary bg-gradient text-white">
            <div className="stats-card-icon">
              <i className="bi bi-trophy"></i>
            </div>
            <div className="stats-card-content">
              <h6 className="stats-label">Highest Loan</h6>
              <h3 className="stats-value">{formatCurrency(stats.highestAmount)}</h3>
              <small className="stats-sub">Maximum approved</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="stats-card bg-primary bg-gradient text-white">
            <div className="stats-card-icon">
              <i className="bi bi-arrow-down-short"></i>
            </div>
            <div className="stats-card-content">
              <h6 className="stats-label">Lowest Loan</h6>
              <h3 className="stats-value">{formatCurrency(stats.lowestAmount)}</h3>
              <small className="stats-sub">Minimum approved</small>
            </div>
          </div>
        </div>
      </div>

      {stats.totalCount > 0 && (
        <div className="detailed-stats">
          {/* ... rest of detailed stats (unchanged) ... */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title fw-semibold mb-3">
                    <i className="bi bi-pie-chart me-2"></i>
                    Loan Amount Distribution
                  </h6>
                  <div className="amount-ranges">
                    {Object.entries(stats.amountRanges).map(([range, count]) => (
                      <div key={range} className="mb-2">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>{range}</span>
                          <span className="fw-semibold">{count} loans</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary"
                            style={{ width: stats.totalCount > 0 ? `${(count / stats.totalCount) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title fw-semibold mb-3">
                    <i className="bi bi-calendar-week me-2"></i>
                    Recent Weekly Activity
                  </h6>
                  {stats.weeklyBreakdown.length > 0 ? (
                    <div className="weekly-stats">
                      {stats.weeklyBreakdown.map((week) => (
                        <div key={week.period} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small fw-semibold">{week.period}</span>
                            <span className="small text-muted">
                              {week.count} loan(s) | {formatCurrency(week.amount)}
                            </span>
                          </div>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-primary"
                              style={{ width: stats.totalAmount > 0 ? `${(week.amount / stats.totalAmount) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title fw-semibold mb-3">
                    <i className="bi bi-trophy me-2"></i>
                    Top 5 Customers by Total Loan Amount
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Customer Name</th>
                          <th>Contact</th>
                          <th>Total Amount</th>
                          <th>Number of Loans</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topCustomers.map((customer, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold">{idx + 1}</td>
                            <td>{customer.name}</td>
                            <td>{customer.phone || 'N/A'}</td>
                            <td className="text-primary fw-semibold">
                              {formatCurrency(customer.amount)}
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {customer.count} loan(s)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {stats.monthlyBreakdown.length > 0 && (
              <div className="col-md-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-semibold mb-3">
                      <i className="bi bi-calendar-month me-2"></i>
                      Monthly Breakdown
                    </h6>
                    <div className="row">
                      {stats.monthlyBreakdown.map((month) => (
                        <div key={month.month} className="col-md-3 mb-3">
                          <div className="border rounded p-2 text-center">
                            <div className="fw-semibold small">{month.month}</div>
                            <div className="text-primary fw-bold">
                              {formatCurrency(month.amount)}
                            </div>
                            <div className="text-muted small">
                              {month.count} loan(s)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="professional-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading approved loans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger alert-dismissible fade show m-3" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
      </div>
    );
  }

  return (
    <div className="approved-loans-container">
      {/* Header Section */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h4 className="mb-1 fw-bold">Approved Loans</h4>
              <p className="text-muted mb-0">
                Manage and track all approved loan applications
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-2"></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                className="btn btn-outline-info"
                onClick={() => setStatsView(statsView === 'cards' ? 'detailed' : 'cards')}
              >
                <i className="bi bi-graph-up me-2"></i>
                {statsView === 'cards' ? 'Detailed Stats' : 'Simple View'}
              </button>
              <button
                className="btn btn-primary"
                onClick={fetchApprovedLoans}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="filter-section mt-4 pt-3 border-top">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-search me-1"></i>Customer Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-calendar me-1"></i>From Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-calendar me-1"></i>To Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Statistics (All Time) */}
      {!hasFilter && statsView === 'detailed' && (
        <StatisticsCards stats={allStats} title="📊 Overall Statistics (All Time)" />
      )}

      {/* Filtered Statistics */}
      {hasFilter && statsView === 'detailed' && (
        <StatisticsCards stats={stats} title="📊 Filtered Results Statistics" />
      )}

      {/* Simple Stats Summary */}
      {statsView === 'cards' && hasFilter && totalItems > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="alert alert-success mb-0">
              <i className="bi bi-currency-dollar me-2"></i>
              Total: {formatCurrency(stats.totalAmount)}
            </div>
          </div>
          <div className="col-md-6">
            <div className="alert alert-warning mb-0">
              <i className="bi bi-grid me-2"></i>
              Count: {stats.totalCount} loan(s)
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      {hasFilter && totalItems > 0 && statsView === 'cards' && (
        <div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          Found <strong>{totalItems}</strong> approved loan(s) matching your criteria
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      {/* Table Section - UPDATED with Customer ID column */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table professional-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th><i className="bi bi-upc-scan me-2"></i>Customer ID</th>   {/* NEW COLUMN */}
                  <th><i className="bi bi-person me-2"></i>Customer Name</th>
                  <th><i className="bi bi-telephone me-2"></i>Contact Number</th>
                  <th><i className="bi bi-cash-stack me-2"></i>Amount Approved</th>
                  <th><i className="bi bi-calendar-check me-2"></i>Approval Date</th>
                  <th><i className="bi bi-check-circle me-2"></i>Status</th>
                </tr>
              </thead>
              <tbody>
                {!hasFilter ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">   {/* colSpan increased to 7 */}
                      <div className="empty-state">
                        <i className="bi bi-funnel fs-1 text-muted"></i>
                        <p className="text-muted mt-3 mb-0">
                          Apply filters to view approved loans
                        </p>
                        <button
                          className="btn btn-sm btn-primary mt-3"
                          onClick={() => setShowFilters(true)}
                        >
                          <i className="bi bi-funnel me-2"></i>
                          Show Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">   {/* colSpan increased to 7 */}
                      <div className="empty-state">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <p className="text-muted mt-3 mb-0">
                          No approved loans found matching your criteria
                        </p>
                        <button
                          className="btn btn-sm btn-outline-primary mt-3"
                          onClick={clearFilters}
                        >
                          <i className="bi bi-eraser me-2"></i>
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((loan, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="text-muted">
                        {loan.customer_id || "N/A"}   {/* NEW COLUMN DATA */}
                      </td>
                      <td className="fw-semibold">
                        {loan.applicant_fullName || "N/A"}
                      </td>
                      <td>{loan.mobileNumber || loan.applicant_phone || "N/A"}</td>
                      <td className="fw-bold text-primary">
                        {formatCurrency(getLoanAmount(loan))}
                      </td>
                      <td>{formatDate(loan.approved_date)}</td>
                      <td>{getStatusBadge()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {hasFilter && totalPages > 1 && (
            <div className="pagination-wrapper border-top">
              <div className="d-flex justify-content-between align-items-center p-3">
                <div className="text-muted small">
                  Showing {indexOfFirstItem + 1} to{' '}
                  {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    {/* ... pagination logic unchanged ... */}
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <li
                            key={index}
                            className={`page-item ${
                              currentPage === pageNum ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNum === currentPage - 3 ||
                        pageNum === currentPage + 3
                      ) {
                        return <li key={index} className="page-item disabled"><span className="page-link">...</span></li>;
                      }
                      return null;
                    })}
                    
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedLoansReport;