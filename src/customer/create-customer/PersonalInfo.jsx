// PersonalInfo.jsx
import React, { useState, useEffect } from "react";

// --- DEFAULT AVATAR (inline SVG) ---
const defaultAvatar = "data:image/svg+xml;base64," + btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#E0E7EF" stroke="#B0C4DE" stroke-width="2"/>
    <circle cx="50" cy="40" r="15" fill="#7F8C8D"/>
    <circle cx="40" cy="35" r="3" fill="#FFFFFF"/>
    <circle cx="60" cy="35" r="3" fill="#FFFFFF"/>
    <path d="M 35 55 Q 50 70 65 55" stroke="#7F8C8D" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>
`);

const PersonalInfo = ({
  formData,
  handleInputChange,
  handleFileChange,
  formErrors,
  checkingNationalId,
  user,
}) => {
  const [preview, setPreview] = useState(defaultAvatar);

  useEffect(() => {
    if (!formData?.avatar) {
      setPreview(defaultAvatar);
      return;
    }
    const objectUrl = URL.createObjectURL(formData.avatar);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formData?.avatar]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    handleFileChange({
      target: { name: "avatar", files: [file] },
    });
  };

  return (
    <div className="form-step">
      <p className="welcome-text">Welcome, {user?.fullName || "User"}!</p>
      <h3 className="form-title">Personal Information</h3>

      {/* Avatar Upload */}
      <div className="avatar-container">
        <label className="avatar-title">Profile Picture *</label>
        <div className="avatar-upload-wrapper">
          <label htmlFor="avatarUpload">
            <img src={preview} alt="avatar" className="avatar-preview" />
            <div className="avatar-overlay">Click to Upload</div>
          </label>
          <input
            type="file"
            id="avatarUpload"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
        {formErrors?.avatar && <span className="error-message">{formErrors.avatar}</span>}
      </div>

      {/* Form Grid */}
      <div className="form-grid">
        {/* Title */}
        <div className="form-group">
          <label>Title *</label>
          <select
            name="title"
            value={formData?.title || ""}
            onChange={handleInputChange}
            className={formErrors?.title ? "error-input" : ""}
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr.</option>
            <option value="Mrs">Mrs.</option>
            <option value="Miss">Miss</option>
            <option value="Dr">Dr</option>
            <option value="Prof">Prof</option>
          </select>
          {formErrors?.title && <span className="error-message">{formErrors.title}</span>}
        </div>

        <div className="form-group" hidden>
          <label>Id *</label>
          <div className="form-control bg-light">{formData?.userId || "-"}</div>
        </div>

        {/* First Name - now editable */}
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData?.firstName || ""}
            onChange={handleInputChange}
            placeholder="First Name"
            className={formErrors?.firstName ? "error-input" : ""}
          />
          {formErrors?.firstName && <span className="error-message">{formErrors.firstName}</span>}
        </div>

        {/* Middle Name (optional) */}
        <div className="form-group">
          <label>Middle Name (optional)</label>
          <input
            type="text"
            name="middleName"
            value={formData?.middleName || ""}
            onChange={handleInputChange}
            placeholder="Middle Name"
          />
        </div>

        {/* Last Name - now editable */}
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData?.lastName || ""}
            onChange={handleInputChange}
            placeholder="Last Name"
            className={formErrors?.lastName ? "error-input" : ""}
          />
          {formErrors?.lastName && <span className="error-message">{formErrors.lastName}</span>}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label>Date of Birth (yyyy-mm-dd) *</label>
          <input
            type="text"
            name="dateOfBirth"
            value={formData?.dateOfBirth || ""}
            onChange={handleInputChange}
            placeholder="e.g., 1990-05-30"
            required
            pattern="\d{4}-\d{2}-\d{2}"
            className={formErrors?.dateOfBirth ? "error-input" : ""}
          />
          {formErrors?.dateOfBirth && <span className="error-message">{formErrors.dateOfBirth}</span>}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label>Gender *</label>
          <select
            name="gender"
            value={formData?.gender || ""}
            onChange={handleInputChange}
            className={formErrors?.gender ? "error-input" : ""}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {formErrors?.gender && <span className="error-message">{formErrors.gender}</span>}
        </div>

        {/* Marital Status */}
        <div className="form-group">
          <label>Marital Status *</label>
          <select
            name="maritalStatus"
            value={formData?.maritalStatus || ""}
            onChange={handleInputChange}
            className={formErrors?.maritalStatus ? "error-input" : ""}
          >
            <option value="">Select Marital Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {formErrors?.maritalStatus && <span className="error-message">{formErrors.maritalStatus}</span>}
        </div>

        {/* National ID */}
        <div className="form-group">
          <label>National ID *</label>
          <input
            type="text"
            name="nationalId"
            value={formData?.nationalId || ""}
            onChange={handleInputChange}
            placeholder="National ID (e.g., GHA-123456789-0)"
            className={formErrors?.nationalId ? "error-input" : ""}
          />
          {checkingNationalId && <small className="checking-message">Checking National ID...</small>}
          {formErrors?.nationalId && <span className="error-message">{formErrors.nationalId}</span>}
        </div>

        {/* Residential Location */}
        <div className="form-group">
          <label>Residential Location *</label>
          <input
            type="text"
            name="residentialLocation"
            value={formData?.residentialLocation || ""}
            onChange={handleInputChange}
            placeholder="Residential Location"
            className={formErrors?.residentialLocation ? "error-input" : ""}
          />
          {formErrors?.residentialLocation && <span className="error-message">{formErrors.residentialLocation}</span>}
        </div>

        {/* Spouse Fields (conditional) */}
        {formData?.maritalStatus === "married" && (
          <>
            <div className="form-group">
              <label>Name of Spouse *</label>
              <input
                type="text"
                name="spouseName"
                value={formData?.spouseName || ""}
                onChange={handleInputChange}
                placeholder="Name of Spouse"
                className={formErrors?.spouseName ? "error-input" : ""}
              />
              {formErrors?.spouseName && <span className="error-message">{formErrors.spouseName}</span>}
            </div>
            <div className="form-group">
              <label>Spouse Contact *</label>
              <input
                type="tel"
                name="spouseContact"
                value={formData?.spouseContact || ""}
                onChange={handleInputChange}
                placeholder="Spouse Contact (e.g., 0241234567)"
                className={formErrors?.spouseContact ? "error-input" : ""}
              />
              {formErrors?.spouseContact && <span className="error-message">{formErrors.spouseContact}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalInfo;