import React from "react";

const Step2Business = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
  selectStyle,
  textareaStyle,
  focusStyle,
  blurStyle,
  onBack,
  onNext,
}) => {
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
        Business & Personal Expenses
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* --- TEXT / SELECT FIELDS (first) --- */}

        {/* Business Name */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        {/* Business Sector */}
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

        {/* Types of Business */}
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

        {/* Business Description - full width */}
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

        {/* Business Location */}
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

        {/* Business GPS Address */}
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

        {/* Business Landmark */}
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

        {/* Business Location Status (select) */}
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

        {/* --- NUMERIC / FINANCIAL FIELDS (last) --- */}

        {/* Working Capital */}
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

        {/* Stock Value */}
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

        {/* Years in Business */}
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

        {/* Minimum Sale */}
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

        {/* Maximum Sale */}
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

      {/* Navigation Buttons */}
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

export default Step2Business;