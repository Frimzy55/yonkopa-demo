import React, { useState, useEffect } from "react";
import FeeModal from "./FeeModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const API_PATH = '/api/configuration';

const LoanFees = () => {
  // State for fees and UI
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- Success Modal State ----------
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination (client‑side)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ledgers for dropdown
  const [ledgers, setLedgers] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [formData, setFormData] = useState({
    feeName: "",
    feeType: "Processing Fee",
    feeTrend: "Standard",
    paymentMode: "Upfront",
    status: "Active",
    allowEditAtDisbursement: true,
    alertManagementOnEdit: true,
    feeAmount: 0,
    feeValueType: "fixed",
    generalLedgerId: "",
  });

  // ---------- DATA FETCHING ----------
  const fetchFees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}${API_PATH}/loan-fees`);
      if (!res.ok) throw new Error("Failed to fetch fees");
      const data = await res.json();
      const mapped = data.map((fee) => ({
        id: fee.id,
        feeName: fee.fee_name,
        feeType: fee.fee_type,
        feeTrend: fee.fee_trend,
        paymentMode: fee.payment_mode,
        status: fee.status,
        feeValueType: fee.fee_value_type,
        feeAmount: parseFloat(fee.fee_amount),
        allowEditAtDisbursement: Boolean(fee.allow_edit_at_disbursement),
        alertManagementOnEdit: Boolean(fee.alert_management_on_edit),
        generalLedgerId: fee.general_ledger_id,
        ledgerName: fee.ledger_name,
      }));
      setFees(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_PATH}/gl-accounts`);
      if (!res.ok) throw new Error("Failed to fetch ledgers");
      const data = await res.json();
      setLedgers(data);
    } catch (err) {
      console.error("Error fetching ledgers:", err);
    }
  };

  useEffect(() => {
    fetchFees();
    fetchLedgers();
  }, []);

  // ---------- FILTERING & PAGINATION ----------
  const filtered = fees.filter((fee) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      fee.feeName.toLowerCase().includes(term) ||
      fee.feeType.toLowerCase().includes(term) ||
      fee.paymentMode.toLowerCase().includes(term);
    const matchStatus =
      filterStatus === "all" || fee.status === filterStatus;
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

  // ---------- MODAL HANDLERS ----------
  const handleAdd = () => {
    setEditingFee(null);
    setViewMode(false);
    setFormData({
      feeName: "",
      feeType: "Processing Fee",
      feeTrend: "Standard",
      paymentMode: "Upfront",
      status: "Active",
      allowEditAtDisbursement: true,
      alertManagementOnEdit: true,
      feeAmount: 0,
      feeValueType: "fixed",
      generalLedgerId: "",
    });
    setShowModal(true);
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setViewMode(false);
    setFormData({
      feeName: fee.feeName,
      feeType: fee.feeType,
      feeTrend: fee.feeTrend,
      paymentMode: fee.paymentMode,
      status: fee.status,
      allowEditAtDisbursement: fee.allowEditAtDisbursement,
      alertManagementOnEdit: fee.alertManagementOnEdit,
      feeAmount: fee.feeAmount,
      feeValueType: fee.feeValueType || "fixed",
      generalLedgerId: fee.generalLedgerId || "",
    });
    setShowModal(true);
  };

  const handleView = (fee) => {
    setEditingFee(fee);
    setViewMode(true);
    setFormData({
      feeName: fee.feeName,
      feeType: fee.feeType,
      feeTrend: fee.feeTrend,
      paymentMode: fee.paymentMode,
      status: fee.status,
      allowEditAtDisbursement: fee.allowEditAtDisbursement,
      alertManagementOnEdit: fee.alertManagementOnEdit,
      feeAmount: fee.feeAmount,
      feeValueType: fee.feeValueType || "fixed",
      generalLedgerId: fee.generalLedgerId || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name === "allowEditAtDisbursement" || name === "alertManagementOnEdit") {
      val = value === "true";
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // ---------- Handle Success Modal Close ----------
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Optionally reset any additional state if needed
  };

  // ---------- SUBMIT (ADD / EDIT) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (viewMode) {
      setShowModal(false);
      return;
    }

    const payload = {
      feeName: formData.feeName,
      feeType: formData.feeType,
      feeTrend: formData.feeTrend,
      paymentMode: formData.paymentMode,
      status: formData.status,
      feeValueType: formData.feeValueType,
      feeAmount: formData.feeAmount,
      allowEditAtDisbursement: formData.allowEditAtDisbursement,
      alertManagementOnEdit: formData.alertManagementOnEdit,
      generalLedgerId: formData.generalLedgerId || null,
    };

    try {
      setLoading(true);
      let url = `${API_BASE_URL}${API_PATH}/loan-fees`;
      let method = "POST";
      if (editingFee) {
        url = `${API_BASE_URL}${API_PATH}/loan-fees/${editingFee.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Operation failed");
      }

      // Refresh the fee list
      await fetchFees();

      // Show success modal
      setSuccessModalMessage(editingFee ? "Fee updated successfully!" : "Fee added successfully!");
      setShowSuccessModal(true);

      // Close the form modal
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- RENDER ----------
  if (loading && fees.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-primary mb-1">
            <i className="bi bi-coin me-2"></i>
            Loan Fees Configuration
          </h3>
          <p className="text-muted mb-0">
            Manage fees associated with loans (processing, late payment, etc.)
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Fee
        </button>
      </div>

      {/* Error Alert (only error, success removed) */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")} />
        </div>
      )}

      {/* Search & Filter */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, type, or mode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-5 text-md-end">
          <span className="text-muted">
            Showing {currentItems.length} of {filtered.length} fees
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fee ID</th>
                <th>Fee Name</th>
                <th>Fee Type</th>
                <th>Fee Trend</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((fee) => (
                  <tr key={fee.id}>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">{fee.id}</code>
                    </td>
                    <td className="fw-semibold">{fee.feeName}</td>
                    <td>{fee.feeType}</td>
                    <td>{fee.feeTrend}</td>
                    <td>{fee.paymentMode}</td>
                    <td>
                      <span
                        className={`badge ${
                          fee.status === "Active" ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(fee)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => handleView(fee)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    No fee configurations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <span className="text-muted small">
              Page {currentPage} of {totalPages}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                {[...Array(totalPages).keys()].map((p) => (
                  <li
                    key={p + 1}
                    className={`page-item ${currentPage === p + 1 ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => goToPage(p + 1)}>
                      {p + 1}
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
        )}
      </div>

      {/* Fee Modal */}
      <FeeModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingFee={editingFee}
        formData={formData}
        handleFormChange={handleFormChange}
        viewMode={viewMode}
        ledgers={ledgers}
      />

      {/* ---------- SUCCESS MODAL ---------- */}
      <div
        className={`modal fade ${showSuccessModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-success">
                <i className="bi bi-check-circle-fill me-2"></i>Success
              </h5>
              {/* No close button – user must click OK */}
            </div>
            <div className="modal-body">
              <p className="mb-0">{successModalMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSuccessModalClose}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanFees;