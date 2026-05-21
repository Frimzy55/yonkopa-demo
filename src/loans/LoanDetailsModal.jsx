// src/components/LoanDetailsModal.jsx
import React, { useState } from "react";
import { Modal, Button, Table, ProgressBar } from "react-bootstrap";

const LoanDetailsModal = ({
  show,
  onClose,
  loan,
  onApprove,
  onReject,
  onViewKyc,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  if (!loan) return null;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // ✅ helper to build image URL safely
  const getImageUrl = (path) => {
    if (!path) return null;

    // if already full URL
    if (path.startsWith("http")) return path;

    // otherwise prepend backend URL
    return `${process.env.REACT_APP_API_URL}/${path}`;
  };

  // ✅ image preview component
  const renderImage = (path, label) => {
    const url = getImageUrl(path);

    return url ? (
      <div>
        <img
          src={url}
          alt={label}
          style={{
            width: "100px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => window.open(url, "_blank")}
        />
      </div>
    ) : (
      "—"
    );
  };

  // Get employee type (case insensitive comparison)
  const employeeType = loan.guarantorEmployeeType?.toLowerCase();

  // Get MoMo provider badge color
  const getMomoProviderColor = (provider) => {
    if (!provider) return "secondary";
    switch (provider.toLowerCase()) {
      case "mtn":
        return "warning";
      case "vodafone":
        return "danger";
      case "airteltigo":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Loan Application Details</Modal.Title>
      </Modal.Header>

      {/* Progress */}
      <ProgressBar
        now={(step / totalSteps) * 100}
        label={`Step ${step} of ${totalSteps}`}
        className="mb-3"
      />

      <Modal.Body>
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h5>Personal Information</h5>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <td><b>Kyc Code</b></td>
                  <td>{loan.kyc_code}</td>
                </tr>
                <tr>
                  <td><b>Name</b></td>
                  <td>{loan.applicant_fullName}</td>
                </tr>
                <tr>
                  <td><b>Email</b></td>
                  <td>{loan.applicant_email}</td>
                </tr>
                <tr>
                  <td><b>Phone</b></td>
                  <td>{loan.applicant_phone}</td>
                </tr>
                <tr>
                  <td><b>Date of Birth</b></td>
                  <td>
                    {loan.personal_dob
                      ? new Date(loan.personal_dob).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td><b>Gender</b></td>
                  <td>{loan.applicant_gender || "—"}</td>
                </tr>
                <tr>
                  <td><b>National ID</b></td>
                  <td>{loan.applicant_national_id || "—"}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h5>Loan Details</h5>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <td><b>Amount</b></td>
                  <td>₵{loan.loanAmount || "—"}</td>
                </tr>
                <tr>
                  <td><b>Purpose</b></td>
                  <td>{loan.loanPurpose || "—"}</td>
                </tr>
                <tr>
                  <td><b>Term (Months)</b></td>
                  <td>{loan.loanTerm || "—"}</td>
                </tr>
                <tr>
                  <td><b>Repayment Frequency</b></td>
                  <td>{loan.repaymentFrequency || "—"}</td>
                </tr>
                <tr>
                  <td><b>Rate Per Annum</b></td>
                  <td>{loan.ratePerAnnum ? `${loan.ratePerAnnum}%` : "—"}</td>
                </tr>
                <tr>
                  <td><b>Interest</b></td>
                  <td>₵{loan.interest || "—"}</td>
                </tr>
                <tr>
                  <td><b>Total Interest</b></td>
                  <td>₵{loan.totalInterest || "—"}</td>
                </tr>
                <tr>
                  <td><b>Number of Payments</b></td>
                  <td>{loan.numberOfPayments || "—"}</td>
                </tr>
                <tr>
                  <td><b>Monthly Payment</b></td>
                  <td>₵{loan.monthlyPayment || "—"}</td>
                </tr>
                <tr>
                  <td><b>Loan Fees</b></td>
                  <td>₵{loan.loanFees || "—"}</td>
                </tr>
                <tr>
                  <td><b>Status</b></td>
                  <td>
                    <span
                      className={`badge bg-${
                        loan.loan_status === "pending"
                          ? "warning"
                          : loan.loan_status === "approved"
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {loan.loan_status || "—"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

        {/* STEP 3 - Guarantor with conditional fields based on employee type */}
        {step === 3 && (
          <>
            <h5>Guarantor Information</h5>

            {/* Profile Picture at the top */}
            <div className="text-center mb-4">
              <h6>Profile Picture</h6>
              {loan.guarantorProfilePicture ? (
                renderImage(loan.guarantorProfilePicture, "Guarantor Profile")
              ) : (
                <div className="text-muted">No profile picture available</div>
              )}
            </div>

            {/* Basic Information */}
            <h6 className="mt-3">Basic Details</h6>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <td><b>Full Name</b></td>
                  <td>{loan.guarantorName || "—"}</td>
                </tr>
                <tr>
                  <td><b>Phone Number</b></td>
                  <td>{loan.guarantorPhone || "—"}</td>
                </tr>
                <tr>
                  <td><b>Address</b></td>
                  <td>{loan.guarantorAddress || "—"}</td>
                </tr>
                <tr>
                  <td><b>Residence Location</b></td>
                  <td>{loan.guarantorResidenceLocation || "—"}</td>
                </tr>
                <tr>
                  <td><b>ID Number</b></td>
                  <td>{loan.guarantorIdNumber || "—"}</td>
                </tr>
                <tr>
                  <td><b>Employee Type</b></td>
                  <td>
                    <span className={`badge bg-${
                      employeeType === "salary worker" ? "primary" : "success"
                    }`}>
                      {loan.guarantorEmployeeType || "—"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Conditional Rendering based on Employee Type */}
            {employeeType === "salary worker" && (
              <>
                <h6 className="mt-3">Employment Details</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><b>Rank/Position</b></td>
                      <td>{loan.guarantorRank || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Work Location</b></td>
                      <td>{loan.guarantorWorkLocation || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Name of Employer</b></td>
                      <td>{loan.guarantorNameOfEmployer || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Years in Service</b></td>
                      <td>{loan.guarantorYearsInService || "—"}</td>
                    </tr>
                  </tbody>
                </Table>

                {/* Documents for Salary Worker */}
                <h6 className="mt-3">Supporting Documents</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><b>Payslip</b></td>
                      <td>{renderImage(loan.guarantorPayslip, "Payslip")}</td>
                    </tr>
                    <tr>
                      <td><b>Ghana Card (Front)</b></td>
                      <td>{renderImage(loan.guarantorGhanaCardFront, "Ghana Card Front")}</td>
                    </tr>
                    <tr>
                      <td><b>Ghana Card (Back)</b></td>
                      <td>{renderImage(loan.guarantorGhanaCardBack, "Ghana Card Back")}</td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}

            {employeeType === "self-employed" && (
              <>
                <h6 className="mt-3">Business Details</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><b>Business Name</b></td>
                      <td>{loan.guarantorBusinessName || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Business Location</b></td>
                      <td>{loan.guarantorBusinessLocation || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Years in Business</b></td>
                      <td>{loan.guarantorYearsInBusiness || "—"}</td>
                    </tr>
                  </tbody>
                </Table>

                {/* Documents for Self-Employed */}
                <h6 className="mt-3">Supporting Documents</h6>
                <Table bordered size="sm">
                  <tbody>
                    <tr>
                      <td><b>Business Picture</b></td>
                      <td>{renderImage(loan.guarantorBusinessPicture, "Business Picture")}</td>
                    </tr>
                    <tr>
                      <td><b>Ghana Card (Front)</b></td>
                      <td>{renderImage(loan.guarantorGhanaCardFront, "Ghana Card Front")}</td>
                    </tr>
                    <tr>
                      <td><b>Ghana Card (Back)</b></td>
                      <td>{renderImage(loan.guarantorGhanaCardBack, "Ghana Card Back")}</td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}

            {/* If no employee type selected or other value */}
            {(!employeeType || (employeeType !== "salary worker" && employeeType !== "self-employed")) && (
              <div className="alert alert-info mt-3">
                <small>No employment details available. Employee type: {loan.guarantorEmployeeType || "Not specified"}</small>
              </div>
            )}
          </>
        )}
        
        {/* STEP 4 - Mobile Money Details */}
        {step === 4 && (
          <>
            <h5>Mobile Money Information</h5>
            <div className="text-center mb-4">
              <i className="fas fa-mobile-alt" style={{ fontSize: "48px", color: "#6c757d" }}></i>
            </div>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <td><b>Mobile Money Provider</b></td>
                  <td>
                    <span className={`badge bg-${getMomoProviderColor(loan.momoProvider)}`}>
                      {loan.momoProvider || "—"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><b>Mobile Money Number</b></td>
                  <td>
                    {loan.momoNumber ? (
                      <strong>{loan.momoNumber}</strong>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
                <tr>
                  <td><b>Account Name</b></td>
                  <td>{loan.momoAccountName || "—"}</td>
                </tr>
                <tr>
                  <td><b>Account Status</b></td>
                  <td>
                    <span className="badge bg-success">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* Additional Info Alert */}
            <div className="alert alert-info mt-3">
              <small>
                <i className="fas fa-info-circle"></i> Mobile Money details will be used for loan disbursement and repayment collections.
              </small>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div>
          {step > 1 && (
            <Button variant="secondary" onClick={prevStep} className="me-2">
              Previous
            </Button>
          )}
          {step < totalSteps && (
            <Button variant="primary" onClick={nextStep}>
              Next
            </Button>
          )}
        </div>

        <div>
          {/* View KYC Button Only - Approve/Reject removed */}
          <Button
            variant="info"
            onClick={() => onViewKyc(loan)}
            className="me-2"
          >
            View KYC Details
          </Button>

          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default LoanDetailsModal;