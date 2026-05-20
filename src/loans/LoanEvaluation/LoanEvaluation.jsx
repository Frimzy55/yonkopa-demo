import React, { useState } from "react";
import { Card, Button, ProgressBar, Alert, Modal } from "react-bootstrap"; // <-- added Modal

import LoanDetailsStep from "./LoanDetailsStep";
import CollateralStep from "./CollateralStep";
import BorrowerCreditStep from "./BorrowerCreditStep";
import FinalDecisionStep from "./FinalDecisionStep";

const STEPS = [
  { number: 1, title: "Loan Details" },
  { number: 2, title: "Collateral" },
  { number: 3, title: "Borrower Credit" },
  { number: 4, title: "Recommendation" },
];

//const LoanEvaluation = ({ loan, onBack }) => {
  const LoanEvaluation = ({ loan, onBack, initialStep = 1 }) => {
 // const [step, setStep] = useState(1);
 const [step, setStep] = useState(initialStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // <-- modal state
  const [successModalText, setSuccessModalText] = useState("");    // <-- modal message

  const [formData, setFormData] = useState({
    loanDetails: {},
    collateral: {},
    credit: {},
    decision: {},
  });

  if (!loan) return null;

  const stepProgress = (step / 4) * 100;

  const handleSubmit = async (overrideData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    const payload = {
      loan,
      collateral: formData.collateral,
      creditData: formData.credit,
      finalDecision: overrideData?.decision || formData.decision,
    };

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/loan/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Show success modal instead of Alert + auto redirect
        setSuccessModalText(
          data.message || "Evaluation saved successfully!"
        );
        setShowSuccessModal(true);
        // Do NOT call onBack() here – wait for modal to close
        setIsSubmitting(false); // allow further actions? but modal is shown, user will close it
      } else {
        setSubmitMessage({
          text: data.message || data.error || "Submission failed",
          variant: "danger",
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage({
        text: "Network error – please try again.",
        variant: "danger",
      });
      setIsSubmitting(false);
    }
  };

  // Called when modal is closed (via Close button or backdrop click)
  const handleModalClose = () => {
    setShowSuccessModal(false);
    onBack(); // navigate back after modal is dismissed
  };

  return (
    <div
      className="w-100 h-100 px-3 py-3"
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Loan Evaluation</h4>

        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onBack}
        >
          ← Back
        </Button>
      </div>

      {/* STEP INDICATOR */}
      <div className="d-flex justify-content-between mb-3">
        {STEPS.map((s) => (
          <div
            key={s.number}
            className={`text-center flex-grow-1 ${
              s.number === step ? "fw-bold text-primary" : "text-muted"
            }`}
            style={{ fontSize: "14px" }}
          >
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${
                s.number === step
                  ? "bg-primary text-white"
                  : "bg-light text-muted"
              }`}
              style={{ width: "32px", height: "32px" }}
            >
              {s.number}
            </div>
            <div>{s.title}</div>
          </div>
        ))}
      </div>

      {/* PROGRESS */}
      <ProgressBar now={stepProgress} className="mb-3" />

      {/* CARD AREA */}
      <Card className="shadow-sm border-0 flex-grow-1 overflow-hidden">
        <Card.Body className="h-100 overflow-auto">
          {/* ERROR ALERT (still uses Alert) */}
          {submitMessage && (
            <Alert
              variant={submitMessage.variant}
              dismissible
              onClose={() => setSubmitMessage(null)}
              className="mb-3"
            >
              {submitMessage.text}
            </Alert>
          )}

          {/* STEP 1 */}
          <div style={{ display: step === 1 ? "block" : "none" }}>
            <LoanDetailsStep
              loan={loan}
              data={formData.loanDetails}
              setData={(data) =>
                setFormData((prev) => ({ ...prev, loanDetails: data }))
              }
              onNext={() => setStep(2)}
            />
          </div>

          {/* STEP 2 */}
          <div style={{ display: step === 2 ? "block" : "none" }}>
            <CollateralStep
              loan={loan}
              data={formData.collateral}
              setData={(data) =>
                setFormData((prev) => ({ ...prev, collateral: data }))
              }
              onBack={() => setStep(1)}
              onNext={(data) => {
                setFormData((prev) => ({ ...prev, collateral: data }));
                setStep(3);
              }}
            />
          </div>

          {/* STEP 3 */}
          <div style={{ display: step === 3 ? "block" : "none" }}>
            <BorrowerCreditStep
              loan={loan}
              data={formData.credit}
              setData={(data) =>
                setFormData((prev) => ({ ...prev, credit: data }))
              }
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          </div>

          {/* STEP 4 */}
          <div style={{ display: step === 4 ? "block" : "none" }}>
            <FinalDecisionStep
              loan={loan}
              onBack={() => setStep(3)}
              onSubmit={(data) => {
                setFormData((prev) => ({ ...prev, decision: data }));
                handleSubmit({ decision: data });
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        </Card.Body>
      </Card>

      {/* SUCCESS MODAL */}
      <Modal show={showSuccessModal} onHide={handleModalClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>{successModalText}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoanEvaluation;