// OfficerDrafts.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  MdRefresh,
  MdDeleteOutline,
  MdVisibility,
  MdClose,
} from "react-icons/md";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/kyc`
  : "/api/kyc";

const OfficerDrafts = ({ user, onViewDraft, onDraftDeleted }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ─── Modal state ──────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/officer/drafts`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch drafts");
      }
      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (err) {
      console.error("Fetch drafts error:", err);
      setError(err.message || "Could not load drafts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // ─── Open delete confirmation modal ──────────────────────────
  const confirmDelete = (draftUuid) => {
    setDraftToDelete(draftUuid);
    setShowDeleteModal(true);
  };

  // ─── Execute delete ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!draftToDelete) return;
    setActionLoading(draftToDelete);
    setShowDeleteModal(false);
    try {
      const token = localStorage.getItem("token");
      const userId = user?.userId || user?.id;
      if (!userId) {
        alert("User ID not found. Please log in again.");
        setActionLoading(null);
        setDraftToDelete(null);
        return;
      }

      const response = await fetch(
        `${API_BASE}/client/draft/${draftToDelete}?userId=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Delete failed");
      }

      // Remove from UI
      setDrafts((prev) => prev.filter((d) => d.draftUuid !== draftToDelete));
      // Notify parent to update sidebar count
      if (onDraftDeleted) onDraftDeleted();
    } catch (err) {
      console.error("Delete draft error:", err);
      alert(err.message || "Could not delete draft");
    } finally {
      setActionLoading(null);
      setDraftToDelete(null);
    }
  };

  const handleView = (draft) => {
    if (onViewDraft) {
      onViewDraft(draft);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getFullName = (formData) => {
    if (!formData) return "—";
    const firstName = formData.firstName || "";
    const surname = formData.surname || "";
    return `${firstName} ${surname}`.trim() || "—";
  };

  const getPhone = (formData) => {
    return formData?.phone || "—";
  };

  // ─── Loading / Error / Empty states ──────────────────────────
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading drafts...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</div>
        <button
          onClick={fetchDrafts}
          style={{
            padding: "8px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
        <p style={{ fontSize: "18px", margin: 0 }}>No drafts found</p>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          Drafts are created when officers save KYC forms.
        </p>
      </div>
    );
  }

  // ─── Render cards (mobile) ─────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
              Drafts
            </h2>
            <button
              onClick={fetchDrafts}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "#f1f5f9",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#475569",
              }}
            >
              <MdRefresh /> Refresh
            </button>
          </div>

          {drafts.map((draft) => (
            <div
              key={draft.draftUuid}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "16px", color: "#1e293b" }}>
                    {getFullName(draft.formData)}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
                    {getPhone(draft.formData)}
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: draft.status === "submitted" ? "#dcfce7" : "#fef9c3",
                    color: draft.status === "submitted" ? "#166534" : "#854d0e",
                    whiteSpace: "nowrap",
                  }}
                >
                  {draft.status || "draft"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "14px", color: "#64748b" }}>
                <span>Step {draft.currentStep || 1}</span>
                <span>Updated: {formatDate(draft.updatedAt)}</span>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <button
                  onClick={() => handleView(draft)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: "#e0f2fe",
                    border: "none",
                    borderRadius: "8px",
                    color: "#0369a1",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  <MdVisibility size={18} /> View
                </button>
                {draft.status !== "submitted" && (
                  <button
                    onClick={() => confirmDelete(draft.draftUuid)}
                    disabled={actionLoading === draft.draftUuid}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      background: "#fee2e2",
                      border: "none",
                      borderRadius: "8px",
                      color: "#b91c1c",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: actionLoading === draft.draftUuid ? "not-allowed" : "pointer",
                      opacity: actionLoading === draft.draftUuid ? 0.6 : 1,
                    }}
                  >
                    <MdDeleteOutline size={18} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ marginTop: "8px", fontSize: "13px", color: "#94a3b8", textAlign: "center" }}>
            {drafts.length} draft(s) found
          </div>
        </div>

        {/* ─── Delete Confirmation Modal ────────────────────────── */}
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "32px 24px 24px",
                maxWidth: "400px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <MdClose />
              </button>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <MdDeleteOutline size={32} color="#dc2626" />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
                Delete Draft?
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                Are you sure you want to delete this draft? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: "10px 24px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "8px",
                    color: "#475569",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "10px 24px",
                    background: "#dc2626",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── Render table (desktop) ──────────────────────────────────
  return (
    <>
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#1e293b" }}>
            Drafts
          </h2>
          <button
            onClick={fetchDrafts}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#f1f5f9",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Client Name
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Phone
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Step
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Updated
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr
                  key={draft.draftUuid}
                  style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafcfc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>
                    {getFullName(draft.formData)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>
                    {getPhone(draft.formData)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#1e293b" }}>
                    Step {draft.currentStep || 1}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#64748b" }}>
                    {formatDate(draft.updatedAt)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        background: draft.status === "submitted" ? "#dcfce7" : "#fef9c3",
                        color: draft.status === "submitted" ? "#166534" : "#854d0e",
                      }}
                    >
                      {draft.status || "draft"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleView(draft)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "18px",
                        }}
                        title="View / Edit"
                      >
                        <MdVisibility />
                      </button>
                      {draft.status !== "submitted" && (
                        <button
                          onClick={() => confirmDelete(draft.draftUuid)}
                          disabled={actionLoading === draft.draftUuid}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: actionLoading === draft.draftUuid ? "not-allowed" : "pointer",
                            padding: "4px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "18px",
                            opacity: actionLoading === draft.draftUuid ? 0.5 : 1,
                          }}
                          title="Delete draft"
                        >
                          <MdDeleteOutline />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: "12px", fontSize: "14px", color: "#94a3b8" }}>
          {drafts.length} draft(s) found
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ────────────────────────── */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px 24px 24px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <MdClose />
            </button>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <MdDeleteOutline size={32} color="#dc2626" />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
              Delete Draft?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
              Are you sure you want to delete this draft? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  color: "#475569",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "10px 24px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficerDrafts;