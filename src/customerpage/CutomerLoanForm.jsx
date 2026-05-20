// src/pages/CustomerDashboard/CustomerLoanForm.jsx
import React, { useState, useEffect } from "react";
import ApplicantDetails from "./CustomerApplicantDetails";
import LoanDetails from "./CustomerLoanDetails";
import GuarantorInfo from "./CustomerGuarantorInfo";
import CustomerMomoDetails from "./CustomerMomoDetails";
import "./LoanForm.css";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : ''}
        </span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

// Success Popup Modal Component
const SuccessPopup = ({ message, onClose, onContinue }) => {
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="success-popup-overlay" onClick={onClose}>
      <div className="success-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-animation">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>
        
        <h3 className="success-title">Application Submitted Successfully!</h3>
        <p className="success-message">{message || "Your loan application has been received and is being processed."}</p>
        
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-icon">📋</span>
            <span>Application Status: <strong>Under Review</strong></span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">⏱️</span>
            <span>Processing Time: <strong>24-48 hours</strong></span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📧</span>
            <span>Confirmation sent to your email</span>
          </div>
        </div>
        
        <div className="success-buttons">
          <button className="btn-continue" onClick={onContinue}>
            Continue to Dashboard
          </button>
          <button className="btn-close-popup" onClick={onClose}>
            Close
          </button>
        </div>
        
        <p className="auto-close-text">Redirecting in 5 seconds...</p>
      </div>
    </div>
  );
};

const CustomerLoanForm = ({ user, handleReset }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [toast, setToast] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    phone: "",
    email: "",
    kycCode: "",
    dateofbirth: "",
    gender: "",
    nationalid: "",
    maritalstatus: "",
    dependents: "",
    residentialAddress: "",
    residentialGPS: "",
    employmentStatus: "",

    loanAmount: "",
    loanPurpose: "",
    loanTerm: "",
    repaymentFrequency: "",
    ratePerAnnum: "",
    interest: "",
    totalInterest: "",
    numberOfPayments: "",
    monthlyPayment: "",
    loanFees: "",

    guarantorProfilePicture: null,
    guarantorName: "",
    guarantorPhone: "",
    guarantorAddress: "",
    guarantorResidenceLocation: "",
    guarantorIdNumber: "",
    guarantorEmployeeType: "",
    guarantorRank: "",
    guarantorWorkLocation: "",
    guarantorNameOfEmployer: "",
    guarantorYearsInService: "",
    guarantorPayslip: null,
    guarantorBusinessName: "",
    guarantorBusinessLocation: "",
    guarantorYearsInBusiness: "",
    guarantorBusinessPicture: null,
    guarantorGhanaCardFront: null,
    guarantorGhanaCardBack: null,

    momoProvider: "",
    momoNumber: "",
    momoAccountName: "",
  });

  const showToast = (message, type = 'error') => {
    console.log(`Showing toast: ${message} (${type})`);
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    handleReset?.();
  };

  const handleSuccessContinue = () => {
    setShowSuccessPopup(false);
    handleReset?.();
  };

  useEffect(() => {
    if (!user?.userId) return;

    const fetchKyc = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/kyc-view/${user.userId}`);
        const data = await res.json();

        if (data.success && data.data) {
          const kyc = data.data;
          const fullName = kyc.fullName || `${kyc.firstname || ""} ${kyc.lastname || ""}`.trim();

          let dobFormatted = "";
          if (kyc.dateofbirth) {
            const dateObj = new Date(kyc.dateofbirth);
            if (!isNaN(dateObj)) {
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
              const dd = String(dateObj.getDate()).padStart(2, "0");
              dobFormatted = `${yyyy}-${mm}-${dd}`;
            }
          }

          setFormData((prev) => ({
            ...prev,
            userId: kyc.userId || "",
            fullName,
            phone: kyc.mobileNumber || "",
            email: kyc.email || "",
            kycCode: kyc.kycCode || "",
            gender: kyc.gender || "",
            nationalid: kyc.nationalid || "",
            maritalstatus: kyc.maritalstatus || "",
            employmentStatus: kyc.employmentStatus || "",
            residentialAddress: kyc.residentialAddress || kyc.residentiallocation || "",
            dateofbirth: dobFormatted,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch KYC:", err);
        showToast("Failed to load KYC information", "error");
      }
    };

    fetchKyc();
  }, [user]);

  const steps = [
    { number: 1, title: "" },
    { number: 2, title: "Loan Details" },
    { number: 3, title: "Guarantor Info" },
    { number: 4, title: "Momo Details" },
  ];

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10,12}$/.test(formData.phone.replace(/\D/g, ''))) 
      newErrors.phone = "Valid phone number is required";
    
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = "Valid email is required";
    
    if (!formData.dateofbirth) newErrors.dateofbirth = "Date of birth is required";
    else {
      const age = new Date().getFullYear() - new Date(formData.dateofbirth).getFullYear();
      if (age < 18) newErrors.dateofbirth = "Must be at least 18 years old";
      if (age > 100) newErrors.dateofbirth = "Invalid date of birth";
    }
    
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.nationalid?.trim()) newErrors.nationalid = "National ID is required";
    if (!formData.maritalstatus) newErrors.maritalstatus = "Marital status is required";
    
    if (!formData.residentialAddress?.trim()) newErrors.residentialAddress = "Residential address is required";
    if (!formData.employmentStatus) newErrors.employmentStatus = "Employment status is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.loanAmount) newErrors.loanAmount = "Loan amount is required";
    else if (isNaN(formData.loanAmount) || formData.loanAmount <= 0) 
      newErrors.loanAmount = "Loan amount must be greater than 0";
    else if (formData.loanAmount < 100) newErrors.loanAmount = "Minimum loan amount is 100";
    else if (formData.loanAmount > 1000000) newErrors.loanAmount = "Maximum loan amount is 1,000,000";
    
    if (!formData.loanPurpose?.trim()) newErrors.loanPurpose = "Loan purpose is required";
    else if (formData.loanPurpose.length < 1) newErrors.loanPurpose = "Please provide a more detailed purpose (min 1 character)";
    
    if (!formData.loanTerm) newErrors.loanTerm = "Loan term is required";
    else if (isNaN(formData.loanTerm) || formData.loanTerm <= 0) 
      newErrors.loanTerm = "Loan term must be greater than 0";
    else if (formData.loanTerm < 1) newErrors.loanTerm = "Minimum loan term is 1 month";
    else if (formData.loanTerm > 60) newErrors.loanTerm = "Maximum loan term is 60 months";
    
    if (!formData.repaymentFrequency) newErrors.repaymentFrequency = "Repayment frequency is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.guarantorName?.trim()) newErrors.guarantorName = "Guarantor name is required";
    
    if (!formData.guarantorPhone?.trim()) newErrors.guarantorPhone = "Guarantor phone is required";
    else if (!/^[0-9]{10,12}$/.test(formData.guarantorPhone.replace(/\D/g, ''))) 
      newErrors.guarantorPhone = "Valid phone number is required";
    
    if (!formData.guarantorAddress?.trim()) newErrors.guarantorAddress = "Guarantor address is required";
    if (!formData.guarantorIdNumber?.trim()) newErrors.guarantorIdNumber = "Guarantor ID number is required";
    if (!formData.guarantorEmployeeType) newErrors.guarantorEmployeeType = "Employment type is required";
    
    if (!formData.guarantorProfilePicture) newErrors.guarantorProfilePicture = "Profile picture is required";
    else if (formData.guarantorProfilePicture.size > 15 * 1024 * 1024) 
      newErrors.guarantorProfilePicture = "File size must be less than 5MB";
    
    if (!formData.guarantorGhanaCardFront) newErrors.guarantorGhanaCardFront = "Ghana Card front is required";
    else if (formData.guarantorGhanaCardFront.size > 15 * 1024 * 1024) 
      newErrors.guarantorGhanaCardFront = "File size must be less than 5MB";
    
    if (!formData.guarantorGhanaCardBack) newErrors.guarantorGhanaCardBack = "Ghana Card back is required";
    else if (formData.guarantorGhanaCardBack.size > 15 * 1024 * 1024) 
      newErrors.guarantorGhanaCardBack = "File size must be less than 5MB";
    
    if (formData.guarantorEmployeeType === "salary worker") {
      if (!formData.guarantorRank) newErrors.guarantorRank = "Rank/Position is required";
      if (!formData.guarantorNameOfEmployer?.trim()) newErrors.guarantorNameOfEmployer = "Employer name is required";
      if (!formData.guarantorWorkLocation?.trim()) newErrors.guarantorWorkLocation = "Work location is required";
      if (!formData.guarantorYearsInService) newErrors.guarantorYearsInService = "Years in service is required";
      else if (isNaN(formData.guarantorYearsInService) || formData.guarantorYearsInService < 0) 
        newErrors.guarantorYearsInService = "Valid years in service is required";
      if (!formData.guarantorPayslip) newErrors.guarantorPayslip = "Payslip is required";
      else if (formData.guarantorPayslip.size > 15 * 1024 * 1024) 
        newErrors.guarantorPayslip = "File size must be less than 5MB";
    } 
    else if (formData.guarantorEmployeeType === "self-employed") {
      if (!formData.guarantorBusinessName?.trim()) newErrors.guarantorBusinessName = "Business name is required";
      if (!formData.guarantorBusinessLocation?.trim()) newErrors.guarantorBusinessLocation = "Business location is required";
      if (!formData.guarantorYearsInBusiness) newErrors.guarantorYearsInBusiness = "Years in business is required";
      else if (isNaN(formData.guarantorYearsInBusiness) || formData.guarantorYearsInBusiness < 0) 
        newErrors.guarantorYearsInBusiness = "Valid years in business is required";
      if (!formData.guarantorBusinessPicture) newErrors.guarantorBusinessPicture = "Business picture is required";
      else if (formData.guarantorBusinessPicture.size > 15 * 1024 * 1024) 
        newErrors.guarantorBusinessPicture = "File size must be less than 5MB";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.momoProvider) newErrors.momoProvider = "Mobile money provider is required";
    
    if (!formData.momoNumber?.trim()) newErrors.momoNumber = "Mobile money number is required";
    else if (!/^[0-9]{10,12}$/.test(formData.momoNumber.replace(/\D/g, ''))) 
      newErrors.momoNumber = "Valid mobile money number is required";
    
    if (!formData.momoAccountName?.trim()) newErrors.momoAccountName = "Account name is required";
    else if (formData.momoAccountName.length < 3) newErrors.momoAccountName = "Account name must be at least 3 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const nextStep = (e) => {
    if (e) e.preventDefault();
    
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setErrors({});
      setTouchedFields({});
    } else {
      const allFields = {};
      Object.keys(formData).forEach(key => {
        allFields[key] = true;
      });
      setTouchedFields(allFields);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Please fill in all required fields correctly before submitting.", "error");
    }
  };

  const prevStep = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
    setTouchedFields({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    const isStep4Valid = validateStep4();
    
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) {
      const allFields = {};
      Object.keys(formData).forEach(key => {
        allFields[key] = true;
      });
      setTouchedFields(allFields);
      
      showToast("Please fix all errors before submitting", "error");
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else if (!isStep3Valid) setCurrentStep(3);
      else if (!isStep4Valid) setCurrentStep(4);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();

      Object.keys(formData).forEach((key) => {
        let value = formData[key];
        if (key === "dateofbirth" && (!value || value === "")) value = null;
        if (value !== null && value !== undefined) {
          formPayload.append(key, value);
        }
      });

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/loan/submit-full-application`,
        {
          method: "POST",
          body: formPayload,
        }
      );

      const data = await res.json();

      console.log("Server response:", data);

      if (data.success) {
        // Show success popup instead of toast
        setSuccessMessage(data.message || "Your loan application has been received and is being processed.");
        setShowSuccessPopup(true);
        
        // Reset form state
        setCurrentStep(1);
        setErrors({});
        setTouchedFields({});
      } else {
        showToast(`Failed: ${data.error || "Unknown error"}`, "error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showToast("Server error. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const renderStep = () => {
    const stepProps = {
      formData,
      handleInputChange,
      handleFieldBlur,
      errors,
      touchedFields,
    };
    
    switch (currentStep) {
      case 1:
        return <ApplicantDetails {...stepProps} />;
      case 2:
        return <LoanDetails {...stepProps} />;
      case 3:
        return <GuarantorInfo {...stepProps} />;
      case 4:
        return <CustomerMomoDetails {...stepProps} />;
      default:
        return null;
    }
  };

  const getErrorSummary = () => {
    const summary = {
      applicant: [],
      loan: [],
      guarantor: [],
      momo: []
    };
    
    const applicantFields = ['fullName', 'phone', 'email', 'dateofbirth', 'gender', 'nationalid', 'maritalstatus', 'residentialAddress', 'employmentStatus'];
    const loanFields = ['loanAmount', 'loanPurpose', 'loanTerm', 'repaymentFrequency'];
    const guarantorFields = ['guarantorName', 'guarantorPhone', 'guarantorAddress', 'guarantorIdNumber', 'guarantorEmployeeType', 'guarantorProfilePicture', 'guarantorGhanaCardFront', 'guarantorGhanaCardBack', 'guarantorRank', 'guarantorNameOfEmployer', 'guarantorWorkLocation', 'guarantorYearsInService', 'guarantorPayslip', 'guarantorBusinessName', 'guarantorBusinessLocation', 'guarantorYearsInBusiness', 'guarantorBusinessPicture'];
    const momoFields = ['momoProvider', 'momoNumber', 'momoAccountName'];
    
    Object.keys(errors).forEach(key => {
      if (applicantFields.includes(key)) summary.applicant.push(errors[key]);
      else if (loanFields.includes(key)) summary.loan.push(errors[key]);
      else if (guarantorFields.includes(key)) summary.guarantor.push(errors[key]);
      else if (momoFields.includes(key)) summary.momo.push(errors[key]);
    });
    
    return summary;
  };

  const errorSummary = getErrorSummary();
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="content-section">
      <h2>Loan Application</h2>

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup 
          message={successMessage}
          onClose={handleSuccessPopupClose}
          onContinue={handleSuccessContinue}
        />
      )}

      {isSubmitting && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="spinner"></div>
            <h5>Submitting your loan application...</h5>
            <p>Please wait...</p>
          </div>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="step-indicators">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`step-indicator ${
                currentStep >= step.number ? "active" : ""
              } ${currentStep === step.number ? "current" : ""}`}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="progress-text">
          Step {currentStep} of {steps.length}
          <span className="progress-percentage">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="loan-form">
        {renderStep()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-prev">
              ← Previous
            </button>
          )}

          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="btn-next">
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>

        {hasErrors && (
          <div className="error-summary-bottom">
            <div className="error-summary-header">
              <span className="error-icon"></span>
              <h4>Please fix the following errors to continue:</h4>
            </div>
            
            <div className="error-summary-content">
              {errorSummary.applicant.length > 0 && currentStep === 1 && (
                <div className="error-category">
                  <strong>Applicant Details:</strong>
                  <ul>
                    {errorSummary.applicant.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {errorSummary.loan.length > 0 && currentStep === 2 && (
                <div className="error-category">
                  <strong>Loan Details:</strong>
                  <ul>
                    {errorSummary.loan.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {errorSummary.guarantor.length > 0 && currentStep === 3 && (
                <div className="error-category">
                  <strong>Guarantor Information:</strong>
                  <ul>
                    {errorSummary.guarantor.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {errorSummary.momo.length > 0 && currentStep === 4 && (
                <div className="error-category">
                  <strong>Mobile Money Details:</strong>
                  <ul>
                    {errorSummary.momo.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="error-summary-footer">
              <small>Please correct the errors above before proceeding.</small>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomerLoanForm;