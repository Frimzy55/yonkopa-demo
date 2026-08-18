import React from "react";

const Step8LoanHistory = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
  textareaStyle,
  focusStyle,
  blurStyle,
  onBack,
}) => {
  return (
    <>
      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginTop: "0", marginBottom: "20px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
        Loan History
      </h3>

      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
        Please provide details about any previous loans you have taken.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Have you taken any loan before? <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            name="hasPreviousLoan"
            value={formData.hasPreviousLoan || ""}
            onChange={onChange}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
            }}
            onFocus={focusStyle}
            onBlur={blurStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {formData.hasPreviousLoan === "yes" && (
          <>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                Total Amount Borrowed <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="previousLoanAmount"
                value={formData.previousLoanAmount || ""}
                onChange={onChange}
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                placeholder="e.g., 10,000"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                Outstanding Balance <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="previousLoanOutstanding"
                value={formData.previousLoanOutstanding || ""}
                onChange={onChange}
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                placeholder="e.g., 2,500"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                Loan Status <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="previousLoanStatus"
                value={formData.previousLoanStatus || ""}
                onChange={onChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              >
                <option value="">Select</option>
                <option value="fully-paid">Fully Paid</option>
                <option value="partially-paid">Partially Paid</option>
                <option value="defaulted">Defaulted</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
            <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                Additional Information
              </label>
              <textarea
                name="previousLoanAdditionalInfo"
                value={formData.previousLoanAdditionalInfo || ""}
                onChange={onChange}
                rows="3"
                style={textareaStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
                placeholder="Provide any extra details about your loan history..."
              />
            </div>
          </>
        )}
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
  );
};

export default Step8LoanHistory;