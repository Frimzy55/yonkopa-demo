import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MdSearch,
  MdRefresh,
  MdOpenInNew,
  MdPerson,
  MdPhone,
  MdAccessTime,
  MdCheckCircle,
  MdPending,
  MdDescription,
  MdDelete,
  MdClose,
  MdWarning,
} from "react-icons/md";
import { saveDraftToIndexedDB } from "../utils/draftStorage";

const OfficerConnect = ({ user, onViewDraft, onDraftDeleted }) => {
  const API_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  const currentOfficerId = user?.userId || user?.id;
  const [drafts, setDrafts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // ============================================================
  // GET FORM DATA
  // ============================================================
  const getFormData = useCallback((draft) => {
    if (!draft) return {};

    if (
      draft.formData &&
      typeof draft.formData === "object" &&
      !Array.isArray(draft.formData)
    ) {
      return draft.formData;
    }

    if (
      draft.form_data &&
      typeof draft.form_data === "object" &&
      !Array.isArray(draft.form_data)
    ) {
      return draft.form_data;
    }

    if (typeof draft.form_data === "string") {
      try {
        const parsed = JSON.parse(draft.form_data);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch (error) {
        console.error("Unable to parse form_data:", error);
      }
    }

    return {};
  }, []);

  // ============================================================
  // CLIENT NAME
  // ============================================================
  const getFullName = useCallback(
    (draft) => {
      const formData = getFormData(draft);
      const firstName =
        formData.firstName ||
        formData.firstname ||
        formData.first_name ||
        "";
      const middleName =
        formData.middleName ||
        formData.middlename ||
        formData.middle_name ||
        "";
      const lastName =
        formData.lastName ||
        formData.lastname ||
        formData.last_name ||
        formData.surname ||
        "";
      const fullName =
        formData.fullName ||
        formData.full_name ||
        formData.clientName ||
        formData.client_name ||
        formData.customerName ||
        formData.customer_name ||
        "";

      if (String(fullName).trim()) {
        return String(fullName).trim();
      }

      return (
        `${firstName} ${middleName} ${lastName}`
          .replace(/\s+/g, " ")
          .trim() || "Unnamed Client"
      );
    },
    [getFormData]
  );

  // ============================================================
  // PHONE
  // ============================================================
  const getPhone = useCallback(
    (draft) => {
      const formData = getFormData(draft);
      return (
        formData.phone ||
        formData.mobileNumber ||
        formData.phoneNumber ||
        formData.mobile ||
        formData.mobile_number ||
        "—"
      );
    },
    [getFormData]
  );

  // ============================================================
  // FORMAT DATE
  // ============================================================
  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // STATUS
  // ============================================================
  const getStatus = (draft) => {
    return String(draft?.status || "pending").toLowerCase();
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "opened":
        return "Opened";
      case "completed":
        return "Completed";
      case "returned":
        return "Returned";
      default:
        return "Pending";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          background: "#fff7ed",
          color: "#c2410c",
          border: "#fed7aa",
        };
      case "opened":
        return {
          background: "#eff6ff",
          color: "#1d4ed8",
          border: "#bfdbfe",
        };
      case "completed":
        return {
          background: "#f0fdf4",
          color: "#15803d",
          border: "#bbf7d0",
        };
      case "returned":
        return {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "#fecaca",
        };
      default:
        return {
          background: "#f8fafc",
          color: "#475569",
          border: "#e2e8f0",
        };
    }
  };

  // ============================================================
  // FETCH RECEIVED DRAFTS
  // ============================================================
  const fetchReceivedDrafts = useCallback(
    async (isRefresh = false) => {
      if (!currentOfficerId) {
        setLoading(false);
        setError("Unable to identify the logged-in officer.");
        return;
      }

      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/kyc/received-drafts/${currentOfficerId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to load received drafts.");
        }

        const receivedDrafts = Array.isArray(data)
          ? data
          : Array.isArray(data?.drafts)
          ? data.drafts
          : [];

        setDrafts(receivedDrafts);
      } catch (err) {
        console.error("Fetch received drafts error:", err);
        setError(err.message || "Unable to load received drafts.");
        setDrafts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_URL, currentOfficerId]
  );

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================
  useEffect(() => {
    fetchReceivedDrafts();
  }, [fetchReceivedDrafts]);

  // ============================================================
  // SEARCH
  // ============================================================
  const filteredDrafts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return drafts;

    return drafts.filter((draft) => {
      const clientName = getFullName(draft).toLowerCase();
      const phone = String(getPhone(draft)).toLowerCase();
      const sender =
        draft?.sender_name ||
        draft?.sender_full_name ||
        draft?.from_officer_name ||
        draft?.sender_username ||
        draft?.from_officer_username ||
        "";

      return (
        clientName.includes(search) ||
        phone.includes(search) ||
        String(sender).toLowerCase().includes(search)
      );
    });
  }, [drafts, searchTerm, getFullName, getPhone]);

  // ============================================================
  // VIEW / CONTINUE RECEIVED DRAFT
  // ============================================================
  const handleView = async (draft) => {
    if (!draft) return;
    const draftId = draft.id;

    // Prevent double clicks
    if (actionLoading === draftId) return;

    try {
      setError("");
      if (!currentOfficerId) {
        throw new Error("Current officer ID is missing.");
      }

      setActionLoading(draftId);
      let updatedDraft = { ...draft };

      // 1. Get the complete received draft from server
      if (draftId) {
        const response = await fetch(
          `${API_URL}/api/kyc/received-drafts/${draftId}/open`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: Number(currentOfficerId) }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to open received draft.");
        }

        // Merge server response into the draft
        const serverDraft = data?.draft || {};
        updatedDraft = {
          ...draft,
          ...serverDraft,
          status: serverDraft.status || (draft.status === "completed" ? "completed" : "opened"),
        };

        // Update local drafts list with the enriched draft (including UUID and status)
        setDrafts((prev) =>
          prev.map((item) =>
            Number(item.id) === Number(draftId) ? updatedDraft : item
          )
        );
      }

      // 2. Extract draft UUID – prioritise server response, fallback to existing
      const draftUuid =
        updatedDraft.draftUuid ||
        updatedDraft.draft_uuid ||
        draft.draftUuid ||
        draft.draft_uuid;

      if (!draftUuid || !String(draftUuid).trim()) {
        throw new Error("Received draft does not contain a valid draft UUID.");
      }

      // 3. Get form data
      let formData = updatedDraft.formData || updatedDraft.form_data || {};
      if (typeof formData === "string") {
        try {
          formData = JSON.parse(formData);
        } catch (parseError) {
          console.error("Could not parse received formData:", parseError);
          throw new Error("The received draft contains invalid form data.");
        }
      }
      if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
        formData = {};
      }

      // 4. Current step
      const currentStep = Number(updatedDraft.currentStep || updatedDraft.current_step || 1);

      // 5. Save copy to receiving officer's IndexedDB
      console.log("Saving received draft copy to IndexedDB:", {
        draftUuid,
        officerId: Number(currentOfficerId),
        currentStep,
        formData,
      });

      await saveDraftToIndexedDB(
        draftUuid,
        {
          officerId: Number(currentOfficerId),
          formData,
          currentStep,
          createdAt: updatedDraft.createdAt || updatedDraft.created_at || updatedDraft.transferred_at || Date.now(),
          transferredFromOfficerId: updatedDraft.from_officer_id || updatedDraft.fromOfficerId || null,
          transferredFromOfficerName: updatedDraft.from_officer_name || updatedDraft.sender_name || "",
          receivedTransferId: updatedDraft.id || null,
          isReceivedCopy: true,
          updatedAt: Date.now(),
        }
      );

      console.log("Received draft copy saved successfully.");

      // 6. Open KYC application
      if (typeof onViewDraft === "function") {
        onViewDraft(draftUuid);
      } else {
        console.warn("onViewDraft callback was not provided.");
      }
    } catch (err) {
      console.error("Open received draft error:", err);
      setError(err.message || "Unable to open this received draft.");
      alert(`Could not open draft: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // DELETE CONFIRMATION
  // ============================================================
  const confirmDelete = (draft) => {
    setDraftToDelete(draft);
    setShowDeleteModal(true);
  };

  // ============================================================
  // DELETE RECEIVED DRAFT
  // ============================================================
  const handleDelete = async () => {
    if (!draftToDelete?.id) return;
    if (!currentOfficerId) {
      setError("Current officer ID is missing.");
      return;
    }

    const draftId = draftToDelete.id;
    setActionLoading(draftId);
    setShowDeleteModal(false);

    try {
      setError("");
      const response = await fetch(
        `${API_URL}/api/kyc/received-drafts/${draftId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(currentOfficerId) }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to delete received draft.");
      }

      setDrafts((prev) => prev.filter((draft) => Number(draft.id) !== Number(draftId)));

      if (typeof onDraftDeleted === "function") {
        onDraftDeleted(draftToDelete);
      }

      alert("Received draft deleted successfully.");
    } catch (err) {
      console.error("Delete received draft error:", err);
      setError(err.message || "Could not delete received draft.");
    } finally {
      setActionLoading(null);
      setDraftToDelete(null);
    }
  };

  // ============================================================
  // COUNTS
  // ============================================================
  const pendingCount = drafts.filter((draft) => getStatus(draft) === "pending").length;
  const openedCount = drafts.filter((draft) => getStatus(draft) === "opened").length;
  const completedCount = drafts.filter((draft) => getStatus(draft) === "completed").length;

  // ============================================================
  // STATUS ICON
  // ============================================================
  const renderStatusIcon = (status) => {
    if (status === "completed") return <MdCheckCircle size={15} />;
    if (status === "opened") return <MdDescription size={15} />;
    return <MdPending size={15} />;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1250px",
        margin: "0 auto",
        padding: "4px",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <MdDescription size={28} color="#2563eb" />
            Received KYC Drafts
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Applications transferred to you by other loan officers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReceivedDrafts(true)}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 15px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#334155",
            fontWeight: "600",
            cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.7 : 1,
          }}
        >
          <MdRefresh
            size={19}
            style={{
              animation: refreshing
                ? "receivedDraftSpin 1s linear infinite"
                : "none",
            }}
          />
          Refresh
        </button>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <SummaryCard title="Total Received" value={drafts.length} icon={<MdDescription size={23} />} />
        <SummaryCard title="Pending" value={pendingCount} icon={<MdPending size={23} />} />
        <SummaryCard title="Opened" value={openedCount} icon={<MdOpenInNew size={23} />} />
        <SummaryCard title="Completed" value={completedCount} icon={<MdCheckCircle size={23} />} />
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "12px 14px",
            borderRadius: "8px",
            marginBottom: "18px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          SEARCH
      ====================================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "9px",
          padding: "0 13px",
          marginBottom: "18px",
        }}
      >
        <MdSearch size={21} color="#94a3b8" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search client, phone or sending officer..."
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: "12px 9px",
            fontSize: "14px",
            color: "#1e293b",
            background: "transparent",
          }}
        />
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}
      {loading ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "65px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation: "receivedDraftSpin 0.8s linear infinite",
            }}
          />
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Loading received drafts...
          </p>
        </div>
      ) : filteredDrafts.length === 0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "65px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "50%",
              background: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
            }}
          >
            <MdDescription size={31} />
          </div>
          <h3 style={{ margin: "0 0 7px", color: "#334155", fontSize: "18px" }}>
            {searchTerm ? "No matching drafts" : "No received drafts"}
          </h3>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
            {searchTerm ? "Try another search term." : "Drafts transferred to you will appear here."}
          </p>
        </div>
      ) : (
        /* ====================================================
           DRAFT LIST
        ==================================================== */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredDrafts.map((draft) => {
            const status = getStatus(draft);
            const statusStyle = getStatusStyle(status);
            const isLoading = actionLoading === draft.id;
            const currentStep = Number(draft.currentStep || draft.current_step || 1);
            const sender =
              draft.sender_name ||
              draft.sender_full_name ||
              draft.from_officer_name ||
              draft.sender_username ||
              draft.from_officer_username ||
              "Loan Officer";

            return (
              <div
                key={draft.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "18px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MdPerson size={25} />
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: statusStyle.background,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                    }}
                  >
                    {renderStatusIcon(status)}
                    {getStatusLabel(status)}
                  </span>
                </div>

                {/* CLIENT */}
                <h3 style={{ margin: "0 0 6px", fontSize: "17px", color: "#1e293b" }}>
                  {getFullName(draft)}
                </h3>

                {/* PHONE */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "#64748b",
                    fontSize: "13px",
                    marginBottom: "14px",
                  }}
                >
                  <MdPhone size={16} />
                  {getPhone(draft)}
                </div>

                {/* DETAILS */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "13px", marginBottom: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#64748b",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <MdPerson size={15} />
                    <span>Sent by:</span>
                    <strong style={{ color: "#334155" }}>{sender}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#64748b",
                      fontSize: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <MdDescription size={15} />
                    <span>Current Step:</span>
                    <strong style={{ color: "#334155" }}>Step {currentStep}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    <MdAccessTime size={15} />
                    <span>Received:</span>
                    <strong style={{ color: "#334155", fontWeight: "500" }}>
                      {formatDate(draft.transferred_at || draft.transferredAt)}
                    </strong>
                  </div>
                </div>

                {/* ==================================================
                    ACTIONS
                ================================================== */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 45px", gap: "8px" }}>
                  {/* CONTINUE – disabled when opened/completed as well */}
                  <button
                    type="button"
                    onClick={() => handleView(draft)}
                    disabled={isLoading || status === "completed" || status === "opened"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "7px",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: "8px",
                      background:
                        status === "completed" || status === "opened"
                          ? "#f1f5f9"
                          : "#2563eb",
                      color:
                        status === "completed" || status === "opened"
                          ? "#64748b"
                          : "#ffffff",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor:
                        isLoading || status === "completed" || status === "opened"
                          ? "not-allowed"
                          : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <MdOpenInNew size={18} />
                    {isLoading
                      ? "Opening..."
                      : status === "completed"
                      ? "Completed"
                      : status === "opened"
                      ? "Opened"
                      : "Continue Application"}
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => confirmDelete(draft)}
                    disabled={isLoading}
                    title="Delete received draft"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      background: "#fff1f2",
                      color: "#dc2626",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <MdDelete size={19} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================
          FOOTER COUNT
      ====================================================== */}
      {!loading && drafts.length > 0 && (
        <div style={{ marginTop: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
          Showing {filteredDrafts.length} of {drafts.length} received drafts
        </div>
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}
      {showDeleteModal && draftToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <MdWarning size={27} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: "19px" }}>
              Delete Received Draft?
            </h3>
            <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>
              Are you sure you want to delete the received KYC application for{" "}
              <strong style={{ color: "#334155" }}>{getFullName(draftToDelete)}</strong>?
            </p>
            <p style={{ margin: "0 0 22px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.5" }}>
              This will delete your received copy. The original officer's draft will not be affected.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDraftToDelete(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "11px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <MdClose size={18} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading === draftToDelete.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "11px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: "600",
                  cursor: actionLoading === draftToDelete.id ? "not-allowed" : "pointer",
                  opacity: actionLoading === draftToDelete.id ? 0.7 : 1,
                }}
              >
                <MdDelete size={18} />
                {actionLoading === draftToDelete.id ? "Deleting..." : "Delete Draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes receivedDraftSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================
const SummaryCard = ({ title, value, icon }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "3px" }}>{title}</div>
        <strong style={{ fontSize: "21px", color: "#1e293b" }}>{value}</strong>
      </div>
    </div>
  );
};

export default OfficerConnect;