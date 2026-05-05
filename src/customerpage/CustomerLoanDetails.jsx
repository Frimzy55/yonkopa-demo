import React, { useEffect, useState } from "react";

const LoanDetails = ({ formData, handleInputChange }) => {
  const [loanSummary, setLoanSummary] = useState({
    interest: 0,
    totalInterest: 0,
    numberOfPayments: 0,
    monthlyPayment: 0,
    loanFees: 0,
  });

  // Set Rate Per Annum
  useEffect(() => {
    let rate = "";

    if (formData.employmentStatus === "self-employed") {
      rate = "80% Rate Per Annum";
    } else if (formData.employmentStatus === "salary-worker") {
      rate = "72% Rate Per Annum";
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
      monthlyRate = 0.06667;
    } else if (formData.employmentStatus === "salary-worker") {
      monthlyRate = 0.06;
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

  // ✅ SYNC TO FORM DATA (IMPORTANT FIX)
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

  return (
    <div className="form-step">
      <h3>Loan Details</h3>

      <div className="form-grid">
        <input
          name="loanAmount"
          type="number"
          placeholder="Loan Amount"
          value={formData.loanAmount}
          onChange={handleInputChange}
          required
        />

        <input
          name="loanPurpose"
          placeholder="Loan Purpose"
          value={formData.loanPurpose}
          onChange={handleInputChange}
          required
        />

        <input
          name="loanTerm"
          placeholder="Loan Term (months)"
          value={formData.loanTerm}
          onChange={handleInputChange}
          required
        />

        <select
          name="repaymentFrequency"
          value={formData.repaymentFrequency}
          onChange={handleInputChange}
          required
        >
          <option value="">Repayment Frequency</option>

          {formData.employmentStatus === "self-employed" && (
            <option value="Weekly">Weekly</option>
          )}

          {formData.employmentStatus === "salary-worker" && (
            <option value="Monthly">Monthly</option>
          )}
        </select>

        <input
          name="ratePerAnnum"
          type="text"
          value={formData.ratePerAnnum ? `${formData.ratePerAnnum}%` : ""}
          readOnly
        />

        <input
          name="employmentStatus"
          value={formData.employmentStatus}
          readOnly
          hidden
        />
      </div>

      {/* Loan Summary */}
     {/* Loan Summary */}
<div className="card border-0 shadow-lg mt-4 rounded-4 overflow-hidden">
  {/* Header */}
  <div
    className="text-white p-3"
    style={{
      background: "linear-gradient(135deg, #0d6efd, #6610f2)",
    }}
  >
    <h5 className="mb-0 fw-bold"> Loan Summary</h5>
  </div>

  {/* Body */}
  <div className="card-body bg-light">
    <div className="row g-3 text-center">
      {/* Interest */}
      <div className="col-md-3">
        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
          <div className="text-muted small">Interest</div>
          <h5 className="fw-bold text-danger">
            GHS {loanSummary.interest.toFixed(2)}
          </h5>
        </div>
      </div>

      {/* Total Amount */}
      <div className="col-md-3">
        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
          <div className="text-muted small">Total Amount</div>
          <h5 className="fw-bold text-primary">
            GHS {loanSummary.totalInterest.toFixed(2)}
          </h5>
        </div>
      </div>

      {/* Monthly Payment */}
      <div className="col-md-3">
        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
          <div className="text-muted small">Monthly Payment</div>
          <h5 className="fw-bold text-success">
            GHS {loanSummary.monthlyPayment.toFixed(2)}
          </h5>
        </div>
      </div>

      {/* Number of Payments */}
      <div className="col-md-3">
        <div className="p-3 bg-white rounded-3 shadow-sm h-100">
          <div className="text-muted small">Payments</div>
          <h5 className="fw-bold text-dark">
            {loanSummary.numberOfPayments}
          </h5>
        </div>
      </div>
    </div>

    {/* Loan Fees */}
    <div className="mt-4">
      <div className="alert alert-warning rounded-3 shadow-sm d-flex justify-content-between align-items-center">
        <span className="fw-semibold">Loan Fees</span>
        <span className="fw-bold">
          GHS {loanSummary.loanFees.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default LoanDetails;