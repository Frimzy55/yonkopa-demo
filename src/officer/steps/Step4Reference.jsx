import React from "react";

const Step4Reference = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
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
        Reference Details
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
            background:  "#3b82f6",
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

export default Step4Reference;