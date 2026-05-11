import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserFriends, 
  FaCog,
  FaDollarSign,
  FaStar,
  
  FaUser,
  
  FaBell,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  
  FaFileAlt,
  FaBars,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaHandHoldingUsd,
  FaUniversity,
  FaCheckCircle
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
//import { BiSolidReport } from "react-icons/bi";
import { IoMdTrendingUp } from "react-icons/io";
//import { GiAchievement } from "react-icons/gi";
import "./LoanSupervisorDashboard.css";

const LoanSupervisorDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState({
    loans: false,
    accounts: false,
  });
  const [notifications, ] = useState([
    { id: 1, message: "New loan application pending approval", time: "5 min ago", read: false },
    { id: 2, message: "Customer KYC verification required", time: "1 hour ago", read: false },
    { id: 3, message: "Monthly report ready", time: "2 hours ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Loan Supervisor Dashboard | Loan Management";
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/access");
  };

  const toggleMenu = (menu) => {
    if (!sidebarCollapsed) {
      setExpandedMenus((prev) => ({
        ...prev,
        [menu]: !prev[menu],
      }));
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      type: "item",
      tooltip: "Dashboard"
    },
    {
      id: "customers",
      label: "Customers",
      icon: <FaUsers />,
      type: "item",
      tooltip: "Customers"
    },
    {
      id: "loans",
      label: "Loans",
      icon: <FaHandHoldingUsd />,
      type: "submenu",
      tooltip: "Loans",
      subItems: [
        { id: "loan-applications", label: "Loan Applications", icon: <FaFileAlt />, tooltip: "Loan Applications" },
        { id: "active-loans", label: "Active Loans", icon: <FaHandHoldingUsd />, tooltip: "Active Loans" },
        { id: "loan-repayments", label: "Repayments", icon: <FaDollarSign />, tooltip: "Repayments" },
        { id: "loan-products", label: "Loan Products", icon: <FaStar />, tooltip: "Loan Products" },
      ],
    },
    {
      id: "accounts",
      label: "Accounts",
      icon: <FaUniversity />,
      type: "submenu",
      tooltip: "Accounts",
      subItems: [
        { id: "customer-accounts", label: "Customer Accounts", icon: <FaUserFriends />, tooltip: "Customer Accounts" },
        { id: "transactions", label: "Transactions", icon: <FaDollarSign />, tooltip: "Transactions" },
        { id: "ledger", label: "General Ledger", icon: <FaFileAlt />, tooltip: "General Ledger" },
      ],
    },
    {
      id: "approvals",
      label: "My Approvals",
      icon: <FaCheckCircle />,
      type: "item",
      tooltip: "My Approvals"
    },
  ];

  const stats = [
    { title: "Total Customers", value: "1,284", change: "+8%", trend: "up", color: "primary" },
    { title: "Active Loans", value: "892", change: "+12%", trend: "up", color: "success" },
    { title: "Pending Approvals", value: "24", change: "-3%", trend: "down", color: "warning" },
    { title: "Disbursed Amount", value: "$4.2M", change: "+15%", trend: "up", color: "info" },
  ];

  const recentActivities = [
    { id: 1, action: "New loan application submitted", user: "John Doe", role: "Personal Loan - $25,000", time: "2 hours ago", icon: <FaFileAlt /> },
    { id: 2, action: "Loan approved", user: "Mike Chen", project: "Home Loan - $350,000", time: "5 hours ago", icon: <FaCheckCircle /> },
    { id: 3, action: "Repayment received", user: "Emma Wilson", rating: "$1,250", time: "1 day ago", icon: <FaDollarSign /> },
    { id: 4, action: "KYC verification pending", user: "Finance Dept", amount: "Customer ID: #2345", time: "2 days ago", icon: <FaUserFriends /> },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <div className="welcome-card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="mb-2">Welcome back, {user?.fullName || "Supervisor"}! </h4>
                    <p className="mb-0 opacity-75">Here's what's happening with your loan portfolio today.</p>
                  </div>
                  <div className="col-auto">
                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                      <IoMdTrendingUp size={32} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 mb-4">
              {stats.map((stat, index) => (
                <div className="col-md-3" key={index}>
                  <div className="card stat-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="text-muted mb-1">{stat.title}</h6>
                          <h2 className="mb-0">{stat.value}</h2>
                        </div>
                        <div className={`stat-icon bg-${stat.color} bg-opacity-10`}>
                          {stat.title === "Total Customers" && <FaUsers className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Active Loans" && <FaHandHoldingUsd className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Pending Approvals" && <FaClock className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Disbursed Amount" && <FaDollarSign className={`text-${stat.color}`} size={24} />}
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className={`text-${stat.trend === 'up' ? 'success' : 'danger'} me-1`}>
                          {stat.change}
                        </span>
                        <small className="text-muted">vs last month</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              <div className="col-md-7">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4">
                    <h6 className="mb-0">Loan Portfolio Overview</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Loan Disbursement Rate</small>
                        <small className="text-muted">78%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-primary" style={{ width: "78%" }}></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Repayment Rate</small>
                        <small className="text-muted">92%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-success" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Approval Rate</small>
                        <small className="text-muted">67%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-info" style={{ width: "67%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Customer Satisfaction</small>
                        <small className="text-muted">4.8/5</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-warning" style={{ width: "96%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 pt-4">
                    <h6 className="mb-0">Recent Activities</h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {recentActivities.map((activity) => (
                        <div className="list-group-item border-0 px-4 py-3" key={activity.id}>
                          <div className="d-flex align-items-start">
                            <div className="bg-light rounded-circle p-2 me-3">
                              {activity.icon}
                            </div>
                            <div className="flex-grow-1">
                              <p className="mb-1 fw-semibold">{activity.action}</p>
                              <small className="text-muted d-block">
                                {activity.user} • {activity.time}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaFileAlt size={48} className="text-muted mb-3" />
              <h5>Content Coming Soon</h5>
              <p className="text-muted">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="manager-dashboard">
      {/* Top Navbar */}
      <div className="top-navbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <FaBars size={18} />
          </button>
          <div className="navbar-brand">
            <FaTachometerAlt />
            <span>Loan Supervisor Portal</span>
          </div>
        </div>
        <div className="navbar-right">
          <div style={{ position: "relative" }}>
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <h6 className="mb-0">Notifications</h6>
                </div>
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                    <p className="mb-1 small">{notification.message}</p>
                    <small className="text-muted">{notification.time}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button 
              className="user-dropdown-btn"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="user-avatar">
                <FaUser size={14} />
              </div>
              <span>{user?.fullName || "Supervisor"}</span>
              <FaChevronDown size={12} />
            </button>
            
            {showUserDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-item">
                  <FaUser size={14} />
                  <span>Profile</span>
                </div>
                <div className="dropdown-item">
                  <FaCog size={14} />
                  <span>Settings</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item text-danger" onClick={handleLogout}>
                  <FaSignOutAlt size={14} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="sidebar-header">
            <h6 className="sidebar-title">
              <FaTachometerAlt size={14} />
              <span>MAIN MENU</span>
            </h6>
            <button className="sidebar-collapse-toggle" onClick={toggleSidebar}>
              {sidebarCollapsed ? <FaAngleDoubleRight size={14} /> : <FaAngleDoubleLeft size={14} />}
            </button>
          </div>
          <div className="sidebar-menu">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.type === "item" ? (
                  <button
                    className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
                    onClick={() => setActiveMenu(item.id)}
                    data-tooltip={sidebarCollapsed ? item.tooltip : ""}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.label}</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="menu-item"
                      onClick={() => toggleMenu(item.id)}
                      data-tooltip={sidebarCollapsed ? item.tooltip : ""}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.label}</span>
                      {!sidebarCollapsed && (
                        <span className="menu-arrow">
                          {expandedMenus[item.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </span>
                      )}
                    </button>
                    {expandedMenus[item.id] && !sidebarCollapsed && (
                      <div className="submenu-container">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            className={`submenu-item ${activeMenu === subItem.id ? "active" : ""}`}
                            onClick={() => setActiveMenu(subItem.id)}
                            data-tooltip={sidebarCollapsed ? subItem.tooltip : ""}
                          >
                            <span className="submenu-icon">{subItem.icon}</span>
                            <span className="submenu-text">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="container-fluid px-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanSupervisorDashboard; 