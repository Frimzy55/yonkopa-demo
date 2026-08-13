import React, { useCallback, useEffect, useRef } from "react";
import "./TermsModal.css";

/**
 * TermsModal Component
 * Displays terms and conditions in a modal dialog.
 * Supports ESC key to close and click-outside-to-close functionality.
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

  // ESC key handler
  useEffect(() => {
    if (!show || !closeOnEsc) return;
    const handleEscKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [show, closeOnEsc, onClose]);

  // Focus trap and body scroll lock
  useEffect(() => {
    if (!show) return;
    if (closeButtonRef.current) closeButtonRef.current.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
    },
    [closeOnBackdropClick, onClose]
  );

  // Accept
  const handleAccept = useCallback(() => {
    if (onAccept) onAccept();
    onClose();
  }, [onAccept, onClose]);

  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="presentation"
      aria-label="Modal backdrop"
      aria-hidden={!show}
    >
      <div
        ref={modalRef}
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        aria-label="Terms and Conditions Modal"
      >
        {/* Header */}
        <div className="modal-header">
          <h4 id="terms-modal-title" className="modal-title">{title}</h4>
          <button
            ref={closeButtonRef}
            type="button"
            className="custom-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body">
          <p className="company-name">Yonkopa Micro Credit Enterprise</p>

          <div className="meta-dates">
            <span><strong>Effective Date:</strong> 1st January, 2026</span>
            <span><strong>Last Updated:</strong> 5th May, 2026</span>
          </div>

          <div className="welcome-text">
            <p>
              Welcome to Yonkopa Micro Credit Enterprise (“Yonkopa,” “we,” “our,” or “us”).
              These Terms and Conditions (“Terms”) govern your access to and use of our
              website, web application, mobile services, and all related financial products
              and services (collectively, the “Platform”).
            </p>
            <p>
              By accessing or using our Platform, registering an account, applying for a loan,
              or using any of our services, you agree to be legally bound by these Terms.
              If you do not agree, do not use the Platform.
            </p>
          </div>

          {/* === All Sections 1–26 === */}
          <div className="terms-sections">

            {/* 1. Definitions */}
            <div className="section">
              <h5 className="section-title">1. Definitions</h5>
              <div className="section-content">
                <p><strong>Account</strong> means a registered user profile created on the Platform.</p>
                <p><strong>Applicant</strong> means any individual or business applying for a financial product through the Platform.</p>
                <p><strong>Borrower</strong> means any user whose loan application has been approved.</p>
                <p><strong>Loan</strong> means any credit facility granted by Yonkopa.</p>
                <p><strong>User</strong> means any person who accesses or uses the Platform.</p>
                <p><strong>Services</strong> means all financial and non‑financial products offered by Yonkopa through the Platform.</p>
                <p><strong>Repayment Date</strong> means the date by which the Borrower must repay any amount due.</p>
                <p><strong>Default</strong> means failure to meet repayment obligations under the agreed loan terms.</p>
              </div>
            </div>

            {/* 2. Eligibility */}
            <div className="section">
              <h5 className="section-title">2. Eligibility</h5>
              <div className="section-content">
                <p>To use our Platform and services, you must:</p>
                <ul>
                  <li>Be at least 18 years old;</li>
                  <li>Be legally capable of entering into a binding contract;</li>
                  <li>Be a resident of a jurisdiction where our services are legally available;</li>
                  <li>Provide accurate, current, and complete information;</li>
                  <li>Possess a valid national identification document;</li>
                  <li>Have an active mobile number and/or email address;</li>
                  <li>Meet our internal credit and verification requirements.</li>
                </ul>
                <p>We reserve the right to deny access to any person who does not meet our eligibility requirements.</p>
              </div>
            </div>

            {/* 3. Account Registration */}
            <div className="section">
              <h5 className="section-title">3. Account Registration</h5>
              <div className="section-content">
                <p>To access certain services, you may be required to create an Account.</p>
                <p>By registering, you agree that:</p>
                <ul>
                  <li>All information provided is true, accurate, and complete;</li>
                  <li>You will maintain and promptly update your information;</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials;</li>
                  <li>You are responsible for all activities under your Account;</li>
                  <li>You will notify us immediately of any unauthorized access or suspected breach.</li>
                </ul>
                <p>Yonkopa reserves the right to suspend or terminate Accounts that contain false, misleading, or incomplete information.</p>
              </div>
            </div>

            {/* 4. Loan Applications and Approval */}
            <div className="section">
              <h5 className="section-title">4. Loan Applications and Approval</h5>
              <div className="section-content">
                <p>Submitting a loan application does not guarantee approval.</p>
                <p>All loan applications are subject to:</p>
                <ul>
                  <li>Identity verification;</li>
                  <li>Creditworthiness assessment;</li>
                  <li>Risk evaluation;</li>
                  <li>Internal approval procedures;</li>
                  <li>Submission of any requested documentation.</li>
                </ul>
                <p>Yonkopa reserves the absolute right to approve, decline, or conditionally approve any application without obligation to disclose internal scoring or decision methodology, except where required by law.</p>
                <p>Approved loans shall be governed by a separate Loan Agreement, repayment schedule, and applicable disclosures.</p>
              </div>
            </div>

            {/* 5. Loan Terms */}
            <div className="section">
              <h5 className="section-title">5. Loan Terms</h5>
              <div className="section-content">
                <p>Loan terms, including but not limited to:</p>
                <ul>
                  <li>Principal amount,</li>
                  <li>Interest rate,</li>
                  <li>Processing fees,</li>
                  <li>Tenure,</li>
                  <li>Repayment frequency,</li>
                  <li>Penalties,</li>
                  <li>Applicable charges,</li>
                </ul>
                <p>shall be disclosed to the Borrower before acceptance.</p>
                <p>By accepting a loan offer, the Borrower agrees to repay all outstanding sums in accordance with the agreed repayment schedule.</p>
              </div>
            </div>

            {/* 6. Interest, Fees, and Charges */}
            <div className="section">
              <h5 className="section-title">6. Interest, Fees, and Charges</h5>
              <div className="section-content">
                <p>Borrowers agree that Yonkopa may charge:</p>
                <ul>
                  <li>Interest on approved loans;</li>
                  <li>Administrative or processing fees;</li>
                  <li>Late payment penalties;</li>
                  <li>Default charges;</li>
                  <li>Recovery costs;</li>
                  <li>Applicable taxes and statutory deductions.</li>
                </ul>
                <p>All charges will be disclosed before loan acceptance and may vary depending on the product type, risk category, and applicable law.</p>
                <p>Failure to repay on time may increase the total amount payable.</p>
              </div>
            </div>

            {/* 7. Repayment Obligations */}
            <div className="section">
              <h5 className="section-title">7. Repayment Obligations</h5>
              <div className="section-content">
                <p>Borrowers shall repay all loan obligations on or before the due date.</p>
                <p>Repayment may be made through approved channels including:</p>
                <ul>
                  <li>Mobile money,</li>
                  <li>Bank transfer,</li>
                  <li>Direct debit,</li>
                  <li>Wallet deduction,</li>
                  <li>Any other approved payment method.</li>
                </ul>
                <p>Borrowers are solely responsible for ensuring timely repayment.</p>
                <p>Failure to repay by the due date may result in:</p>
                <ul>
                  <li>Late fees,</li>
                  <li>Accrued penalty interest,</li>
                  <li>Credit reporting,</li>
                  <li>Recovery action,</li>
                  <li>Legal enforcement,</li>
                  <li>Restriction from future borrowing.</li>
                </ul>
                <p>Borrowers are solely responsible for ensuring timely repayment.</p>
              </div>
            </div>

            {/* 8. Default and Recovery */}
            <div className="section">
              <h5 className="section-title">8. Default and Recovery</h5>
              <div className="section-content">
                <p>A Borrower shall be in default if they:</p>
                <ul>
                  <li>Fail to make payment when due;</li>
                  <li>Provide false or misleading information;</li>
                  <li>Breach any loan agreement;</li>
                  <li>Become insolvent or unable to repay;</li>
                  <li>Use funds for unlawful purposes.</li>
                </ul>
                <p>In the event of default, Yonkopa may, to the extent permitted by law:</p>
                <ul>
                  <li>Demand immediate repayment;</li>
                  <li>Suspend access to services;</li>
                  <li>Apply penalties and default interest;</li>
                  <li>Engage third‑party debt recovery agents;</li>
                  <li>Report the default to credit bureaus or regulators;</li>
                  <li>Commence legal proceedings.</li>
                </ul>
                <p>Borrowers shall be liable for all reasonable recovery and enforcement costs.</p>
              </div>
            </div>

            {/* 9. User Responsibilities */}
            <div className="section">
              <h5 className="section-title">9. User Responsibilities</h5>
              <div className="section-content">
                <p>Users agree not to:</p>
                <ul>
                  <li>Use the Platform for unlawful or fraudulent purposes;</li>
                  <li>Submit false, inaccurate, or misleading information;</li>
                  <li>Interfere with the security or operation of the Platform;</li>
                  <li>Attempt unauthorized access to systems or accounts;</li>
                  <li>Reverse engineer, copy, or exploit the Platform;</li>
                  <li>Use the Platform in a manner that harms Yonkopa or other users.</li>
                </ul>
                <p>Users are solely responsible for compliance with applicable laws in connection with their use of the Platform.</p>
              </div>
            </div>

            {/* 10. KYC and Verification */}
            <div className="section">
              <h5 className="section-title">10. KYC and Verification</h5>
              <div className="section-content">
                <p>Yonkopa may conduct Know Your Customer (KYC), Anti‑Money Laundering (AML), fraud prevention, and compliance checks.</p>
                <p>By using our Platform, you consent to:</p>
                <ul>
                  <li>Identity verification;</li>
                  <li>Biometric verification where applicable;</li>
                  <li>Document validation;</li>
                  <li>Credit checks;</li>
                  <li>Transaction monitoring;</li>
                  <li>Risk screening.</li>
                </ul>
                <p>We may request additional documents or information at any time.</p>
                <p>Failure to provide requested verification may result in delayed processing, suspension, or denial of service.</p>
              </div>
            </div>

            {/* 11. Data Protection and Privacy */}
            <div className="section">
              <h5 className="section-title">11. Data Protection and Privacy</h5>
              <div className="section-content">
                <p>Your personal data is processed in accordance with our Privacy Policy and applicable data protection laws.</p>
                <p>By using our Platform, you consent to the collection, use, storage, and processing of your personal information for purposes including:</p>
                <ul>
                  <li>Account creation and administration;</li>
                  <li>Loan processing and servicing;</li>
                  <li>Identity verification;</li>
                  <li>Risk assessment;</li>
                  <li>Customer support;</li>
                  <li>Legal and regulatory compliance;</li>
                  <li>Fraud prevention and debt recovery.</li>
                </ul>
                <p>We implement reasonable technical and organizational safeguards to protect your data.</p>
              </div>
            </div>

            {/* 12. Communications Consent */}
            <div className="section">
              <h5 className="section-title">12. Communications Consent</h5>
              <div className="section-content">
                <p>By using the Platform, you consent to receive communications from Yonkopa via:</p>
                <ul>
                  <li>SMS,</li>
                  <li>Phone calls,</li>
                  <li>Email,</li>
                  <li>Push notifications,</li>
                  <li>WhatsApp (where applicable),</li>
                  <li>In‑app notifications.</li>
                </ul>
                <p>These communications may include:</p>
                <ul>
                  <li>Account alerts,</li>
                  <li>Loan updates,</li>
                  <li>Payment reminders,</li>
                  <li>Legal notices,</li>
                  <li>Promotional content (subject to applicable law).</li>
                </ul>
                <p>You may opt out of marketing communications, but not essential service communications.</p>
              </div>
            </div>

            {/* 13. Intellectual Property */}
            <div className="section">
              <h5 className="section-title">13. Intellectual Property</h5>
              <div className="section-content">
                <p>All rights, title, and interest in the Platform, including all software, branding, content, text, graphics, logos, interfaces, and design elements, are owned by or licensed to Yonkopa.</p>
                <p>Users may not:</p>
                <ul>
                  <li>Copy,</li>
                  <li>Modify,</li>
                  <li>Reproduce,</li>
                  <li>Republish,</li>
                  <li>Distribute,</li>
                  <li>Reverse engineer,</li>
                  <li>Commercially exploit</li>
                </ul>
                <p>any part of the Platform without prior written consent.</p>
              </div>
            </div>

            {/* 14. Service Availability */}
            <div className="section">
              <h5 className="section-title">14. Service Availability</h5>
              <div className="section-content">
                <p>We strive to maintain uninterrupted access to the Platform but do not guarantee continuous or error‑free availability.</p>
                <p>We may suspend, restrict, or discontinue any part of the Platform for:</p>
                <ul>
                  <li>Maintenance,</li>
                  <li>Security,</li>
                  <li>Upgrades,</li>
                  <li>Compliance,</li>
                  <li>Operational reasons.</li>
                </ul>
                <p>Yonkopa shall not be liable for interruptions, delays, or temporary unavailability.</p>
              </div>
            </div>

            {/* 15. Limitation of Liability */}
            <div className="section">
              <h5 className="section-title">15. Limitation of Liability</h5>
              <div className="section-content">
                <p>To the fullest extent permitted by law, Yonkopa shall not be liable for:</p>
                <ul>
                  <li>Indirect, incidental, or consequential damages;</li>
                  <li>Loss of profits, business, data, or reputation;</li>
                  <li>Delays caused by third parties;</li>
                  <li>Service interruptions;</li>
                  <li>Unauthorized access caused by user negligence;</li>
                  <li>Decisions made based on Platform content.</li>
                </ul>
                <p>Our total liability in any claim shall not exceed the amount directly paid by the User to Yonkopa in relation to the specific service giving rise to the claim.</p>
              </div>
            </div>

            {/* 16. Indemnity */}
            <div className="section">
              <h5 className="section-title">16. Indemnity</h5>
              <div className="section-content">
                <p>You agree to indemnify and hold harmless Yonkopa, its directors, employees, agents, affiliates, and partners from any claims, damages, liabilities, losses, and expenses arising from:</p>
                <ul>
                  <li>Your breach of these Terms;</li>
                  <li>Your misuse of the Platform;</li>
                  <li>Your violation of any law or third‑party rights.</li>
                </ul>
              </div>
            </div>

            {/* 17. Suspension and Termination */}
            <div className="section">
              <h5 className="section-title">17. Suspension and Termination</h5>
              <div className="section-content">
                <p>We may suspend or terminate your access to the Platform at any time, with or without notice, where:</p>
                <ul>
                  <li>You breach these Terms;</li>
                  <li>You provide false information;</li>
                  <li>Fraud or suspicious activity is detected;</li>
                  <li>Required by law or regulatory directive.</li>
                </ul>
                <p>Termination does not extinguish outstanding repayment obligations.</p>
              </div>
            </div>

            {/* 18. Complaints and Dispute Resolution */}
            <div className="section">
              <h5 className="section-title">18. Complaints and Dispute Resolution</h5>
              <div className="section-content">
                <p>Users may submit complaints through our official customer support channels.</p>
                <p>We will make reasonable efforts to investigate and resolve disputes promptly.</p>
                <p>Where disputes cannot be resolved amicably, they shall be referred to the competent courts or dispute resolution mechanisms in the applicable jurisdiction.</p>
              </div>
            </div>

            {/* 19. Governing Law */}
            <div className="section">
              <h5 className="section-title">19. Governing Law</h5>
              <div className="section-content">
                <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana.</p>
                <p>Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.</p>
              </div>
            </div>

            {/* 20. Amendments */}
            <div className="section">
              <h5 className="section-title">20. Amendments</h5>
              <div className="section-content">
                <p>Yonkopa reserves the right to amend these Terms at any time.</p>
                <p>Updated Terms shall become effective upon publication on the Platform unless otherwise stated.</p>
                <p>Continued use of the Platform after any update constitutes acceptance of the revised Terms.</p>
              </div>
            </div>

            {/* 21. Force Majeure */}
            <div className="section">
              <h5 className="section-title">21. Force Majeure</h5>
              <div className="section-content">
                <p>Yonkopa shall not be liable for any failure or delay in performance caused by events beyond its reasonable control, including but not limited to:</p>
                <ul>
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
            </div>

            {/* 22. Severability */}
            <div className="section">
              <h5 className="section-title">22. Severability</h5>
              <div className="section-content">
                <p>If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
              </div>
            </div>

            {/* 23. Entire Agreement */}
            <div className="section">
              <h5 className="section-title">23. Entire Agreement</h5>
              <div className="section-content">
                <p>These Terms, together with our Privacy Policy, Loan Agreement, and any related disclosures, constitute the entire agreement between you and Yonkopa regarding use of the Platform.</p>
              </div>
            </div>

            {/* 24. Contact Information */}
            <div className="section">
              <h5 className="section-title">24. Contact Information</h5>
              <div className="section-content">
                <p>Yonkopa Micro Credit Enterprise</p>
                <p>Dunkwa‑on‑Offin, Opposite the Community Center</p>
                <p>Email: <a href="mailto:info@yonkopamicrocredit.com">info@yonkopamicrocredit.com</a></p>
                <p>Website: <a href="https://www.yonkopamicrocredit.com" target="_blank" rel="noopener noreferrer">www.yonkopamicrocredit.com</a></p>
                <p>Tel: 0322291715</p>
                <p>Phone: 0241933741</p>
                <p>For inquiries, complaints, or support, please contact us through the above channels.</p>
              </div>
            </div>

            {/* 25. Default and Publication */}
            <div className="section">
              <h5 className="section-title">25. Default and Publication</h5>
              <div className="section-content">
                <p>The Borrower falls into default if the Borrower fails to comply with the terms of payment.</p>
                <p>In the event of a default, the total amount outstanding on this loan facility inclusive of interest, penalty and other charges for the period agreed herein shall be due immediately and the Lender shall be at liberty to demand payment of same.</p>
                <p>In the event of a default, the Borrower and the Guarantor(s) authorize the Lender to publish their respective names and pictures to the general public.</p>
              </div>
            </div>

            {/* 26. Copyright Notice */}
            <div className="section">
              <h5 className="section-title">26. Copyright Notice</h5>
              <div className="section-content">
                <p>© 2026 Yonkopa Micro Credit Enterprise. All rights reserved.</p>
                <p>All content made available on or through the Platform, including but not limited to text, software, source code, databases, user interfaces, logos, icons, graphics, designs, images, audio, video, documents, trademarks, service marks, and other materials (collectively, “Content”) is the exclusive property of Yonkopa Micro Credit Enterprise or its licensors and is protected under applicable copyright, trademark, intellectual property, and other proprietary laws.</p>
                <p>Except as expressly permitted in writing by Yonkopa Micro Credit Enterprise, no part of the Platform or its Content may be:</p>
                <ul>
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
                <p>in any form or by any means without prior written consent.</p>
                <p>Users are granted a limited, non‑exclusive, non‑transferable, revocable license to access and use the Platform strictly for its intended personal or business purposes in accordance with these Terms.</p>
                <p>Unauthorized use of any Content may violate copyright, trademark, privacy, and other laws and may result in civil and/or criminal liability.</p>
                <p>All trademarks, service marks, trade names, and logos displayed on the Platform are the property of Yonkopa Micro Credit Enterprise or their respective owners. Nothing contained on the Platform shall be construed as granting any license or right to use any trademark without prior written permission from the lawful owner.</p>
                <p>If you believe that any content on the Platform infringes your intellectual property rights, please contact us immediately using the details provided below.</p>
                <p className="fw-semibold">Copyright Contact</p>
                <p>Yonkopa Micro Credit Enterprise</p>
                <p>Dunkwa‑on‑Offin, Opposite the Community Center</p>
                <p>Email: <a href="mailto:info@yonkopamicrocredit.com">info@yonkopamicrocredit.com</a></p>
                <p>Website: <a href="https://www.yonkopamicrocredit.com" target="_blank" rel="noopener noreferrer">www.yonkopamicrocredit.com</a></p>
                <p>Tel: 0322291715</p>
                <p>Phone: 0241933741</p>
              </div>
            </div>

            {/* Final Acknowledgment */}
            <div className="final-acknowledgment">
              By using Yonkopa Micro Credit Enterprise's Platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="accept-btn"
            onClick={handleAccept}
          >
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;