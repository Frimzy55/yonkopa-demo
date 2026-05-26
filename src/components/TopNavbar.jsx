// components/TopNavbar.jsx
import React, { memo, useState, useRef } from 'react';
import { toast } from 'react-toastify';

export const TopNavbar = memo(({
  getDisplayTitle,
  sidebarCollapsed,
  isMobile,
  toggleSidebar,
  isSummaryDropdownOpen,
  setIsSummaryDropdownOpen,
  summaryDropdownRef,
  handleSummarySelect,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  userDropdownRef,
  handleProfile,
  handleSettings,
  handleChangePassword,
  handleUploadPhoto,
  handleLogout
}) => {
  // ===================== STATE FOR MODAL =====================
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef(null);
  const closeTimerRef = useRef(null);

  // ===================== HELPER FUNCTIONS =====================
  const toggleSummaryDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSummaryDropdownOpen(prev => !prev);
  };

  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserDropdownOpen(prev => !prev);
  };

  const openPasswordModal = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setShowPasswordModal(false);
    setPasswordSuccess('');
    setPasswordError('');
  };

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
      await handleChangePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      toast.success('Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      closeTimerRef.current = setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (err) {
      const message = err.message || 'Failed to change password';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

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
      await handleUploadPhoto(file);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      {/* Top Navigation Bar with Gradient */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 px-md-4 py-2 full-width-navbar"
        style={{
          background: 'linear-gradient(120deg, #519dcf 0%, #e31cf5 100%)'
        }}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            {/* Mobile menu toggle */}
            <button
              className="btn btn-outline-light me-2 mobile-menu-toggle"
              onClick={toggleSidebar}
              style={{ display: isMobile ? 'block' : 'none' }}
            >
              <i className="bi bi-list"></i>
            </button>
            {/* Desktop sidebar toggle */}
            <button
              className="btn btn-outline-light d-none d-md-block me-2"
              onClick={toggleSidebar}
              style={{ display: isMobile ? 'none' : 'block' }}
            >
              <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-chevron-left'}`}></i>
            </button>
            {/* Brand / Title - now white for contrast */}
            <span className="navbar-brand mb-0 h5 fw-semibold text-white">
              {getDisplayTitle()}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Portfolio Summary Dropdown */}
            <div className="dropdown" ref={summaryDropdownRef}>
              <button
                className="btn btn-white d-flex align-items-center gap-2 rounded-pill px-3 py-1 border"
                onClick={toggleSummaryDropdown}
                aria-expanded={isSummaryDropdownOpen}
                style={{ backgroundColor: '#fff', color: '#0d6efd' }}
              >
                <i className="bi bi-pie-chart"></i>
                <span className="d-none d-sm-block">Portfolio Summary</span>
                <i className={`bi ${isSummaryDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} small`}></i>
              </button>
              {isSummaryDropdownOpen && (
                <ul className="dropdown-menu show" style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate(0px, 40px)' }}>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('portfolio', 'Portfolio Summary')}><i className="bi bi-briefcase"></i> Portfolio Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('loan', 'Loan Summary')}><i className="bi bi-piggy-bank"></i> Loan Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('teller', 'Teller Summary')}><i className="bi bi-cash-stack"></i> Teller Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('risk', 'Risk Summary')}><i className="bi bi-exclamation-triangle"></i> Risk Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('authorization', 'Authorization Summary')}><i className="bi bi-shield-lock"></i> Authorization Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('revenue', 'Revenue vs Expense Summary')}><i className="bi bi-graph-up"></i> Revenue Against Expense Summary</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleSummarySelect('kyc', 'KYC Summary')}><i className="bi bi-shield-check"></i> KYC Summary</button></li>
                </ul>
              )}
            </div>

            {/* Notification Bell */}
            <button className="btn btn-light position-relative rounded-circle p-2">
              <i className="bi bi-bell fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
            </button>

            {/* Admin User Dropdown */}
            <div className="dropdown" ref={userDropdownRef}>
              <button
                className="btn btn-light d-flex align-items-center gap-2 rounded-pill px-2 px-md-3 py-1"
                onClick={toggleUserDropdown}
                aria-expanded={isUserDropdownOpen}
              >
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '32px', height: '32px' }}>
                  <i className="bi bi-person-fill"></i>
                </div>
                <span className="d-none d-sm-block">Admin User</span>
                <i className={`bi ${isUserDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} small d-none d-sm-block`}></i>
              </button>
              {isUserDropdownOpen && (
                <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate(0px, 45px)' }}>
                  <li><button className="dropdown-item" onClick={handleProfile}><i className="bi bi-person me-2"></i>Profile</button></li>
                  <li><button className="dropdown-item" onClick={openPasswordModal}><i className="bi bi-key me-2"></i>Change Password</button></li>
                  <li><button className="dropdown-item" onClick={triggerFileUpload}><i className="bi bi-camera me-2"></i>Upload Photo</button></li>
                  <li><button className="dropdown-item" onClick={handleSettings}><i className="bi bi-gear me-2"></i>Settings</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileSelect}
      />

      {/* Change Password Modal (unchanged) */}
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
                  onClick={handleClosePasswordModal}
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
                    onClick={handleClosePasswordModal}
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