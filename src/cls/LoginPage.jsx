import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../image/yonko.png';
import "bootstrap-icons/font/bootstrap-icons.css";

const LoginPage = ({ onClose, onSwitchToSignUp }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'identifier':
        const trimmed = value.trim();
        const digits = trimmed.replace(/\D/g, '');
        const isValidPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith('233'));
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

        if (!trimmed) {
          newErrors.identifier = 'Email or phone is required';
        } else if (!isValidEmail && !isValidPhone) {
          newErrors.identifier = 'Enter a valid email or 10-digit phone number';
        } else {
          delete newErrors.identifier;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;

      default:
        break;
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

  return (
    <div className="bg-white rounded-4 shadow-lg p-4" style={{ maxWidth: '440px', width: '100%' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="Yonkopa" style={{ height: '40px', objectFit: 'contain' }} />
          <h4 className="m-0 fw-semibold">Welcome Back</h4>
        </div>
        <button className="btn-close" onClick={onClose} aria-label="Close"></button>
      </div>

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
          <a href="/forgot-password" className="text-decoration-none small">Forgot password?</a>
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
    </div>
  );
};

export default LoginPage;