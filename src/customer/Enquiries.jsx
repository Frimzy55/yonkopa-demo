import React, { useState, useEffect } from "react";
import EnquiryDetailView from "./ViewEnquiryModal";   // new inline component
import EditEnquiryModal from "./EditEnquiryModal";

const CustomerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail view & Edit modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null); // for inline view
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: "",
    response: "",
  });

  // =========================================
  // FETCH DATA
  // =========================================
  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customer-enquiries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch customer enquiries");
      }

      const data = await res.json();

      const mapped = (data?.data || []).map((loan) => ({
        id: loan.id,
        enquiryId: loan.enquiryId,
        customerId: loan.customerId || "",
        customerName: loan.customerName || "",
        avatar: loan.avatar
          ? `${process.env.REACT_APP_API_URL}/uploads/${loan.avatar}`
          : "",
        contactNumber: loan.contactNumber || "",
        email: loan.email || "",
        dob: loan.dob || "",
        gender: loan.gender || "",
        amountApproved: loan.amountApproved || 0,
        approvalDate: loan.approvalDate || "",
        status: loan.status || "pending",
        response: loan.response || "",
        // additional fields that may come from the API for the detail view:
        brand: loan.brand || "",
        headOffice: loan.headOffice || "",
        relationshipOfficer: loan.relationshipOfficer || "",
        registrationDate: loan.registrationDate || "",
        accounts: loan.accounts || [],
        loans: loan.loans || [],
      }));

      setEnquiries(mapped);
    } catch (err) {
      console.error(err);
      setError("Network error while loading customer enquiries");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FILTERING
  // =========================================
  const filtered = enquiries.filter((e) => {
    const term = searchTerm.toLowerCase();

    const matchSearch =
      (e.customerId || "").toLowerCase().includes(term) ||
      (e.customerName || "").toLowerCase().includes(term) ||
      (e.contactNumber || "").toLowerCase().includes(term) ||
      (e.email || "").toLowerCase().includes(term);

    const matchStatus =
      filterStatus === "all" || e.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // =========================================
  // PAGINATION
  // =========================================
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // =========================================
  // HANDLERS
  // =========================================
  const handleView = (item) => {
    // Toggle: click again on the same item to close
    setSelectedEnquiry((prev) => (prev?.id === item.id ? null : item));
  };

  const handleEdit = (item) => {
    setSelectedEnquiry(item);
    setEditFormData({
      status: item.status,
      response: item.response || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateEnquiry = (updatedEnquiry) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === updatedEnquiry.id ? updatedEnquiry : e))
    );
    // also update the selected one if it's the same
    setSelectedEnquiry((prev) =>
      prev?.id === updatedEnquiry.id ? updatedEnquiry : prev
    );
  };

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

  // =========================================
  // RENDER STATES
  // =========================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-3">Loading Customer Enquiries...</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  // =========================================
  // MAIN RENDER
  // =========================================
  return (
    <div className="container-fluid px-4 py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-primary mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Customer Enquiries
          </h3>
          <p className="text-muted mb-0">
            Manage approved customer loan enquiries
          </p>
        </div>
        <div className="badge bg-primary fs-6 px-3 py-2">
          Total Customer(s): {filtered.length}
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Search Customer
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by customer ID, name, phone or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Filter Status
              </label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="under_review">Under Review</option>
                <option value="disbursed">Disbursed</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{start + idx + 1}</td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">
                        {item.customerId || "—"}
                      </code>
                    </td>
                    <td className="fw-semibold">{item.customerName || "—"}</td>
                    <td>{item.contactNumber || "—"}</td>
                    <td>{item.email || "—"}</td>
                    <td>
                      {item.dob
                        ? new Date(item.dob).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span className="badge bg-info">{item.gender || "—"}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleView(item)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleEdit(item)}
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
                    <p className="mt-2 mb-0 text-muted">
                      No customer enquiries found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {start + 1} to{" "}
                {Math.min(start + itemsPerPage, filtered.length)} of{" "}
                {filtered.length}
              </small>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages).keys()].map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      currentPage === page + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* INLINE DETAIL VIEW (self‑contained)          */}
      {/* ============================================ */}
      {selectedEnquiry && (
        <div className="mt-4">
          <EnquiryDetailView
            enquiry={selectedEnquiry}
            onClose={() => setSelectedEnquiry(null)}
            getStatusBadge={getStatusBadge}
          />
        </div>
      )}

      {/* EDIT MODAL (unchanged) */}
      <EditEnquiryModal
        show={showEditModal}
        enquiry={selectedEnquiry}
        formData={editFormData}
        onFormChange={(newData) => setEditFormData(newData)}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateEnquiry}
      />
    </div>
  );
};

export default CustomerEnquiries;