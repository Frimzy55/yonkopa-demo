// src/loans/KycFullDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Card, Row, Col, Badge, Image, Table, Button, Spinner
} from 'react-bootstrap';
import axios from 'axios';

const KycFullDetailsModal = ({ show, onClose, kycData }) => {
  const [references, setReferences] = useState([]);
  const [clientDocs, setClientDocs] = useState([]);
  const [guarantorDocs, setGuarantorDocs] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [loading, setLoading] = useState({
    references: false,
    clientDocs: false,
    guarantorDocs: false,
    loanHistory: false,
  });
  const [error, setError] = useState({
    references: null,
    clientDocs: null,
    guarantorDocs: null,
    loanHistory: null,
  });

  useEffect(() => {
    if (!show || !kycData?.client_id) return;

    const clientId = kycData.client_id;
    const apiUrl = process.env.REACT_APP_API_URL;

    // Fetch References
    setLoading(prev => ({ ...prev, references: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/references`)
      .then(res => {
        setReferences(res.data);
        setError(prev => ({ ...prev, references: null }));
      })
      .catch(err => setError(prev => ({ ...prev, references: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, references: false })));

    // Fetch Client Documents
    setLoading(prev => ({ ...prev, clientDocs: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/documents`)
      .then(res => {
        setClientDocs(res.data);
        setError(prev => ({ ...prev, clientDocs: null }));
      })
      .catch(err => setError(prev => ({ ...prev, clientDocs: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, clientDocs: false })));

    // Fetch Guarantor Documents
    setLoading(prev => ({ ...prev, guarantorDocs: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/guarantor-documents`)
      .then(res => {
        setGuarantorDocs(res.data);
        setError(prev => ({ ...prev, guarantorDocs: null }));
      })
      .catch(err => setError(prev => ({ ...prev, guarantorDocs: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, guarantorDocs: false })));

    // Fetch Loan History
    setLoading(prev => ({ ...prev, loanHistory: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/loan-history`)
      .then(res => {
        setLoanHistory(res.data);
        setError(prev => ({ ...prev, loanHistory: null }));
      })
      .catch(err => setError(prev => ({ ...prev, loanHistory: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, loanHistory: false })));

  }, [show, kycData]);

  if (!kycData) return null;

  // Helper to get full name from available fields
  const getFullName = () => {
    if (kycData.full_name) return kycData.full_name;
    if (kycData.first_name || kycData.surname) {
      return `${kycData.first_name || ''} ${kycData.surname || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };

  const renderValue = (value) => (value ? String(value) : 'N/A');

  const renderImage = (path, label) => {
    if (!path) return null;
    const imageUrl = `${process.env.REACT_APP_API_URL}/uploads/${path}`;
    return (
      <div className="mb-3">
        <strong>{label}</strong>
        <div>
          <Image src={imageUrl} alt={label} thumbnail style={{ maxHeight: '150px' }} />
        </div>
      </div>
    );
  };

  const renderArrayItems = (items, type) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <p className="text-muted">No {type} found.</p>;
    }

    if (type === 'references') {
      return (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Relationship</th>
              <th>Location</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ref, idx) => (
              <tr key={idx}>
                <td>{renderValue(ref.reference_name)}</td>
                <td>{renderValue(ref.reference_relationship)}</td>
                <td>{renderValue(ref.reference_location)}</td>
                <td>{renderValue(ref.reference_contact)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    if (type === 'documents') {
      return (
        <div>
          {items.map((doc, idx) => (
            <div key={idx} className="d-flex justify-content-between align-items-center border-bottom py-1">
              <span>
                <strong>{renderValue(doc.display_name)}</strong> ({renderValue(doc.original_filename)})
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => window.open(`${process.env.REACT_APP_API_URL}/uploads/${doc.file_path}`, '_blank')}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'loanHistory') {
      return (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Institution</th>
              <th>Principal</th>
              <th>Installment</th>
              <th>Balance</th>
              <th>Arrears</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {items.map((loan, idx) => (
              <tr key={idx}>
                <td>{renderValue(loan.institution)}</td>
                <td>₵{renderValue(loan.principal_amount)}</td>
                <td>₵{renderValue(loan.installment_amount)}</td>
                <td>₵{renderValue(loan.current_balance)}</td>
                <td>₵{renderValue(loan.arrears_balance)}</td>
                <td>{renderValue(loan.expiry_date)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    return <pre>{JSON.stringify(items, null, 2)}</pre>;
  };

  const renderSection = (title, data, type, isLoading, errorMsg) => {
    if (isLoading) {
      return (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Loading {title}...</span>
        </div>
      );
    }
    if (errorMsg) {
      return <p className="text-danger">Error loading {title}: {errorMsg}</p>;
    }
    return renderArrayItems(data, type);
  };

  const countDetails = [
    { label: 'References', value: kycData.reference_count },
    { label: 'Client Documents', value: kycData.client_document_count },
    { label: 'Guarantor Documents', value: kycData.guarantor_document_count },
    { label: 'Loan History Count', value: kycData.loan_history_count },
    { label: 'Loan Cycle Completed', value: kycData.loan_cycle_completed },
    { label: 'Max Past Due Days', value: kycData.max_past_due_days },
    { label: 'Missed Instalments', value: kycData.missed_instalments },
    { label: 'Write-off Loans', value: kycData.write_off_loans },
    { label: 'Extensions', value: kycData.extensions },
    { label: 'Number of Pay-offs', value: kycData.number_of_pay_off },
  ];

  const fullName = getFullName();

  return (
    <Modal show={show} onHide={onClose} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Full KYC Details – {fullName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3 border-primary">
              <Card.Header className="bg-light text-dark border-bottom">👤 Personal Information</Card.Header>
              <Card.Body>
                <div><strong>Full Name:</strong> {fullName}</div>
                <div><strong>Popular Name:</strong> {renderValue(kycData.popular_name)}</div>
                <div><strong>First Name:</strong> {renderValue(kycData.first_name)}</div>
                <div><strong>Surname:</strong> {renderValue(kycData.surname)}</div>
                <div><strong>Phone:</strong> {renderValue(kycData.phone)}</div>
                <div><strong>Alt Phone:</strong> {renderValue(kycData.alt_phone)}</div>
                <div><strong>Date of Birth:</strong> {renderValue(kycData.date_of_birth)}</div>
                <div><strong>Marital Status:</strong> {renderValue(kycData.marital_status)}</div>
                <div><strong>Hometown:</strong> {renderValue(kycData.hometown)}</div>
                <div><strong>Place of Birth:</strong> {renderValue(kycData.place_of_birth)}</div>
                <div><strong>Ghana Card Number:</strong> {renderValue(kycData.ghana_card_number)}</div>
                <div><strong>Date Issued:</strong> {renderValue(kycData.date_issued)}</div>
                <div><strong>Expiry Date:</strong> {renderValue(kycData.expiry_date)}</div>
                <div><strong>Religion:</strong> {renderValue(kycData.religion)}</div>
                <div><strong>Church:</strong> {renderValue(kycData.church_name)}</div>
                <div><strong>Church Location:</strong> {renderValue(kycData.church_location)}</div>
                <div><strong>Pastor Name:</strong> {renderValue(kycData.pastor_name)}</div>
                <div><strong>Pastor Contact:</strong> {renderValue(kycData.pastor_contact)}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3 border-secondary">
              <Card.Header className="bg-light text-dark border-bottom">👨‍👩‍👧‍👦 Family & Dependents</Card.Header>
              <Card.Body>
                <div><strong>Father Name:</strong> {renderValue(kycData.father_name)}</div>
                <div><strong>Father Contact:</strong> {renderValue(kycData.father_contact)}</div>
                <div><strong>Mother Name:</strong> {renderValue(kycData.mother_name)}</div>
                <div><strong>Mother Contact:</strong> {renderValue(kycData.mother_contact)}</div>
                <div><strong>Spouse Name:</strong> {renderValue(kycData.spouse_name)}</div>
                <div><strong>Spouse Contact:</strong> {renderValue(kycData.spouse_contact)}</div>
                <div><strong>Spouse Occupation:</strong> {renderValue(kycData.spouse_occupation)}</div>
                <div><strong>Number of Dependents:</strong> {renderValue(kycData.number_of_dependents)}</div>
                <div><strong>Household Members:</strong> {renderValue(kycData.household_members)}</div>
                <div><strong>Dependents Schooling:</strong> {renderValue(kycData.dependents_schooling)}</div>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-info">
              <Card.Header className="bg-light text-dark border-bottom">🏠 Residential Details</Card.Header>
              <Card.Body>
                <div><strong>Residential Location:</strong> {renderValue(kycData.residential_location)}</div>
                <div><strong>District:</strong> {renderValue(kycData.district)}</div>
                <div><strong>Ownership:</strong> {renderValue(kycData.residential_ownership)}</div>
                <div><strong>Nearest Landmark:</strong> {renderValue(kycData.nearest_landmark)}</div>
                <div><strong>GPS Address:</strong> {renderValue(kycData.gps_address)}</div>
                <div><strong>Years at Address:</strong> {renderValue(kycData.years_at_address)}</div>
                <div><strong>Rent Advance:</strong> {renderValue(kycData.rent_advance)}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-3 border-success">
              <Card.Header className="bg-light text-dark border-bottom">🏢 Business Information</Card.Header>
              <Card.Body>
                <div><strong>Business Name:</strong> {renderValue(kycData.business_name)}</div>
                <div><strong>Sector:</strong> {renderValue(kycData.business_sector)}</div>
                <div><strong>Types of Business:</strong> {renderValue(kycData.types_of_business)}</div>
                <div><strong>Description:</strong> {renderValue(kycData.business_description)}</div>
                <div><strong>Location:</strong> {renderValue(kycData.business_location)}</div>
                <div><strong>Location Status:</strong> {renderValue(kycData.business_location_status)}</div>
                <div><strong>Working Capital:</strong> {renderValue(kycData.working_capital)}</div>
                <div><strong>Stock Value:</strong> {renderValue(kycData.stock_value)}</div>
                <div><strong>GPS Address:</strong> {renderValue(kycData.business_gps_address)}</div>
                <div><strong>Years in Business:</strong> {renderValue(kycData.years_in_business)}</div>
                <div><strong>Landmark:</strong> {renderValue(kycData.business_landmark)}</div>
                <div><strong>Minimum Sale:</strong> {renderValue(kycData.minimum_sale)}</div>
                <div><strong>Maximum Sale:</strong> {renderValue(kycData.maximum_sale)}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3 border-warning">
              <Card.Header className="bg-light text-dark border-bottom">💰 Loan Application</Card.Header>
              <Card.Body>
                <div><strong>Loan Amount:</strong> {renderValue(kycData.loan_amount)}</div>
                <div><strong>Loan Purpose:</strong> {renderValue(kycData.loan_purpose)}</div>
                <div><strong>Loan Term:</strong> {renderValue(kycData.loan_term)}</div>
                <div><strong>Weekly Installment:</strong> {renderValue(kycData.weekly_installment)}</div>
                <div><strong>Repayment Amount:</strong> {renderValue(kycData.repayment_amount)}</div>
                <div><strong>Previous Loan Request:</strong> {renderValue(kycData.previous_loan_request)}</div>
                <div><strong>Previous Loan Approved:</strong> {renderValue(kycData.previous_loan_approved)}</div>
                <div><strong>Expected Due Date:</strong> {renderValue(kycData.expected_due_date)}</div>
                <div><strong>Actual Due Date:</strong> {renderValue(kycData.actual_due_date)}</div>
                <div><strong>Repayment Frequency:</strong> {renderValue(kycData.repayment_frequency)}</div>
                <div><strong>Existing Loan Balance:</strong> {renderValue(kycData.existing_loan_balance)}</div>
                <div><strong>Loan Need Reason:</strong> {renderValue(kycData.loan_need_reason)}</div>
                <div><strong>What if not approved?</strong> {renderValue(kycData.what_if_not_approved)}</div>
                <div><strong>Comfortable Repayment:</strong> {renderValue(kycData.comfortable_repayment)}</div>
                <div><strong>Existing Debt Repayment:</strong> {renderValue(kycData.existing_debt_repayment)}</div>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-danger">
              <Card.Header className="bg-light text-dark border-bottom">🔒 Security / Collateral</Card.Header>
              <Card.Body>
                <div><strong>Security Type:</strong> {renderValue(kycData.security_type)}</div>
                <div><strong>Description:</strong> {renderValue(kycData.security_description)}</div>
                <div><strong>Owner:</strong> {renderValue(kycData.security_owner)}</div>
                <div><strong>Purchase Date:</strong> {renderValue(kycData.security_purchase_date)}</div>
                <div><strong>Market Value:</strong> {renderValue(kycData.security_market_value)}</div>
                <div><strong>Forced Sale Value:</strong> {renderValue(kycData.security_forced_sale_value)}</div>
                <div><strong>Serial Number:</strong> {renderValue(kycData.security_serial)}</div>
                <div><strong>Registration:</strong> {renderValue(kycData.security_registration)}</div>
                <div><strong>Verification Status:</strong> {renderValue(kycData.security_verification_status)}</div>
                <div><strong>Encumbrances:</strong> {renderValue(kycData.security_encumbrances)}</div>
                {renderImage(kycData.collateral_photo_path, 'Collateral Photo')}
                {renderImage(kycData.ownership_document_path, 'Ownership Document')}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-3 border-dark">
              <Card.Header className="bg-light text-dark border-bottom">🤝 Guarantor</Card.Header>
              <Card.Body>
                <div><strong>Guarantor ID:</strong> {renderValue(kycData.guarantor_id)}</div>
                <div><strong>Employee Type:</strong> {renderValue(kycData.employee_type)}</div>
                <div><strong>Rank:</strong> {renderValue(kycData.guarantor_rank)}</div>
                <div><strong>Name of Employer:</strong> {renderValue(kycData.guarantor_name_of_employer)}</div>
                <div><strong>Work Location:</strong> {renderValue(kycData.guarantor_work_location)}</div>
                <div><strong>Years in Service:</strong> {renderValue(kycData.guarantor_years_in_service)}</div>
                <div><strong>Business Name:</strong> {renderValue(kycData.guarantor_business_name)}</div>
                <div><strong>Business Location:</strong> {renderValue(kycData.guarantor_business_location)}</div>
                <div><strong>Years in Business:</strong> {renderValue(kycData.guarantor_years_in_business)}</div>
                <div><strong>First Name:</strong> {renderValue(kycData.guarantor_first_name)}</div>
                <div><strong>Last Name:</strong> {renderValue(kycData.guarantor_last_name)}</div>
                <div><strong>Phone:</strong> {renderValue(kycData.guarantor_phone)}</div>
                <div><strong>Alt Phone:</strong> {renderValue(kycData.guarantor_alt_phone)}</div>
                <div><strong>ID Number:</strong> {renderValue(kycData.guarantor_id_number)}</div>
                <div><strong>Relationship:</strong> {renderValue(kycData.guarantor_relationship)}</div>
                <div><strong>Address:</strong> {renderValue(kycData.guarantor_address)}</div>
                <div><strong>Residence Location:</strong> {renderValue(kycData.guarantor_residence_location)}</div>
                <div><strong>Church Name:</strong> {renderValue(kycData.guarantor_church_name)}</div>
                <div><strong>Church Location:</strong> {renderValue(kycData.guarantor_church_location)}</div>
                {renderImage(kycData.guarantor_photo, 'Guarantor Photo')}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3 border-light">
              <Card.Header className="bg-light text-dark border-bottom">📊 Additional Details</Card.Header>
              <Card.Body>
                <div><strong>Previous Repayment Behaviour:</strong> {renderValue(kycData.prev_repayment_behaviour)}</div>
                <div><strong>Total Borrowed:</strong> {renderValue(kycData.total_borrowed)}</div>
                <div><strong>Total Arrears:</strong> {renderValue(kycData.total_arrears)}</div>
                <div><strong>Current Outstanding Balance:</strong> {renderValue(kycData.current_outstanding_balance)}</div>
                <div><strong>Avg Repayment Performance:</strong> {renderValue(kycData.avg_repayment_performance)}</div>
                <div><strong>Visit Business:</strong> {renderValue(kycData.visit_business)}</div>
                <div><strong>Business Operating:</strong> {renderValue(kycData.business_operating)}</div>
                <div><strong>Observed Sales Correspondence:</strong> {renderValue(kycData.observed_sales_correspondence)}</div>
                <div><strong>Daily Customer Volume:</strong> {renderValue(kycData.daily_customer_volume)}</div>
                <div><strong>Key Risk Observed:</strong> {renderValue(kycData.key_risk_observed)}</div>
                <div><strong>Known Client Since:</strong> {renderValue(kycData.known_client_since)}</div>
                <div><strong>Adverse Info:</strong> {renderValue(kycData.adverse_info)}</div>
                <div><strong>Repayment Concerns:</strong> {renderValue(kycData.repayment_concerns)}</div>
                <div><strong>Verified Monthly Income:</strong> {renderValue(kycData.verified_monthly_income)}</div>
                <div><strong>Reasonable Repayment:</strong> {renderValue(kycData.reasonable_repayment)}</div>
                <div><strong>Recommended Amount:</strong> {renderValue(kycData.recommended_amount)}</div>
                <div><strong>Recommended Term:</strong> {renderValue(kycData.recommended_term)}</div>
                <div><strong>Recommendation Reason:</strong> {renderValue(kycData.recommendation_reason)}</div>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-info">
              <Card.Header className="bg-light text-dark border-bottom">🔢 Counts & Statistics</Card.Header>
              <Card.Body>
                <Row>
                  {countDetails.map((item, idx) => (
                    <Col key={idx} xs={6} md={4} className="mb-2">
                      <Badge bg="light" text="dark" className="d-flex justify-content-between p-2">
                        <span>{item.label}:</span>
                        <strong>{item.value ?? 'N/A'}</strong>
                      </Badge>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* References, Documents, Loan History sections */}
        <Row>
          <Col md={12}>
            <Card className="mb-3 border-info">
              <Card.Header className="bg-light text-dark border-bottom">📋 References (Step 4)</Card.Header>
              <Card.Body>
                {renderSection('References', references, 'references', loading.references, error.references)}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-3 border-secondary">
              <Card.Header className="bg-light text-dark border-bottom">📄 Client Documents</Card.Header>
              <Card.Body>
                {renderSection('Client Documents', clientDocs, 'documents', loading.clientDocs, error.clientDocs)}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3 border-secondary">
              <Card.Header className="bg-light text-dark border-bottom">📄 Guarantor Documents</Card.Header>
              <Card.Body>
                {renderSection('Guarantor Documents', guarantorDocs, 'documents', loading.guarantorDocs, error.guarantorDocs)}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="mb-3 border-primary">
              <Card.Header className="bg-light text-dark border-bottom">🏦 Loan History</Card.Header>
              <Card.Body>
                {renderSection('Loan History', loanHistory, 'loanHistory', loading.loanHistory, error.loanHistory)}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary rounded-pill" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default KycFullDetailsModal;