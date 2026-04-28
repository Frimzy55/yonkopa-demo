import React from "react";
import { Modal, Button, Row, Col, Tab, Nav, Card, Table } from "react-bootstrap";
import { 
  FaFileInvoice, 
  FaUser, 
  FaBriefcase, 
  FaChartLine, 
  FaEnvelope, 
  FaUsers, 
  FaShieldAlt, 
  FaBuilding, 
  FaMobileAlt, 
  FaCommentDots 
} from "react-icons/fa";

const LoanDetailsModal = ({ show, handleClose, loan }) => {
  if (!loan) return null;

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return null;
    return `₵${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };


  // Helper function to check if a value is empty/N/A
  const isEmpty = (value) => {
    return value === null || value === undefined || value === "" || value === "N/A";
  };

  // Helper function to conditionally render a field
  const renderField = (label, value, formatter = null) => {
    const displayValue = formatter ? formatter(value) : value;
    if (isEmpty(displayValue)) return null;
    return (
      <p>
        <strong>{label}:</strong> {displayValue}
      </p>
    );
  };

  // Get employment status (case insensitive comparison)
  const employmentStatus = (loan.applicant_employmentStatus || loan.employmentStatus || "").toLowerCase();
  const isSalariedWorker = employmentStatus === "salaried" || employmentStatus === "salary-worker" || employmentStatus === "employed";
  const isSelfEmployed = employmentStatus === "self employed" || employmentStatus === "self-employed" || employmentStatus === "business";

  return (
    <Modal show={show} onHide={handleClose} size="xl" scrollable dialogClassName="modal-xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <h4>Loan Application Details - {loan.loan_id}</h4>
          <small className="text-muted">Status: {loan.evaluation_status || "Pending"}</small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tab.Container defaultActiveKey="loan-info">
          <Row>
            <Col md={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="loan-info">
                    <FaFileInvoice className="me-2" /> Loan Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="applicant-info">
                    <FaUser className="me-2" /> Applicant Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="employment-info">
                    <FaBriefcase className="me-2" /> Employment Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="financial-assessment">
                    <FaChartLine className="me-2" /> Financial Assessment
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="evaluation">
                    <FaEnvelope className="me-2" /> Contact Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="references">
                    <FaUsers className="me-2" /> References
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="guarantor">
                    <FaShieldAlt className="me-2" /> Guarantor Information
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="collateral">
                    <FaBuilding className="me-2" /> Collateral Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="momo">
                    <FaMobileAlt className="me-2" /> Mobile Money
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="documents">
                    <FaCommentDots className="me-2" /> Comments
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={9}>
              <Tab.Content>
                {/* Loan Information Tab */}
                <Tab.Pane eventKey="loan-info">
                  <Card>
                    <Card.Header as="h5">Loan Information</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          {renderField("Loan ID", loan.loan_id)}
                          {renderField("Customer Code", loan.kyc_code)}
                          {renderField("Loan Amount", loan.kyc_loan_amount, formatCurrency)}
                          {renderField("Loan Purpose", loan.kyc_loan_purpose)}
                          {renderField("Loan Term", loan.loanTerm, (v) => `${v} months`)}
                          {renderField("Repayment Frequency", loan.repaymentFrequency)}
                          {renderField("Interest Rate", loan.ratePerAnnum, (v) => `${v}% per annum`)}
                        </Col>
                        <Col md={6}>
                          {renderField("Interest Amount", loan.kyc_interest, formatCurrency)}
                          {renderField("Total Interest", loan.totalInterest, formatCurrency)}
                          {renderField("Number of Payments", loan.numberOfPayments)}
                          {renderField("Monthly Payment", loan.monthlyPayment, formatCurrency)}
                          {renderField("Loan Fees", loan.loanFees, formatCurrency)}
                          {renderField("Created At", loan.loan_created_at, formatDate)}
                          {renderField("Loan Status", loan.momo_loan_status)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Applicant Information Tab */}
                <Tab.Pane eventKey="applicant-info">
                  <Card>
                    <Card.Header as="h5">Personal Information</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          {renderField("Title", loan.title)}
                          {renderField("First Name", loan.firstname)}
                          {renderField("Middle Name", loan.middlename)}
                          {renderField("Last Name", loan.lastname)}
                          {renderField("Full Name", loan.applicant_fullName)}
                        {renderField(
                  "Date of Birth",
                     loan.applicant_dob || loan.dateofbirth,
                    formatDate
                         )}
                          {renderField("Gender", loan.applicant_gender || loan.personal_gender)}
                          {renderField("Marital Status", loan.applicant_maritalStatus || loan.personal_maritalstatus)}
                          {renderField("National ID", loan.applicant_nationalid || loan.personal_nationalid)}
                        </Col>
                        <Col md={6}>
                          {renderField("Dependents", loan.dependents)}
                          {renderField("Spouse Name", loan.spousename)}
                          {renderField("Spouse Contact", loan.spousecontact)}
                          {renderField("Phone", loan.applicant_phone || loan.mobileNumber)}
                          {renderField("Email", loan.applicant_email || loan.contact_email)}
                          {renderField("Residential Address", loan.applicant_residentialAddress || loan.contact_residentialAddress)}
                          {renderField("Residential GPS", loan.residentialGPS)}
                          {renderField("Residential Location", loan.residentiallocation)}
                          {renderField("Landmark", loan.residentialLandmark)}
                          {renderField("City", loan.city)}
                          {renderField("State", loan.state)}
                          {renderField("Alternate Phone", loan.alternatePhone)}
                          {renderField("Avatar", loan.avatar ? "Yes" : null)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Employment Details Tab - Conditional rendering based on employment status */}
                <Tab.Pane eventKey="employment-info">
                  <Card>
                    <Card.Header as="h5">
                      Employment Information
                      {(isSalariedWorker || isSelfEmployed) && (
                        <span className="ms-2 badge bg-info">
                          {isSalariedWorker ? "Salaried Worker" : isSelfEmployed ? "Self Employed" : null}
                        </span>
                      )}
                    </Card.Header>
                    <Card.Body>
                      {renderField("Employment Status", loan.applicant_employmentStatus || loan.employmentStatus)}
                      
                      {/* Salaried Worker Section */}
                      {isSalariedWorker && (
                        <>
                          <hr />
                          <h6 className="text-primary">🏢 Employment Details</h6>
                          <Row>
                            <Col md={6}>
                              {renderField("Employer Name", loan.employerName)}
                              {renderField("Job Title", loan.jobTitle)}
                              {renderField("Monthly Income", loan.monthlyIncome, formatCurrency)}
                              {renderField("Years in Current Employment", loan.yearsInCurrentEmployment)}
                            </Col>
                            <Col md={6}>
                              {renderField("Work Location", loan.workPlaceLocation)}
                              {renderField("Employment ID", loan.employmentId)}
                              {renderField("Created At", loan.employment_created_at, formatDate)}
                              {renderField("Updated At", loan.employment_updated_at, formatDate)}
                            </Col>
                          </Row>
                          
                          <h6 className="text-primary mt-3">📄 Salaried Worker Documents</h6>
                          <Row>
                            <Col md={6}>
                              {loan.payslip && <p><strong>Payslip:</strong> 📄 Uploaded</p>}
                            </Col>
                            <Col md={6}>
                              {loan.ghanaCardFront && <p><strong>Ghana Card Front:</strong> 📄 Uploaded</p>}
                              {loan.ghanaCardBack && <p><strong>Ghana Card Back:</strong> 📄 Uploaded</p>}
                            </Col>
                          </Row>
                        </>
                      )}
                      
                      {/* Self Employed Section */}
                      {isSelfEmployed && (
                        <>
                          <hr />
                          <h6 className="text-success">🏪 Business Details</h6>
                          <Row>
                            <Col md={6}>
                              {renderField("Business Name", loan.businessName)}
                              {renderField("Business Type", loan.businessType)}
                              {renderField("Monthly Business Income", loan.monthlyBusinessIncome, formatCurrency)}
                              {renderField("Business Location", loan.businessLocation || loan.business_location)}
                              {renderField("Business GPS Address", loan.businessGpsAddress)}
                            </Col>
                            <Col md={6}>
                              {renderField("Number of Workers", loan.numberOfWorkers)}
                              {renderField("Years in Business", loan.yearsInBusiness)}
                              {renderField("Working Capital", loan.workingCapital, formatCurrency)}
                              {renderField("Created At", loan.employment_created_at, formatDate)}
                              {renderField("Updated At", loan.employment_updated_at, formatDate)}
                            </Col>
                          </Row>
                          
                          {loan.businessPicture && (
                            <h6 className="text-success mt-3">📷 Business Documents</h6>
                          )}
                          <Row>
                            <Col md={6}>
                              {loan.businessPicture && <p><strong>Business Picture:</strong> 📷 Uploaded</p>}
                            </Col>
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Financial Assessment Tab */}
                <Tab.Pane eventKey="financial-assessment">
                  <Card>
                    <Card.Header as="h5">Financial Assessment</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h6>Loan Assessment Details</h6>
                          {renderField("Principal", loan.principal, formatCurrency)}
                          {renderField("Assessment Rate", loan.assessment_rate, (v) => `${v}%`)}
                          {renderField("Assessment Loan Term", loan.assessment_loan_term, (v) => `${v} months`)}
                          {renderField("Assessment Interest", loan.assessment_interest, formatCurrency)}
                          {renderField("Assessment Loan Amount", loan.assessment_loan_amount, formatCurrency)}
                          {renderField("Monthly Installment", loan.monthly_installment, formatCurrency)}
                        </Col>
                        <Col md={6}>
                          <h6>Business Financials</h6>
                          {renderField("Monthly Sales Revenue", loan.monthly_sales_revenue, formatCurrency)}
                          {renderField("Cost of Goods Sold", loan.cost_of_goods_sold, formatCurrency)}
                          {renderField("Gross Profit", loan.gross_profit, formatCurrency)}
                          {renderField("Gross Margin", loan.gross_margin_percentage, (v) => `${v}%`)}
                          {renderField("Total Operating Expenses", loan.total_operating_expenses, formatCurrency)}
                          {renderField("Net Business Profit", loan.net_business_profit, formatCurrency)}
                        </Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col md={6}>
                          <h6>Household Finances</h6>
                          {renderField("Household Expenses", loan.household_expenses, formatCurrency)}
                          {renderField("Other Income", loan.other_income, formatCurrency)}
                          {renderField("Household Surplus", loan.household_surplus, formatCurrency)}
                        </Col>
                        <Col md={6}>
                          <h6>Loan Capacity</h6>
                          {renderField("Loan Recommendation", loan.loan_recommendation, formatCurrency)}
                          {renderField("Pay Capacity", loan.pay_capacity, formatCurrency)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Contact Information Tab */}
                <Tab.Pane eventKey="evaluation">
                  <Card>
                    <Card.Header as="h5">Contact Information</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          {renderField("Mobile Number", loan.mobileNumber)}
                          {renderField("Email", loan.contact_email)}
                          {renderField("Alternate Phone", loan.alternatePhone)}
                          {renderField("City", loan.city)}
                          {renderField("State", loan.state)}
                        </Col>
                        <Col md={6}>
                          {renderField("Residential Address", loan.contact_residentialAddress)}
                          {renderField("Residential Landmark", loan.residentialLandmark)}
                          {renderField("GPS Address", loan.residentialGPS)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* References Tab */}
                <Tab.Pane eventKey="references">
                  <Card>
                    <Card.Header as="h5">References</Card.Header>
                    <Card.Body>
                      <Row>
                        {(loan.referenceName1 || loan.referencePhone1 || loan.referenceRelationship1) && (
                          <Col md={6}>
                            <h6>Reference 1</h6>
                            {renderField("Name", loan.referenceName1)}
                            {renderField("Phone", loan.referencePhone1)}
                            {renderField("Relationship", loan.referenceRelationship1)}
                          </Col>
                        )}
                        {(loan.referenceName2 || loan.referencePhone2 || loan.referenceRelationship2) && (
                          <Col md={6}>
                            <h6>Reference 2</h6>
                            {renderField("Name", loan.referenceName2)}
                            {renderField("Phone", loan.referencePhone2)}
                            {renderField("Relationship", loan.referenceRelationship2)}
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Guarantor Tab */}
                <Tab.Pane eventKey="guarantor">
                  <Card>
                    <Card.Header as="h5">Guarantor Information</Card.Header>
                    <Card.Body>
                      <Row className="mb-3">
                        <Col md={6}>
                          {renderField("Name", loan.guarantorName)}
                          {renderField("Phone", loan.guarantorPhone)}
                          {renderField("Address", loan.guarantorAddress)}
                          {renderField("Residence Location", loan.guarantorResidenceLocation)}
                          {renderField("ID Number", loan.guarantorIdNumber)}
                          {renderField("Employee Type", loan.guarantorEmployeeType)}
                        </Col>
                      </Row>

                      {/* ================= SALARY WORKER ================= */}
                      {loan.guarantorEmployeeType === "salary worker" && (
                        <Row>
                          <Col md={6}>
                            {renderField("Rank", loan.guarantorRank)}
                            {renderField("Work Location", loan.guarantorWorkLocation)}
                            {renderField("Employer", loan.guarantorNameOfEmployer)}
                            {renderField("Years in Service", loan.guarantorYearsInService)}
                          </Col>
                          <Col md={6}>
                            {loan.guarantorPayslip && <p><strong>Payslip:</strong> 📄 Uploaded</p>}
                            {loan.guarantorGhanaCardFront && <p><strong>Ghana Card Front:</strong> 📄 Uploaded</p>}
                            {loan.guarantorGhanaCardBack && <p><strong>Ghana Card Back:</strong> 📄 Uploaded</p>}
                          </Col>
                        </Row>
                      )}

                      {/* ================= SELF EMPLOYED ================= */}
                      {loan.guarantorEmployeeType === "self employed" && (
                        <Row>
                          <Col md={6}>
                            {renderField("Business Name", loan.guarantorBusinessName)}
                            {renderField("Business Location", loan.guarantorBusinessLocation)}
                            {renderField("Years in Business", loan.guarantorYearsInBusiness)}
                          </Col>
                          <Col md={6}>
                            {loan.guarantorProfilePicture && <p><strong>Profile Picture:</strong> 📷 Uploaded</p>}
                            {loan.guarantorBusinessPicture && <p><strong>Business Picture:</strong> 📷 Uploaded</p>}
                          </Col>
                        </Row>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Collateral Tab */}
                <Tab.Pane eventKey="collateral">
                  <Card>
                    <Card.Header as="h5">Collateral Information</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                         
                          {renderField("Lending Type", loan.lending_type)}
                          {renderField("Collateral Type", loan.collateral_type)}
                        </Col>
                        
                      </Row>

                      {loan.collateral_data && (
                        <>
                          <hr />
                          <h6 className="mb-3">Collateral Details</h6>
                          <Card className="bg-light border-0">
                            <Card.Body>
                              <Table bordered size="sm" responsive className="mb-0">
                                <tbody>
                                  {(() => {
                                    const data = typeof loan.collateral_data === "string"
                                      ? JSON.parse(loan.collateral_data)
                                      : loan.collateral_data;
                                    
                                    return Object.entries(data).map(([key, value]) => {
                                      if (isEmpty(value)) return null;
                                      return (
                                        <tr key={key}>
                                          <td style={{ width: "40%" }}>
                                            <strong>{key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                                           </td>
                                           <td>
                                            {typeof value === "object"
                                              ? Array.isArray(value)
                                                ? value.join(", ")
                                                : JSON.stringify(value)
                                              : value.toString()}
                                           </td>
                                         </tr>
                                      );
                                    }).filter(Boolean);
                                  })()}
                                </tbody>
                              </Table>
                            </Card.Body>
                          </Card>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Mobile Money Tab */}
                <Tab.Pane eventKey="momo">
                  <Card>
                    <Card.Header as="h5">Mobile Money Information</Card.Header>
                    <Card.Body>
                      {renderField("Provider", loan.momoProvider)}
                      {renderField("Mobile Money Number", loan.momoNumber)}
                      {renderField("Account Name", loan.momoAccountName)}
                      {renderField("Created At", loan.momo_created_at, formatDate)}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Documents Tab */}
                <Tab.Pane eventKey="documents">
                  <Card>
                    <Card.Header as="h5">Loan Final Decision</Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={12}>
                          <h6>Decision Information</h6>
                          {!isEmpty(loan.comments) && (
                            <p>
                              <strong>Comments:</strong> {loan.comments}
                            </p>
                          )}
                         
                          {!isEmpty(loan.decision_date) && renderField("Decision Date", loan.decision_date, formatDate)}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoanDetailsModal;