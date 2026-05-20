// src/pages/CustomerDashboard/ApplicantDetails.jsx
import React from "react";

const ApplicantDetails = ({ formData }) => {
  return (
    <div className="form-step">
      <h3 className="mb-3">Applicant Details</h3>

      {/* ✅ Professional instruction banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 16px",
          marginBottom: "18px",
          background: "linear-gradient(90deg, #e9f7ff, #f8fbff)",
          border: "1px solid #cfe8ff",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Icon */}
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

        {/* Text */}
        <div>
          <div style={{ fontWeight: "600", color: "#0d6efd" }}>
            Next Step
          </div>
          <div style={{ fontSize: "14px", color: "#333" }}>
            Click on the Next button to continue to{" "}
            <strong>Loan Details / Guarantor / MOMO</strong>
          </div>
        </div>
      </div>

      {/* ❌ HIDDEN DETAILS SECTION */}
      <div style={{ display: "none" }}>
        <input name="user id" value={formData.userId} readOnly />

        <input
          name="kycCode"
          value={formData.kycCode}
          readOnly
          placeholder="KYC Code"
        />

        <div className="form-grid">
          <input name="fullName" value={formData.fullName} readOnly />
          <input name="phone" value={formData.phone} readOnly />
          <input name="email" value={formData.email} readOnly />

          <input
            type="date"
            name="dob"
            value={formData.dateofbirth || ""}
            readOnly
          />

          <select name="gender" value={formData.gender} readOnly>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input name="nationalId" value={formData.nationalid} readOnly />
          <input
            name="maritalstatus"
            value={formData.maritalstatus || ""}
            readOnly
          />
          <input name="dependents" value={formData.dependents} readOnly />
          <input
            name="residentialAddress"
            value={formData.residentialAddress}
            readOnly
          />
          <input
            name="residentialGPS"
            value={formData.residentialGPS}
            readOnly
          />
          <input
            name="employmentStatus"
            value={formData.employmentStatus}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetails;