// src/pages/CustomerDashboard/LoanDetails.jsx
import React, { useEffect, useState } from "react";

const LoanDetails = ({ formData, handleInputChange, errors, touchedFields, handleFieldBlur }) => {
  const [loanSummary, setLoanSummary] = useState({
    interest: 0,
    totalInterest: 0,
    numberOfPayments: 0,
    monthlyPayment: 0,
    loanFees: 0,
  });

  // Set Rate Per Annum based on employment status
  useEffect(() => {
    let rate = "";

    if (formData.employmentStatus === "self-employed") {
      rate = "80";
    } else if (formData.employmentStatus === "salary-worker") {
      rate = "72";
    }

    if (formData.ratePerAnnum !== rate) {
      handleInputChange({
        target: { name: "ratePerAnnum", value: rate },
      });
    }
  }, [formData.employmentStatus, formData.ratePerAnnum, handleInputChange]);

  // Loan Calculation
  useEffect(() => {
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const loanTerm = parseFloat(formData.loanTerm) || 0;
    const repaymentFrequency = formData.repaymentFrequency || "Monthly";

    let monthlyRate = 0;

    if (formData.employmentStatus === "self-employed") {
      monthlyRate = 0.06667; // 80% / 12
    } else if (formData.employmentStatus === "salary-worker") {
      monthlyRate = 0.06; // 72% / 12
    }

    const interest = loanAmount * monthlyRate * loanTerm;
    const totalInterest = loanAmount + interest;

    const numberOfPayments =
      repaymentFrequency === "Weekly" ? loanTerm * 4 : loanTerm;

    const monthlyPayment =
      numberOfPayments > 0 ? totalInterest / numberOfPayments : 0;

    let loanFees = 0;

    if (formData.employmentStatus === "self-employed") {
      loanFees = loanAmount * 0.07;
    } else if (formData.employmentStatus === "salary-worker") {
      loanFees = loanAmount * 0.05;
    }

    setLoanSummary({
      interest,
      totalInterest,
      numberOfPayments,
      monthlyPayment,
      loanFees,
    });
  }, [
    formData.loanAmount,
    formData.loanTerm,
    formData.repaymentFrequency,
    formData.employmentStatus,
  ]);

  // Sync to form data
  useEffect(() => {
    handleInputChange({
      target: { name: "interest", value: loanSummary.interest },
    });
    handleInputChange({
      target: { name: "totalInterest", value: loanSummary.totalInterest },
    });
    handleInputChange({
      target: {
        name: "numberOfPayments",
        value: loanSummary.numberOfPayments,
      },
    });
    handleInputChange({
      target: {
        name: "monthlyPayment",
        value: loanSummary.monthlyPayment,
      },
    });
    handleInputChange({
      target: { name: "loanFees", value: loanSummary.loanFees },
    });
  }, [loanSummary, handleInputChange]);

  const getFieldError = (fieldName) => {
    return errors && errors[fieldName] && touchedFields && touchedFields[fieldName] ? errors[fieldName] : null;
  };

  return (
    <div className="form-step">
      <h3>Loan Details</h3>
      <p className="step-description">Please provide accurate loan information for processing</p>

      {/* Loan Application Form */}
      <div className="form-section">
        <h4 className="section-subtitle">Loan Application Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label className={formData.loanAmount ? "filled" : ""}>
              Loan Amount (GHS) <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">₵</span>
              <input
                name="loanAmount"
                type="number"
                placeholder="Enter loan amount"
                value={formData.loanAmount || ""}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur?.("loanAmount")}
                className={getFieldError('loanAmount') ? 'error' : ''}
                min="100"
                max="1000000"
                step="100"
              />
            </div>
          
            {getFieldError('loanAmount') && (
              <div className="error-message">{getFieldError('loanAmount')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.loanPurpose ? "filled" : ""}>
              Loan Purpose <span className="required">*</span>
            </label>
            <select
              name="loanPurpose"
              value={formData.loanPurpose || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("loanPurpose")}
              className={getFieldError('loanPurpose') ? 'error' : ''}
            >
              <option value="">Select loan purpose</option>
              <option value="Business Expansion">Business Expansion</option>
              <option value="Education">Education</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Home Improvement">Home Improvement</option>
              <option value="Vehicle Purchase">Vehicle Purchase</option>
              <option value="Wedding">Wedding</option>
              <option value="Other">Other</option>
            </select>
            {getFieldError('loanPurpose') && (
              <div className="error-message">{getFieldError('loanPurpose')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.loanTerm ? "filled" : ""}>
              Loan Term <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <input
                name="loanTerm"
                type="number"
                placeholder="Enter loan term"
                value={formData.loanTerm || ""}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur?.("loanTerm")}
                className={getFieldError('loanTerm') ? 'error' : ''}
                min="1"
                max="60"
              />
              <span className="input-suffix">months</span>
            </div>
      
            {getFieldError('loanTerm') && (
              <div className="error-message">{getFieldError('loanTerm')}</div>
            )}
          </div>

          <div className="form-group">
            <label className={formData.repaymentFrequency ? "filled" : ""}>
              Repayment Frequency <span className="required">*</span>
            </label>
            <select
              name="repaymentFrequency"
              value={formData.repaymentFrequency || ""}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur?.("repaymentFrequency")}
              className={getFieldError('repaymentFrequency') ? 'error' : ''}
              disabled={!formData.employmentStatus}
            >
              <option value="">Select repayment frequency</option>
              {formData.employmentStatus === "self-employed" && (
                <option value="Weekly">Weekly</option>
              )}
              {formData.employmentStatus === "salary-worker" && (
                <option value="Monthly">Monthly</option>
              )}
            </select>
            {!formData.employmentStatus && (
              <div className="helper-text">Employment status will determine repayment frequency</div>
            )}
            {getFieldError('repaymentFrequency') && (
              <div className="error-message">{getFieldError('repaymentFrequency')}</div>
            )}
          </div>

          <div className="form-group">
            <label>Interest Rate</label>
            <input
              name="ratePerAnnum"
              type="text"
              value={formData.ratePerAnnum ? `${formData.ratePerAnnum}%` : "0%"}
              readOnly
              className="readonly-field"
            />
            <div className="helper-text">
              {formData.employmentStatus === "self-employed" 
                ? "Self-employed: 80% per annum" 
                : formData.employmentStatus === "salary-worker"
                ? "Salary worker: 72% per annum"
                : "Rate determined by employment status"}
            </div>
          </div>

          <input
            name="employmentStatus"
            value={formData.employmentStatus || ""}
            readOnly
            hidden
          />
        </div>
      </div>

      {/* Loan Summary Dashboard */}
      <div className="loan-summary-dashboard">
        <div className="summary-header">
          <h4>Loan Summary</h4>
          <span className="summary-badge">Calculated Automatically</span>
        </div>

        <div className="summary-stats-grid">
          {/* Interest Card */}
          <div className="summary-card interest-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Interest</span>
              <span className="card-value">GHS {loanSummary.interest.toFixed(2)}</span>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="summary-card total-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Repayment</span>
              <span className="card-value">GHS {loanSummary.totalInterest.toFixed(2)}</span>
            </div>
          </div>

          {/* Monthly/Weekly Payment Card */}
          <div className="summary-card payment-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">
                {formData.repaymentFrequency === "Weekly" ? "Weekly Payment" : "Monthly Payment"}
              </span>
              <span className="card-value">GHS {loanSummary.monthlyPayment.toFixed(2)}</span>
            </div>
          </div>

          {/* Number of Payments Card */}
          <div className="summary-card payments-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Number of Payments</span>
              <span className="card-value">{loanSummary.numberOfPayments}</span>
            </div>
          </div>
        </div>

        {/* Loan Fees Section */}
        <div className="loan-fees-section">
          <div className="fees-info">
            <div className="fees-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="fees-content">
              <span className="fees-label">Processing Fees</span>
              <span className="fees-percentage">
                {formData.employmentStatus === "self-employed" ? "7%" : "5%"} of loan amount
              </span>
            </div>
            <div className="fees-amount">
              <span className="fees-value">GHS {loanSummary.loanFees.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Loan Details Breakdown */}
        <div className="loan-breakdown">
          <button className="breakdown-toggle" onClick={() => {
            const details = document.querySelector('.breakdown-details');
            if (details) details.classList.toggle('show');
          }}>
            <span>View Payment Breakdown</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          
          <div className="breakdown-details">
            <div className="breakdown-item">
              <span>Principal Amount:</span>
              <strong>GHS {parseFloat(formData.loanAmount || 0).toFixed(2)}</strong>
            </div>
            <div className="breakdown-item">
              <span>Total Interest:</span>
              <strong>GHS {loanSummary.interest.toFixed(2)}</strong>
            </div>
            <div className="breakdown-item">
              <span>Processing Fees:</span>
              <strong>GHS {loanSummary.loanFees.toFixed(2)}</strong>
            </div>
            <div className="breakdown-item total">
              <span>Total Amount to Repay:</span>
              <strong>GHS {loanSummary.totalInterest.toFixed(2)}</strong>
            </div>
            <div className="breakdown-note">
              <small>* Fees are deducted upfront from the loan amount</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;