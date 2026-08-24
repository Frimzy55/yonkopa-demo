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

import {
  saveOfflineDraft,
  getOfflineDraft,
  getPendingOfflineDrafts,
  markDraftSynced,
} from "./offlineKycDb";

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
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random()}`;

  const [internalDraftUuid] = useState(() => {
    let uuid = localStorage.getItem(
      "client_kyc_draft_uuid"
    );

    if (!uuid) {
      uuid = createUuid();
      localStorage.setItem(
        "client_kyc_draft_uuid",
        uuid
      );
    }

    return uuid;
  });

  const draftUuid =
    selectedDraftUuid || internalDraftUuid;

  const [draftStatus, setDraftStatus] = useState("");
  const saveTimeoutRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const loadingDraftRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  // ============================================================
  // SINGLE FILES
  // ============================================================

  const [clientPhotoFile, setClientPhotoFile] =
    useState(null);

  const [clientPhotoPreview, setClientPhotoPreview] =
    useState(parentPhotoPreview || null);

  const [guarantorPhotoFile, setGuarantorPhotoFile] =
    useState(null);

  const [guarantorPhotoPreview, setGuarantorPhotoPreview] =
    useState(null);

  // ============================================================
  // MULTIPLE COLLATERAL / OWNERSHIP FILES
  // ============================================================

  const [collateralPhotos, setCollateralPhotos] =
    useState([]);

  const [ownershipDocuments, setOwnershipDocuments] =
    useState([]);

  // ============================================================
  // OTHER MULTIPLE DOCUMENTS
  // ============================================================

  const [clientDocuments, setClientDocuments] =
    useState([]);

  const [guarantorDocuments, setGuarantorDocuments] =
    useState([]);

  const [employeeType, setEmployeeType] =
    useState("");

  // ============================================================
  // SERVER-SAVED FILE METADATA
  // ============================================================

  const [draftFiles, setDraftFiles] = useState({
    clientPhoto: null,
    guarantorPhoto: null,
    collateralPhotos: [],
    ownershipDocuments: [],
    clientDocuments: [],
    guarantorDocuments: [],
  });

  // ============================================================
  // FILE URL
  // ============================================================

  const getFileUrl = useCallback((filePath) => {
    if (!filePath) return null;

    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://") ||
      filePath.startsWith("data:")
    ) {
      return filePath;
    }

    return `${FILE_BASE_URL}/uploads/${filePath
      .replace(/^\/+/, "")
      .replace(/^uploads\/+/i, "")}`;
  }, []);

  // ============================================================
  // FILE SIZE
  // ============================================================

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1048576) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // ============================================================
  // NETWORK
  // ============================================================

  const isNetworkAvailable = () => {
    return (
      typeof navigator !== "undefined" &&
      navigator.onLine
    );
  };

  // ============================================================
  // FILE APPENDER
  // ============================================================

  const appendFileToFormData = (
    fd,
    fieldName,
    file
  ) => {
    if (!file) return;

    if (
      file instanceof File ||
      file instanceof Blob
    ) {
      fd.append(
        fieldName,
        file,
        file.name || "file"
      );
    }
  };

  // ============================================================
  // BUILD DRAFT FORMDATA
  // ============================================================

  const buildDraftFormData = ({
    userId,
    draftUuid,
    currentStep,
    formData,
    draftFiles,
    clientPhotoFile,
    guarantorPhotoFile,
    collateralPhotos,
    ownershipDocuments,
    clientDocuments,
    guarantorDocuments,
  }) => {
    const fd = new FormData();

    fd.append("userId", String(userId));
    fd.append("draftUuid", String(draftUuid));
    fd.append(
      "currentStep",
      String(currentStep)
    );

    fd.append(
      "formData",
      JSON.stringify(formData || {})
    );

    const draftFilesPayload = {
      clientPhoto:
        draftFiles?.clientPhoto || null,

      guarantorPhoto:
        draftFiles?.guarantorPhoto || null,

      collateralPhotos:
        (collateralPhotos || []).map((doc) => ({
          name:
            doc?.name || "Photo",
          fileSize:
            doc?.size ||
            doc?.fileSize ||
            0,
          filePath:
            doc?.filePath || null,
        })),

      ownershipDocuments:
        (ownershipDocuments || []).map(
          (doc) => ({
            name:
              doc?.name || "Document",
            fileSize:
              doc?.size ||
              doc?.fileSize ||
              0,
            filePath:
              doc?.filePath || null,
          })
        ),

      clientDocuments:
        (clientDocuments || []).map(
          (doc) => ({
            name:
              doc?.name ||
              doc?.originalFilename ||
              "Document",
            fileSize:
              doc?.size ||
              doc?.fileSize ||
              0,
            filePath:
              doc?.filePath || null,
          })
        ),

      guarantorDocuments:
        (guarantorDocuments || []).map(
          (doc) => ({
            name:
              doc?.name ||
              doc?.originalFilename ||
              "Document",
            fileSize:
              doc?.size ||
              doc?.fileSize ||
              0,
            filePath:
              doc?.filePath || null,
          })
        ),
    };

    fd.append(
      "draftFiles",
      JSON.stringify(draftFilesPayload)
    );

    // ========================================================
    // CLIENT PHOTO - SINGLE
    // ========================================================

    appendFileToFormData(
      fd,
      "clientPhoto",
      clientPhotoFile
    );

    // ========================================================
    // GUARANTOR PHOTO - SINGLE
    // ========================================================

    appendFileToFormData(
      fd,
      "guarantorPhoto",
      guarantorPhotoFile
    );

    // ========================================================
    // COLLATERAL PHOTOS - MULTIPLE
    // ========================================================

    (collateralPhotos || []).forEach(
      (doc, index) => {
        if (doc?.file) {
          appendFileToFormData(
            fd,
            `collateralPhotos[${index}][file]`,
            doc.file
          );
        }

        fd.append(
          `collateralPhotos[${index}][name]`,
          doc?.name ||
            `Photo ${index + 1}`
        );

        if (doc?.filePath) {
          fd.append(
            `collateralPhotos[${index}][filePath]`,
            doc.filePath
          );
        }
      }
    );

    // ========================================================
    // OWNERSHIP DOCUMENTS - MULTIPLE
    // ========================================================

    (ownershipDocuments || []).forEach(
      (doc, index) => {
        if (doc?.file) {
          appendFileToFormData(
            fd,
            `ownershipDocuments[${index}][file]`,
            doc.file
          );
        }

        fd.append(
          `ownershipDocuments[${index}][name]`,
          doc?.name ||
            `Document ${index + 1}`
        );

        if (doc?.filePath) {
          fd.append(
            `ownershipDocuments[${index}][filePath]`,
            doc.filePath
          );
        }
      }
    );

    // ========================================================
    // CLIENT DOCUMENTS - MULTIPLE
    // ========================================================

    (clientDocuments || []).forEach(
      (doc, index) => {
        if (doc?.file) {
          appendFileToFormData(
            fd,
            `clientDocuments[${index}][file]`,
            doc.file
          );
        }

        fd.append(
          `clientDocuments[${index}][name]`,
          doc?.name ||
            doc?.originalFilename ||
            `Document ${index + 1}`
        );

        if (doc?.filePath) {
          fd.append(
            `clientDocuments[${index}][filePath]`,
            doc.filePath
          );
        }
      }
    );

    // ========================================================
    // GUARANTOR DOCUMENTS - MULTIPLE
    // ========================================================

    (guarantorDocuments || []).forEach(
      (doc, index) => {
        if (doc?.file) {
          appendFileToFormData(
            fd,
            `guarantorDocuments[${index}][file]`,
            doc.file
          );
        }

        fd.append(
          `guarantorDocuments[${index}][name]`,
          doc?.name ||
            doc?.originalFilename ||
            `Document ${index + 1}`
        );

        if (doc?.filePath) {
          fd.append(
            `guarantorDocuments[${index}][filePath]`,
            doc.filePath
          );
        }
      }
    );

    return fd;
  };

  // ============================================================
  // CLIENT PHOTO
  // ============================================================

  const handleClientPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setClientPhotoPreview(
          reader.result
        );

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

  // ============================================================
  // GUARANTOR PHOTO
  // ============================================================

  const handleGuarantorPhotoChange = (file) => {
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setGuarantorPhotoPreview(
          reader.result
        );
      };

      reader.readAsDataURL(file);

      setGuarantorPhotoFile(file);
    } else {
      setGuarantorPhotoPreview(null);
      setGuarantorPhotoFile(null);
    }
  };

  // ============================================================
  // STEP NAVIGATION
  // ============================================================

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

  // ============================================================
  // SAVE DRAFT - OFFLINE FIRST
  // ============================================================

  const saveDraft = useCallback(async () => {
    if (!userId || !draftUuid) {
      setDraftStatus(
        !userId
          ? "User not logged in"
          : "Draft ID missing"
      );
      return;
    }

    if (loadingDraftRef.current) {
      return;
    }

    try {
      setDraftStatus("Saving...");

      // ======================================================
      // ALWAYS SAVE TO INDEXEDDB FIRST
      // ======================================================

      await saveOfflineDraft({
        userId,
        draftUuid,
        formData,
        currentStep: step,
        draftFiles,
        clientPhotoFile,
        guarantorPhotoFile,
        collateralPhotos,
        ownershipDocuments,
        clientDocuments,
        guarantorDocuments,
      });

      // ======================================================
      // NO INTERNET
      // ======================================================

      if (!isNetworkAvailable()) {
        setDraftStatus(
          "Saved offline"
        );
        return;
      }

      // ======================================================
      // INTERNET AVAILABLE
      // ======================================================

      const fd = buildDraftFormData({
        userId,
        draftUuid,
        currentStep: step,
        formData,
        draftFiles,
        clientPhotoFile,
        guarantorPhotoFile,
        collateralPhotos,
        ownershipDocuments,
        clientDocuments,
        guarantorDocuments,
      });

      const res = await fetch(
        `${API_BASE}/save-draft`,
        {
          method: "POST",
          body: fd,
        }
      );

      if (!res.ok) {
        throw new Error(
          `Server returned ${res.status}`
        );
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Draft save failed"
        );
      }

      // ======================================================
      // MARK LOCAL COPY AS SYNCED
      // ======================================================

      await markDraftSynced(
        userId,
        draftUuid
      );

      // ======================================================
      // UPDATE SERVER FILE METADATA
      // ======================================================

      if (data.draftFiles) {
        setDraftFiles(
          data.draftFiles
        );

        if (
          Array.isArray(
            data.draftFiles
              .collateralPhotos
          )
        ) {
          setCollateralPhotos(
            (prev) =>
              data.draftFiles
                .collateralPhotos.map(
                  (
                    savedDoc,
                    index
                  ) => {
                    const current =
                      prev[index] || {};

                    return {
                      ...current,
                      ...savedDoc,
                      name:
                        current.name ||
                        savedDoc.name,
                      size:
                        savedDoc.fileSize ??
                        current.size ??
                        0,
                      file: null,
                    };
                  }
                )
          );
        }

        if (
          Array.isArray(
            data.draftFiles
              .ownershipDocuments
          )
        ) {
          setOwnershipDocuments(
            (prev) =>
              data.draftFiles
                .ownershipDocuments.map(
                  (
                    savedDoc,
                    index
                  ) => {
                    const current =
                      prev[index] || {};

                    return {
                      ...current,
                      ...savedDoc,
                      name:
                        current.name ||
                        savedDoc.name,
                      size:
                        savedDoc.fileSize ??
                        current.size ??
                        0,
                      file: null,
                    };
                  }
                )
          );
        }

        if (
          Array.isArray(
            data.draftFiles
              .clientDocuments
          )
        ) {
          setClientDocuments(
            (prev) =>
              data.draftFiles
                .clientDocuments.map(
                  (
                    savedDoc,
                    index
                  ) => {
                    const current =
                      prev[index] || {};

                    return {
                      ...current,
                      ...savedDoc,
                      name:
                        current.name ||
                        savedDoc.name,
                      size:
                        savedDoc.fileSize ??
                        current.size ??
                        0,
                      file: null,
                    };
                  }
                )
          );
        }

        if (
          Array.isArray(
            data.draftFiles
              .guarantorDocuments
          )
        ) {
          setGuarantorDocuments(
            (prev) =>
              data.draftFiles
                .guarantorDocuments.map(
                  (
                    savedDoc,
                    index
                  ) => {
                    const current =
                      prev[index] || {};

                    return {
                      ...current,
                      ...savedDoc,
                      name:
                        current.name ||
                        savedDoc.name,
                      size:
                        savedDoc.fileSize ??
                        current.size ??
                        0,
                      file: null,
                    };
                  }
                )
          );
        }

        setClientPhotoFile(null);
        setGuarantorPhotoFile(null);
      }
       
      setDraftStatus(
        ` ${new Date().toLocaleTimeString()}`
      );
    } catch (err) {
      console.error(
        "Online draft save failed. Keeping offline copy:",
        err
      );

      setDraftStatus(
        "Saved offline - waiting for internet"
      );
    }
  }, [
    userId,
    draftUuid,
    formData,
    step,
    draftFiles,
    clientPhotoFile,
    guarantorPhotoFile,
    collateralPhotos,
    ownershipDocuments,
    clientDocuments,
    guarantorDocuments,
  ]);

  // ============================================================
  // AUTOSAVE EVERY 2 SECONDS AFTER CHANGES
  // ============================================================

  useEffect(() => {
    if (
      !userId ||
      !draftLoadedRef.current ||
      loadingDraftRef.current
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(
        saveTimeoutRef.current
      );
    }

    saveTimeoutRef.current = setTimeout(
      saveDraft,
      2000
    );

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(
          saveTimeoutRef.current
        );
      }
    };
  }, [
    saveDraft,
    userId,
  ]);

  // ============================================================
  // LOAD DRAFT
  //
  // PRIORITY:
  // 1. IndexedDB
  // 2. Server
  // ============================================================

  useEffect(() => {
    if (
      draftLoadedRef.current ||
      !userId ||
      !draftUuid
    ) {
      return;
    }

    loadingDraftRef.current = true;

    const loadDraft = async () => {
      let loaded = false;

      try {
        // ======================================================
        // 1. CHECK INDEXEDDB FIRST
        // ======================================================

        const offlineDraft =
          await getOfflineDraft(
            userId,
            draftUuid
          );

        if (offlineDraft) {
          console.log(
            "Loading KYC draft from IndexedDB"
          );

          const savedFormData =
            offlineDraft.formData || {};

          if (parentFormData) {
            Object.entries(
              savedFormData
            ).forEach(
              ([key, value]) => {
                parentOnChange?.({
                  target: {
                    name: key,
                    value,
                  },
                });
              }
            );
          } else {
            setLocalFormData(
              savedFormData
            );
          }

          if (
            offlineDraft.currentStep
          ) {
            setStep(
              Number(
                offlineDraft.currentStep
              )
            );
          }

          const savedFiles =
            offlineDraft.draftFiles || {
              clientPhoto: null,
              guarantorPhoto: null,
              collateralPhotos: [],
              ownershipDocuments: [],
              clientDocuments: [],
              guarantorDocuments: [],
            };

          setDraftFiles(
            savedFiles
          );

          // ====================================================
          // CLIENT PHOTO
          // ====================================================

          if (
            offlineDraft.clientPhotoFile
          ) {
            const url =
              URL.createObjectURL(
                offlineDraft.clientPhotoFile
              );

            setClientPhotoPreview(
              url
            );
          } else if (
            savedFiles.clientPhoto
              ?.filePath
          ) {
            setClientPhotoPreview(
              getFileUrl(
                savedFiles
                  .clientPhoto
                  .filePath
              )
            );
          }

          // ====================================================
          // GUARANTOR PHOTO
          // ====================================================

          if (
            offlineDraft.guarantorPhotoFile
          ) {
            const url =
              URL.createObjectURL(
                offlineDraft.guarantorPhotoFile
              );

            setGuarantorPhotoPreview(
              url
            );
          } else if (
            savedFiles
              .guarantorPhoto
              ?.filePath
          ) {
            setGuarantorPhotoPreview(
              getFileUrl(
                savedFiles
                  .guarantorPhoto
                  .filePath
              )
            );
          }

          // ====================================================
          // COLLATERAL PHOTOS
          // ====================================================

          if (
            Array.isArray(
              offlineDraft
                .collateralPhotos
            ) &&
            offlineDraft
              .collateralPhotos
              .length
          ) {
            setCollateralPhotos(
              offlineDraft
                .collateralPhotos.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      "Photo",
                    size:
                      doc.size ||
                      doc.fileSize ||
                      0,
                    file:
                      doc.file ||
                      null,
                  })
                )
            );
          } else if (
            Array.isArray(
              savedFiles
                .collateralPhotos
            )
          ) {
            setCollateralPhotos(
              savedFiles
                .collateralPhotos.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      "Photo",
                    size:
                      doc.fileSize ||
                      0,
                    file: null,
                  })
                )
            );
          }

          // ====================================================
          // OWNERSHIP DOCUMENTS
          // ====================================================

          if (
            Array.isArray(
              offlineDraft
                .ownershipDocuments
            ) &&
            offlineDraft
              .ownershipDocuments
              .length
          ) {
            setOwnershipDocuments(
              offlineDraft
                .ownershipDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      "Document",
                    size:
                      doc.size ||
                      doc.fileSize ||
                      0,
                    file:
                      doc.file ||
                      null,
                  })
                )
            );
          } else if (
            Array.isArray(
              savedFiles
                .ownershipDocuments
            )
          ) {
            setOwnershipDocuments(
              savedFiles
                .ownershipDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      "Document",
                    size:
                      doc.fileSize ||
                      0,
                    file: null,
                  })
                )
            );
          }

          // ====================================================
          // CLIENT DOCUMENTS
          // ====================================================

          if (
            Array.isArray(
              offlineDraft
                .clientDocuments
            ) &&
            offlineDraft
              .clientDocuments
              .length
          ) {
            setClientDocuments(
              offlineDraft
                .clientDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      doc.originalFilename ||
                      "Document",
                    size:
                      doc.size ||
                      doc.fileSize ||
                      0,
                    file:
                      doc.file ||
                      null,
                  })
                )
            );
          } else if (
            Array.isArray(
              savedFiles
                .clientDocuments
            )
          ) {
            setClientDocuments(
              savedFiles
                .clientDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      doc.originalFilename ||
                      "Document",
                    size:
                      doc.fileSize ||
                      0,
                    file: null,
                  })
                )
            );
          }

          // ====================================================
          // GUARANTOR DOCUMENTS
          // ====================================================

          if (
            Array.isArray(
              offlineDraft
                .guarantorDocuments
            ) &&
            offlineDraft
              .guarantorDocuments
              .length
          ) {
            setGuarantorDocuments(
              offlineDraft
                .guarantorDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      doc.originalFilename ||
                      "Document",
                    size:
                      doc.size ||
                      doc.fileSize ||
                      0,
                    file:
                      doc.file ||
                      null,
                  })
                )
            );
          } else if (
            Array.isArray(
              savedFiles
                .guarantorDocuments
            )
          ) {
            setGuarantorDocuments(
              savedFiles
                .guarantorDocuments.map(
                  (doc) => ({
                    ...doc,
                    name:
                      doc.name ||
                      doc.originalFilename ||
                      "Document",
                    size:
                      doc.fileSize ||
                      0,
                    file: null,
                  })
                )
            );
          }

          if (
            savedFormData
              .guarantorEmployeeType
          ) {
            setEmployeeType(
              savedFormData
                .guarantorEmployeeType
            );
          }

          setDraftStatus(
            offlineDraft.synced
              ? "Draft loaded"
              : "Offline draft loaded"
          );

          loaded = true;
        }

        // ======================================================
        // 2. IF NO LOCAL DRAFT, LOAD SERVER DRAFT
        // ======================================================

        if (
          !loaded &&
          isNetworkAvailable()
        ) {
          const res =
            await fetch(
              `${API_BASE}/draft/${draftUuid}?userId=${encodeURIComponent(
                userId
              )}`
            );

          if (res.ok) {
            const data =
              await res.json();

            if (
              data.success &&
              data.draft
            ) {
              const savedFormData =
                data.draft.formData ||
                {};

              if (parentFormData) {
                Object.entries(
                  savedFormData
                ).forEach(
                  ([key, value]) => {
                    parentOnChange?.({
                      target: {
                        name: key,
                        value,
                      },
                    });
                  }
                );
              } else {
                setLocalFormData(
                  savedFormData
                );
              }

              if (
                data.draft
                  .currentStep
              ) {
                setStep(
                  Number(
                    data.draft
                      .currentStep
                  )
                );
              }

              const savedFiles =
                data.draft
                  .draftFiles || {};

              setDraftFiles(
                savedFiles
              );

              if (
                savedFiles
                  .clientPhoto
                  ?.filePath
              ) {
                setClientPhotoPreview(
                  getFileUrl(
                    savedFiles
                      .clientPhoto
                      .filePath
                  )
                );
              }

              if (
                savedFiles
                  .guarantorPhoto
                  ?.filePath
              ) {
                setGuarantorPhotoPreview(
                  getFileUrl(
                    savedFiles
                      .guarantorPhoto
                      .filePath
                  )
                );
              }

              if (
                Array.isArray(
                  savedFiles
                    .collateralPhotos
                )
              ) {
                setCollateralPhotos(
                  savedFiles
                    .collateralPhotos.map(
                      (doc) => ({
                        ...doc,
                        name:
                          doc.name ||
                          "Photo",
                        size:
                          doc.fileSize ||
                          0,
                        file: null,
                      })
                    )
                );
              }

              if (
                Array.isArray(
                  savedFiles
                    .ownershipDocuments
                )
              ) {
                setOwnershipDocuments(
                  savedFiles
                    .ownershipDocuments.map(
                      (doc) => ({
                        ...doc,
                        name:
                          doc.name ||
                          "Document",
                        size:
                          doc.fileSize ||
                          0,
                        file: null,
                      })
                    )
                );
              }

              if (
                Array.isArray(
                  savedFiles
                    .clientDocuments
                )
              ) {
                setClientDocuments(
                  savedFiles
                    .clientDocuments.map(
                      (doc) => ({
                        ...doc,
                        name:
                          doc.name ||
                          doc.originalFilename ||
                          "Document",
                        size:
                          doc.fileSize ||
                          0,
                        file: null,
                      })
                    )
                );
              }

              if (
                Array.isArray(
                  savedFiles
                    .guarantorDocuments
                )
              ) {
                setGuarantorDocuments(
                  savedFiles
                    .guarantorDocuments.map(
                      (doc) => ({
                        ...doc,
                        name:
                          doc.name ||
                          doc.originalFilename ||
                          "Document",
                        size:
                          doc.fileSize ||
                          0,
                        file: null,
                      })
                    )
                );
              }

              if (
                savedFormData
                  .guarantorEmployeeType
              ) {
                setEmployeeType(
                  savedFormData
                    .guarantorEmployeeType
                );
              }

              setDraftStatus(
                "Draft loaded"
              );

              loaded = true;
            }
          } else if (
            res.status !== 404
          ) {
            console.error(
              "Server draft loading failed"
            );
          }
        }

        draftLoadedRef.current =
          true;
      } catch (err) {
        console.error(
          "Load draft error:",
          err
        );

        setDraftStatus(
          loaded
            ? "Offline draft loaded"
            : "Unable to load draft"
        );

        draftLoadedRef.current =
          true;
      } finally {
        loadingDraftRef.current =
          false;
      }
    };

    loadDraft();
  }, [
    userId,
    draftUuid,
    getFileUrl,
    parentFormData,
    parentOnChange,
  ]);

  // ============================================================
  // AUTOMATIC OFFLINE DRAFT SYNC
  // ============================================================

  useEffect(() => {
    const syncPendingDrafts =
      async () => {
        if (!isNetworkAvailable()) {
          return;
        }

        try {
          const pendingDrafts =
            await getPendingOfflineDrafts();

          if (
            !pendingDrafts.length
          ) {
            return;
          }

          console.log(
            `Found ${pendingDrafts.length} pending offline draft(s)`
          );

          for (
            const draft of pendingDrafts
          ) {
            try {
              const fd =
                buildDraftFormData({
                  userId:
                    draft.userId,
                  draftUuid:
                    draft.draftUuid,
                  currentStep:
                    draft.currentStep,
                  formData:
                    draft.formData,
                  draftFiles:
                    draft.draftFiles ||
                    {},
                  clientPhotoFile:
                    draft.clientPhotoFile,
                  guarantorPhotoFile:
                    draft.guarantorPhotoFile,
                  collateralPhotos:
                    draft.collateralPhotos ||
                    [],
                  ownershipDocuments:
                    draft.ownershipDocuments ||
                    [],
                  clientDocuments:
                    draft.clientDocuments ||
                    [],
                  guarantorDocuments:
                    draft.guarantorDocuments ||
                    [],
                });

              const res =
                await fetch(
                  `${API_BASE}/save-draft`,
                  {
                    method:
                      "POST",
                    body: fd,
                  }
                );

              if (!res.ok) {
                throw new Error(
                  `Server returned ${res.status}`
                );
              }

              const data =
                await res.json();

              if (
                !data.success
              ) {
                throw new Error(
                  data.message ||
                    "Server rejected draft"
                );
              }

              await markDraftSynced(
                draft.userId,
                draft.draftUuid
              );

              console.log(
                `Draft ${draft.draftUuid} synced successfully`
              );

              if (
                String(
                  draft.userId
                ) ===
                  String(userId) &&
                String(
                  draft.draftUuid
                ) ===
                  String(draftUuid)
              ) {
                setDraftStatus(
                  "Offline draft synced"
                );
              }

              if (
                data.draftFiles &&
                String(
                  draft.userId
                ) ===
                  String(userId) &&
                String(
                  draft.draftUuid
                ) ===
                  String(draftUuid)
              ) {
                setDraftFiles(
                  data.draftFiles
                );
              }
            } catch (err) {
              console.error(
                `Failed to sync draft ${draft.draftUuid}:`,
                err
              );

              if (
                !isNetworkAvailable()
              ) {
                break;
              }
            }
          }
        } catch (err) {
          console.error(
            "Offline draft sync error:",
            err
          );
        }
      };

    const handleOnline =
      () => {
        console.log(
          "Internet connection restored. Syncing drafts..."
        );

        syncPendingDrafts();
      };

    window.addEventListener(
      "online",
      handleOnline
    );

    if (isNetworkAvailable()) {
      syncPendingDrafts();
    }

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, [
    userId,
    draftUuid,
  ]);

  // ============================================================
  // SUBMIT ALL
  // ============================================================

  const submitAll = async () => {
    if (!userId) {
      setError(
        "User not authenticated"
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const fd = new FormData();

      fd.append(
        "userId",
        String(userId)
      );

      fd.append(
        "draftUuid",
        draftUuid
      );

      const draftFilesPayload = {
        clientPhoto:
          draftFiles.clientPhoto,

        guarantorPhoto:
          draftFiles.guarantorPhoto,

        collateralPhotos:
          collateralPhotos.map(
            (doc) => ({
              name: doc.name,
              fileSize:
                doc.size,
              filePath:
                doc.filePath ||
                null,
            })
          ),

        ownershipDocuments:
          ownershipDocuments.map(
            (doc) => ({
              name: doc.name,
              fileSize:
                doc.size,
              filePath:
                doc.filePath ||
                null,
            })
          ),

        clientDocuments:
          clientDocuments.map(
            (doc) => ({
              name:
                doc.name,
              fileSize:
                doc.size,
              filePath:
                doc.filePath ||
                null,
            })
          ),

        guarantorDocuments:
          guarantorDocuments.map(
            (doc) => ({
              name:
                doc.name,
              fileSize:
                doc.size,
              filePath:
                doc.filePath ||
                null,
            })
          ),
      };

      fd.append(
        "draftFiles",
        JSON.stringify(
          draftFilesPayload
        )
      );

      // ========================================================
      // TEXT FIELDS
      // ========================================================

      const textFields = {
        // Step 1
        firstName:
          formData.firstName,
        surname:
          formData.surname,
        middleName:
          formData.middleName,
        popularName:
          formData.popularName,
        phone:
          formData.phone,
        altPhone:
          formData.altPhone,
        hometown:
          formData.hometown,
        placeOfBirth:
          formData.placeOfBirth,
        ghanaCardNumber:
          formData.ghanaCardNumber,
        dateIssued:
          formData.dateIssued,
        expiryDate:
          formData.expiryDate,
        dateOfBirth:
          formData.dateOfBirth,
        maritalStatus:
          formData.maritalStatus,
        fatherName:
          formData.fatherName,
        fatherContact:
          formData.fatherContact,
        motherName:
          formData.motherName,
        motherContact:
          formData.motherContact,
        spouseName:
          formData.spouseName,
        spouseContact:
          formData.spouseContact,
        spouseOccupation:
          formData.spouseOccupation,
        residentialLocation:
          formData.residentialLocation,
        district:
          formData.district,
        residentialOwnership:
          formData.residentialOwnership,
        nearestLandmark:
          formData.nearestLandmark,
        gpsAddress:
          formData.gpsAddress,
        yearsAtAddress:
          formData.yearsAtAddress,
        rentAdvance:
          formData.rentAdvance,
        numberOfDependents:
          formData.numberOfDependents,
        householdMembers:
          formData.householdMembers,
        dependentsSchooling:
          formData.dependentsSchooling,
        religion:
          formData.religion,
        churchName:
          formData.churchName,
        churchLocation:
          formData.churchLocation,
        pastorName:
          formData.pastorName,
        pastorContact:
          formData.pastorContact,

        // Step 2
        businessName:
          formData.businessName,
        businessSector:
          formData.businessSector,
        typesOfBusiness:
          formData.typesOfBusiness,
        businessDescription:
          formData.businessDescription,
        businessLocation:
          formData.businessLocation,
        businessLocationStatus:
          formData.businessLocationStatus,
        workingCapital:
          formData.workingCapital,
        stockValue:
          formData.stockValue,
        businessGpsAddress:
          formData.businessGpsAddress,
        yearsInBusiness:
          formData.yearsInBusiness,
        businessLandmark:
          formData.businessLandmark,
        minimumSale:
          formData.minimumSale,
        maximumSale:
          formData.maximumSale,

        // Step 3
        loanAmount:
          formData.loanAmount,
        loanPurpose:
          formData.loanPurpose,
        loanTerm:
          formData.loanTerm,
        weeklyInstallment:
          formData.weeklyInstallment,
        repaymentAmount:
          formData.repaymentAmount,
        previousLoanRequest:
          formData.previousLoanRequest,
        previousLoanApproved:
          formData.previousLoanApproved,
        expectedDueDate:
          formData.expectedDueDate,
        actualDueDate:
          formData.actualDueDate,
        repaymentFrequency:
          formData.repaymentFrequency,
        existingLoanBalance:
          formData.existingLoanBalance,
        loanNeedReason:
          formData.loanNeedReason,
        whatIfNotApproved:
          formData.whatIfNotApproved,
        comfortableRepayment:
          formData.comfortableRepayment,
        existingDebtRepayment:
          formData.existingDebtRepayment,
        securityType:
          formData.securityType,
        securityDescription:
          formData.securityDescription,
        securityOwner:
          formData.securityOwner,
        securityPurchaseDate:
          formData.securityPurchaseDate,
        securityMarketValue:
          formData.securityMarketValue,
        securityForcedSaleValue:
          formData.securityForcedSaleValue,
        securitySerial:
          formData.securitySerial,
        securityRegistration:
          formData.securityRegistration,
        securityVerificationStatus:
          formData.securityVerificationStatus,
        securityEncumbrances:
          formData.securityEncumbrances,
        prevRepaymentBehaviour:
          formData.prevRepaymentBehaviour,
        totalBorrowed:
          formData.totalBorrowed,
        loanCycleCompleted:
          formData.loanCycleCompleted,
        maxPastDueDays:
          formData.maxPastDueDays,
        missedInstalments:
          formData.missedInstalments,
        totalArrears:
          formData.totalArrears,
        writeOffLoans:
          formData.writeOffLoans,
        extensions:
          formData.extensions,
        numberOfPayOff:
          formData.numberOfPayOff,
        currentOutstandingBalance:
          formData.currentOutstandingBalance,
        avgRepaymentPerformance:
          formData.avgRepaymentPerformance,
        visitBusiness:
          formData.visitBusiness,
        businessOperating:
          formData.businessOperating,
        observedSalesCorrespondence:
          formData.observedSalesCorrespondence,
        dailyCustomerVolume:
          formData.dailyCustomerVolume,
        keyRiskObserved:
          formData.keyRiskObserved,
        knownClientSince:
          formData.knownClientSince,
        adverseInfo:
          formData.adverseInfo,
        repaymentConcerns:
          formData.repaymentConcerns,
        verifiedMonthlyIncome:
          formData.verifiedMonthlyIncome,
        reasonableRepayment:
          formData.reasonableRepayment,
        recommendedAmount:
          formData.recommendedAmount,
        recommendedTerm:
          formData.recommendedTerm,
        recommendationReason:
          formData.recommendationReason,

        // Step 6
        guarantorEmployeeType:
          employeeType,
        guarantorRank:
          formData.guarantorRank,
        guarantorNameOfEmployer:
          formData.guarantorNameOfEmployer,
        guarantorWorkLocation:
          formData.guarantorWorkLocation,
        guarantorYearsInService:
          formData.guarantorYearsInService,
        guarantorBusinessName:
          formData.guarantorBusinessName,
        guarantorBusinessLocation:
          formData.guarantorBusinessLocation,
        guarantorYearsInBusiness:
          formData.guarantorYearsInBusiness,
        guarantorFirstName:
          formData.guarantorFirstName,
        guarantorLastName:
          formData.guarantorLastName,
        guarantorMiddleName:
          formData.guarantorMiddleName,
        guarantorPhone:
          formData.guarantorPhone,
        guarantorAltPhone:
          formData.guarantorAltPhone,
        guarantorIdNumber:
          formData.guarantorIdNumber,
        guarantorRelationship:
          formData.guarantorRelationship,
        guarantorAddress:
          formData.guarantorAddress,
        guarantorResidenceLocation:
          formData.guarantorResidenceLocation,
        guarantorChurchName:
          formData.guarantorChurchName,
        guarantorChurchLocation:
          formData.guarantorChurchLocation,
      };

      Object.entries(
        textFields
      ).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== null &&
            value !== ""
          ) {
            fd.append(
              key,
              value
            );
          }
        }
      );

      // ========================================================
      // REFERENCES
      // ========================================================

      const references =
        formData.references ||
        [];

      if (references.length > 0) {
        fd.append(
          "references",
          JSON.stringify(
            references
          )
        );
      }

      // ========================================================
      // LOAN HISTORY
      // ========================================================

      const loans =
        formData.loans || [];

      if (loans.length > 0) {
        fd.append(
          "loans",
          JSON.stringify(
            loans
          )
        );
      }

      // ========================================================
      // CLIENT PHOTO
      // ========================================================

      if (
        clientPhotoFile instanceof
        File
      ) {
        fd.append(
          "clientPhoto",
          clientPhotoFile
        );
      }

      // ========================================================
      // GUARANTOR PHOTO
      // ========================================================

      if (
        guarantorPhotoFile instanceof
        File
      ) {
        fd.append(
          "guarantorPhoto",
          guarantorPhotoFile
        );
      }

      // ========================================================
      // COLLATERAL PHOTOS
      // ========================================================

      collateralPhotos.forEach(
        (doc, index) => {
          if (
            doc?.file instanceof
            File
          ) {
            fd.append(
              `collateralPhotos[${index}][file]`,
              doc.file
            );
          }

          fd.append(
            `collateralPhotos[${index}][name]`,
            doc.name ||
              `Photo ${index + 1}`
          );

          if (doc?.filePath) {
            fd.append(
              `collateralPhotos[${index}][filePath]`,
              doc.filePath
            );
          }
        }
      );

      // ========================================================
      // OWNERSHIP DOCUMENTS
      // ========================================================

      ownershipDocuments.forEach(
        (doc, index) => {
          if (
            doc?.file instanceof
            File
          ) {
            fd.append(
              `ownershipDocuments[${index}][file]`,
              doc.file
            );
          }

          fd.append(
            `ownershipDocuments[${index}][name]`,
            doc.name ||
              `Document ${index + 1}`
          );

          if (doc?.filePath) {
            fd.append(
              `ownershipDocuments[${index}][filePath]`,
              doc.filePath
            );
          }
        }
      );

      // ========================================================
      // CLIENT DOCUMENTS
      // ========================================================

      clientDocuments.forEach(
        (doc, index) => {
          if (
            doc?.file instanceof
            File
          ) {
            fd.append(
              `clientDocuments[${index}][file]`,
              doc.file
            );
          }

          fd.append(
            `clientDocuments[${index}][name]`,
            doc?.name ||
              doc?.originalFilename ||
              `Document ${index + 1}`
          );

          if (doc?.filePath) {
            fd.append(
              `clientDocuments[${index}][filePath]`,
              doc.filePath
            );
          }
        }
      );

      // ========================================================
      // GUARANTOR DOCUMENTS
      // ========================================================

      guarantorDocuments.forEach(
        (doc, index) => {
          if (
            doc?.file instanceof
            File
          ) {
            fd.append(
              `guarantorDocuments[${index}][file]`,
              doc.file
            );
          }

          fd.append(
            `guarantorDocuments[${index}][name]`,
            doc?.name ||
              doc?.originalFilename ||
              `Document ${index + 1}`
          );

          if (doc?.filePath) {
            fd.append(
              `guarantorDocuments[${index}][filePath]`,
              doc.filePath
            );
          }
        }
      );

      // ========================================================
      // SUBMIT
      // ========================================================

      const res =
        await fetch(
          `${API_BASE}/submit`,
          {
            method: "POST",
            body: fd,
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Submission failed"
        );
      }

      // ========================================================
      // REMOVE DRAFT UUID
      // ========================================================

      if (
        !selectedDraftUuid &&
        localStorage.getItem(
          "client_kyc_draft_uuid"
        ) === draftUuid
      ) {
        localStorage.removeItem(
          "client_kyc_draft_uuid"
        );
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      setShowSuccessModal(
        true
      );
    } catch (err) {
      console.error(
        "KYC submission error:",
        err
      );

      setError(
        err.message ||
          "Submission failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SUCCESS MODAL
  // ============================================================

  const closeSuccessModal = () => {
    setShowSuccessModal(
      false
    );

    if (onCancel) {
      onCancel();
    }
  };

  // ============================================================
  // STYLES
  // ============================================================

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border:
      "1px solid #e2e8f0",
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
    e.target.style.borderColor =
      "#818cf8";
  };

  const blurStyle = (e) => {
    e.target.style.borderColor =
      "#e2e8f0";
  };

  // ============================================================
  // COMMON STEP PROPS
  // ============================================================

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

  // ============================================================
  // STEP 1
  // ============================================================

  const step1Props = {
    ...stepProps,
    photoPreview:
      clientPhotoPreview,
    onFileChange:
      handleClientPhotoChange,
    onNext: () =>
      handleNext(1),
    onCancel,
  };

  // ============================================================
  // STEP 2
  // ============================================================

  const step2Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () =>
      handleNext(2),
  };

  // ============================================================
  // STEP 3
  // ============================================================

  const step3Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () =>
      handleNext(3),

    collateralPhotos,
    ownershipDocuments,

    onCollateralPhotosChange:
      setCollateralPhotos,

    onOwnershipDocumentsChange:
      setOwnershipDocuments,
  };

  // ============================================================
  // STEP 4
  // ============================================================

  const step4Props = {
    ...stepProps,
    onBack: handleBack,
    onNext: () =>
      handleNext(4),
  };

  // ============================================================
  // STEP 5
  // ============================================================

  const step5Props = {
    ...stepProps,

    clientDocuments,

    handleAddClientDocuments:
      (e) => {
        const files =
          Array.from(
            e.target.files || []
          );

        if (!files.length) {
          return;
        }

        setClientDocuments(
          (prev) => [
            ...prev,
            ...files.map(
              (file) => ({
                file,
                name:
                  file.name,
                size:
                  file.size,
              })
            ),
          ]
        );

        e.target.value = "";
      },

    removeClientDocument:
      (index) =>
        setClientDocuments(
          (prev) =>
            prev.filter(
              (_, i) =>
                i !== index
            )
        ),

    renameClientDocument:
      (
        index,
        newName
      ) => {
        setClientDocuments(
          (prev) => {
            const updated =
              [...prev];

            if (
              !updated[index]
            ) {
              return prev;
            }

            updated[index] = {
              ...updated[index],
              name: newName,
            };

            return updated;
          }
        );
      },

    formatSize,

    onBack: handleBack,

    onNext: () =>
      handleNext(5),
  };

  // ============================================================
  // STEP 6
  // ============================================================

  const step6Props = {
    ...stepProps,

    guarantorPhotoPreview,

    handleGuarantorPhotoChange,

    employeeType,

    handleEmployeeTypeChange:
      (e) => {
        const value =
          e.target.value;

        setEmployeeType(
          value
        );

        onChange({
          target: {
            name:
              "guarantorEmployeeType",
            value,
          },
        });
      },

    onBack: handleBack,

    onNext: () =>
      handleNext(6),
  };

  // ============================================================
  // STEP 7
  // ============================================================

  const step7Props = {
    ...stepProps,

    guarantorDocuments,

    handleAddGuarantorDocuments:
      (e) => {
        const files =
          Array.from(
            e.target.files || []
          );

        if (!files.length) {
          return;
        }

        setGuarantorDocuments(
          (prev) => [
            ...prev,
            ...files.map(
              (file) => ({
                file,
                name:
                  file.name,
                size:
                  file.size,
              })
            ),
          ]
        );

        e.target.value = "";
      },

    removeGuarantorDocument:
      (index) =>
        setGuarantorDocuments(
          (prev) =>
            prev.filter(
              (_, i) =>
                i !== index
            )
        ),

    renameGuarantorDocument:
      (
        index,
        newName
      ) => {
        setGuarantorDocuments(
          (prev) => {
            const updated =
              [...prev];

            if (
              !updated[index]
            ) {
              return prev;
            }

            updated[index] = {
              ...updated[index],
              name: newName,
            };

            return updated;
          }
        );
      },

    formatSize,

    onBack: handleBack,

    onNext: () =>
      handleNext(7),
  };

  // ============================================================
  // STEP 8
  // ============================================================

  const step8Props = {
    ...stepProps,
    onBack: handleBack,
    onSubmit: submitAll,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <div
        style={{
          background:
            "#ffffff",
          borderRadius:
            "12px",
          padding: isMobile
            ? "20px"
            : "32px",
          border:
            "1px solid #f1f5f9",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <button
          type="button"
          onClick={
            onCancel
          }
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: "6px",
            background:
              "transparent",
            border: "none",
            color:
              "#64748b",
            cursor:
              "pointer",
            marginBottom:
              "20px",
            fontSize:
              "14px",
          }}
        >
          <MdArrowBack
            size={18}
          />
          Back to applications
        </button>

        {/* =====================================================
            STEP INDICATOR
        ====================================================== */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "32px",
            padding:
              "0 4px",
            gap: isMobile
              ? "4px"
              : "8px",
            flexWrap:
              "wrap",
          }}
        >
          {stepLabels.map(
            (
              label,
              index
            ) => {
              const stepNumber =
                index + 1;

              const isActive =
                step ===
                stepNumber;

              const isCompleted =
                step >
                stepNumber;

              return (
                <React.Fragment
                  key={index}
                >
                  <span
                    style={{
                      fontSize:
                        isMobile
                          ? "10px"
                          : "13px",

                      fontWeight:
                        isActive
                          ? "700"
                          : isCompleted
                          ? "500"
                          : "400",

                      color:
                        isActive
                          ? "#1e293b"
                          : isCompleted
                          ? "#f37712"
                          : "#94a3b8",

                      borderBottom:
                        isActive
                          ? "2px solid #fc821f"
                          : "none",

                      paddingBottom:
                        "4px",

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.3px",

                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {label}
                  </span>

                  {index <
                    totalSteps -
                      1 && (
                    <span
                      style={{
                        color:
                          step >
                          index +
                            1
                            ? "#090efa"
                            : "#e2e8f0",

                        fontWeight:
                          "300",

                        fontSize:
                          isMobile
                            ? "12px"
                            : "16px",

                        flexShrink:
                          0,
                      }}
                    >
                      ›
                    </span>
                  )}
                </React.Fragment>
              );
            }
          )}
        </div>

        {/* =====================================================
            OFFLINE/SAVE STATUS
        ====================================================== */}

        {draftStatus && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "9px 12px",
              borderRadius:
                "8px",
              background:
                draftStatus.includes(
                  "offline"
                ) ||
                draftStatus.includes(
                  "Offline"
                )
                  ? "#fff7ed"
                  : "#f8fafc",
              color:
                draftStatus.includes(
                  "offline"
                ) ||
                draftStatus.includes(
                  "Offline"
                )
                  ? "#c2410c"
                  : "#64748b",
              fontSize:
                "13px",
              textAlign:
                "center",
            }}
          >
            {draftStatus}
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            style={{
              color:
                "#dc2626",
              background:
                "#fee2e2",
              padding:
                "12px",
              borderRadius:
                "8px",
              marginBottom:
                "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================================
            SUBMIT SAVING
        ====================================================== */}

        {saving && (
          <div
            style={{
              textAlign:
                "center",
              padding:
                "20px",
              color:
                "#3b82f6",
            }}
          >
            Saving... please wait.
          </div>
        )}

        <form
          onSubmit={(e) =>
            e.preventDefault()
          }
        >
          {step === 1 && (
            <Step1KYC
              {...step1Props}
            />
          )}

          {step === 2 && (
            <Step2Business
              {...step2Props}
            />
          )}

          {step === 3 && (
            <Step3Loan
              {...step3Props}
            />
          )}

          {step === 4 && (
            <Step4Reference
              {...step4Props}
            />
          )}

          {step === 5 && (
            <Step5ClientDocuments
              {...step5Props}
            />
          )}

          {step === 6 && (
            <Step6GuarantorDetails
              {...step6Props}
            />
          )}

          {step === 7 && (
            <Step7GuarantorDocuments
              {...step7Props}
            />
          )}

          {step === 8 && (
            <Step8LoanHistory
              {...step8Props}
            />
          )}
        </form>
      </div>

      {/* =======================================================
          SUCCESS MODAL
      ======================================================== */}

      {showSuccessModal && (
        <div
          style={{
            position:
              "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              "rgba(0,0,0,0.5)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex:
              9999,
            padding:
              "20px",
          }}
          onClick={
            closeSuccessModal
          }
        >
          <div
            style={{
              backgroundColor:
                "#fff",
              borderRadius:
                "16px",
              padding:
                "40px 32px",
              maxWidth:
                "440px",
              width:
                "100%",
              textAlign:
                "center",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                marginBottom:
                  "16px",
              }}
            >
              <div
                style={{
                  width:
                    "72px",
                  height:
                    "72px",
                  borderRadius:
                    "50%",
                  background:
                    "#dcfce7",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <MdCheckCircle
                  size={48}
                  color="#22c55e"
                />
              </div>
            </div>

            <h2
              style={{
                fontSize:
                  "24px",
                fontWeight:
                  "700",
                color:
                  "#1e293b",
                margin:
                  "0 0 8px 0",
              }}
            >
              Application Submitted!
            </h2>

            <p
              style={{
                fontSize:
                  "15px",
                color:
                  "#64748b",
                margin:
                  "0 0 24px 0",
                lineHeight:
                  "1.5",
              }}
            >
              Your KYC application
              has been successfully
              submitted. We will
              review it and get back
              to you shortly.
            </p>

            <button
              type="button"
              onClick={
                closeSuccessModal
              }
              style={{
                padding:
                  "10px 32px",
                background:
                  "#3b82f6",
                border:
                  "none",
                borderRadius:
                  "8px",
                color:
                  "#fff",
                fontSize:
                  "15px",
                fontWeight:
                  "500",
                cursor:
                  "pointer",
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