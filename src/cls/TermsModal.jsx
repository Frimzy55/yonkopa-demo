import React, { useCallback, useEffect, useRef } from "react";

/**
 * TermsModal Component
 * Displays terms and conditions in a modal dialog.
 * Supports ESC key to close and click-outside-to-close functionality.
 *
 * @param {Object} props
 * @param {boolean} props.show - Controls modal visibility
 * @param {Function} props.onClose - Callback function when modal closes
 * @param {Function} props.onAccept - Optional callback when user accepts terms
 * @param {string} props.title - Optional custom modal title
 * @param {boolean} props.closeOnBackdropClick - Whether clicking backdrop closes modal (default: true)
 * @param {boolean} props.closeOnEsc - Whether ESC key closes modal (default: true)
 */
const TermsModal = ({
  show,
  onClose,
  onAccept,
  title = "Terms and Conditions",
  closeOnBackdropClick = true,
  closeOnEsc = true,
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    if (!show || !closeOnEsc) return;

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [show, closeOnEsc, onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!show) return;

    // Focus the close button when modal opens for screen readers
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  // Handle accept button click
  const handleAccept = useCallback(() => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  }, [onAccept, onClose]);

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
      style={{ zIndex: 1060 }}
      onClick={handleBackdropClick}
      role="presentation"
      aria-label="Modal backdrop"
      aria-hidden={!show}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-4 shadow-lg p-4"
        style={{
          width: "700px",
          maxWidth: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        aria-label="Terms and Conditions Modal"
      >
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 
            id="terms-modal-title" 
            className="fw-semibold mb-0"
          >
            {title}
          </h4>
          <button
            ref={closeButtonRef}
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* Content Section */}
        <div
          className="terms-content"
          style={{
            fontSize: "0.875rem",
            lineHeight: "1.6",
            color: "#212529",
          }}
        >
          <p className="fw-semibold mb-2">Yonkopa Micro Credit Enterprise</p>
          
          <div className="small text-secondary mb-3">
            <p className="mb-1">
              <strong>Effective Date:</strong> January 1, 2026
            </p>
            <p className="mb-0">
              <strong>Last Updated:</strong> May 5, 2026
            </p>
          </div>

          <p className="mb-3">
            Welcome to Yonkopa Micro Credit Enterprise ("Yonkopa," "we," "our," 
            or "us"). These Terms and Conditions ("Terms") govern your access to 
            and use of our website, web application, mobile services, and all 
            related financial products and services (collectively, the "Platform").
          </p>

          <p className="mb-4">
            By accessing or using our Platform, registering an account, applying 
            for a loan, or using any of our services, you agree to be legally 
            bound by these Terms. If you do not agree, you may not use the Platform.
          </p>

          {/* Sections */}
          {[
            {
              title: "1. Definitions",
              content: "In these Terms, 'Account' means a registered user profile created on the Platform. 'Applicant' means any individual or business applying for a financial product. 'Borrower' means any user whose loan application has been approved. 'Loan' means any credit facility granted by Yonkopa. 'User' means any person who accesses or uses the Platform. 'Services' means all financial and non-financial products offered by Yonkopa through the Platform."
            },
            {
              title: "2. Eligibility",
              content: "To use our Platform and services, you must be at least 18 years old, legally capable of entering into a binding contract, provide accurate and complete information, possess valid identification, and meet our internal credit and verification requirements."
            },
            {
              title: "3. Account Registration",
              content: "You are responsible for maintaining accurate account information and protecting your login credentials. Yonkopa may suspend or terminate accounts containing false or misleading information without prior notice."
            },
            {
              title: "4. Loan Applications and Approval",
              content: "Submitting a loan application does not guarantee approval. All applications are subject to verification, creditworthiness assessment, and internal approval at Yonkopa's sole discretion."
            },
            {
              title: "5. Loan Terms",
              content: "Loan terms including principal amount, interest rate, fees, repayment schedule, penalties, and applicable charges shall be disclosed in your loan agreement before acceptance. You are responsible for reviewing all terms carefully."
            },
            {
              title: "6. Repayment Obligations",
              content: "Borrowers must repay all obligations on or before the due date using approved payment methods. Failure to repay may result in penalties, recovery action, credit reporting, and legal enforcement as permitted by applicable law."
            },
            {
              title: "7. Default and Recovery",
              content: "In the event of default, Yonkopa may demand immediate repayment, apply penalties as specified in your loan agreement, engage licensed recovery agents, report to credit bureaus, and commence legal proceedings where necessary. All recovery costs shall be borne by the borrower."
            },
            {
              title: "8. Data Protection and Privacy",
              content: "Your personal data is processed in accordance with our Privacy Policy and applicable data protection laws, including the Data Protection Act, 2012 (Act 843) of Ghana. We use your information for loan processing, identity verification, compliance, fraud prevention, and customer support."
            },
            {
              title: "9. Governing Law",
              content: "These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana."
            },
            {
              title: "10. Limitation of Liability",
              content: "To the maximum extent permitted by law, Yonkopa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or our services."
            },
            {
              title: "11. Contact Information",
              content: (
                <>
                  Yonkopa Micro Credit Enterprise<br />
                  Dunkwa-on-Offin, Opposite the Community Center<br />
                  Email: <a href="mailto:info@yonkopamicrocredit.com">info@yonkopamicrocredit.com</a><br />
                  Website: <a href="https://www.yonkopamicrocredit.com" target="_blank" rel="noopener noreferrer">www.yonkopamicrocredit.com</a><br />
                  Tel: 0322291715<br />
                  Phone: 0241933741
                </>
              )
            },
            {
              title: "12. Copyright Notice",
              content: "© 2026 Yonkopa Micro Credit Enterprise. All rights reserved. All content made available on or through the Platform is the exclusive property of Yonkopa Micro Credit Enterprise and protected by applicable intellectual property laws, including copyright and trademark laws."
            }
          ].map((section, index) => (
            <div key={index} className="mb-3">
              <h5 className="fw-semibold fs-6 mb-2">{section.title}</h5>
              <div className="ms-2" style={{ fontSize: "0.875rem" }}>
                {typeof section.content === "string" ? (
                  <p className="mb-0">{section.content}</p>
                ) : (
                  section.content
                )}
              </div>
            </div>
          ))}

          <div className="alert alert-light mt-3 p-3" style={{ backgroundColor: "#f8f9fa" }}>
            <p className="mb-0 fw-semibold">
              By using Yonkopa Micro Credit Enterprise's Platform, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms 
              and Conditions.
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-4">
          <button
            type="button"
            className="btn btn-primary w-100 rounded-pill py-2"
            onClick={handleAccept}
            style={{ fontWeight: 600 }}
          >
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;