import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CreateTill = () => {
  const navigate = useNavigate();

  // --- Form state (removed tillName, openingBalance, maxBalance) ---
  const [formData, setFormData] = useState({
    branch: '',
    currency: 'GHS',
    tillType: '',
    cashLimitPerTransaction: '',
    dailyCashLimit: '',
    overLimitAction: 'block',
    assignedTeller: '',
    supervisor: '',
    effectiveDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdTillNumber, setCreatedTillNumber] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [tellers, setTellers] = useState([]);
const [loadingTellers, setLoadingTellers] = useState(false);

  // --- Mock dropdown data (replace with API later) ---
  const branches = ['HEAD OFFICE'];
  const currencies = ['GHS', 'USD', 'EUR', 'GBP', 'NGN'];
  const tillTypes = ['Cash Till', 'Cheque Till', 'Hybrid Till', 'Mobile Till'];
  //const tellers = ['John Mensah', 'Ama Serwaa', 'Kwame Osei', 'Esi Addo'];
  const supervisors = ['Manager', 'Senior Teller', 'Supervisor A', 'Supervisor B'];
  const overLimitActions = [
    { value: 'block', label: 'Block Transaction' },
    { value: 'approval', label: 'Require Supervisor Approval' },
    { value: 'alert', label: 'Alert Only' },
  ];

  // --- Set default effective date ---
  
  useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    effectiveDate: new Date().toISOString().split('T')[0],
  }));

  fetchTellers();

}, []);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // --- Validation (removed tillName, openingBalance, maxBalance) ---
  const validate = () => {
    const newErrors = {};
    if (!formData.branch) newErrors.branch = 'Please select a Branch';
    if (!formData.currency) newErrors.currency = 'Please select a Currency';
    if (!formData.tillType) newErrors.tillType = 'Please select a Till Type';
    if (!formData.assignedTeller) newErrors.assignedTeller = 'Please select an Assigned Teller';
    if (!formData.supervisor) newErrors.supervisor = 'Please select a Supervisor';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective Date is required';

    // Validate numeric fields (only cashLimitPerTransaction and dailyCashLimit)
    ['cashLimitPerTransaction', 'dailyCashLimit'].forEach((field) => {
      if (formData[field] && isNaN(formData[field])) {
        newErrors[field] = 'Must be a number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);
    setCreatedTillNumber('');
    setIsNavigating(false);

    if (!validate()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('You are not logged in. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        cashLimitPerTransaction: parseFloat(formData.cashLimitPerTransaction) || 0,
        dailyCashLimit: parseFloat(formData.dailyCashLimit) || 0,
      };

      const apiBaseUrl = process.env.REACT_APP_API_URL || '';
      const url = `${apiBaseUrl}/api/tills`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      console.log('📡 Raw response:', rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(`Server returned invalid JSON: ${rawText.substring(0, 100)}`);
      }

      if (!response.ok) {
        if (data.errors) {
          const backendErrors = data.errors.reduce((acc, err) => {
            acc[err.param] = err.msg;
            return acc;
          }, {});
          setErrors(backendErrors);
          throw new Error('Validation failed');
        }
        throw new Error(data.error || 'Failed to create till');
      }

      console.log('✅ Till created:', data);
      setCreatedTillNumber(data.till.till_number);
      setSuccess(true);

      // --- Reset form (without removed fields) ---
      setFormData({
        branch: '',
        currency: 'GHS',
        tillType: '',
        cashLimitPerTransaction: '',
        dailyCashLimit: '',
        overLimitAction: 'block',
        assignedTeller: '',
        supervisor: '',
        effectiveDate: new Date().toISOString().split('T')[0],
      });

      setIsNavigating(false);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while creating the till.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);






  const fetchTellers = async () => {
  setLoadingTellers(true);

  try {
    const token = localStorage.getItem("token");

    const apiBaseUrl = process.env.REACT_APP_API_URL || "";

    const response = await fetch(
      `${apiBaseUrl}/api/tills/tellers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load tellers");
    }

    const data = await response.json();

    setTellers(data);

  } catch (error) {
    console.error("Error loading tellers:", error);
  } finally {
    setLoadingTellers(false);
  }
};

  // --- Render ---
  return (
    <div className="container-fluid py-4">
      <Card className="shadow-lg border-0">
        {/* --- Header with light blue background --- */}
        <Card.Header className="bg-light-blue d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-plus-circle fs-2 me-3 text-primary"></i>
            <div>
              <h4 className="mb-0 fw-bold text-dark">Create New Till</h4>
              <small className="text-muted">Fill in the details below to set up a new till</small>
            </div>
          </div>
          <Badge bg="light" text="dark" className="px-3 py-2">
            <i className="bi bi-clock me-1"></i> {new Date().toLocaleDateString()}
          </Badge>
        </Card.Header>

        <Card.Body className="p-4">
          {submitError && (
            <Alert variant="danger" onClose={() => setSubmitError('')} dismissible className="mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {submitError}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(false)} dismissible className="mb-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              Till <strong>#{createdTillNumber}</strong> created successfully!
              {isNavigating && ' Redirecting…'}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            {/* ----- SECTION 1: TILL DETAILS (removed tillName, openingBalance, maxBalance) ----- */}
            <div className="section-title d-flex align-items-center mb-3">
              <i className="bi bi-layout-three-columns me-2 fs-5 text-primary"></i>
              <h6 className="fw-bold mb-0 text-uppercase text-muted">Till Details</h6>
              <hr className="flex-grow-1 ms-3" />
            </div>

            <Row className="g-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="branch">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-building me-1"></i> Branch <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    isInvalid={!!errors.branch}
                    disabled={isSubmitting || success}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.branch}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="currency">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-currency-exchange me-1"></i> Currency <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    isInvalid={!!errors.currency}
                    disabled={isSubmitting || success}
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.currency}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="tillType">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-box-seam me-1"></i> Till Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="tillType"
                    value={formData.tillType}
                    onChange={handleChange}
                    isInvalid={!!errors.tillType}
                    disabled={isSubmitting || success}
                  >
                    <option value="">Select Type</option>
                    {tillTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.tillType}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ----- SECTION 2: CASH LIMIT HANDLING (kept) ----- */}
            <div className="section-title d-flex align-items-center mt-4 mb-3">
              <i className="bi bi-exclamation-triangle me-2 fs-5 text-warning"></i>
              <h6 className="fw-bold mb-0 text-uppercase text-muted">Cash Limit Handling</h6>
              <hr className="flex-grow-1 ms-3" />
            </div>

            <Row className="g-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="cashLimitPerTransaction">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-arrow-left-right me-1"></i> Limit per Transaction
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="cashLimitPerTransaction"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.cashLimitPerTransaction}
                    onChange={handleChange}
                    isInvalid={!!errors.cashLimitPerTransaction}
                    disabled={isSubmitting || success}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cashLimitPerTransaction}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">Max amount allowed for a single cash operation.</Form.Text>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="dailyCashLimit">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar-day me-1"></i> Daily Cash Limit
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="dailyCashLimit"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.dailyCashLimit}
                    onChange={handleChange}
                    isInvalid={!!errors.dailyCashLimit}
                    disabled={isSubmitting || success}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.dailyCashLimit}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">Maximum cumulative cash for the till per day.</Form.Text>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="overLimitAction">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-shield-exclamation me-1"></i> Over‑Limit Action
                  </Form.Label>
                  <Form.Select
                    name="overLimitAction"
                    value={formData.overLimitAction}
                    onChange={handleChange}
                    disabled={isSubmitting || success}
                  >
                    {overLimitActions.map((action) => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    What to do when a transaction exceeds the limits.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* ----- SECTION 3: TELLER ASSIGNMENT (unchanged) ----- */}
            <div className="section-title d-flex align-items-center mt-4 mb-3">
              <i className="bi bi-people me-2 fs-5 text-success"></i>
              <h6 className="fw-bold mb-0 text-uppercase text-muted">Teller Assignment</h6>
              <hr className="flex-grow-1 ms-3" />
            </div>

            <Row className="g-3">
              <Col md={6} lg={4}>
                <Form.Group controlId="assignedTeller">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person me-1"></i> Assigned Teller <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="assignedTeller"
                    value={formData.assignedTeller}
                    onChange={handleChange}
                    isInvalid={!!errors.assignedTeller}
                    disabled={isSubmitting || success}
                  >
                    <option value="">Select Teller</option>
                    {loadingTellers ? (
  <option>Loading tellers...</option>
) : tellers.length === 0 ? (
  <option>No active tellers found</option>
) : (
  tellers.map((teller) => (
    <option 
      key={teller.full_name} 
      value={teller.full_name}
    >
      {teller.full_name}
    </option>
  ))
)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.assignedTeller}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="supervisor">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person-badge me-1"></i> Supervisor <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                    isInvalid={!!errors.supervisor}
                    disabled={isSubmitting || success}
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.supervisor}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} lg={4}>
                <Form.Group controlId="effectiveDate">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-calendar-event me-1"></i> Effective Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleChange}
                    isInvalid={!!errors.effectiveDate}
                    disabled={isSubmitting || success}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.effectiveDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* ----- ACTION BUTTONS (unchanged) ----- */}
            <div className="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4"
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || success}
                className="px-5"
                style={{ minWidth: '150px' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating…
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"></i> Create Till
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="bg-light text-muted small py-2 text-center border-0">
          <i className="bi bi-info-circle me-1"></i> Fields marked with <span className="text-danger">*</span> are required.
        </Card.Footer>
      </Card>

      <style jsx>{`
        .bg-light-blue {
          background: #e3f2fd !important;
        }
        .section-title hr {
          border: 0;
          border-top: 2px dashed #dee2e6;
          opacity: 0.5;
        }
        .section-title i {
          font-size: 1.25rem;
        }
        .card {
          border-radius: 12px;
        }
        .card-header {
          border-radius: 12px 12px 0 0 !important;
        }
        .card-footer {
          border-radius: 0 0 12px 12px !important;
        }
        @media (max-width: 576px) {
          .container-fluid {
            padding-left: 10px;
            padding-right: 10px;
          }
          .card-body {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateTill;