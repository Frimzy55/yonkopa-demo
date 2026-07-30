// src/pages/CustomerDashboard/CustomerTermFrequency.jsx
import React from "react";

const TermFrequency = ({ formData, handleInputChange }) => {
  // Helper to update nested fields using a flat naming convention
  const updateNestedField = (baseKey, subKey, value) => {
    const flatName = `${baseKey}_${subKey}`;
    handleInputChange({ target: { name: flatName, value } });
  };

  // ----- Loan Fee management -----
  const handleFeeChange = (index, field, value) => {
    const currentFees = formData.loanFees || [];
    const updatedFees = currentFees.map((fee, i) =>
      i === index ? { ...fee, [field]: value } : fee
    );
    handleInputChange({ target: { name: "loanFees", value: updatedFees } });
  };

  const addFeeRow = () => {
    const currentFees = formData.loanFees || [];
    const newFee = { feeName: "", feeType: "", feeTrend: "", paymentMode: "" };
    handleInputChange({
      target: { name: "loanFees", value: [...currentFees, newFee] },
    });
  };

  const removeFeeRow = (index) => {
    const currentFees = formData.loanFees || [];
    const updatedFees = currentFees.filter((_, i) => i !== index);
    handleInputChange({ target: { name: "loanFees", value: updatedFees } });
  };

  return (
    <div className="form-step">
      <h3 className="mb-4">Term and Frequency</h3>

      {/* ========== MAIN LOAN PARAMETERS ========== */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Loan Details</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <label>Amount Requested (GHS)</label>
                <input
                  type="number"
                  name="amountRequested"
                  value={formData.amountRequested || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter loan amount"
                  step="0.01"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  step="0.01"
                  placeholder="e.g 25"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Loan Term</label>
                <input
                  type="number"
                  name="loanTerm"
                  value={formData.loanTerm || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter loan term"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Duration (Months)</label>
                <input
                  type="number"
                  name="durationMonths"
                  value={formData.durationMonths || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Number of months"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Payment Schedule Computation</label>
                <select
                  name="paymentScheduleComputation"
                  value={formData.paymentScheduleComputation || ""}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Computation</option>
                  <option value="Equal Installment">Equal Installment</option>
                  <option value="Declining Balance">Declining Balance</option>
                  <option value="Custom Schedule">Custom Schedule</option>
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label>Repayment Cycle</label>
                <select
                  name="repaymentCycle"
                  value={formData.repaymentCycle || ""}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Cycle</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Loan Purpose</label>
                <input
                  type="text"
                  name="loanPurpose"
                  value={formData.loanPurpose || ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g Business expansion"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Apply Tranche Loan Disbursement</label>
                <select
                  name="applyTrancheDisbursement"
                  value={formData.applyTrancheDisbursement || ""}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CHARGE LOAN FEE ========== */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Charge Loan Fee</h5>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Enable Loan Fee</label>
            <select
              name="chargeLoanFee"
              value={formData.chargeLoanFee || ""}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formData.chargeLoanFee === "Yes" && (
            <div className="mt-3">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th>Fee Name</th>
                      <th>Fee Type</th>
                      <th>Fee Trend</th>
                      <th>Payment Mode</th>
                      <th style={{ width: "100px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.loanFees || []).map((fee, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={fee.feeName || ""}
                            onChange={(e) =>
                              handleFeeChange(index, "feeName", e.target.value)
                            }
                            placeholder="e.g Processing Fee"
                          />
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={fee.feeType || ""}
                            onChange={(e) =>
                              handleFeeChange(index, "feeType", e.target.value)
                            }
                          >
                            <option value="">Select</option>
                            <option value="Percentage">Percentage</option>
                            <option value="Fixed">Fixed</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={fee.feeTrend || ""}
                            onChange={(e) =>
                              handleFeeChange(index, "feeTrend", e.target.value)
                            }
                          >
                            <option value="">Select</option>
                            <option value="Upfront">Upfront</option>
                            <option value="Monthly">Monthly</option>
                            <option value="At Maturity">At Maturity</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={fee.paymentMode || ""}
                            onChange={(e) =>
                              handleFeeChange(index, "paymentMode", e.target.value)
                            }
                          >
                            <option value="">Select</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Mobile Money">Mobile Money</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeFeeRow(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!formData.loanFees || formData.loanFees.length === 0) && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          No fees added. Click the button below to add.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={addFeeRow}
              >
                + Add Fee
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== CHARGE PENALTY ON OVERDUE LOAN ========== */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Penalty on Overdue Loan</h5>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Enable Penalty</label>
            <select
              name="chargePenaltyOverdue"
              value={formData.chargePenaltyOverdue || ""}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formData.chargePenaltyOverdue === "Yes" && (
            <div className="mt-3 p-3 border rounded">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Interest Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData.penaltyInterestRate || ""}
                      onChange={(e) =>
                        updateNestedField("penalty", "interestRate", e.target.value)
                      }
                      placeholder="e.g 5"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Compute Interest On</label>
                    <select
                      className="form-control"
                      value={formData.penaltyComputeInterestOn || ""}
                      onChange={(e) =>
                        updateNestedField("penalty", "computeInterestOn", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Principal Overdue">Principal Overdue</option>
                      <option value="Principal and Overdue">Principal and Overdue</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Moratorium</label>
                    <select
                      className="form-control"
                      value={formData.penaltyMoratorium || ""}
                      onChange={(e) =>
                        updateNestedField("penalty", "moratorium", e.target.value)
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
              <div className="form-group">
                <label>Days</label>
                <input
                  type="number"
                  name="days"
                  value={formData.days|| ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter Days"
                  step="0.01"
                />
              </div>
            </div>
              </div>
              {formData.penaltyMoratorium === "Yes" && (
                <div className="row mt-2">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Moratorium Amount (GHS)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        value={formData.penaltyMoratoriumAmount || ""}
                        onChange={(e) =>
                          updateNestedField("penalty", "moratoriumAmount", e.target.value)
                        }
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========== CHARGE ON EXPIRED LOAN ========== */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Charge on Expired Loan</h5>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Enable Expired Loan Charge</label>
            <select
              name="chargeExpiredLoan"
              value={formData.chargeExpiredLoan || ""}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formData.chargeExpiredLoan === "Yes" && (
            <div className="mt-3 p-3 border rounded">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Interest Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      value={formData.expiredInterestRate || ""}
                      onChange={(e) =>
                        updateNestedField("expired", "interestRate", e.target.value)
                      }
                      placeholder="e.g 5"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Compute Interest On</label>
                    <select
                      className="form-control"
                      value={formData.expiredComputeInterestOn || ""}
                      onChange={(e) =>
                        updateNestedField("expired", "computeInterestOn", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Original Loan Amount">Original Loan Amount</option>
                      <option value="Outstanding Principal">Outstanding Principal</option>
                      <option value="Outstanding Loan Balance">Outstanding Loan Balance</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Moratorium</label>
                    <select
                      className="form-control"
                      value={formData.expiredMoratorium || ""}
                      onChange={(e) =>
                        updateNestedField("expired", "moratorium", e.target.value)
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
              <div className="form-group">
                <label>Days</label>
                <input
                  type="number"
                  name="days"
                  value={formData.days|| ""}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter Days"
                  step="0.01"
                />
              </div>
            </div>
              </div>
              {formData.expiredMoratorium === "Yes" && (
                <div className="row mt-2">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Moratorium Amount (GHS)</label>
                      <input
                        type="number"
                        className="form-control"
                        step="0.01"
                        value={formData.expiredMoratoriumAmount || ""}
                        onChange={(e) =>
                          updateNestedField("expired", "moratoriumAmount", e.target.value)
                        }
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermFrequency;