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

    // PEP – REMOVED
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

  // ---- Steps (uploads and PEP removed) ----
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

  const handleCreateCustomer = () => {
    console.log("Form Data:", formData);
    console.log("Registration Type:", registrationType);
    alert("Customer created successfully!");
    // Submit to API...
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
            disabled={currentIndex === 0}
            className={currentIndex === 0 ? "disabled" : ""}
          >
            Previous
          </button>
          {currentIndex < steps.length - 1 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleCreateCustomer} className="create-btn">
              Create Customer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualCustomer;