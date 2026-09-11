import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import {
  MdRefresh,
  MdDeleteOutline,
  MdVisibility,
  MdEdit,
} from "react-icons/md";
import { fetchWithAuth } from "../utils/api";
import { saveDraftToIndexedDB } from "../utils/draftStorage";

const OfficerPendingResubmission = ({
  user,
  onViewDraft,
  onDraftDeleted,
  onDraftSaved,
}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationVariant, setNotificationVariant] = useState("success");

  const API_URL = process.env.REACT_APP_API_URL;
  const currentOfficerId = user?.userId || user?.id;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const showNotification = useCallback((message, variant = "success") => {
    setNotificationMessage(message);
    setNotificationVariant(variant);
    setShowNotificationModal(true);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const getFullName = useCallback((app) => {
    if (!app) return "N/A";
    return (
      app.full_name ||
      app.fullName ||
      [app.first_name, app.middle_name, app.surname]
        .filter(Boolean)
        .join(" ") ||
      [app.firstName, app.middleName, app.lastName]
        .filter(Boolean)
        .join(" ") ||
      "N/A"
    );
  }, []);

  const getPhone = useCallback((app) => {
    return (
      app?.phone ||
      app?.mobile_number ||
      app?.mobileNumber ||
      app?.telephone ||
      ""
    );
  }, []);

  const getKycCode = useCallback((app) => {
    return app?.kycCode || app?.kyc_code || "";
  }, []);

  const getStatusBadge = useCallback((status) => {
    const normalized = String(status || "").toLowerCase();
    const styles = {
      pending: "bg-warning text-dark",
      "pending resubmission": "bg-warning text-dark",
      "under review": "bg-info text-white",
      submitted: "bg-primary text-white",
      approved: "bg-success text-white",
      rejected: "bg-danger text-white",
      verified: "bg-success text-white",
      opened: "bg-info text-white",
      draft: "bg-secondary text-white",
    };
    return styles[normalized] || "bg-secondary text-white";
  }, []);

  const fetchPending = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const data = await fetchWithAuth(
          "/api/kyc/officer/pending-resubmission"
        );

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
          ? data.applications
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setApplications(records);
      } catch (err) {
        console.error("Error fetching pending resubmissions:", err);
        setError(err?.message || "Failed to load pending resubmissions.");
        setApplications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return applications;

    return applications.filter((app) => {
      const name = getFullName(app).toLowerCase();
      const phone = String(getPhone(app)).toLowerCase();
      const kycCode = String(getKycCode(app)).toLowerCase();
      const officer = String(
        app?.officer_name ||
          app?.officer_full_name ||
          app?.sender_name ||
          app?.sender_full_name ||
          app?.from_officer_name ||
          ""
      ).toLowerCase();
      return (
        name.includes(search) ||
        phone.includes(search) ||
        kycCode.includes(search) ||
        officer.includes(search)
      );
    });
  }, [applications, searchTerm, getFullName, getPhone, getKycCode]);

  /*
   * Extract the actual application form data.
   */
  const getFormData = useCallback((application) => {
    if (!application) return {};

    let formData =
      application.formData ||
      application.form_data ||
      application.application_data ||
      application.applicationData ||
      null;

    if (typeof formData === "string") {
      try {
        formData = JSON.parse(formData);
      } catch (err) {
        console.warn("Unable to parse application form data:", err);
        formData = null;
      }
    }

    if (formData && typeof formData === "object") {
      return {
        ...formData,
        client_id:
          formData.client_id ||
          application.client_id ||
          application.clientId ||
          null,
        clientId:
          formData.clientId ||
          application.clientId ||
          application.client_id ||
          null,
        kycCode:
          formData.kycCode ||
          application.kycCode ||
          application.kyc_code ||
          null,
      };
    }

    return {
      ...application,
    };
  }, []);

  const getDraftUuid = useCallback((application) => {
    return (
      application?.draftUuid ||
      application?.draft_uuid ||
      application?.uuid ||
      application?.draftId ||
      application?.draft_id ||
      null
    );
  }, []);

  const getCurrentStep = useCallback((application) => {
    const step =
      application?.currentStep ??
      application?.current_step ??
      application?.step ??
      application?.current_step_number ??
      1;
    const numericStep = Number(step);
    return Number.isFinite(numericStep) && numericStep > 0 ? numericStep : 1;
  }, []);

  /*
   * VIEW / EDIT - saves the pending resubmission as a local draft
   * and calls onViewDraft to open the editor.
   */
  const handleEdit = useCallback(
    async (application) => {
      if (!application) return;

      if (!currentOfficerId) {
        showNotification(
          "Current officer ID is missing. Please log in again.",
          "danger"
        );
        return;
      }

      setActionLoading(
        application.id || application.client_id || getDraftUuid(application)
      );

      try {
        setError(null);

        let updatedApplication = application;

        if (application.id) {
          try {
            const response = await fetchWithAuth(
              `${API_URL}/api/kyc/received-drafts/${application.id}/open`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: Number(currentOfficerId) }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              updatedApplication = {
                ...application,
                ...(data?.draft || {}),
                ...(data?.application || {}),
                status:
                  data?.draft?.status ||
                  data?.application?.status ||
                  application.status ||
                  "opened",
              };
              setApplications((prev) =>
                prev.map((item) =>
                  Number(item.id) === Number(application.id)
                    ? updatedApplication
                    : item
                )
              );
            }
          } catch (openError) {
            console.warn("Open-status update skipped:", openError);
          }
        }

        let draftUuid = getDraftUuid(updatedApplication);
        if (!draftUuid) {
          const clientReference =
            updatedApplication.client_id ||
            updatedApplication.clientId ||
            updatedApplication.id ||
            Date.now();
          draftUuid = `resubmission_${clientReference}_${Date.now()}`;
        }

        const formData = getFormData(updatedApplication);
        const currentStep = getCurrentStep(updatedApplication);

        const draft = {
          draftUuid,
          officerId: Number(currentOfficerId),
          formData,
          currentStep,
          createdAt:
            updatedApplication.createdAt ||
            updatedApplication.created_at ||
            updatedApplication.applicant_created_at ||
            Date.now(),
          updatedAt: Date.now(),
          clientId:
            updatedApplication.client_id ||
            updatedApplication.clientId ||
            null,
          client_id:
            updatedApplication.client_id ||
            updatedApplication.clientId ||
            null,
          source: "pending-resubmission",
          isResubmission: true,
          serverRecordId: updatedApplication.id || null,
          resubmissionId: updatedApplication.id || null,
          transferredFromOfficerId:
            updatedApplication.from_officer_id ||
            updatedApplication.fromOfficerId ||
            null,
          transferredFromOfficerName:
            updatedApplication.from_officer_name ||
            updatedApplication.sender_name ||
            updatedApplication.sender_full_name ||
            "",
          receivedTransferId: updatedApplication.id || null,
          isReceivedCopy: true,
        };

        console.log("Saving pending resubmission to IndexedDB:", draft);
        await saveDraftToIndexedDB(draft);

        if (typeof onViewDraft === "function") {
          onViewDraft(draftUuid);
        } else {
          throw new Error("onViewDraft callback was not provided.");
        }

        if (typeof onDraftSaved === "function") {
          onDraftSaved(draft);
        }
      } catch (err) {
        console.error("Open pending resubmission error:", err);
        setError(err?.message || "Unable to open this pending resubmission.");
        showNotification(
          err?.message || "Unable to open this pending resubmission.",
          "danger"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [
      API_URL,
      currentOfficerId,
      getDraftUuid,
      getFormData,
      getCurrentStep,
      onDraftSaved,
      onViewDraft,
      showNotification,
    ]
  );

  /*
   * DELETE CONFIRMATION
   */
  const confirmDelete = useCallback((application) => {
    setDraftToDelete(application);
    setShowDeleteModal(true);
  }, []);

  /*
   * DELETE PENDING RESUBMISSION (server-side)
   */
  const handleDelete = useCallback(async () => {
    if (!draftToDelete?.id) {
      setShowDeleteModal(false);
      showNotification("This resubmission does not have a server record ID.", "danger");
      return;
    }

    if (!currentOfficerId) {
      setShowDeleteModal(false);
      showNotification("Current officer ID is missing.", "danger");
      return;
    }

    const draftId = draftToDelete.id;
    setActionLoading(draftId);
    setShowDeleteModal(false);

    try {
      setError(null);

      const response = await fetchWithAuth(
        `${API_URL}/api/kyc/received-drafts/${draftId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: Number(currentOfficerId) }),
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to delete pending resubmission (${response.status}).`
        );
      }

      setApplications((prev) =>
        prev.filter((app) => Number(app.id) !== Number(draftId))
      );

      if (typeof onDraftDeleted === "function") {
        onDraftDeleted(draftToDelete);
      }

      showNotification("Pending resubmission deleted successfully.", "success");
    } catch (err) {
      console.error("Delete pending resubmission error:", err);
      setError(err?.message || "Could not delete pending resubmission.");
      showNotification(err?.message || "Could not delete pending resubmission.", "danger");
    } finally {
      setActionLoading(null);
      setDraftToDelete(null);
    }
  }, [API_URL, currentOfficerId, draftToDelete, onDraftDeleted, showNotification]);

  /*
   * REFRESH
   */
  const handleRefresh = useCallback(() => {
    fetchPending(true);
  }, [fetchPending]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div
        className="container-fluid p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="text-muted mt-2">Loading pending resubmissions...</div>
        </div>
      </div>
    );
  }

  /*
   * MAIN PAGE
   */
  return (
    <>
      <div
        className="container-fluid p-4"
        style={{ background: "#f8fafc", minHeight: "100vh" }}
      >
        {/* HEADER */}
        <div
          className={`d-flex ${
            isMobile
              ? "flex-column align-items-start"
              : "justify-content-between align-items-center"
          } mb-4 gap-3`}
        >
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#334155" }}>
              Pending Resubmissions ({applications.length})
            </h4>
            <small className="text-muted">
              Review, edit, or manage applications returned for resubmission.
            </small>
          </div>

          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill px-3"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <MdRefresh
              size={18}
              className={refreshing ? "spin" : ""}
              style={{ verticalAlign: "middle", marginRight: "5px" }}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* SEARCH */}
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "12px" }}>
          <div className="card-body">
            <Form.Control
              type="search"
              placeholder="Search by client name, phone, KYC code or officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "10px", minHeight: "42px" }}
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="alert alert-danger border-0 shadow-sm d-flex justify-content-between align-items-center"
            role="alert"
          >
            <span>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </span>
            <Button variant="outline-danger" size="sm" onClick={() => fetchPending(true)}>
              Retry
            </Button>
          </div>
        )}

        
        {!error && filteredApplications.length === 0 && (
          <div
            className="card border-0 shadow-sm text-center"
            style={{ borderRadius: "12px", padding: "60px 20px" }}
          >
            <div className="mb-3">
              <MdVisibility size={48} style={{ color: "#94a3b8" }} />
            </div>
            <h5 className="fw-semibold" style={{ color: "#475569" }}>
              {searchTerm ? "No matching resubmissions" : "No pending resubmissions"}
            </h5>
            <p className="text-muted mb-0">
              {searchTerm
                ? "Try another search term."
                : "There are currently no applications waiting for resubmission review."}
            </p>
          </div>
        )}

        {/* ============================================================
            MOBILE VIEW – Cards
        ============================================================ */}
        {isMobile && filteredApplications.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {filteredApplications.map((application, index) => {
              const fullName = getFullName(application);
              const officerName =
                application?.officer_name ||
                application?.officer_full_name ||
                application?.sender_name ||
                application?.sender_full_name ||
                application?.from_officer_name ||
                "N/A";
              const submittedDate =
                application?.applicant_created_at ||
                application?.submitted_at ||
                application?.submittedAt ||
                application?.created_at ||
                application?.createdAt;
              const status =
                application?.security_verification_status ||
                application?.status ||
                "Pending";
              const recordKey =
                application?.id ||
                application?.client_id ||
                application?.clientId ||
                `resubmission-${index}`;
              const loadingThis =
                actionLoading === recordKey ||
                actionLoading === application?.id ||
                actionLoading === application?.client_id;

              return (
                <div
                  key={recordKey}
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-0">{fullName}</h6>
                        {getKycCode(application) && (
                          <small className="text-muted">KYC: {getKycCode(application)}</small>
                        )}
                        {getPhone(application) && (
                          <div className="text-muted small">{getPhone(application)}</div>
                        )}
                      </div>
                      <span
                        className={`badge ${getStatusBadge(
                          status
                        )} px-3 py-2 rounded-pill`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="text-muted small mb-2">
                      <div>Officer: {officerName}</div>
                      <div>Submitted: {formatDate(submittedDate)}</div>
                    </div>

                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleEdit(application)}
                        disabled={loadingThis}
                      >
                        <MdEdit size={16} className="me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => confirmDelete(application)}
                        disabled={loadingThis}
                      >
                        <MdDeleteOutline size={16} className="me-1" />
                        Delete
                      </Button>
                    </div>
                    {loadingThis && (
                      <Spinner
                        animation="border"
                        size="sm"
                        className="d-block mx-auto mt-2"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================
            DESKTOP VIEW – Table
        ============================================================ */}
        {!isMobile && filteredApplications.length > 0 && (
          <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead
                    style={{ background: "#f8fafc", borderBottom: "2px solid #dee2e6" }}
                  >
                    <tr>
                      <th className="fw-semibold text-muted py-3 px-4">Client</th>
                      <th className="fw-semibold text-muted py-3">Officer</th>
                      <th className="fw-semibold text-muted py-3">Submitted</th>
                      <th className="fw-semibold text-muted py-3">Status</th>
                      <th className="fw-semibold text-muted py-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application, index) => {
                      const fullName = getFullName(application);
                      const officerName =
                        application?.officer_name ||
                        application?.officer_full_name ||
                        application?.sender_name ||
                        application?.sender_full_name ||
                        application?.from_officer_name ||
                        "N/A";
                      const submittedDate =
                        application?.applicant_created_at ||
                        application?.submitted_at ||
                        application?.submittedAt ||
                        application?.created_at ||
                        application?.createdAt;
                      const status =
                        application?.security_verification_status ||
                        application?.status ||
                        "Pending";
                      const recordKey =
                        application?.id ||
                        application?.client_id ||
                        application?.clientId ||
                        `resubmission-${index}`;
                      const loadingThis =
                        actionLoading === recordKey ||
                        actionLoading === application?.id ||
                        actionLoading === application?.client_id;

                      return (
                        <tr key={recordKey}>
                          <td className="py-3 px-4">
                            <div className="fw-semibold">{fullName}</div>
                            {getKycCode(application) && (
                              <small className="text-muted">KYC: {getKycCode(application)}</small>
                            )}
                            {getPhone(application) && (
                              <small className="text-muted d-block">{getPhone(application)}</small>
                            )}
                          </td>

                          <td className="py-3">{officerName}</td>

                          <td className="py-3 text-muted">
                            <i className="bi bi-calendar3 me-2"></i>
                            {formatDate(submittedDate)}
                          </td>

                          <td className="py-3">
                            <span
                              className={`badge ${getStatusBadge(
                                status
                              )} px-3 py-2 rounded-pill`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="py-3">
                            <div
                              className="d-flex flex-wrap gap-1 justify-content-center"
                              style={{ minWidth: "160px" }}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(application)}
                                disabled={loadingThis}
                                title="Edit / Continue"
                              >
                                <MdEdit size={16} className="me-1" />
                                Edit
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => confirmDelete(application)}
                                disabled={loadingThis}
                                title="Delete"
                              >
                                <MdDeleteOutline size={16} className="me-1" />
                                Delete
                              </Button>
                            </div>

                            {loadingThis && (
                              <Spinner
                                animation="border"
                                size="sm"
                                className="d-block mx-auto mt-1"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          DELETE CONFIRMATION MODAL
      ============================================================ */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!actionLoading) {
            setShowDeleteModal(false);
            setDraftToDelete(null);
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Resubmission</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-2">
            Are you sure you want to delete this pending resubmission?
          </p>

          <div
            className="p-3 rounded-3"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <strong>{draftToDelete ? getFullName(draftToDelete) : ""}</strong>
            {draftToDelete && getKycCode(draftToDelete) && (
              <small className="text-muted d-block">KYC: {getKycCode(draftToDelete)}</small>
            )}
          </div>

          <div className="alert alert-warning mt-3 mb-0">
            <small>
              This removes the pending resubmission from the server. Any local draft already
              saved in IndexedDB is not automatically removed.
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setDraftToDelete(null);
            }}
            disabled={Boolean(actionLoading)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <MdDeleteOutline size={18} className="me-1" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================================================
          NOTIFICATION MODAL
      ============================================================ */}
      <Modal
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{notificationVariant === "success" ? "Success" : "Notice"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={`alert alert-${notificationVariant} mb-0`}>
            {notificationMessage}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant={notificationVariant === "success" ? "success" : "primary"}
            onClick={() => setShowNotificationModal(false)}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .spin {
            animation: officerPendingSpin 1s linear infinite;
          }
          @keyframes officerPendingSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .table > :not(caption) > * > * {
            vertical-align: middle;
          }
          @media (max-width: 767px) {
            .container-fluid.p-4 {
              padding: 1rem !important;
            }
            table {
              min-width: 650px;
            }
          }
        `}
      </style>
    </>
  );
};

export default OfficerPendingResubmission;   