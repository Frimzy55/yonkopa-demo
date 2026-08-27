// OfficerSentApplications.jsx
import React from "react";

/**
 * OfficerSentApplications – Placeholder for submitted KYC applications.
 * 
 * This component will later display all applications that have been
 * successfully submitted by the officer (fetched from the server).
 * Currently, it shows a placeholder message.
 */
const OfficerSentApplications = ({ user }) => {
  return (
    <div
      style={{
        padding: "40px 16px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
        color: "#64748b",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          marginBottom: "20px",
          opacity: 0.5,
        }}
      >
        📤
      </div>

      <h2
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#1e293b",
          margin: "0 0 12px",
        }}
      >
        Sent Applications
      </h2>

      <p style={{ fontSize: "16px", lineHeight: "1.6", margin: "0 0 8px" }}>
        All KYC applications that have been successfully submitted
        <br />
        will appear here.
      </p>

      <p
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          color: "#94a3b8",
          marginTop: "12px",
        }}
      >
        (You can later integrate this with your backend API to fetch submitted applications.)
      </p>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f1f5f9",
          borderRadius: "8px",
          fontSize: "13px",
          color: "#475569",
        }}
      >
        💡 For now, this is a placeholder.  
        <br />
        When you add a server endpoint like <code>/api/kyc/officer/submitted</code>,
        <br />
        you can display the list here.
      </div>
    </div>
  );
};

export default OfficerSentApplications;