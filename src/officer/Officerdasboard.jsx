// Officerdasboard.jsx (fully updated with draft count filter and fetchWithAuth)
import React, { useState, useEffect, useCallback } from "react";
import {
  MdDashboard,
  MdAssignment,
  MdLogout,
  MdPendingActions,
  MdDescription,
  MdMenu,
  MdClose,
  MdNotificationsNone,
  MdSend,
  MdPeople,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import logo from "../image/yonko1.jpeg";
import OfficerApplications from "./OfficerApplications";
import OfficerDashboardContent from "./OfficerDashboardContent";
import OfficerDrafts from "./OfficerDrafts";
import KYCForm from "./KYCForm";
import { getAllDraftsFromIndexedDB } from "../utils/draftStorage";
import OfficerSentApplications from "./OfficerSentApplications";
import OfficerConnect from "./OfficerConnect";

// 👇 Import the auth helper
import { fetchWithAuth } from "../utils/api";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/kyc`
  : "/api/kyc";

const Officerdasboard = () => {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [selectedDraftUuid, setSelectedDraftUuid] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [draftCount, setDraftCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);

  // ─── Fetch submitted applications count (authenticated) ──────
  const fetchApplicationsCount = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/api/kyc/officer/submitted');
      setApplicationsCount(data.length);
    } catch (err) {
      console.error("Error fetching applications count:", err);
    }
  }, []);

  // ─── Refresh draft count (filtered by officer) ──────────────
  const refreshDraftCount = useCallback(async () => {
    try {
      const allDrafts = await getAllDraftsFromIndexedDB();
      const officerId = user?.userId || user?.id;
      // Filter drafts belonging to this officer
      const myDrafts = officerId
        ? allDrafts.filter((draft) => draft.officerId === officerId)
        : [];
      setDraftCount(myDrafts.length);
    } catch (err) {
      console.error("Error fetching local draft count:", err);
    }
  }, [user]);

  // ─── Authentication check & initial data ─────────────────────
  useEffect(() => {
    if (!user) {
      navigate("/officer-access", { replace: true });
    } else {
      refreshDraftCount();
      fetchApplicationsCount();
    }
  }, [user, navigate, refreshDraftCount, fetchApplicationsCount]);

  // ─── Window resize ─────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Prevent body scroll ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const isMobile = windowWidth < 768;

  // ─── Helpers ────────────────────────────────────────────────────
  const getFullName = (user) => {
    if (!user) return "Officer";
    if (user.full_name) return user.full_name;
    if (user.fullName) return user.fullName;
    if (user.name) return user.name;
    if (user.first_name && user.last_name)
      return `${user.first_name} ${user.last_name}`;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return "Officer";
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "Officer";
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || "Officer";
  };

  const getInitials = (firstName) => {
    if (!firstName) return "O";
    return firstName.substring(0, 2).toUpperCase() || "O";
  };

  const fullName = getFullName(user);
  const firstName = getFirstName(fullName);
  const loginName = user?.username || user?.email || fullName;
  const userInitials = getInitials(firstName);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("offlineMode");
    sessionStorage.removeItem("loginRoute");
    navigate("/officer-access", {
      replace: true,
      state: { message: "You have been logged out." },
    });
  };

  const handleViewDraft = (draftUuid) => {
    if (!draftUuid) {
      console.error("Cannot open draft: draftUuid is missing");
      return;
    }
    setSelectedDraftUuid(draftUuid);
    setActivePage("kyc");
    if (isMobile) setSidebarOpen(false);
  };

  const handleBackFromKyc = () => {
    setSelectedDraftUuid(null);
    setActivePage("draft");
    refreshDraftCount();
    if (isMobile) setSidebarOpen(false);
  };

  const handleDraftDeleted = () => {
    refreshDraftCount();
  };

  // ─── Render page content ──────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <OfficerDashboardContent
            user={user}
            isMobile={isMobile}
            applicationsCount={applicationsCount}
            draftCount={draftCount}
          />
        );

      case "applications":
        return <OfficerApplications user={user} />;

      case "pendingResubmission":
        return (
          <div
            style={{
              padding: "40px 16px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <h2>Pending Resubmission</h2>
            <p>Clients awaiting resubmission will appear here.</p>
          </div>
        );

      case "sentApplications":
        return <OfficerSentApplications user={user} />;

      case "draft":
        return (
          <OfficerDrafts
            user={user}
            onViewDraft={handleViewDraft}
            onDraftDeleted={handleDraftDeleted}
          />
        );

      case "connect":
        return <OfficerConnect user={user} />;

      case "kyc":
        if (!selectedDraftUuid) {
          return (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <h2>No Draft Selected</h2>
              <p>Please return to Drafts and select a draft to continue.</p>
              <button
                type="button"
                onClick={() => setActivePage("draft")}
                style={{
                  marginTop: "16px",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#3b82f6",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Back to Drafts
              </button>
            </div>
          );
        }

        return (
          <KYCForm
            userId={user?.userId || user?.id}
            draftUuid={selectedDraftUuid}
            onCancel={handleBackFromKyc}
            officerFullName={fullName}
          />
        );

      default:
        return <OfficerDashboardContent user={user} isMobile={isMobile} />;
    }
  };

  const pageTitle =
    activePage === "dashboard"
      ? "Dashboard"
      : activePage === "applications"
      ? "Applications"
      : activePage === "pendingResubmission"
      ? "Pending Resubmission"
      : activePage === "sentApplications"
      ? "Sent Applications"
      : activePage === "draft"
      ? "Drafts"
      : activePage === "connect"
      ? "Officer's Connect"
      : activePage === "kyc"
      ? "Continue KYC"
      : "Dashboard";

  // ─── Menu items ──────────────────────────────────────────────────
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard /> },
    { id: "applications", label: "Applications", icon: <MdAssignment /> },
    {
      id: "pendingResubmission",
      label: "Pending Resubmission",
      icon: <MdPendingActions />,
    },
    { id: "sentApplications", label: "Sent Applications", icon: <MdSend /> },
    { id: "draft", label: `Drafts (${draftCount})`, icon: <MdDescription /> },
    { id: "connect", label: "Officer's Connect", icon: <MdPeople /> },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  // ─── Render layout ──────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {isMobile && sidebarOpen && (
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

      <aside
        style={{
          width: "250px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          height: "100vh",
          zIndex: 1000,
          transition: "transform 0.3s ease",
          transform:
            isMobile && !sidebarOpen
              ? "translateX(-100%)"
              : "translateX(0)",
          boxShadow:
            isMobile && sidebarOpen
              ? "0 0 20px rgba(0,0,0,0.1)"
              : "none",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src={logo}
              alt="Yonkopa"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Yonkopa
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                Officer Portal
              </p>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={closeSidebar}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <MdClose />
            </button>
          )}
        </div>

        <nav
          style={{
            padding: "20px 12px",
            flex: 1,
          }}
        >
          {menuItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id !== "kyc") {
                    setSelectedDraftUuid(null);
                  }

                  setActivePage(item.id);

                  if (isMobile) {
                    closeSidebar();
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  marginBottom: "6px",
                  border: "none",
                  borderRadius: "8px",
                  background: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#2563eb" : "#64748b",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "500",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    fontSize: "20px",
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              border: "none",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "250px",
          minWidth: 0,
          width: isMobile ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <header
          style={{
            height: "72px",
            background: "#e0f2fe",
            borderBottom: "1px solid #7fd0fc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 50,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MdMenu />
              </button>
            )}

            <img
              src={logo}
              alt="Yonkopa"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                objectFit: "cover",
              }}
            />

            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
                margin: 0,
              }}
            >
              {pageTitle}
            </h2>
          </div>

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
                color: "#1e293b",
                fontSize: "22px",
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
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "10px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                0
              </span>
            </button>

            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563eb",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              {userInitials}
            </div>

            <div
              style={{
                lineHeight: "1.3",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                {firstName}
              </div>

              {!isMobile && loginName !== firstName && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  {loginName}
                </div>
              )}
            </div>
          </div>
        </header>

        <section
          style={{
            flex: 1,
            padding: "24px",
            background: "#f8fafc",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {renderPage()}
        </section>
      </main>
    </div>
  );
};

export default Officerdasboard;