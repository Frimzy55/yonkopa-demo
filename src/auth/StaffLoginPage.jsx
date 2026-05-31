// src/components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import myImage from '../image/image1.jpg';
import logo from '../image/yonko.png';
import christmasTree from '../image/cha.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Login form state
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChristmasTree, setShowChristmasTree] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotTouched, setForgotTouched] = useState(false);

  // logout message from AutoLogout
  const logoutMessage = location.state?.message || '';

  // Show Christmas elements for Dec 24-31 (month 11 = December)
  useEffect(() => {
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() >= 24 && today.getDate() <= 31) {
      setShowChristmasTree(true);
    }
  }, []);

  // Helper: validate email/phone
  const validateIdentifier = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email or phone number is required';

    const digits = trimmed.replace(/\D/g, '');
    const isValidPhone = digits.length === 10 || (digits.length === 12 && digits.startsWith('233'));
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isValidEmail && !isValidPhone) {
      return 'Enter a valid email or 10-digit phone number';
    }
    return '';
  };

  // Login validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'identifier') {
      const error = validateIdentifier(value);
      if (error) newErrors.identifier = error;
      else delete newErrors.identifier;
    }

    if (name === 'password') {
      if (!value) newErrors.password = 'Password is required';
      else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else delete newErrors.password;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (serverError) setServerError('');
    if (touched[name]) setErrors(validateField(name, value));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors(validateField(name, value));
  };

  const validateForm = () => {
    const newTouched = {};
    const newErrors = {};

    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
      Object.assign(newErrors, validateField(field, formData[field]));
    });

    setTouched(newTouched);
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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login2`,
        formData
      );

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'loan_officer') navigate('/loan-officer-dashboard');
      else if (user.role === 'manager') navigate('/loan-manager');
      else if (user.role === 'supervisor') navigate('/loan-supervisor');
      else navigate('/customer-page');

      onClose && onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Try again.');
      setTimeout(() => setServerError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    Object.keys(errors).length === 0 &&
    formData.identifier &&
    formData.password &&
    !isSubmitting;

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
    <div className="login-page">
      {/* LEFT IMAGE WITH TEXT OVERLAY */}
      <div className="login-image">
        <img src={myImage} alt="Background" />
        <div className="image-overlay-text">
          <h1>Yonkopa</h1>
          <p>Micro Credit</p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="login-form-container">
        <div className="login-form-card">
          {/* Logo container with Christmas tree on top */}
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            {showChristmasTree && (
              <img src={christmasTree} alt="Christmas Tree" className="tree-on-logo" />
            )}
          </div>

          {/* Christmas greeting (only during holiday period) */}
          {showChristmasTree && (
            <div className="christmas-greeting">
              <span className="greeting-icon">🎄</span>
              <span className="greeting-text">Merry Christmas &amp; Happy New Year!</span>
              <span className="greeting-icon">🎁</span>
            </div>
          )}

          {!showForgotPassword ? (
            // LOGIN FORM
            <>
              <h2 className="login-title">Login</h2>

              {/* Auto logout message */}
              {logoutMessage && (
                <div
                  className="server-error"
                  style={{
                    background: '#fff3cd',
                    color: '#856404',
                    border: '1px solid #ffeeba'
                  }}
                >
                  {logoutMessage}
                </div>
              )}

              {serverError && (
                <div className="server-error">{serverError}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Identifier */}
                <div className="form-group">
                  <label>Email or Phone</label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.identifier && errors.identifier ? 'input-error' : ''}
                    placeholder="Enter email or phone"
                    disabled={isSubmitting}
                  />
                  {touched.identifier && errors.identifier && (
                    <span className="error-message">{errors.identifier}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.password && errors.password ? 'input-error' : ''}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {touched.password && errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                {/* Forgot password link */}
                <div className="forgot-password-link">
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`btn-login ${isSubmitting ? 'loading' : ''}`}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            // FORGOT PASSWORD FORM
            <>
              <h2 className="login-title">Reset Password</h2>
              <p className="reset-instruction">
                Enter your email or phone number and we'll send you a link to reset your password.
              </p>

              {forgotError && (
                <div className="server-error" style={{ background: '#f8d7da', color: '#721c24' }}>
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="server-error" style={{ background: '#d4edda', color: '#155724' }}>
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} noValidate>
                <div className="form-group">
                  <label>Email or Phone Number</label>
                  <input
                    type="text"
                    className={forgotTouched && forgotError ? 'input-error' : ''}
                    placeholder="Enter your email or phone number"
                    value={forgotIdentifier}
                    onChange={handleForgotIdentifierChange}
                    onBlur={handleForgotBlur}
                    disabled={isForgotSubmitting}
                  />
                  {forgotTouched && forgotError && (
                    <span className="error-message">{forgotError}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`btn-login ${isForgotSubmitting ? 'loading' : ''}`}
                  disabled={isForgotSubmitting || !forgotIdentifier.trim()}
                >
                  {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  className="btn-back-to-login"
                  onClick={handleBackToLogin}
                  disabled={isForgotSubmitting}
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;