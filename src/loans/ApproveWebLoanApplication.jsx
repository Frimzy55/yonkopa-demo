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

  // ✅ Evaluation screen state
  const [evaluatingLoan, setEvaluatingLoan] = useState(null);
  
  // ✅ Track the row that was clicked for highlighting
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  
  // ✅ Ref to scroll to highlighted row
  const tableRef = useRef(null);

  const [evaluationStep, setEvaluationStep] = useState(1);

  // ✅ Fetch all loans
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
          err.response?.data?.error ||
            err.message ||
            "Error fetching loan data"
        );
        setLoading(false);
      }
    };

    fetchLoanData();
  }, []);

  // ✅ Scroll to and highlight row when returning from evaluation
  useEffect(() => {
    if (!evaluatingLoan && highlightedRowId && tableRef.current) {
      // Find the row element and scroll to it
      const rowElement = document.getElementById(`loan-row-${highlightedRowId}`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedRowId(null);
        }, 3000);
      }
    }
  }, [evaluatingLoan, highlightedRowId]);

  const handleAction = async (action, loan) => {
    // 🔍 REVIEW
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

    // ✅ EVALUATE - Store the loan ID for highlighting when returning
    if (action === "evaluate") {
      setHighlightedRowId(loan.loan_id);
      setEvaluatingLoan(loan);
       setEvaluationStep(1);
    }

    // ✅ APPROVE
    if (action === "approve") {
      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/loan/approve`,
          { loan_id: loan.loan_id }
        );

        const updated = loanData.map((item) =>
          item.loan_id === loan.loan_id
            ? { ...item, loan_status: "approved" }
            : item
        );

        setLoanData(updated);
        setFilteredData(updated);
        setEvaluatingLoan(null);
        setHighlightedRowId(null);
      } catch (err) {
        console.error("Approve failed:", err);
      }
    }

    // ❌ REJECT
    if (action === "reject") {
      const confirmReject = window.confirm(
        "Are you sure you want to reject this loan?"
      );

      if (!confirmReject) return;

      try {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/loan/reject`,
          { loan_id: loan.loan_id }
        );

        const updated = loanData.map((item) =>
          item.loan_id === loan.loan_id
            ? { ...item, loan_status: "rejected" }
            : item
        );

        setLoanData(updated);
        setFilteredData(updated);
        setEvaluatingLoan(null);
        setHighlightedRowId(null);
      } catch (err) {
        console.error("Reject failed:", err);
      }
    }

    // ⚠️ SKIP
   /* if (action === "skip") {
      setEvaluatingLoan(null);
      setHighlightedRowId(null);
    }*/

    if (action === "skip") {
  setHighlightedRowId(loan.loan_id);
  setEvaluatingLoan(loan);
  setEvaluationStep(4); // jump to final step
}


  };

  // ✅ VIEW KYC
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

  // 🔍 Search
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

  // 📄 Entries
  const handleEntriesChange = (e) => {
    setEntries(Number(e.target.value));
  };

  // 🎨 Status Badge
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge bg="success">{status}</Badge>;
      case "rejected":
        return <Badge bg="danger">{status}</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            {status}
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // ⏳ Loading
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  // ❌ Error
  if (error)
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  // ✅ EVALUATION SCREEN (TABLE HIDDEN)
  if (evaluatingLoan) {
    return (
      <LoanEvaluation
        loan={evaluatingLoan}
         initialStep={evaluationStep}
        onApprove={(loan) => handleAction("approve", loan)}
        onReject={(loan) => handleAction("reject", loan)}
        onBack={() => {
          // Clear evaluating loan but keep highlightedRowId
          setEvaluatingLoan(null);
          // The useEffect will handle scrolling when this returns
        }}
      />
    );
  }

  // ✅ DEFAULT TABLE VIEW
  return (
    <div className="loan-table-container" ref={tableRef}>
      <h2 className="mb-4">Full Loan KYC Applications</h2>

      {/* Add custom CSS for highlighting */}
      <style>
        {`
          .highlight-row {
            animation: highlightFade 3s ease-in-out;
            background-color: #fff3cd !important;
            border-left: 4px solid #ffc107 !important;
          }
          
          @keyframes highlightFade {
            0% {
              background-color: #fff3cd;
            }
            70% {
              background-color: #fff3cd;
            }
            100% {
              background-color: transparent;
            }
          }
        `}
      </style>

      {/* Search */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </Col>

        <Col md={3}>
          <Form.Select value={entries} onChange={handleEntriesChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
      <Table bordered hover>
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
              key={loan.applicant_id}
              id={`loan-row-${loan.loan_id}`}
              className={highlightedRowId === loan.loan_id ? "highlight-row" : ""}
            >
              <td>{loan.loan_id}</td>
              <td>{loan.kyc_code}</td>
              <td>{loan.applicant_fullName}</td>
              <td>{loan.mobileNumber}</td>
              <td>₵{loan.loanAmount}</td>
              <td>{getStatusBadge(loan.loan_status)}</td>
              <td>
                {new Date(
                  loan.applicant_created_at
                ).toLocaleString()}
              </td>

              <td>
                <Dropdown as={ButtonGroup}>
                  <Dropdown.Toggle size="sm">
                    Actions
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => handleAction("review", loan)}
                    >
                      Review
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => handleAction("evaluate", loan)}
                    >
                      Evaluate Loan
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => handleAction("skip", loan)}
                    >
                      Skip Evaluation
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => handleAction("reject", loan)}
                    >
                      Reject
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modals */}
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