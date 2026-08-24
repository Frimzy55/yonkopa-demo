// src/loans/KycFullDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Table, Button, ProgressBar, Row, Col, Spinner
} from 'react-bootstrap';
import axios from 'axios';

const KycFullDetailsModal = ({ show, onClose, kycData }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

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

    setLoading(prev => ({ ...prev, references: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/references`)
      .then(res => { setReferences(res.data); setError(prev => ({ ...prev, references: null })); })
      .catch(err => setError(prev => ({ ...prev, references: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, references: false })));

    setLoading(prev => ({ ...prev, clientDocs: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/documents`)
      .then(res => { setClientDocs(res.data); setError(prev => ({ ...prev, clientDocs: null })); })
      .catch(err => setError(prev => ({ ...prev, clientDocs: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, clientDocs: false })));

    setLoading(prev => ({ ...prev, guarantorDocs: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/guarantor-documents`)
      .then(res => { setGuarantorDocs(res.data); setError(prev => ({ ...prev, guarantorDocs: null })); })
      .catch(err => setError(prev => ({ ...prev, guarantorDocs: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, guarantorDocs: false })));

    setLoading(prev => ({ ...prev, loanHistory: true }));
    axios.get(`${apiUrl}/api/client/${clientId}/loan-history`)
      .then(res => { setLoanHistory(res.data); setError(prev => ({ ...prev, loanHistory: null })); })
      .catch(err => setError(prev => ({ ...prev, loanHistory: err.message })))
      .finally(() => setLoading(prev => ({ ...prev, loanHistory: false })));

    setStep(1);
  }, [show, kycData]);

  if (!kycData) return null;

  const getFullName = () => {
    if (kycData.full_name) return kycData.full_name;
    if (kycData.first_name || kycData.surname) {
      return `${kycData.first_name || ''} ${kycData.surname || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };

  // ---------- Date formatter ----------
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // ---------- Value renderer with date detection ----------
  const renderValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return formatDate(value);
    }
    return String(value);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_URL}/uploads/${path}`;
  };

  const TableRow = ({ label, value }) => (
    <tr>
      <td width="35%" className="fw-semibold">{label}</td>
      <td>{renderValue(value)}</td>
    </tr>
  );

  const getStepImages = () => {
    switch (step) {
      case 1:
        return [{ src: kycData.photo, label: 'Client Photo' }];
      case 2:
        return [];
      case 3:
        return [
          { src: kycData.collateral_photo_path, label: 'Collateral Photo' },
          { src: kycData.ownership_document_path, label: 'Ownership Document' },
          { src: kycData.guarantor_photo, label: 'Guarantor Photo' },
        ];
      default:
        return [];
    }
  };

  const images = getStepImages().filter(img => img.src);

  // ---------- Step content definitions (same as before) ----------
  const stepContent = {
    1: {
      title: 'Personal Information',
      sections: [
        {
          heading: '👤 Personal Details',
          rows: [
            ['Full Name', getFullName()],
            ['Popular Name', kycData.popular_name],
            ['First Name', kycData.first_name],
            ['Surname', kycData.surname],
            ['Date of Birth', kycData.date_of_birth],
            ['Phone', kycData.phone],
            ['Alt Phone', kycData.alt_phone],
            ['Marital Status', kycData.marital_status],
            ['Hometown', kycData.hometown],
            ['Place of Birth', kycData.place_of_birth],
            ['Ghana Card Number', kycData.ghana_card_number],
            ['Date Issued', kycData.date_issued],
            ['Expiry Date', kycData.expiry_date],
            ['Religion', kycData.religion],
            ['Church', kycData.church_name],
            ['Church Location', kycData.church_location],
            ['Pastor Name', kycData.pastor_name],
            ['Pastor Contact', kycData.pastor_contact],
          ]
        },
        {
          heading: '👨‍👩‍👧‍👦 Family & Dependents',
          rows: [
            ['Father Name', kycData.father_name],
            ['Father Contact', kycData.father_contact],
            ['Mother Name', kycData.mother_name],
            ['Mother Contact', kycData.mother_contact],
            ['Spouse Name', kycData.spouse_name],
            ['Spouse Contact', kycData.spouse_contact],
            ['Spouse Occupation', kycData.spouse_occupation],
            ['Number of Dependents', kycData.number_of_dependents],
            ['Household Members', kycData.household_members],
            ['Dependents Schooling', kycData.dependents_schooling],
          ]
        },
        {
          heading: '🏠 Residential Details',
          rows: [
            ['Residential Location', kycData.residential_location],
            ['District', kycData.district],
            ['Ownership', kycData.residential_ownership],
            ['Nearest Landmark', kycData.nearest_landmark],
            ['GPS Address', kycData.gps_address],
            ['Years at Address', kycData.years_at_address],
            ['Rent Advance', kycData.rent_advance],
          ]
        }
      ]
    },
    2: {
      title: 'Business & Loan',
      sections: [
        {
          heading: '🏢 Business Information',
          rows: [
            ['Business Name', kycData.business_name],
            ['Sector', kycData.business_sector],
            ['Types of Business', kycData.types_of_business],
            ['Description', kycData.business_description],
            ['Location', kycData.business_location],
            ['Location Status', kycData.business_location_status],
            ['Working Capital', kycData.working_capital],
            ['Stock Value', kycData.stock_value],
            ['GPS Address', kycData.business_gps_address],
            ['Years in Business', kycData.years_in_business],
            ['Landmark', kycData.business_landmark],
            ['Minimum Sale', kycData.minimum_sale],
            ['Maximum Sale', kycData.maximum_sale],
          ]
        },
        {
          heading: '💰 Loan Application',
          rows: [
            ['Loan Amount', kycData.loan_amount],
            ['Loan Purpose', kycData.loan_purpose],
            ['Loan Term', kycData.loan_term],
            ['Weekly Installment', kycData.weekly_installment],
            ['Repayment Amount', kycData.repayment_amount],
            ['Previous Loan Request', kycData.previous_loan_request],
            ['Previous Loan Approved', kycData.previous_loan_approved],
            ['Expected Due Date', kycData.expected_due_date],
            ['Actual Due Date', kycData.actual_due_date],
            ['Repayment Frequency', kycData.repayment_frequency],
            ['Existing Loan Balance', kycData.existing_loan_balance],
            ['Loan Need Reason', kycData.loan_need_reason],
            ['What if not approved?', kycData.what_if_not_approved],
            ['Comfortable Repayment', kycData.comfortable_repayment],
            ['Existing Debt Repayment', kycData.existing_debt_repayment],
          ]
        }
      ]
    },
    3: {
      title: 'Collateral & Guarantor',
      sections: [
        {
          heading: '🔒 Security / Collateral',
          rows: [
            ['Security Type', kycData.security_type],
            ['Description', kycData.security_description],
            ['Owner', kycData.security_owner],
            ['Purchase Date', kycData.security_purchase_date],
            ['Market Value', kycData.security_market_value],
            ['Forced Sale Value', kycData.security_forced_sale_value],
            ['Serial Number', kycData.security_serial],
            ['Registration', kycData.security_registration],
            ['Verification Status', kycData.security_verification_status],
            ['Encumbrances', kycData.security_encumbrances],
          ]
        },
        {
          heading: '🤝 Guarantor',
          rows: [
            ['Guarantor ID', kycData.guarantor_id],
            ['Employee Type', kycData.employee_type],
            ['Rank', kycData.guarantor_rank],
            ['Name of Employer', kycData.guarantor_name_of_employer],
            ['Work Location', kycData.guarantor_work_location],
            ['Years in Service', kycData.guarantor_years_in_service],
            ['Business Name', kycData.guarantor_business_name],
            ['Business Location', kycData.guarantor_business_location],
            ['Years in Business', kycData.guarantor_years_in_business],
            ['First Name', kycData.guarantor_first_name],
            ['Last Name', kycData.guarantor_last_name],
            ['Phone', kycData.guarantor_phone],
            ['Alt Phone', kycData.guarantor_alt_phone],
            ['ID Number', kycData.guarantor_id_number],
            ['Relationship', kycData.guarantor_relationship],
            ['Address', kycData.guarantor_address],
            ['Residence Location', kycData.guarantor_residence_location],
            ['Church Name', kycData.guarantor_church_name],
            ['Church Location', kycData.guarantor_church_location],
          ]
        }
      ]
    },
    4: {
      title: 'Additional & Stats',
      sections: [
        {
          heading: '📊 Additional Details',
          rows: [
            ['Previous Repayment Behaviour', kycData.prev_repayment_behaviour],
            ['Total Borrowed', kycData.total_borrowed],
            ['Total Arrears', kycData.total_arrears],
            ['Current Outstanding Balance', kycData.current_outstanding_balance],
            ['Avg Repayment Performance', kycData.avg_repayment_performance],
            ['Visit Business', kycData.visit_business],
            ['Business Operating', kycData.business_operating],
            ['Observed Sales Correspondence', kycData.observed_sales_correspondence],
            ['Daily Customer Volume', kycData.daily_customer_volume],
            ['Key Risk Observed', kycData.key_risk_observed],
            ['Known Client Since', kycData.known_client_since],
            ['Adverse Info', kycData.adverse_info],
            ['Repayment Concerns', kycData.repayment_concerns],
            ['Verified Monthly Income', kycData.verified_monthly_income],
            ['Reasonable Repayment', kycData.reasonable_repayment],
            ['Recommended Amount', kycData.recommended_amount],
            ['Recommended Term', kycData.recommended_term],
            ['Recommendation Reason', kycData.recommendation_reason],
          ]
        },
        {
          heading: '🔢 Counts & Statistics',
          rows: [
            ['References', kycData.reference_count],
            ['Client Documents', kycData.client_document_count],
            ['Guarantor Documents', kycData.guarantor_document_count],
            ['Loan History Count', kycData.loan_history_count],
            ['Loan Cycle Completed', kycData.loan_cycle_completed],
            ['Max Past Due Days', kycData.max_past_due_days],
            ['Missed Instalments', kycData.missed_instalments],
            ['Write-off Loans', kycData.write_off_loans],
            ['Extensions', kycData.extensions],
            ['Number of Pay-offs', kycData.number_of_pay_off],
          ]
        }
      ]
    },
    5: {
      title: 'References',
      sections: [
        {
          heading: '📋 References',
          isArray: true,
          data: references,
          type: 'references',
          loading: loading.references,
          error: error.references,
        }
      ]
    },
    6: {
      title: 'Documents & Loan History',
      sections: [
        {
          heading: '📄 Client Documents',
          isArray: true,
          data: clientDocs,
          type: 'documents',
          loading: loading.clientDocs,
          error: error.clientDocs,
        },
        {
          heading: '📄 Guarantor Documents',
          isArray: true,
          data: guarantorDocs,
          type: 'documents',
          loading: loading.guarantorDocs,
          error: error.guarantorDocs,
        },
        {
          heading: '🏦 Loan History',
          isArray: true,
          data: loanHistory,
          type: 'loanHistory',
          loading: loading.loanHistory,
          error: error.loanHistory,
        }
      ]
    }
  };

  const renderSection = (section, idx) => {
    if (section.isArray) {
      if (section.loading) {
        return (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <span className="ms-2">Loading {section.heading}...</span>
          </div>
        );
      }
      if (section.error) {
        return <p className="text-danger">Error loading {section.heading}: {section.error}</p>;
      }
      const items = section.data || [];
      if (!items.length) {
        return <p className="text-muted">No {section.heading.toLowerCase()} found.</p>;
      }

      if (section.type === 'references') {
        return (
          <Table striped bordered hover size="sm" className="mt-2">
            <thead>
              <tr><th>Name</th><th>Relationship</th><th>Location</th><th>Contact</th></tr>
            </thead>
            <tbody>
              {items.map((ref, i) => (
                <tr key={i}>
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

      if (section.type === 'documents') {
        return items.map((doc, i) => (
          <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
              <strong>{renderValue(doc.display_name)}</strong>
              <span className="text-muted ms-2 small">({renderValue(doc.original_filename)})</span>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => window.open(getImageUrl(doc.file_path), '_blank')}
            >
              View
            </Button>
          </div>
        ));
      }

      if (section.type === 'loanHistory') {
        return (
          <Table striped bordered hover size="sm" className="mt-2">
            <thead>
              <tr><th>Institution</th><th>Principal</th><th>Installment</th><th>Balance</th><th>Arrears</th><th>Expiry</th></tr>
            </thead>
            <tbody>
              {items.map((loan, i) => (
                <tr key={i}>
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
    }

    return (
      <Table bordered responsive className="mb-0">
        <tbody>
          {section.rows.map(([label, value], i) => (
            <TableRow key={i} label={label} value={value} />
          ))}
        </tbody>
      </Table>
    );
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <Modal show={show} onHide={onClose} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Full KYC Details – {getFullName()}</Modal.Title>
      </Modal.Header>

      <ProgressBar
        now={(step / totalSteps) * 100}
        label={`Step ${step} of ${totalSteps} – ${stepContent[step]?.title || ''}`}
        className="mb-3"
        style={{ height: '30px' }}
      />

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {images.length > 0 && (
          <div className="mb-4 p-3 border rounded bg-light">
            <h6 className="mb-3">📄 Document Previews</h6>
            <Row>
              {images.map((img, idx) => (
                <Col key={idx} xs={6} md={4} lg={3} className="mb-3">
                  <div className="text-center">
                    <img
                      src={getImageUrl(img.src)}
                      alt={img.label}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onClick={() => window.open(getImageUrl(img.src), '_blank')}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x120?text=No+Image';
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    />
                    <small className="text-muted d-block mt-1">{img.label}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <h5 className="mb-3">{stepContent[step]?.title}</h5>
        {stepContent[step]?.sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            <h6 className="mb-2">{section.heading}</h6>
            {renderSection(section, idx)}
          </div>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <div className="d-flex justify-content-between w-100">
          <div>
            {step > 1 && (
              <Button variant="secondary" onClick={prevStep} className="me-2">
                ← Previous
              </Button>
            )}
            {step < totalSteps && (
              <Button variant="primary" onClick={nextStep}>
                Next →
              </Button>
            )}
          </div>
          <Button variant="dark" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default KycFullDetailsModal;