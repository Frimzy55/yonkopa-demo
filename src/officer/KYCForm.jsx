// ============================================================
// KYCForm.js – with Success Modal that resets on close
// ============================================================
import React, { useState, useEffect } from "react";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import Step1KYC from "./steps/Step1KYC";
import Step2Business from "./steps/Step2Business";
import Step3Loan from "./steps/Step3Loan";
import Step4Reference from "./steps/Step4Reference";
import Step5ClientDocuments from "./steps/Step5ClientDocuments";
import Step6GuarantorDetails from "./steps/Step6GuarantorDetails";
import Step7GuarantorDocuments from "./steps/Step7GuarantorDocuments";
import Step8LoanHistory from "./steps/Step8LoanHistory";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/kyc`
  : "/api/kyc";

const KYCForm = ({
  formData,
  onChange,
  onCancel,
  photoPreview: parentPhotoPreview,
  onFileChange: parentOnFileChange,
}) => {
  // ------------------------------------------------------------
  // Window resize
  // ------------------------------------------------------------
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  // ------------------------------------------------------------
  // Step state & labels
  // ------------------------------------------------------------
  const [step, setStep] = useState(1);
  const stepLabels = [
    "KYC",
    "Business",
    "Loan",
    "Reference",
    "Client Documents",
    "Guarantor Details",
    "Guarantor Documents",
    "Loan History",
  ];
  const totalSteps = stepLabels.length;

  // ------------------------------------------------------------
  // API call state
  // ------------------------------------------------------------
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ------------------------------------------------------------
  // Success modal state
  // ------------------------------------------------------------
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ------------------------------------------------------------
  // Client ID (optional – backend can generate)
  // ------------------------------------------------------------
  const [clientId, setClientId] = useState(null);

  // ------------------------------------------------------------
  // File states (client, guarantor, collateral, ownership)
  // ------------------------------------------------------------
  const [clientPhotoFile, setClientPhotoFile] = useState(null);
  const [clientPhotoPreview, setClientPhotoPreview] = useState(parentPhotoPreview || null);

  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState(null);
  const [guarantorPhotoPreview, setGuarantorPhotoPreview] = useState(null);

  const [collateralPhotoFile, setCollateralPhotoFile] = useState(null);
  const [ownershipDocumentFile, setOwnershipDocumentFile] = useState(null);

  // ------------------------------------------------------------
  // Document arrays (Step 5 & 7)
  // ------------------------------------------------------------
  const [clientDocuments, setClientDocuments] = useState([]);
  const [guarantorDocuments, setGuarantorDocuments] = useState([]);

  // ------------------------------------------------------------
  // Guarantor employee type (Step 6)
  // ------------------------------------------------------------
  const [employeeType, setEmployeeType] = useState("");

  // ------------------------------------------------------------
  // Helper: format file size
  // ------------------------------------------------------------
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // ------------------------------------------------------------
  // Handlers for client photo
  // ------------------------------------------------------------
  const handleClientPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientPhotoPreview(reader.result);
        if (parentOnFileChange) parentOnFileChange(file);
      };
      reader.readAsDataURL(file);
      setClientPhotoFile(file);
    } else {
      setClientPhotoPreview(null);
      setClientPhotoFile(null);
      if (parentOnFileChange) parentOnFileChange(null);
    }
  };

  // ------------------------------------------------------------
  // Handlers for guarantor photo
  // ------------------------------------------------------------
  const handleGuarantorPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGuarantorPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setGuarantorPhotoFile(file);
    } else {
      setGuarantorPhotoPreview(null);
      setGuarantorPhotoFile(null);
    }
  };

  // ------------------------------------------------------------
  // Handlers for collateral & ownership files (Step 3)
  // ------------------------------------------------------------
  const handleCollateralPhotoChange = (file) => {
    setCollateralPhotoFile(file);
  };

  const handleOwnershipDocumentChange = (file) => {
    setOwnershipDocumentFile(file);
  };

  // ------------------------------------------------------------
  // Navigation (no saving on step change)
  // ------------------------------------------------------------
  const handleNext = (currentStep) => {
    if (currentStep < totalSteps) {
      setStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    setError(null);
  };

  // ------------------------------------------------------------
  // SINGLE SUBMIT – sends all data to /api/kyc/submit
  // ------------------------------------------------------------
  const submitAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();

      if (clientId) {
        fd.append("clientId", clientId);
      }

      const textFields = {
        // Step 1
        firstName: formData.firstName,
        surname: formData.surname,
        popularName: formData.popularName,
        phone: formData.phone,
        altPhone: formData.altPhone,
        hometown: formData.hometown,
        placeOfBirth: formData.placeOfBirth,
        ghanaCardNumber: formData.ghanaCardNumber,
        dateIssued: formData.dateIssued,
        expiryDate: formData.expiryDate,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        fatherName: formData.fatherName,
        fatherContact: formData.fatherContact,
        motherName: formData.motherName,
        motherContact: formData.motherContact,
        spouseName: formData.spouseName,
        spouseContact: formData.spouseContact,
        spouseOccupation: formData.spouseOccupation,
        residentialLocation: formData.residentialLocation,
        district: formData.district,
        residentialOwnership: formData.residentialOwnership,
        nearestLandmark: formData.nearestLandmark,
        gpsAddress: formData.gpsAddress,
        yearsAtAddress: formData.yearsAtAddress,
        rentAdvance: formData.rentAdvance,
        numberOfDependents: formData.numberOfDependents,
        householdMembers: formData.householdMembers,
        dependentsSchooling: formData.dependentsSchooling,
        religion: formData.religion,
        churchName: formData.churchName,
        churchLocation: formData.churchLocation,
        pastorName: formData.pastorName,
        pastorContact: formData.pastorContact,

        // Step 2
        businessName: formData.businessName,
        businessSector: formData.businessSector,
        typesOfBusiness: formData.typesOfBusiness,
        businessDescription: formData.businessDescription,
        businessLocation: formData.businessLocation,
        businessLocationStatus: formData.businessLocationStatus,
        workingCapital: formData.workingCapital,
        stockValue: formData.stockValue,
        businessGpsAddress: formData.businessGpsAddress,
        yearsInBusiness: formData.yearsInBusiness,
        businessLandmark: formData.businessLandmark,
        minimumSale: formData.minimumSale,
        maximumSale: formData.maximumSale,

        // Step 3
        loanAmount: formData.loanAmount,
        loanPurpose: formData.loanPurpose,
        loanTerm: formData.loanTerm,
        weeklyInstallment: formData.weeklyInstallment,
        repaymentAmount: formData.repaymentAmount,
        previousLoanRequest: formData.previousLoanRequest,
        previousLoanApproved: formData.previousLoanApproved,
        expectedDueDate: formData.expectedDueDate,
        actualDueDate: formData.actualDueDate,
        repaymentFrequency: formData.repaymentFrequency,
        existingLoanBalance: formData.existingLoanBalance,
        loanNeedReason: formData.loanNeedReason,
        whatIfNotApproved: formData.whatIfNotApproved,
        comfortableRepayment: formData.comfortableRepayment,
        existingDebtRepayment: formData.existingDebtRepayment,

        securityType: formData.securityType,
        securityDescription: formData.securityDescription,
        securityOwner: formData.securityOwner,
        securityPurchaseDate: formData.securityPurchaseDate,
        securityMarketValue: formData.securityMarketValue,
        securityForcedSaleValue: formData.securityForcedSaleValue,
        securitySerial: formData.securitySerial,
        securityRegistration: formData.securityRegistration,
        securityVerificationStatus: formData.securityVerificationStatus,
        securityEncumbrances: formData.securityEncumbrances,

        prevRepaymentBehaviour: formData.prevRepaymentBehaviour,
        totalBorrowed: formData.totalBorrowed,
        loanCycleCompleted: formData.loanCycleCompleted,
        maxPastDueDays: formData.maxPastDueDays,
        missedInstalments: formData.missedInstalments,
        totalArrears: formData.totalArrears,
        writeOffLoans: formData.writeOffLoans,
        extensions: formData.extensions,
        numberOfPayOff: formData.numberOfPayOff,
        currentOutstandingBalance: formData.currentOutstandingBalance,
        avgRepaymentPerformance: formData.avgRepaymentPerformance,

        visitBusiness: formData.visitBusiness,
        businessOperating: formData.businessOperating,
        observedSalesCorrespondence: formData.observedSalesCorrespondence,
        dailyCustomerVolume: formData.dailyCustomerVolume,
        keyRiskObserved: formData.keyRiskObserved,

        knownClientSince: formData.knownClientSince,
        adverseInfo: formData.adverseInfo,
        repaymentConcerns: formData.repaymentConcerns,

        verifiedMonthlyIncome: formData.verifiedMonthlyIncome,
        reasonableRepayment: formData.reasonableRepayment,

        recommendedAmount: formData.recommendedAmount,
        recommendedTerm: formData.recommendedTerm,
        recommendationReason: formData.recommendationReason,

        // Step 6 – Guarantor
        guarantorEmployeeType: employeeType,
        guarantorRank: formData.guarantorRank,
        guarantorNameOfEmployer: formData.guarantorNameOfEmployer,
        guarantorWorkLocation: formData.guarantorWorkLocation,
        guarantorYearsInService: formData.guarantorYearsInService,
        guarantorBusinessName: formData.guarantorBusinessName,
        guarantorBusinessLocation: formData.guarantorBusinessLocation,
        guarantorYearsInBusiness: formData.guarantorYearsInBusiness,
        guarantorFirstName: formData.guarantorFirstName,
        guarantorLastName: formData.guarantorLastName,
        guarantorPhone: formData.guarantorPhone,
        guarantorAltPhone: formData.guarantorAltPhone,
        guarantorIdNumber: formData.guarantorIdNumber,
        guarantorRelationship: formData.guarantorRelationship,
        guarantorAddress: formData.guarantorAddress,
        guarantorResidenceLocation: formData.guarantorResidenceLocation,
        guarantorChurchName: formData.guarantorChurchName,
        guarantorChurchLocation: formData.guarantorChurchLocation,
      };

      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fd.append(key, value);
        }
      });

      const references = formData.references || [];
      if (references.length > 0) {
        fd.append("references", JSON.stringify(references));
      }

      const loans = formData.loans || [];
      if (loans.length > 0) {
        fd.append("loans", JSON.stringify(loans));
      }

      if (clientPhotoFile) fd.append("clientPhoto", clientPhotoFile);
      if (guarantorPhotoFile) fd.append("guarantorPhoto", guarantorPhotoFile);
      if (collateralPhotoFile) fd.append("collateralPhoto", collateralPhotoFile);
      if (ownershipDocumentFile) fd.append("ownershipDocument", ownershipDocumentFile);

      clientDocuments.forEach((doc, index) => {
        fd.append(`clientDocuments[${index}][file]`, doc.file);
        fd.append(`clientDocuments[${index}][name]`, doc.name);
      });

      guarantorDocuments.forEach((doc, index) => {
        fd.append(`guarantorDocuments[${index}][file]`, doc.file);
        fd.append(`guarantorDocuments[${index}][name]`, doc.name);
      });

      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }

      const data = await res.json();
      if (data.clientId) setClientId(data.clientId);

      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // Close success modal & reset form (call onCancel)
  // ------------------------------------------------------------
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Call parent's onCancel to close the form and reset data
    if (onCancel) {
      onCancel();
    }
  };

  // ------------------------------------------------------------
  // Shared styling
  // ------------------------------------------------------------
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };
  const selectStyle = {
    ...inputStyle,
    background: "#fff",
  };
  const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
    fontFamily: "inherit",
  };
  const focusStyle = (e) => (e.target.style.borderColor = "#818cf8");
  const blurStyle = (e) => (e.target.style.borderColor = "#e2e8f0");

  // ------------------------------------------------------------
  // Props for each step
  // ------------------------------------------------------------
  const stepProps = {
    formData,
    onChange,
    isMobile,
    inputStyle,
    selectStyle,
    textareaStyle,
    focusStyle,
    blurStyle,
  };

  const step1Props = {
    ...stepProps,
    photoPreview: clientPhotoPreview,
    onFileChange: handleClientPhotoChange,
    onNext: () => handleNext(1),
    onCancel,
  };

  const step2Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(2),
  };

  const step3Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(3),
    onFileChange: (file, type) => {
      if (type === "collateralPhotos") {
        handleCollateralPhotoChange(file);
      } else if (type === "ownershipDocument") {
        handleOwnershipDocumentChange(file);
      }
    },
  };

  const step4Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(4),
  };

  const step5Props = {
    ...stepProps,
    clientDocuments,
    handleAddClientDocuments: (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      const newDocs = files.map((file) => ({ file, name: file.name, size: file.size }));
      setClientDocuments((prev) => [...prev, ...newDocs]);
      e.target.value = "";
    },
    removeClientDocument: (index) => {
      setClientDocuments((prev) => prev.filter((_, i) => i !== index));
    },
    renameClientDocument: (index, newName) => {
      setClientDocuments((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], name: newName };
        return updated;
      });
    },
    formatSize,
    onBack: handleBack,
    onNext: () => handleNext(5),
  };

  const step6Props = {
    ...stepProps,
    guarantorPhotoPreview,
    handleGuarantorPhotoChange,
    employeeType,
    handleEmployeeTypeChange: (e) => {
      const value = e.target.value;
      setEmployeeType(value);
      onChange({ target: { name: "guarantorEmployeeType", value } });
    },
    onBack: handleBack,
    onNext: () => handleNext(6),
  };

  const step7Props = {
    ...stepProps,
    guarantorDocuments,
    handleAddGuarantorDocuments: (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      const newDocs = files.map((file) => ({ file, name: file.name, size: file.size }));
      setGuarantorDocuments((prev) => [...prev, ...newDocs]);
      e.target.value = "";
    },
    removeGuarantorDocument: (index) => {
      setGuarantorDocuments((prev) => prev.filter((_, i) => i !== index));
    },
    renameGuarantorDocument: (index, newName) => {
      setGuarantorDocuments((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], name: newName };
        return updated;
      });
    },
    formatSize,
    onBack: handleBack,
    onNext: () => handleNext(7),
  };

  const step8Props = {
    ...stepProps,
    onBack: handleBack,
    onSubmit: submitAll,
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: isMobile ? "20px" : "32px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <button
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <MdArrowBack size={18} /> Back to applications
        </button>

        {/* Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            padding: "0 4px",
            gap: isMobile ? "4px" : "8px",
            flexWrap: "wrap",
          }}
        >
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step > stepNumber;
            return (
              <React.Fragment key={index}>
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "13px",
                    fontWeight: isActive ? "700" : isCompleted ? "500" : "400",
                    color: isActive ? "#1e293b" : isCompleted ? "#f37712" : "#94a3b8",
                    borderBottom: isActive ? "2px solid #fc821f" : "none",
                    paddingBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                {index < totalSteps - 1 && (
                  <span
                    style={{
                      color: step > index + 1 ? "#090efa" : "#e2e8f0",
                      fontWeight: "300",
                      fontSize: isMobile ? "12px" : "16px",
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error display */}
        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading overlay */}
        {saving && (
          <div style={{ textAlign: "center", padding: "20px", color: "#3b82f6" }}>
            Saving... please wait.
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && <Step1KYC {...step1Props} />}
          {step === 2 && <Step2Business {...step2Props} />}
          {step === 3 && <Step3Loan {...step3Props} />}
          {step === 4 && <Step4Reference {...step4Props} />}
          {step === 5 && <Step5ClientDocuments {...step5Props} />}
          {step === 6 && <Step6GuarantorDetails {...step6Props} />}
          {step === 7 && <Step7GuarantorDocuments {...step7Props} />}
          {step === 8 && <Step8LoanHistory {...step8Props} />}
        </form>
      </div>

      {/* =============================================================
          SUCCESS MODAL
      ============================================================= */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={closeSuccessModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "40px 32px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "fadeInUp 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdCheckCircle size={48} color="#22c55e" />
              </div>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 8px 0",
              }}
            >
              Application Submitted!
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              Your KYC application has been successfully submitted. We will
              review it and get back to you shortly.
            </p>
            <button
              onClick={closeSuccessModal}
              style={{
                padding: "10px 32px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CSS keyframe for animation */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
};

export default KYCForm;