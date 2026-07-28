// src/components/LoanProductForm.js
import React, { useState } from 'react';

const LoanProductForm = ({
  formData,
  handleChange,
  handleSubmit,
  onCancel,
  isEditing,
  loading,
  fees = [],
  feesLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const steps = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Interest' },
    { id: 3, label: 'Term and Frequency' },
    { id: 4, label: 'Fees' },
    { id: 5, label: 'Loan Penalty Configuration' },
  ];

  // ---------- Navigation with preventDefault ----------
  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isSelected = (feeId) => (formData.selectedFees || []).includes(feeId);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Product Name */}
            <div className="col-md-6">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Type of Loan */}
            <div className="col-md-6">
              <label className="form-label">Type of Loan</label>
              <select
                className="form-select"
                name="loanType"
                value={formData.loanType || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Consumer">Consumer</option>
                <option value="Mortgage">Mortgage</option>
                <option value="Auto">Auto</option>
                <option value="Business">Business</option>
              </select>
            </div>

            {/* Assign to Loan Types */}
            <div className="col-md-6">
              <label className="form-label">Assign to Loan Types</label>
              <select
                className="form-select"
                name="assignToLoanTypes"
                value={formData.assignToLoanTypes || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Personal">Personal</option>
                <option value="Commercial">Commercial</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* Credit Report Category */}
            <div className="col-md-6">
              <label className="form-label">Credit Report Category</label>
              <select
                className="form-select"
                name="creditReportCategory"
                value={formData.creditReportCategory || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Prime">Prime</option>
                <option value="Near Prime">Near Prime</option>
                <option value="Sub Prime">Sub Prime</option>
              </select>
            </div>

            {/* Loan Range Required – Yes/No */}
            <div className="col-md-4">
              <label className="form-label">Loan Range Required</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="loanRangeRequired"
                    value="true"
                    checked={formData.loanRangeRequired === true}
                    onChange={handleChange}
                    id="loanRangeYes"
                  />
                  <label className="form-check-label" htmlFor="loanRangeYes">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="loanRangeRequired"
                    value="false"
                    checked={formData.loanRangeRequired === false}
                    onChange={handleChange}
                    id="loanRangeNo"
                  />
                  <label className="form-check-label" htmlFor="loanRangeNo">No</label>
                </div>
              </div>
            </div>

            {/* Min Amount */}
            <div className="col-md-4">
              <label className="form-label">Min Amount (GHS)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="minAmount"
                value={formData.minAmount || ''}
                onChange={handleChange}
                placeholder="e.g., 1000"
                disabled={!formData.loanRangeRequired}
              />
            </div>

            {/* Max Amount */}
            <div className="col-md-4">
              <label className="form-label">Max Amount (GHS)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="maxAmount"
                value={formData.maxAmount || ''}
                onChange={handleChange}
                placeholder="e.g., 50000"
                disabled={!formData.loanRangeRequired}
              />
            </div>

            {/* Allow Multiple Accounts – Yes/No */}
            <div className="col-md-4">
              <label className="form-label">Allow Multiple Accounts</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowMultipleAccounts"
                    value="true"
                    checked={formData.allowMultipleAccounts === true}
                    onChange={handleChange}
                    id="multiYes"
                  />
                  <label className="form-check-label" htmlFor="multiYes">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="allowMultipleAccounts"
                    value="false"
                    checked={formData.allowMultipleAccounts === false}
                    onChange={handleChange}
                    id="multiNo"
                  />
                  <label className="form-check-label" htmlFor="multiNo">No</label>
                </div>
              </div>
            </div>

            {/* Savings Before Eligibility Required – Yes/No */}
            <div className="col-md-4">
              <label className="form-label">Savings Before Eligibility Required</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="savingsBeforeEligibility"
                    value="true"
                    checked={formData.savingsBeforeEligibility === true}
                    onChange={handleChange}
                    id="savingsYes"
                  />
                  <label className="form-check-label" htmlFor="savingsYes">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="savingsBeforeEligibility"
                    value="false"
                    checked={formData.savingsBeforeEligibility === false}
                    onChange={handleChange}
                    id="savingsNo"
                  />
                  <label className="form-check-label" htmlFor="savingsNo">No</label>
                </div>
              </div>
            </div>

            {/* Loan Eligibility Amount Required – Yes/No */}
            <div className="col-md-4">
              <label className="form-label">Loan Eligibility Amount Required</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="loanEligibilityAmountRequired"
                    value="true"
                    checked={formData.loanEligibilityAmountRequired === true}
                    onChange={handleChange}
                    id="eligYes"
                  />
                  <label className="form-check-label" htmlFor="eligYes">Yes</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="loanEligibilityAmountRequired"
                    value="false"
                    checked={formData.loanEligibilityAmountRequired === false}
                    onChange={handleChange}
                    id="eligNo"
                  />
                  <label className="form-check-label" htmlFor="eligNo">No</label>
                </div>
              </div>
            </div>

            {/* Allowable Disposable Income */}
            <div className="col-md-4">
              <label className="form-label">Allowable Disposable Income (%)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                name="allowableDisposableIncome"
                value={formData.allowableDisposableIncome || ''}
                onChange={handleChange}
                placeholder="e.g., 30"
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            {/* Interest Rate Type */}
            <div className="col-md-6">
              <label className="form-label">Interest Rate Type</label>
              <select
                className="form-select"
                name="interestType"
                value={formData.interestType}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Flat">Flat</option>
                <option value="Reducing">Reducing</option>
              </select>
            </div>

            {/* Interest Rate Per Annum Section */}
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold text-secondary mb-3">
                  <i className="bi bi-percent me-2"></i>
                  Interest Rate Per Annum
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Minimum Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="minRate"
                      value={formData.minRate || ''}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Default Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="defaultRate"
                      value={formData.defaultRate || ''}
                      onChange={handleChange}
                      placeholder="e.g., 12.5"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Maximum Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="maxRate"
                      value={formData.maxRate || ''}
                      onChange={handleChange}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Allow Moratorium</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="allowMoratorium"
                          value="true"
                          checked={formData.allowMoratorium === true}
                          onChange={handleChange}
                          id="moratoriumYes"
                        />
                        <label className="form-check-label" htmlFor="moratoriumYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="allowMoratorium"
                          value="false"
                          checked={formData.allowMoratorium === false}
                          onChange={handleChange}
                          id="moratoriumNo"
                        />
                        <label className="form-check-label" htmlFor="moratoriumNo">No</label>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Number of Days</label>
                    <input
                      type="number"
                      className="form-control"
                      name="moratoriumDays"
                      value={formData.moratoriumDays || ''}
                      onChange={handleChange}
                      placeholder="e.g., 30"
                      disabled={!formData.allowMoratorium}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Include Moratorium Period as part</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="includeMoratoriumPeriod"
                          value="true"
                          checked={formData.includeMoratoriumPeriod === true}
                          onChange={handleChange}
                          id="includeMoratoriumYes"
                        />
                        <label className="form-check-label" htmlFor="includeMoratoriumYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="includeMoratoriumPeriod"
                          value="false"
                          checked={formData.includeMoratoriumPeriod === false}
                          onChange={handleChange}
                          id="includeMoratoriumNo"
                        />
                        <label className="form-check-label" htmlFor="includeMoratoriumNo">No</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="col-12">
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold text-secondary mb-3">
                  <i className="bi bi-calendar-event me-2"></i>
                  Term and Conditions
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Loan Term (Defaults)</label>
                    <select
                      className="form-select"
                      name="loanTermDefault"
                      value={formData.loanTermDefault || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Duration (months)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="durationMonths"
                      value={formData.durationMonths || ''}
                      onChange={handleChange}
                      placeholder="e.g., 12"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Loan Repayment Cycle (default)</label>
                    <select
                      className="form-select"
                      name="repaymentCycleDefault"
                      value={formData.repaymentCycleDefault || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Repayment Schedule Computation (default)</label>
                    <select
                      className="form-select"
                      name="scheduleComputationDefault"
                      value={formData.scheduleComputationDefault || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Equal Principal">Equal Principal</option>
                      <option value="Equal Installment">Equal Installment</option>
                      <option value="Interest Only">Interest Only</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Apply Trunch Loan Disbursement</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="applyTrunchDisbursement"
                          value="true"
                          checked={formData.applyTrunchDisbursement === true}
                          onChange={handleChange}
                          id="trunchYes"
                        />
                        <label className="form-check-label" htmlFor="trunchYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="applyTrunchDisbursement"
                          value="false"
                          checked={formData.applyTrunchDisbursement === false}
                          onChange={handleChange}
                          id="trunchNo"
                        />
                        <label className="form-check-label" htmlFor="trunchNo">No</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 4: {
        const allFees = fees && fees.length ? fees : [];

        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentFees = allFees.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(allFees.length / rowsPerPage);

        const toggleFee = (feeId) => {
          const currentSelected = formData.selectedFees || [];
          let newSelected;
          if (currentSelected.includes(feeId)) {
            newSelected = currentSelected.filter(id => id !== feeId);
          } else {
            newSelected = [...currentSelected, feeId];
          }
          handleChange({
            target: {
              name: 'selectedFees',
              value: newSelected,
            },
          });
        };

        const toggleAll = () => {
          const allIds = currentFees.map(f => f.id);
          const allSelected = allIds.every(id => isSelected(id));
          let newSelected;
          if (allSelected) {
            newSelected = (formData.selectedFees || []).filter(id => !allIds.includes(id));
          } else {
            newSelected = [...new Set([...(formData.selectedFees || []), ...allIds])];
          }
          handleChange({
            target: {
              name: 'selectedFees',
              value: newSelected,
            },
          });
        };

        return (
          <div className="col-12">
            <div className="p-3 bg-light rounded-3 border">
              <h6 className="fw-bold text-secondary mb-3">
                <i className="bi bi-cash-stack me-2"></i>
                Fees Configuration
              </h6>

              {feesLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading fees...</span>
                  </div>
                </div>
              ) : allFees.length === 0 ? (
                <div className="alert alert-warning">No active fees found. Please add fees first.</div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <label className="form-label mb-0">Show</label>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: '80px' }}
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                      </select>
                      <span className="text-muted small">entries</span>
                    </div>
                    <div>
                      <span className="text-muted small">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, allFees.length)} of {allFees.length} fees
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={currentFees.every(f => isSelected(f.id))}
                              onChange={toggleAll}
                            />
                          </th>
                          <th>Fee Name</th>
                          <th>Fee Type</th>
                          <th>Fee Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFees.map((fee) => (
                          <tr key={fee.id}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected(fee.id)}
                                onChange={() => toggleFee(fee.id)}
                              />
                            </td>
                            <td>{fee.fee_name || fee.name}</td>
                            <td>{fee.fee_type || '—'}</td>
                            <td>{fee.fee_trend || '—'}</td>
                          </tr>
                        ))}
                        {currentFees.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">No fees available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small">
                        Page {currentPage} of {totalPages}
                      </div>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                            Previous
                          </button>
                        </li>
                        {[...Array(totalPages).keys()].map((page) => (
                          <li key={page} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(page + 1)}>
                              {page + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                            Next
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="col-12">
            <div className="p-3 bg-light rounded-3 border">
              <h6 className="fw-bold text-secondary mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Loan Penalty Configuration
              </h6>

              {/* ---- Overdue Penalty ---- */}
              <div className="mb-4">
                <h6 className="fw-semibold text-primary mb-2">Charge Penalty on Overdue Loan</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary">Charge Penalty on Overdue Loan</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="chargePenaltyOverdue"
                          value="true"
                          checked={formData.chargePenaltyOverdue === true}
                          onChange={handleChange}
                          id="overdueYes"
                        />
                        <label className="form-check-label" htmlFor="overdueYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="chargePenaltyOverdue"
                          value="false"
                          checked={formData.chargePenaltyOverdue === false}
                          onChange={handleChange}
                          id="overdueNo"
                        />
                        <label className="form-check-label" htmlFor="overdueNo">No</label>
                      </div>
                    </div>
                  </div>

                  {formData.chargePenaltyOverdue === true && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Overdue Penalty Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="overduePenaltyRate"
                          value={formData.overduePenaltyRate || ''}
                          onChange={handleChange}
                          placeholder="e.g., 5"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Compute Interest On (Overdue)</label>
                        <select
                          className="form-select"
                          name="overduePenaltyComputeOn"
                          value={formData.overduePenaltyComputeOn || ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="Principal Overdue">Principal Overdue</option>
                          <option value="Principal and Interest Overdue">Principal and Interest Overdue</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Moratorium (Overdue)</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="overduePenaltyMoratorium"
                              value="true"
                              checked={formData.overduePenaltyMoratorium === true}
                              onChange={handleChange}
                              id="overdueMoratoriumYes"
                            />
                            <label className="form-check-label" htmlFor="overdueMoratoriumYes">Yes</label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="overduePenaltyMoratorium"
                              value="false"
                              checked={formData.overduePenaltyMoratorium === false}
                              onChange={handleChange}
                              id="overdueMoratoriumNo"
                            />
                            <label className="form-check-label" htmlFor="overdueMoratoriumNo">No</label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <hr className="my-3" />

              {/* ---- Expired Penalty ---- */}
              <div>
                <h6 className="fw-semibold text-primary mb-2">Charge Penalty on Expired Loan</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary">Charge Penalty on Expired Loan</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="chargePenaltyExpired"
                          value="true"
                          checked={formData.chargePenaltyExpired === true}
                          onChange={handleChange}
                          id="expiredYes"
                        />
                        <label className="form-check-label" htmlFor="expiredYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="chargePenaltyExpired"
                          value="false"
                          checked={formData.chargePenaltyExpired === false}
                          onChange={handleChange}
                          id="expiredNo"
                        />
                        <label className="form-check-label" htmlFor="expiredNo">No</label>
                      </div>
                    </div>
                  </div>

                  {formData.chargePenaltyExpired === true && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Expired Penalty Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          name="expiredPenaltyRate"
                          value={formData.expiredPenaltyRate || ''}
                          onChange={handleChange}
                          placeholder="e.g., 5"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Compute Interest On (Expired)</label>
                        <select
                          className="form-select"
                          name="expiredPenaltyComputeOn"
                          value={formData.expiredPenaltyComputeOn || ''}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="Original Loan Amount">Original Loan Amount</option>
                          <option value="Outstanding Principal">Outstanding Principal</option>
                          <option value="Outstanding Loan Balance">Outstanding Loan Balance</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Moratorium (Expired)</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="expiredPenaltyMoratorium"
                              value="true"
                              checked={formData.expiredPenaltyMoratorium === true}
                              onChange={handleChange}
                              id="expiredMoratoriumYes"
                            />
                            <label className="form-check-label" htmlFor="expiredMoratoriumYes">Yes</label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="expiredPenaltyMoratorium"
                              value="false"
                              checked={formData.expiredPenaltyMoratorium === false}
                              onChange={handleChange}
                              id="expiredMoratoriumNo"
                            />
                            <label className="form-check-label" htmlFor="expiredMoratoriumNo">No</label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            {isEditing ? 'Edit Loan Product' : 'Add New Loan Product'}
          </h6>
          <span className="badge bg-secondary">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="mt-2 d-flex gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-grow-1 text-center small py-1 rounded ${
                currentStep === step.id
                  ? 'bg-primary text-white'
                  : currentStep > step.id
                  ? 'bg-success text-white'
                  : 'bg-light text-muted'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <div className="card-body">
        {/* 🔥 FIX: Prevent Enter key from submitting on steps 1-4 */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep !== totalSteps) {
              e.preventDefault();
            }
          }}
        >
          <div className="row g-3">
            {renderStepContent()}

            <div className="col-12 mt-3 d-flex justify-content-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={prevStep}
                    disabled={loading}
                  >
                    <i className="bi bi-chevron-left me-1"></i> Previous
                  </button>
                )}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                {currentStep === totalSteps ? (
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    <i className="bi bi-check-circle me-1"></i> Finish
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={loading}
                  >
                    Next <i className="bi bi-chevron-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanProductForm;