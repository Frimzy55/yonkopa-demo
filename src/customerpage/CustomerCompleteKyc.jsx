import React, { useState, useEffect, useCallback, useRef } from "react";

import PersonalInfo from "./KycPersonalInfo";
import ContactInfo from "./KycContactInfo";
import EmploymentInfo from "./KycEmploymentInfos";
import ReferenceInfo from "./KycReferenceInfo";
import KycFormView from "./KycFormView";
import "./CustomerCompleteKyc.css";

import {
  getStepErrors,
  validateAllSteps,
  validatePhoneNumber,
  validateNationalId,
} from "./kycValidation";

const CustomerCompleteKyc = ({ user, onContinueToLoan }) => {
  // =========================================================
  // BASIC STATE
  // =========================================================

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hasKyc, setHasKyc] = useState(false);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [checkingNationalId, setCheckingNationalId] = useState(false);
  const [nationalIdAvailable, setNationalIdAvailable] = useState(true);

  // =========================================================
  // DRAFT STATE
  // =========================================================

  const [draftUuid, setDraftUuid] = useState("");
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftError, setDraftError] = useState(false);
  const [draftDataLoaded, setDraftDataLoaded] = useState(false);
  const [showDraftSummary, setShowDraftSummary] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const nationalIdCheckTimeout = useRef(null);
  const abortControllerRef = useRef(null);

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    userId: "",
    kycCode: "",

    // =======================================================
    // PERSONAL
    // =======================================================

    avatar: null,
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationalId: "",
    taxId: "",
    residentialLocation: "",
    residentialLandmark: "",
    spouseName: "",
    spouseContact: "",

    // =======================================================
    // CONTACT
    // =======================================================

    mobileNumber: "",
    email: "",
    residentialAddress: "",
    //residentialLandmark: "",
    city: "",
    state: "",
    zipCode: "",
    postalAddress: "",
    alternatePhone: "",

    // =======================================================
    // EMPLOYMENT
    // =======================================================

    employmentStatus: "",
    employerName: "",
    jobTitle: "",
    monthlyIncome: "",
    yearsInCurrentEmployment: "",
    workPlaceLocation: "",

    payslip: null,
    ghanaCardFront: null,
    ghanaCardBack: null,
    employmentId: null,

    // =======================================================
    // BUSINESS
    // =======================================================

    businessName: "",
    businessType: "",
    monthlyBusinessIncome: "",
    businessLocation: "",
    businessGpsAddress: "",
    numberOfWorkers: "",
    yearsInBusiness: "",
    workingCapital: "",
    businessPicture: null,

    // =======================================================
    // REFERENCES
    // =======================================================

    referenceName1: "",
    referencePhone1: "",
    referenceRelationship1: "",

    referenceName2: "",
    referencePhone2: "",
    referenceRelationship2: "",

    referenceName3: "",
    referencePhone3: "",
    referenceRelationship3: "",
  });

  // =========================================================
  // CREATE / GET DRAFT UUID
  // =========================================================

  useEffect(() => {
    if (!user?.userId) return;

    try {
      const storageKey = `kycDraftUuid_${user.userId}`;

      let existingDraftUuid = localStorage.getItem(storageKey);

      if (!existingDraftUuid) {
        existingDraftUuid = crypto.randomUUID();

        localStorage.setItem(storageKey, existingDraftUuid);
      }

      setDraftUuid(existingDraftUuid);
    } catch (err) {
      console.error("Failed to initialize KYC draft UUID:", err);
    }
  }, [user?.userId]);

  // =========================================================
  // CHECK IF KYC EXISTS
  // =========================================================

  useEffect(() => {
    if (!user?.userId) return;

    const checkKyc = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/kyc/check/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();

        if (data.hasKyc) {
          setHasKyc(true);

          setFormData((prev) => ({
            ...prev,
            kycCode: data.kycCode || prev.kycCode,
          }));
        }
      } catch (err) {
        console.error("Failed to check KYC:", err);
      } finally {
        setCheckingKyc(false);
      }
    };

    checkKyc();
  }, [user]);

  // =========================================================
  // AUTOFILL USER INFORMATION
  // =========================================================

  useEffect(() => {
    if (!user) return;

    const fullname = user.fullname || user.fullName || user.full_name || "";

    const nameParts = fullname.trim().split(/\s+/);

    setFormData((prev) => ({
      ...prev,

      userId: user.userId || prev.userId || "",

      kycCode: user.kycCode || prev.kycCode || "",

      firstName: prev.firstName || nameParts[0] || "",

      middleName:
        prev.middleName || (nameParts.length === 3 ? nameParts[1] : ""),

      lastName:
        prev.lastName ||
        (nameParts.length >= 2 ? nameParts[nameParts.length - 1] : ""),

      email: prev.email || user.email || "",

      mobileNumber: prev.mobileNumber || user.phone || "",
    }));
  }, [user]);

  // =========================================================
  // LOAD SAVED DRAFT
  // =========================================================

  useEffect(() => {
    if (!draftUuid || !user?.userId) {
      return;
    }

    let cancelled = false;

    const loadDraft = async () => {
      try {
        setDraftError(false);

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/kyc/draft/${draftUuid}?userId=${user.userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // -----------------------------------------------------
        // NO DRAFT FOUND
        // -----------------------------------------------------

        if (res.status === 404) {
          if (!cancelled) {
            setDraftLoaded(true);
            setDraftDataLoaded(false);
          }

          return;
        }

        // -----------------------------------------------------
        // OTHER HTTP ERROR
        // -----------------------------------------------------

        if (!res.ok) {
          throw new Error(`Draft request failed: ${res.status}`);
        }

        const data = await res.json();

        // -----------------------------------------------------
        // DRAFT FOUND
        // -----------------------------------------------------

        if (!cancelled && data.success && data.draft) {
          const savedFormData = data.draft.formData || {};

          setFormData((prev) => ({
            ...prev,
            ...savedFormData,
            userId: user.userId,
          }));

          const savedStep = Number(data.draft.currentStep);

          if (savedStep >= 1 && savedStep <= 4) {
            setCurrentStep(savedStep);
          }

          setDraftSaved(true);
          setDraftLoaded(true);
          setDraftDataLoaded(true);
        } else {
          setDraftLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load KYC draft:", err);

          setDraftError(true);
          setDraftLoaded(true);
        }
      }
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [draftUuid, user?.userId]);

  // =========================================================
  // CHECK NATIONAL ID DUPLICATE
  // =========================================================

  const checkNationalIdDuplicate = useCallback(async (nationalId) => {
    const cleanId = nationalId?.trim().toUpperCase();

    if (!cleanId) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setCheckingNationalId(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/kyc/check-national-id/${encodeURIComponent(
          cleanId,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        },
      );

      const data = res.ok ? await res.json() : { exists: false };

      if (data.exists) {
        setFormErrors((prev) => ({
          ...prev,

          nationalId: "❌ This National ID is already registered",
        }));

        setNationalIdAvailable(false);
      } else {
        setFormErrors((prev) => {
          const newErrors = {
            ...prev,
          };

          if (newErrors.nationalId?.includes("already registered")) {
            delete newErrors.nationalId;
          }

          return newErrors;
        });

        setNationalIdAvailable(true);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("National ID check failed:", err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setCheckingNationalId(false);
      }
    }
  }, []);

  // =========================================================
  // REAL-TIME NATIONAL ID VALIDATION
  // =========================================================

  useEffect(() => {
    const id = formData.nationalId?.trim();

    if (!id) {
      setNationalIdAvailable(true);
      setCheckingNationalId(false);
      return;
    }

    const formatError = validateNationalId(id, {
      allowPartial: true,
    });

    if (formatError) {
      setFormErrors((prev) => ({
        ...prev,
        nationalId: formatError,
      }));

      setNationalIdAvailable(false);

      return;
    }

    if (nationalIdCheckTimeout.current) {
      clearTimeout(nationalIdCheckTimeout.current);
    }

    setCheckingNationalId(true);

    nationalIdCheckTimeout.current = setTimeout(() => {
      checkNationalIdDuplicate(id);
    }, 600);

    return () => {
      if (nationalIdCheckTimeout.current) {
        clearTimeout(nationalIdCheckTimeout.current);
      }
    };
  }, [formData.nationalId, checkNationalIdDuplicate]);

  // =========================================================
  // REAL-TIME FIELD VALIDATION
  // =========================================================

  const validateField = (name, value) => {
    switch (name) {
      case "mobileNumber":
      case "spouseContact":
      case "alternatePhone":
      case "referencePhone1":
      case "referencePhone2":
      case "referencePhone3": {
        const phoneError = validatePhoneNumber(
          value,
          name.replace(/([A-Z])/g, " $1").toLowerCase(),
        );

        if (phoneError) {
          setFormErrors((prev) => ({
            ...prev,
            [name]: phoneError,
          }));
        } else {
          setFormErrors((prev) => {
            const newErrors = {
              ...prev,
            };

            delete newErrors[name];

            return newErrors;
          });
        }

        break;
      }

      default:
        if (formErrors[name]) {
          setFormErrors((prev) => {
            const newErrors = {
              ...prev,
            };

            delete newErrors[name];

            return newErrors;
          });
        }
    }
  };

  // =========================================================
  // HANDLE TEXT INPUTS
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);

    setDraftSaved(false);

    // Clear previous submit message
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  // =========================================================
  // HANDLE FILE INPUTS
  // =========================================================

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = {
          ...prev,
        };

        delete newErrors[name];

        return newErrors;
      });
    }

    setDraftSaved(false);

    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  // =========================================================
  // PREPARE FORM DATA FOR DRAFT
  // =========================================================

  const getDraftFormData = useCallback(() => {
    const draftData = {
      ...formData,
    };

    // Files are not saved in JSON draft
    delete draftData.avatar;
    delete draftData.payslip;
    delete draftData.ghanaCardFront;
    delete draftData.ghanaCardBack;
    delete draftData.employmentId;
    delete draftData.businessPicture;

    return draftData;
  }, [formData]);

  // =========================================================
  // AUTO-SAVE DRAFT
  // =========================================================

  useEffect(() => {
    if (!user?.userId || !draftUuid || !draftLoaded || submitted) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setDraftSaving(true);
        setDraftError(false);

        const token = localStorage.getItem("token");

        const draftData = getDraftFormData();

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/kyc/save-draft`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              userId: user.userId,

              draftUuid,

              formData: draftData,

              currentStep,
            }),
          },
        );

        if (!res.ok) {
          throw new Error(`Draft save failed: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
          setDraftSaved(true);
        } else {
          setDraftError(true);
        }
      } catch (err) {
        console.error("KYC draft auto-save failed:", err);

        setDraftError(true);
      } finally {
        setDraftSaving(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    formData,
    currentStep,
    draftUuid,
    draftLoaded,
    submitted,
    user?.userId,
    getDraftFormData,
  ]);

  // =========================================================
  // VALIDATE CURRENT STEP
  // =========================================================

  const validateCurrentStep = () => {
    const errors = getStepErrors(formData, currentStep);

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // =========================================================
  // SAVE ALL KYC
  // FINAL SUBMISSION
  // =========================================================

  const saveAllKyc = async () => {
    try {
      const data = new FormData();

      // ---------------------------------------------------
      // USER ID
      // ---------------------------------------------------

      if (!user?.userId) {
        setSubmitMessage({
          type: "error",
          text: "❌ User ID is missing. Please log in again.",
        });

        return false;
      }

      // IMPORTANT:
      // userId is appended ONCE
      data.append("userId", String(user.userId));

      // ---------------------------------------------------
      // DRAFT UUID
      // ---------------------------------------------------

      if (draftUuid) {
        data.append("draftUuid", draftUuid);
      }

      // ---------------------------------------------------
      // APPEND FORM DATA
      // ---------------------------------------------------

      Object.keys(formData).forEach((key) => {
        // userId already added
        if (key === "userId") {
          return;
        }

        const value = formData[key];

        if (value === null || value === undefined || value === "") {
          return;
        }

        data.append(key, value);
      });

      // ---------------------------------------------------
      // DEBUG FORM DATA
      // ---------------------------------------------------

      console.log("========== KYC FORM DATA ==========");

      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            size: value.size,
            type: value.type,
          });
        } else {
          console.log(key, value);
        }
      }

      console.log("===================================");

      // ---------------------------------------------------
      // TOKEN
      // ---------------------------------------------------

      const token = localStorage.getItem("token");

      // ---------------------------------------------------
      // SUBMIT
      // ---------------------------------------------------

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/kyc/save-all-online`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          // DO NOT manually set Content-Type
          // Browser handles multipart/form-data
          body: data,
        },
      );

      // ---------------------------------------------------
      // READ RESPONSE
      // ---------------------------------------------------

      let result;

      try {
        result = await res.json();
      } catch (jsonError) {
        console.error("Backend returned invalid JSON:", jsonError);

        setSubmitMessage({
          type: "error",
          text: `❌ Server returned an invalid response (${res.status}).`,
        });

        return false;
      }

      console.log("========== KYC SERVER RESPONSE ==========");

      console.log(result);

      console.log("==========================================");

      // ---------------------------------------------------
      // HTTP ERROR
      // ---------------------------------------------------

      if (!res.ok) {
        console.error("KYC HTTP ERROR:", {
          status: res.status,
          result,
        });

        const backendMessage =
          result?.message || `Server returned ${res.status}`;

        setSubmitMessage({
          type: "error",

          text: `❌ ${backendMessage}`,
        });

        // National ID error
        if (backendMessage.toLowerCase().includes("national id")) {
          setFormErrors((prev) => ({
            ...prev,

            nationalId: backendMessage,
          }));

          setNationalIdAvailable(false);
        }

        return false;
      }

      // ---------------------------------------------------
      // BACKEND SUCCESS FALSE
      // ---------------------------------------------------

      if (!result.success) {
        console.error("KYC BACKEND ERROR:", result);

        setSubmitMessage({
          type: "error",

          text: result?.message || "❌ KYC submission failed.",
        });

        return false;
      }

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      if (result.success) {
        console.log("✅ KYC submitted successfully");

        console.log("KYC Code:", result.kycCode);

        console.log("Customer Code:", result.customerCode);

        console.log("Draft UUID:", result.draftUuid);

        setFormData((prev) => ({
          ...prev,

          kycCode: result.kycCode || prev.kycCode,
        }));

        return true;
      }

      return false;
    } catch (err) {
      console.error("FINAL KYC SUBMISSION ERROR:", err);

      setSubmitMessage({
        type: "error",

        text: `❌ ${err.message || "Network error. Unable to submit KYC."}`,
      });

      return false;
    }
  };

  // =========================================================
  // STEP NAVIGATION
  // =========================================================

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));

      setFormErrors({});
      setDraftSaved(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));

    setFormErrors({});
    setDraftSaved(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // FINAL SUBMIT
  // =========================================================

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    // Clear previous message
    setSubmitMessage(null);

    // -----------------------------------------------------
    // NATIONAL ID DUPLICATE
    // -----------------------------------------------------

    if (!nationalIdAvailable && formData.nationalId) {
      setSubmitMessage({
        type: "error",

        text: "❌ Cannot submit: This National ID has already been used for KYC verification.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    // -----------------------------------------------------
    // VALIDATE ALL STEPS
    // -----------------------------------------------------

    const { isValid, errors } = validateAllSteps(formData);

    if (!isValid) {
      const allErrors = {
        ...errors.step1,
        ...errors.step2,
        ...errors.step3,
        ...errors.step4,
      };

      setFormErrors(allErrors);

      setSubmitMessage({
        type: "error",

        text: "❌ Please complete all required fields correctly before submitting.",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    // -----------------------------------------------------
    // SUBMIT
    // -----------------------------------------------------

    setSubmitting(true);

    const success = await saveAllKyc();

    setSubmitting(false);

    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    if (success) {
      setSubmitMessage({
        type: "success",

        text: "✅ KYC submitted successfully!",
      });

      setSubmitted(true);

      setDraftSaved(false);

      setDraftDataLoaded(false);
    }

    // IMPORTANT:
    // Do NOT set a generic error here.
    //
    // saveAllKyc() already displays the actual
    // backend error.
  };

  // =========================================================
  // RENDER STEP COMPONENT
  // =========================================================

  const renderStep = () => {
    const stepProps = {
      formData,

      handleInputChange,

      handleFileChange,

      formErrors,

      checkingNationalId,

      nationalIdAvailable,

      user,

      isMobileLocked: false,

      isEmailLocked: false,
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfo {...stepProps} />;

      case 2:
        return <ContactInfo {...stepProps} />;

      case 3:
        return <EmploymentInfo {...stepProps} />;

      case 4:
        return <ReferenceInfo {...stepProps} />;

      default:
        return null;
    }
  };

  // =========================================================
  // RENDER PREVIEW AFTER SUBMIT
  // =========================================================

  const renderPreview = () => (
    <div className="kyc-preview-card">
      <h3 className="kyc-title">✅ KYC Submitted Successfully!</h3>

      <div className="kyc-grid">
        <div className="kyc-item">
          <span className="kyc-label">KYC Code:</span>

          <span className="kyc-value kyc-code-value">
            {formData.kycCode || "Pending"}
          </span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">Name:</span>

          <span className="kyc-value">
            {[
              formData.title,
              formData.firstName,
              formData.middleName,
              formData.lastName,
            ]
              .filter(Boolean)
              .join(" ")}
          </span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">Customer Code:</span>

          <span className="kyc-value">{user?.customerCode || "Generated"}</span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">National ID:</span>

          <span className="kyc-value">{formData.nationalId || "-"}</span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">Email:</span>

          <span className="kyc-value">{formData.email || "-"}</span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">Phone:</span>

          <span className="kyc-value">{formData.mobileNumber || "-"}</span>
        </div>

        <div className="kyc-item">
          <span className="kyc-label">Status:</span>

          <span className="kyc-value">Submitted</span>
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          className="btn-crazy btn-crazy-primary"
          onClick={() => onContinueToLoan?.()}
        >
          Continue to Apply Loan
        </button>
      </div>
    </div>
  );

  // =========================================================
  // DRAFT SUMMARY
  // =========================================================

  const renderDraftSummary = () => {
    if (!draftDataLoaded) {
      return null;
    }

    const excludedFields = [
      "userId",
      "kycCode",
      "avatar",
      "payslip",
      "ghanaCardFront",
      "ghanaCardBack",
      "employmentId",
      "businessPicture",
    ];

    const summary = Object.keys(formData)
      .filter(
        (key) =>
          !excludedFields.includes(key) &&
          formData[key] !== null &&
          formData[key] !== undefined &&
          formData[key] !== "",
      )
      .reduce((acc, key) => {
        acc[key] = formData[key];

        return acc;
      }, {});

    return (
      <div
        className="draft-summary-card"
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4
            style={{
              margin: 0,
            }}
          >
            📄 Draft Summary
          </h4>

          <button
            type="button"
            className="btn-sm"
            onClick={() => setShowDraftSummary(!showDraftSummary)}
          >
            {showDraftSummary ? "Hide" : "Show"}
          </button>
        </div>

        {showDraftSummary && (
          <div
            style={{
              marginTop: "10px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {Object.entries(summary).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      style={{
                        padding: "5px",
                        fontWeight: "bold",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </td>

                    <td
                      style={{
                        padding: "5px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
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

  // =========================================================
  // STEP CARDS
  // =========================================================

  const StepCards = () => {
    const steps = [
      {
        number: 1,
        label: "Personal",
      },
      {
        number: 2,
        label: "Contact",
      },
      {
        number: 3,
        label: "Employment",
      },
      {
        number: 4,
        label: "Reference",
      },
    ];

    return (
      <div className="step-cards-container">
        {steps.map((step) => {
          const isActive = currentStep === step.number;

          const isCompleted = currentStep > step.number;

          const isLocked = step.number > currentStep;

          return (
            <div
              key={step.number}
              className={`step-card ${
                isActive ? "active" : isCompleted ? "completed" : ""
              }`}
              onClick={() => {
                if (!isLocked) {
                  setCurrentStep(step.number);

                  setFormErrors({});

                  setDraftSaved(false);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <div className="step-number">{step.number}</div>

              <div className="step-title">{step.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  // =========================================================
  // MAIN RENDER
  // =========================================================

  return (
    <div>
      {/* ===================================================
          DRAFT RESTORED
      =================================================== */}

      {draftDataLoaded && !submitted && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            ✅ Your saved progress has been restored. You were on Step{" "}
            {currentStep}.
          </span>

          <button
            type="button"
            style={{
              background: "transparent",
              border: "none",
              color: "#155724",
              cursor: "pointer",
              fontSize: "18px",
            }}
            onClick={() => setDraftDataLoaded(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================
          DRAFT LOAD ERROR
      =================================================== */}

      {draftError && !submitted && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            ⚠️ Could not load your saved draft. Your previous progress may be
            lost.
          </span>

          <button
            type="button"
            style={{
              background: "transparent",
              border: "none",
              color: "#721c24",
              cursor: "pointer",
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          DRAFT STATUS
      =================================================== */}

      {!submitted && draftUuid && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
            minHeight: "24px",
            fontSize: "13px",
          }}
        >
          {draftSaving && <span>Saving draft...</span>}

          {!draftSaving && draftSaved && <span>✓ Draft saved</span>}

          {!draftSaving && draftError && <span>⚠ Unable to save draft</span>}
        </div>
      )}

      {/* ===================================================
          DRAFT SUMMARY
      =================================================== */}

      {draftDataLoaded && !submitted && renderDraftSummary()}

      {/* ===================================================
          SUBMISSION ERROR / SUCCESS MESSAGE
      =================================================== */}

      {submitMessage && (
        <div
          style={{
            marginBottom: "20px",

            padding: "14px 16px",

            borderRadius: "8px",

            backgroundColor:
              submitMessage.type === "success" ? "#d4edda" : "#f8d7da",

            color: submitMessage.type === "success" ? "#155724" : "#721c24",

            border:
              submitMessage.type === "success"
                ? "1px solid #c3e6cb"
                : "1px solid #f5c6cb",

            fontWeight: "500",

            wordBreak: "break-word",
          }}
        >
          {submitMessage.text}
        </div>
      )}

      {/* ===================================================
          MAIN KYC FORM
      =================================================== */}

      <KycFormView
        checkingKyc={checkingKyc || !draftLoaded}
        hasKyc={hasKyc}
        submitted={submitted}
        formData={formData}
        renderPreview={renderPreview}
        renderStep={renderStep}
        checkingNationalId={checkingNationalId}
        formErrors={formErrors}
        currentStep={currentStep}
        prevStep={prevStep}
        nextStep={nextStep}
        submitting={submitting}
        nationalIdAvailable={nationalIdAvailable}
        submitMessage={submitMessage}
        handleFinalSubmit={handleFinalSubmit}
        StepCards={StepCards}
        onContinueToLoan={onContinueToLoan}
      />
    </div>
  );
};

export default CustomerCompleteKyc;
