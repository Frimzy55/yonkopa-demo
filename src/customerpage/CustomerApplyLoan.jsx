import React, { useState, useEffect } from "react";
import LoanForm from "./CutomerLoanForm";
import "bootstrap/dist/css/bootstrap.min.css";

const CustomerApplyLoan = ({ user }) => {
  const [formData, setFormData] = useState({ userId: "", kycCode: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("verify");
  const [verifiedCustomer, setVerifiedCustomer] = useState(null);

  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      setFormData((prev) => ({ ...prev, userId: user.userId }));
    }
  }, [user]);

  

  /*useEffect(() => {
    const checkLoan = async () => {
      if (!user?.userId) return;

      try {
        setChecking(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/loan-check/${user.userId}`
        );
        const data = await res.json();


       if (data.exists) setAlreadyApplied(true);

      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    checkLoan();
  }, [user]);*/





  useEffect(() => {
  const checkLoan = async () => {
    if (!user?.userId) return;

    try {
      setChecking(true);

      // 1. Active loan check
      const res1 = await fetch(
        `${process.env.REACT_APP_API_URL}/loan-check/${user.userId}`
      );
      const active = await res1.json();

      // 2. Rejected check
      const res2 = await fetch(
        `${process.env.REACT_APP_API_URL}/loan-rejected-check/${user.userId}`
      );
      const rejected = await res2.json();

      // FINAL LOGIC
      const isRejectedOnly = rejected.rejected;

      if (isRejectedOnly) {
        // allow reapply ALWAYS
        setAlreadyApplied(false);
      } else if (active.exists) {
        // pending or approved → block
        setAlreadyApplied(true);
      } else {
        // no loan → allow
        setAlreadyApplied(false);
      }

    } catch (err) {
      console.error(err);
      setAlreadyApplied(false);
    } finally {
      setChecking(false);
    }
  };

  checkLoan();
}, [user?.userId]);



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
        `${process.env.REACT_APP_API_URL}/api/verify-customer`,
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
    setFormData({ userId: user?.userId || "", kycCode: "" });
    setStatus("");
    setStep("verify");
    setVerifiedCustomer(null);
  };

  if (checking) {
    return (
      <div className="container my-5 text-center">
        <div className="card shadow-sm p-5">
          <div className="spinner-border text-primary mb-3" />
          <h5>Checking eligibility...</h5>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="container my-5">
        <div className="card shadow-sm border-0 p-5 text-center">
          <h3 className="text-danger mb-2">You cannot apply at this time Loan under review</h3>
          <p className="text-muted">
            You already have Pending loan application.
          </p>
          <button className="btn btn-outline-secondary mt-3" onClick={handleReset}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4 p-md-5">

          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="fw-bold">Loan Application</h2>
            <p className="text-muted">Verify your KYC before proceeding</p>
          </div>

          {/* VERIFY FORM */}
          {step === "verify" && status !== "verified" && (
            <form onSubmit={handleSubmit}>
              <input name="userId" value={formData.userId} hidden readOnly />

              <div className="mb-3">
               <label className="form-label fw-semibold">
              Enter Your KYC Code
             </label>
             <small className="text-muted d-block mb-2">
              Please complete your KYC forms to enable notifications via the bell icon and receive your code.
             </small>
                <input
                  name="kycCode"
                  className="form-control form-control-lg"
                  value={formData.kycCode}
                  onChange={handleInputChange}
                  placeholder="e.g. 00001"
                  required
                  disabled={loading}
                />
              </div>

              <button
                className="btn btn-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify KYC"
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={handleReset}
              >
                Cancel
              </button>
            </form>
          )}

          {/* VERIFIED */}
          {step === "verify" && status === "verified" && (
            <div className="text-center">
              <div className="display-4 text-success mb-3">✔</div>
              <h4 className="text-success">Verification Successful</h4>
              <p className="text-muted">
                You can now proceed with your loan application.
              </p>

              <div className="d-flex gap-2 justify-content-center mt-4">
                <button
                  className="btn btn-success px-4"
                  onClick={handleProceed}
                >
                  Proceed
                </button>

                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STATUS MESSAGE */}
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

export default CustomerApplyLoan;