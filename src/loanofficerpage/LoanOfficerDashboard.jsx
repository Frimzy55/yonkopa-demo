import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserFriends, 
  FaCog,
  FaDollarSign,
  FaStar,
  FaCalendarAlt,
  FaUser,
  FaLock,
  FaBell,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
 
  FaClock,
 
  FaBriefcase,
  FaFileAlt,
  FaBars,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { IoMdTrendingUp } from "react-icons/io";
import { GiAchievement } from "react-icons/gi";
import "./LoanOfficerDashboard.css";

const LoanOfficerDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState({
    reports: false,
    settings: false,
  });
 // const [searchTerm, setSearchTerm] = useState("");
  const [notifications, ] = useState([
    { id: 1, message: "New employee request pending", time: "5 min ago", read: false },
    { id: 2, message: "Project deadline approaching", time: "1 hour ago", read: false },
    { id: 3, message: "Monthly report ready", time: "2 hours ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Manager Dashboard | HR Management";
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
      id: "team",
      label: "Team Management",
      icon: <FaUsers />,
      type: "item",
      tooltip: "Team Management"
    },
    {
      id: "employees",
      label: "Employees",
      icon: <FaUserFriends />,
      type: "item",
      tooltip: "Employees"
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BiSolidReport />,
      type: "submenu",
      tooltip: "Reports",
      subItems: [
        { id: "sales", label: "Sales Analytics", icon: <FaDollarSign />, tooltip: "Sales Analytics" },
        { id: "performance", label: "Performance Metrics", icon: <FaStar />, tooltip: "Performance Metrics" },
        { id: "attendance", label: "Attendance Tracking", icon: <FaCalendarAlt />, tooltip: "Attendance Tracking" },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FaCog />,
      type: "submenu",
      tooltip: "Settings",
      subItems: [
        { id: "profile", label: "Profile Settings", icon: <FaUser />, tooltip: "Profile Settings" },
        { id: "security", label: "Security & Privacy", icon: <FaLock />, tooltip: "Security & Privacy" },
        { id: "notifications", label: "Notification Preferences", icon: <FaBell />, tooltip: "Notification Preferences" },
      ],
    },
  ];

  const stats = [
    { title: "Total Employees", value: "156", change: "+12%", trend: "up", color: "primary" },
    { title: "Active Projects", value: "24", change: "+5%", trend: "up", color: "success" },
    { title: "Pending Approvals", value: "8", change: "-2%", trend: "down", color: "warning" },
    { title: "Avg Performance", value: "94%", change: "+3%", trend: "up", color: "info" },
  ];

  const recentActivities = [
    { id: 1, action: "New employee joined", user: "Sarah Johnson", role: "Frontend Developer", time: "2 hours ago", icon: <FaUserFriends /> },
    { id: 2, action: "Project deadline extended", user: "Mike Chen", project: "Mobile App", time: "5 hours ago", icon: <FaClock /> },
    { id: 3, action: "Performance review completed", user: "Emma Wilson", rating: "4.8/5", time: "1 day ago", icon: <FaStar /> },
    { id: 4, action: "Budget approved", user: "Finance Dept", amount: "$50,000", time: "2 days ago", icon: <FaDollarSign /> },
  ];

  /*const teamMembers = [
    { id: 1, name: "John Doe", role: "Senior Developer", department: "Engineering", status: "active", email: "john.doe@company.com", phone: "+1 234 567 8900" },
    { id: 2, name: "Jane Smith", role: "Product Manager", department: "Product", status: "active", email: "jane.smith@company.com", phone: "+1 234 567 8901" },
    { id: 3, name: "Mike Johnson", role: "UX Designer", department: "Design", status: "leave", email: "mike.johnson@company.com", phone: "+1 234 567 8902" },
    { id: 4, name: "Sarah Williams", role: "QA Lead", department: "Quality Assurance", status: "active", email: "sarah.williams@company.com", phone: "+1 234 567 8903" },
    { id: 5, name: "Alex Brown", role: "DevOps Engineer", department: "Infrastructure", status: "active", email: "alex.brown@company.com", phone: "+1 234 567 8904" },
  ];

  const filteredTeam = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );*/

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            <div className="welcome-card">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="mb-2">Welcome back, {user?.fullName || "Manager"}! 👋</h4>
                    <p className="mb-0 opacity-75">Here's what's happening with your team today.</p>
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
                          {stat.title === "Total Employees" && <FaUserFriends className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Active Projects" && <FaBriefcase className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Pending Approvals" && <FaClock className={`text-${stat.color}`} size={24} />}
                          {stat.title === "Avg Performance" && <GiAchievement className={`text-${stat.color}`} size={24} />}
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
                    <h6 className="mb-0">Performance Overview</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Team Performance</small>
                        <small className="text-muted">85%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-primary" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Project Completion</small>
                        <small className="text-muted">72%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-success" style={{ width: "72%" }}></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Attendance Rate</small>
                        <small className="text-muted">94%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-info" style={{ width: "94%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Client Satisfaction</small>
                        <small className="text-muted">88%</small>
                      </div>
                      <div className="progress-custom">
                        <div className="progress-bar-custom bg-warning" style={{ width: "88%" }}></div>
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
            <span>Loan Officer Portal</span>
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
              <span>{user?.fullName || "Manager"}</span>
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

export default LoanOfficerDashboard;