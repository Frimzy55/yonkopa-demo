// src/pages/CustomerDashboard/CustomerLoanForm.jsx
import React, { useState, useEffect } from "react";
import ApplicantDetails from "./CustomerApplicantDetails";
import LoanDetails from "./CustomerLoanDetails";
import GuarantorInfo from "./CustomerGuarantorInfo";
import CustomerMomoDetails from "./CustomerMomoDetails";
import "./LoanForm.css";

// ============= Toast Notification =============
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
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

// ============= Success Popup =============
const SuccessPopup = ({ message, onClose, onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(onContinue, 5000);
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
          <button className="btn-continue" onClick={onContinue}>Continue to Dashboard</button>
          <button className="btn-close-popup" onClick={onClose}>Close</button>
        </div>
        <p className="auto-close-text">Redirecting in 5 seconds...</p>
      </div>
    </div>
  );
};

// ============= Main Component =============
const CustomerLoanForm = ({ user, handleReset }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Loan fields
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
    // Guarantor
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
    // MOMO
    momoProvider: "",
    momoNumber: "",
    momoAccountName: "",
  });

  // ========== Toast helpers ==========
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };
  const hideToast = () => setToast(null);

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    handleReset?.();
  };
  const handleSuccessContinue = () => {
    setShowSuccessPopup(false);
    handleReset?.();
  };

  // ============================================================
  // ✅ FETCH COMPLETE KYC DATA USING userId
  // ============================================================
  useEffect(() => {
    if (!user?.userId) return;

    const fetchKyc = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/kyc-view/${user.userId}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          const kyc = data.data;
          const fullName = kyc.fullName || `${kyc.firstname || ''} ${kyc.lastname || ''}`.trim();

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

          const phone = kyc.mobileNumber || kyc.phone || kyc.mobile || "";
          const email = kyc.email || "";
          const employmentStatus = kyc.employmentStatus || kyc.employment_status || "";

          setFormData((prev) => ({
            ...prev,
            userId: kyc.userId || user.userId,
            fullName,
            phone,
            email,
            kycCode: kyc.kycCode || user.kycCode,
            gender: kyc.gender || "",
            nationalid: kyc.nationalid || "",
            maritalstatus: kyc.maritalstatus || "",
            employmentStatus,
            residentialAddress: kyc.residentialAddress || kyc.residentiallocation || "",
            dateofbirth: dobFormatted,
            dependents: kyc.dependents || "",
            residentialGPS: kyc.residentialGPS || "",
          }));
        } else {
          // Fallback: use basic user prop if fetch fails
          const fullName = user.fullName || `${user.firstname || ''} ${user.lastname || ''}`.trim();
          setFormData((prev) => ({
            ...prev,
            userId: user.userId,
            fullName,
            phone: user.mobileNumber || user.phone || "",
            email: user.email || "",
            kycCode: user.kycCode || "",
            gender: user.gender || "",
            nationalid: user.nationalid || "",
            maritalstatus: user.maritalstatus || "",
            employmentStatus: user.employmentStatus || "",
            residentialAddress: user.residentialAddress || user.residentiallocation || "",
            dateofbirth: "",
            dependents: user.dependents || "",
            residentialGPS: user.residentialGPS || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch KYC data:", err);
      }
    };

    fetchKyc();
  }, [user]);

  // ============================================================
  // All validation has been removed – steps proceed unconditionally
  // ============================================================

  const steps = [
    { number: 1, title: "" },
    { number: 2, title: "Loan Details" },
    { number: 3, title: "Guarantor Info" },
    { number: 4, title: "Momo Details" },
  ];

  const handleInputChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    }));
  };

  const nextStep = (e) => {
    e?.preventDefault();
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = (e) => {
    e?.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        { method: "POST", body: formPayload }
      );
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || "Your loan application has been received and is being processed.");
        setShowSuccessPopup(true);
        setCurrentStep(1);
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
      // No validation props – pass empty objects to avoid breaking child components
      errors: {}, 
      touchedFields: {},
      handleFieldBlur: () => {} // no-op
    };
    switch (currentStep) {
      case 1: return <ApplicantDetails {...stepProps} />;
      case 2: return <LoanDetails {...stepProps} />;
      case 3: return <GuarantorInfo {...stepProps} />;
      case 4: return <CustomerMomoDetails {...stepProps} />;
      default: return null;
    }
  };

  return (
    <div className="content-section">
      <h2>Loan Application</h2>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {showSuccessPopup && <SuccessPopup message={successMessage} onClose={handleSuccessPopupClose} onContinue={handleSuccessContinue} />}

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
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="step-indicators">
          {steps.map((step) => (
            <div key={step.number} className={`step-indicator ${currentStep >= step.number ? "active" : ""} ${currentStep === step.number ? "current" : ""}`}>
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
        <div className="progress-text">
          Step {currentStep} of {steps.length}
          <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="loan-form">
        {renderStep()}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-prev">← Previous</button>
          )}
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="btn-next">Next →</button>
          ) : (
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
        {/* Error summary removed */}
      </form>
    </div>
  );
};

export default CustomerLoanForm;