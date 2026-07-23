import React from "react";


const ReferenceInfo = ({
  formData = {},
  handleInputChange,
  formErrors = {},
}) => {
  return (
    <div className="reference-container">
      <h4 className="reference-title">Reference Information</h4>

      {/* Reference 1 */}
      <div className="reference-card">
        <div className="reference-card-header">
          Reference 1 <span className="required-badge">Required</span>
        </div>
        <div className="reference-card-body">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="referenceName1"
              value={formData?.referenceName1 || ""}
              onChange={handleInputChange}
              className={formErrors?.referenceName1 ? "error-input" : ""}
              placeholder="Enter full name"
            />
            {formErrors?.referenceName1 && (
              <span className="error-message">{formErrors.referenceName1}</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="referencePhone1"
              value={formData?.referencePhone1 || ""}
              onChange={handleInputChange}
              className={formErrors?.referencePhone1 ? "error-input" : ""}
              placeholder="e.g. 0241234567"
            />
            {formErrors?.referencePhone1 && (
              <span className="error-message">{formErrors.referencePhone1}</span>
            )}
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              name="referenceRelationship1"
              value={formData?.referenceRelationship1 || ""}
              onChange={handleInputChange}
              placeholder="e.g. Brother, Friend"
            />
          </div>
        </div>
      </div>

      {/* Reference 2 */}
      <div className="reference-card">
        <div className="reference-card-header">
          Reference 2 <span className="required-badge">Required</span>
        </div>
        <div className="reference-card-body">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="referenceName2"
              value={formData?.referenceName2 || ""}
              onChange={handleInputChange}
              className={formErrors?.referenceName2 ? "error-input" : ""}
              placeholder="Enter full name"
            />
            {formErrors?.referenceName2 && (
              <span className="error-message">{formErrors.referenceName2}</span>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="referencePhone2"
              value={formData?.referencePhone2 || ""}
              onChange={handleInputChange}
              className={formErrors?.referencePhone2 ? "error-input" : ""}
              placeholder="e.g. 0209876543"
            />
            {formErrors?.referencePhone2 && (
              <span className="error-message">{formErrors.referencePhone2}</span>
            )}
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              name="referenceRelationship2"
              value={formData?.referenceRelationship2 || ""}
              onChange={handleInputChange}
              placeholder="e.g. Colleague, Sister"
            />
          </div>
        </div>
      </div>

      {/* Reference 3 (Optional) */}
      <div className="reference-card">
        <div className="reference-card-header">
          Reference 3
          <span className="optional-badge">Optional</span>
        </div>
        <div className="reference-card-body">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="referenceName3"
              value={formData?.referenceName3 || ""}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="referencePhone3"
              value={formData?.referencePhone3 || ""}
              onChange={handleInputChange}
              placeholder="e.g. 0551234567"
            />
          </div>

          <div className="form-group">
            <label>Relationship</label>
            <input
              type="text"
              name="referenceRelationship3"
              value={formData?.referenceRelationship3 || ""}
              onChange={handleInputChange}
              placeholder="e.g. Friend"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceInfo;