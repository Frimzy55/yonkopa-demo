// OfficerSentApplications.jsx
import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/api";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/kyc`
  : "/api/kyc";

/**
 * OfficerSentApplications – Displays all submitted KYC applications.
 * Responsive: table on desktop, cards on mobile.
 * Features a prominent total count badge at the top.
 * Authenticated via JWT – only the logged‑in officer's data is shown.
 */
const OfficerSentApplications = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ─── Resize handler ──────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Fetch data using authenticated helper ──────────────────────
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        // No query parameters – the backend uses the JWT to get the officer's ID.
        const data = await fetchWithAuth('/api/kyc/officer/submitted');
        setApplications(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // No dependency on officerName – the token handles it.

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFullName = (app) => {
    const parts = [app.first_name, app.middle_name, app.surname].filter(Boolean);
    return parts.length ? parts.join(" ") : "—";
  };

  const getStatusBadge = (status) => {
    const base = {
      display: "inline-block",
      padding: "4px 14px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "capitalize",
      letterSpacing: "0.3px",
    };
    if (status === "verified") {
      return { ...base, background: "#dcfce7", color: "#166534" };
    }
    if (status === "rejected") {
      return { ...base, background: "#fee2e2", color: "#991b1b" };
    }
    return { ...base, background: "#fef9c3", color: "#854d0e" };
  };

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading submitted applications…</div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <strong>Error:</strong> {error}
          <br />
          <span style={{ fontSize: "14px" }}>
            Please try again later or contact support.
          </span>
        </div>
      </div>
    );
  }

  // ─── Empty ──────────────────────────────────────────────────────
  if (applications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <h2 style={styles.emptyTitle}>No Submitted Applications</h2>
          <p style={styles.emptyText}>
            You haven’t submitted any KYC applications yet.
            <br />
            Complete a new application and it will appear here.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* ─── Prominent Total Count ───────────────────────────────── */}
      <div style={styles.statsWrapper}>
        <div style={styles.statBox}>
          <span style={styles.statNumber}>{applications.length}</span>
          <span style={styles.statLabel}>Total Applications</span>
        </div>
        <div style={styles.statSub}>
          {user?.fullName || user?.name ? `Submitted by ${user.fullName || user.name}` : ""}
        </div>
      </div>

      {/* ─── Table / Cards ───────────────────────────────────────── */}
      {isMobile ? (
        // ─── Mobile: Card view ────────────────────────────────────
        <div style={styles.cardGrid}>
          {applications.map((app) => (
            <div key={app.step1_id || app.client_id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardClientId}>#{app.client_id || "—"}</span>
                <span style={getStatusBadge(app.security_verification_status)}>
                  {app.security_verification_status || "pending"}
                </span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Name</span>
                  <span style={styles.cardValue}>{getFullName(app)}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Phone</span>
                  <span style={styles.cardValue}>{app.phone || "—"}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Loan Amount</span>
                  <span style={styles.cardValue}>GHS {app.loan_amount || "—"}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Purpose</span>
                  <span style={styles.cardValue}>{app.loan_purpose || "—"}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Submitted</span>
                  <span style={styles.cardValue}>{formatDate(app.applicant_created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ─── Desktop: Table view ──────────────────────────────────
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Loan Amount (GHS)</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.step1_id || app.client_id} style={styles.tr}>
                  <td style={styles.td}>{app.client_id || "—"}</td>
                  <td style={styles.td}>{getFullName(app)}</td>
                  <td style={styles.td}>{app.phone || "—"}</td>
                  <td style={styles.td}>{app.loan_amount || "—"}</td>
                  <td style={styles.td}>{app.loan_purpose || "—"}</td>
                  <td style={styles.td}>{formatDate(app.applicant_created_at)}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadge(app.security_verification_status)}>
                      {app.security_verification_status || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  statsWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "24px",
    gap: "12px",
  },
  statBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#ffffff",
    padding: "12px 24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#64748b",
  },
  statSub: {
    fontSize: "14px",
    color: "#94a3b8",
    fontWeight: "500",
    padding: "4px 0",
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    minWidth: "700px",
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "600",
    color: "#334155",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    color: "#1e293b",
    verticalAlign: "middle",
  },
  tr: {
    transition: "background 0.15s",
  },
  cardGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f1f5f9",
  },
  cardClientId: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  cardLabel: {
    color: "#64748b",
    fontWeight: "500",
  },
  cardValue: {
    color: "#1e293b",
    fontWeight: "500",
    textAlign: "right",
    maxWidth: "60%",
    wordBreak: "break-word",
  },
  loading: {
    textAlign: "center",
    padding: "48px 0",
    color: "#64748b",
    fontSize: "16px",
  },
  error: {
    textAlign: "center",
    padding: "48px 0",
    color: "#b91c1c",
    background: "#fee2e2",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    fontSize: "16px",
  },
  empty: {
    textAlign: "center",
    padding: "48px 0",
    color: "#64748b",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px",
  },
  emptyText: {
    fontSize: "16px",
    lineHeight: "1.6",
    margin: 0,
  },
};

export default OfficerSentApplications;