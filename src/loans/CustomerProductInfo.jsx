import React from "react";

const ProductInfo = ({ formData, handleInputChange }) => {
  const interestMethods = [
    "Flat",
    "Reducing Balance",
    "Compounding",
    "PMT Reducing Balance",
    "Custom",
  ];

  return (
    <div className="form-step">
      <h3 className="mb-3">Product Information</h3>

      <div className="form-grid">

        {/* Loan Type */}
        <div className="form-group">
          <label>Loan Type</label>
          <select
            name="loanType"
            value={formData.loanType || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Loan Type</option>
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
            <option value="Business">Business</option>
          </select>
        </div>


        {/* Loan Product */}
        <div className="form-group">
          <label>Loan Product</label>
          <select
            name="loanProduct"
            value={formData.loanProduct || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Loan Product</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Business Loan">Business Loan</option>
            <option value="Agriculture Loan">Agriculture Loan</option>
            <option value="Salary Loan">Salary Loan</option>
            <option value="SME Loan">SME Loan</option>
          </select>
        </div>


        {/* Credit Officer */}
        <div className="form-group">
          <label>Credit Officer</label>
          <select
            name="creditOfficer"
            value={formData.creditOfficer || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Credit Officer</option>
            <option value="Officer 1">Officer 1</option>
            <option value="Officer 2">Officer 2</option>
            <option value="Officer 3">Officer 3</option>
          </select>
        </div>


        {/* Sectorial Breakdown */}
        <div className="form-group">
          <label>Sectorial Breakdown</label>
          <select
            name="sectorialBreakdown"
            value={formData.sectorialBreakdown || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Sector</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Trading">Trading</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
            <option value="Transport">Transport</option>
          </select>
        </div>


        {/* Sub Sector */}
        <div className="form-group">
          <label>Sub Sector</label>
          <select
            name="subSector"
            value={formData.subSector || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Sub Sector</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Farming">Farming</option>
            <option value="Construction">Construction</option>
            <option value="Education">Education</option>
          </select>
        </div>


        {/* Apply Moratorium */}
        <div className="form-group">
          <label>Apply Moratorium</label>
          <select
            name="applyMoratorium"
            value={formData.applyMoratorium || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>


        {/* Moratorium Days */}
        <div className="form-group">
          <label>Moratorium Days</label>
          <input
            type="number"
            name="moratoriumDays"
            value={formData.moratoriumDays || ""}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Enter number of days"
            min="0"
          />
        </div>


        {/* Charge Interest During Moratorium */}
        <div className="form-group">
          <label>Charge Interest on Moratorium Days</label>
          <select
            name="chargeInterestOnMoratorium"
            value={formData.chargeInterestOnMoratorium || ""}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

      </div>


      {/* Interest Calculation Method */}
      <div className="mt-4">
        <h4 className="mb-3">
          Interest Calculation Method
        </h4>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {interestMethods.map((method) => (
            <label
              key={method}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <input
                type="radio"
                name="interestCalculationMethod"
                value={method}
                checked={
                  formData.interestCalculationMethod === method
                }
                onChange={handleInputChange}
              />

              {method}
            </label>
          ))}
        </div>
      </div>



      {/* Loan Settlement & Preferred Disbursement */}
      <div className="mt-5">

        <h4 className="mb-3">
          Loan Settlement & Preferred Disbursement
        </h4>


        <div className="form-grid">

          {/* Loan Settlement Account */}
          <div className="form-group">
            <label>Loan Settlement Account</label>
            <select
              name="loanSettlementAccount"
              value={formData.loanSettlementAccount || ""}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">
                Select Settlement Account
              </option>

              <option value="Savings Account">
                Savings Account
              </option>

              <option value="Current Account">
                Current Account
              </option>

              <option value="Wallet Account">
                Wallet Account
              </option>

            </select>
          </div>



          {/* Preferred Disbursement Mode */}
          <div className="form-group">
            <label>Preferred Disbursement Mode</label>

            <select
              name="preferredDisbursementMode"
              value={formData.preferredDisbursementMode || ""}
              onChange={handleInputChange}
              className="form-control"
            >

              <option value="">
                Select Disbursement Mode
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Mobile Money">
                Mobile Money
              </option>

              <option value="Cheque">
                Cheque
              </option>

            </select>
          </div>




          {/* Preferred Repayment Mode */}
          <div className="form-group">
            <label>Preferred Repayment Mode</label>

            <select
              name="preferredRepaymentMode"
              value={formData.preferredRepaymentMode || ""}
              onChange={handleInputChange}
              className="form-control"
            >

              <option value="">
                Select Repayment Mode
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Standing Order">
                Standing Order
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Mobile Money">
                Mobile Money
              </option>

              <option value="Cheque">
                Cheque
              </option>

              <option value="Direct Debit">
                Direct Debit
              </option>

            </select>
          </div>


        </div>

      </div>

    </div>
  );
};


export default ProductInfo;