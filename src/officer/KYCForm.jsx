import React, { useState, useEffect, useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import Step1KYC from "./steps/Step1KYC";
import Step2Business from "./steps/Step2Business";
import Step3Loan from "./steps/Step3Loan";
import Step4Reference from "./steps/Step4Reference";
import Step5ClientDocuments from "./steps/Step5ClientDocuments";
import Step6GuarantorDetails from "./steps/Step6GuarantorDetails";
import Step7GuarantorDocuments from "./steps/Step7GuarantorDocuments";
import Step8LoanHistory from "./steps/Step8LoanHistory";

const KYCForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  onFileChange,
  photoPreview,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [step, setStep] = useState(1);
  const [clientDocuments, setClientDocuments] = useState([]);
  const [guarantorDocuments, setGuarantorDocuments] = useState([]);
  const [guarantorPhotoPreview, setGuarantorPhotoPreview] = useState(null);
  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState(null);

  // Step 6 file previews
  const [payslipPreview, setPayslipPreview] = useState(null);
  const [businessPreview, setBusinessPreview] = useState(null);
  const [cardFrontPreview, setCardFrontPreview] = useState(null);
  const [cardBackPreview, setCardBackPreview] = useState(null);
  const [employeeType, setEmployeeType] = useState("");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
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

  const goToStep = (s) => setStep(s);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      clientDocuments: clientDocuments.map((d) => d.file),
      guarantorDocuments: guarantorDocuments.map((d) => d.file),
      guarantorPhoto: guarantorPhotoFile,
    });
  };

  // Step 6 helpers
  const handleGuarantorFileChange = (e, fieldName, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      onChange({ target: { name: fieldName, value: file } });
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result);
      reader.readAsDataURL(file);
    } else {
      previewSetter(null);
    }
  };

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

  const handleEmployeeTypeChange = (e) => {
    const value = e.target.value;
    setEmployeeType(value);
    onChange({ target: { name: "guarantorEmployeeType", value } });
  };

  // Step 5 document handlers
  const handleAddClientDocuments = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newDocs = files.map((file) => ({ file, name: file.name, size: file.size }));
    setClientDocuments((prev) => [...prev, ...newDocs]);
    e.target.value = "";
  };
  const removeClientDocument = (index) => {
    setClientDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 7 document handlers
  const handleAddGuarantorDocuments = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newDocs = files.map((file) => ({ file, name: file.name, size: file.size }));
    setGuarantorDocuments((prev) => [...prev, ...newDocs]);
    e.target.value = "";
  };
  const removeGuarantorDocument = (index) => {
    setGuarantorDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Shared styling props
  const stepProps = {
    formData,
    onChange,
    onFileChange,
    isMobile,
    inputStyle: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    selectStyle: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      background: "#fff",
      boxSizing: "border-box",
    },
    textareaStyle: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: "vertical",
    },
    focusStyle: (e) => (e.target.style.borderColor = "#818cf8"),
    blurStyle: (e) => (e.target.style.borderColor = "#e2e8f0"),
  };

  const step1Props = { ...stepProps, photoPreview };
  const step2Props = stepProps;
  const step3Props = stepProps;
  const step4Props = stepProps;
  const step5Props = {
    ...stepProps,
    clientDocuments,
    handleAddClientDocuments,
    removeClientDocument,
    formatSize,
  };
  const step6Props = {
    ...stepProps,
    guarantorPhotoPreview,
    guarantorPhotoFile,
    handleGuarantorPhotoChange,
    payslipPreview,
    businessPreview,
    cardFrontPreview,
    cardBackPreview,
    employeeType,
    handleEmployeeTypeChange,
    handleGuarantorFileChange,
    setPayslipPreview,
    setBusinessPreview,
    setCardFrontPreview,
    setCardBackPreview,
  };
  const step7Props = {
    ...stepProps,
    guarantorDocuments,
    handleAddGuarantorDocuments,
    removeGuarantorDocument,
    formatSize,
  };
  const step8Props = stepProps; // Loan History uses only basic props

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: isMobile ? "20px" : "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Back button */}
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

      <form onSubmit={handleSubmit}>
        {step === 1 && <Step1KYC {...step1Props} onNext={() => goToStep(2)} onCancel={onCancel} />}
        {step === 2 && <Step2Business {...step2Props} onBack={() => goToStep(1)} onNext={() => goToStep(3)} />}
        {step === 3 && <Step3Loan {...step3Props} onBack={() => goToStep(2)} onNext={() => goToStep(4)} />}
        {step === 4 && <Step4Reference {...step4Props} onBack={() => goToStep(3)} onNext={() => goToStep(5)} />}
        {step === 5 && <Step5ClientDocuments {...step5Props} onBack={() => goToStep(4)} onNext={() => goToStep(6)} />}
        {step === 6 && <Step6GuarantorDetails {...step6Props} onBack={() => goToStep(5)} onNext={() => goToStep(7)} />}
        {step === 7 && <Step7GuarantorDocuments {...step7Props} onBack={() => goToStep(6)} onNext={() => goToStep(8)} />}
        {step === 8 && <Step8LoanHistory {...step8Props} onBack={() => goToStep(7)} />}
      </form>
    </div>
  );
};

export default KYCForm;