import React from "react";
import {
  FaUserShield,
  FaTasks,
  FaClock,
  FaClipboardCheck,
  FaArrowRight,
} from "react-icons/fa";

const OfficerDashboardContent = ({ user, isMobile }) => {
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
        {/* Welcome Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #99b8fcd8, #92caffd8)",
            color: "#fff",
            borderRadius: "22px",
            padding: isMobile ? "24px" : "35px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 15px 40px rgba(37,99,235,0.25)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                opacity: 0.9,
                fontSize: "14px",
              }}
            >
              {currentDate}
            </p>

            <h1
              style={{
                margin: "10px 0",
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: "700",
              }}
            >
              Welcome, {user?.fullName || "Officer"}
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.95,
                fontSize: "15px",
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
                background: "rgba(255,255,255,0.15)",
                padding: "8px 14px",
                borderRadius: "999px",
                marginTop: "18px",
                backdropFilter: "blur(8px)",
              }}
            >
              <FaUserShield />
              <span style={{ textTransform: "capitalize" }}>
                {user?.role?.replace("_", " ") || "Officer"}
              </span>
            </div>
          </div>

          {/* ✅ FIXED AVATAR – stays a perfect circle */}
          {/* Avatar */}
          <div
            style={{
              width: isMobile ? "90px" : "120px",
              height: isMobile ? "90px" : "120px",
              minWidth: isMobile ? "90px" : "120px",
              minHeight: isMobile ? "90px" : "120px",
              maxWidth: isMobile ? "90px" : "120px",
              maxHeight: isMobile ? "90px" : "120px",
              flex: "0 0 auto",
              flexShrink: 0,
              boxSizing: "border-box",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "4px solid rgba(255,255,255,0.25)",
            }}
          >
            <FaUserShield
              style={{
                width: isMobile ? "38px" : "52px",
                height: isMobile ? "38px" : "52px",
                minWidth: isMobile ? "38px" : "52px",
                minHeight: isMobile ? "38px" : "52px",
                maxWidth: isMobile ? "38px" : "52px",
                maxHeight: isMobile ? "38px" : "52px",
                flex: "0 0 auto",
                display: "block",
              }}
            />
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
          {[
            {
              title: "Assigned Tasks",
              value: "--",
              icon: <FaTasks color="#2563eb" size={24} />,
            },
            {
              title: "Pending Reviews",
              value: "--",
              icon: <FaClipboardCheck color="#0ea5e9" size={24} />,
            },
            {
              title: "Today's Activity",
              value: "--",
              icon: <FaClock color="#14b8a6" size={24} />,
            },
          ].map((item, index) => (
            <div key={index} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    {item.title}
                  </p>

                  <h2
                    style={{
                      margin: "8px 0 0",
                      color: "#0f172a",
                      fontSize: "30px",
                    }}
                  >
                    {item.value}
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
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: "34px" }}>
          <h3
            style={{
              color: "#0f172a",
              marginBottom: "18px",
              fontSize: "20px",
            }}
          >
            Quick Actions
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                title: "Customer Verification",
                desc: "Review and verify customer information.",
              },
              {
                title: "Pending Approvals",
                desc: "Check applications awaiting officer action.",
              },
              {
                title: "Officer Reports",
                desc: "View today's work summary and reports.",
              },
            ].map((action, index) => (
              <div
                key={index}
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 35px rgba(15,23,42,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(15,23,42,0.08)";
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px",
                    color: "#0f172a",
                  }}
                >
                  {action.title}
                </h4>

                <p
                  style={{
                    color: "#64748b",
                    marginBottom: "18px",
                    fontSize: "14px",
                  }}
                >
                  {action.desc}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#95b3f5",
                    fontWeight: "600",
                  }}
                >
                  Open <FaArrowRight size={12} />
                </div>
              </div>
            ))}
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
