// src/pages/CustomerDashboard/GuarantorInfo.jsx
import React, { useState, useEffect } from "react";

const GuarantorInfo = ({ formData, handleInputChange, errors, touchedFields, handleFieldBlur }) => {
  const employeeType = formData.guarantorEmployeeType || "";
  const [profilePreview, setProfilePreview] = useState(null);
  const [cardFrontPreview, setCardFrontPreview] = useState(null);
  const [cardBackPreview, setCardBackPreview] = useState(null);
  const [businessPreview, setBusinessPreview] = useState(null);
  const [payslipPreview, setPayslipPreview] = useState(null);

  // Handle profile picture preview
  useEffect(() => {
    if (formData.guarantorProfilePicture) {
      const objectUrl = URL.createObjectURL(formData.guarantorProfilePicture);
      setProfilePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setProfilePreview(null);
    }
  }, [formData.guarantorProfilePicture]);

  // Handle Ghana Card Front preview
  useEffect(() => {
    if (formData.guarantorGhanaCardFront) {
      const objectUrl = URL.createObjectURL(formData.guarantorGhanaCardFront);
      setCardFrontPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCardFrontPreview(null);
    }
  }, [formData.guarantorGhanaCardFront]);

  // Handle Ghana Card Back preview
  useEffect(() => {
    if (formData.guarantorGhanaCardBack) {
      const objectUrl = URL.createObjectURL(formData.guarantorGhanaCardBack);
      setCardBackPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCardBackPreview(null);
    }
  }, [formData.guarantorGhanaCardBack]);

  // Handle Business Picture preview
  useEffect(() => {
    if (formData.guarantorBusinessPicture) {
      const objectUrl = URL.createObjectURL(formData.guarantorBusinessPicture);
      setBusinessPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setBusinessPreview(null);
    }
  }, [formData.guarantorBusinessPicture]);

  // Handle Payslip preview
  useEffect(() => {
    if (formData.guarantorPayslip) {
      const objectUrl = URL.createObjectURL(formData.guarantorPayslip);
      setPayslipPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPayslipPreview(null);
    }
  }, [formData.guarantorPayslip]);

  const handleEmployeeTypeChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);
    handleFieldBlur?.("guarantorEmployeeType");

    if (value === "salary worker") {
      handleInputChange({ target: { name: "guarantorBusinessName", value: "" } });
      handleInputChange({ target: { name: "guarantorBusinessLocation", value: "" } });
      handleInputChange({ target: { name: "guarantorYearsInBusiness", value: "" } });
      handleInputChange({ target: { name: "guarantorBusinessPicture", value: null } });
    } else if (value === "self-employed") {
      handleInputChange({ target: { name: "guarantorRank", value: "" } });
      handleInputChange({ target: { name: "guarantorWorkLocation", value: "" } });
      handleInputChange({ target: { name: "guarantorYearsInService", value: "" } });
      handleInputChange({ target: { name: "guarantorPayslip", value: null } });
      handleInputChange({ target: { name: "guarantorNameOfEmployer", value: "" } });
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] && touchedFields[fieldName] ? errors[fieldName] : null;
  };

  return (
    <div className="form-step">
      <h3>Guarantor Information</h3>
      <p className="step-description">Please provide accurate information about your guarantor</p>

      {/* Profile Picture Upload Section */}
      <div className="profile-upload-section">
        <div className="profile-upload-container">
          <div 
            className={`profile-upload-circle ${getFieldError('guarantorProfilePicture') ? 'error-border' : ''}`}
            onClick={() => document.getElementById('guarantorProfilePicture').click()}
          >
            {profilePreview ? (
              <img src={profilePreview} alt="Guarantor Profile" className="profile-preview" />
            ) : (
              <div className="profile-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Upload Photo</span>
              </div>
            )}
            <input
              id="guarantorProfilePicture"
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => {
                handleInputChange({
                  target: { name: "guarantorProfilePicture", value: e.target.files[0] },
                });
                handleFieldBlur?.("guarantorProfilePicture");
              }}
            />
          </div>
          {getFieldError('guarantorProfilePicture') && (
            <div className="field-error-message">{getFieldError('guarantorProfilePicture')}</div>
          )}
          <p className="upload-hint">Click to upload guarantor's photo (Max 5MB)</p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="form-section">
        <h4 className="section-subtitle">Personal Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label className={formData.guarantorName ? "filled" : ""}>
              Full Name <span className="required">*</span>
            </label>
            <input
              name="guarantorName"
              type="text"
              placeholder="Enter guarantor's full name"
              value={formData.guarantorName || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("guarantorName")}
              className={getFieldError('guarantorName') ? 'error' : ''}
            />
            {getFieldError('guarantorName') && (
              <div className="error-message">{getFieldError('guarantorName')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.guarantorPhone ? "filled" : ""}>
              Phone Number <span className="required">*</span>
            </label>
            <input
              name="guarantorPhone"
              type="tel"
              placeholder="e.g., 0244123456"
              value={formData.guarantorPhone || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("guarantorPhone")}
              className={getFieldError('guarantorPhone') ? 'error' : ''}
            />
            {getFieldError('guarantorPhone') && (
              <div className="error-message">{getFieldError('guarantorPhone')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.guarantorIdNumber ? "filled" : ""}>
              ID Number <span className="required">*</span>
            </label>
            <input
              name="guarantorIdNumber"
              type="text"
              placeholder="Guarantor's Ghana Card / Passport"
              value={formData.guarantorIdNumber || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("guarantorIdNumber")}
              className={getFieldError('guarantorIdNumber') ? 'error' : ''}
            />
            {getFieldError('guarantorIdNumber') && (
              <div className="error-message">{getFieldError('guarantorIdNumber')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="form-section">
        <h4 className="section-subtitle">Address Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label className={formData.guarantorAddress ? "filled" : ""}>
              GPS Address <span className="required">*</span>
            </label>
            <input
              name="guarantorAddress"
              type="text"
              placeholder="e.g., GA-123-4567"
              value={formData.guarantorAddress || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("guarantorAddress")}
              className={getFieldError('guarantorAddress') ? 'error' : ''}
            />
            {getFieldError('guarantorAddress') && (
              <div className="error-message">{getFieldError('guarantorAddress')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.guarantorResidenceLocation ? "filled" : ""}>
              Residential Location
            </label>
            <input
              name="guarantorResidenceLocation"
              type="text"
              placeholder="e.g., East Legon, Atomic Hills"
              value={formData.guarantorResidenceLocation || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("guarantorResidenceLocation")}
            />
          </div>
        </div>
      </div>

      {/* Employment Information Section */}
      <div className="form-section">
        <h4 className="section-subtitle">Employment Information</h4>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>
              Employment Type <span className="required">*</span>
            </label>
            <select
              name="guarantorEmployeeType"
              value={employeeType}
              onChange={handleEmployeeTypeChange}
              onBlur={() => handleFieldBlur?.("guarantorEmployeeType")}
              className={getFieldError('guarantorEmployeeType') ? 'error' : ''}
            >
              <option value="">Select employment type</option>
              <option value="salary worker">Salary Worker (Employed)</option>
              <option value="self-employed">Self Employed (Business Owner)</option>
            </select>
            {getFieldError('guarantorEmployeeType') && (
              <div className="error-message">{getFieldError('guarantorEmployeeType')}</div>
            )}
          </div>

          {/* Salary Worker Fields */}
          {employeeType === "salary worker" && (
            <>
              <div className="form-group">
                <label className={formData.guarantorRank ? "filled" : ""}>
                  Rank / Position <span className="required">*</span>
                </label>
                <input
                  name="guarantorRank"
                  type="text"
                  placeholder="e.g., Senior Manager"
                  value={formData.guarantorRank || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorRank")}
                  className={getFieldError('guarantorRank') ? 'error' : ''}
                />
                {getFieldError('guarantorRank') && (
                  <div className="error-message">{getFieldError('guarantorRank')}</div>
                )}
              </div>

              <div className="form-group">
                <label className={formData.guarantorNameOfEmployer ? "filled" : ""}>
                  Employer Name <span className="required">*</span>
                </label>
                <input
                  name="guarantorNameOfEmployer"
                  type="text"
                  placeholder="Name of company/organization"
                  value={formData.guarantorNameOfEmployer || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorNameOfEmployer")}
                  className={getFieldError('guarantorNameOfEmployer') ? 'error' : ''}
                />
                {getFieldError('guarantorNameOfEmployer') && (
                  <div className="error-message">{getFieldError('guarantorNameOfEmployer')}</div>
                )}
              </div>

              <div className="form-group">
                <label className={formData.guarantorWorkLocation ? "filled" : ""}>
                  Work Location <span className="required">*</span>
                </label>
                <input
                  name="guarantorWorkLocation"
                  type="text"
                  placeholder="City or town where they work"
                  value={formData.guarantorWorkLocation || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorWorkLocation")}
                  className={getFieldError('guarantorWorkLocation') ? 'error' : ''}
                />
                {getFieldError('guarantorWorkLocation') && (
                  <div className="error-message">{getFieldError('guarantorWorkLocation')}</div>
                )}
              </div>

              <div className="form-group">
                <label className={formData.guarantorYearsInService ? "filled" : ""}>
                  Years in Service <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="guarantorYearsInService"
                  placeholder="Number of years"
                  value={formData.guarantorYearsInService || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorYearsInService")}
                  className={getFieldError('guarantorYearsInService') ? 'error' : ''}
                />
                {getFieldError('guarantorYearsInService') && (
                  <div className="error-message">{getFieldError('guarantorYearsInService')}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  Recent Payslip <span className="required">*</span>
                </label>
                <div className="file-upload-container">
                  <div 
                    className={`file-upload-area ${payslipPreview ? 'has-file' : ''} ${getFieldError('guarantorPayslip') ? 'error-border' : ''}`}
                    onClick={() => document.getElementById('guarantorPayslip').click()}
                  >
                    {payslipPreview ? (
                      <div className="file-preview">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>{formData.guarantorPayslip?.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                        <p>Click or drag to upload payslip</p>
                        <small>PDF, JPG, PNG (Max 5MB)</small>
                      </>
                    )}
                  </div>
                  <input
                    id="guarantorPayslip"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      handleInputChange({
                        target: { name: "guarantorPayslip", value: e.target.files[0] },
                      });
                      handleFieldBlur?.("guarantorPayslip");
                    }}
                  />
                </div>
                {getFieldError('guarantorPayslip') && (
                  <div className="error-message">{getFieldError('guarantorPayslip')}</div>
                )}
              </div>
            </>
          )}

          {/* Self Employed Fields */}
          {employeeType === "self-employed" && (
            <>
              <div className="form-group">
                <label className={formData.guarantorBusinessName ? "filled" : ""}>
                  Business Name <span className="required">*</span>
                </label>
                <input
                  name="guarantorBusinessName"
                  type="text"
                  placeholder="Registered business name"
                  value={formData.guarantorBusinessName || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorBusinessName")}
                  className={getFieldError('guarantorBusinessName') ? 'error' : ''}
                />
                {getFieldError('guarantorBusinessName') && (
                  <div className="error-message">{getFieldError('guarantorBusinessName')}</div>
                )}
              </div>

              <div className="form-group">
                <label className={formData.guarantorBusinessLocation ? "filled" : ""}>
                  Business Location <span className="required">*</span>
                </label>
                <input
                  name="guarantorBusinessLocation"
                  type="text"
                  placeholder="Address or area of business"
                  value={formData.guarantorBusinessLocation || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorBusinessLocation")}
                  className={getFieldError('guarantorBusinessLocation') ? 'error' : ''}
                />
                {getFieldError('guarantorBusinessLocation') && (
                  <div className="error-message">{getFieldError('guarantorBusinessLocation')}</div>
                )}
              </div>

              <div className="form-group">
                <label className={formData.guarantorYearsInBusiness ? "filled" : ""}>
                  Years in Business <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="guarantorYearsInBusiness"
                  placeholder="Number of years"
                  value={formData.guarantorYearsInBusiness || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur?.("guarantorYearsInBusiness")}
                  className={getFieldError('guarantorYearsInBusiness') ? 'error' : ''}
                />
                {getFieldError('guarantorYearsInBusiness') && (
                  <div className="error-message">{getFieldError('guarantorYearsInBusiness')}</div>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  Business Picture <span className="required">*</span>
                </label>
                <div className="file-upload-container">
                  <div 
                    className={`file-upload-area ${businessPreview ? 'has-file' : ''} ${getFieldError('guarantorBusinessPicture') ? 'error-border' : ''}`}
                    onClick={() => document.getElementById('guarantorBusinessPicture').click()}
                  >
                    {businessPreview ? (
                      <div className="image-preview">
                        <img src={businessPreview} alt="Business" />
                        <span className="change-text">Click to change</span>
                      </div>
                    ) : (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="2" y="2" width="20" height="20" rx="2" />
                          <circle cx="8.5" cy="8.5" r="2.5" />
                          <path d="M21 15l-5-4-3 3-5-5-6 6" />
                        </svg>
                        <p>Upload business picture</p>
                        <small>JPG, PNG (Max 5MB)</small>
                      </>
                    )}
                  </div>
                  <input
                    id="guarantorBusinessPicture"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      handleInputChange({
                        target: { name: "guarantorBusinessPicture", value: e.target.files[0] },
                      });
                      handleFieldBlur?.("guarantorBusinessPicture");
                    }}
                  />
                </div>
                {getFieldError('guarantorBusinessPicture') && (
                  <div className="error-message">{getFieldError('guarantorBusinessPicture')}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ID Documents Section */}
      {(employeeType === "salary worker" || employeeType === "self-employed") && (
        <div className="form-section">
          <h4 className="section-subtitle">Identification Documents</h4>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>
                Ghana Card (Front) <span className="required">*</span>
              </label>
              <div className="file-upload-container">
                <div 
                  className={`file-upload-area ${cardFrontPreview ? 'has-file' : ''} ${getFieldError('guarantorGhanaCardFront') ? 'error-border' : ''}`}
                  onClick={() => document.getElementById('guarantorGhanaCardFront').click()}
                >
                  {cardFrontPreview ? (
                    <div className="image-preview">
                      <img src={cardFrontPreview} alt="Ghana Card Front" />
                      <span className="change-text">Click to change</span>
                    </div>
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="16" x2="16" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p>Upload front side</p>
                    </>
                  )}
                </div>
                <input
                  id="guarantorGhanaCardFront"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    handleInputChange({
                      target: { name: "guarantorGhanaCardFront", value: e.target.files[0] },
                    });
                    handleFieldBlur?.("guarantorGhanaCardFront");
                  }}
                />
              </div>
              {getFieldError('guarantorGhanaCardFront') && (
                <div className="error-message">{getFieldError('guarantorGhanaCardFront')}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                Ghana Card (Back) <span className="required">*</span>
              </label>
              <div className="file-upload-container">
                <div 
                  className={`file-upload-area ${cardBackPreview ? 'has-file' : ''} ${getFieldError('guarantorGhanaCardBack') ? 'error-border' : ''}`}
                  onClick={() => document.getElementById('guarantorGhanaCardBack').click()}
                >
                  {cardBackPreview ? (
                    <div className="image-preview">
                      <img src={cardBackPreview} alt="Ghana Card Back" />
                      <span className="change-text">Click to change</span>
                    </div>
                  ) : (
                    <>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="16" x2="16" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p>Upload back side</p>
                    </>
                  )}
                </div>
                <input
                  id="guarantorGhanaCardBack"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    handleInputChange({
                      target: { name: "guarantorGhanaCardBack", value: e.target.files[0] },
                    });
                    handleFieldBlur?.("guarantorGhanaCardBack");
                  }}
                />
              </div>
              {getFieldError('guarantorGhanaCardBack') && (
                <div className="error-message">{getFieldError('guarantorGhanaCardBack')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuarantorInfo;