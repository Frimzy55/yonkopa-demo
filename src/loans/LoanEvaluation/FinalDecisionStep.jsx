import React, { useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";

const FinalDecisionStep = ({ loan, onBack, onSubmit }) => {
  const [comments, setComments] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [recommendedAmount, setRecommendedAmount] = useState("");
  const [recommendedTerm, setRecommendedTerm] = useState("");

  // Optional: pre-fill from loan data if available
  // useEffect(() => {
  //   if (loan) {
  //     setRecommendedAmount(loan.approved_amount || "");
  //     setRecommendedTerm(loan.loanTerm || "");
  //   }
  // }, [loan]);

  const handleSubmit = () => {
    if (!confirmed) return;

    // Basic validation
    const amount = parseFloat(recommendedAmount);
    const term = parseInt(recommendedTerm, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive recommended amount.");
      return;
    }
    if (isNaN(term) || term <= 0) {
      alert("Please enter a valid positive recommended term (months).");
      return;
    }

    const finalData = {
      comments,
      confirmed,
       supervisorRecommendedAmount: amount,   // ✅ changed key
      supervisorRecommendedTerm: term,       // ✅ changed key        // supervisor approved term
    };

    onSubmit(finalData);
  };

  return (
    <>
      <h5 className="mb-3">Final Decision</h5>
      <p className="text-muted mb-3">
        Credit information for <strong>{loan?.applicant_fullName}</strong>
      </p>
      <div className="mb-3">
        <small className="text-muted text-uppercase d-block mb-1">Loan ID</small>
        <strong className="fs-5">{loan.loan_id || loan.id}</strong>
      </div>

      <Card className="p-3 bg-light border">
        <p className="mb-0">
          Review all details before submitting the evaluation.
        </p>
      </Card>

      {/* Supervisor Recommendations */}
      <Row className="mt-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>Recommended Amount (₵)</strong></Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5000.00"
              value={recommendedAmount}
              onChange={(e) => setRecommendedAmount(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label><strong>Recommended Term (months)</strong></Form.Label>
            <Form.Control
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 12"
              value={recommendedTerm}
              onChange={(e) => setRecommendedTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Final Comments */}
      <Form.Group className="mt-3">
        <Form.Label>Recommendation Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter any final remarks..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Form.Group>

      {/* Confirmation Checkbox */}
      <Form.Check
        type="checkbox"
        label="I confirm that all information provided is accurate."
        className="mt-3"
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
      />

      {/* Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button variant="outline-secondary" onClick={onBack}>
          ← Previous
        </Button>

        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!confirmed}
        >
          Submit Evaluation
        </Button>
      </div>
    </>
  );
};

export default FinalDecisionStep;