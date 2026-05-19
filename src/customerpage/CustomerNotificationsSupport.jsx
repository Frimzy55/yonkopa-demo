// src/pages/CustomerDashboard/NotificationsSupport.jsx
import React, { useEffect, useState } from "react";
import {
  Bell,
  Mail,
  Phone,
  Headphones,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "react-feather";

const NotificationsSupport = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/notifications/${user.userId}`
        );
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Helper: icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <CheckCircle size={18} className="text-success" />;
      case "warning":
        return <AlertCircle size={18} className="text-warning" />;
      case "info":
      default:
        return <Info size={18} className="text-info" />;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="notifications-support-container">
        <div className="loading-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-support-container">
      <div className="ns-header">
        <h2>Notifications & Support</h2>
        <p>Stay updated with your account activity and get help when you need it</p>
      </div>

      <div className="ns-grid">
        {/* Notifications Section */}
        <div className="ns-card notifications-card">
          <div className="card-header">
            <Bell size={20} />
            <h3>Your Notifications</h3>
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </div>

          <div className="card-body">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={32} strokeWidth={1.5} />
                <p>No notifications yet</p>
                <span>We'll notify you when something important happens</span>
              </div>
            ) : (
              <ul className="notifications-list">
                {notifications.map((note) => (
                  <li key={note.id} className={`notification-item ${!note.isRead ? "unread" : ""}`}>
                    <div className="notification-icon">
                      {getNotificationIcon(note.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">{note.message}</div>
                      <div className="notification-meta">
                        <Clock size={14} />
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                        {!note.isRead && <span className="unread-dot">●</span>}
                      </div>
                      {note.type === "kyc_code" && (
                        <div className="security-note">
                          ⚠️ Do not share this code with anyone
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Support Section - Only Email & Phone */}
        <div className="ns-card support-card">
          <div className="card-header">
            <Headphones size={20} />
            <h3>Customer Support</h3>
          </div>

          <div className="card-body">
            <div className="support-options">
              <a href="mailto:support@yourdomain.com" className="support-option">
                <Mail size={20} />
                <div>
                  <strong>Email Support</strong>
                  <span>info@yonkopamicrocredit.com</span>
                </div>
              </a>

              <a href="tel:+1234567890" className="support-option">
                <Phone size={20} />
                <div>
                  <strong>Phone Support</strong>
                  <span>+233 24 193 3741
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Container and layout */
        .notifications-support-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .ns-header {
          margin-bottom: 2rem;
        }

        .ns-header h2 {
          font-size: 1.8rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #1a2c3e;
          letter-spacing: -0.3px;
        }

        .ns-header p {
          color: #5b6e8c;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Grid layout */
        .ns-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        /* Cards */
        .ns-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ns-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #eef2f6;
          background: #fafcff;
        }

        .card-header svg {
          color: #2196f3;
        }

        .card-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: #1a2c3e;
        }

        .card-header .badge {
          background: #2196f3;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 30px;
          margin-left: auto;
        }

        .card-body {
          padding: 1.25rem 1.5rem;
        }

        /* Notifications list */
        .notifications-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #ffffff;
          border-radius: 16px;
          transition: background 0.2s;
          border: 1px solid #eef2f6;
        }

        .notification-item.unread {
          background: #f8fbff;
          border-left: 3px solid #2196f3;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4fa;
          border-radius: 12px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-message {
          font-size: 0.9rem;
          color: #1e2a3a;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #7e8c9e;
        }

        .unread-dot {
          color: #2196f3;
          font-size: 0.7rem;
          margin-left: 0.25rem;
        }

        .security-note {
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #e67e22;
          background: #fff4e6;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          display: inline-block;
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: #8e9eae;
        }

        .empty-state svg {
          color: #cbd5e1;
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          font-weight: 500;
          margin: 0 0 0.25rem 0;
          color: #4a5b6e;
        }

        .empty-state span {
          font-size: 0.8rem;
        }

        /* Support options */
        .support-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .support-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafd;
          border-radius: 16px;
          text-decoration: none;
          transition: background 0.2s;
          border: 1px solid #eef2f6;
        }

        .support-option:hover {
          background: #f1f5f9;
        }

        .support-option svg {
          color: #2196f3;
          flex-shrink: 0;
        }

        .support-option div {
          flex: 1;
        }

        .support-option strong {
          display: block;
          font-size: 0.9rem;
          color: #1e2a3a;
          margin-bottom: 0.2rem;
        }

        .support-option span {
          font-size: 0.8rem;
          color: #5b6e8c;
        }

        /* Loading skeleton */
        .loading-skeleton {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .skeleton-title {
          width: 250px;
          height: 32px;
          background: #e2e8f0;
          border-radius: 8px;
          margin-bottom: 1rem;
          animation: pulse 1.5s infinite;
        }

        .skeleton-card {
          width: 100%;
          height: 200px;
          background: #e2e8f0;
          border-radius: 20px;
          margin-bottom: 1.5rem;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ns-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .ns-header h2 {
            font-size: 1.5rem;
          }

          .card-header {
            padding: 1rem;
          }

          .card-body {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationsSupport;