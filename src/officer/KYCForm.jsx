import React, { useState, useEffect, useRef, useCallback } from "react";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import Step1KYC from "./steps/Step1KYC";
import Step2Business from "./steps/Step2Business";
import Step3Loan from "./steps/Step3Loan";
import Step4Reference from "./steps/Step4Reference";
import Step5ClientDocuments from "./steps/Step5ClientDocuments";
import Step6GuarantorDetails from "./steps/Step6GuarantorDetails";
import Step7GuarantorDocuments from "./steps/Step7GuarantorDocuments";
import Step8LoanHistory from "./steps/Step8LoanHistory";

// 🟢 CHANGED: Import IndexedDB helpers instead of using server API
import {
  saveDraftToIndexedDB,
  loadDraftFromIndexedDB,
  deleteDraftFromIndexedDB,
} from "../utils/draftStorage";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/kyc/client`
  : "/api/kyc/client";

const FILE_BASE_URL = process.env.REACT_APP_API_URL || "";

const KYCForm = ({
  formData: parentFormData,
  onChange: parentOnChange,
  onCancel,
  photoPreview: parentPhotoPreview,
  onFileChange: parentOnFileChange,
  userId,
  draftUuid: selectedDraftUuid,
  officerFullName,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const [localFormData, setLocalFormData] = useState({});
  const formData = parentFormData || localFormData;

  const handleLocalChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const onChange = parentOnChange || handleLocalChange;

  const [step, setStep] = useState(1);

  const stepLabels = [
    "KYC",
    "Business",
    "Loan",
    "Reference",
    "Client Documents",
    "Guarantor Details",
    "Guarantor Documents",
    "Loan History",
  ];

  const totalSteps = stepLabels.length;

  const createUuid = () =>
    crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  const [internalDraftUuid] = useState(() => {
    let uuid = localStorage.getItem("client_kyc_draft_uuid");
    if (!uuid) {
      uuid = createUuid();
      localStorage.setItem("client_kyc_draft_uuid", uuid);
    }
    return uuid;
  });

  const draftUuid = selectedDraftUuid || internalDraftUuid;

  const [draftStatus, setDraftStatus] = useState("");
  const saveTimeoutRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const loadingDraftRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ─── SINGLE FILES ──────────────────────────────────────────────
  const [clientPhotoFile, setClientPhotoFile] = useState(null);
  const [clientPhotoPreview, setClientPhotoPreview] = useState(
    parentPhotoPreview || null,
  );
  const [guarantorPhotoFile, setGuarantorPhotoFile] = useState(null);
  const [guarantorPhotoPreview, setGuarantorPhotoPreview] = useState(null);

  // ─── MULTIPLE FILES ────────────────────────────────────────────
  // Each item: { file: File|Blob, name: string, size: number }
  const [collateralPhotos, setCollateralPhotos] = useState([]);
  const [ownershipDocuments, setOwnershipDocuments] = useState([]);
  const [clientDocuments, setClientDocuments] = useState([]);
  const [guarantorDocuments, setGuarantorDocuments] = useState([]);

  const [employeeType, setEmployeeType] = useState("");

  // 🔴 REMOVED: `draftFiles` server‑sync state – no longer needed

  // ─── FILE URL HELPERS ──────────────────────────────────────────
  const getFileUrl = useCallback((file) => {
    if (!file) return null;
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    if (typeof file === "string") {
      if (
        file.startsWith("http://") ||
        file.startsWith("https://") ||
        file.startsWith("data:")
      ) {
        return file;
      }
      return `${FILE_BASE_URL}/uploads/${file
        .replace(/^\/+/, "")
        .replace(/^uploads\/+/i, "")}`;
    }
    return null;
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // ─── CLIENT PHOTO ──────────────────────────────────────────────
  const handleClientPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientPhotoPreview(reader.result);
        if (parentOnFileChange) {
          parentOnFileChange(file);
        }
      };
      reader.readAsDataURL(file);
      setClientPhotoFile(file);
    } else {
      setClientPhotoPreview(null);
      setClientPhotoFile(null);
      if (parentOnFileChange) {
        parentOnFileChange(null);
      }
    }
  };

  // ─── GUARANTOR PHOTO ────────────────────────────────────────────
  const handleGuarantorPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuarantorPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setGuarantorPhotoFile(file);
    } else {
      setGuarantorPhotoPreview(null);
      setGuarantorPhotoFile(null);
    }
  };

  // ─── STEP NAVIGATION ────────────────────────────────────────────
  const handleNext = (currentStep) => {
    if (currentStep < totalSteps) {
      setStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
    setError(null);
  };

  // ─── 🟢 CHANGED: SAVE DRAFT LOCALLY (IndexedDB) ──────────────
  const saveDraftLocally = useCallback(async () => {
    if (!userId || !draftUuid) {
      setDraftStatus(!userId ? "User not logged in" : "Draft ID missing");
      return;
    }

    if (loadingDraftRef.current) return;

    try {
      setDraftStatus("...");

      // Build a serializable structure.
      // For files, we store the actual Blob/File object (IndexedDB supports it).
      const draftData = {
        formData: formData,
        currentStep: step,
        officerId: userId,
        clientPhoto: clientPhotoFile instanceof File ? clientPhotoFile : null,
        guarantorPhoto:
          guarantorPhotoFile instanceof File ? guarantorPhotoFile : null,
        collateralPhotos: collateralPhotos.map((item) => ({
          file: item.file instanceof File ? item.file : null,
          name: item.name || "Photo",
          size: item.size || 0,
        })),
        ownershipDocuments: ownershipDocuments.map((item) => ({
          file: item.file instanceof File ? item.file : null,
          name: item.name || "Document",
          size: item.size || 0,
        })),
        clientDocuments: clientDocuments.map((item) => ({
          file: item.file instanceof File ? item.file : null,
          name: item.name || "Document",
          size: item.size || 0,
        })),
        guarantorDocuments: guarantorDocuments.map((item) => ({
          file: item.file instanceof File ? item.file : null,
          name: item.name || "Document",
          size: item.size || 0,
        })),
        employeeType: employeeType,
      };

      await saveDraftToIndexedDB(draftUuid, draftData);
      setDraftStatus(` ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("IndexedDB save error:", err);
      setDraftStatus("Local save failed");
    }
  }, [
    userId,
    draftUuid,
    formData,
    step,
    clientPhotoFile,
    guarantorPhotoFile,
    collateralPhotos,
    ownershipDocuments,
    clientDocuments,
    guarantorDocuments,
    employeeType,
  ]);

  // ─── AUTOSAVE (every 2s after changes) ─────────────────────────
  useEffect(() => {
    if (!userId || !draftLoadedRef.current || loadingDraftRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveDraftLocally, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveDraftLocally, userId]);

  // ─── 🟢 CHANGED: LOAD DRAFT FROM INDEXEDDB ────────────────────
  useEffect(() => {
    if (draftLoadedRef.current || !userId || !draftUuid) {
      return;
    }

    loadingDraftRef.current = true;

    const loadDraft = async () => {
      try {
        const saved = await loadDraftFromIndexedDB(draftUuid);

        if (saved) {
          const savedFormData = saved.formData || {};

          // Populate form data
          if (parentFormData) {
            Object.entries(savedFormData).forEach(([key, value]) => {
              parentOnChange?.({ target: { name: key, value } });
            });
          } else {
            setLocalFormData(savedFormData);
          }

          if (saved.currentStep) {
            setStep(Number(saved.currentStep));
          }

          // Restore single photos (Blob/File)
          if (saved.clientPhoto instanceof Blob) {
            const file = new File([saved.clientPhoto], "client_photo.jpg", {
              type: saved.clientPhoto.type || "image/jpeg",
            });
            setClientPhotoFile(file);
            const preview = URL.createObjectURL(file);
            setClientPhotoPreview(preview);
          } else {
            setClientPhotoFile(null);
            setClientPhotoPreview(null);
          }

          if (saved.guarantorPhoto instanceof Blob) {
            const file = new File(
              [saved.guarantorPhoto],
              "guarantor_photo.jpg",
              {
                type: saved.guarantorPhoto.type || "image/jpeg",
              },
            );
            setGuarantorPhotoFile(file);
            const preview = URL.createObjectURL(file);
            setGuarantorPhotoPreview(preview);
          } else {
            setGuarantorPhotoFile(null);
            setGuarantorPhotoPreview(null);
          }

          // Restore multiple file arrays
          if (Array.isArray(saved.collateralPhotos)) {
            setCollateralPhotos(
              saved.collateralPhotos.map((item) => ({
                file:
                  item.file instanceof Blob
                    ? new File([item.file], item.name, { type: item.file.type })
                    : null,
                name: item.name || "Photo",
                size: item.size || 0,
              })),
            );
          }

          if (Array.isArray(saved.ownershipDocuments)) {
            setOwnershipDocuments(
              saved.ownershipDocuments.map((item) => ({
                file:
                  item.file instanceof Blob
                    ? new File([item.file], item.name, { type: item.file.type })
                    : null,
                name: item.name || "Document",
                size: item.size || 0,
              })),
            );
          }

          if (Array.isArray(saved.clientDocuments)) {
            setClientDocuments(
              saved.clientDocuments.map((item) => ({
                file:
                  item.file instanceof Blob
                    ? new File([item.file], item.name, { type: item.file.type })
                    : null,
                name: item.name || "Document",
                size: item.size || 0,
              })),
            );
          }

          if (Array.isArray(saved.guarantorDocuments)) {
            setGuarantorDocuments(
              saved.guarantorDocuments.map((item) => ({
                file:
                  item.file instanceof Blob
                    ? new File([item.file], item.name, { type: item.file.type })
                    : null,
                name: item.name || "Document",
                size: item.size || 0,
              })),
            );
          }

          if (saved.employeeType) {
            setEmployeeType(saved.employeeType);
          }

          setDraftStatus("");
        } else {
          setDraftStatus("");
        }
      } catch (err) {
        console.error("Load local draft error:", err);
        setDraftStatus("Unable to load local draft");
      } finally {
        draftLoadedRef.current = true;
        loadingDraftRef.current = false;
      }
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, draftUuid]); // Only run once on mount

  // ─── 🟢 CHANGED: SUBMIT (removed draftFiles JSON, added local cleanup) ──
  const submitAll = async () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("userId", String(userId));
      // We still send draftUuid so the backend can use it if needed (though we removed the DB update)
      fd.append("draftUuid", draftUuid);

      // 🔴 REMOVED: fd.append("draftFiles", JSON.stringify(...)) – no longer needed

      // ── TEXT FIELDS (unchanged) ──
      const textFields = {
        firstName: formData.firstName,
        surname: formData.surname,
        middleName: formData.middleName,
        popularName: formData.popularName,
        phone: formData.phone,
        altPhone: formData.altPhone,
        hometown: formData.hometown,
        placeOfBirth: formData.placeOfBirth,
        ghanaCardNumber: formData.ghanaCardNumber,
        dateIssued: formData.dateIssued,
        expiryDate: formData.expiryDate,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        fatherName: formData.fatherName,
        fatherContact: formData.fatherContact,
        motherName: formData.motherName,
        motherContact: formData.motherContact,
        spouseName: formData.spouseName,
        spouseContact: formData.spouseContact,
        spouseOccupation: formData.spouseOccupation,
        residentialLocation: formData.residentialLocation,
        district: formData.district,
        residentialOwnership: formData.residentialOwnership,
        nearestLandmark: formData.nearestLandmark,
        gpsAddress: formData.gpsAddress,
        yearsAtAddress: formData.yearsAtAddress,
        rentAdvance: formData.rentAdvance,
        numberOfDependents: formData.numberOfDependents,
        householdMembers: formData.householdMembers,
        dependentsSchooling: formData.dependentsSchooling,
        religion: formData.religion,
        churchName: formData.churchName,
        churchLocation: formData.churchLocation,
        pastorName: formData.pastorName,
        pastorContact: formData.pastorContact,
        officerName: officerFullName || "",
        businessName: formData.businessName,
        businessSector: formData.businessSector,
        typesOfBusiness: formData.typesOfBusiness,
        businessDescription: formData.businessDescription,
        businessLocation: formData.businessLocation,
        businessLocationStatus: formData.businessLocationStatus,
        workingCapital: formData.workingCapital,
        stockValue: formData.stockValue,
        businessGpsAddress: formData.businessGpsAddress,
        yearsInBusiness: formData.yearsInBusiness,
        businessLandmark: formData.businessLandmark,
        minimumSale: formData.minimumSale,
        maximumSale: formData.maximumSale,
        loanAmount: formData.loanAmount,
        loanPurpose: formData.loanPurpose,
        loanTerm: formData.loanTerm,
        weeklyInstallment: formData.weeklyInstallment,
        repaymentAmount: formData.repaymentAmount,
        previousLoanRequest: formData.previousLoanRequest,
        previousLoanApproved: formData.previousLoanApproved,
        expectedDueDate: formData.expectedDueDate,
        actualDueDate: formData.actualDueDate,
        repaymentFrequency: formData.repaymentFrequency,
        existingLoanBalance: formData.existingLoanBalance,
        loanNeedReason: formData.loanNeedReason,
        whatIfNotApproved: formData.whatIfNotApproved,
        comfortableRepayment: formData.comfortableRepayment,
        existingDebtRepayment: formData.existingDebtRepayment,
        securityType: formData.securityType,
        securityDescription: formData.securityDescription,
        securityOwner: formData.securityOwner,
        securityPurchaseDate: formData.securityPurchaseDate,
        securityMarketValue: formData.securityMarketValue,
        securityForcedSaleValue: formData.securityForcedSaleValue,
        securitySerial: formData.securitySerial,
        securityRegistration: formData.securityRegistration,
        securityVerificationStatus: formData.securityVerificationStatus,
        securityEncumbrances: formData.securityEncumbrances,
        prevRepaymentBehaviour: formData.prevRepaymentBehaviour,
        totalBorrowed: formData.totalBorrowed,
        loanCycleCompleted: formData.loanCycleCompleted,
        maxPastDueDays: formData.maxPastDueDays,
        missedInstalments: formData.missedInstalments,
        totalArrears: formData.totalArrears,
        writeOffLoans: formData.writeOffLoans,
        extensions: formData.extensions,
        numberOfPayOff: formData.numberOfPayOff,
        currentOutstandingBalance: formData.currentOutstandingBalance,
        avgRepaymentPerformance: formData.avgRepaymentPerformance,
        visitBusiness: formData.visitBusiness,
        businessOperating: formData.businessOperating,
        observedSalesCorrespondence: formData.observedSalesCorrespondence,
        dailyCustomerVolume: formData.dailyCustomerVolume,
        keyRiskObserved: formData.keyRiskObserved,
        knownClientSince: formData.knownClientSince,
        adverseInfo: formData.adverseInfo,
        repaymentConcerns: formData.repaymentConcerns,
        verifiedMonthlyIncome: formData.verifiedMonthlyIncome,
        reasonableRepayment: formData.reasonableRepayment,
        recommendedAmount: formData.recommendedAmount,
        recommendedTerm: formData.recommendedTerm,
        recommendationReason: formData.recommendationReason,
        guarantorEmployeeType: employeeType,
        guarantorRank: formData.guarantorRank,
        guarantorNameOfEmployer: formData.guarantorNameOfEmployer,
        guarantorWorkLocation: formData.guarantorWorkLocation,
        guarantorYearsInService: formData.guarantorYearsInService,
        guarantorBusinessName: formData.guarantorBusinessName,
        guarantorBusinessLocation: formData.guarantorBusinessLocation,
        guarantorYearsInBusiness: formData.guarantorYearsInBusiness,
        guarantorFirstName: formData.guarantorFirstName,
        guarantorLastName: formData.guarantorLastName,
        guarantorMiddleName: formData.guarantorMiddleName,
        guarantorPhone: formData.guarantorPhone,
        guarantorAltPhone: formData.guarantorAltPhone,
        guarantorIdNumber: formData.guarantorIdNumber,
        guarantorRelationship: formData.guarantorRelationship,
        guarantorAddress: formData.guarantorAddress,
        guarantorResidenceLocation: formData.guarantorResidenceLocation,
        guarantorChurchName: formData.guarantorChurchName,
        guarantorChurchLocation: formData.guarantorChurchLocation,
      };

      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fd.append(key, value);
        }
      });

      // REFERENCES
      const references = formData.references || [];
      if (references.length > 0) {
        fd.append("references", JSON.stringify(references));
      }

      // LOAN HISTORY
      const loans = formData.loans || [];
      if (loans.length > 0) {
        fd.append("loans", JSON.stringify(loans));
      }

      // ── APPEND FILES ──
      // Client Photo
      if (clientPhotoFile instanceof File) {
        fd.append("clientPhoto", clientPhotoFile);
      }

      // Guarantor Photo
      if (guarantorPhotoFile instanceof File) {
        fd.append("guarantorPhoto", guarantorPhotoFile);
      }

      // Collateral Photos
      collateralPhotos.forEach((doc, index) => {
        if (doc?.file instanceof File) {
          fd.append(`collateralPhotos[${index}][file]`, doc.file);
        }
        fd.append(
          `collateralPhotos[${index}][name]`,
          doc.name || `Photo ${index + 1}`,
        );
      });

      // Ownership Documents
      ownershipDocuments.forEach((doc, index) => {
        if (doc?.file instanceof File) {
          fd.append(`ownershipDocuments[${index}][file]`, doc.file);
        }
        fd.append(
          `ownershipDocuments[${index}][name]`,
          doc.name || `Document ${index + 1}`,
        );
      });

      // Client Documents
      clientDocuments.forEach((doc, index) => {
        if (doc?.file instanceof File) {
          fd.append(`clientDocuments[${index}][file]`, doc.file);
        }
        fd.append(
          `clientDocuments[${index}][name]`,
          doc?.name || doc?.originalFilename || `Document ${index + 1}`,
        );
      });

      // Guarantor Documents
      guarantorDocuments.forEach((doc, index) => {
        if (doc?.file instanceof File) {
          fd.append(`guarantorDocuments[${index}][file]`, doc.file);
        }
        fd.append(
          `guarantorDocuments[${index}][name]`,
          doc?.name || doc?.originalFilename || `Document ${index + 1}`,
        );
      });

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Submission failed");
      }

      // 🟢 CHANGED: Delete local draft from IndexedDB
      await deleteDraftFromIndexedDB(draftUuid);

      // Remove UUID from localStorage if it's an internal draft
      if (
        !selectedDraftUuid &&
        localStorage.getItem("client_kyc_draft_uuid") === draftUuid
      ) {
        localStorage.removeItem("client_kyc_draft_uuid");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("KYC submission error:", err);
      setError(err.message || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  // ─── SUCCESS MODAL ──────────────────────────────────────────────
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    if (onCancel) {
      onCancel();
    }
  };

  // ─── STYLES ─────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    background: "#fff",
  };

  const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
    fontFamily: "inherit",
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "#818cf8";
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = "#e2e8f0";
  };

  // ─── COMMON STEP PROPS ──────────────────────────────────────────
  const stepProps = {
    formData,
    onChange,
    isMobile,
    inputStyle,
    selectStyle,
    textareaStyle,
    focusStyle,
    blurStyle,
  };

  // ─── STEP-SPECIFIC PROPS ────────────────────────────────────────
  const step1Props = {
    ...stepProps,
    photoPreview: clientPhotoPreview,
    onFileChange: handleClientPhotoChange,
    onNext: () => handleNext(1),
    onCancel,
    officerFullName,
  };

  const step2Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(2),
  };

  const step3Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(3),
    collateralPhotos,
    ownershipDocuments,
    onCollateralPhotosChange: setCollateralPhotos,
    onOwnershipDocumentsChange: setOwnershipDocuments,
  };

  const step4Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () => handleNext(4),
  };

  const step5Props = {
    ...stepProps,
    clientDocuments,
    handleAddClientDocuments: (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setClientDocuments((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          name: file.name,
          size: file.size,
        })),
      ]);
      e.target.value = "";
    },
    removeClientDocument: (index) =>
      setClientDocuments((prev) => prev.filter((_, i) => i !== index)),
    renameClientDocument: (index, newName) => {
      setClientDocuments((prev) => {
        const updated = [...prev];
        if (!updated[index]) return prev;
        updated[index] = { ...updated[index], name: newName };
        return updated;
      });
    },
    formatSize,
    onBack: handleBack,
    onNext: () => handleNext(5),
  };

  const step6Props = {
    ...stepProps,
    guarantorPhotoPreview,
    handleGuarantorPhotoChange,
    employeeType,
    handleEmployeeTypeChange: (e) => {
      const value = e.target.value;
      setEmployeeType(value);
      onChange({
        target: {
          name: "guarantorEmployeeType",
          value,
        },
      });
    },
    onBack: handleBack,
    onNext: () => handleNext(6),
  };

  const step7Props = {
    ...stepProps,
    guarantorDocuments,
    handleAddGuarantorDocuments: (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setGuarantorDocuments((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          name: file.name,
          size: file.size,
        })),
      ]);
      e.target.value = "";
    },
    removeGuarantorDocument: (index) =>
      setGuarantorDocuments((prev) => prev.filter((_, i) => i !== index)),
    renameGuarantorDocument: (index, newName) => {
      setGuarantorDocuments((prev) => {
        const updated = [...prev];
        if (!updated[index]) return prev;
        updated[index] = { ...updated[index], name: newName };
        return updated;
      });
    },
    formatSize,
    onBack: handleBack,
    onNext: () => handleNext(7),
  };

  const step8Props = {
    ...stepProps,
    onBack: handleBack,
    onSubmit: submitAll,
    officerFullName,
  };

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: isMobile ? "20px" : "32px",
          border: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <MdArrowBack size={18} />
          Back to applications
        </button>

        {/* STEP INDICATOR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            padding: "0 4px",
            gap: isMobile ? "4px" : "8px",
            flexWrap: "wrap",
          }}
        >
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isCompleted = step > stepNumber;

            return (
              <React.Fragment key={index}>
                <span
                  style={{
                    fontSize: isMobile ? "10px" : "13px",
                    fontWeight: isActive ? "700" : isCompleted ? "500" : "400",
                    color: isActive
                      ? "#1e293b"
                      : isCompleted
                        ? "#f37712"
                        : "#94a3b8",
                    borderBottom: isActive ? "2px solid #fc821f" : "none",
                    paddingBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                {index < totalSteps - 1 && (
                  <span
                    style={{
                      color: step > index + 1 ? "#090efa" : "#e2e8f0",
                      fontWeight: "300",
                      fontSize: isMobile ? "12px" : "16px",
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* DRAFT STATUS */}
        {draftStatus && (
          <div
            style={{
              marginBottom: "16px",
              padding: "9px 12px",
              borderRadius: "8px",
              background: "#f8fafc",
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {draftStatus}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* SAVING INDICATOR */}
        {saving && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#3b82f6",
            }}
          >
            Saving... please wait.
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && <Step1KYC {...step1Props} />}
          {step === 2 && <Step2Business {...step2Props} />}
          {step === 3 && <Step3Loan {...step3Props} />}
          {step === 4 && <Step4Reference {...step4Props} />}
          {step === 5 && <Step5ClientDocuments {...step5Props} />}
          {step === 6 && <Step6GuarantorDetails {...step6Props} />}
          {step === 7 && <Step7GuarantorDocuments {...step7Props} />}
          {step === 8 && <Step8LoanHistory {...step8Props} />}
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={closeSuccessModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "40px 32px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdCheckCircle size={48} color="#22c55e" />
              </div>
            </div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1e293b",
                margin: "0 0 8px 0",
              }}
            >
              Application Submitted!
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
              }}
            >
              Your KYC application has been successfully submitted. We will
              review it and get back to you shortly.
            </p>

            <button
              type="button"
              onClick={closeSuccessModal}
              style={{
                padding: "10px 32px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
};

export default KYCForm;
