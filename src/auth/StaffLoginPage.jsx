// src/auth/StaffLoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import myImage from '../image/image1.jpg';
import logo from '../image/yonko1.jpeg';
import christmasTree from '../image/cha.png';
import { FaEye, FaEyeSlash, FaClock } from 'react-icons/fa';
import './LoginPage.css';

//const StaffLoginPage = ({ onClose }) => {
  const StaffLoginPage = ({ onClose, apiUrl }) => {
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

  // Modal for inactivity logout message
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutModalMessage, setLogoutModalMessage] = useState("");

  // Show Christmas elements for Dec 24 - Jan 4
  useEffect(() => {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();
    if ((month === 11 && date >= 24 && date <= 31) || (month === 0 && date >= 1 && date <= 4)) {
      setShowChristmasTree(true);
    }
  }, []);

  // Watch for logout message from AutoLogout and show modal
  useEffect(() => {
    if (location.state?.message) {
      setLogoutModalMessage(location.state.message);
      setShowLogoutModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // ------------------- VALIDATION (NO EMAIL/PHONE CHECK) -------------------
  // Always returns no error for identifier
 /// const validateIdentifier = () => {
   /// return ''; // No validation – any input is accepted
  //};

  // Login validation – only password is checked
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'identifier') {
      // No validation – always delete any existing error
      delete newErrors.identifier;
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
        else if (user.role === 'master_till') navigate('/master-till-dashboard');
      else navigate('/customer-page');

      if (onClose) onClose();
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

  // Forgot password handlers – also no validation on identifier
  const handleForgotIdentifierChange = (e) => {
    setForgotIdentifier(e.target.value);
    if (forgotError) setForgotError('');
    if (forgotSuccess) setForgotSuccess('');
    if (forgotTouched) setForgotTouched(false);
  };

  const handleForgotBlur = () => {
    setForgotTouched(true);
    if (!forgotIdentifier.trim()) {
      setForgotError('Email or phone number is required');
    } else {
      // No format validation – clear any existing error
      setForgotError('');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Email or phone number is required');
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
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            {showChristmasTree && (
              <img src={christmasTree} alt="Christmas Tree" className="tree-on-logo" />
            )}
          </div>

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
              {serverError && <div className="server-error">{serverError}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.identifier && errors.identifier ? 'input-error' : ''}
                    placeholder="Enter Username"
                    disabled={isSubmitting}
                  />
                  {touched.identifier && errors.identifier && (
                    <span className="error-message">{errors.identifier}</span>
                  )}
                </div>

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
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {touched.password && errors.password && (
                    <span className="error-message">{errors.password}</span>
                  )}
                </div>

                <div className="forgot-password-link">
                  <button type="button" className="link-button" onClick={() => setShowForgotPassword(true)}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={!canSubmit} className={`btn-login ${isSubmitting ? 'loading' : ''}`}>
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

      {/* MODAL FOR INACTIVITY LOGOUT MESSAGE */}
      {showLogoutModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '90%',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              transform: 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              }}
            >
              <FaClock size={36} color="#fff" />
            </div>
            <h3
              style={{
                fontSize: '1.8rem',
                fontWeight: 600,
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #2c3e50, #3498db)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Session Expired
            </h3>
            <p
              style={{
                fontSize: '1rem',
                color: '#4a5568',
                marginBottom: '28px',
                lineHeight: 1.5,
              }}
            >
              {logoutModalMessage || 'Logged out due to inactivity'}
            </p>
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StaffLoginPage;