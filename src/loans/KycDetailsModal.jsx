import React, { useState } from "react";
import { Modal, Table, Button, ProgressBar, Row, Col } from "react-bootstrap";

const KycDetailsModal = ({ show, onClose, kyc }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  if (!kyc) return null;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    //return `http://localhost:5000/uploads/${imagePath}`;
    return `${process.env.REACT_APP_API_URL}/uploads/${imagePath}`;
  };

  // Get images based on current step
  const getStepImages = () => {
    switch (step) {
      case 1:
        return [
          { src: kyc.avatar, label: "Profile Picture", type: "avatar" }
        ];
      case 2:
        return []; // Contact info - no images
      case 3:
        return [
          { src: kyc.payslip, label: "Payslip", type: "payslip" },
          { src: kyc.ghanaCardFront, label: "Ghana Card (Front)", type: "ghanaCardFront" },
          { src: kyc.ghanaCardBack, label: "Ghana Card (Back)", type: "ghanaCardBack" },
          { src: kyc.employmentId, label: "Employment ID", type: "employmentId" },
          { src: kyc.businessPicture, label: "Business Picture", type: "businessPicture" }
        ];
      case 4:
        return []; // References - no images
      default:
        return [];
    }
  };

  const images = getStepImages().filter(img => img.src);

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>KYC Full Details</Modal.Title>
      </Modal.Header>

      <ProgressBar
        now={(step / totalSteps) * 100}
        label={`Step ${step} of ${totalSteps}`}
        className="mb-3"
        style={{ height: "30px" }}
      />

      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>

        {/* ================= IMAGE PREVIEW SECTION (Step-specific) ================= */}
        {images.length > 0 && (
          <div className="mb-4 p-3 border rounded bg-light">
            <h6 className="mb-3">📄 Documents Preview</h6>
            <Row>
              {images.map((img, idx) => (
                <Col key={idx} xs={6} md={4} lg={3} className="mb-3">
                  <div className="text-center">
                    <img
                      src={getImageUrl(img.src)}
                      alt={img.label}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        cursor: "pointer",
                        transition: "transform 0.2s"
                      }}
                      onClick={() => window.open(getImageUrl(img.src), "_blank")}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150x120?text=No+Image";
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    />
                    <small className="text-muted d-block mt-1">{img.label}</small>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* ================= STEP 1: PERSONAL ================= */}
        {step === 1 && (
          <>
            <h5 className="mb-3">📋 Personal Information</h5>
            <Table bordered responsive>
              <tbody>
                <tr>
                  <td width="35%"><b>Kyc code</b></td>
                  <td>{kyc.kyc_code || kyc.kycCode || "—"}</td>
                </tr>
                <tr>
                  <td><b>Title</b></td>
                  <td>{kyc.title || "—"}</td>
                </tr>
                <tr>
                  <td><b>First Name</b></td>
                  <td>{kyc.firstname || kyc.firstName || "—"}</td>
                </tr>
                <tr>
                  <td><b>Middle Name</b></td>
                  <td>{kyc.middlename || kyc.middleName || "—"}</td>
                </tr>
                <tr>
                  <td><b>Last Name</b></td>
                  <td>{kyc.lastname || kyc.lastName || "—"}</td>
                </tr>
                <tr>
                  <td><b>Date of Birth</b></td>
                  <td>
                    {kyc.dateofbirth || kyc.dateOfBirth || kyc.applicant_dob
                      ? new Date(kyc.dateofbirth || kyc.dateOfBirth || kyc.applicant_dob).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td><b>Gender</b></td>
                  <td>{kyc.applicant_gender || "—"}</td>
                </tr>

                <tr>
                  <td><b>National ID</b></td>
                  <td>{kyc.applicant_national_id || kyc.nationalId || "—"}</td>
                </tr>
                <tr>
                  <td><b>Marital Status</b></td>
                  <td>{kyc.applicant_marital_status || kyc.maritalStatus || "—"}</td>
                </tr>
                
                {(kyc.applicant_marital_status || kyc.maritalStatus) === "married" && (
  <>
    <tr>
      <td><b>Spouse Name</b></td>
      <td>{kyc.spousename || kyc.spouseName || "—"}</td>
    </tr>
    <tr>
      <td><b>Spouse Contact</b></td>
      <td>{kyc.spousecontact || kyc.spouseContact || "—"}</td>
    </tr>
  </>
)}
              </tbody>
            </Table>
          </>
        )}

        {/* ================= STEP 2: CONTACT ================= */}
        {step === 2 && (
          <>
            <h5 className="mb-3">📞 Contact Information</h5>
            <Table bordered responsive>
              <tbody>
                <tr>
                  <td width="35%"><b>Mobile Number</b></td>
                  <td>{kyc.mobileNumber || kyc.mobile || "—"}</td>
                </tr>
                <tr>
                  <td><b>Email</b></td>
                  <td>{kyc.applicant_email|| "—"}</td>
                </tr>
                <tr>
                  <td><b>Residential Address</b></td>
                  <td>{kyc.residentialAddress || kyc.applicant_address|| "—"}</td>
                </tr>
                <tr>
                  <td><b>Residential Landmark</b></td>
                  <td>{kyc.residentialLandmark || "—"}</td>
                </tr>
                <tr>
                  <td><b>City</b></td>
                  <td>{kyc.city || "—"}</td>
                </tr>
                <tr>
                  <td><b>State/Region</b></td>
                  <td>{kyc.state || "—"}</td>
                </tr>
                <tr>
                  <td><b>Residential Location</b></td>
                  <td>{kyc.residentiallocation || "—"}</td>
                </tr>
                <tr>
                  <td><b>Alternate Phone</b></td>
                  <td>{kyc.alternatePhone || "—"}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

        {/* ================= STEP 3: EMPLOYMENT ================= */}
        {step === 3 && (
          <>
            <h5 className="mb-3">💼 Employment / Business Information</h5>
            <Table bordered responsive>
              <tbody>
                <tr>
                  <td width="35%"><b>Employment Status</b></td>
                  <td>{kyc.applicant_employment_status || "—"}</td>
                </tr>
                {kyc.applicant_employment_status === "salary-worker" && (
                  <>
                    <tr>
                      <td><b>Employer Name</b></td>
                      <td>{kyc.employerName || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Job Title</b></td>
                      <td>{kyc.jobTitle || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Monthly Income</b></td>
                      <td>{kyc.monthlyIncome ? `GHS ${Number(kyc.monthlyIncome).toLocaleString()}` : "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Years in Current Employment</b></td>
                      <td>{kyc.yearsInCurrentEmployment || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Work Place Location</b></td>
                      <td>{kyc.workPlaceLocation || "—"}</td>
                    </tr>
                  </>
                )}
                {kyc.applicant_employment_status === "self-employed" && (
                  <>
                    <tr>
                      <td><b>Business Name</b></td>
                      <td>{kyc.businessName || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Business Type</b></td>
                      <td>{kyc.businessType || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Monthly Business Income</b></td>
                      <td>{kyc.monthlyBusinessIncome ? `GHS ${Number(kyc.monthlyBusinessIncome).toLocaleString()}` : "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Business Location</b></td>
                      <td>{kyc.businessLocation || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Business GPS Address</b></td>
                      <td>{kyc.businessGpsAddress || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Years in Business</b></td>
                      <td>{kyc.yearsInBusiness || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Number of Workers</b></td>
                      <td>{kyc.numberOfWorkers || "—"}</td>
                    </tr>
                    <tr>
                      <td><b>Working Capital</b></td>
                      <td>{kyc.workingCapital ? `GHS ${Number(kyc.workingCapital).toLocaleString()}` : "—"}</td>
                    </tr>
                  </>
                )}
                
              </tbody>
            </Table>
          </>
        )}

        {/* ================= STEP 4: REFERENCES ================= */}
        {step === 4 && (
          <>
            <h5 className="mb-3">👥 References</h5>
            <Table bordered responsive>
              <tbody>
                <tr className="bg-light">
                  <td colSpan="2"><b>Reference 1</b></td>
                </tr>
                <tr>
                  <td width="35%"><b>Name</b></td>
                  <td>{kyc.referenceName1 || "—"}</td>
                </tr>
                <tr>
                  <td><b>Phone</b></td>
                  <td>{kyc.referencePhone1 || "—"}</td>
                </tr>
                <tr>
                  <td><b>Relationship</b></td>
                  <td>{kyc.referenceRelationship1 || "—"}</td>
                </tr>
                
                <tr className="bg-light">
                  <td colSpan="2"><b>Reference 2</b></td>
                </tr>
                <tr>
                  <td><b>Name</b></td>
                  <td>{kyc.referenceName2 || "—"}</td>
                </tr>
                <tr>
                  <td><b>Phone</b></td>
                  <td>{kyc.referencePhone2 || "—"}</td>
                </tr>
                <tr>
                  <td><b>Relationship</b></td>
                  <td>{kyc.referenceRelationship2 || "—"}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}

      </Modal.Body>

      {/* ================= NAVIGATION ================= */}
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

export default KycDetailsModal;