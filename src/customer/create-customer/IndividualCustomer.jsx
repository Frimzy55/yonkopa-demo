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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    // Clear error for this field as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    setFormErrors({});
  };

  // ---- Steps ----
  const getSteps = () => {
    return registrationType === "express"
      ? ["biodata", "contact"]
      : ["biodata", "contact", "occupation", "references"];
  };

  const steps = getSteps();
  const currentIndex = steps.indexOf(activeSection);

  // ---- Validation Logic ----
  const validateStep = (step) => {
    const errors = {};
    let isValid = true;

    switch (step) {
      case "biodata":
        if (!formData.title) {
          errors.title = "Title is required";
          isValid = false;
        }
        if (!formData.firstName) {
          errors.firstName = "First name is required";
          isValid = false;
        }
        if (!formData.lastName) {
          errors.lastName = "Last name is required";
          isValid = false;
        }
        if (!formData.gender) {
          errors.gender = "Gender is required";
          isValid = false;
        }
        if (!formData.dateOfBirth) {
          errors.dateOfBirth = "Date of birth is required";
          isValid = false;
        }
        if (!formData.maritalStatus) {
          errors.maritalStatus = "Marital status is required";
          isValid = false;
        }
        if (!formData.nationalId) {
          errors.nationalId = "National ID is required";
          isValid = false;
        }
        if (!formData.residentialLocation) {
          errors.residentialLocation = "Residential location is required";
          isValid = false;
        }
        break;

      case "contact":
        if (!formData.mobileNumber) {
          errors.mobileNumber = "Mobile number is required";
          isValid = false;
        }
       
        if (!formData.residentialAddress) {
          errors.residentialAddress = "Residential address is required";
          isValid = false;
        }
        if (!formData.city) {
          errors.city = "City is required";
          isValid = false;
        }
        if (!formData.state) {
          errors.state = "State/Region is required";
          isValid = false;
        }
        break;

      case "occupation":
        if (registrationType === "detailed") {
          if (!formData.employmentStatus) {
            errors.employmentStatus = "Employment status is required";
            isValid = false;
          }
          if (formData.employmentStatus === "employed") {
            if (!formData.employerName) {
              errors.employerName = "Employer name is required";
              isValid = false;
            }
            if (!formData.jobTitle) {
              errors.jobTitle = "Job title is required";
              isValid = false;
            }
            if (!formData.monthlyIncome) {
              errors.monthlyIncome = "Monthly income is required";
              isValid = false;
            }
            if (!formData.yearsInCurrentEmployment) {
              errors.yearsInCurrentEmployment =
                "Years in current employment is required";
              isValid = false;
            }
            if (!formData.workplaceLocation) {
              errors.workplaceLocation = "Workplace location is required";
              isValid = false;
            }
          } else if (formData.employmentStatus === "self-employed") {
            if (!formData.businessName) {
              errors.businessName = "Business name is required";
              isValid = false;
            }
            if (!formData.businessType) {
              errors.businessType = "Business type is required";
              isValid = false;
            }
            if (!formData.monthlyBusinessIncome) {
              errors.monthlyBusinessIncome =
                "Monthly business income is required";
              isValid = false;
            }
            if (!formData.businessLocation) {
              errors.businessLocation = "Business location is required";
              isValid = false;
            }
            if (!formData.businessGpsAddress) {
              errors.businessGpsAddress = "Business GPS address is required";
              isValid = false;
            }
            if (!formData.yearsInBusiness) {
              errors.yearsInBusiness = "Years in business is required";
              isValid = false;
            }
          }
        }
        break;

      case "references":
        if (registrationType === "detailed") {
          if (!formData.referenceName1) {
            errors.referenceName1 = "Reference 1 name is required";
            isValid = false;
          }
          if (!formData.referencePhone1) {
            errors.referencePhone1 = "Reference 1 phone is required";
            isValid = false;
          }
          if (!formData.referenceRelationship1) {
            errors.referenceRelationship1 =
              "Reference 1 relationship is required";
            isValid = false;
          }
          if (!formData.referenceName2) {
            errors.referenceName2 = "Reference 2 name is required";
            isValid = false;
          }
          if (!formData.referencePhone2) {
            errors.referencePhone2 = "Reference 2 phone is required";
            isValid = false;
          }
          if (!formData.referenceRelationship2) {
            errors.referenceRelationship2 =
              "Reference 2 relationship is required";
            isValid = false;
          }
          // reference 3 is optional
        }
        break;

      default:
        break;
    }

    setFormErrors(errors);
    return isValid;
  };

  // ---- Navigation ----
  const handleNext = () => {
    if (!validateStep(activeSection)) {
      // Scroll to the top of the form to show errors
      const el = document.querySelector(".individual-customer-container .form-content");
      if (el) el.scrollTop = 0;
      return;
    }

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

  // ---- Final Submission ----
  const handleCreateCustomer = async () => {
    // Validate all steps
    for (const step of steps) {
      if (!validateStep(step)) {
        setActiveSection(step);
        const el = document.querySelector(".individual-customer-container .form-content");
        if (el) el.scrollTop = 0;
        return;
      }
    }

    // All valid – proceed with submission
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
        `${process.env.REACT_APP_API_URL}/api/kyc/save-all-manual`,
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

      setShowSuccessModal(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred while submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ---- Modal close ----
  const handleModalClose = () => {
    setShowSuccessModal(false);
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

          {activeSection === "contact" && (
            <ContactInfo
              formData={formData}
              handleInputChange={handleInputChange}
              formErrors={formErrors}
            />
          )}

          {registrationType === "detailed" && activeSection === "occupation" && (
            <EmploymentInfo
              formData={formData}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              formErrors={formErrors}
            />
          )}

          {registrationType === "detailed" && activeSection === "references" && (
            <ReferenceInfo
              formData={formData}
              handleInputChange={handleInputChange}
              formErrors={formErrors}
            />
          )}
        </div>

        {/* ACTIONS */}
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
          <div className="modal-content" style={{ textAlign: "center" }}>
            <h2 style={{ color: "#28a745" }}>✅ Customer Created Successfully!</h2>
            <p>Your customer account has been created successfully.</p>
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