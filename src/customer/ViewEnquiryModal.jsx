import React, { useState } from "react";
import AccountTable from "./AccountTable";
import LoanStatementTable from "./LoanStatementTable";

const EnquiryDetailView = ({ enquiry, onClose, getStatusBadge }) => {
  const [activeTab, setActiveTab] = useState("accounts");

  const IMAGE_BASE_URL = process.env.REACT_APP_API_URL || "";

  if (!enquiry) return null;

  // ----------------------------
  // FORMAT DATE
  // ----------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----------------------------
  // INITIALS
  // ----------------------------
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ----------------------------
  // SAFE IMAGE HANDLER
  // ----------------------------
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    const cleanPath = avatar.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  const accountsData = enquiry.accounts || [];
  const loansData = enquiry.loans || [];

  const handleAccountAction = (action, account) => {
    console.log(`${action} on account`, account);
    alert(`${action} for account ${account.accountNumber}`);
  };

  const handleLoanAction = (action, loan) => {
    console.log(`${action} on loan`, loan);
    alert(`${action} for loan ${loan.loanId}`);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* HEADER with gradient and close button */}
      <div
        className="card-header px-4 py-3"
        style={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          borderBottom: "none",
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="text-white fw-semibold fs-4 mb-0">
            <i className="bi bi-person-badge me-2"></i>
            Customer Profile
          </h5>
          <button
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close detail view"
          />
        </div>
      </div>

      <div className="card-body px-4 py-4">
        {/* PHOTO + BASIC INFO */}
        <div className="d-flex flex-column flex-md-row gap-4 mb-4">
          <div className="text-center text-md-start">
            <span className="badge bg-light text-dark px-3 py-1 rounded-pill shadow-sm fs-6 mb-2">
              <i className="bi bi-camera me-1"></i> Customer Photo
            </span>
            {getAvatarUrl(enquiry.avatar) ? (
              <img
                src={getAvatarUrl(enquiry.avatar)}
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

          <div className="flex-grow-1">
            <div className="border-bottom pb-2 mb-2">
              <small className="text-uppercase text-muted fw-semibold">
                Full Name
              </small>
              <div className="h4 fw-semibold mt-1">
                {enquiry.customerName || "—"}
              </div>
            </div>

            <div className="row g-2">
              <div className="col-sm-6">
                <small className="text-muted">Customer ID</small>
                <div className="fw-semibold font-monospace">
                  {enquiry.customerId || "—"}
                </div>
              </div>
              <div className="col-sm-6">
                <small className="text-muted">Branch</small>
                <div className="fw-semibold">
                  {enquiry.brand || enquiry.headOffice || "Head Office"}
                </div>
              </div>
              <div className="col-sm-6">
                <small className="text-muted">Relationship Officer</small>
                <div className="fw-semibold">
                  {enquiry.relationshipOfficer || "—"}
                </div>
              </div>
              <div className="col-sm-6">
                <small className="text-muted">Registration Date</small>
                <div className="fw-semibold">
                  {formatDate(enquiry.registrationDate)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="mt-3">
          <div className="d-flex gap-2 mb-3">
            <button
              className={`btn rounded-pill px-3 ${
                activeTab === "accounts"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("accounts")}
            >
              Accounts
            </button>
            <button
              className={`btn rounded-pill px-3 ${
                activeTab === "loan"
                  ? "btn-primary"
                  : "btn-outline-primary"
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
              <LoanStatementTable
                loans={loansData}
                onAction={handleLoanAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetailView;