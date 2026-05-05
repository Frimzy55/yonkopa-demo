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
          width: "800px",
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
        <div className="d-flex justify-content-between align-items-center mb-3 position-sticky bg-white pb-2" style={{ top: 0, zIndex: 1 }}>
          <h4 id="terms-modal-title" className="fw-semibold mb-0">
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
          {/* Header */}
          <p className="fw-semibold fs-6 mb-2">Yonkopa Micro Credit Enterprise</p>

          <div className="small text-secondary mb-3">
            <p className="mb-1">
              <strong>Effective Date:</strong> 1st January, 2026
            </p>
            <p className="mb-0">
              <strong>Last Updated:</strong> 5th May, 2026
            </p>
          </div>

          {/* Welcome Section */}
          <p className="mb-3">
            Welcome to Yonkopa Micro Credit Enterprise (“Yonkopa,” “we,” “our,” or “us”). 
            These Terms and Conditions (“Terms”) govern your access to and use of our 
            website, web application, mobile services, and all related financial products 
            and services (collectively, the “Platform”).
          </p>

          <p className="mb-4">
            By accessing or using our Platform, registering an account, applying for a loan, 
            or using any of our services, you agree to be legally bound by these Terms. 
            If you do not agree, do not use the Platform.
          </p>

          {/* Section 1: Definitions */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">1. Definitions</h5>
            <div className="ms-3">
              <p className="mb-1"><strong>Account</strong> means a registered user profile created on the Platform.</p>
              <p className="mb-1"><strong>Applicant</strong> means any individual or business applying for a financial product through the Platform.</p>
              <p className="mb-1"><strong>Borrower</strong> means any user whose loan application has been approved.</p>
              <p className="mb-1"><strong>Loan</strong> means any credit facility granted by Yonkopa.</p>
              <p className="mb-1"><strong>User</strong> means any person who accesses or uses the Platform.</p>
              <p className="mb-1"><strong>Services</strong> means all financial and non-financial products offered by Yonkopa through the Platform.</p>
              <p className="mb-1"><strong>Repayment Date</strong> means the date by which the Borrower must repay any amount due.</p>
              <p className="mb-0"><strong>Default</strong> means failure to meet repayment obligations under the agreed loan terms.</p>
            </div>
          </div>

          {/* Section 2: Eligibility */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">2. Eligibility</h5>
            <p className="mb-2">To use our Platform and services, you must:</p>
            <ul className="mb-2 ms-3">
              <li>Be at least 18 years old;</li>
              <li>Be legally capable of entering into a binding contract;</li>
              <li>Be a resident of a jurisdiction where our services are legally available;</li>
              <li>Provide accurate, current, and complete information;</li>
              <li>Possess a valid national identification document;</li>
              <li>Have an active mobile number and/or email address;</li>
              <li>Meet our internal credit and verification requirements.</li>
            </ul>
            <p className="mb-0">We reserve the right to deny access to any person who does not meet our eligibility requirements.</p>
          </div>

          {/* Section 3: Account Registration */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">3. Account Registration</h5>
            <p className="mb-2">To access certain services, you may be required to create an Account.</p>
            <p className="mb-2">By registering, you agree that:</p>
            <ul className="mb-2 ms-3">
              <li>All information provided is true, accurate, and complete;</li>
              <li>You will maintain and promptly update your information;</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials;</li>
              <li>You are responsible for all activities under your Account;</li>
              <li>You will notify us immediately of any unauthorized access or suspected breach.</li>
            </ul>
            <p className="mb-0">Yonkopa reserves the right to suspend or terminate Accounts that contain false, misleading, or incomplete information.</p>
          </div>

          {/* Section 4: Loan Applications and Approval */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">4. Loan Applications and Approval</h5>
            <p className="mb-2">Submitting a loan application does not guarantee approval.</p>
            <p className="mb-2">All loan applications are subject to:</p>
            <ul className="mb-2 ms-3">
              <li>Identity verification;</li>
              <li>Creditworthiness assessment;</li>
              <li>Risk evaluation;</li>
              <li>Internal approval procedures;</li>
              <li>Submission of any requested documentation.</li>
            </ul>
            <p className="mb-2">Yonkopa reserves the absolute right to approve, decline, or conditionally approve any application without obligation to disclose internal scoring or decision methodology, except where required by law.</p>
            <p className="mb-0">Approved loans shall be governed by a separate Loan Agreement, repayment schedule, and applicable disclosures.</p>
          </div>

          {/* Section 5: Loan Terms */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">5. Loan Terms</h5>
            <p className="mb-2">Loan terms, including but not limited to:</p>
            <ul className="mb-2 ms-3">
              <li>Principal amount,</li>
              <li>Interest rate,</li>
              <li>Processing fees,</li>
              <li>Tenure,</li>
              <li>Repayment frequency,</li>
              <li>Penalties,</li>
              <li>Applicable charges,</li>
            </ul>
            <p className="mb-2">shall be disclosed to the Borrower before acceptance.</p>
            <p className="mb-0">By accepting a loan offer, the Borrower agrees to repay all outstanding sums in accordance with the agreed repayment schedule.</p>
          </div>

          {/* Section 6: Interest, Fees, and Charges */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">6. Interest, Fees, and Charges</h5>
            <p className="mb-2">Borrowers agree that Yonkopa may charge:</p>
            <ul className="mb-2 ms-3">
              <li>Interest on approved loans;</li>
              <li>Administrative or processing fees;</li>
              <li>Late payment penalties;</li>
              <li>Default charges;</li>
              <li>Recovery costs;</li>
              <li>Applicable taxes and statutory deductions.</li>
            </ul>
            <p className="mb-2">All charges will be disclosed before loan acceptance and may vary depending on the product type, risk category, and applicable law.</p>
            <p className="mb-0">Failure to repay on time may increase the total amount payable.</p>
          </div>

          {/* Section 7: Repayment Obligations */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">7. Repayment Obligations</h5>
            <p className="mb-2">Borrowers shall repay all loan obligations on or before the due date.</p>
            <p className="mb-2">Repayment may be made through approved channels including:</p>
            <ul className="mb-2 ms-3">
              <li>Mobile money,</li>
              <li>Bank transfer,</li>
              <li>Direct debit,</li>
              <li>Wallet deduction,</li>
              <li>Any other approved payment method.</li>
            </ul>
            <p className="mb-2">Borrowers are solely responsible for ensuring timely repayment.</p>
            <p className="mb-2">Failure to repay by the due date may result in:</p>
            <ul className="mb-2 ms-3">
              <li>Late fees,</li>
              <li>Accrued penalty interest,</li>
              <li>Credit reporting,</li>
              <li>Recovery action,</li>
              <li>Legal enforcement,</li>
              <li>Restriction from future borrowing.</li>
            </ul>
            <p className="mb-0">Borrowers are solely responsible for ensuring timely repayment.</p>
          </div>

          {/* Section 8: Default and Recovery */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">8. Default and Recovery</h5>
            <p className="mb-2">A Borrower shall be in default if they:</p>
            <ul className="mb-2 ms-3">
              <li>Fail to make payment when due;</li>
              <li>Provide false or misleading information;</li>
              <li>Breach any loan agreement;</li>
              <li>Become insolvent or unable to repay;</li>
              <li>Use funds for unlawful purposes.</li>
            </ul>
            <p className="mb-2">In the event of default, Yonkopa may, to the extent permitted by law:</p>
            <ul className="mb-2 ms-3">
              <li>Demand immediate repayment;</li>
              <li>Suspend access to services;</li>
              <li>Apply penalties and default interest;</li>
              <li>Engage third-party debt recovery agents;</li>
              <li>Report the default to credit bureaus or regulators;</li>
              <li>Commence legal proceedings.</li>
            </ul>
            <p className="mb-0">Borrowers shall be liable for all reasonable recovery and enforcement costs.</p>
          </div>

          {/* Section 9: User Responsibilities */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">9. User Responsibilities</h5>
            <p className="mb-2">Users agree not to:</p>
            <ul className="mb-2 ms-3">
              <li>Use the Platform for unlawful or fraudulent purposes;</li>
              <li>Submit false, inaccurate, or misleading information;</li>
              <li>Interfere with the security or operation of the Platform;</li>
              <li>Attempt unauthorized access to systems or accounts;</li>
              <li>Reverse engineer, copy, or exploit the Platform;</li>
              <li>Use the Platform in a manner that harms Yonkopa or other users.</li>
            </ul>
            <p className="mb-0">Users are solely responsible for compliance with applicable laws in connection with their use of the Platform.</p>
          </div>

          {/* Section 10: KYC and Verification */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">10. KYC and Verification</h5>
            <p className="mb-2">Yonkopa may conduct Know Your Customer (KYC), Anti-Money Laundering (AML), fraud prevention, and compliance checks.</p>
            <p className="mb-2">By using our Platform, you consent to:</p>
            <ul className="mb-2 ms-3">
              <li>Identity verification;</li>
              <li>Biometric verification where applicable;</li>
              <li>Document validation;</li>
              <li>Credit checks;</li>
              <li>Transaction monitoring;</li>
              <li>Risk screening.</li>
            </ul>
            <p className="mb-2">We may request additional documents or information at any time.</p>
            <p className="mb-0">Failure to provide requested verification may result in delayed processing, suspension, or denial of service.</p>
          </div>

          {/* Section 11: Data Protection and Privacy */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">11. Data Protection and Privacy</h5>
            <p className="mb-2">Your personal data is processed in accordance with our Privacy Policy and applicable data protection laws.</p>
            <p className="mb-2">By using our Platform, you consent to the collection, use, storage, and processing of your personal information for purposes including:</p>
            <ul className="mb-2 ms-3">
              <li>Account creation and administration;</li>
              <li>Loan processing and servicing;</li>
              <li>Identity verification;</li>
              <li>Risk assessment;</li>
              <li>Customer support;</li>
              <li>Legal and regulatory compliance;</li>
              <li>Fraud prevention and debt recovery.</li>
            </ul>
            <p className="mb-0">We implement reasonable technical and organizational safeguards to protect your data.</p>
          </div>

          {/* Section 12: Communications Consent */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">12. Communications Consent</h5>
            <p className="mb-2">By using the Platform, you consent to receive communications from Yonkopa via:</p>
            <ul className="mb-2 ms-3">
              <li>SMS,</li>
              <li>Phone calls,</li>
              <li>Email,</li>
              <li>Push notifications,</li>
              <li>WhatsApp (where applicable),</li>
              <li>In-app notifications.</li>
            </ul>
            <p className="mb-2">These communications may include:</p>
            <ul className="mb-2 ms-3">
              <li>Account alerts,</li>
              <li>Loan updates,</li>
              <li>Payment reminders,</li>
              <li>Legal notices,</li>
              <li>Promotional content (subject to applicable law).</li>
            </ul>
            <p className="mb-0">You may opt out of marketing communications, but not essential service communications.</p>
          </div>

          {/* Section 13: Intellectual Property */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">13. Intellectual Property</h5>
            <p className="mb-2">All rights, title, and interest in the Platform, including all software, branding, content, text, graphics, logos, interfaces, and design elements, are owned by or licensed to Yonkopa.</p>
            <p className="mb-2">Users may not:</p>
            <ul className="mb-2 ms-3">
              <li>Copy,</li>
              <li>Modify,</li>
              <li>Reproduce,</li>
              <li>Republish,</li>
              <li>Distribute,</li>
              <li>Reverse engineer,</li>
              <li>Commercially exploit</li>
            </ul>
            <p className="mb-0">any part of the Platform without prior written consent.</p>
          </div>

          {/* Section 14: Service Availability */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">14. Service Availability</h5>
            <p className="mb-2">We strive to maintain uninterrupted access to the Platform but do not guarantee continuous or error-free availability.</p>
            <p className="mb-2">We may suspend, restrict, or discontinue any part of the Platform for:</p>
            <ul className="mb-2 ms-3">
              <li>Maintenance,</li>
              <li>Security,</li>
              <li>Upgrades,</li>
              <li>Compliance,</li>
              <li>Operational reasons.</li>
            </ul>
            <p className="mb-0">Yonkopa shall not be liable for interruptions, delays, or temporary unavailability.</p>
          </div>

          {/* Section 15: Limitation of Liability */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">15. Limitation of Liability</h5>
            <p className="mb-2">To the fullest extent permitted by law, Yonkopa shall not be liable for:</p>
            <ul className="mb-2 ms-3">
              <li>Indirect, incidental, or consequential damages;</li>
              <li>Loss of profits, business, data, or reputation;</li>
              <li>Delays caused by third parties;</li>
              <li>Service interruptions;</li>
              <li>Unauthorized access caused by user negligence;</li>
              <li>Decisions made based on Platform content.</li>
            </ul>
            <p className="mb-0">Our total liability in any claim shall not exceed the amount directly paid by the User to Yonkopa in relation to the specific service giving rise to the claim.</p>
          </div>

          {/* Section 16: Indemnity */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">16. Indemnity</h5>
            <p className="mb-0">You agree to indemnify and hold harmless Yonkopa, its directors, employees, agents, affiliates, and partners from any claims, damages, liabilities, losses, and expenses arising from:</p>
            <ul className="mb-0 ms-3">
              <li>Your breach of these Terms;</li>
              <li>Your misuse of the Platform;</li>
              <li>Your violation of any law or third-party rights.</li>
            </ul>
          </div>

          {/* Section 17: Suspension and Termination */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">17. Suspension and Termination</h5>
            <p className="mb-2">We may suspend or terminate your access to the Platform at any time, with or without notice, where:</p>
            <ul className="mb-2 ms-3">
              <li>You breach these Terms;</li>
              <li>You provide false information;</li>
              <li>Fraud or suspicious activity is detected;</li>
              <li>Required by law or regulatory directive.</li>
            </ul>
            <p className="mb-0">Termination does not extinguish outstanding repayment obligations.</p>
          </div>

          {/* Section 18: Complaints and Dispute Resolution */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">18. Complaints and Dispute Resolution</h5>
            <p className="mb-2">Users may submit complaints through our official customer support channels.</p>
            <p className="mb-2">We will make reasonable efforts to investigate and resolve disputes promptly.</p>
            <p className="mb-0">Where disputes cannot be resolved amicably, they shall be referred to the competent courts or dispute resolution mechanisms in the applicable jurisdiction.</p>
          </div>

          {/* Section 19: Governing Law */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">19. Governing Law</h5>
            <p className="mb-2">These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana.</p>
            <p className="mb-0">Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.</p>
          </div>

          {/* Section 20: Amendments */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">20. Amendments</h5>
            <p className="mb-2">Yonkopa reserves the right to amend these Terms at any time.</p>
            <p className="mb-2">Updated Terms shall become effective upon publication on the Platform unless otherwise stated.</p>
            <p className="mb-0">Continued use of the Platform after any update constitutes acceptance of the revised Terms.</p>
          </div>

          {/* Section 21: Force Majeure */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">21. Force Majeure</h5>
            <p className="mb-2">Yonkopa shall not be liable for any failure or delay in performance caused by events beyond its reasonable control, including but not limited to:</p>
            <ul className="mb-0 ms-3">
              <li>Natural disasters,</li>
              <li>Government actions,</li>
              <li>War,</li>
              <li>Strikes,</li>
              <li>Telecommunications failures,</li>
              <li>Power outages,</li>
              <li>Cyber incidents,</li>
              <li>Financial system disruptions.</li>
            </ul>
          </div>

          {/* Section 22: Severability */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">22. Severability</h5>
            <p className="mb-0">If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
          </div>

          {/* Section 23: Entire Agreement */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">23. Entire Agreement</h5>
            <p className="mb-0">These Terms, together with our Privacy Policy, Loan Agreement, and any related disclosures, constitute the entire agreement between you and Yonkopa regarding use of the Platform.</p>
          </div>

          {/* Section 24: Contact Information */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">24. Contact Information</h5>
            <p className="mb-1">Yonkopa Micro Credit Enterprise</p>
            <p className="mb-1">Dunkwa-on-Offin, Opposite the Community Center</p>
            <p className="mb-1">Email: <a href="mailto:info@yonkopamicrocredit.com">info@yonkopamicrocredit.com</a></p>
            <p className="mb-1">Website: <a href="https://www.yonkopamicrocredit.com" target="_blank" rel="noopener noreferrer">www.yonkopamicrocredit.com</a></p>
            <p className="mb-1">Tel: 0322291715</p>
            <p className="mb-0">Phone: 0241933741</p>
            <p className="mt-2 mb-0">For inquiries, complaints, or support, please contact us through the above channels.</p>
          </div>

          {/* Section 25: Default And Publication */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">25. Default and Publication</h5>
            <p className="mb-2">The Borrower falls into default if the Borrower fails to comply with the terms of payment.</p>
            <p className="mb-2">In the event of a default, the total amount outstanding on this loan facility inclusive of interest, penalty and other charges for the period agreed herein shall be due immediately and the Lender shall be at liberty to demand payment of same.</p>
            <p className="mb-0">In the event of a default, the Borrower and the Guarantor(s) authorize the Lender to publish their respective names and pictures to the general public.</p>
          </div>

          {/* Section 26: Copyright Notice */}
          <div className="mb-4">
            <h5 className="fw-semibold fs-6 mb-2">26. Copyright Notice</h5>
            <p className="mb-2">© 2026 Yonkopa Micro Credit Enterprise. All rights reserved.</p>
            <p className="mb-2">All content made available on or through the Platform, including but not limited to text, software, source code, databases, user interfaces, logos, icons, graphics, designs, images, audio, video, documents, trademarks, service marks, and other materials (collectively, “Content”) is the exclusive property of Yonkopa Micro Credit Enterprise or its licensors and is protected under applicable copyright, trademark, intellectual property, and other proprietary laws.</p>
            <p className="mb-2">Except as expressly permitted in writing by Yonkopa Micro Credit Enterprise, no part of the Platform or its Content may be:</p>
            <ul className="mb-2 ms-3">
              <li>copied,</li>
              <li>reproduced,</li>
              <li>modified,</li>
              <li>republished,</li>
              <li>uploaded,</li>
              <li>posted,</li>
              <li>transmitted,</li>
              <li>distributed,</li>
              <li>licensed,</li>
              <li>sold,</li>
              <li>reverse engineered,</li>
              <li>commercially exploited, or</li>
              <li>used to create derivative works</li>
            </ul>
            <p className="mb-2">in any form or by any means without prior written consent.</p>
            <p className="mb-2">Users are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform strictly for its intended personal or business purposes in accordance with these Terms.</p>
            <p className="mb-2">Unauthorized use of any Content may violate copyright, trademark, privacy, and other laws and may result in civil and/or criminal liability.</p>
            <p className="mb-2">All trademarks, service marks, trade names, and logos displayed on the Platform are the property of Yonkopa Micro Credit Enterprise or their respective owners. Nothing contained on the Platform shall be construed as granting any license or right to use any trademark without prior written permission from the lawful owner.</p>
            <p className="mb-2">If you believe that any content on the Platform infringes your intellectual property rights, please contact us immediately using the details provided below.</p>
            <p className="mb-2 fw-semibold">Copyright Contact</p>
            <p className="mb-1">Yonkopa Micro Credit Enterprise</p>
            <p className="mb-1">Dunkwa-on-Offin, Opposite the Community Center</p>
            <p className="mb-1">Email: <a href="mailto:info@yonkopamicrocredit.com">info@yonkopamicrocredit.com</a></p>
            <p className="mb-1">Website: <a href="https://www.yonkopamicrocredit.com" target="_blank" rel="noopener noreferrer">www.yonkopamicrocredit.com</a></p>
            <p className="mb-1">Tel: 0322291715</p>
            <p className="mb-0">Phone: 0241933741</p>
          </div>

          {/* Final Acknowledgment */}
          <div className="alert alert-light mt-3 p-3" style={{ backgroundColor: "#f8f9fa", borderLeft: "4px solid #0d6efd" }}>
            <p className="mb-0 fw-semibold">
              By using Yonkopa Micro Credit Enterprise's Platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-4 position-sticky bg-white pt-2" style={{ bottom: 0, zIndex: 1 }}>
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