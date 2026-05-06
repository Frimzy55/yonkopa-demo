import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { availablePermissions, getGroupedPermissions, menuItems } from './permissions';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  //const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showStaffPermissionsModal, setShowStaffPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubMenus, setExpandedSubMenus] = useState({});
  const [expandedNestedMenus, setExpandedNestedMenus] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Toggle functions for menu expansion
  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const toggleSubMenu = (menuName, subMenuName) => {
    const key = `${menuName}_${subMenuName}`;
    setExpandedSubMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNestedMenu = (menuName, subMenuName, nestedName) => {
    const key = `${menuName}_${subMenuName}_${nestedName}`;
    setExpandedNestedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if a permission is selected
  const isPermissionSelected = (permissionId) => {
    return formData.permissions.includes(permissionId);
  };

  // Handle permission selection from menu items
  const handleMenuPermissionChange = (permissionId) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  // Generate permission ID from menu item
  const getPermissionId = (menuName, subMenuName = null, itemName = null) => {
    if (itemName && subMenuName) {
      return `${menuName.toLowerCase()}_${subMenuName.toLowerCase().replace(/ /g, '_')}_${itemName.toLowerCase().replace(/ /g, '_')}`;
    } else if (subMenuName) {
      return `${menuName.toLowerCase()}_${subMenuName.toLowerCase().replace(/ /g, '_')}`;
    }
    return menuName.toLowerCase().replace(/ /g, '_');
  };

  // Reset Password functionality
  const handleResetPassword = (staff) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPasswordModal(true);
    setOpenDropdown(null);
  };

  const submitPasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter password and confirm password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
        userId: selectedStaff.id,
        password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Password reset successfully for ${selectedStaff.full_name}`);
      setShowResetPasswordModal(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Activate Staff
  const handleActivateStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to activate ${staff.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/activate-user/${staff.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${staff.full_name} has been activated successfully`);
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error activating staff:', error);
      toast.error(error.response?.data?.message || 'Failed to activate staff');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  // Deactivate Staff
  const handleDeactivateStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to deactivate ${staff.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/deactivate-user/${staff.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${staff.full_name} has been deactivated successfully`);
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating staff:', error);
      toast.error(error.response?.data?.message || 'Failed to deactivate staff');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  // Block Login
  const handleBlockLogin = async (staff) => {
    if (!window.confirm(`Are you sure you want to block login for ${staff.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/block-user/${staff.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Login blocked for ${staff.full_name}`);
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error blocking login:', error);
      toast.error(error.response?.data?.message || 'Failed to block login');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  // Unblock Login
  const handleUnblockLogin = async (staff) => {
    if (!window.confirm(`Are you sure you want to unblock login for ${staff.full_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/unblock-user/${staff.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Login unblocked for ${staff.full_name}`);
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking login:', error);
      toast.error(error.response?.data?.message || 'Failed to unblock login');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  // Render reports in menu
  const renderReports = (reports, menuName, subMenuName) => {
    if (!reports || reports.length === 0) return null;
    
    return (
      <ul className="list-unstyled ms-4 mt-2">
        {reports.map((report, idx) => {
          const permissionId = getPermissionId(menuName, subMenuName, report.name);
          return (
            <li key={idx} className="mb-1">
              <div className="d-flex align-items-center p-1 rounded hover-bg">
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  id={permissionId}
                  checked={isPermissionSelected(permissionId)}
                  onChange={() => handleMenuPermissionChange(permissionId)}
                />
                <i className={`${report.icon} me-2 text-success`}></i>
                <label className="form-check-label small" htmlFor={permissionId}>
                  {report.name}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Render nested menus
  const renderNestedMenus = (nestedMenus, menuName, subMenuName) => {
    if (!nestedMenus || nestedMenus.length === 0) return null;
    
    return (
      <ul className="list-unstyled ms-4 mt-2">
        {nestedMenus.map((nested, idx) => {
          const nestedKey = `${menuName}_${subMenuName}_${nested.name}`;
          const hasNestedChildren = nested.nestedMenus && nested.nestedMenus.length > 0;
          const hasReports = nested.reports && nested.reports.length > 0;
          const permissionId = getPermissionId(menuName, subMenuName, nested.name);
          
          return (
            <li key={idx} className="mb-2">
              {hasNestedChildren || hasReports ? (
                <>
                  <div 
                    className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer"
                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                  >
                    <i 
                      className={`bi ${expandedNestedMenus[nestedKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}
                      onClick={() => toggleNestedMenu(menuName, subMenuName, nested.name)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id={permissionId}
                      checked={isPermissionSelected(permissionId)}
                      onChange={() => handleMenuPermissionChange(permissionId)}
                    />
                    <i className={`${nested.icon} me-2 text-primary`}></i>
                    <label className="form-check-label fw-semibold" htmlFor={permissionId}>
                      {nested.name}
                    </label>
                  </div>
                  {expandedNestedMenus[nestedKey] && (
                    <>
                      {hasNestedChildren && renderNestedMenus(nested.nestedMenus, menuName, `${subMenuName}_${nested.name}`)}
                      {hasReports && renderReports(nested.reports, menuName, `${subMenuName}_${nested.name}`)}
                    </>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center p-2 rounded hover-bg ms-3">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id={permissionId}
                    checked={isPermissionSelected(permissionId)}
                    onChange={() => handleMenuPermissionChange(permissionId)}
                  />
                  <i className={`${nested.icon} me-2 text-secondary`}></i>
                  <label className="form-check-label" htmlFor={permissionId}>
                    {nested.name}
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Render sub menus
  const renderSubMenus = (subMenus, menuName) => {
    if (!subMenus || subMenus.length === 0) return null;
    
    return (
      <ul className="list-unstyled mt-2 ms-4">
        {subMenus.map((subMenu, idx) => {
          const subMenuKey = `${menuName}_${subMenu.name}`;
          const hasNested = subMenu.nestedMenus && subMenu.nestedMenus.length > 0;
          const hasReports = subMenu.reports && subMenu.reports.length > 0;
          const hasContent = hasNested || hasReports;
          const permissionId = getPermissionId(menuName, subMenu.name);
          
          return (
            <li key={idx} className="mb-2">
              {hasContent ? (
                <>
                  <div 
                    className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer"
                    style={{ cursor: 'pointer', backgroundColor: '#e9ecef' }}
                  >
                    <i 
                      className={`bi ${expandedSubMenus[subMenuKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}
                      onClick={() => toggleSubMenu(menuName, subMenu.name)}
                      style={{ cursor: 'pointer' }}
                    ></i>
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id={permissionId}
                      checked={isPermissionSelected(permissionId)}
                      onChange={() => handleMenuPermissionChange(permissionId)}
                    />
                    <i className={`${subMenu.icon} me-2 text-primary`}></i>
                    <label className="form-check-label fw-semibold" htmlFor={permissionId}>
                      {subMenu.name}
                    </label>
                  </div>
                  {expandedSubMenus[subMenuKey] && (
                    <div className="mt-2">
                      {hasNested && renderNestedMenus(subMenu.nestedMenus, menuName, subMenu.name)}
                      {hasReports && renderReports(subMenu.reports, menuName, subMenu.name)}
                    </div>
                  )}
                </>
              ) : (
                <div className="d-flex align-items-center p-2 rounded hover-bg">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id={permissionId}
                    checked={isPermissionSelected(permissionId)}
                    onChange={() => handleMenuPermissionChange(permissionId)}
                  />
                  <i className={`${subMenu.icon} me-2 text-secondary`}></i>
                  <label className="form-check-label" htmlFor={permissionId}>
                    {subMenu.name}
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Group permissions by category
  const groupedPermissions = getGroupedPermissions();

  // Fetch roles
  const fetchRoles = useCallback(() => {
    const enumRoles = [
      { id: 2, name: 'loan_officer', description: 'Can process and manage loan applications', permissions: ['view_dashboard', 'view_customers', 'manage_loans', 'approve_loans', 'disburse_loans'] },
      { id: 3, name: 'supervisor', description: 'Supervises loan officers and daily operations', permissions: ['view_dashboard', 'manage_customers', 'manage_loans', 'approve_loans', 'view_reports'] },
      { id: 4, name: 'manager', description: 'Manages branch operations and staff', permissions: ['view_dashboard', 'manage_customers', 'manage_loans', 'approve_loans', 'manage_users', 'view_reports'] },
      { id: 5, name: 'admin', description: 'Full system access', permissions: ['view_dashboard', 'manage_customers', 'manage_accounts', 'manage_loans', 'manage_users', 'manage_roles', 'view_reports', 'system_settings'] }
    ];

    setLoading(true);
    try {
      setRoles(enumRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/getusers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectAllPermissions = () => {
    const allPermissionIds = availablePermissions.map(p => p.id);
    const allSelected = allPermissionIds.every(p => formData.permissions.includes(p));
    
    if (allSelected) {
      setFormData(prev => ({ ...prev, permissions: [] }));
    } else {
      setFormData(prev => ({ ...prev, permissions: allPermissionIds }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRole) {
        toast.success('Role updated successfully');
        const updatedRoles = roles.map(role => 
          role.name === editingRole.name ? { ...role, ...formData } : role
        );
        setRoles(updatedRoles);
      } else {
        toast.success('Role created successfully');
        const newRole = {
          id: roles.length + 2,
          name: formData.name.toLowerCase().replace(/\s/g, '_'),
          description: formData.description,
          permissions: formData.permissions
        };
        setRoles([...roles, newRole]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleViewStaffPermissions = (staff) => {
    const staffRole = roles.find(r => r.name === staff.role);
    setViewingStaff(staff);
    setViewingRole(staffRole);
    setShowStaffPermissionsModal(true);
    setOpenDropdown(null);
  };

  const handleEditStaffRole = (staff) => {
    const staffRole = roles.find(r => r.name === staff.role);
    if (staffRole) {
      handleEdit(staffRole);
    } else {
      toast.error('Role not found for this staff member');
    }
    setOpenDropdown(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setEditingRole(null);
    setShowModal(false);
  };

  const getStaffMembers = () => {
    const staffRoles = ['loan_officer', 'supervisor', 'manager', 'admin'];
    return users.filter(user => staffRoles.includes(user.role));
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      'admin': 'primary',
      'manager': 'primary',
      'supervisor': 'primary',
      'loan_officer': 'primary'
    };
    return colors[roleName] || 'secondary';
  };

  const getRoleDisplayName = (roleName) => {
    const names = {
      'loan_officer': 'Loan Officer',
      'supervisor': 'Supervisor',
      'manager': 'Manager',
      'admin': 'Admin'
    };
    return names[roleName] || roleName;
  };

  const getStatusBadge = (user) => {
    if (user.is_blocked) {
      return <span className="badge bg-danger">Blocked</span>;
    }
    if (user.is_active === false) {
      return <span className="badge bg-secondary">Inactive</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

  const displayContactInfo = (user) => {
    const hasEmail = user.email && user.email.trim() !== '';
    const hasPhone = user.phone && user.phone.trim() !== '';
    
    if (hasEmail && hasPhone) {
      return `${user.email} / ${user.phone}`;
    } else if (hasEmail) {
      return user.email;
    } else if (hasPhone) {
      return user.phone;
    }
    return '—';
  };

  const staffMembers = getStaffMembers();

  const toggleDropdown = (staffId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === staffId ? null : staffId);
  };

  return (
    <div className="roles-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Staff Management</h4>
          <p className="text-muted mb-0">Manage staff members, roles, and permissions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Create New Role
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Staff</h6>
                  <h3 className="mb-0">{staffMembers.length}</h3>
                </div>
                <i className="bi bi-people fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Loan Officers</h6>
                  <h3 className="mb-0">{staffMembers.filter(u => u.role === 'loan_officer').length}</h3>
                </div>
                <i className="bi bi-person-check fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Supervisors</h6>
                  <h3 className="mb-0">{staffMembers.filter(u => u.role === 'supervisor').length}</h3>
                </div>
                <i className="bi bi-person-badge fs-1 text-warning"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Managers & Admins</h6>
                  <h3 className="mb-0">{staffMembers.filter(u => u.role === 'manager' || u.role === 'admin').length}</h3>
                </div>
                <i className="bi bi-shield-lock fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Table */}
      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            All Staff Members
          </h5>
        </div>
        <div className="card-body">
          {loading && !staffMembers.length ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading staff members...</p>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-people fs-1 text-muted"></i>
              <p className="mt-2 text-muted">No staff members found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '18%' }}>Full Name</th>
                    <th style={{ width: '20%' }}>Contact Information</th>
                    <th style={{ width: '12%' }}>Role</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '15%' }}>Joined Date</th>
                    <th style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff, idx) => (
                    <tr key={staff.id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">
                        {staff.full_name || staff.username || '—'}
                      </td>
                      <td>
                        <small>{displayContactInfo(staff)}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${getRoleBadgeColor(staff.role)}`}>
                          {getRoleDisplayName(staff.role)}
                        </span>
                      </td>
                      <td>{getStatusBadge(staff)}</td>
                      <td>
                        {staff.created_at 
                          ? new Date(staff.created_at).toLocaleDateString() 
                          : '—'}
                      </td>
                      <td>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-secondary dropdown-toggle"
                            type="button"
                            onClick={(e) => toggleDropdown(staff.id, e)}
                          >
                            <i className="bi bi-gear me-1"></i>
                            Actions
                          </button>
                          {openDropdown === staff.id && (
                            <div className="dropdown-menu show">
                              <button
                                className="dropdown-item"
                                onClick={() => handleViewStaffPermissions(staff)}
                              >
                                <i className="bi bi-eye me-2"></i>
                                View Permissions
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => handleEditStaffRole(staff)}
                                disabled={staff.role === 'admin'}
                              >
                                <i className="bi bi-pencil me-2"></i>
                                Edit Role Permissions
                              </button>
                              <div className="dropdown-divider"></div>
                              <button
                                className="dropdown-item"
                                onClick={() => handleResetPassword(staff)}
                              >
                                <i className="bi bi-key me-2"></i>
                                Reset Password
                              </button>
                              {staff.is_active ? (
                                <button
                                  className="dropdown-item text-warning"
                                  onClick={() => handleDeactivateStaff(staff)}
                                  disabled={staff.role === 'admin'}
                                >
                                  <i className="bi bi-pause-circle me-2"></i>
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  className="dropdown-item text-success"
                                  onClick={() => handleActivateStaff(staff)}
                                  disabled={staff.role === 'admin'}
                                >
                                  <i className="bi bi-play-circle me-2"></i>
                                  Activate
                                </button>
                              )}
                              {staff.is_blocked ? (
                                <button
                                  className="dropdown-item text-success"
                                  onClick={() => handleUnblockLogin(staff)}
                                  disabled={staff.role === 'admin'}
                                >
                                  <i className="bi bi-unlock me-2"></i>
                                  Unblock Login
                                </button>
                              ) : (
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleBlockLogin(staff)}
                                  disabled={staff.role === 'admin'}
                                >
                                  <i className="bi bi-lock me-2"></i>
                                  Block Login
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedStaff && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-key me-2"></i>
                  Reset Password for: {selectedStaff.full_name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowResetPasswordModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <small className="text-muted">Password must be at least 6 characters long</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowResetPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={submitPasswordReset}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Role Modal with Menu Tree */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  {editingRole ? `Edit Role: ${editingRole.name.replace('_', ' ').toUpperCase()}` : 'Create New Role & Assign Permissions'}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Role Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter role name"
                        disabled={editingRole?.name === 'admin'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the role"
                      />
                    </div>
                  </div>

                  <hr />
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Menu Permissions (Click on blue headings to expand)</h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleSelectAllPermissions}
                    >
                      Select All Permissions
                    </button>
                  </div>
                  
                  <div className="menu-tree">
                    {menuItems.map((menu, idx) => {
                      const menuPermissionId = getPermissionId(menu.name);
                      return (
                        <div key={idx} className="mb-3 border rounded">
                          {/* Main Menu Heading - Click to toggle */}
                          <div 
                            className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-top cursor-pointer"
                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                          >
                            <div className="d-flex align-items-center">
                              <i 
                                className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-down' : 'bi-chevron-right'} me-3 text-primary fs-5`}
                                onClick={() => toggleMenu(menu.name)}
                                style={{ cursor: 'pointer' }}
                              ></i>
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                id={menuPermissionId}
                                checked={isPermissionSelected(menuPermissionId)}
                                onChange={() => handleMenuPermissionChange(menuPermissionId)}
                                disabled={menu.name === 'Dashboard'}
                              />
                              <i className={`${menu.icon} me-3 text-primary fs-4`}></i>
                              <label className="form-check-label h5 mb-0 text-primary" htmlFor={menuPermissionId}>
                                {menu.name}
                              </label>
                            </div>
                            <div className="d-flex align-items-center">
                              {menu.subMenus && menu.subMenus.length > 0 && (
                                <span className="badge bg-primary me-2">
                                  {menu.subMenus.length} items
                                </span>
                              )}
                              <i 
                                className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}
                                onClick={() => toggleMenu(menu.name)}
                                style={{ cursor: 'pointer' }}
                              ></i>
                            </div>
                          </div>
                          
                          {/* Sub Menus - Show when expanded */}
                          {expandedMenus[menu.name] && (
                            <div className="p-3 border-top">
                              {menu.subMenus && menu.subMenus.length > 0 ? (
                                renderSubMenus(menu.subMenus, menu.name)
                              ) : (
                                <div className="text-muted text-center py-3">
                                  <i className="bi bi-info-circle me-2"></i>
                                  No sub-menus available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      editingRole ? 'Update Role' : 'Create Role'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Permissions Modal */}
      {showStaffPermissionsModal && viewingStaff && viewingRole && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Permissions for: {viewingStaff.full_name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStaffPermissionsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p><strong>Staff Name:</strong> {viewingStaff.full_name}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Role:</strong> 
                      <span className={`badge bg-${getRoleBadgeColor(viewingStaff.role)} ms-2`}>
                        {getRoleDisplayName(viewingStaff.role)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <p><strong>Role Description:</strong> {viewingRole.description || 'No description'}</p>
                  </div>
                </div>
                <hr />
                <h6 className="mb-3">Assigned Permissions ({viewingRole.permissions?.length || 0})</h6>
                
                {Object.entries(groupedPermissions).map(([category, permissions]) => {
                  const categoryPermissions = permissions.filter(p => 
                    viewingRole.permissions?.includes(p.id)
                  );
                  
                  if (categoryPermissions.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <h6 className="mb-2 text-primary">{category}</h6>
                      <div className="row">
                        {categoryPermissions.map(permission => (
                          <div key={permission.id} className="col-md-6 mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {permission.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowStaffPermissionsModal(false);
                    handleEdit(viewingRole);
                  }}
                  disabled={viewingStaff.role === 'admin'}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Permissions
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowStaffPermissionsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .cursor-pointer {
            cursor: pointer;
          }
          .hover-bg:hover {
            background-color: #f8f9fa !important;
          }
          .menu-tree {
            max-height: 500px;
            overflow-y: auto;
          }
          .menu-tree::-webkit-scrollbar {
            width: 8px;
          }
          .menu-tree::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .menu-tree::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .menu-tree::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </div>
  );
};

export default Roles;