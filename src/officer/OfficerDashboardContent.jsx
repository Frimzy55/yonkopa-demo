import React from "react";
import {
  FaUserShield,
  FaClipboardCheck,
  FaTasks,
} from "react-icons/fa";

const OfficerDashboardContent = ({ 
  user, 
  isMobile, 
  applicationsCount = 0, 
  draftCount = 0 
}) => {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const cardStyle = {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    border: "1px solid #e2e8f0",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#f8fafc",
        padding: isMobile ? "20px 15px" : "30px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Welcome Banner – text is now blue */}
        <div
          style={{
            background: "linear-gradient(135deg, #bfdbfe, #a9caf0)", // lighter blue gradient
            color: "#6f90eb", // dark blue text
            borderRadius: "22px",
            padding: isMobile ? "24px" : "35px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 15px 40px rgba(37,99,235,0.15)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.8,
                fontSize: "14px",
                color: "#1e3a8a", // blue
              }}
            >
              {currentDate}
            </p>
            <h1
              style={{
                margin: "10px 0",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: "700",
                color: "#1e3a8a", // blue
              }}
            >
              Welcome, {user?.fullName || "Officer"}
            </h1>
            <p
              style={{
                margin: 0,
                opacity: 0.85,
                fontSize: "15px",
                color: "#1e3a8a", // blue
              }}
            >
              Manage customer requests, verify records, and complete assigned
              officer tasks from your dashboard.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.4)",
                padding: "8px 14px",
                borderRadius: "999px",
                marginTop: "18px",
                backdropFilter: "blur(8px)",
                color: "#1e3a8a",
              }}
            >
              <FaUserShield />
              <span style={{ textTransform: "capitalize" }}>
                {user?.role?.replace("_", " ") || "Officer"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginTop: "28px",
          }}
        >
          {/* Total Applications */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Total Applications
                </p>
                <h2 style={{ margin: "8px 0 0", color: "#0f172a", fontSize: "30px" }}>
                  {applicationsCount}
                </h2>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaClipboardCheck color="#2563eb" size={24} />
              </div>
            </div>
          </div>

          {/* Total Drafts */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Total Drafts
                </p>
                <h2 style={{ margin: "8px 0 0", color: "#0f172a", fontSize: "30px" }}>
                  {draftCount}
                </h2>
              </div>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTasks color="#0ea5e9" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Officer Portal • Secure Banking Dashboard
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboardContent;