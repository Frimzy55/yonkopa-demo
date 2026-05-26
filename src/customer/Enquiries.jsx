import React, { useState, useEffect } from "react";

const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editFormData, setEditFormData] = useState({ status: "", response: "" });

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/customer-enquiries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch loan data");

        const data = await res.json();
        const loans = data?.data || [];

        // Map to required table fields
        const mapped = loans.map((loan, idx) => ({
          id: loan.id,
          customerId: loan.customerId || loan.customer_id,
          customerName: loan.customerName || loan.applicant_fullName,
          contactNumber: loan.contactNumber || loan.customerPhone || loan.applicant_phone,
          amountApproved: loan.amountApproved || loan.kyc_loan_amount || loan.evaluated_loan_amount,
          approvalDate: loan.approvalDate || loan.approved_date,
          status: loan.status || loan.loan_status,
          enquiryType: loan.enquiryType || "Loan Application",
          assignedTo: loan.assignedTo,
          response: loan.response || loan.comments,
        }));
        setEnquiries(mapped);
      } catch (err) {
        console.error(err);
        setError("Network error while loading loan approvals");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  // ==================== FILTER & PAGINATION ====================
  const filtered = enquiries.filter((e) => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      (e.customerId || "").toLowerCase().includes(term) ||
      (e.customerName || "").toLowerCase().includes(term) ||
      (e.contactNumber || "").toLowerCase().includes(term);
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // ==================== HANDLERS ====================
  const handleView = (item) => {
    setSelectedEnquiry(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setSelectedEnquiry(item);
    setEditFormData({ status: item.status, response: item.response || "" });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customer-enquiries/${selectedEnquiry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: editFormData.status,
            comments: editFormData.response,
          }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selectedEnquiry.id
            ? { ...e, status: editFormData.status, response: editFormData.response }
            : e
        )
      );
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // ==================== HELPER ====================
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-warning text-dark",
      approved: "bg-success",
      rejected: "bg-danger",
      under_review: "bg-info",
      disbursed: "bg-primary",
    };
    return colors[status?.toLowerCase()] || "bg-secondary";
  };

  // ==================== LOADING / ERROR ====================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading Customer Enquiries...</span>
      </div>
    );
  }
  if (error) {
    return <div className="alert alert-danger m-3 shadow-sm">{error}</div>;
  }

  // ==================== RENDER ====================
  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-primary mb-0">
            <i className="bi bi-file-check me-2"></i> Customer Enquiries
          </h4>
          <p className="text-muted small mb-0">Manage approved loans and customer details</p>
        </div>
        <div className="text-muted">Total: {filtered.length} records</div>
      </div>

      {/* Search & Filter */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label small fw-semibold">
                <i className="bi bi-search me-1"></i> Search
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Customer ID, name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm("")}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-funnel me-1"></i> Status
              </label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="disbursed">Disbursed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-4 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover professional-table mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th><i className="bi bi-upc-scan me-2"></i>Customer ID</th>
                  <th><i className="bi bi-person me-2"></i>Customer Name</th>
                  <th><i className="bi bi-telephone me-2"></i>Contact Number</th>
                  <th><i className="bi bi-cash-stack me-2"></i>Amount Approved</th>
                  <th><i className="bi bi-calendar-check me-2"></i>Approval Date</th>
                  <th><i className="bi bi-check-circle me-2"></i>Status</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="text-muted">{start + idx + 1}</td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{item.customerId}</code>
                      </td>
                      <td className="fw-semibold">{item.customerName}</td>
                      <td>{item.contactNumber || "—"}</td>
                      <td className="fw-semibold text-success">
                        {item.amountApproved
                          ? `₵${Number(item.amountApproved).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "—"}
                      </td>
                      <td>{item.approvalDate || "—"}</td>
                      <td>
                        <span
                          className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {item.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleView(item)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleEdit(item)}
                          title="Edit Status"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="mt-2 mb-0">No loan approvals found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="small text-muted">
                Showing {start + 1}–{Math.min(start + itemsPerPage, filtered.length)} of {filtered.length}
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map((page) => (
                    <li key={page} className={`page-item ${currentPage === page + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => goToPage(page + 1)}>
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ========== VIEW MODAL ========== */}
      {showViewModal && selectedEnquiry && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowViewModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title">
                  <i className="bi bi-info-circle-fill me-2"></i> Loan Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <small className="text-muted">Customer ID</small>
                    <div className="fw-bold">{selectedEnquiry.customerId}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Customer Name</small>
                    <div>{selectedEnquiry.customerName}</div>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Contact Number</small>
                    <div>{selectedEnquiry.contactNumber || "—"}</div>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Amount Approved</small>
                    <div className="text-success fw-semibold">
                      {selectedEnquiry.amountApproved
                        ? `₵${Number(selectedEnquiry.amountApproved).toLocaleString()}`
                        : "—"}
                    </div>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Approval Date</small>
                    <div>{selectedEnquiry.approvalDate || "—"}</div>
                  </div>
                  <div className="col-md-6 mt-2">
                    <small className="text-muted">Status</small>
                    <div>
                      <span className={`badge ${getStatusBadge(selectedEnquiry.status)} px-3 py-2 rounded-pill`}>
                        {selectedEnquiry.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 mt-3">
                    <small className="text-muted">Comments / Response</small>
                    <div className="p-2 bg-light rounded-3">
                      {selectedEnquiry.response || "No comments"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== EDIT MODAL ========== */}
      {showEditModal && selectedEnquiry && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header bg-warning text-dark rounded-top-4">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i> Update Loan Status
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select name="status" className="form-select" value={editFormData.status} onChange={handleInputChange}>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Comments / Response</label>
                  <textarea
                    name="response"
                    className="form-control"
                    rows="4"
                    value={editFormData.response}
                    onChange={handleInputChange}
                    placeholder="Add internal notes or response..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerEnquiries;