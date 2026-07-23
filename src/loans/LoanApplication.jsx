// LoanApplication.jsx
import React, { useState } from "react";
import LoanForm from "./CustomerLoanForm";
import "bootstrap/dist/css/bootstrap.min.css";

const LoanApplication = () => {
  const [formData, setFormData] = useState({ kycCode: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("verify");
  const [verifiedCustomer, setVerifiedCustomer] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/verify-manual-customer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.verified) {
        setVerifiedCustomer(data.customer);
        setStatus("verified");
      } else {
        setStatus("not-found");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => setStep("loan-form");
  const handleBack = () => {
    setStep("verify");
    setStatus("");
  };
  const handleReset = () => {
    setFormData({ kycCode: "" });
    setStatus("");
    setStep("verify");
    setVerifiedCustomer(null);
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4 p-md-5">
          {/* Header */}
          <div
            className="text-center mb-5 p-4 rounded-4"
            style={{
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.77)",
              boxShadow: "0 10px 30px rgba(133, 131, 131, 0.08)",
            }}
          >
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 75,
                height: 75,
                borderRadius: "50%",
                background: "rgba(218, 183, 183, 0.53)",
                backdropFilter: "blur(10px)",
              }}
            >
              <i
                className="bi bi-cash-stack"
                style={{ fontSize: "32px", color: "#38bdf8" }}
              ></i>
            </div>
            <h2
              className="fw-bold mb-2"
              style={{ 
                color: "#007bff", // <-- CHANGED TO BLUE
                letterSpacing: "0.5px" 
              }}
            >
              Loan Application
            </h2>
            <p className="mb-0" style={{ color: "#cbd5e1", fontSize: "15px" }}>
              Verify your KYC information to continue your loan request.
            </p>
          </div>

          {/* VERIFY FORM */}
          {step === "verify" && status !== "verified" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Enter Applicant KYC Code
                </label>
                <small className="text-muted d-block mb-2">
                  Please complete your KYC forms to receive your code.
                </small>
                <input
                  name="kycCode"
                  className="form-control form-control-lg"
                  value={formData.kycCode}
                  onChange={handleInputChange}
                  placeholder="e.g. kyc00001"
                  required
                  disabled={loading}
                />
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                <button
                  type="submit"
                  className="btn-crazy btn-crazy-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check"></i> Verify KYC
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-crazy btn-crazy-outline"
                  onClick={handleReset}
                >
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              </div>
            </form>
          )}

          {/* VERIFIED SUCCESS */}
          {step === "verify" && status === "verified" && (
            <div className="text-center">
              <div className="display-4 text-success mb-3">✔</div>
              <h4 className="text-success">Verification Successful</h4>
              <p className="text-muted">
                You can now proceed with your loan application.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
                <button
                  className="btn-crazy btn-crazy-success"
                  onClick={handleProceed}
                >
                  <i className="bi bi-arrow-right-circle"></i> Proceed
                </button>
                <button
                  className="btn-crazy btn-crazy-secondary"
                  onClick={handleBack}
                >
                  <i className="bi bi-arrow-left-circle"></i> Back
                </button>
              </div>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {status && status !== "verified" && (
            <div className="alert alert-danger mt-4 text-center">
              {status === "not-found"
                ? "Invalid KYC Code"
                : "Server error. Please try again."}
            </div>
          )}

          {/* LOAN FORM */}
          {step === "loan-form" && (
            <LoanForm user={verifiedCustomer} handleReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;