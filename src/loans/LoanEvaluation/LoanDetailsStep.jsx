import React from "react";
import { Row, Col, Button, Badge, Card } from "react-bootstrap";

const LoanDetailsStep = ({ loan, onNext }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format status badge variant
  const getStatusVariant = (status) => {
    const statusMap = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger',
      'under_review': 'info',
      'disbursed': 'primary'
    };
    return statusMap[status?.toLowerCase()] || 'secondary';
  };

  return (
    <>
      <h5 className="mb-3 fw-semibold">Loan Details</h5>
      <p className="text-muted mb-4">
        Review the loan application details before proceeding with evaluation.
      </p>

      <Card className="bg-light border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Loan ID</small>
                <strong className="fs-5">{loan.loan_id || loan.id}</strong>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Kyc code</small>
                <strong className="fs-5">{loan.kyc_code || 'N/A'}</strong>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Full Name</small>
                <strong className="fs-5">{loan.applicant_fullName}</strong>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Phone Number</small>
                <strong className="fs-5">{loan.mobileNumber}</strong>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Loan Amount</small>
                <strong className="fs-4 text-primary">{formatCurrency(loan.loanAmount)}</strong>
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted text-uppercase d-block mb-1">Application Status</small>
                <Badge 
                  bg={getStatusVariant(loan.loan_status)} 
                  className="px-3 py-2 fs-6"
                >
                  {loan.loan_status?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
            </Col>
          </Row>

          {/* Additional loan details if available */}
          {(loan.loanPurpose || loan.applicationDate) && (
            <>
              <hr className="my-3" />
              <Row className="g-3">
                {loan.loanPurpose && (
                  <Col md={12}>
                    <div>
                      <small className="text-muted text-uppercase d-block mb-1">Loan Purpose</small>
                      <p className="mb-0">{loan.loanPurpose}</p>
                    </div>
                  </Col>
                )}
                {loan.applicant_created_at && (
                  <Col md={6}>
                    <div>
                      <small className="text-muted text-uppercase d-block mb-1">Application Date</small>
                      <span>{new Date(loan.applicant_created_at).toLocaleDateString()}</span>
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button 
          variant="primary" 
          onClick={() => onNext(loan)}
          className="px-4"
        >
          Continue to Collateral →
        </Button>
      </div>
    </>
  );
};

export default LoanDetailsStep;