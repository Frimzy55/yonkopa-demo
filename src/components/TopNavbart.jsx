// components/TopNavbar.jsx
import React, { memo, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const TopNavbar = memo(({
  getDisplayTitle,
  sidebarCollapsed,
  isMobile,
  toggleSidebar,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  userDropdownRef,
  handleProfile,
  handleLogout,
  user = {},
  currentDateTime = null,
  onProfileUpdate = null
}) => {

  // =========================
  // STATE
  // =========================
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto close timer ref
  const closeTimerRef = useRef(null);

  // File upload ref
  const fileInputRef = useRef(null);

  // =========================
  // ENV API URL
  // =========================
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // =========================
  // USER DISPLAY
  // =========================
  const displayName = user?.full_name || user?.fullName || user?.username || 'Staff Member';

  // =========================
  // AVATAR URL
  // =========================
  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${API_URL}${user.avatar}`
    : null;

  // =========================
  // TOGGLE USER DROPDOWN
  // =========================
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserDropdownOpen(prev => !prev);
  };

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setPasswordSuccess('');
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?.userId) {
        setPasswordError('User session expired');
        return;
      }

      const response = await axios.post(`${API_URL}/api/change-staff-password`, {
        userId: storedUser.userId,
        currentPassword,
        newPassword
      });

      const successMsg = response.data.message || 'Password changed successfully!';
      setPasswordSuccess(successMsg);
      toast.success(successMsg);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      closeTimerRef.current = setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
        setPasswordError('');
      }, 2000);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  // =========================
  // PROFILE IMAGE UPLOAD
  // =========================
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_URL}/api/upload-profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message || 'Profile image updated');
      if (onProfileUpdate) onProfileUpdate(response.data.imageUrl);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* =========================
          NAVBAR WITH GRADIENT
      ========================== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 px-md-4 py-2 full-width-navbar"
        style={{
          background: 'linear-gradient(120deg, #3572a7 0%, #00f2fe 100%)'
        }}
      >
        <div className="container-fluid">
          {/* LEFT */}
          <div className="d-flex align-items-center">
            {/* Mobile Toggle */}
            <button
              className="btn btn-outline-light me-2 mobile-menu-toggle"
              onClick={toggleSidebar}
              style={{ display: isMobile ? 'block' : 'none' }}
            >
              <i className="bi bi-list"></i>
            </button>
            {/* Desktop Toggle */}
            <button
              className="btn btn-outline-light d-none d-md-block me-2"
              onClick={toggleSidebar}
              style={{ display: isMobile ? 'none' : 'block' }}
            >
              <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-chevron-left'}`}></i>
            </button>
            {/* Title */}
            <span className="navbar-brand mb-0 h5 fw-semibold text-white">
              {getDisplayTitle()}
            </span>
          </div>

          {/* RIGHT */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Date Time */}
            {currentDateTime && (
              <div className="d-none d-md-block">
                <div className="bg-primary text-white px-3 py-1 rounded-pill small fw-semibold">
                  <i className="bi bi-clock me-2"></i>
                  {currentDateTime}
                </div>
              </div>
            )}

            {/* Notifications */}
            <button className="btn btn-light position-relative rounded-circle p-2">
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
            </button>

            {/* USER DROPDOWN */}
            <div className="dropdown" ref={userDropdownRef}>
              <button
                className="btn btn-light d-flex align-items-center gap-2 rounded-pill px-2 px-md-3 py-1"
                onClick={toggleUserDropdown}
                aria-expanded={isUserDropdownOpen}
              >
                {/* Avatar */}
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white overflow-hidden"
                  style={{ width: '32px', height: '32px' }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                {/* Name */}
                <span className="d-none d-sm-block">{displayName}</span>
                {/* Arrow */}
                <i className={`bi ${isUserDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} small d-none d-sm-block`}></i>
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <ul
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate(0px, 45px)' }}
                >
                  <li>
                    <button className="dropdown-item" onClick={handleProfile}>
                      <i className="bi bi-person me-2"></i>Profile
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={openPasswordModal}>
                      <i className="bi bi-key me-2"></i>Change Password
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={triggerFileUpload}>
                      <i className="bi bi-camera me-2"></i>Upload Profile Image
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileSelect}
      />

      {/* =========================
          CHANGE PASSWORD MODAL
      ========================== */}
      {showPasswordModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-key me-2"></i>Change Password
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmitPasswordChange}>
                <div className="modal-body">
                  {passwordSuccess && (
                    <div className="alert alert-success d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && !passwordSuccess && (
                    <div className="alert alert-danger py-2">{passwordError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <div className="input-group">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={!!passwordSuccess}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <i className={`bi ${showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={!!passwordSuccess}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <small className="text-muted">Minimum 6 characters</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={!!passwordSuccess}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !!passwordSuccess}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

TopNavbar.displayName = 'TopNavbar';