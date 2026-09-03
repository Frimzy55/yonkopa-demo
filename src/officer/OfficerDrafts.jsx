// OfficerDrafts.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  MdRefresh,
  MdDeleteOutline,
  MdVisibility,
  MdClose,
  MdSend,
  MdPerson,
  MdCheckCircle,
} from "react-icons/md";
import {
  getAllDraftsFromIndexedDB,
  deleteDraftFromIndexedDB,
} from "../utils/draftStorage";

const OfficerDrafts = ({ user, onViewDraft, onDraftDeleted }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [draftToTransfer, setDraftToTransfer] = useState(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const [officers, setOfficers] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [officersError, setOfficersError] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  // Toast notification state
  const [notification, setNotification] = useState(null);
  const [notificationTimeout, setNotificationTimeout] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // Toast helper
  const showNotification = useCallback((message, type = "info") => {
    // Clear any existing timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      setNotificationTimeout(null);
    }
    setNotification({ message, type });
    // Auto-dismiss after 3 seconds
    const timeout = setTimeout(() => {
      setNotification(null);
      setNotificationTimeout(null);
    }, 3000);
    setNotificationTimeout(timeout);
  }, [notificationTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notificationTimeout]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const currentOfficerId = user?.userId || user?.id;

  // ============================================================
  // FETCH LOCAL DRAFTS
  // ============================================================
  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allDrafts = await getAllDraftsFromIndexedDB();
      const officerId = user?.userId || user?.id;
      const myDrafts = officerId
        ? allDrafts.filter(
            (draft) => Number(draft.officerId) === Number(officerId),
          )
        : [];
      const sorted = myDrafts.sort(
        (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
      );
      setDrafts(sorted);
    } catch (err) {
      console.error("Fetch local drafts error:", err);
      setError("Could not load local drafts");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // ============================================================
  // FETCH ACTIVE LOAN OFFICERS
  // ============================================================
  const fetchOfficers = async () => {
    setOfficersLoading(true);
    setOfficersError(null);
    try {
      const response = await fetch(`${API_URL}/api/kyc/loan-officers`);
      if (!response.ok) {
        throw new Error(`Failed to fetch loan officers: ${response.status}`);
      }
      const data = await response.json();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch loan officers error:", err);
      setOfficers([]);
      setOfficersError(
        "Unable to load active loan officers. Please try again.",
      );
    } finally {
      setOfficersLoading(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================
  const confirmDelete = (draftUuid) => {
    setDraftToDelete(draftUuid);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!draftToDelete) return;
    setActionLoading(draftToDelete);
    setShowDeleteModal(false);
    try {
      await deleteDraftFromIndexedDB(draftToDelete);
      setDrafts((prev) =>
        prev.filter((draft) => draft.draftUuid !== draftToDelete),
      );
      if (onDraftDeleted) onDraftDeleted();
    } catch (err) {
      console.error("Delete local draft error:", err);
      showNotification("Could not delete draft", "error");
    } finally {
      setActionLoading(null);
      setDraftToDelete(null);
    }
  };

  // ============================================================
  // OPEN TRANSFER
  // ============================================================
  const confirmTransfer = async (draft) => {
    setDraftToTransfer(draft);
    setSelectedOfficer(null);
    setOfficersError(null);
    setShowTransferModal(true);
    await fetchOfficers();
  };

  // ============================================================
  // CONTINUE TO TRANSFER CONFIRMATION
  // ============================================================
  const continueTransfer = () => {
    if (!selectedOfficer) {
      showNotification("Please select an officer to receive this draft.", "error");
      return;
    }
    setShowTransferModal(false);
    setShowTransferConfirm(true);
  };

  // ============================================================
  // REAL SERVER TRANSFER
  // ============================================================
  const handleTransfer = async () => {
    if (!draftToTransfer || !selectedOfficer) return;
    const draftUuid = draftToTransfer.draftUuid;
    setActionLoading(draftUuid);
    setShowTransferConfirm(false);

    try {
      if (!currentOfficerId) {
        throw new Error("Current officer ID is missing.");
      }
      if (!selectedOfficer.userId) {
        throw new Error("Receiving officer ID is missing.");
      }

      const response = await fetch(`${API_URL}/api/kyc/transfer-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftUuid,
          fromOfficerId: Number(currentOfficerId),
          toOfficerId: Number(selectedOfficer.userId),
          formData: draftToTransfer.formData || {},
          currentStep: draftToTransfer.currentStep || 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to transfer draft");
      }

      showNotification(
        `Draft successfully sent to ${selectedOfficer.full_name}.`,
        "success"
      );

      // Remove from current officer's local drafts
      try {
        await deleteDraftFromIndexedDB(draftUuid);
      } catch (deleteError) {
        console.warn(
          "Draft transferred but could not remove local copy:",
          deleteError,
        );
      }

      setDrafts((prev) =>
        prev.filter((draft) => draft.draftUuid !== draftUuid),
      );
      if (onDraftDeleted) onDraftDeleted();
    } catch (err) {
      console.error("Transfer error:", err);
      showNotification(err.message || "Transfer failed. Please try again.", "error");
    } finally {
      setActionLoading(null);
      setDraftToTransfer(null);
      setSelectedOfficer(null);
    }
  };

  const cancelTransfer = () => {
    setShowTransferModal(false);
    setShowTransferConfirm(false);
    setDraftToTransfer(null);
    setSelectedOfficer(null);
    setOfficersError(null);
  };

  // ============================================================
  // VIEW
  // ============================================================
  const handleView = async (draft) => {
    if (onViewDraft) onViewDraft(draft.draftUuid);
  };

  // ============================================================
  // HELPERS
  // ============================================================
  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "—";
    }
  };

  const getFullName = (formData) => {
    if (!formData) return "—";
    const firstName = formData.firstName || formData.firstname || "";
    const surname = formData.surname || formData.lastName || formData.lastname || "";
    return `${firstName} ${surname}`.trim() || "—";
  };

  const getPhone = (formData) => {
    return formData?.phone || formData?.mobileNumber || "—";
  };

  const availableOfficers = officers.filter(
    (officer) => Number(officer.userId) !== Number(currentOfficerId),
  );

  // ============================================================
  // LOADING / ERROR / EMPTY
  // ============================================================
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading local drafts...
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
        <p style={{ fontSize: "18px", margin: 0 }}>No local drafts found</p>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          Drafts are saved locally until they are transferred.
        </p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <style>
        {`
          .draft-action-btn {
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s ease;
          }
          .draft-action-btn:hover {
            transform: translateY(-1px);
          }
          .officer-option {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #fff;
          }
          .officer-option:hover {
            border-color: #16a34a;
            background: #f0fdf4;
          }
          .officer-option.selected {
            border-color: #16a34a;
            background: #f0fdf4;
            box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
          }
          .officer-option-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .officer-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #dcfce7;
            color: #166534;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }
          .transfer-modal {
            background: #fff;
            border-radius: 16px;
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
          }
          .modal-header-custom {
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .modal-body-custom {
            padding: 24px;
          }
          .modal-footer-custom {
            padding: 16px 24px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .modal-close {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 24px;
            display: flex;
            align-items: center;
          }
          .btn-cancel {
            padding: 10px 20px;
            background: #f1f5f9;
            border: none;
            border-radius: 8px;
            color: #475569;
            font-weight: 500;
            cursor: pointer;
          }
          .btn-primary-custom {
            padding: 10px 20px;
            background: #16a34a;
            border: none;
            border-radius: 8px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary-custom:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .officer-list {
            max-height: 360px;
            overflow-y: auto;
            padding-right: 3px;
          }
          .selected-check {
            flex-shrink: 0;
          }

          /* Toast notification */
          .toast-container {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            width: 90%;
            max-width: 480px;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
            animation: slideDown 0.3s ease;
          }
          .toast-container.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
          }
          .toast-container.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #b91c1c;
          }
          .toast-container.info {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e40af;
          }
          .toast-icon {
            font-size: 22px;
            flex-shrink: 0;
          }
          .toast-close {
            background: transparent;
            border: none;
            color: currentColor;
            cursor: pointer;
            margin-left: auto;
            font-size: 20px;
            display: flex;
            align-items: center;
            opacity: 0.7;
          }
          .toast-close:hover {
            opacity: 1;
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }

          @media (max-width: 576px) {
            .transfer-modal {
              max-height: 92vh;
            }
            .modal-body-custom {
              padding: 18px;
            }
            .modal-header-custom {
              padding: 18px;
            }
            .modal-footer-custom {
              padding: 14px 18px;
            }
          }
        `}
      </style>

      {/* Toast Notification */}
      {notification && (
        <div className={`toast-container ${notification.type}`}>
          <span className="toast-icon">
            {notification.type === "success" && "✅"}
            {notification.type === "error" && "❌"}
            {notification.type === "info" && "ℹ️"}
          </span>
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            className="toast-close"
            onClick={() => {
              if (notificationTimeout) clearTimeout(notificationTimeout);
              setNotification(null);
            }}
          >
            <MdClose />
          </button>
        </div>
      )}

      <div
        style={{
          padding: isMobile ? "16px" : "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            Local Drafts
          </h2>
          <button
            onClick={fetchDrafts}
            className="draft-action-btn"
            style={{
              gap: "6px",
              background: "#f1f5f9",
              padding: "8px 16px",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <MdRefresh size={18} />
            Refresh
          </button>
        </div>

        {isMobile ? (
          <>
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "#1e293b",
                      }}
                    >
                      {getFullName(draft.formData)}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
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
                      background: "#fef9c3",
                      color: "#854d0e",
                    }}
                  >
                    draft
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#64748b",
                  }}
                >
                  <span>Step {draft.currentStep || 1}</span>
                  <span>Updated: {formatDate(draft.updatedAt)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "12px",
                  }}
                >
                  <button
                    onClick={() => handleView(draft)}
                    className="draft-action-btn"
                    style={{
                      flex: "1 0 calc(33% - 8px)",
                      gap: "4px",
                      padding: "8px 6px",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      fontSize: "13px",
                      fontWeight: "500",
                      minWidth: "70px",
                    }}
                  >
                    <MdVisibility size={18} />
                    View
                  </button>
                  <button
                    onClick={() => confirmTransfer(draft)}
                    disabled={actionLoading === draft.draftUuid}
                    className="draft-action-btn"
                    style={{
                      flex: "1 0 calc(33% - 8px)",
                      gap: "4px",
                      padding: "8px 6px",
                      background: "#dcfce7",
                      color: "#166534",
                      fontSize: "13px",
                      fontWeight: "500",
                      minWidth: "70px",
                      opacity: actionLoading === draft.draftUuid ? 0.6 : 1,
                    }}
                  >
                    <MdSend size={18} />
                    Transfer
                  </button>
                  <button
                    onClick={() => confirmDelete(draft.draftUuid)}
                    disabled={actionLoading === draft.draftUuid}
                    className="draft-action-btn"
                    style={{
                      flex: "1 0 calc(33% - 8px)",
                      gap: "4px",
                      padding: "8px 6px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      fontSize: "13px",
                      fontWeight: "500",
                      minWidth: "70px",
                      opacity: actionLoading === draft.draftUuid ? 0.6 : 1,
                    }}
                  >
                    <MdDeleteOutline size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              {drafts.length} draft(s) found
            </div>
          </>
        ) : (
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
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th style={thStyle}>Client Name</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Step</th>
                  <th style={thStyle}>Updated</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((draft) => (
                  <tr
                    key={draft.draftUuid}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={tdStyle}>{getFullName(draft.formData)}</td>
                    <td style={tdStyle}>{getPhone(draft.formData)}</td>
                    <td style={tdStyle}>Step {draft.currentStep || 1}</td>
                    <td style={{ ...tdStyle, color: "#64748b" }}>
                      {formatDate(draft.updatedAt)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => handleView(draft)}
                          style={iconButtonStyle("#3b82f6")}
                          title="View / Edit"
                        >
                          <MdVisibility />
                        </button>
                        <button
                          onClick={() => confirmTransfer(draft)}
                          disabled={actionLoading === draft.draftUuid}
                          style={{
                            ...iconButtonStyle("#16a34a"),
                            opacity: actionLoading === draft.draftUuid ? 0.5 : 1,
                          }}
                          title="Transfer draft"
                        >
                          <MdSend />
                        </button>
                        <button
                          onClick={() => confirmDelete(draft.draftUuid)}
                          disabled={actionLoading === draft.draftUuid}
                          style={{
                            ...iconButtonStyle("#ef4444"),
                            opacity: actionLoading === draft.draftUuid ? 0.5 : 1,
                          }}
                          title="Delete draft"
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "12px", fontSize: "14px", color: "#94a3b8" }}>
              {drafts.length} draft(s) found
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
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
              className="modal-close"
              style={{ position: "absolute", top: "12px", right: "12px" }}
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
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Delete Draft?
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to delete this draft? This action cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">
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

      {/* SELECT OFFICER MODAL */}
      {showTransferModal && draftToTransfer && (
        <div className="modal-overlay" onClick={cancelTransfer}>
          <div className="transfer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1e293b",
                  }}
                >
                  Transfer Draft
                </h3>
                <div style={{ marginTop: "4px", fontSize: "13px", color: "#64748b" }}>
                  Select a loan officer to receive this draft.
                </div>
              </div>
              <button onClick={cancelTransfer} className="modal-close">
                <MdClose />
              </button>
            </div>
            <div className="modal-body-custom">
              <div
                style={{
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                  Client
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                  {getFullName(draftToTransfer.formData)}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "5px",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  <span>Step {draftToTransfer.currentStep || 1}</span>
                  <span>{getPhone(draftToTransfer.formData)}</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Available Loan Officers
                </div>
                {!officersLoading && (
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {availableOfficers.length} available
                  </div>
                )}
              </div>

              {officersLoading && (
                <div
                  style={{
                    padding: "35px 20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      border: "3px solid #e2e8f0",
                      borderTop: "3px solid #16a34a",
                      borderRadius: "50%",
                      animation: "officerSpinner 0.8s linear infinite",
                      margin: "0 auto 12px",
                    }}
                  />
                  Loading active loan officers...
                </div>
              )}

              {!officersLoading && officersError && (
                <div
                  style={{
                    padding: "20px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    textAlign: "center",
                    color: "#b91c1c",
                    fontSize: "14px",
                  }}
                >
                  <div>{officersError}</div>
                  <button
                    onClick={fetchOfficers}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "7px",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!officersLoading && !officersError && availableOfficers.length === 0 && (
                <div
                  style={{
                    padding: "30px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "10px",
                  }}
                >
                  <MdPerson size={38} color="#94a3b8" />
                  <div style={{ marginTop: "8px", fontWeight: "600" }}>
                    No active loan officers available
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "13px" }}>
                    There are currently no other active loan officers to receive this
                    draft.
                  </div>
                </div>
              )}

              {!officersLoading && !officersError && availableOfficers.length > 0 && (
                <div className="officer-list">
                  {availableOfficers.map((officer) => {
                    const isSelected =
                      Number(selectedOfficer?.userId) === Number(officer.userId);
                    return (
                      <div
                        key={officer.userId}
                        className={`officer-option ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedOfficer(officer)}
                      >
                        <div className="officer-option-content">
                          <div className="officer-avatar">
                            <MdPerson size={24} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#1e293b",
                                fontSize: "15px",
                              }}
                            >
                              {officer.full_name || "Unnamed Officer"}
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#64748b",
                                marginTop: "3px",
                              }}
                            >
                              @{officer.username || "N/A"}
                            </div>
                            {officer.phone && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#94a3b8",
                                  marginTop: "2px",
                                }}
                              >
                                {officer.phone}
                              </div>
                            )}
                            <div
                              style={{
                                display: "inline-block",
                                marginTop: "6px",
                                padding: "3px 8px",
                                borderRadius: "20px",
                                background: "#f0fdf4",
                                color: "#15803d",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              ACTIVE
                            </div>
                          </div>
                          {isSelected && (
                            <MdCheckCircle
                              className="selected-check"
                              size={25}
                              color="#16a34a"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer-custom">
              <button onClick={cancelTransfer} className="btn-cancel">
                Cancel
              </button>
              <button
                onClick={continueTransfer}
                disabled={!selectedOfficer || officersLoading}
                className="btn-primary-custom"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER CONFIRMATION */}
      {showTransferConfirm && draftToTransfer && selectedOfficer && (
        <div className="modal-overlay" onClick={cancelTransfer}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px 24px 24px",
              maxWidth: "430px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <MdSend size={32} color="#166534" />
            </div>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              Confirm Transfer
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.6",
              }}
            >
              You are about to transfer the draft for{" "}
              <strong style={{ color: "#1e293b" }}>
                {getFullName(draftToTransfer.formData)}
              </strong>{" "}
              to:
            </p>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                }}
              >
                <div className="officer-avatar">
                  <MdPerson size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#166534",
                      fontSize: "16px",
                    }}
                  >
                    {selectedOfficer.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#15803d",
                      marginTop: "3px",
                    }}
                  >
                    Loan Officer
                  </div>
                  {selectedOfficer.phone && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#16a34a",
                        marginTop: "2px",
                      }}
                    >
                      {selectedOfficer.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowTransferConfirm(false);
                  setShowTransferModal(true);
                }}
                className="btn-cancel"
              >
                Back
              </button>
              <button
                onClick={handleTransfer}
                disabled={actionLoading === draftToTransfer.draftUuid}
                className="btn-primary-custom"
              >
                <MdSend
                  size={18}
                  style={{ verticalAlign: "middle", marginRight: "5px" }}
                />
                {actionLoading === draftToTransfer.draftUuid
                  ? "Transferring..."
                  : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  color: "#64748b",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#1e293b",
};

const iconButtonStyle = (color) => ({
  background: "transparent",
  border: "none",
  color,
  cursor: "pointer",
  padding: "4px",
  borderRadius: "4px",
  display: "inline-flex",
  alignItems: "center",
  fontSize: "19px",
});

export default OfficerDrafts;