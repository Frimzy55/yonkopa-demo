import React, { useState, useEffect } from "react";
import { Dropdown, ButtonGroup, Modal, Button } from "react-bootstrap";
import KycFullDetailsModal from "./KycFullDetailsModal";

const OfficerWebLoan = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // ----- State for confirmation modal -----
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loanToReject, setLoanToReject] = useState(null);

  // ----- State for notification modal -----
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success"); // "success" or "danger"

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ----- Reusable fetch function -----
  const fetchLoans = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/officer-web-loans`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const mapped = data.map((row) => ({
        id: row.client_id,
        fullName:
          row.full_name ||
          (row.first_name && row.surname
            ? `${row.first_name} ${row.surname}`
            : "N/A"),
        phone: row.phone || "N/A",
        amount: row.loan_amount
          ? `GHS ${Number(row.loan_amount).toLocaleString()}`
          : "N/A",
        status: row.security_verification || "Pending",
        date: formatDate(row.applicant_created_at || row.applicant_created_at),
        raw: row,
      }));
      setLoans(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-warning text-dark",
      approved: "bg-success text-white",
      "under review": "bg-info text-white",
      rejected: "bg-danger text-white",
      verified: "bg-success text-white",
    };
    return styles[status?.toLowerCase()] || "bg-secondary text-white";
  };

  const handleView = (loan) => {
    setSelectedLoan(loan.raw);
    setShowDetailsModal(true);
  };

  const handleApprove = (loan) => {
    console.log("Approve loan:", loan);
    // TODO: implement approve API call
  };

  // ----- Open confirmation modal -----
  const openConfirmModal = (loan) => {
    setLoanToReject(loan);
    setShowConfirmModal(true);
  };

  // ----- Perform the actual reject (called from confirm modal) -----
  const rejectLoan = async () => {
    if (!loanToReject) return;
    const apiUrl = process.env.REACT_APP_API_URL;
    const clientId = loanToReject.id;

    try {
      const response = await fetch(`${apiUrl}/api/officer-web-loans/${clientId}/reject`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject loan");
      }

      // Remove the rejected loan from the list (optimistic update)
      setLoans((prev) => prev.filter((l) => l.id !== clientId));

      // Close confirmation modal
      setShowConfirmModal(false);
      setLoanToReject(null);

      // Show success modal
      setNotificationMessage("Loan application rejected successfully.");
      setNotificationVariant("success");
      setShowNotificationModal(true);
    } catch (err) {
      console.error("Reject error:", err);
      // Close confirmation modal
      setShowConfirmModal(false);
      setLoanToReject(null);
      // Show error modal
      setNotificationMessage(`Error: ${err.message}`);
      setNotificationVariant("danger");
      setShowNotificationModal(true);
    }
  };

  // ----- Cancel rejection -----
  const cancelReject = () => {
    setShowConfirmModal(false);
    setLoanToReject(null);
  };

  // ----- Loading & Error States -----
  if (loading) {
    return (
      <div className="container-fluid p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger border-0 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Error loading loan applications: {error}
        </div>
      </div>
    );
  }

  // ----- Main Render -----
  return (
    <div
      className="container-fluid p-4"
      style={{ minHeight: "100vh", background: "#f8fafc" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-secondary">
            Officer's Web Loan Applications
          </h4>
          <small className="text-muted">
            Review and manage web loan applications
          </small>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm"
        style={{ borderRadius: "12px", overflow: "visible" }}
      >
        <div className="card-body p-0" style={{ overflow: "visible" }}>
          <div
            className="table-responsive"
            style={{ overflowX: "auto", overflowY: "visible" }}
          >
            <table className="table table-hover mb-0 align-middle">
              <thead
                style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #dee2e6",
                }}
              >
                <tr>
                  <th className="fw-semibold text-muted py-3 px-4">Loan ID</th>
                  <th className="fw-semibold text-muted py-3">Full Name</th>
                  <th className="fw-semibold text-muted py-3">Phone</th>
                  <th className="fw-semibold text-muted py-3">Amount</th>
                  <th className="fw-semibold text-muted py-3">Status</th>
                  <th className="fw-semibold text-muted py-3">Date</th>
                  <th className="fw-semibold text-muted py-3 text-center px-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      <i
                        className="bi bi-folder2-open d-block mb-2"
                        style={{ fontSize: "30px" }}
                      ></i>
                      No web loan applications found.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="py-3 px-4">
                        <strong className="text-primary">
                          WL-{String(loan.id).padStart(5, "0")}
                        </strong>
                      </td>
                      <td className="py-3 fw-semibold">
                        {loan.fullName || "N/A"}
                      </td>
                      <td className="py-3 text-muted">{loan.phone}</td>
                      <td className="py-3 fw-semibold">{loan.amount}</td>
                      <td className="py-3">
                        <span
                          className={`badge ${getStatusBadge(
                            loan.status
                          )} px-3 py-2 rounded-pill`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted">
                        <i className="bi bi-calendar3 me-2"></i>
                        {loan.date}
                      </td>

                      <td
                        className="py-3 text-center px-4"
                        style={{
                          position: "relative",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Dropdown
                          as={ButtonGroup}
                          align="end"
                          drop="up"
                          popperConfig={{
                            modifiers: [
                              {
                                name: "preventOverflow",
                                options: { boundary: "viewport" },
                              },
                            ],
                          }}
                        >
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-pill px-3"
                          >
                            Actions
                          </Dropdown.Toggle>

                          <Dropdown.Menu
                            className="shadow-sm border-0"
                            style={{
                              minWidth: "170px",
                              borderRadius: "10px",
                              padding: "6px",
                            }}
                          >
                            <Dropdown.Item
                              onClick={() => handleView(loan)}
                              className="rounded-2 py-2"
                            >
                              <i className="bi bi-eye me-2 text-primary"></i>
                              View Details
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => handleApprove(loan)}
                              className="rounded-2 py-2"
                            >
                              <i className="bi bi-check2-circle me-2 text-success"></i>
                              Approve
                            </Dropdown.Item>

                            <Dropdown.Item
                              onClick={() => openConfirmModal(loan)}
                              className="rounded-2 py-2"
                            >
                              <i className="bi bi-x-circle me-2 text-danger"></i>
                              Reject
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <KycFullDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLoan(null);
        }}
        kycData={selectedLoan}
      />

      {/* ---- Confirmation Modal ---- */}
      <Modal
        show={showConfirmModal}
        onHide={cancelReject}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to reject the loan application for{" "}
            <strong>{loanToReject?.fullName}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelReject}>
            Cancel
          </Button>
          <Button variant="danger" onClick={rejectLoan}>
            Yes, Reject
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---- Notification Modal ---- */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {notificationVariant === "success" ? "Success" : "Error"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{notificationMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={notificationVariant === "success" ? "success" : "danger"}
            onClick={() => setShowNotificationModal(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OfficerWebLoan;