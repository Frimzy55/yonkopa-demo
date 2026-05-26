import React, { useEffect, useState, useRef } from 'react';
import './CustomerDashboard.css';
import { useNavigate } from "react-router-dom";

import DashboardHome from './CustomerDashboardHome';
import NotificationsSupport from './CustomerNotificationsSupport';
import CustomerCompleteKyc from './CustomerCompleteKyc';
import CustomerKycDetails from './CustomerKycDetails';
import CustomerApplyLoan from './CustomerApplyLoan';
import CustomerLoanStatus from './CustomerLoanStatus';
import CustomerRepayloan from './CustomerRepayloan';
import AvatarDropdown from './AvatarDropdown';

import notificationSoundFile from '../sounds/notifications.mp3';
import bellSoundFile from '../sounds/new-notification.wav';

import {
  FaBell,
  FaIdCard,
  FaCheckCircle,
  FaMoneyBillWave,
  FaSyncAlt,
  FaUserCog,
  FaSignOutAlt,
  FaHome,
  FaBars,
  FaTimes,
  FaTimesCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const CustomerView = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('kyc');
  const [notifications, setNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const prevNotificationsRef = useRef(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  
  // Password visibility toggles
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const notificationSound = useRef(null);
  const bellSound = useRef(null);
  const audioContextRef = useRef(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Initialize custom audio
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      notificationSound.current = new Audio(notificationSoundFile);
      bellSound.current = new Audio(bellSoundFile);
      notificationSound.current.volume = 0.8;
      bellSound.current.volume = 0.8;
      notificationSound.current.load();
      bellSound.current.load();
    } catch (error) {
      console.error("Failed to load custom sounds:", error);
      notificationSound.current = { play: () => {} };
      bellSound.current = { play: () => {} };
    }
  }, []);

  // Unlock audio on user interaction
  useEffect(() => {
    const unlockAudio = async () => {
      if (!audioUnlocked && audioContextRef.current) {
        try {
          await audioContextRef.current.resume();
          setAudioUnlocked(true);
        } catch (err) {
          console.log("Audio unlock failed:", err);
        }
      }
      const dummyAudio = new Audio();
      dummyAudio.play().catch(e => console.log("Dummy audio unlock attempt:", e));
    };
    
    const handleUserInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
    
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audioUnlocked]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications periodically and play sound for new ones
  useEffect(() => {
    if (!user?.userId) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.status === 403) {
          console.error("Authentication failed for notifications");
          return;
        }
        
        const data = await res.json();
        const unreadCount = data.filter(n => n.isRead === 0).length;

        if (unreadCount > prevNotificationsRef.current && audioUnlocked && notificationSound.current) {
          notificationSound.current.currentTime = 0;
          notificationSound.current.play().catch(err => console.log("Notification sound play error:", err));
        }

        prevNotificationsRef.current = unreadCount;
        setNotifications(unreadCount);

      } catch (error) {
        console.error("Notification fetch error:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, audioUnlocked]);

  // Fetch avatar
  useEffect(() => {
    if (!user?.userId) return;
    const fetchAvatar = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/kyc/avatar/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.status === 403) return;
        const data = await res.json();
        if (data?.avatar) setAvatar(data.avatar);
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };
    fetchAvatar();
  }, [user]);

  const playBellSound = () => {
    if (bellSound.current && audioUnlocked) {
      try {
        bellSound.current.currentTime = 0;
        bellSound.current.play().catch(err => console.log("Bell sound play error:", err));
      } catch (err) {
        console.log("Bell sound play error:", err);
      }
    }
  };

  const menuItems = [
    { id: 'kyc', label: 'Complete KYC', icon: <FaIdCard />, description: 'Complete KYC And Profile', color: '#e67e22' },
    { id: 'loan', label: 'Apply For Loan', icon: <FaCheckCircle />, description: 'Apply For Loan', color: '#e67e22' },
    { id: 'loanStatus', label: 'Loan Status', icon: <FaMoneyBillWave />, description: 'View and manage loans', color: '#e67e22' },
    { id: 'loanrepay', label: 'Repay Loan', icon: <FaSyncAlt />, description: 'Transaction history', color: '#e67e22' },
    { id: 'profile', label: 'Notifications', icon: <FaUserCog />, description: 'Personal settings', color: '#e67e22' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'kyc': return <CustomerCompleteKyc user={user} />;
      case 'viewKyc': return <CustomerKycDetails user={user} />;
      case 'loan': return <CustomerApplyLoan user={user} />;
      case 'loanStatus': return <CustomerLoanStatus user={user} onApplyLoan={() => setActiveMenu('loan')} />;
      case 'loanrepay': return <CustomerRepayloan user={user} />;
      case 'profile': return <NotificationsSupport user={user} />;
      default: return <DashboardHome user={user} />;
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/apply');
  };

  const handleMenuClick = (itemId) => {
    setActiveMenu(itemId);
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = async () => {
    playBellSound();
    if (!user?.userId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/mark-read/${user.userId}`, { 
        method: "PUT",
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Error marking notifications:", error);
    }
    setNotifications(0);
    setActiveMenu('profile');
    setMobileMenuOpen(false);
  };

  const handleAvatarClick = () => setShowDropdown(!showDropdown);
  const handleViewKyc = () => { setActiveMenu('viewKyc'); setShowDropdown(false); };
  
  // Open password modal (called from dropdown)
  const openPasswordModal = () => {
    setShowDropdown(false);
    setPwdError("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPwd(false);
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setShowPasswordModal(true);
  };

  // Handle password change submission
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters");
      return;
    }

    setLoadingPwd(true);
    setPwdError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId,
          oldPassword,
          newPassword,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setPwdError(data.message || "Password change failed");
        return;
      }

      setToast({
        show: true,
        message: "Password updated successfully!",
        type: "success"
      });
      
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPwdError("Server error. Please try again later.");
    } finally {
      setLoadingPwd(false);
    }
  };

  const displayName = user?.fullName || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}

      {/* GRADIENT TOP BAR */}
      <header 
        className="top-bar" 
        style={{ 
          background: 'linear-gradient(120deg, #3ba4fa 0%, #4539f1 100%)',
          color: '#fff'
        }}
      >
        <div className="top-bar-left">
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="dashboard-title" style={{ color: '#fff' }}>
            <FaHome className="home-icon" />
            <span className="user-name">{firstName}</span>
          </h1>
        </div>
        <div className="top-bar-right">
          <div className={`notification-bell ${notifications > 0 ? 'has-notification' : ''}`} onClick={handleNotificationClick}>
            <FaBell size={20} className="bell-icon" />
            <span className={`notification-badge ${notifications > 0 ? "show" : "hide"}`}>
              {notifications > 99 ? '99+' : notifications}
            </span>
          </div>
          
          {/* Avatar with chevron */}
          <div className="user-avatar">
            <div 
              onClick={handleAvatarClick} 
              style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#fff" }}
            >
              {avatar ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL.replace(/\/$/, "")}/uploads/${avatar}`} 
                  alt="avatar" 
                  className="avatar-img" 
                />
              ) : (
                <div className="avatar-placeholder">{firstName?.charAt(0)}</div>
              )}
              <span className="avatar-chevron" style={{ color: "#fff" }}>▼</span>
            </div>
            {showDropdown && (
              <AvatarDropdown
                userId={user?.userId}
                onClose={() => setShowDropdown(false)}
                onChangePassword={openPasswordModal}
                onViewKyc={handleViewKyc}
              />
            )}
          </div>

          {/* Logout button - styled for gradient background */}
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff"
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Password Change Modal with toggle visibility */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <FaTimesCircle className="close-icon" onClick={() => setShowPasswordModal(false)} />
            </div>
            <div className="modal-body">
              {pwdError && <div className="error-message">{pwdError}</div>}
              
              <div className="input-group">
                <label>Old Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showOldPwd ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="toggle-pwd-btn" onClick={() => setShowOldPwd(!showOldPwd)}>
                    {showOldPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button type="button" className="toggle-pwd-btn" onClick={() => setShowNewPwd(!showNewPwd)}>
                    {showNewPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button type="button" className="toggle-pwd-btn" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                    {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleChangePassword} disabled={loadingPwd}>
                {loadingPwd ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <nav className={`sidebar-cards ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="menu-cards-grid">
            {menuItems.map(item => {
              const isDisabled = ['loanrepay', 'profile'].includes(item.id);
              return (
                <div key={item.id} 
                     className={`menu-card ${activeMenu === item.id ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                     onClick={() => !isDisabled && handleMenuClick(item.id)}
                     style={{ borderLeftColor: item.color }}>
                  <div className="menu-card-icon" style={{ backgroundColor: item.color }}>{item.icon}</div>
                  <div className="menu-card-content">
                    <h4>{item.label}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="menu-card-arrow">→</div>
                </div>
              );
            })}
          </div>
        </nav>
        <main className="main-content">
          {user ? renderContent() : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your profile...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerView;