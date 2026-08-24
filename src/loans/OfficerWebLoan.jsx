import React, { useState, useEffect } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import KycFullDetailsModal from "./KycFullDetailsModal";

const OfficerWebLoan = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

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

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;

    fetch(`${apiUrl}/api/officer-web-loans`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
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
  };

  const handleReject = (loan) => {
    console.log("Reject loan:", loan);
  };

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
                            loan.status,
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
                              onClick={() => handleReject(loan)}
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
    </div>
  );
};

export default OfficerWebLoan;
