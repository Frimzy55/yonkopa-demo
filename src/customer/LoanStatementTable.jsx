import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const LoanStatementTable = ({ loans = [], onAction }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const activeButtonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownId !== null &&
        activeButtonRef.current &&
        !activeButtonRef.current.contains(event.target) &&
        !event.target.closest(".dropdown-menu-portal")
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  const handleAction = (action, loan) => {
    setOpenDropdownId(null);
    if (onAction) onAction(action, loan);
    else console.log(`${action} for loan:`, loan);
  };

  // Dynamic positioning: uses loan status to estimate dropdown height
  const handleButtonClick = (e, loan, buttonElement) => {
    e.stopPropagation();
    if (openDropdownId === loan.id) {
      setOpenDropdownId(null);
      return;
    }
    const rect = buttonElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // Estimate dropdown height based on loan status
    const dropdownHeightEstimate = loan.status === "Active" ? 280 : 100;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let topPos;
    if (spaceBelow < dropdownHeightEstimate && spaceAbove > spaceBelow) {
      // Not enough space below → show above the button, centered
      topPos = rect.top - dropdownHeightEstimate / 2;
    } else {
      // Enough space below → center vertically on the button
      topPos = rect.top + rect.height / 2;
    }

    setDropdownPosition({
      top: topPos,
      left: rect.left + rect.width / 2,
    });
    activeButtonRef.current = buttonElement;
    setOpenDropdownId(loan.id);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-success";
      case "Closed":
      case "Completed":
        return "bg-secondary";
      default:
        return "bg-warning";
    }
  };

  // Compact styles for dropdown items
  const dropdownItemStyle = {
    padding: "4px 12px",
    fontSize: "0.875rem",
    cursor: "pointer",
  };
  const dropdownDividerStyle = { margin: "4px 0" };

  // ---------------------------------------------
  // DUMMY DATA (unchanged)
  // ---------------------------------------------
  const dummyLoans = [
    {
      id: 1,
      status: "Active",
      customerId: "CUST001",
      customerName: "John Doe",
      groupName: "Savings Group A",
      phoneNumber: "0244123456",
      accountNumber: "SA-100245",
      loanProduct: "Personal Loan",
      branch: "Accra Main",
      amountDisbursed: 10000,
      dateDisbursed: "2025-01-15",
      expirationDate: "2026-01-15",
      interestRate: 12.5,
      duration: "12 months",
      paymentPlan: "Monthly",
      expectedInterest: 1250,
      totalCollectible: 11250,
      settlementAccount: "SA-100245",
      paymentStartDate: "2025-02-01",
      accruedInterest: 520.83,
      interestArrears: 0,
      principalArrears: 0,
      daysInArrear: 0,
      penaltyOutstanding: 0,
      principalPaid: 2500,
      interestPaid: 312.5,
      feePaid: 0,
      principalOutstanding: 7500,
      interestOutstanding: 937.5,
      feeOutstanding: 0,
      totalOutstanding: 8437.5,
      creditOfficer: "Mary K.",
    },
    {
      id: 3,
      status: "Closed",
      customerId: "CUST003",
      customerName: "Kwame Asare",
      groupName: "Farmers Co-op",
      phoneNumber: "0555123789",
      accountNumber: "LO-445566",
      loanProduct: "Agricultural Loan",
      branch: "Tamale",
      amountDisbursed: 5000,
      dateDisbursed: "2024-01-10",
      expirationDate: "2025-01-10",
      interestRate: 10,
      duration: "12 months",
      paymentPlan: "Monthly",
      expectedInterest: 500,
      totalCollectible: 5500,
      settlementAccount: "LO-445566",
      paymentStartDate: "2024-02-01",
      accruedInterest: 500,
      interestArrears: 0,
      principalArrears: 0,
      daysInArrear: 0,
      penaltyOutstanding: 0,
      principalPaid: 5000,
      interestPaid: 500,
      feePaid: 0,
      principalOutstanding: 0,
      interestOutstanding: 0,
      feeOutstanding: 0,
      totalOutstanding: 0,
      creditOfficer: "Ama Serwaa",
      loanId: "LN-445566",
      loanType: "Agricultural Loan",
      principal: 5000,
      totalPaid: 5500,
      closureDate: "2025-01-10",
      completedDate: "2025-01-10",
    },
    {
      id: 4,
      status: "Completed",
      customerId: "CUST004",
      customerName: "Esi Boateng",
      groupName: "Traders Union",
      phoneNumber: "0244112233",
      accountNumber: "CU-998877",
      loanProduct: "Micro Loan",
      branch: "Tema",
      amountDisbursed: 2000,
      dateDisbursed: "2024-06-01",
      expirationDate: "2024-12-01",
      interestRate: 8,
      duration: "6 months",
      paymentPlan: "Bi-weekly",
      expectedInterest: 80,
      totalCollectible: 2080,
      settlementAccount: "CU-998877",
      paymentStartDate: "2024-06-10",
      accruedInterest: 80,
      interestArrears: 0,
      principalArrears: 0,
      daysInArrear: 0,
      penaltyOutstanding: 0,
      principalPaid: 2000,
      interestPaid: 80,
      feePaid: 0,
      principalOutstanding: 0,
      interestOutstanding: 0,
      feeOutstanding: 0,
      totalOutstanding: 0,
      creditOfficer: "Mary K.",
      loanId: "LN-998877",
      loanType: "Micro Loan",
      principal: 2000,
      totalPaid: 2080,
      closureDate: "2024-12-05",
      completedDate: "2024-12-05",
    },
  ];

  const dataToRender = loans.length > 0 ? loans : dummyLoans;
  const activeLoans = dataToRender.filter((loan) => loan.status === "Active");
  const completedLoans = dataToRender.filter(
    (loan) => loan.status === "Closed" || loan.status === "Completed"
  );

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "—";
    return Number(value).toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Dropdown portal component with improved positioning & compact styles
  const renderDropdownPortal = (loan) => {
    if (openDropdownId !== loan.id) return null;
    return ReactDOM.createPortal(
      <div
        className="dropdown-menu show dropdown-menu-portal"
        style={{
          position: "fixed",
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          minWidth: "180px",
          display: "block",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loan.status === "Active" ? (
          <>
            <button
              className="dropdown-item"
              style={dropdownItemStyle}
              onClick={() => handleAction("View", loan)}
            >
              <i className="bi bi-eye me-2"></i> View
            </button>
            <button
              className="dropdown-item"
              style={dropdownItemStyle}
              onClick={() => handleAction("Edit", loan)}
            >
              <i className="bi bi-pencil me-2"></i> Edit
            </button>
            <button
              className="dropdown-item"
              style={dropdownItemStyle}
              onClick={() => handleAction("Repayment Schedule", loan)}
            >
              <i className="bi bi-calendar-week me-2"></i> Repayment Schedule
            </button>
            <div className="dropdown-divider" style={dropdownDividerStyle}></div>
            <button
              className="dropdown-item text-danger"
              style={dropdownItemStyle}
              onClick={() => handleAction("Close Loan", loan)}
            >
              <i className="bi bi-x-circle me-2"></i> Close Loan
            </button>
          </>
        ) : (
          <>
            <button
              className="dropdown-item"
              style={dropdownItemStyle}
              onClick={() => handleAction("View Details", loan)}
            >
              <i className="bi bi-eye me-2"></i> View Details
            </button>
            <button
              className="dropdown-item"
              style={dropdownItemStyle}
              onClick={() => handleAction("Download Certificate", loan)}
            >
              <i className="bi bi-file-pdf me-2"></i> Download Certificate
            </button>
          </>
        )}
      </div>,
      document.body
    );
  };

  // ---------------------------------------------
  // Active Loans Table (gap reduced: mb-5 → mb-3)
  // ---------------------------------------------
  const renderActiveLoans = () => {
    return (
      <div className="mb-3">
        <h6 className="fw-semibold mb-3">📌 Active Loans</h6>
        <div
          className="border rounded shadow-sm"
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "75vh",
            width: "100%",
            position: "relative",
          }}
        >
          <table
            className="table table-sm table-bordered table-hover align-middle mb-0"
            style={{
              minWidth: "max-content",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            <thead
              className="table-light"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 40,
                    background: "#f8f9fa",
                    minWidth: "120px",
                  }}
                >
                  Action
                </th>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Group Name</th>
                <th>Phone Number</th>
                <th>Account Number</th>
                <th>Loan Product</th>
                <th>Branch</th>
                <th>Amount Disbursed (₵)</th>
                <th>Date Disbursed</th>
                <th>Expiration Date</th>
                <th>Interest Rate (%)</th>
                <th>Duration</th>
                <th>Payment Plan</th>
                <th>Expected Interest (₵)</th>
                <th>Total Collectible (₵)</th>
                <th>Settlement Account</th>
                <th>Payment Start Date</th>
                <th>Accrued Interest (₵)</th>
                <th>Interest Arrears (₵)</th>
                <th>Principal Arrears (₵)</th>
                <th>Days in Arrear</th>
                <th>Penalty Outstanding (₵)</th>
                <th>Principal Paid (₵)</th>
                <th>Interest Paid (₵)</th>
                <th>Fee Paid (₵)</th>
                <th>Principal Outstanding (₵)</th>
                <th>Interest Outstanding (₵)</th>
                <th>Fee Outstanding (₵)</th>
                <th>Total Outstanding (₵)</th>
                <th>Credit Officer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={33} className="text-center text-muted py-4">
                    No active loans found
                  </td>
                </tr>
              ) : (
                activeLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td
                      className="text-center"
                      style={{
                        position: "sticky",
                        left: 0,
                        background: "#fff",
                        zIndex: 10,
                      }}
                    >
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        onClick={(e) => handleButtonClick(e, loan, e.currentTarget)}
                      >
                        Select
                      </button>
                    </td>
                    <td>{loan.customerId || "—"}</td>
                    <td>{loan.customerName || "—"}</td>
                    <td>{loan.groupName || "—"}</td>
                    <td>{loan.phoneNumber || "—"}</td>
                    <td>{loan.accountNumber || "—"}</td>
                    <td>{loan.loanProduct || "—"}</td>
                    <td>{loan.branch || "—"}</td>
                    <td>{formatCurrency(loan.amountDisbursed)}</td>
                    <td>{formatDate(loan.dateDisbursed)}</td>
                    <td>{formatDate(loan.expirationDate)}</td>
                    <td>{loan.interestRate ?? "—"}</td>
                    <td>{loan.duration || "—"}</td>
                    <td>{loan.paymentPlan || "—"}</td>
                    <td>{formatCurrency(loan.expectedInterest)}</td>
                    <td>{formatCurrency(loan.totalCollectible)}</td>
                    <td>{loan.settlementAccount || "—"}</td>
                    <td>{formatDate(loan.paymentStartDate)}</td>
                    <td>{formatCurrency(loan.accruedInterest)}</td>
                    <td>{formatCurrency(loan.interestArrears)}</td>
                    <td>{formatCurrency(loan.principalArrears)}</td>
                    <td>{loan.daysInArrear ?? "—"}</td>
                    <td>{formatCurrency(loan.penaltyOutstanding)}</td>
                    <td>{formatCurrency(loan.principalPaid)}</td>
                    <td>{formatCurrency(loan.interestPaid)}</td>
                    <td>{formatCurrency(loan.feePaid)}</td>
                    <td>{formatCurrency(loan.principalOutstanding)}</td>
                    <td>{formatCurrency(loan.interestOutstanding)}</td>
                    <td>{formatCurrency(loan.feeOutstanding)}</td>
                    <td>{formatCurrency(loan.totalOutstanding)}</td>
                    <td>{loan.creditOfficer || "—"}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    {renderDropdownPortal(loan)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ---------------------------------------------
  // Completed Loans Table
  // ---------------------------------------------
  const renderCompletedLoans = () => {
    return (
      <div className="mb-4">
        <h6 className="fw-semibold mb-3">✅ Completed Loans</h6>
        <div
          className="border rounded shadow-sm"
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "60vh",
            width: "100%",
          }}
        >
          <table
            className="table table-sm table-bordered table-hover align-middle mb-0"
            style={{
              minWidth: "max-content",
              whiteSpace: "nowrap",
              width: "100%",
            }}
          >
            <thead
              className="table-light"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              <tr>
                <th style={{ position: "sticky", left: 0, background: "#f8f9fa", zIndex: 30 }}>
                  S/N
                </th>
                <th style={{ position: "sticky", left: "60px", background: "#f8f9fa", zIndex: 30 }}>
                  Action
                </th>
                <th>Loan ID</th>
                <th>Loan Type</th>
                <th>Principal (₵)</th>
                <th>Total Paid (₵)</th>
                <th>Closure Date</th>
                <th>Interest Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {completedLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No completed loans found
                  </td>
                </tr>
              ) : (
                completedLoans.map((loan, idx) => (
                  <tr key={loan.id}>
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        background: "#fff",
                        zIndex: 10,
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className="text-center"
                      style={{
                        position: "sticky",
                        left: "60px",
                        background: "#fff",
                        zIndex: 10,
                      }}
                    >
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                        type="button"
                        onClick={(e) => handleButtonClick(e, loan, e.currentTarget)}
                      >
                        Select
                      </button>
                    </td>
                    <td>{loan.loanId}</td>
                    <td>{loan.loanType}</td>
                    <td>{formatCurrency(loan.principal)}</td>
                    <td>{formatCurrency(loan.totalPaid || loan.principal)}</td>
                    <td>{formatDate(loan.closureDate || loan.completedDate)}</td>
                    <td>{loan.interestRate ?? "—"}</td>
                    {renderDropdownPortal(loan)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderActiveLoans()}
      {renderCompletedLoans()}
    </div>
  );
};

export default LoanStatementTable;