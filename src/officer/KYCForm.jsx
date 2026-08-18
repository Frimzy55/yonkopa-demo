import React, { useState, useEffect, useRef } from "react";
import { MdArrowBack, MdClose, MdPerson, MdAttachFile } from "react-icons/md";

const KYCForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  onFileChange,
  photoPreview,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [step, setStep] = useState(1); // 1=KYC, 2=Business, 3=Loan, 4=Reference, 5=Documents
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Step labels for the progress bar
  const stepLabels = ["KYC", "Business", "Loan", "Reference", "Documents"];
  const totalSteps = stepLabels.length;

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
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
  };

  const focusStyle = (e) => (e.target.style.borderColor = "#818cf8");
  const blurStyle = (e) => (e.target.style.borderColor = "#e2e8f0");

  const goToStep = (s) => setStep(s);

  // Document upload handlers
  const handleAddDocuments = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newDocs = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
    e.target.value = "";
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Final submit – includes documents
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      documents: documents.map((d) => d.file),
    });
  };

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
      {/* Always visible: Back to applications */}
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

      {/* ===================== PROGRESS INDICATOR (only names) ===================== */}
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
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: isActive ? "700" : isCompleted ? "500" : "400",
                  color: isActive ? "#1e293b" : isCompleted ? "#6366f1" : "#94a3b8",
                  cursor: "default",
                  borderBottom: isActive ? "2px solid #6366f1" : "none",
                  paddingBottom: "4px",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {label}
              </span>
              {index < totalSteps - 1 && (
                <span
                  style={{
                    color: step > index + 1 ? "#6366f1" : "#e2e8f0",
                    fontWeight: "300",
                    fontSize: isMobile ? "14px" : "18px",
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
        {/* ===================== STEP 1: KYC ===================== */}
        {step === 1 && (
          <>
            {/* --- PROFILE PICTURE --- */}
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#334155",
                  marginBottom: "12px",
                }}
              >
                Profile Picture
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => document.getElementById("profileInput").click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <MdPerson size={48} color="#94a3b8" />
                  )}

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("profileInput").value = "";
                        onFileChange(null);
                      }}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <MdClose />
                    </button>
                  )}
                </div>

                <div>
                  <input
                    id="profileInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      onFileChange(file);
                    }}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("profileInput").click()}
                    style={{
                      padding: "8px 20px",
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      borderRadius: "8px",
                      color: "#4338ca",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e0e7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#eef2ff")
                    }
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </button>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginTop: "4px",
                    }}
                  >
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* --- PERSONAL INFORMATION --- */}
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
                marginTop: "0",
                marginBottom: "20px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              Personal Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Popular Name
                </label>
                <input
                  type="text"
                  name="popularName"
                  value={formData.popularName || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Hometown *
                </label>
                <input
                  type="text"
                  name="hometown"
                  value={formData.hometown || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Place of Birth *
                </label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Ghana Card Number *
                </label>
                <input
                  type="text"
                  name="ghanaCardNumber"
                  value={formData.ghanaCardNumber || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Date Issued *
                </label>
                <input
                  type="date"
                  name="dateIssued"
                  value={formData.dateIssued || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Marital Status *
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus || ""}
                  onChange={onChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>

            {/* --- FAMILY INFORMATION --- */}
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#334155", marginTop: "20px", marginBottom: "12px" }}>
              Family Information
            </h4>
            <div style={{ marginBottom: "16px" }}>
              <h5 style={{ fontSize: "14px", fontWeight: "500", color: "#64748b", margin: "0 0 8px 0" }}>
                Father's Details
              </h5>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Father's Contact
                  </label>
                  <input
                    type="tel"
                    name="fatherContact"
                    value={formData.fatherContact || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <h5 style={{ fontSize: "14px", fontWeight: "500", color: "#64748b", margin: "0 0 8px 0" }}>
                Mother's Details
              </h5>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Mother's Contact
                  </label>
                  <input
                    type="tel"
                    name="motherContact"
                    value={formData.motherContact || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: "14px", fontWeight: "500", color: "#64748b", margin: "0 0 8px 0" }}>
                Spouse Details (if applicable)
              </h5>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Name of Spouse
                  </label>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Spouse Contact
                  </label>
                  <input
                    type="tel"
                    name="spouseContact"
                    value={formData.spouseContact || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                    Spouse Occupation
                  </label>
                  <input
                    type="text"
                    name="spouseOccupation"
                    value={formData.spouseOccupation || ""}
                    onChange={onChange}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </div>

            {/* --- RESIDENTIAL & DEPENDENTS --- */}
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#334155", marginTop: "20px", marginBottom: "12px" }}>
              Residential & Dependents
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Residential Location
                </label>
                <input
                  type="text"
                  name="residentialLocation"
                  value={formData.residentialLocation || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Residential Ownership *
                </label>
                <select
                  name="residentialOwnership"
                  value={formData.residentialOwnership || ""}
                  onChange={onChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select</option>
                  <option value="owned">Owned</option>
                  <option value="rented">Rented</option>
                  <option value="family">Family</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Nearest Landmark
                </label>
                <input
                  type="text"
                  name="nearestLandmark"
                  value={formData.nearestLandmark || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Residential GPS Address
                </label>
                <input
                  type="text"
                  name="gpsAddress"
                  value={formData.gpsAddress || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Years at this Address
                </label>
                <input
                  type="number"
                  name="yearsAtAddress"
                  value={formData.yearsAtAddress || ""}
                  onChange={onChange}
                  min="0"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Rent Advance (months)
                </label>
                <input
                  type="number"
                  name="rentAdvance"
                  value={formData.rentAdvance || ""}
                  onChange={onChange}
                  min="0"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Number of Dependents
                </label>
                <input
                  type="number"
                  name="numberOfDependents"
                  value={formData.numberOfDependents || ""}
                  onChange={onChange}
                  min="0"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Dependents Schooling (e.g., all enrolled)
                </label>
                <input
                  type="text"
                  name="dependentsSchooling"
                  value={formData.dependentsSchooling || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* --- RELIGIOUS INFORMATION --- */}
            <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#334155", marginTop: "20px", marginBottom: "12px" }}>
              Religious Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Religion
                </label>
                <input
                  type="text"
                  name="religion"
                  value={formData.religion || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Name of Church
                </label>
                <input
                  type="text"
                  name="churchName"
                  value={formData.churchName || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Church Location
                </label>
                <input
                  type="text"
                  name="churchLocation"
                  value={formData.churchLocation || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Name of Pastor
                </label>
                <input
                  type="text"
                  name="pastorName"
                  value={formData.pastorName || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Pastor's Contact
                </label>
                <input
                  type="tel"
                  name="pastorContact"
                  value={formData.pastorContact || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Step 1 buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => goToStep(2)}
                style={{
                  padding: "10px 24px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ===================== STEP 2: BUSINESS & EXPENSES ===================== */}
        {step === 2 && (
          <>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginTop: "0", marginBottom: "20px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              Business & Personal Expenses
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Information
                </label>
                <input
                  type="text"
                  name="businessInformation"
                  value={formData.businessInformation || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Sector
                </label>
                <input
                  type="text"
                  name="businessSector"
                  value={formData.businessSector || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Types of Business
                </label>
                <input
                  type="text"
                  name="typesOfBusiness"
                  value={formData.typesOfBusiness || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Description
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription || ""}
                  onChange={onChange}
                  rows="3"
                  style={textareaStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Location
                </label>
                <input
                  type="text"
                  name="businessLocation"
                  value={formData.businessLocation || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Location Status
                </label>
                <select
                  name="businessLocationStatus"
                  value={formData.businessLocationStatus || ""}
                  onChange={onChange}
                  style={selectStyle}
                >
                  <option value="">Select</option>
                  <option value="owned">Owned</option>
                  <option value="rented">Rented</option>
                  <option value="family">Family</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Working Capital
                </label>
                <input
                  type="text"
                  name="workingCapital"
                  value={formData.workingCapital || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Stock Value
                </label>
                <input
                  type="text"
                  name="stockValue"
                  value={formData.stockValue || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business GPS Address
                </label>
                <input
                  type="text"
                  name="businessGpsAddress"
                  value={formData.businessGpsAddress || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Years in Business
                </label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness || ""}
                  onChange={onChange}
                  min="0"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Business Landmark
                </label>
                <input
                  type="text"
                  name="businessLandmark"
                  value={formData.businessLandmark || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Minimum Sale
                </label>
                <input
                  type="text"
                  name="minimumSale"
                  value={formData.minimumSale || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Maximum Sale
                </label>
                <input
                  type="text"
                  name="maximumSale"
                  value={formData.maximumSale || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Step 2 buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="button"
                onClick={() => goToStep(1)}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                style={{
                  padding: "10px 24px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ===================== STEP 3: LOAN DETAILS ===================== */}
        {step === 3 && (
          <>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginTop: "0", marginBottom: "20px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              Loan Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Loan Amount *
                </label>
                <input
                  type="text"
                  name="loanAmount"
                  value={formData.loanAmount || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Loan Purpose *
                </label>
                <input
                  type="text"
                  name="loanPurpose"
                  value={formData.loanPurpose || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Loan Term (months) *
                </label>
                <input
                  type="number"
                  name="loanTerm"
                  value={formData.loanTerm || ""}
                  onChange={onChange}
                  required
                  min="1"
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Weekly Installment *
                </label>
                <input
                  type="text"
                  name="weeklyInstallment"
                  value={formData.weeklyInstallment || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Repayment Amount *
                </label>
                <input
                  type="text"
                  name="repaymentAmount"
                  value={formData.repaymentAmount || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Previous Loan Request
                </label>
                <input
                  type="text"
                  name="previousLoanRequest"
                  value={formData.previousLoanRequest || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Previous Loan Approved
                </label>
                <input
                  type="text"
                  name="previousLoanApproved"
                  value={formData.previousLoanApproved || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Expected Due Date *
                </label>
                <input
                  type="date"
                  name="expectedDueDate"
                  value={formData.expectedDueDate || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Actual Due Date
                </label>
                <input
                  type="date"
                  name="actualDueDate"
                  value={formData.actualDueDate || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Step 3 buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="button"
                onClick={() => goToStep(2)}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(4)}
                style={{
                  padding: "10px 24px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ===================== STEP 4: REFERENCE DETAILS ===================== */}
        {step === 4 && (
          <>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginTop: "0", marginBottom: "20px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              Reference Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Reference Name *
                </label>
                <input
                  type="text"
                  name="referenceName"
                  value={formData.referenceName || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Relationship *
                </label>
                <input
                  type="text"
                  name="referenceRelationship"
                  value={formData.referenceRelationship || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Location
                </label>
                <input
                  type="text"
                  name="referenceLocation"
                  value={formData.referenceLocation || ""}
                  onChange={onChange}
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Contact *
                </label>
                <input
                  type="tel"
                  name="referenceContact"
                  value={formData.referenceContact || ""}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Step 4 buttons: Back + Next (to Documents) */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="button"
                onClick={() => goToStep(3)}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(5)}
                style={{
                  padding: "10px 24px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ===================== STEP 5: DOCUMENT UPLOAD ===================== */}
        {step === 5 && (
          <>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginTop: "0", marginBottom: "20px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              Document Upload
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 12px 0" }}>
                Upload any supporting documents (e.g., ID, proof of address, business registration). You can add multiple files.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleAddDocuments}
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  background: "#eef2ff",
                  border: "1px dashed #6366f1",
                  borderRadius: "8px",
                  color: "#4338ca",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e0e7ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#eef2ff")
                }
              >
                <MdAttachFile size={18} /> Add Document
              </button>
            </div>

            {/* List of uploaded documents */}
            {documents.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                  Uploaded Files ({documents.length})
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {documents.map((doc, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#1e293b" }}>
                        {doc.name} <span style={{ color: "#94a3b8", fontSize: "12px" }}>({formatSize(doc.size)})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <MdClose size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 5 buttons: Back + Submit */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="button"
                onClick={() => goToStep(4)}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 24px",
                  background: "#6366f1",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                Submit Application
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default KYCForm;