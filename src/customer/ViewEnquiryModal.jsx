import React, { useState } from "react";
import AccountTable from "./AccountTable";
import LoanStatementTable from "./LoanStatementTable";

const ViewEnquiryModal = ({ show, enquiry, onClose, getStatusBadge }) => {
  const [activeTab, setActiveTab] = useState("accounts");
  const IMAGE_BASE_URL = process.env.REACT_APP_API_URL || "";

  if (!show || !enquiry) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use data from enquiry prop, fallback to empty arrays
  const accountsData = enquiry.accounts || [];
  const loansData = enquiry.loans || [];

  // Callback for account actions
  const handleAccountAction = (action, account) => {
    console.log(`${action} on account`, account);
    // Implement your logic here (e.g., open another modal, API call)
    alert(`${action} for account ${account.accountNumber}`);
  };

  // Callback for loan actions
  const handleLoanAction = (action, loan) => {
    console.log(`${action} on loan`, loan);
    alert(`${action} for loan ${loan.loanId}`);
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div
          className="modal-content border-0 rounded-4 overflow-hidden"
          style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        >
          {/* HEADER */}
          <div
            className="modal-header px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              borderBottom: "none",
            }}
          >
            <h5 className="modal-title text-white fw-semibold fs-4">
              <i className="bi bi-person-badge me-2"></i>
              Customer Profile
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          {/* BODY */}
          <div className="modal-body px-4 py-4">
            {/* Photo & quick details */}
            <div className="d-flex flex-column flex-md-row gap-4 mb-4">
              <div className="text-center text-md-start">
                <span className="badge bg-light text-dark px-3 py-1 rounded-pill shadow-sm fs-6 mb-2 d-inline-block">
                  <i className="bi bi-camera me-1"></i> Customer Photo
                </span>
                <div>
                  {enquiry.avatar ? (
  <img
    src={
      enquiry.avatar.startsWith("http")
        ? enquiry.avatar
        : `${IMAGE_BASE_URL}/${enquiry.avatar.replace(/^\/+/, "")}`
    }
    alt="Customer"
    className="rounded-circle border border-2 border-white shadow-sm"
    style={{ width: "100px", height: "100px", objectFit: "cover" }}
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
) : (
  <div
    className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm"
    style={{
      width: "100px",
      height: "100px",
      fontSize: "2.5rem",
      fontWeight: 500,
      color: "#1e3c72",
      backgroundColor: "#eef2ff",
    }}
  >
    {getInitials(enquiry.customerName)}
  </div>
)}
                </div>
              </div>

              <div className="flex-grow-1">
                <div className="border-bottom pb-2 mb-2">
                  <small className="text-uppercase text-muted fw-semibold">Full Name</small>
                  <div className="h4 fw-semibold mt-1">{enquiry.customerName || "—"}</div>
                </div>
                <div className="row g-2">
                  <div className="col-sm-6">
                    <small className="text-muted">Customer ID</small>
                    <div className="fw-semibold font-monospace">{enquiry.customerId || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Branch</small>
                    <div className="fw-semibold">
                      {enquiry.brand || enquiry.headOffice || "Head Office"}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Relationship Officer</small>
                    <div className="fw-semibold">{enquiry.relationshipOfficer || "—"}</div>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted">Registration Date</small>
                    <div className="fw-semibold">{formatDate(enquiry.registrationDate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="mt-3">
              <div className="d-flex gap-2 mb-3">
                <button
                  className={`btn rounded-pill px-3 ${
                    activeTab === "accounts" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveTab("accounts")}
                >
                  Accounts
                </button>
                <button
                  className={`btn rounded-pill px-3 ${
                    activeTab === "loan" ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveTab("loan")}
                >
                  Loan Statement
                </button>
              </div>

              <div className="bg-white border rounded-3 p-3 shadow-sm">
                {activeTab === "accounts" && (
                  <AccountTable
                    accounts={accountsData}
                    globalOfficer={enquiry.relationshipOfficer}
                    onAction={handleAccountAction}
                  />
                )}
                {activeTab === "loan" && (
                  <LoanStatementTable loans={loansData} onAction={handleLoanAction} />
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 pt-0 pb-4 px-4">
            <button
              className="btn btn-outline-secondary rounded-pill px-4 py-1 fs-6"
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-2"></i> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEnquiryModal;