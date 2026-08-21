import React from "react";
import { MdPerson, MdClose } from "react-icons/md";

const Step6GuarantorDetails = ({
  formData,
  onChange,
  isMobile,
  inputStyle,
  selectStyle,
  focusStyle,
  blurStyle,
  employeeType,
  handleEmployeeTypeChange,
  guarantorPhotoPreview,
  handleGuarantorPhotoChange,
  onBack,
  onNext,
}) => {
  return (
    <>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#1e293b",
          marginTop: "0",
          marginBottom: "20px",
          paddingBottom: "8px",
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        Guarantor Details
      </h3>

      {/* --- PROFILE PICTURE --- */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#334155",
            marginBottom: "12px",
          }}
        >
          Guarantor Profile Picture
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("guarantorProfileInput").click()}
          >
            {guarantorPhotoPreview ? (
              <img
                src={guarantorPhotoPreview}
                alt="Guarantor"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <MdPerson size={48} color="#94a3b8" />
            )}
            {guarantorPhotoPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById("guarantorProfileInput").value = "";
                  handleGuarantorPhotoChange(null);
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <MdClose />
              </button>
            )}
          </div>
          <div>
            <input
              id="guarantorProfileInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleGuarantorPhotoChange(e.target.files[0])}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => document.getElementById("guarantorProfileInput").click()}
              style={{
                padding: "8px 20px",
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: "8px",
                color: "#4338ca",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
            >
              {guarantorPhotoPreview ? "Change Photo" : "Upload Photo"}
            </button>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              JPG, PNG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* --- Employment Information --- */}
      <div style={{ marginBottom: "24px" }}>
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginBottom: "12px",
          }}
        >
          Employment Information
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Employment Type <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="guarantorEmployeeType"
              value={employeeType}
              onChange={handleEmployeeTypeChange}
              required
              style={selectStyle}
            >
              <option value="">Select employment type</option>
              <option value="salary worker">Salary Worker (Employed)</option>
              <option value="self-employed">Self Employed (Business Owner)</option>
            </select>
          </div>

          {employeeType === "salary worker" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Rank / Position <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="guarantorRank"
                    value={formData.guarantorRank || ""}
                    onChange={onChange}
                    required
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Employer Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="guarantorNameOfEmployer"
                    value={formData.guarantorNameOfEmployer || ""}
                    onChange={onChange}
                    required
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Work Location <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="guarantorWorkLocation"
                    value={formData.guarantorWorkLocation || ""}
                    onChange={onChange}
                    required
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Years in Service <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="guarantorYearsInService"
                    value={formData.guarantorYearsInService || ""}
                    onChange={onChange}
                    required
                    min="0"
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </>
          )}

          {employeeType === "self-employed" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Business Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="guarantorBusinessName"
                    value={formData.guarantorBusinessName || ""}
                    onChange={onChange}
                    required
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Business Location <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="guarantorBusinessLocation"
                    value={formData.guarantorBusinessLocation || ""}
                    onChange={onChange}
                    required
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    Years in Business <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="guarantorYearsInBusiness"
                    value={formData.guarantorYearsInBusiness || ""}
                    onChange={onChange}
                    required
                    min="0"
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- Personal Information --- */}
      <div style={{ marginBottom: "24px" }}>
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginBottom: "12px",
          }}
        >
          Personal Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* First Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              First Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="guarantorFirstName"
              value={formData.guarantorFirstName || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Last Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Last Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="guarantorLastName"
              value={formData.guarantorLastName || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Phone Number */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Phone Number <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="tel"
              name="guarantorPhone"
              value={formData.guarantorPhone || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Alternative Phone Number */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Alternative Phone Number
            </label>
            <input
              type="tel"
              name="guarantorAltPhone"
              value={formData.guarantorAltPhone || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* ID Number */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              ID Number <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="guarantorIdNumber"
              value={formData.guarantorIdNumber || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Relationship */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Relationship <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="guarantorRelationship"
              value={formData.guarantorRelationship || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Church Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Church Name
            </label>
            <input
              type="text"
              name="guarantorChurchName"
              value={formData.guarantorChurchName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          {/* Church Location (NEW) */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Church Location
            </label>
            <input
              type="text"
              name="guarantorChurchLocation"
              value={formData.guarantorChurchLocation || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>
      </div>

      {/* --- Address Information --- */}
      <div style={{ marginBottom: "24px" }}>
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginBottom: "12px",
          }}
        >
          Address Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              GPS Address <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="guarantorAddress"
              value={formData.guarantorAddress || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#334155",
                marginBottom: "4px",
              }}
            >
              Residential Location
            </label>
            <input
              type="text"
              name="guarantorResidenceLocation"
              value={formData.guarantorResidenceLocation || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          

        </div>
      </div>

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          marginTop: "32px",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: "10px 24px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#334155",
            fontWeight: "500",
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          style={{
            padding: "10px 24px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: "#fff",
            fontWeight: "500",
          }}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Step6GuarantorDetails;