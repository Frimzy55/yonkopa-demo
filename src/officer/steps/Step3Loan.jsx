import React, { useState, useRef } from "react";
import { MdAttachFile, MdCheck, MdCancel, MdEdit, MdClose } from "react-icons/md";

// Helper to format file size
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const Step3Loan = ({
  formData,
  onChange,
  onFileChange,
  isMobile,
  inputStyle,
  selectStyle,
  focusStyle,
  blurStyle,
  onBack,
  onNext,
  // New props for multi‑file management
  collateralPhotos = [],
  ownershipDocuments = [],
  onCollateralPhotosChange,
  onOwnershipDocumentsChange,
}) => {
  // Local state for editing file names
  const [collateralEditingIndex, setCollateralEditingIndex] = useState(null);
  const [collateralEditName, setCollateralEditName] = useState("");
  const [ownershipEditingIndex, setOwnershipEditingIndex] = useState(null);
  const [ownershipEditName, setOwnershipEditName] = useState("");

  // Refs for hidden file inputs
  const collateralFileInputRef = useRef(null);
  const ownershipFileInputRef = useRef(null);

  // --- Handlers for Collateral Photos ---
  const handleAddCollateralPhotos = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      file, // keep the actual File object
    }));
    onCollateralPhotosChange && onCollateralPhotosChange([...collateralPhotos, ...newFiles]);
    e.target.value = null; // reset input
  };

  const removeCollateralPhoto = (index) => {
    const updated = collateralPhotos.filter((_, i) => i !== index);
    onCollateralPhotosChange && onCollateralPhotosChange(updated);
    if (collateralEditingIndex === index) {
      setCollateralEditingIndex(null);
      setCollateralEditName("");
    }
  };

  const startCollateralEdit = (index) => {
    setCollateralEditingIndex(index);
    setCollateralEditName(collateralPhotos[index].name);
  };

  const saveCollateralEdit = () => {
    if (collateralEditingIndex !== null && collateralEditName.trim()) {
      const updated = collateralPhotos.map((doc, i) =>
        i === collateralEditingIndex ? { ...doc, name: collateralEditName.trim() } : doc
      );
      onCollateralPhotosChange && onCollateralPhotosChange(updated);
    }
    cancelCollateralEdit();
  };

  const cancelCollateralEdit = () => {
    setCollateralEditingIndex(null);
    setCollateralEditName("");
  };

  const handleCollateralKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveCollateralEdit();
    } else if (e.key === "Escape") {
      cancelCollateralEdit();
    }
  };

  // --- Handlers for Ownership Documents ---
  const handleAddOwnershipDocuments = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      file,
    }));
    onOwnershipDocumentsChange && onOwnershipDocumentsChange([...ownershipDocuments, ...newFiles]);
    e.target.value = null;
  };

  const removeOwnershipDocument = (index) => {
    const updated = ownershipDocuments.filter((_, i) => i !== index);
    onOwnershipDocumentsChange && onOwnershipDocumentsChange(updated);
    if (ownershipEditingIndex === index) {
      setOwnershipEditingIndex(null);
      setOwnershipEditName("");
    }
  };

  const startOwnershipEdit = (index) => {
    setOwnershipEditingIndex(index);
    setOwnershipEditName(ownershipDocuments[index].name);
  };

  const saveOwnershipEdit = () => {
    if (ownershipEditingIndex !== null && ownershipEditName.trim()) {
      const updated = ownershipDocuments.map((doc, i) =>
        i === ownershipEditingIndex ? { ...doc, name: ownershipEditName.trim() } : doc
      );
      onOwnershipDocumentsChange && onOwnershipDocumentsChange(updated);
    }
    cancelOwnershipEdit();
  };

  const cancelOwnershipEdit = () => {
    setOwnershipEditingIndex(null);
    setOwnershipEditName("");
  };

  const handleOwnershipKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveOwnershipEdit();
    } else if (e.key === "Escape") {
      cancelOwnershipEdit();
    }
  };

  return (
    <>
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
        Loan Details
      </h3>

      {/* --- Existing Loan Details Fields --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
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
            No. Of instalments *
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
            Instalment amount *
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
            Actual payment date
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

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Repayment Frequency *
          </label>
          <select
            name="repaymentFrequency"
            value={formData.repaymentFrequency || ""}
            onChange={onChange}
            style={selectStyle}
            required
          >
            <option value="">Select</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Loan Balance *
          </label>
          <input
            type="text"
            name="existingLoanBalance"
            value={formData.existingLoanBalance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Why does the client need the loan now? *
          </label>
          <input
            type="text"
            name="loanNeedReason"
            value={formData.loanNeedReason || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What will happen if the requested amount is not approved? *
          </label>
          <input
            type="text"
            name="whatIfNotApproved"
            value={formData.whatIfNotApproved || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Amount client believes they can comfortably repay per week/month *
          </label>
          <input
            type="text"
            name="comfortableRepayment"
            value={formData.comfortableRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Debt Repayment *
          </label>
          <input
            type="text"
            name="existingDebtRepayment"
            value={formData.existingDebtRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- COLLATERAL / SECURITY --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Collateral / Security
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Security Type
          </label>
          <select
            name="securityType"
            value={formData.securityType || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="vehicle">Vehicle</option>
            <option value="land">Land</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Description
          </label>
          <input
            type="text"
            name="securityDescription"
            value={formData.securityDescription || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Owner
          </label>
          <input
            type="text"
            name="securityOwner"
            value={formData.securityOwner || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Purchase Date
          </label>
          <input
            type="date"
            name="securityPurchaseDate"
            value={formData.securityPurchaseDate || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Estimated Market Value
          </label>
          <input
            type="text"
            name="securityMarketValue"
            value={formData.securityMarketValue || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Forced Sale Value
          </label>
          <input
            type="text"
            name="securityForcedSaleValue"
            value={formData.securityForcedSaleValue || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Serial / Chassis
          </label>
          <input
            type="text"
            name="securitySerial"
            value={formData.securitySerial || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Registration Number
          </label>
          <input
            type="text"
            name="securityRegistration"
            value={formData.securityRegistration || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* --- ASSET PHOTO (multi-file UI) --- */}
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Asset Photos
          </label>
          <div style={{ marginBottom: "8px" }}>
            <input
              ref={collateralFileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddCollateralPhotos}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => collateralFileInputRef.current.click()}
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
            >
              <MdAttachFile size={18} /> Add Asset Photo(s)
            </button>
            <small style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "12px" }}>
              Upload photo(s) of collateral
            </small>
          </div>

          {collateralPhotos.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {collateralPhotos.map((doc, index) => (
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
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                      {collateralEditingIndex === index ? (
                        <>
                          <input
                            type="text"
                            value={collateralEditName}
                            onChange={(e) => setCollateralEditName(e.target.value)}
                            onKeyDown={handleCollateralKeyDown}
                            onBlur={saveCollateralEdit}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: "4px 8px",
                              border: "1px solid #6366f1",
                              borderRadius: "4px",
                              fontSize: "14px",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={saveCollateralEdit}
                            style={{ background: "transparent", border: "none", color: "#22c55e", cursor: "pointer", padding: "4px" }}
                          >
                            <MdCheck size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelCollateralEdit}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                          >
                            <MdCancel size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "14px", color: "#1e293b" }}>
                            {doc.name}{" "}
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                              ({formatSize(doc.size)})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => startCollateralEdit(index)}
                            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                          >
                            <MdEdit size={16} />
                          </button>
                        </>
                      )}
                    </div>
                    {collateralEditingIndex !== index && (
                      <button
                        type="button"
                        onClick={() => removeCollateralPhoto(index)}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        <MdClose size={18} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* --- OWNERSHIP DOCUMENTATION (multi-file UI) --- */}
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Ownership Documentation
          </label>
          <div style={{ marginBottom: "8px" }}>
            <input
              ref={ownershipFileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.docx"
              onChange={handleAddOwnershipDocuments}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => ownershipFileInputRef.current.click()}
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
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
            >
              <MdAttachFile size={18} /> Add Ownership Document(s)
            </button>
            <small style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "12px" }}>
              PDF, JPG, PNG, DOCX
            </small>
          </div>

          {ownershipDocuments.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {ownershipDocuments.map((doc, index) => (
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
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                      {ownershipEditingIndex === index ? (
                        <>
                          <input
                            type="text"
                            value={ownershipEditName}
                            onChange={(e) => setOwnershipEditName(e.target.value)}
                            onKeyDown={handleOwnershipKeyDown}
                            onBlur={saveOwnershipEdit}
                            autoFocus
                            style={{
                              flex: 1,
                              padding: "4px 8px",
                              border: "1px solid #6366f1",
                              borderRadius: "4px",
                              fontSize: "14px",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={saveOwnershipEdit}
                            style={{ background: "transparent", border: "none", color: "#22c55e", cursor: "pointer", padding: "4px" }}
                          >
                            <MdCheck size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelOwnershipEdit}
                            style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                          >
                            <MdCancel size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "14px", color: "#1e293b" }}>
                            {doc.name}{" "}
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                              ({formatSize(doc.size)})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() => startOwnershipEdit(index)}
                            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                          >
                            <MdEdit size={16} />
                          </button>
                        </>
                      )}
                    </div>
                    {ownershipEditingIndex !== index && (
                      <button
                        type="button"
                        onClick={() => removeOwnershipDocument(index)}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                      >
                        <MdClose size={18} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Verification Status
          </label>
          <select
            name="securityVerificationStatus"
            value={formData.securityVerificationStatus || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Encumbrances
          </label>
          <input
            type="text"
            name="securityEncumbrances"
            value={formData.securityEncumbrances || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- LOAN OFFICER ASSESSMENT --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Loan Officer Assessment
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Previous Repayment Behaviour
          </label>
          <input
            type="text"
            name="prevRepaymentBehaviour"
            value={formData.prevRepaymentBehaviour || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Total Amount Borrowed
          </label>
          <input
            type="text"
            name="totalBorrowed"
            value={formData.totalBorrowed || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Loan Cycle Completed
          </label>
          <input
            type="number"
            name="loanCycleCompleted"
            value={formData.loanCycleCompleted || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Maximum Past Due Days
          </label>
          <input
            type="number"
            name="maxPastDueDays"
            value={formData.maxPastDueDays || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Missed Instalments
          </label>
          <input
            type="number"
            name="missedInstalments"
            value={formData.missedInstalments || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Total Arrears
          </label>
          <input
            type="text"
            name="totalArrears"
            value={formData.totalArrears || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Write‑off Loans
          </label>
          <input
            type="number"
            name="writeOffLoans"
            value={formData.writeOffLoans || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Extensions
          </label>
          <input
            type="number"
            name="extensions"
            value={formData.extensions || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Pay‑off
          </label>
          <input
            type="number"
            name="numberOfPayOff"
            value={formData.numberOfPayOff || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Current Outstanding Balance
          </label>
          <input
            type="text"
            name="currentOutstandingBalance"
            value={formData.currentOutstandingBalance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Average Repayment Performance
          </label>
          <input
            type="text"
            name="avgRepaymentPerformance"
            value={formData.avgRepaymentPerformance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- BUSINESS --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Business
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Did you physically visit the business?
          </label>
          <select
            name="visitBusiness"
            value={formData.visitBusiness || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Is business currently operating?
          </label>
          <select
            name="businessOperating"
            value={formData.businessOperating || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Did you observe active correspondence with reported sales?
          </label>
          <select
            name="observedSalesCorrespondence"
            value={formData.observedSalesCorrespondence || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Estimated Daily Customer Volume
          </label>
          <input
            type="text"
            name="dailyCustomerVolume"
            value={formData.dailyCustomerVolume || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Key Risk Observed
          </label>
          <input
            type="text"
            name="keyRiskObserved"
            value={formData.keyRiskObserved || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- CHARACTER --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Character
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            How long have you known the client?
          </label>
          <input
            type="text"
            name="knownClientSince"
            value={formData.knownClientSince || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Any adverse information?
          </label>
          <input
            type="text"
            name="adverseInfo"
            value={formData.adverseInfo || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Any previous repayment concerns?
          </label>
          <input
            type="text"
            name="repaymentConcerns"
            value={formData.repaymentConcerns || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- CAPACITY --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Capacity
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What is the officer's verified estimated monthly income?
          </label>
          <input
            type="text"
            name="verifiedMonthlyIncome"
            value={formData.verifiedMonthlyIncome || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What repayment amount can the client reasonably pay?
          </label>
          <input
            type="text"
            name="reasonableRepayment"
            value={formData.reasonableRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- RECOMMENDATION --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Recommendation
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Amount Recommended
          </label>
          <input
            type="text"
            name="recommendedAmount"
            value={formData.recommendedAmount || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Term (months)
          </label>
          <input
            type="number"
            name="recommendedTerm"
            value={formData.recommendedTerm || ""}
            onChange={onChange}
            min="1"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Reason for Recommendation
          </label>
          <input
            type="text"
            name="recommendationReason"
            value={formData.recommendationReason || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
        <button
          type="button"
          onClick={onBack}
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
          onClick={onNext}
          style={{
            padding: "10px 24px",
            background: "#3b82f6",
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
  );
};

export default Step3Loan;