// src/pages/CustomerDashboard/KYCVerification/KycEmploymentInfos.jsx
import React from "react";


const EmploymentInfo = ({ formData, handleInputChange, handleFileChange, formErrors }) => {
  return (
    <div className="form-step">
      <h3>Employment and Income</h3>
      <div className="form-grid">

        {/* Employment Status */}
        <div className="form-group">
          <label>Employment Status</label>
          <select
            name="employmentStatus"
            value={formData.employmentStatus || ""}
            onChange={handleInputChange}
          >
            <option value="">Select Employment Status</option>
            <option value="salary-worker">Salary Worker</option>
            <option value="self-employed">Self-Employed</option>
          </select>
          {formErrors?.employmentStatus && (
            <span className="error-message">{formErrors.employmentStatus}</span>
          )}
        </div>

        {/* Salary Worker Fields */}
        {formData.employmentStatus === "salary-worker" && (
          <>
            <div className="form-group">
              <label>Employer Name</label>
              <input
                type="text"
                name="employerName"
                value={formData.employerName || ""}
                onChange={handleInputChange}
                placeholder="Employer Name"
              />
              {formErrors?.employerName && (
                <span className="error-message">{formErrors.employerName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Job Title / Position</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle || ""}
                onChange={handleInputChange}
                placeholder="Job Title / Position"
              />
              {formErrors?.jobTitle && (
                <span className="error-message">{formErrors.jobTitle}</span>
              )}
            </div>

            <div className="form-group">
              <label>Monthly Income</label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome || ""}
                onChange={handleInputChange}
                placeholder="Monthly Income"
              />
              {formErrors?.monthlyIncome && (
                <span className="error-message">{formErrors.monthlyIncome}</span>
              )}
            </div>

            <div className="form-group">
              <label>Years in Current Employment</label>
              <input
                type="number"
                name="yearsInCurrentEmployment"
                value={formData.yearsInCurrentEmployment || ""}
                onChange={handleInputChange}
                placeholder="Years in Current Employment"
              />
              {formErrors?.yearsInCurrentEmployment && (
                <span className="error-message">{formErrors.yearsInCurrentEmployment}</span>
              )}
            </div>

            <div className="form-group">
              <label>Workplace Location</label>
              <input
                type="text"
                name="workPlaceLocation"
                value={formData.workPlaceLocation || ""}
                onChange={handleInputChange}
                placeholder="Workplace Location"
              />
              {formErrors?.workPlaceLocation && (
                <span className="error-message">{formErrors.workPlaceLocation}</span>
              )}
            </div>

            <div className="form-group">
              <label>Recent Payslip</label>
              <input type="file" name="payslip" onChange={handleFileChange} />
              {formErrors?.payslip && <span className="error-message">{formErrors.payslip}</span>}
            </div>

            <div className="form-group">
              <label>Ghana Card Front</label>
              <input type="file" name="ghanaCardFront" onChange={handleFileChange} />
              {formErrors?.ghanaCardFront && (
                <span className="error-message">{formErrors.ghanaCardFront}</span>
              )}
            </div>

            <div className="form-group">
              <label>Ghana Card Back</label>
              <input type="file" name="ghanaCardBack" onChange={handleFileChange} />
              {formErrors?.ghanaCardBack && (
                <span className="error-message">{formErrors.ghanaCardBack}</span>
              )}
            </div>

            <div className="form-group">
              <label>Employment ID</label>
              <input type="file" name="employmentId" onChange={handleFileChange} />
              {formErrors?.employmentId && (
                <span className="error-message">{formErrors.employmentId}</span>
              )}
            </div>
          </>
        )}

        {/* Self-Employed Fields */}
        {formData.employmentStatus === "self-employed" && (
          <>
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName || ""}
                onChange={handleInputChange}
                placeholder="Business Name"
              />
              {formErrors?.businessName && (
                <span className="error-message">{formErrors.businessName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Type of Business</label>
              <input
                type="text"
                name="businessType"
                value={formData.businessType || ""}
                onChange={handleInputChange}
                placeholder="Type of Business"
              />
              {formErrors?.businessType && (
                <span className="error-message">{formErrors.businessType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Monthly Business Income</label>
              <input
                type="number"
                name="monthlyBusinessIncome"
                value={formData.monthlyBusinessIncome || ""}
                onChange={handleInputChange}
                placeholder="Monthly Business Income"
              />
              {formErrors?.monthlyBusinessIncome && (
                <span className="error-message">{formErrors.monthlyBusinessIncome}</span>
              )}
            </div>

            <div className="form-group">
              <label>Business Location</label>
              <input
                type="text"
                name="businessLocation"
                value={formData.businessLocation || ""}
                onChange={handleInputChange}
                placeholder="Business Location"
              />
              {formErrors?.businessLocation && (
                <span className="error-message">{formErrors.businessLocation}</span>
              )}
            </div>

            <div className="form-group">
              <label>Business GPS Address</label>
              <input
                type="text"
                name="businessGpsAddress"
                value={formData.businessGpsAddress || ""}
                onChange={handleInputChange}
                placeholder="Business GPS Address"
              />
              {formErrors?.businessGpsAddress && (
                <span className="error-message">{formErrors.businessGpsAddress}</span>
              )}
            </div>

            <div className="form-group">
              <label>Number of Workers</label>
              <input
                type="number"
                name="numberOfWorkers"
                value={formData.numberOfWorkers || ""}
                onChange={handleInputChange}
                placeholder="Number of Workers"
              />
              {formErrors?.numberOfWorkers && (
                <span className="error-message">{formErrors.numberOfWorkers}</span>
              )}
            </div>

            <div className="form-group">
              <label>Years in Business</label>
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness || ""}
                onChange={handleInputChange}
                placeholder="Years in Business"
              />
              {formErrors?.yearsInBusiness && (
                <span className="error-message">{formErrors.yearsInBusiness}</span>
              )}
            </div>

            <div className="form-group">
              <label>Working Capital</label>
              <input
                type="number"
                name="workingCapital"
                value={formData.workingCapital || ""}
                onChange={handleInputChange}
                placeholder="Working Capital"
              />
              {formErrors?.workingCapital && (
                <span className="error-message">{formErrors.workingCapital}</span>
              )}
            </div>

            <div className="form-group">
              <label>Upload Business Picture</label>
              <input
                type="file"
                name="businessPicture"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {formErrors?.businessPicture && (
                <span className="error-message">{formErrors.businessPicture}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmploymentInfo;