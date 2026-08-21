// src/loans/ApproveWebLoanApplication.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Spinner,
  Alert,
  Dropdown,
  ButtonGroup,
  Form,
  Row,
  Col,
  Badge,
  Modal,
  Button,
  Card,
} from "react-bootstrap";
import axios from "axios";
import LoanDetailsModal from "./LoanDetailsModal";
import KycDetailsModal from "./KycDetailsModal";
import LoanEvaluation from "./LoanEvaluation/LoanEvaluation";

const ApproveWebLoanApplication = () => {
  const [loanData, setLoanData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLoan, setRejectLoan] = useState(null);

  const [evaluatingLoan, setEvaluatingLoan] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const tableRef = useRef(null);
  const [evaluationStep, setEvaluationStep] = useState(1);

  // Helper: format date
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

  // Fetch all loans
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/full-loan-kyc`
        );
        setLoanData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Error fetching loan data"
        );
        setLoading(false);
      }
    };
    fetchLoanData();
  }, []);

  // Scroll to and highlight row when returning from evaluation
  useEffect(() => {
    if (!evaluatingLoan && highlightedRowId && tableRef.current) {
      const rowElement = document.getElementById(`loan-row-${highlightedRowId}`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightedRowId(null), 3000);
      }
    }
  }, [evaluatingLoan, highlightedRowId]);

  const handleAction = async (action, loan) => {
    if (action === "review") {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/loan/${loan.userId}`
        );
        setSelectedLoan(res.data);
        setShowModal(true);
      } catch (err) {
        console.error("Error fetching review:", err);
      }
    }

    if (action === "evaluate") {
      setHighlightedRowId(loan.loan_id);
      setEvaluatingLoan(loan);
      setEvaluationStep(1);
    }

    if (action === "approve") {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/loan/approve`, {
          loan_id: loan.loan_id,
        });
        const updated = loanData.map((item) =>
          item.loan_id === loan.loan_id ? { ...item, loan_status: "approved" } : item
        );
        setLoanData(updated);
        setFilteredData(updated);
        setEvaluatingLoan(null);
        setHighlightedRowId(null);
      } catch (err) {
        console.error("Approve failed:", err);
      }
    }

    if (action === "reject") {
      setRejectLoan(loan);
      setShowRejectModal(true);
    }

    if (action === "skip") {
      setHighlightedRowId(loan.loan_id);
      setEvaluatingLoan(loan);
      setEvaluationStep(4);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectLoan) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/loan/reject`, {
        loan_id: rejectLoan.loan_id,
      });
      const updated = loanData.map((item) =>
        item.loan_id === rejectLoan.loan_id ? { ...item, loan_status: "rejected" } : item
      );
      setLoanData(updated);
      setFilteredData(updated);
      setEvaluatingLoan(null);
      setHighlightedRowId(null);
      setShowRejectModal(false);
      setRejectLoan(null);
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectLoan(null);
  };

  const handleViewKyc = async (loan) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/kyc/${loan.kyc_code}`
      );
      setSelectedKyc(res.data);
      setShowKycModal(true);
    } catch (err) {
      console.error("Error fetching KYC:", err);
      setSelectedKyc(loan);
      setShowKycModal(true);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = loanData.filter(
      (loan) =>
        loan.applicant_fullName.toLowerCase().includes(term) ||
        loan.kyc_code.toLowerCase().includes(term) ||
        loan.mobileNumber.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  const handleEntriesChange = (e) => {
    setEntries(Number(e.target.value));
  };

  const getStatusBadge = (status) => {
    const map = {
      approved: "success",
      rejected: "danger",
      pending: "warning",
    };
    const variant = map[status?.toLowerCase()] || "secondary";
    return <Badge bg={variant} pill className="px-3 py-2">{status}</Badge>;
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  if (evaluatingLoan) {
    return (
      <LoanEvaluation
        loan={evaluatingLoan}
        initialStep={evaluationStep}
        onApprove={(loan) => handleAction("approve", loan)}
        onReject={(loan) => handleAction("reject", loan)}
        onBack={() => setEvaluatingLoan(null)}
      />
    );
  }

  return (
    <div className="container-fluid p-4" ref={tableRef}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-secondary">Full Loan KYC Applications</h4>
      </div>

      {/* Styling for highlight */}
      <style>
        {`
          .highlight-row {
            animation: highlightFade 3s ease-in-out;
            background-color: #fff3cd !important;
            border-left: 4px solid #ffc107 !important;
          }
          @keyframes highlightFade {
            0% { background-color: #fff3cd; }
            70% { background-color: #fff3cd; }
            100% { background-color: transparent; }
          }
        `}
      </style>

      {/* Filters */}
      <Row className="mb-3 align-items-end">
        <Col md={6} lg={4}>
          <Form.Control
            type="text"
            placeholder="Search by name, KYC code or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="rounded-pill"
          />
        </Col>
        <Col md={3} lg={2}>
          <Form.Select value={entries} onChange={handleEntriesChange} className="rounded-pill">
            <option value={5}>5 entries</option>
            <option value={10}>10 entries</option>
            <option value={25}>25 entries</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table Card */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
              <thead className="bg-light" style={{ borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th className="fw-semibold text-muted py-3">Loan ID</th>
                  <th className="fw-semibold text-muted py-3">KYC Code</th>
                  <th className="fw-semibold text-muted py-3">Full Name</th>
                  <th className="fw-semibold text-muted py-3">Phone</th>
                  <th className="fw-semibold text-muted py-3">Amount</th>
                  <th className="fw-semibold text-muted py-3">Status</th>
                  <th className="fw-semibold text-muted py-3">Date</th>
                  <th className="fw-semibold text-muted py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      No loan applications found.
                    </td>
                  </tr>
                ) : (
                  filteredData.slice(0, entries).map((loan) => (
                    <tr
                      key={loan.applicant_id}
                      id={`loan-row-${loan.loan_id}`}
                      className={highlightedRowId === loan.loan_id ? "highlight-row" : ""}
                    >
                      <td className="py-2">
                        <strong className="text-primary">WL-{String(loan.loan_id).padStart(5, "0")}</strong>
                      </td>
                      <td className="py-2">{loan.kyc_code}</td>
                      <td className="py-2">{loan.applicant_fullName}</td>
                      <td className="py-2">{loan.mobileNumber}</td>
                      <td className="py-2 fw-semibold">₵{loan.loanAmount}</td>
                      <td className="py-2">{getStatusBadge(loan.loan_status)}</td>
                      <td className="py-2">{formatDate(loan.applicant_created_at)}</td>
                      <td className="py-2 text-center">
                        <Dropdown as={ButtonGroup}>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            className="rounded-pill px-3"
                          >
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => handleAction("review", loan)}>
                              <i className="bi bi-eye me-2"></i> Review
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleAction("evaluate", loan)}>
                              <i className="bi bi-clipboard-check me-2"></i> Evaluate Loan
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleAction("skip", loan)}>
                              <i className="bi bi-fast-forward me-2"></i> Skip Evaluation
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleAction("reject", loan)}>
                              <i className="bi bi-x-circle me-2 text-danger"></i> Reject
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Reject Confirmation Modal */}
      <Modal show={showRejectModal} onHide={handleCancelReject} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-0">Are you sure you want to reject this loan application?</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={handleCancelReject}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmReject} className="px-4">
            Yes, Reject
          </Button>
        </Modal.Footer>
      </Modal>

      <LoanDetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        loan={selectedLoan}
        onApprove={(loan) => handleAction("approve", loan)}
        onReject={(loan) => handleAction("reject", loan)}
        onViewKyc={handleViewKyc}
      />

      <KycDetailsModal
        show={showKycModal}
        onClose={() => setShowKycModal(false)}
        kyc={selectedKyc}
      />
    </div>
  );
};

export default ApproveWebLoanApplication;