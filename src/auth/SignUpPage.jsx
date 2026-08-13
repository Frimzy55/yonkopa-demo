import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TermsModal from "./TermsModal";
import logo from "../image/yonko1.jpeg";

const SignUpPage = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState({});

  const getFieldClass = (name) => {
    if (!touched[name]) return "";
    if (errors[name]) return "is-invalid";
    return "is-valid";
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Full name is required";
        } else {
          const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
          if (!nameRegex.test(value.trim())) {
            newErrors.fullName = "Enter the correct name (e.g., John Doe)";
          } else {
            delete newErrors.fullName;
          }
        }
        break;

      case "identifier":
        if (!value) {
          newErrors.identifier = "Email or phone number is required";
        } else {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const cleaned = value.replace(/\D/g, "");
          const isPhone = /^\d{10,12}$/.test(cleaned);

          if (!isEmail && !isPhone) {
            newErrors.identifier = "Enter a valid email or phone number (10-12 digits)";
          } else {
            delete newErrors.identifier;
          }
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain uppercase, lowercase, and a number";
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) setErrors(validateField(name, value));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors(validateField(name, value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationMessage("");
    setMessage("");
    setIsSubmitting(true);

    if (!agreeToTerms) {
      setValidationMessage("You must agree to the Terms and Conditions to create an account.");
      setIsSubmitting(false);
      return;
    }

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors = { ...newErrors, ...validateField(key, formData[key]) };
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationMessage("Please fill all forms before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, agreeToTerms }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({
          name: formData.fullName,
          email: formData.identifier,
          message: data.message || "Account created successfully!",
        });
        setShowSuccessPopup(true);

        setTimeout(() => {
          setShowSuccessPopup(false);
          setTimeout(() => {
            onClose();
            onSwitchToLogin();
          }, 500);
        }, 5000);
      } else {
        setMessage(data.message || "Error creating account. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to connect to server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-4 shadow-lg d-flex flex-column"
        style={{
          width: "480px",
          maxWidth: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Header – sticky */}
        <div className="d-flex justify-content-between align-items-center p-4 pb-3 border-bottom flex-shrink-0">
          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="Yonkopa" style={{ height: "44px", objectFit: "contain" }} />
            <h4 className="m-0 fw-semibold text-primary">Create Account</h4>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 pt-0 overflow-y-auto" style={{ flex: "1 1 auto" }}>
          <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
            Join Yonkopa to access quick and affordable loans
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-secondary"></i>
                </span>
                <input
                  type="text"
                  name="fullName"
                  className={`form-control border-start-0 ${getFieldClass("fullName")}`}
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {touched.fullName && errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>
            </div>

            {/* Email / Phone */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-secondary"></i>
                </span>
                <input
                  type="text"
                  name="identifier"
                  className={`form-control border-start-0 ${getFieldClass("identifier")}`}
                  placeholder="Email or Phone Number"
                  value={formData.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                {touched.identifier && errors.identifier && (
                  <div className="invalid-feedback">{errors.identifier}</div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-secondary"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control border-start-0 ${getFieldClass("password")}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <span
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                </span>
                {touched.password && errors.password && (
                  <div className="invalid-feedback d-block">{errors.password}</div>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-secondary"></i>
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`form-control border-start-0 ${getFieldClass("confirmPassword")}`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <span
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                </span>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {/* Messages */}
            {message && message.includes("success") && (
              <div className="alert alert-success text-center py-2 rounded-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
              </div>
            )}
            {message && !message.includes("success") && (
              <div className="alert alert-danger text-center py-2 rounded-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {message}
              </div>
            )}
            {validationMessage && (
              <div className="alert alert-warning text-center py-2 rounded-3">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {validationMessage}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="mb-4">
              <div className="form-check d-flex align-items-start gap-2">
                <input
                  type="checkbox"
                  className="form-check-input mt-1"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={isSubmitting}
                  style={{
                    width: "1.2rem",
                    height: "1.2rem",
                    border: "2px solid #6c757d",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label className="form-check-label small" htmlFor="agreeToTerms">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-primary text-decoration-none fw-semibold"
                    onClick={() => setShowTermsModal(true)}
                    style={{ fontSize: "inherit" }}
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>
            </div>

            {/* Create Account button */}
            <button
              type="submit"
              className="btn btn-orange w-100 py-2 fw-semibold rounded-pill"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Sticky Footer – fixed text color to be visible */}
        <div
          className="border-top p-3 text-center flex-shrink-0"
          style={{
            backgroundColor: "#f8f9fa",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
            color: "#212529", // dark text
          }}
        >
          <p className="mb-0 small" style={{ color: "#212529" }}>
            Already have an account?{" "}
            <button
              className="btn btn-link p-0 text-primary fw-semibold"
              onClick={onSwitchToLogin}
              style={{ fontSize: "inherit", textDecoration: "underline" }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1070 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 text-center"
            style={{ width: "400px", maxWidth: "90%", animation: "slideIn 0.3s ease-out" }}
          >
            <div className="mb-3">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
              </div>
            </div>
            <h4 className="fw-bold mb-2">Welcome, {successData.name?.split(" ")[0]}!</h4>
            <p className="text-muted mb-3">{successData.message}</p>
            <div className="alert alert-success bg-light border-0">
              <i className="bi bi-envelope-fill me-2"></i>
              <small>Verification link sent to {successData.email}</small>
            </div>
            <div className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted small mt-2">Redirecting to login...</p>
          </div>
        </div>
      )}

      <TermsModal show={showTermsModal} onClose={() => setShowTermsModal(false)} />

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SignUpPage;