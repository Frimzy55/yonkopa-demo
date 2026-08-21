import React from "react";

const Step3Loan = ({
  formData,
  onChange,
  onFileChange,
  isMobile,
  inputStyle,
  selectStyle,
  focusStyle,
  blurStyle,
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
        Loan Details
      </h3>

      {/* --- Existing Loan Details Fields --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Loan Amount *
          </label>
          <input
            type="text"
            name="loanAmount"
            value={formData.loanAmount || ""}
            onChange={onChange}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Loan Purpose *
          </label>
          <input
            type="text"
            name="loanPurpose"
            value={formData.loanPurpose || ""}
            onChange={onChange}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Loan Term (months) *
          </label>
          <input
            type="number"
            name="loanTerm"
            value={formData.loanTerm || ""}
            onChange={onChange}
            required
            min="1"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Weekly Installment *
          </label>
          <input
            type="text"
            name="weeklyInstallment"
            value={formData.weeklyInstallment || ""}
            onChange={onChange}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Repayment Amount *
          </label>
          <input
            type="text"
            name="repaymentAmount"
            value={formData.repaymentAmount || ""}
            onChange={onChange}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Previous Loan Request
          </label>
          <input
            type="text"
            name="previousLoanRequest"
            value={formData.previousLoanRequest || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Previous Loan Approved
          </label>
          <input
            type="text"
            name="previousLoanApproved"
            value={formData.previousLoanApproved || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Expected Due Date *
          </label>
          <input
            type="date"
            name="expectedDueDate"
            value={formData.expectedDueDate || ""}
            onChange={onChange}
            required
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Actual Due Date
          </label>
          <input
            type="date"
            name="actualDueDate"
            value={formData.actualDueDate || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Repayment Frequency *
          </label>
          <input
            type="text"
            name="repaymentFrequency"
            value={formData.repaymentFrequency || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Loan Balance *
          </label>
          <input
            type="text"
            name="existingLoanBalance"
            value={formData.existingLoanBalance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Why does the client need the loan now? *
          </label>
          <input
            type="text"
            name="loanNeedReason"
            value={formData.loanNeedReason || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What will happen if the requested amount is not approved? *
          </label>
          <input
            type="text"
            name="whatIfNotApproved"
            value={formData.whatIfNotApproved || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Amount client believes they can comfortably repay per week/month *
          </label>
          <input
            type="text"
            name="comfortableRepayment"
            value={formData.comfortableRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Debt Repayment *
          </label>
          <input
            type="text"
            name="existingDebtRepayment"
            value={formData.existingDebtRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- COLLATERAL / SECURITY --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Collateral / Security
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Security Type
          </label>
          <select
            name="securityType"
            value={formData.securityType || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="realEstate">Real Estate</option>
            <option value="vehicle">Vehicle</option>
            <option value="equipment">Equipment</option>
            <option value="guarantor">Guarantor</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Description
          </label>
          <input
            type="text"
            name="securityDescription"
            value={formData.securityDescription || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Owner
          </label>
          <input
            type="text"
            name="securityOwner"
            value={formData.securityOwner || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Purchase Date
          </label>
          <input
            type="date"
            name="securityPurchaseDate"
            value={formData.securityPurchaseDate || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Estimated Market Value
          </label>
          <input
            type="text"
            name="securityMarketValue"
            value={formData.securityMarketValue || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Forced Sale Value
          </label>
          <input
            type="text"
            name="securityForcedSaleValue"
            value={formData.securityForcedSaleValue || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Serial / Chassis
          </label>
          <input
            type="text"
            name="securitySerial"
            value={formData.securitySerial || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Registration Number
          </label>
          <input
            type="text"
            name="securityRegistration"
            value={formData.securityRegistration || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Asset Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileChange && onFileChange(e.target.files[0], "collateralPhotos")}
            style={{ display: "block", marginTop: "4px" }}
          />
          <small style={{ color: "#94a3b8", fontSize: "12px" }}>Upload photo(s) of collateral</small>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Ownership Documentation
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.png,.docx"
            onChange={(e) => onFileChange && onFileChange(e.target.files[0], "ownershipDocument")}
            style={{ display: "block", marginTop: "4px" }}
          />
          <small style={{ color: "#94a3b8", fontSize: "12px" }}>PDF, JPG, PNG, DOCX</small>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Verification Status
          </label>
          <select
            name="securityVerificationStatus"
            value={formData.securityVerificationStatus || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Existing Encumbrances
          </label>
          <input
            type="text"
            name="securityEncumbrances"
            value={formData.securityEncumbrances || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- LOAN OFFICER ASSESSMENT --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Loan Officer Assessment
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Previous Repayment Behaviour
          </label>
          <input
            type="text"
            name="prevRepaymentBehaviour"
            value={formData.prevRepaymentBehaviour || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Total Amount Borrowed
          </label>
          <input
            type="text"
            name="totalBorrowed"
            value={formData.totalBorrowed || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Loan Cycle Completed
          </label>
          <input
            type="number"
            name="loanCycleCompleted"
            value={formData.loanCycleCompleted || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        {/* REMOVED: Number of Late Payments */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Maximum Past Due Date
          </label>
          <input
            type="number"
            name="maxPastDueDays"
            value={formData.maxPastDueDays || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Missed Instalments
          </label>
          <input
            type="number"
            name="missedInstalments"
            value={formData.missedInstalments || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Total Arrears
          </label>
          <input
            type="text"
            name="totalArrears"
            value={formData.totalArrears || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Write‑off Loans
          </label>
          <input
            type="number"
            name="writeOffLoans"
            value={formData.writeOffLoans || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Extensions
          </label>
          <input
            type="number"
            name="extensions"
            value={formData.extensions || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Number of Pay‑off
          </label>
          <input
            type="number"
            name="numberOfPayOff"
            value={formData.numberOfPayOff || ""}
            onChange={onChange}
            min="0"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Current Outstanding Balance
          </label>
          <input
            type="text"
            name="currentOutstandingBalance"
            value={formData.currentOutstandingBalance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Average Repayment Performance
          </label>
          <input
            type="text"
            name="avgRepaymentPerformance"
            value={formData.avgRepaymentPerformance || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- BUSINESS --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Business
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Did you physically visit the business?
          </label>
          <select
            name="visitBusiness"
            value={formData.visitBusiness || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Is business currently operating?
          </label>
          <select
            name="businessOperating"
            value={formData.businessOperating || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Did you observe active correspondence with reported sales?
          </label>
          <select
            name="observedSalesCorrespondence"
            value={formData.observedSalesCorrespondence || ""}
            onChange={onChange}
            style={selectStyle}
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Estimated Daily Customer Volume
          </label>
          <input
            type="text"
            name="dailyCustomerVolume"
            value={formData.dailyCustomerVolume || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Key Risk Observed
          </label>
          <input
            type="text"
            name="keyRiskObserved"
            value={formData.keyRiskObserved || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- CHARACTER --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Character
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            How long have you known the client?
          </label>
          <input
            type="text"
            name="knownClientSince"
            value={formData.knownClientSince || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Any adverse information?
          </label>
          <input
            type="text"
            name="adverseInfo"
            value={formData.adverseInfo || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Any previous repayment concerns?
          </label>
          <input
            type="text"
            name="repaymentConcerns"
            value={formData.repaymentConcerns || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- CAPACITY --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Capacity
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What is the officer's verified estimated monthly income?
          </label>
          <input
            type="text"
            name="verifiedMonthlyIncome"
            value={formData.verifiedMonthlyIncome || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            What repayment amount can the client reasonably pay?
          </label>
          <input
            type="text"
            name="reasonableRepayment"
            value={formData.reasonableRepayment || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* --- RECOMMENDATION --- */}
      <h4
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#334155",
          marginTop: "24px",
          marginBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "6px",
        }}
      >
        Recommendation
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Amount Recommended
          </label>
          <input
            type="text"
            name="recommendedAmount"
            value={formData.recommendedAmount || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Term (months)
          </label>
          <input
            type="number"
            name="recommendedTerm"
            value={formData.recommendedTerm || ""}
            onChange={onChange}
            min="1"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
            Reason for Recommendation
          </label>
          <input
            type="text"
            name="recommendationReason"
            value={formData.recommendationReason || ""}
            onChange={onChange}
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px" }}>
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

export default Step3Loan;