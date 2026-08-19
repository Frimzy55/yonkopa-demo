import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdAssignment,
  MdPeople,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdSearch,
  MdNotificationsNone,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
} from "react-icons/md";

import logo from "../image/yonko1.jpeg";
import OfficerApplications from "./OfficerApplications";
import OfficerDashboardContent from "./OfficerDashboardContent";

const Officerdasboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activePage, setActivePage] = useState("dashboard");

  // ============================================================
  // LOAD USER + WINDOW RESIZE
  // ============================================================
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/officer-access");
      }
    } else {
      navigate("/officer-access");
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [navigate]);

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/officer-access");
  };

  // ============================================================
  // RESPONSIVE
  // ============================================================
  const isMobile = windowWidth < 768;

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // ============================================================
  // PAGE CONTENT
  // ============================================================
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <OfficerDashboardContent user={user} isMobile={isMobile} />;
      case "applications":
        return <OfficerApplications />;
      // Clients, Reports, Settings are still available if needed,
      // but no longer in the sidebar.
      case "clients":
        return (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748b" }}>
            <h2>Clients</h2>
            <p>Coming soon…</p>
          </div>
        );
      case "reports":
        return (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748b" }}>
            <h2>Reports</h2>
            <p>Coming soon…</p>
          </div>
        );
      case "settings":
        return (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#64748b" }}>
            <h2>Settings</h2>
            <p>Coming soon…</p>
          </div>
        );
      default:
        return null;
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#64748b",
        }}
      >
        Loading...
      </div>
    );
  }

  // ============================================================
  // MAIN LAYOUT
  // ============================================================
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {/* ========================================================
          MOBILE SIDEBAR OVERLAY
      ======================================================== */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={closeSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}
      <aside
        style={{
          width: "250px",
          minWidth: "250px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 1000,
          transition: "transform 0.3s ease",
          transform:
            isMobile && !isSidebarOpen
              ? "translateX(-100%)"
              : "translateX(0)",
          boxSizing: "border-box",
        }}
      >
        {/* ======================================================
            MOBILE CLOSE BUTTON
        ====================================================== */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              fontSize: "24px",
              color: "#64748b",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdClose />
          </button>
        )}

        {/* ======================================================
            LOGO
        ====================================================== */}
        <div
          style={{
            padding: "0 24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src={logo}
              alt="Yonkopa"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Yonkopa
            </span>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              margin: "4px 0 0 0",
              paddingLeft: "4px",
            }}
          >
            Officer Portal
          </p>
        </div>

        {/* ======================================================
            NAVIGATION – only Dashboard & Applications remain
        ====================================================== */}
        <nav
          style={{
            flex: 1,
          }}
        >
          <NavItem
            icon={<MdDashboard />}
            label="Dashboard"
            active={activePage === "dashboard"}
            onClick={() => {
              setActivePage("dashboard");
              closeSidebar();
            }}
          />
          <NavItem
            icon={<MdAssignment />}
            label="Applications"
            active={activePage === "applications"}
            onClick={() => {
              setActivePage("applications");
              closeSidebar();
            }}
          />
          {/* Clients, Reports, Settings have been removed from the sidebar */}
        </nav>

        {/* ======================================================
            LOGOUT
        ====================================================== */}
        <div
          style={{
            padding: "0 16px",
            marginTop: "auto",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#64748b",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN AREA
      ======================================================== */}
      <div
        style={{
          marginLeft: isMobile ? 0 : "250px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          minHeight: 0,
          width: isMobile ? "100%" : "calc(100% - 250px)",
          overflow: "hidden",
        }}
      >
        {/* ======================================================
            FIXED TOP BAR
        ====================================================== */}
        <header
          style={{
            background: "#e0f2fe",
            borderBottom: "1px solid #7fd0fc",
            padding: "0 16px",
            height: "64px",
            minHeight: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 500,
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            boxSizing: "border-box",
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  color: "#1e293b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <MdMenu />
              </button>
            )}
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
                margin: 0,
              }}
            >
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "applications"
                ? "Applications"
                : "Dashboard"}
            </h2>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              <MdSearch />
            </button>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                position: "relative",
                padding: "4px",
              }}
            >
              <MdNotificationsNone />
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </span>
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "4px 8px 4px 4px",
                borderRadius: "30px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4338ca",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || "O"}
              </div>
              {!isMobile && (
                <>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1e293b",
                    }}
                  >
                    {user?.fullName || "Officer"}
                  </span>
                  <MdKeyboardArrowDown size={20} color="#94a3b8" />
                </>
              )}
            </div>
          </div>
        </header>

        {/* ======================================================
            SCROLLABLE CONTENT AREA
        ====================================================== */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// ============================================================
// NAVIGATION ITEM COMPONENT
// ============================================================
const NavItem = ({
  icon,
  label,
  active = false,
  onClick = null,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 24px",
        margin: "2px 8px",
        borderRadius: "10px",
        background: active ? "#83a0ff" : "transparent",
        color: active ? "#4338ca" : "#64748b",
        fontWeight: active ? "600" : "500",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#f1f5f9";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span
        style={{
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "14px",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default Officerdasboard;