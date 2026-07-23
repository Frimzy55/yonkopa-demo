// src/pages/CustomerDashboard/KYCVerification/steps/ContactInfo.jsx
import React from "react"

const ContactInfo = ({
  formData = {},
  handleInputChange,
  formErrors = {},
}) => {
  return (
    <div className="form-step">
      <h3>Contact Information</h3>

      <div className="form-grid">

        {/* Mobile Number */}
        <div className="form-group">
          <label>Mobile Number *</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber || ""}
            onChange={handleInputChange}
            placeholder="Enter Mobile Number *"
            required
            className={formErrors?.mobileNumber ? "error-input" : ""}
          />
          {formErrors?.mobileNumber && (
            <span className="error-message">{formErrors.mobileNumber}</span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            placeholder="Enter Email Address *"
            required
            className={formErrors?.email ? "error-input" : ""}
          />
          {formErrors?.email && (
            <span className="error-message">{formErrors.email}</span>
          )}
        </div>

        {/* Residential GPS Address */}
        <div className="form-group">
          <label>Residential GPS Address *</label>
          <input
            type="text"
            name="residentialAddress"
            value={formData.residentialAddress || ""}
            onChange={handleInputChange}
            placeholder="Residential GPS Address"
            className={formErrors?.residentialAddress ? "error-input" : ""}
          />
          {formErrors?.residentialAddress && (
            <span className="error-message">
              {formErrors.residentialAddress}
            </span>
          )}
        </div>

        {/* Residential Landmark */}
        <div className="form-group">
          <label>Residential Landmark</label>
          <input
            type="text"
            name="residentialLandmark"
            value={formData.residentialLandmark || ""}
            onChange={handleInputChange}
            placeholder="Residential Landmark"
            className={formErrors?.residentialLandmark ? "error-input" : ""}
          />
          {formErrors?.residentialLandmark && (
            <span className="error-message">
              {formErrors.residentialLandmark}
            </span>
          )}
        </div>

        {/* City/Town */}
        <div className="form-group">
          <label>City/Town *</label>
          <input
            type="text"
            name="city"
            value={formData.city || ""}
            onChange={handleInputChange}
            placeholder="City/Town"
            className={formErrors?.city ? "error-input" : ""}
          />
          {formErrors?.city && (
            <span className="error-message">{formErrors.city}</span>
          )}
        </div>

        {/* Suburb/Area */}
        <div className="form-group">
          <label>Suburb/Area *</label>
          <input
            type="text"
            name="state"
            value={formData.state || ""}
            onChange={handleInputChange}
            placeholder="Suburb/Area"
            className={formErrors?.state ? "error-input" : ""}
          />
          {formErrors?.state && (
            <span className="error-message">{formErrors.state}</span>
          )}
        </div>

        {/* Alternate Phone Number */}
        <div className="form-group">
          <label>Alternate Phone Number</label>
          <input
            type="tel"
            name="alternatePhone"
            value={formData.alternatePhone || ""}
            onChange={handleInputChange}
            placeholder="Alternate Phone Number"
            className={formErrors?.alternatePhone ? "error-input" : ""}
          />
          {formErrors?.alternatePhone && (
            <span className="error-message">
              {formErrors.alternatePhone}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactInfo;