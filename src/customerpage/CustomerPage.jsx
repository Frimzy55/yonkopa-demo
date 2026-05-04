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
  FaTimes
} from "react-icons/fa";

const CustomerView = () => {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('kyc');
  const [notifications, setNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const prevNotificationsRef = useRef(0);

  const notificationAudio = useRef(null); // Audio element ref
  const [audioUnlocked, setAudioUnlocked] = useState(false); // Unlock audio for autoplay

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Unlock audio on first click anywhere
  useEffect(() => {
    const unlockAudio = () => {
      if (notificationAudio.current && !audioUnlocked) {
        notificationAudio.current.play().catch(() => {});
        notificationAudio.current.pause();
        notificationAudio.current.currentTime = 0;
        setAudioUnlocked(true);
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    return () => window.removeEventListener('click', unlockAudio);
  }, [audioUnlocked]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications periodically and play sound for new notifications
  useEffect(() => {
  if (!user?.userId || !audioUnlocked) return;

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${user.userId}`);
      const data = await res.json();
      const unreadCount = data.filter(n => n.isRead === 0).length;

      // ✅ Compare with previous value safely
      if (unreadCount > prevNotificationsRef.current && notificationAudio.current) {
        notificationAudio.current.play().catch(err =>
          console.error("Audio play error:", err)
        );
      }

      // ✅ Update ref + state
      prevNotificationsRef.current = unreadCount;
      setNotifications(unreadCount);

    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 1000);

  return () => clearInterval(interval);
}, [user, audioUnlocked]);

  // Fetch avatar
  useEffect(() => {
    if (!user?.userId) return;

    const fetchAvatar = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/kyc/avatar/${user.userId}`);
        const data = await res.json();
        if (data?.avatar) setAvatar(data.avatar);
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [user]);

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
      case 'loanStatus': return <CustomerLoanStatus user={user}  onApplyLoan={() => setActiveMenu('loan')}  />;
      case 'loanrepay': return <CustomerRepayloan user={user} />;
      case 'profile': return <NotificationsSupport user={user} />;
      default: return <DashboardHome user={user} />;
    }
  };

  /*const handleLogout = () => {
    localStorage.removeItem('user');
   // window.location.href = '/';
      window.location.hash = '#/';
  };*/

const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem('user');
  navigate('/apply');
};

  const handleMenuClick = (itemId) => {
    setActiveMenu(itemId);
    setMobileMenuOpen(false);
  };

  const handleNotificationClick = async () => {
    if (!user?.userId) return;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/mark-read/${user.userId}`, { method: "PUT" });
    } catch (error) {
      console.error("Error marking notifications:", error);
    }

    setNotifications(0);
    setActiveMenu('profile');
    setMobileMenuOpen(false);
  };

  const handleAvatarClick = () => setShowDropdown(!showDropdown);
  const handleChangePassword = () => { alert("Navigate to Change Password Page"); setShowDropdown(false); };
  const handleViewKyc = () => { setActiveMenu('viewKyc'); setShowDropdown(false); };

  const displayName = user?.fullName || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="dashboard-container">
      {/* Notification Audio */}
      <audio ref={notificationAudio} src="/sounds/notifications.mp3" />

      {/* TOP BAR */}
      <header className="top-bar" style={{ textDecoration: 'none' }}>
        <div className="top-bar-left">
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="dashboard-title" style={{ textDecoration: 'none' }}>
            <FaHome className="home-icon" />
            <span className="user-name">{firstName}</span>
          </h1>
        </div>

        <div className="top-bar-right">
          {/* NOTIFICATION */}
          <div className="notification-bell" onClick={handleNotificationClick}>
            <FaBell size={20} />
            <span className={`notification-badge ${notifications > 0 ? "show" : "hide"}`}>
              {notifications}
            </span>
          </div>

          {/* AVATAR */}
          <div className="user-avatar" style={{ position: "relative" }}>
            <div onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
              {avatar ? (
                <img src={`${process.env.REACT_APP_API_URL.replace(/\/$/, "")}/uploads/${avatar}`} alt="avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">{firstName?.charAt(0)}</div>
              )}
            </div>

            {showDropdown && (
              <AvatarDropdown
                userId={user.userId}
                onClose={() => setShowDropdown(false)}
                onChangePassword={handleChangePassword}
                onViewKyc={handleViewKyc}
              />
            )}
          </div>

          <span className="welcome-text">{firstName}</span>
          <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="dashboard-content">
        {/* SIDEBAR */}
        <nav className={`sidebar-cards ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="menu-cards-grid">
            {menuItems.map(item => {
              const isDisabled = ['loanrepay', 'profile'].includes(item.id);
              return (
                <div key={item.id} className={`menu-card ${activeMenu === item.id ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
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

        {/* MAIN CONTENT */}
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