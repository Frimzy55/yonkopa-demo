import React from "react";
import { MdArrowBack, MdClose, MdPerson } from "react-icons/md";

const KYCForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  onFileChange,
  photoPreview,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <button
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
        <MdArrowBack size={18} /> Back to applications
      </button>

      <form onSubmit={onSubmit}>
        {/* --- PROFILE PICTURE --- */}
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "12px" }}>
            Profile Picture
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
              onClick={() => document.getElementById("profileInput").click()}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <MdPerson size={48} color="#94a3b8" />
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("profileInput").value = "";
                    onFileChange(null);
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
                id="profileInput"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  onFileChange(file);
                }}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("profileInput").click()}
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
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </button>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                JPG, PNG, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* --- PERSONAL INFORMATION SECTION --- */}
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
          Personal Information
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Full Name */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Popular Name */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Popular Name
            </label>
            <input
              type="text"
              name="popularName"
              value={formData.popularName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Hometown */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Hometown *
            </label>
            <input
              type="text"
              name="hometown"
              value={formData.hometown || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Place of Birth */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Place of Birth *
            </label>
            <input
              type="text"
              name="placeOfBirth"
              value={formData.placeOfBirth || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Ghana Card Number */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Ghana Card Number *
            </label>
            <input
              type="text"
              name="ghanaCardNumber"
              value={formData.ghanaCardNumber || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Date Issued */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Date Issued *
            </label>
            <input
              type="date"
              name="dateIssued"
              value={formData.dateIssued || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={onChange}
              required
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Marital Status */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Marital Status *
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus || ""}
              onChange={onChange}
              required
              style={selectStyle}
            >
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>

        {/* Family Details – two columns */}
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginTop: "20px",
            marginBottom: "12px",
          }}
        >
          Family Information
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Father's Name */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Father's Name
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Mother's Name */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Mother's Name
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Father's Contact */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Father's Contact
            </label>
            <input
              type="tel"
              name="fatherContact"
              value={formData.fatherContact || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Mother's Contact */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Mother's Contact
            </label>
            <input
              type="tel"
              name="motherContact"
              value={formData.motherContact || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Name of Spouse */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Name of Spouse
            </label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Spouse Contact */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Spouse Contact
            </label>
            <input
              type="tel"
              name="spouseContact"
              value={formData.spouseContact || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Spouse Occupation */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Spouse Occupation
            </label>
            <input
              type="text"
              name="spouseOccupation"
              value={formData.spouseOccupation || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        {/* Residential & Dependents */}
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginTop: "20px",
            marginBottom: "12px",
          }}
        >
          Residential & Dependents
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Residential Location */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Residential Location
            </label>
            <input
              type="text"
              name="residentialLocation"
              value={formData.residentialLocation || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Residential Ownership */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Residential Ownership *
            </label>
            <select
              name="residentialOwnership"
              value={formData.residentialOwnership || ""}
              onChange={onChange}
              required
              style={selectStyle}
            >
              <option value="">Select</option>
              <option value="owned">Owned</option>
              <option value="rented">Rented</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Nearest Landmark */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Nearest Landmark
            </label>
            <input
              type="text"
              name="nearestLandmark"
              value={formData.nearestLandmark || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* GPS Address */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Residential GPS Address
            </label>
            <input
              type="text"
              name="gpsAddress"
              value={formData.gpsAddress || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Years at this address */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Years at this Address
            </label>
            <input
              type="number"
              name="yearsAtAddress"
              value={formData.yearsAtAddress || ""}
              onChange={onChange}
              min="0"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Rent Advance */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Rent Advance (months)
            </label>
            <input
              type="number"
              name="rentAdvance"
              value={formData.rentAdvance || ""}
              onChange={onChange}
              min="0"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Number of Dependents */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Number of Dependents
            </label>
            <input
              type="number"
              name="numberOfDependents"
              value={formData.numberOfDependents || ""}
              onChange={onChange}
              min="0"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Dependents Schooling */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Dependents Schooling (e.g., all enrolled)
            </label>
            <input
              type="text"
              name="dependentsSchooling"
              value={formData.dependentsSchooling || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        {/* Religion & Church */}
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#334155",
            marginTop: "20px",
            marginBottom: "12px",
          }}
        >
          Religious Information
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Religion */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Religion
            </label>
            <input
              type="text"
              name="religion"
              value={formData.religion || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Name of Church */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Name of Church
            </label>
            <input
              type="text"
              name="churchName"
              value={formData.churchName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Church Location */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Church Location
            </label>
            <input
              type="text"
              name="churchLocation"
              value={formData.churchLocation || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Name of Pastor */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Name of Pastor
            </label>
            <input
              type="text"
              name="pastorName"
              value={formData.pastorName || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Pastor's Contact */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
              Pastor's Contact
            </label>
            <input
              type="tel"
              name="pastorContact"
              value={formData.pastorContact || ""}
              onChange={onChange}
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
        </div>

        {/* --- Submit and Cancel buttons --- */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
          <button
            type="button"
            onClick={onCancel}
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
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              background: "#6366f1",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#fff",
              fontWeight: "500",
            }}
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable styles to avoid repetition
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
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const focusStyle = (e) => (e.target.style.borderColor = "#818cf8");
const blurStyle = (e) => (e.target.style.borderColor = "#e2e8f0");

export default KYCForm;