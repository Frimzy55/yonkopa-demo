// IndividualCustomer.jsx
import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import ContactInfo from "./ContactInfo";
import EmploymentInfo from "./EmploymentInfo";
import ReferenceInfo from "./ReferenceInfo";
import "./IndividualCustomer.css";

const IndividualCustomer = () => {
  const [activeSection, setActiveSection] = useState("biodata");
  const [registrationType, setRegistrationType] = useState("detailed");
  const [formErrors, setFormErrors] = useState({});
  const [checkingNationalId, setCheckingNationalId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successKycCode, setSuccessKycCode] = useState("");

  const user = { fullName: "Jane Doe" };

  const [formData, setFormData] = useState({
    // PersonalInfo
    title: "",
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    nationalId: "",
    residentialLocation: "",
    spouseName: "",
    spouseContact: "",
    avatar: null,

    // ContactInfo
    mobileNumber: "",
    email: "",
    residentialAddress: "",
    residentialLandmark: "",
    city: "",
    state: "",
    alternatePhone: "",

    // EmploymentInfo
    employmentStatus: "",
    employerName: "",
    jobTitle: "",
    monthlyIncome: "",
    yearsInCurrentEmployment: "",
    workplaceLocation: "",
    payslip: null,
    ghanaCardFront: null,
    ghanaCardBack: null,
    employmentId: null,
    businessName: "",
    businessType: "",
    monthlyBusinessIncome: "",
    businessLocation: "",
    businessGpsAddress: "",
    numberOfWorkers: "",
    yearsInBusiness: "",
    workingCapital: "",
    businessPicture: null,

    // ReferenceInfo
    referenceName1: "",
    referencePhone1: "",
    referenceRelationship1: "",
    referenceName2: "",
    referencePhone2: "",
    referenceRelationship2: "",
    referenceName3: "",
    referencePhone3: "",
    referenceRelationship3: "",
  });

  // ---- Handlers ----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  // ---- Registration type ----
  const handleRegistrationTypeChange = (e) => {
    setRegistrationType(e.target.value);
    setActiveSection("biodata");
  };

  // ---- Steps ----
  const getSteps = () => {
    return registrationType === "express"
      ? ["biodata", "contact"]
      : ["biodata", "contact", "occupation", "references"];
  };

  const steps = getSteps();
  const currentIndex = steps.indexOf(activeSection);

  // ---- Navigation ----
  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setActiveSection(steps[currentIndex + 1]);
      const el = document.querySelector(".individual-customer-container .form-content");
      if (el) el.scrollTop = 0;
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveSection(steps[currentIndex - 1]);
      const el = document.querySelector(".individual-customer-container .form-content");
      if (el) el.scrollTop = 0;
    }
  };

  // ---- API Submission ----
  const handleCreateCustomer = async () => {
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && key !== "userId") {
          data.append(key, formData[key]);
        }
      });

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/kyc/save-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );
      const result = await res.json();

      if (!result.success) {
        if (result.message?.includes("National ID")) {
          setFormErrors((prev) => ({
            ...prev,
            nationalId: result.message,
          }));
          setActiveSection("biodata");
        } else {
          alert(`Submission failed: ${result.message || "Unknown error"}`);
        }
        setIsSubmitting(false);
        return;
      }

      // ---- Success ----
      const kycCode = result.kycCode || "";
      setSuccessKycCode(kycCode);
      setShowSuccessModal(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred while submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ---- Close modal and reset form (optional) ----
  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Optionally reset the form to initial state
    // You could reset all fields or navigate away.
    // For now, we just close the modal.
  };

  // ---- Render ----
  return (
    <div className="individual-customer-container">
      {/* HEADER */}
      <div className="customer-panel-header">
        <div>
          <h2>Create Customer</h2>
          <p>Individual Customer Registration</p>
        </div>
      </div>

      {/* BODY */}
      <div className="customer-panel-body">
        {/* TOP BAR */}
        <div className="form-topbar">
          <label>Registration Type</label>
          <select value={registrationType} onChange={handleRegistrationTypeChange}>
            <option value="express">Express</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        {/* STEP BAR */}
        <div className="step-bar">
          {steps.map((step) => (
            <button
              key={step}
              className={activeSection === step ? "active" : ""}
              onClick={() => {
                setActiveSection(step);
                const el = document.querySelector(".individual-customer-container .form-content");
                if (el) el.scrollTop = 0;
              }}
            >
              {step.toUpperCase()}
            </button>
          ))}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="form-content">
          {/* BIODATA */}
          {activeSection === "biodata" && (
            <PersonalInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              formErrors={formErrors}
              checkingNationalId={checkingNationalId}
              user={user}
            />
          )}

          {/* CONTACT */}
          {activeSection === "contact" && (
            <ContactInfo
              formData={formData}
              handleInputChange={handleInputChange}
              formErrors={formErrors}
            />
          )}

          {/* OCCUPATION – only in detailed mode */}
          {registrationType === "detailed" && activeSection === "occupation" && (
            <EmploymentInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              formErrors={formErrors}
            />
          )}

          {/* REFERENCES – only in detailed mode */}
          {registrationType === "detailed" && activeSection === "references" && (
            <ReferenceInfo
              formData={formData}
              handleInputChange={handleInputChange}
              formErrors={formErrors}
            />
          )}
        </div>

        {/* ACTIONS – fixed at bottom */}
        <div className="form-actions">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isSubmitting}
            className={currentIndex === 0 ? "disabled" : ""}
          >
            Previous
          </button>
          {currentIndex < steps.length - 1 ? (
            <button onClick={handleNext} disabled={isSubmitting}>
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateCustomer}
              className="create-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Create Customer"}
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🎉 Customer Created!</h2>
            <p>Your customer has been successfully registered.</p>
            {successKycCode && (
              <div className="kyc-code-box">
                <strong>KYC Code:</strong> <span>{successKycCode}</span>
              </div>
            )}
            <button className="modal-close-btn" onClick={handleModalClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualCustomer;