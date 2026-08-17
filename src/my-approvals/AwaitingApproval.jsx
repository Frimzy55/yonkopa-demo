import React, { useState, useEffect } from 'react';
import { Table, Dropdown, ButtonGroup, Modal, Form, Button, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import './AwaitingApproval.css';
import LoanDetailsModal from "./AwaitLoanDetailsModal";

// ─── Approval Modal Component ──────────────────────────────────────────────
const ApprovalModal = ({ show, loan, onClose, onApprove }) => {
  const [finalAmount, setFinalAmount] = useState('');
  const [finalTerm, setFinalTerm] = useState('');
  const [comments, setComments] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supervisorRec, setSupervisorRec] = useState({ amount: null, term: null });

  useEffect(() => {
    if (show && loan?.loan_id) {
      const fetchSupervisorRec = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/admin/loan-supervisor-recommendation/${loan.loan_id}`
          );
          if (!response.ok) throw new Error('Failed to fetch supervisor recommendation');
          const data = await response.json();
          setSupervisorRec({
            amount: data.supervisor_recommended_amount,
            term: data.supervisor_recommended_term,
          });
        } catch (error) {
          console.error('Error fetching supervisor rec:', error);
          setSupervisorRec({ amount: null, term: null });
        }
      };
      fetchSupervisorRec();
    }
  }, [show, loan]);

  useEffect(() => {
    if (loan) {
      const requestedAmount = loan.kyc_loan_amount || '';
      const requestedTerm = loan.loanTerm || '';
      setFinalAmount(requestedAmount);
      setFinalTerm(requestedTerm);
      setComments('');
      setConfirmed(false);
    }
  }, [loan, show]);

  const handleSubmit = async () => {
    if (!confirmed) return;

    const fAmt = parseFloat(finalAmount);
    const fTerm = parseInt(finalTerm, 10);

    if (isNaN(fAmt) || fAmt <= 0) {
      alert('Please enter a valid positive final amount.');
      return;
    }
    if (isNaN(fTerm) || fTerm <= 0) {
      alert('Please enter a valid positive final term (months).');
      return;
    }

    setSubmitting(true);
    try {
      await onApprove(loan.loan_id, {
        finalAmount: fAmt,
        finalTerm: fTerm,
        comments,
      });
      onClose();
    } catch (error) {
      alert(`Approval failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Approve Loan Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Loan ID:</strong> {loan?.loan_id}</p>
        <p><strong>Applicant:</strong> {loan?.applicant_fullName}</p>
        <hr />

        {/* Requested Details */}
        <div className="mb-4 p-3 bg-light border rounded">
          <h6 className="text-muted">Requested Details</h6>
          <Row>
            <Col md={6}>
              <strong>Requested Amount:</strong>{' '}
              ₵{parseFloat(loan?.kyc_loan_amount || 0).toLocaleString()}
            </Col>
            <Col md={6}>
              <strong>Requested Term:</strong> {loan?.loanTerm || '-'} months
            </Col>
          </Row>
        </div>

        {/* Supervisor Recommendation */}
        {(supervisorRec.amount !== null || supervisorRec.term !== null) && (
          <div className="mb-4 p-3 bg-info bg-opacity-10 border border-info rounded">
            <h6 className="text-info">Supervisor Recommendation</h6>
            <Row>
              <Col md={6}>
                <strong>Recommended Amount:</strong>{' '}
                ₵{parseFloat(supervisorRec.amount || 0).toLocaleString()}
              </Col>
              <Col md={6}>
                <strong>Recommended Term:</strong> {supervisorRec.term || '-'} months
              </Col>
            </Row>
          </div>
        )}

        {/* Final Approval Details */}
        <h6 className="mb-3">Final Approval Details</h6>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><strong>Final Amount (₵)</strong></Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  placeholder="e.g. 5000.00"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label><strong>Final Term (months)</strong></Form.Label>
                <Form.Control
                  type="number"
                  step="1"
                  min="1"
                  value={finalTerm}
                  onChange={(e) => setFinalTerm(e.target.value)}
                  placeholder="e.g. 12"
                  disabled={submitting}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Comments / Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional final remarks..."
              disabled={submitting}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="I confirm that all information provided is accurate."
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={submitting}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!confirmed || submitting}
        >
          {submitting ? 'Approving...' : 'Approve Loan'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
const AwaitingApproval = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState(10);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalLoan, setApprovalLoan] = useState(null);

  // ── Success Toast state ──
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLoanData();
  }, []);

  const fetchLoanData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/loan-full-view-evaluation?status=all`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLoans(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching loan data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      under_review: 'info',
      disbursed: 'primary',
    };
    const color = statusColors[status?.toLowerCase()] || 'secondary';
    return <span className={`badge bg-${color}`}>{status || 'Pending'}</span>;
  };

  const handleAction = async (action, loan) => {
    switch (action) {
      case 'view':
        setSelectedLoan(loan);
        setShowModal(true);
        break;
      case 'approve':
        setApprovalLoan(loan);
        setShowApprovalModal(true);
        break;
      case 'reject':
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/loan/reject1`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ loan_id: loan.loan_id }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Reject failed');
          }
          const updated = loans.map((item) =>
            item.loan_id === loan.loan_id
              ? { ...item, loan_status: 'rejected' }
              : item
          );
          setLoans(updated);
        } catch (err) {
          console.error('Reject failed:', err);
          alert(err.message);
        }
        break;
      default:
        break;
    }
  };

  // ── Approve submit handler ──
  const handleApproveSubmit = async (loanId, data) => {
    const { finalAmount, finalTerm, comments } = data;
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/approve-loan1/${loanId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_amount: finalAmount,
          final_term: finalTerm,
          comments,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Approval failed');
    }

    // ── Update local state ──
    const updated = loans.map((item) =>
      item.loan_id === loanId
        ? { ...item, loan_status: 'approved', approved_amount: finalAmount }
        : item
    );
    setLoans(updated);

    // ── Show success toast with customer ID ──
    const approvedLoan = loans.find(l => l.loan_id === loanId);
    const customerId = approvedLoan?.customer_id || approvedLoan?.applicant_id || loanId;
    setSuccessMessage(`Loan ${loanId} for customer approved successfully!`);
    setShowSuccessToast(true);

    // Auto‑dismiss after 5 seconds
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  // Filtering
  const filteredData = loans.filter((loan) => {
    if (['approved', 'rejected'].includes(loan.loan_status?.toLowerCase())) {
      return false;
    }
    if (!searchTerm) return true;
    const searchFields = [
      loan.loan_id,
      loan.kyc_code,
      loan.applicant_fullName,
      loan.mobileNumber,
      loan.kyc_loan_amount,
      loan.loan_status,
    ];
    return searchFields.some(
      (field) =>
        field &&
        field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Render states
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading loan applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchLoanData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="awaiting-approval-container">
      {/* ── Success Toast ── */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          delay={5000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">✅ Approval Successful</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{successMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="header-section">
        <h1>Loan Applications - Awaiting Approval</h1>
        <div className="stats">
          <span className="total-count">Total Applications: {loans.length}</span>
          <span className="pending-count">
            Pending:{' '}
            {
              loans.filter((l) => l.loan_status?.toLowerCase() === 'pending')
                .length
            }
          </span>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search by Loan ID, Customer ID, Name, Phone, Amount, or Status..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="entries-select">
          <label>Show entries: </label>
          <select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button onClick={fetchLoanData} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="table-container">
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Kyc code</th>
              <th>Full Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, entries).map((loan) => (
              <tr
                key={loan.applicant_id || loan.loan_id}
                id={`loan-row-${loan.loan_id}`}
                className={
                  highlightedRowId === loan.loan_id ? 'highlight-row' : ''
                }
              >
                <td>{loan.loan_id}</td>
                <td>{loan.kyc_code}</td>
                <td>{loan.applicant_fullName}</td>
                <td>{loan.mobileNumber}</td>
                <td>₵{parseFloat(loan.kyc_loan_amount).toLocaleString()}</td>
                <td>{getStatusBadge(loan.loan_status)}</td>
                <td>
                  {loan.loan_created_at
                    ? new Date(loan.loan_created_at).toLocaleString()
                    : '-'}
                </td>
                <td>
                  <Dropdown as={ButtonGroup} size="sm" drop="up">
                    <Dropdown.Toggle variant="secondary" size="sm">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleAction('view', loan)}>
                        View Details
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleAction('approve', loan)}>
                        Approve
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleAction('reject', loan)}>
                        Reject
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No loan applications found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {filteredData.length > 0 && (
        <div className="pagination-info">
          Showing {Math.min(entries, filteredData.length)} of{' '}
          {filteredData.length} applications
          {filteredData.length !== loans.length &&
            ` (filtered from ${loans.length} total)`}
        </div>
      )}

      <LoanDetailsModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        loan={selectedLoan}
        imageBaseUrl="http://localhost:5002/uploads/"
      />

      <ApprovalModal
        show={showApprovalModal}
        loan={approvalLoan}
        onClose={() => {
          setShowApprovalModal(false);
          setApprovalLoan(null);
        }}
        onApprove={handleApproveSubmit}
      />
    </div>
  );
};

export default AwaitingApproval;