import React, { useState, useEffect, useCallback, useRef } from "react";
import PersonalInfo from "./KycPersonalInfo";
import ContactInfo from "./KycContactInfo";
import EmploymentInfo from "./KycEmploymentInfos";
import ReferenceInfo from "./KycReferenceInfo";
import "./CustomerCompleteKyc.css";
import { 
  getStepErrors, 
  validateAllSteps,
  validatePhoneNumber,
  validateNationalId 
} from "./kycValidation";

const CustomerCompleteKyc = ({ user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hasKyc, setHasKyc] = useState(false);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [checkingNationalId, setCheckingNationalId] = useState(false);
  const [nationalIdAvailable, setNationalIdAvailable] = useState(true);
  const nationalIdCheckTimeout = useRef(null);
  const abortControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    userId: "",
    kycCode: "",
    avatar: null,
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationalId: "",
    taxId: "",
    residentialLocation: "",
    residentialLandmark: "",
    spouseName: "",
    spouseContact: "",
    mobileNumber: "",
    email: "",
    residentialAddress: "",
    city: "",
    state: "",
    zipCode: "",
    postalAddress: "",
    alternatePhone: "",
    employmentStatus: "",
    employerName: "",
    jobTitle: "",
    monthlyIncome: "",
    yearsInCurrentEmployment: "",
    workPlaceLocation: "",
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

  // ==========================
  // VALIDATION FUNCTION
  // ==========================
  const validateCurrentStep = () => {
    const errors = getStepErrors(formData, currentStep);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==========================
  // CHECK IF KYC EXISTS
  // ==========================
  useEffect(() => {
    if (!user?.userId) return;

    const checkKyc = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/kyc/check/${user.userId}`
        );
        const data = await res.json();
        if (data.hasKyc) {
          setHasKyc(true);
          setFormData((prev) => ({ ...prev, kycCode: data.kycCode }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingKyc(false);
      }
    };

    checkKyc();
  }, [user]);

  // ==========================
  // AUTOFILL USER INFO
  // ==========================
  useEffect(() => {
    if (!user) return;
    const fullname = user.fullname || user.fullName || "";
    const nameParts = fullname.trim().split(" ");

    setFormData((prev) => ({
      ...prev,
      kycCode: user.kycCode || "",
      userId: user.userId || "",
      firstName: nameParts[0] || "",
      middleName: nameParts.length === 3 ? nameParts[1] : "",
      lastName: nameParts.length >= 2 ? nameParts[nameParts.length - 1] : "",
      email: user.email || "",
      mobileNumber: user.phone || "",
    }));
  }, [user]);

  // ==========================
  const checkNationalIdDuplicate = useCallback(async (nationalId) => {
    const cleanId = nationalId?.trim().toUpperCase();

    if (!cleanId) return;

    // cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCheckingNationalId(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/kyc/check-national-id/${cleanId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      const data = res.ok ? await res.json() : { exists: false };

      if (data.exists) {
        setFormErrors(prev => ({
          ...prev,
          nationalId: "❌ This National ID is already registered"
        }));
        setNationalIdAvailable(false);
      } else {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.nationalId?.includes("already registered")) {
            delete newErrors.nationalId;
          }
          return newErrors;
        });

        setNationalIdAvailable(true);
      }

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setCheckingNationalId(false);
    }
  }, []);
  
  useEffect(() => {
    const id = formData.nationalId?.trim();

    if (!id) {
      setNationalIdAvailable(true);
      setCheckingNationalId(false);
      return;
    }

    // 1. FORMAT CHECK ONLY (NO DB HERE)
    const formatError = validateNationalId(id, { allowPartial: true });

    if (formatError) {
      setFormErrors(prev => ({
        ...prev,
        nationalId: formatError
      }));
      setNationalIdAvailable(false);
      return;
    }

    // 2. debounce API check
    if (nationalIdCheckTimeout.current) {
      clearTimeout(nationalIdCheckTimeout.current);
    }

    setCheckingNationalId(true);

    nationalIdCheckTimeout.current = setTimeout(() => {
      checkNationalIdDuplicate(id);
    }, 600);

    return () => clearTimeout(nationalIdCheckTimeout.current);
  }, [formData.nationalId, checkNationalIdDuplicate]);

  // ==========================
  // REAL-TIME FIELD VALIDATION
  // ==========================
  const validateField = (name, value) => {
    switch (name) {
      case "mobileNumber":
      case "spouseContact":
      case "alternatePhone":
      case "referencePhone1":
      case "referencePhone2":
      case "referencePhone3":
        const phoneError = validatePhoneNumber(value, name.replace(/([A-Z])/g, ' $1').toLowerCase());
        if (phoneError) {
          setFormErrors(prev => ({ ...prev, [name]: phoneError }));
        } else {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
        break;
      
      default:
        if (formErrors[name]) {
          setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
    }
  };

  // ==========================
  // HANDLE INPUTS
  // ==========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ==========================
  // SAVE ALL KYC DATA
  // ==========================
  const saveAllKyc = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && key !== "userId") {
          data.append(key, formData[key]);
        }
      });

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/kyc/save-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      const result = await res.json();
      
      if (!result.success && result.message?.includes("National ID")) {
        setFormErrors(prev => ({
          ...prev,
          nationalId: result.message
        }));
        setNationalIdAvailable(false);
        return false;
      }
      
      // Capture the kycCode from the response
      if (result.success && result.kycCode) {
        setFormData(prev => ({
          ...prev,
          kycCode: result.kycCode
        }));
      }
      
      return result.success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // ==========================
  // STEP NAVIGATION
  // ==========================
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setFormErrors({});
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setFormErrors({});
  };

  // ==========================
  // FINAL SUBMIT
  // ==========================
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    if (!nationalIdAvailable && formData.nationalId) {
      setSubmitMessage({ 
        type: "error", 
        text: "❌ Cannot submit: This National ID has already been used for KYC verification." 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const { isValid, errors } = validateAllSteps(formData);
    
    if (!isValid) {
      const allErrors = { ...errors.step1, ...errors.step2, ...errors.step3, ...errors.step4 };
      setFormErrors(allErrors);
      setSubmitMessage({ 
        type: "error", 
        text: "❌ Please complete all required fields correctly before submitting." 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSubmitting(true);
    const success = await saveAllKyc();
    setSubmitting(false);

    if (success) {
      setSubmitMessage({ type: "success", text: "✅ KYC submitted successfully!" });
      
      // Ensure KYC code is preserved
      setFormData(prev => ({
        ...prev,
        kycCode: prev.kycCode || user?.kycCode || ""
      }));

      setSubmitted(true);
    } else {
      setSubmitMessage({ type: "error", text: "❌ Failed to submit KYC. Please try again." });
    }
  };

  // ==========================
  // RENDER STEP COMPONENT
  // ==========================
  const renderStep = () => {
    const stepProps = {
      formData,
      handleInputChange,
      handleFileChange,
      formErrors,
      checkingNationalId,
      nationalIdAvailable,
      user,
      isMobileLocked: false,
      isEmailLocked: false,
    };
    
    switch (currentStep) {
      case 1:
        return <PersonalInfo {...stepProps} />;
      case 2:
        return <ContactInfo {...stepProps} />;
      case 3:
        return <EmploymentInfo {...stepProps} />;
      case 4:
        return <ReferenceInfo {...stepProps} />;
      default:
        return null;
    }
  };

  // ==========================
  // RENDER PREVIEW AFTER SUBMIT
  // ==========================
  const renderPreview = () => (
    <div className="kyc-preview-card">
      <h3 className="kyc-title">✅ KYC Submitted Successfully!</h3>
      <div className="kyc-grid">
        <div className="kyc-item">
          <span className="kyc-label">KYC Code:</span>
          <span className="kyc-value kyc-code-value">{formData.kycCode || "Pending"}</span>
        </div>
        <div className="kyc-item">
          <span className="kyc-label">Name:</span>
          <span className="kyc-value">
            {formData.title} {formData.firstName} {formData.middleName} {formData.lastName}
          </span>
        </div>
        <div className="kyc-item">
          <span className="kyc-label">National ID:</span>
          <span className="kyc-value">{formData.nationalId}</span>
        </div>
        <div className="kyc-item">
          <span className="kyc-label">Email:</span>
          <span className="kyc-value">{formData.email}</span>
        </div>
        <div className="kyc-item">
          <span className="kyc-label">Phone:</span>
          <span className="kyc-value">{formData.mobileNumber}</span>
        </div>
      </div>
    </div>
  );

  // ==========================
  // STEP CARDS (Green color removed)
  // ==========================
  const StepCards = () => {
    const steps = [
      { number: 1, label: "Personal" },
      { number: 2, label: "Contact" },
      { number: 3, label: "Employment" },
      { number: 4, label: "Reference" },
    ];

    return (
      <div className="step-cards-container">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLocked = step.number > currentStep;

          return (
            <div
              key={step.number}
              className={`step-card ${isActive ? "active" : isCompleted ? "completed" : ""}`}
              onClick={() => !isLocked && setCurrentStep(step.number)}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================
  // MAIN RENDER
  // ==========================
  return (
    <div className="content-section">
      <h2>KYC Forms</h2>

      {checkingKyc ? (
        <p>Loading...</p>
      ) : hasKyc ? (
        <div className="kyc-preview">
  <div className="kyc-card">
    {/* Header Section */}
    <div className="kyc-header">
      <div className="kyc-icon">
        <i className="bi bi-check-circle-fill"></i>✔
      </div>
      <h3>KYC Completed Successfully</h3>
      <p className="kyc-subtitle">Your identity verification has been completed successfully.</p>
    </div>
    
    {/* KYC Code Section */}
    <div className="kyc-code-section">
      <div className="kyc-code-box">
        <span className="kyc-code-label">KYC Code</span>
        <h2 className="kyc-code-value">{formData.kycCode}</h2>
      </div>
    </div>
    
    {/* Personal Information Section */}
    <div className="kyc-info-section">
      <h4 className="section-title">Personal Information</h4>
      
      <div className="kyc-items-grid">
        <div className="kyc-item">
          <div className="kyc-label">Full Name</div>
          <div className="kyc-value">
            {formData.title} {formData.firstName} {formData.middleName} {formData.lastName}
          </div>
        </div>
        
       
        <div className="kyc-item">
          <div className="kyc-label">Email Address</div>
          <div className="kyc-value">{formData.email}</div>
        </div>
        
      </div>
    </div>
  </div>
</div>
      ) : submitted ? (
        renderPreview()
      ) : (
        <>
          <StepCards />
          <form className="kyc-form" onSubmit={handleFinalSubmit}>
            {renderStep()}

            {checkingNationalId && (
              <div className="national-id-checking">
                <span className="spinner-small"></span>
                Verifying National ID...
              </div>
            )}

            {Object.keys(formErrors).length > 0 && (
              <div className="error-summary">
                <h4>Please fix the following errors:</h4>
                <ul>
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-navigation mt-3">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Previous
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                  disabled={
                    checkingNationalId ||
                    !nationalIdAvailable ||
                    !!formErrors.nationalId
                  }
                >
                  Next
                </button>
              )}
              {currentStep === 4 && (
                <button 
                  type="submit" 
                  disabled={submitting || !nationalIdAvailable} 
                  className="btn btn-success"
                >
                  {submitting ? "Submitting..." : "Submit KYC"}
                </button>
              )}
            </div>

            {submitMessage && (
              <div className={`alert alert-${submitMessage.type === "success" ? "success" : "danger"} mt-3`}>
                {submitMessage.text}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default CustomerCompleteKyc;