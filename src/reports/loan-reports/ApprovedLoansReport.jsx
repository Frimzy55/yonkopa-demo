// ApprovedLoans.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './ApprovedLoans.css'; // Create this CSS file for professional styling

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getStatusBadge = (status) => {
    return (
      <span className="badge bg-success">
        <i className="bi bi-check-circle me-1"></i>Approved
      </span>
    );
  };

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

      {/* Stats Summary */}
      {hasFilter && totalItems > 0 && (
        <div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          Found <strong>{totalItems}</strong> approved loan(s) matching your criteria
        </div>
      )}

      {/* Table Section */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table professional-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <i className="bi bi-person me-2"></i>
                    Customer Name
                  </th>
                  <th>
                    <i className="bi bi-telephone me-2"></i>
                    Contact Number
                  </th>
                  <th>
                    <i className="bi bi-cash-stack me-2"></i>
                    Amount Approved
                  </th>
                  <th>
                    <i className="bi bi-calendar-check me-2"></i>
                    Approval Date
                  </th>
                  <th>
                    <i className="bi bi-check-circle me-2"></i>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {!hasFilter ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
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
                    <td colSpan="6" className="text-center py-5">
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
                      <td className="fw-semibold">
                        {loan.applicant_fullName || "N/A"}
                      </td>
                      <td>{loan.mobileNumber || loan.applicant_phone || "N/A"}</td>
                      <td className="fw-bold text-success">
                        {formatCurrency(loan.kyc_loan_amount)}
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
                      // Show only first 5 pages, current page, and last 5 pages
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