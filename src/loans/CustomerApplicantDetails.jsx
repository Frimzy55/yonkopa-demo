// src/pages/CustomerDashboard/ApplicantDetails.jsx
import React from "react";

const ApplicantDetails = ({ formData }) => {
  // Helper to check if a value is actually present
  const hasValue = (value) =>
    value !== null && value !== undefined && value !== "" && value !== "—";

  return (
    <div className="form-step">
      <h3 className="mb-3">Applicant Details</h3>

      {/* Instruction Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          marginBottom: "24px",
          background: "linear-gradient(90deg, #e9f7ff, #f8fbff)",
          border: "1px solid #cfe8ff",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "#0d6efd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          →
        </div>
        <div>
          <div style={{ fontWeight: "600", color: "#0d6efd" }}>Next Step</div>
          <div style={{ fontSize: "14px", color: "#333" }}>
            Click on the Next button to continue to{" "}
            <strong>Loan Details / Guarantor / MOMO</strong>
          </div>
        </div>
      </div>

      {/* Applicant Details Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px 30px",
          }}
        >
          {/* Full Name */}
          {hasValue(formData.fullName) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.fullName}
              </div>
            </div>
          )}



           {hasValue(formData.customerId) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Customer ID
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.customerId}
              </div>
            </div>
          )}


          {/* Phone */}
          {hasValue(formData.phone) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Phone Number
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.phone}
              </div>
            </div>
          )}

          {/* Email */}
          {hasValue(formData.email) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Email Address
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.email}
              </div>
            </div>
          )}

          {/* Date of Birth */}
          {hasValue(formData.dateofbirth) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Date of Birth
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.dateofbirth}
              </div>
            </div>
          )}

          {/* Gender */}
          {hasValue(formData.gender) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Gender
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.gender}
              </div>
            </div>
          )}

          {/* National ID */}
          {hasValue(formData.nationalid) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                National ID
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.nationalid}
              </div>
            </div>
          )}

         

          {/* Marital Status */}
          {hasValue(formData.maritalstatus) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Marital Status
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.maritalstatus}
              </div>
            </div>
          )}

          {/* Dependents */}
          {hasValue(formData.dependents) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Dependents
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.dependents}
              </div>
            </div>
          )}

          {/* Residential Address */}
          {hasValue(formData.residentialAddress) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Residential Address
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.residentialAddress}
              </div>
            </div>
          )}

          {/* Residential GPS */}
          {hasValue(formData.residentialGPS) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Residential GPS
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.residentialGPS}
              </div>
            </div>
          )}

          {/* Employment Status */}
          {hasValue(formData.employmentStatus) && (
            <div>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666", display: "block", marginBottom: "4px" }}>
                Employment Status
              </label>
              <div style={{ fontSize: "1rem", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                {formData.employmentStatus}
              </div>
            </div>
          )}

          {/* Hidden fields – always present for form submission */}
          <input type="hidden" name="userId" value={formData.userId} />
          <input type="hidden" name="kycCode" value={formData.kycCode} />
          {/* If you need to submit customerId as well, uncomment the next line */}
          {/* <input type="hidden" name="customerId" value={formData.customerId} /> */}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetails;