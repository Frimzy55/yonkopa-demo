import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

const modalStyles = `
  .modal-dialog.kyc-modal-dialog {
    width: 98vw !important;
    max-width: 98vw !important;
    min-width: 0 !important;
    margin: 1vh auto !important;
    padding: 0 !important;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
  }

  .modal.show .modal-dialog.kyc-modal-dialog {
    transform: none !important;
  }

  .modal-dialog.kyc-modal-dialog .modal-content {
    width: 100% !important;
    max-width: 100% !important;
    height: 98vh !important;
    max-height: 98vh !important;
    min-height: 0 !important;
    margin: 0 auto !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }

  /* Compact top navigation */
  .kyc-compact-header {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 58px;
    padding: 6px 12px 6px 16px;
    background: #ffffff;
    border-bottom: 1px solid #dee2e6;
    flex-shrink: 0;
  }

  .kyc-step-navigation {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .kyc-step-navigation::-webkit-scrollbar {
    display: none;
  }

  .kyc-step-item {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 11px;
    margin-right: 3px;
    border-radius: 6px;
    color: #8a94a6;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .kyc-step-item:hover {
    background: #f1f5f9;
    color: #0d6efd;
  }

  .kyc-step-item.active {
    background: #0d6efd;
    color: #ffffff;
    font-weight: 600;
  }

  .kyc-step-number {
    font-size: 11px;
    font-weight: 700;
  }

  .kyc-step-title {
    font-size: 12px;
  }

  .kyc-close-button {
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    margin-left: 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #6c757d;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    border-radius: 6px;
  }

  .kyc-close-button:hover {
    background: #f1f3f5;
    color: #212529;
  }

  .modal-dialog.kyc-modal-dialog .modal-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: none !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 16px 24px !important;
  }

  .modal-dialog.kyc-modal-dialog .modal-footer {
    flex-shrink: 0 !important;
    padding: 8px 20px !important;
    border-top: 1px solid #dee2e6;
  }

  .kyc-current-title {
    color: #0d6efd;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    padding: 0 0 8px 0;
    border-bottom: 2px solid #0d6efd;
  }

  .kyc-section-title {
    background: #f8f9fa;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
  }

  .kyc-image-card {
    width: 180px;
    text-align: center;
  }

  .kyc-gallery-image {
    width: 180px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .kyc-gallery-image:hover {
    transform: scale(1.04);
  }

  @media (max-width: 768px) {
    .modal-dialog.kyc-modal-dialog {
      width: 98vw !important;
      max-width: 98vw !important;
      margin: 1vh auto !important;
    }

    .modal-dialog.kyc-modal-dialog .modal-content {
      height: 98vh !important;
      max-height: 98vh !important;
      border-radius: 8px !important;
    }

    .kyc-compact-header {
      min-height: 52px;
      padding-left: 6px;
      padding-right: 6px;
    }

    .kyc-step-item {
      padding: 6px 8px;
    }

    .kyc-step-title {
      font-size: 11px;
    }

    .kyc-close-button {
      width: 34px;
      height: 34px;
      font-size: 25px;
    }

    .modal-dialog.kyc-modal-dialog .modal-body {
      padding: 12px !important;
    }
  }
`;

const KycFullDetailsModal = ({ show, onClose, kycData }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const [references, setReferences] = useState([]);
  const [clientDocs, setClientDocs] = useState([]);
  const [guarantorDocs, setGuarantorDocs] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);

  const [loading, setLoading] = useState({
    references: false,
    clientDocs: false,
    guarantorDocs: false,
    loanHistory: false,
  });

  const [error, setError] = useState({
    references: null,
    clientDocs: null,
    guarantorDocs: null,
    loanHistory: null,
  });

  useEffect(() => {
    if (!show || !kycData?.client_id) return;

    const clientId = kycData.client_id;
    const apiUrl = process.env.REACT_APP_API_URL;

    setStep(1);

    setReferences([]);
    setClientDocs([]);
    setGuarantorDocs([]);
    setLoanHistory([]);

    setError({
      references: null,
      clientDocs: null,
      guarantorDocs: null,
      loanHistory: null,
    });

    setLoading({
      references: true,
      clientDocs: true,
      guarantorDocs: true,
      loanHistory: true,
    });

    axios
      .get(`${apiUrl}/api/client/${clientId}/references`)
      .then((res) => {
        setReferences(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("References error:", err);
        setError((prev) => ({
          ...prev,
          references: err.message,
        }));
      })
      .finally(() => {
        setLoading((prev) => ({
          ...prev,
          references: false,
        }));
      });

    axios
      .get(`${apiUrl}/api/client/${clientId}/documents`)
      .then((res) => {
        setClientDocs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Client documents error:", err);
        setError((prev) => ({
          ...prev,
          clientDocs: err.message,
        }));
      })
      .finally(() => {
        setLoading((prev) => ({
          ...prev,
          clientDocs: false,
        }));
      });

    axios
      .get(`${apiUrl}/api/client/${clientId}/guarantor-documents`)
      .then((res) => {
        setGuarantorDocs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Guarantor documents error:", err);
        setError((prev) => ({
          ...prev,
          guarantorDocs: err.message,
        }));
      })
      .finally(() => {
        setLoading((prev) => ({
          ...prev,
          guarantorDocs: false,
        }));
      });

    axios
      .get(`${apiUrl}/api/client/${clientId}/loan-history`)
      .then((res) => {
        setLoanHistory(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Loan history error:", err);
        setError((prev) => ({
          ...prev,
          loanHistory: err.message,
        }));
      })
      .finally(() => {
        setLoading((prev) => ({
          ...prev,
          loanHistory: false,
        }));
      });
  }, [show, kycData]);

  if (!kycData) return null;

  const getFullName = () => {
    if (kycData.full_name) return kycData.full_name;

    if (kycData.first_name || kycData.surname) {
      return `${kycData.first_name || ""} ${
        kycData.surname || ""
      }`.trim() || "N/A";
    }

    return "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      return formatDate(value);
    }

    return String(value);
  };

  /* =========================================================
     IMAGE URL
     ========================================================= */
  const getImageUrl = (path) => {
    if (!path || typeof path !== "string") {
      return null;
    }

    const cleanPath = path.trim();

    if (!cleanPath) return null;

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    const apiUrl = process.env.REACT_APP_API_URL;

    if (!apiUrl) {
      console.error("REACT_APP_API_URL is not configured");
      return null;
    }

    if (cleanPath.startsWith("/uploads/")) {
      return `${apiUrl}${cleanPath}`;
    }

    if (cleanPath.startsWith("uploads/")) {
      return `${apiUrl}/${cleanPath}`;
    }

    return `${apiUrl}/uploads/${cleanPath}`;
  };

  /* =========================================================
     PARSE COLLATERAL / OWNERSHIP FILES
     ========================================================= */
  const parseImagePaths = (value) => {
    if (!value) return [];

    let parsed = value;

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return [];

      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          return (
            item.filePath ||
            item.path ||
            item.url ||
            null
          );
        }

        return null;
      })
      .filter(Boolean);
  };

  const TableRow = ({ label, value }) => (
    <tr>
      <td
        width="35%"
        className="fw-semibold"
      >
        {label}
      </td>

      <td>{renderValue(value)}</td>
    </tr>
  );

  const stepTitles = [
    "Personal",
    "Business",
    "Loan",
    "References",
    "Client Docs",
    "Guarantor",
    "Guarantor Docs",
    "Loan History",
  ];

  const stepContent = {
    1: {
      title: "Personal Information",
      sections: [
        {
          heading: "👤 Personal Details",
          rows: [
            ["Full Name", getFullName()],
            ["Officer Name", kycData.officer_name],
            ["Popular Name", kycData.popular_name],
            ["First Name", kycData.first_name],
            ["Surname", kycData.surname],
            ["Middle Name", kycData.middle_name],
            ["Date of Birth", kycData.date_of_birth],
            ["Phone", kycData.phone],
            ["Alt Phone", kycData.alt_phone],
            ["Marital Status", kycData.marital_status],
            ["Hometown", kycData.hometown],
            ["Place of Birth", kycData.place_of_birth],
            ["Ghana Card Number", kycData.ghana_card_number],
            ["Date Issued", kycData.date_issued],
            ["Expiry Date", kycData.expiry_date],
            ["Religion", kycData.religion],
            ["Church", kycData.church_name],
            ["Church Location", kycData.church_location],
            ["Pastor Name", kycData.pastor_name],
            ["Pastor Contact", kycData.pastor_contact],
          ],
        },
        {
          heading: "👨‍👩‍👧‍👦 Family & Dependents",
          rows: [
            ["Father Name", kycData.father_name],
            ["Father Contact", kycData.father_contact],
            ["Mother Name", kycData.mother_name],
            ["Mother Contact", kycData.mother_contact],
            ["Spouse Name", kycData.spouse_name],
            ["Spouse Contact", kycData.spouse_contact],
            ["Spouse Occupation", kycData.spouse_occupation],
            ["Number of Dependents", kycData.number_of_dependents],
            ["Household Members", kycData.household_members],
            ["Dependents Schooling", kycData.dependents_schooling],
          ],
        },
        {
          heading: "🏠 Residential Details",
          rows: [
            ["Residential Location", kycData.residential_location],
            ["District", kycData.district],
            ["Ownership", kycData.residential_ownership],
            ["Nearest Landmark", kycData.nearest_landmark],
            ["GPS Address", kycData.gps_address],
            ["Years at Address", kycData.years_at_address],
            ["Rent Advance", kycData.rent_advance],
          ],
        },
      ],
    },

    2: {
      title: "Business Information",
      sections: [
        {
          heading: "🏢 Business Details",
          rows: [
            ["Business Name", kycData.business_name],
            ["Sector", kycData.business_sector],
            ["Types of Business", kycData.types_of_business],
            ["Description", kycData.business_description],
            ["Location", kycData.business_location],
            ["Location Status", kycData.business_location_status],
            ["Working Capital", kycData.working_capital],
            ["Stock Value", kycData.stock_value],
            ["GPS Address", kycData.business_gps_address],
            ["Years in Business", kycData.years_in_business],
            ["Landmark", kycData.business_landmark],
            ["Minimum Sale", kycData.minimum_sale],
            ["Maximum Sale", kycData.maximum_sale],
          ],
        },
      ],
    },

    3: {
      title: "Loan Application",
      sections: [
        {
          heading: "💰 Loan Details",
          rows: [
            ["Loan Amount", kycData.loan_amount],
            ["Loan Purpose", kycData.loan_purpose],
            ["Loan Term", kycData.loan_term],
            ["Weekly Installment", kycData.weekly_installment],
            ["Repayment Amount", kycData.repayment_amount],
            ["Previous Loan Request", kycData.previous_loan_request],
            ["Previous Loan Approved", kycData.previous_loan_approved],
            ["Expected Due Date", kycData.expected_due_date],
            ["Actual Due Date", kycData.actual_due_date],
            ["Repayment Frequency", kycData.repayment_frequency],
            ["Existing Loan Balance", kycData.existing_loan_balance],
            ["Loan Need Reason", kycData.loan_need_reason],
            ["What if not approved?", kycData.what_if_not_approved],
            ["Comfortable Repayment", kycData.comfortable_repayment],
            ["Existing Debt Repayment", kycData.existing_debt_repayment],
          ],
        },
        {
          heading: "🔒 Collateral / Security",
          rows: [
            ["Security Type", kycData.security_type],
            ["Description", kycData.security_description],
            ["Owner", kycData.security_owner],
            ["Purchase Date", kycData.security_purchase_date],
            ["Market Value", kycData.security_market_value],
            ["Forced Sale Value", kycData.security_forced_sale_value],
            ["Serial Number", kycData.security_serial],
            ["Registration", kycData.security_registration],
            ["Verification Status", kycData.security_verification_status],
            ["Encumbrances", kycData.security_encumbrances],
          ],
        },
        {
          heading: "📸 Collateral Images & Documents",
          imageGallery: [
            {
              label: "Collateral Photos",
              paths: [
                ...new Set([
                  ...parseImagePaths(
                    kycData.collateral_photos
                  ),
                  ...parseImagePaths(
                    kycData.collateral_photo_path
                  ),
                ]),
              ],
            },
            {
              label: "Ownership Documents",
              paths: [
                ...new Set([
                  ...parseImagePaths(
                    kycData.ownership_docs
                  ),
                  ...parseImagePaths(
                    kycData.ownership_document_path
                  ),
                ]),
              ],
            },
          ],
        },
      ],
    },

    4: {
      title: "References",
      sections: [
        {
          heading: "📋 References",
          isArray: true,
          data: references,
          type: "references",
          loading: loading.references,
          error: error.references,
        },
      ],
    },

    5: {
      title: "Client Documents",
      sections: [
        {
          heading: "📄 Client Documents",
          isArray: true,
          data: clientDocs,
          type: "documents",
          loading: loading.clientDocs,
          error: error.clientDocs,
        },
      ],
    },

    6: {
      title: "Guarantor Details",
      sections: [
        {
          heading: "🤝 Guarantor Information",
          image: kycData.guarantor_photo,
          rows: [
            ["Guarantor ID", kycData.guarantor_id],
            ["Employee Type", kycData.employee_type],
            ["Rank", kycData.guarantor_rank],
            ["Name of Employer", kycData.guarantor_name_of_employer],
            ["Work Location", kycData.guarantor_work_location],
            ["Years in Service", kycData.guarantor_years_in_service],
            ["Business Name", kycData.guarantor_business_name],
            ["Business Location", kycData.guarantor_business_location],
            ["Years in Business", kycData.guarantor_years_in_business],
            ["First Name", kycData.guarantor_first_name],
            ["Last Name", kycData.guarantor_last_name],
            ["Middle Name", kycData.guarantor_middle_name],
            ["Phone", kycData.guarantor_phone],
            ["Alt Phone", kycData.guarantor_alt_phone],
            ["ID Number", kycData.guarantor_id_number],
            ["Relationship", kycData.guarantor_relationship],
            ["Address", kycData.guarantor_address],
            ["Residence Location", kycData.guarantor_residence_location],
            ["Church Name", kycData.guarantor_church_name],
            ["Church Location", kycData.guarantor_church_location],
          ],
        },
      ],
    },

    7: {
      title: "Guarantor Documents",
      sections: [
        {
          heading: "📄 Guarantor Documents",
          isArray: true,
          data: guarantorDocs,
          type: "documents",
          loading: loading.guarantorDocs,
          error: error.guarantorDocs,
        },
      ],
    },

    8: {
      title: "Loan History & Stats",
      sections: [
        {
          heading: "🏦 Loan History",
          isArray: true,
          data: loanHistory,
          type: "loanHistory",
          loading: loading.loanHistory,
          error: error.loanHistory,
        },
        {
          heading: "📊 Additional Statistics",
          rows: [
            ["Previous Repayment Behaviour", kycData.prev_repayment_behaviour],
            ["Total Borrowed", kycData.total_borrowed],
            ["Total Arrears", kycData.total_arrears],
            ["Current Outstanding Balance", kycData.current_outstanding_balance],
            ["Avg Repayment Performance", kycData.avg_repayment_performance],
            ["Visit Business", kycData.visit_business],
            ["Business Operating", kycData.business_operating],
            ["Observed Sales Correspondence", kycData.observed_sales_correspondence],
            ["Daily Customer Volume", kycData.daily_customer_volume],
            ["Key Risk Observed", kycData.key_risk_observed],
            ["Known Client Since", kycData.known_client_since],
            ["Adverse Info", kycData.adverse_info],
            ["Repayment Concerns", kycData.repayment_concerns],
            ["Verified Monthly Income", kycData.verified_monthly_income],
            ["Reasonable Repayment", kycData.reasonable_repayment],
            ["Recommended Amount", kycData.recommended_amount],
            ["Recommended Term", kycData.recommended_term],
            ["Recommendation Reason", kycData.recommendation_reason],
            ["References Count", kycData.reference_count],
            ["Client Documents Count", kycData.client_document_count],
            ["Guarantor Documents Count", kycData.guarantor_document_count],
            ["Loan History Count", kycData.loan_history_count],
            ["Loan Cycle Completed", kycData.loan_cycle_completed],
            ["Max Past Due Days", kycData.max_past_due_days],
            ["Missed Instalments", kycData.missed_instalments],
            ["Write-off Loans", kycData.write_off_loans],
            ["Extensions", kycData.extensions],
            ["Number of Pay-offs", kycData.number_of_pay_off],
          ],
        },
      ],
    },
  };

  /* =========================================================
     RENDER SECTION
     ========================================================= */
  const renderSection = (section) => {
    if (section.image) {
      const imageUrl = getImageUrl(section.image);

      return (
        <>
          {imageUrl && (
            <div className="mb-3">
              <img
                src={imageUrl}
                alt="Guarantor"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(imageUrl, "_blank")
                }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/180x180?text=No+Photo";
                }}
              />
            </div>
          )}

          <Table bordered responsive className="mb-0">
            <tbody>
              {section.rows.map(
                ([label, value], index) => (
                  <TableRow
                    key={index}
                    label={label}
                    value={value}
                  />
                )
              )}
            </tbody>
          </Table>
        </>
      );
    }

    /* =======================================================
       IMAGE GALLERY
       ======================================================= */
    if (section.imageGallery) {
      const hasImages = section.imageGallery.some(
        (group) =>
          Array.isArray(group.paths) &&
          group.paths.length > 0
      );

      if (!hasImages) {
        return (
          <div className="alert alert-light border text-muted">
            No collateral images or ownership documents uploaded.
          </div>
        );
      }

      return (
        <div>
          {section.imageGallery.map(
            (group, groupIndex) => {
              if (
                !Array.isArray(group.paths) ||
                group.paths.length === 0
              ) {
                return null;
              }

              return (
                <div
                  key={groupIndex}
                  className="mb-4"
                >
                  <div className="fw-semibold mb-3">
                    {group.label}
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    {group.paths.map(
                      (path, index) => {
                        const imageUrl =
                          getImageUrl(path);

                        if (!imageUrl) {
                          return null;
                        }

                        return (
                          <div
                            key={`${groupIndex}-${index}`}
                            className="kyc-image-card"
                          >
                            <img
                              src={imageUrl}
                              alt={`${group.label} ${
                                index + 1
                              }`}
                              className="kyc-gallery-image"
                              onClick={() =>
                                window.open(
                                  imageUrl,
                                  "_blank"
                                )
                              }
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  imageUrl
                                );

                                e.target.onerror =
                                  null;

                                e.target.src =
                                  "https://via.placeholder.com/180x150?text=No+Image";
                              }}
                            />

                            <div
                              className="small text-muted mt-2"
                              style={{
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {path
                                .split("/")
                                .pop()}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    }

    /* =======================================================
       ARRAY SECTIONS
       ======================================================= */
    if (section.isArray) {
      if (section.loading) {
        return (
          <div className="text-center py-3">
            <Spinner
              animation="border"
              size="sm"
            />

            <span className="ms-2">
              Loading...
            </span>
          </div>
        );
      }

      if (section.error) {
        return (
          <p className="text-danger">
            Error loading data: {section.error}
          </p>
        );
      }

      const items = section.data || [];

      if (!items.length) {
        return (
          <p className="text-muted">
            No data found.
          </p>
        );
      }

      /* References */
      if (section.type === "references") {
        return (
          <Table
            striped
            bordered
            hover
            responsive
            size="sm"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Relationship</th>
                <th>Location</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>
              {items.map((ref, index) => (
                <tr key={index}>
                  <td>
                    {renderValue(
                      ref.reference_name
                    )}
                  </td>

                  <td>
                    {renderValue(
                      ref.reference_relationship
                    )}
                  </td>

                  <td>
                    {renderValue(
                      ref.reference_location
                    )}
                  </td>

                  <td>
                    {renderValue(
                      ref.reference_contact
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      }

      /* Documents */
      if (section.type === "documents") {
        return (
          <>
            {items.map((doc, index) => {
              const fileUrl = getImageUrl(
                doc.file_path
              );

              return (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >
                  <div>
                    <strong>
                      {renderValue(
                        doc.display_name
                      )}
                    </strong>

                    <span className="text-muted ms-2 small">
                      (
                      {renderValue(
                        doc.original_filename
                      )}
                      )
                    </span>
                  </div>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!fileUrl}
                    onClick={() => {
                      if (fileUrl) {
                        window.open(
                          fileUrl,
                          "_blank"
                        );
                      }
                    }}
                  >
                    View
                  </Button>
                </div>
              );
            })}
          </>
        );
      }

      /* Loan History */
      if (section.type === "loanHistory") {
        return (
          <Table
            striped
            bordered
            hover
            responsive
            size="sm"
          >
            <thead>
              <tr>
                <th>Institution</th>
                <th>Principal</th>
                <th>Installment</th>
                <th>Balance</th>
                <th>Arrears</th>
                <th>Expiry</th>
              </tr>
            </thead>

            <tbody>
              {items.map((loan, index) => (
                <tr key={index}>
                  <td>
                    {renderValue(
                      loan.institution
                    )}
                  </td>

                  <td>
                    ₵
                    {renderValue(
                      loan.principal_amount
                    )}
                  </td>

                  <td>
                    ₵
                    {renderValue(
                      loan.installment_amount
                    )}
                  </td>

                  <td>
                    ₵
                    {renderValue(
                      loan.current_balance
                    )}
                  </td>

                  <td>
                    ₵
                    {renderValue(
                      loan.arrears_balance
                    )}
                  </td>

                  <td>
                    {renderValue(
                      loan.expiry_date
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      }

      return (
        <pre>
          {JSON.stringify(
            items,
            null,
            2
          )}
        </pre>
      );
    }

    /* Normal table */
    return (
      <Table bordered responsive className="mb-0">
        <tbody>
          {section.rows.map(
            ([label, value], index) => (
              <TableRow
                key={index}
                label={label}
                value={value}
              />
            )
          )}
        </tbody>
      </Table>
    );
  };

  const nextStep = () => {
    setStep((prev) =>
      Math.min(
        prev + 1,
        totalSteps
      )
    );
  };

  const prevStep = () => {
    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  return (
    <>
      <style>{modalStyles}</style>

      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="kyc-modal-dialog"
        scrollable
        backdrop="static"
      >
        {/* ===================================================
            COMPACT TOP BAR
            =================================================== */}
        <div className="kyc-compact-header">
          <div className="kyc-step-navigation">
            {stepTitles.map(
              (title, index) => (
                <div
                  key={index}
                  className={`kyc-step-item ${
                    step === index + 1
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStep(index + 1)
                  }
                >
                  <span className="kyc-step-number">
                    {index + 1}
                  </span>

                  <span className="kyc-step-title">
                    {title}
                  </span>
                </div>
              )
            )}
          </div>

          <button
            type="button"
            className="kyc-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ===================================================
            CONTENT
            =================================================== */}
        <Modal.Body>
          <h5 className="kyc-current-title">
            {stepContent[step]?.title}
          </h5>

          {stepContent[step]?.sections.map(
            (section, index) => (
              <div
                key={index}
                className="mb-4"
              >
                <h6 className="kyc-section-title">
                  {section.heading}
                </h6>

                {renderSection(section)}
              </div>
            )
          )}
        </Modal.Body>

        {/* ===================================================
            FOOTER
            =================================================== */}
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <div>
              {step > 1 && (
                <Button
                  variant="secondary"
                  onClick={prevStep}
                  className="me-2"
                >
                  ← Previous
                </Button>
              )}

              {step < totalSteps && (
                <Button
                  variant="primary"
                  onClick={nextStep}
                >
                  Next →
                </Button>
              )}
            </div>

            <Button
              variant="dark"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KycFullDetailsModal;