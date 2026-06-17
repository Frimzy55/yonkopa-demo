import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../image/yonko1.jpeg';
import "bootstrap-icons/font/bootstrap-icons.css";

const LoginPage = ({ onClose, onSwitchToSignUp }) => {
  const navigate = useNavigate();

  // Login form state
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotTouched, setForgotTouched] = useState(false);

  // Validation helpers
  const validateIdentifier = (value) => {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, '');
    const isValidPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith('233'));
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!trimmed) return 'Email or phone number is required';
    if (!isValidEmail && !isValidPhone) return 'Enter a valid email or 10-digit phone number';
    return '';
  };

  // Login validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'identifier':
        const identifierError = validateIdentifier(value);
        if (identifierError) newErrors.identifier = identifierError;
        else delete newErrors.identifier;
        break;
      case 'password':
        if (!value) newErrors.password = 'Password is required';
        else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters';
        else delete newErrors.password;
        break;
      default: break;
    }
    return newErrors;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors(validateField(name, value));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (serverError) setServerError('');
    if (touched[name]) setErrors(validateField(name, value));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      Object.assign(newErrors, validateField(field, formData[field]));
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, formData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/admin-dashboard");
      else if (user.role === "loan_officer") navigate("/loan-officer-dashboard");
      else navigate("/customer-page");

      onClose && onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setServerError(errorMessage);
      setTimeout(() => setServerError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Object.keys(errors).length === 0 && formData.identifier && formData.password && !isSubmitting;

  // Forgot password handlers
  const handleForgotIdentifierChange = (e) => {
    setForgotIdentifier(e.target.value);
    if (forgotError) setForgotError('');
    if (forgotSuccess) setForgotSuccess('');
    if (forgotTouched) setForgotTouched(false);
  };

  const handleForgotBlur = () => {
    setForgotTouched(true);
    if (forgotIdentifier.trim()) {
      const error = validateIdentifier(forgotIdentifier);
      setForgotError(error);
    } else {
      setForgotError('Email or phone number is required');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    
    const error = validateIdentifier(forgotIdentifier);
    if (error) {
      setForgotError(error);
      setForgotTouched(true);
      return;
    }

    setIsForgotSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/forgot-password`, { 
        identifier: forgotIdentifier.trim() 
      });
      setForgotSuccess('Password reset link sent! Check your email or SMS.');
      setForgotIdentifier('');
      setForgotTouched(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setForgotError(message);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotIdentifier('');
    setForgotError('');
    setForgotSuccess('');
    setForgotTouched(false);
  };

  return (
    <div className="bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '440px', width: '100%' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="Yonkopa" style={{ height: '40px', objectFit: 'contain' }} />
          <h4 className="m-0 fw-semibold">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h4>
        </div>
        <button className="btn-close" onClick={onClose} aria-label="Close"></button>
      </div>

      {!showForgotPassword ? (
        // LOGIN FORM
        <>
          <p className="text-muted mb-4">Sign in to access your account</p>

          {serverError && (
            <div className="alert alert-danger py-2 small">{serverError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email or Phone */}
            <div className="mb-3">
              <label className="form-label fw-medium">Email or Phone Number</label>
              <input 
                type="text" 
                name="identifier"
                className={`form-control ${touched.identifier && errors.identifier ? 'is-invalid' : ''}`}
                placeholder="Enter your email or phone number"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
              />
              {touched.identifier && errors.identifier && (
                <div className="invalid-feedback">{errors.identifier}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-medium">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <span
                  className="input-group-text bg-white border-start-0"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-secondary`}></i>
                </span>
              </div>
              {touched.password && errors.password && (
                <div className="invalid-feedback d-block">{errors.password}</div>
              )}
            </div>

            {/* Options */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" disabled={isSubmitting} />
                <label className="form-check-label small" htmlFor="rememberMe">Remember me</label>
              </div>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small"
                onClick={() => setShowForgotPassword(true)}
                style={{ fontSize: '0.875rem' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold rounded-pill"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-4 mb-0">
            Don't have an account?{' '}
            <button 
              className="btn btn-link p-0 text-primary text-decoration-none"
              onClick={onSwitchToSignUp}
            >
              Create Account
            </button>
          </p>
        </>
      ) : (
        // FORGOT PASSWORD FORM
        <>
          <p className="text-muted mb-4">
            Enter your email or phone number and we'll send you a link to reset your password.
          </p>

          {forgotError && (
            <div className="alert alert-danger py-2 small">{forgotError}</div>
          )}
          {forgotSuccess && (
            <div className="alert alert-success py-2 small">{forgotSuccess}</div>
          )}

          <form onSubmit={handleForgotSubmit} noValidate>
            <div className="mb-4">
              <label className="form-label fw-medium">Email or Phone Number</label>
              <input
                type="text"
                className={`form-control ${forgotTouched && forgotError ? 'is-invalid' : ''}`}
                placeholder="Enter your email or phone number"
                value={forgotIdentifier}
                onChange={handleForgotIdentifierChange}
                onBlur={handleForgotBlur}
                disabled={isForgotSubmitting}
              />
              {forgotTouched && forgotError && (
                <div className="invalid-feedback d-block">{forgotError}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold rounded-pill mb-3"
              disabled={isForgotSubmitting || !forgotIdentifier.trim()}
            >
              {isForgotSubmitting ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 py-2 fw-semibold rounded-pill"
              onClick={handleBackToLogin}
              disabled={isForgotSubmitting}
            >
              Back to Login
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default LoginPage;