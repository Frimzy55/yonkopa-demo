import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { menuItems } from '../menuItems';

// ============================================================
// HELPER FUNCTIONS TO GENERATE PERMISSIONS FROM MENU ITEMS
// ============================================================

const getPermissionId = (menuName, subMenuName = null, itemName = null) => {
  if (itemName && subMenuName) {
    return `${menuName.toLowerCase()}_${subMenuName.toLowerCase().replace(/ /g, '_')}_${itemName.toLowerCase().replace(/ /g, '_')}`;
  } else if (subMenuName) {
    return `${menuName.toLowerCase()}_${subMenuName.toLowerCase().replace(/ /g, '_')}`;
  }
  return menuName.toLowerCase().replace(/ /g, '_');
};

const flattenPermissions = (items, parentMenu = null, parentSubMenu = null) => {
  let permissions = [];
  for (const item of items) {
    if (item.reports && Array.isArray(item.reports)) {
      for (const report of item.reports) {
        const id = getPermissionId(parentMenu, parentSubMenu, report.name);
        permissions.push({ id, name: report.name, category: parentMenu });
      }
    }
    if (item.nestedMenus && Array.isArray(item.nestedMenus)) {
      permissions.push(...flattenPermissions(item.nestedMenus, parentMenu, item.name));
    }
    if (item.subMenus && Array.isArray(item.subMenus)) {
      const subMenuId = getPermissionId(item.name, item.name);
      permissions.push({ id: subMenuId, name: item.name, category: item.name });
      permissions.push(...flattenPermissions(item.subMenus, item.name, null));
    }
    else if (!item.subMenus && !item.nestedMenus && !item.reports && item.name !== 'Dashboard') {
      const id = parentSubMenu 
        ? getPermissionId(parentMenu, parentSubMenu, item.name)
        : getPermissionId(parentMenu, null, item.name);
      permissions.push({ id, name: item.name, category: parentMenu || item.name });
    }
  }
  return permissions;
};

const getAllPermissionsFromMenu = () => {
  const perms = flattenPermissions(menuItems);
  const unique = {};
  perms.forEach(p => { unique[p.id] = p; });
  return Object.values(unique);
};

// ============================================================
// IMPROVED GROUPING WITH HUMAN-READABLE NAMES
// ============================================================
const formatPermissionName = (permId) => {
  const parts = permId.split('_');
  let lastPart = parts[parts.length - 1];
  return lastPart
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const groupPermissionsByCategory = (permissions, availablePermissions) => {
  const grouped = {};
  permissions.forEach((permId) => {
    let matched = availablePermissions.find(p => p.id === permId);
    let displayName;
    if (matched && matched.name) {
      displayName = matched.name;
    } else {
      displayName = formatPermissionName(permId);
    }
    let category = matched?.category || permId.split('_')[0];
    category = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({
      id: permId,
      name: displayName,
    });
  });
  return grouped;
};

// ============================================================
// HIERARCHICAL PERMISSION HELPERS
// ============================================================

// Find a menu item by its permission ID (returns the item and its path)
const findMenuItemByPermissionId = (permissionId, items = menuItems, path = []) => {
  for (const item of items) {
    let currentId;
    if (path.length === 0) {
      currentId = getPermissionId(item.name);
    } else if (path.length === 1) {
      currentId = getPermissionId(path[0], item.name);
    } else if (path.length === 2) {
      currentId = getPermissionId(path[0], path[1], item.name);
    } else {
      continue;
    }

    if (currentId === permissionId) {
      return { item, path };
    }

    if (item.subMenus) {
      const found = findMenuItemByPermissionId(permissionId, item.subMenus, [...path, item.name]);
      if (found) return found;
    }
    if (item.nestedMenus) {
      const found = findMenuItemByPermissionId(permissionId, item.nestedMenus, [...path, item.name]);
      if (found) return found;
    }
  }
  return null;
};

// Get all descendant permission IDs for a given permission ID
const getAllDescendantIds = (permissionId) => {
  const result = findMenuItemByPermissionId(permissionId);
  if (!result) return [];

  const { item, path } = result;
  const descendants = new Set();

  const collect = (currentItem, currentPath) => {
    if (currentItem.subMenus) {
      currentItem.subMenus.forEach(sub => {
        const subId = getPermissionId(currentPath[0], sub.name);
        descendants.add(subId);
        collect(sub, [currentPath[0], sub.name]);
      });
    }
    if (currentItem.nestedMenus) {
      currentItem.nestedMenus.forEach(nested => {
        let nestedId;
        if (currentPath.length === 1) {
          nestedId = getPermissionId(currentPath[0], null, nested.name);
        } else {
          nestedId = getPermissionId(currentPath[0], currentPath[1], nested.name);
        }
        descendants.add(nestedId);
        collect(nested, [...currentPath, nested.name]);
      });
    }
    if (currentItem.reports) {
      currentItem.reports.forEach(report => {
        const reportId = currentPath.length === 1
          ? getPermissionId(currentPath[0], null, report.name)
          : getPermissionId(currentPath[0], currentPath[1], report.name);
        descendants.add(reportId);
      });
    }
  };

  collect(item, path.length ? path : [item.name]);
  return Array.from(descendants);
};

// Get immediate parent permission ID
const getParentPermissionId = (permissionId) => {
  const found = findMenuItemByPermissionId(permissionId);
  if (!found || found.path.length === 0) return null;
  const { path } = found;
  if (path.length === 1) return getPermissionId(path[0]);
  if (path.length === 2) return getPermissionId(path[0], path[1]);
  return null;
};

// Update parent checkboxes after a child change
const updateParentCheckboxes = (changedId, currentPermissionsSet) => {
  let parentId = getParentPermissionId(changedId);
  const visited = new Set();
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const children = getAllDescendantIds(parentId);
    const allChildrenSelected = children.length > 0 && children.every(child => currentPermissionsSet.has(child));
    const isParentSelected = currentPermissionsSet.has(parentId);
    if (allChildrenSelected && !isParentSelected) {
      currentPermissionsSet.add(parentId);
    } else if (!allChildrenSelected && isParentSelected) {
      currentPermissionsSet.delete(parentId);
    }
    parentId = getParentPermissionId(parentId);
  }
};

// ============================================================
// ROLES COMPONENT
// ============================================================
const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStaffPermissionsModal, setShowStaffPermissionsModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStaffMembers, setFilteredStaffMembers] = useState([]);
  const searchTimeoutRef = useRef(null);
  
  const dropdownRefs = useRef({});
  const buttonRefs = useRef({});

  const availablePermissions = getAllPermissionsFromMenu();

  // ======================== Helper functions ========================
  const getRoleDisplayName = (roleName) => {
    const names = {
      'loan_officer': 'Loan Officer',
      'supervisor': 'Supervisor',
      'manager': 'Manager',
      'admin': 'Admin',
      'master_till': 'Master Till'   // ✅ ADDED
    };
    return names[roleName] || roleName;
  };

  const getStatusText = (user) => {
    if (user.status) {
      switch(user.status.toLowerCase()) {
        case 'active': return 'Active';
        case 'inactive': return 'Inactive';
        case 'blocked': return 'Blocked';
        default: return user.status;
      }
    }
    if (user.is_blocked) return 'Blocked';
    if (user.is_active === false) return 'Inactive';
    return 'Active';
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      'admin': 'primary',
      'manager': 'primary',
      'supervisor': 'primary',
      'loan_officer': 'primary',
      'master_till': 'info'          // ✅ ADDED (or use 'primary' / 'secondary')
    };
    return colors[roleName] || 'secondary';
  };

  const getStatusBadge = (user) => {
    if (user.status) {
      switch(user.status.toLowerCase()) {
        case 'active': return <span className="badge bg-success">Active</span>;
        case 'inactive': return <span className="badge bg-secondary">Inactive</span>;
        case 'blocked': return <span className="badge bg-danger">Blocked</span>;
        default: return <span className="badge bg-secondary">{user.status}</span>;
      }
    }
    if (user.is_blocked) return <span className="badge bg-danger">Blocked</span>;
    if (user.is_active === false) return <span className="badge bg-secondary">Inactive</span>;
    return <span className="badge bg-success">Active</span>;
  };

  const displayContactInfo = (user) => {
    const hasEmail = user.email && user.email.trim() !== '';
    const hasPhone = user.phone && user.phone.trim() !== '';
    if (hasEmail && hasPhone) return `${user.email} / ${user.phone}`;
    if (hasEmail) return user.email;
    if (hasPhone) return user.phone;
    return '—';
  };

  // ======================== Staff list and filtering ========================
  const getStaffMembers = useCallback(() => {
    const staffRoles = ['loan_officer', 'supervisor', 'manager', 'admin', 'master_till'];   // ✅ ADDED
    return users.filter(user => staffRoles.includes(user.role));
  }, [users]);

  const filterStaff = useCallback((staffList, term) => {
    if (!term.trim()) return staffList;
    const lowerTerm = term.toLowerCase();
    return staffList.filter(staff => {
      const userIdMatch = staff.userId?.toString().includes(lowerTerm);
      const usernameMatch = staff.username?.toLowerCase().includes(lowerTerm);
      const fullNameMatch = staff.full_name?.toLowerCase().includes(lowerTerm);
      const emailMatch = staff.email?.toLowerCase().includes(lowerTerm);
      const phoneMatch = staff.phone?.toLowerCase().includes(lowerTerm);
      const roleMatch = getRoleDisplayName(staff.role).toLowerCase().includes(lowerTerm);
      const statusMatch = getStatusText(staff).toLowerCase().includes(lowerTerm);
      return userIdMatch || usernameMatch || fullNameMatch || emailMatch || phoneMatch || roleMatch || statusMatch;
    });
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      const staffList = getStaffMembers();
      const filtered = filterStaff(staffList, searchTerm);
      setFilteredStaffMembers(filtered);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [users, searchTerm, getStaffMembers, filterStaff]);

  // ======================== API calls ========================
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/getusers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mappedUsers = response.data.map(user => ({
        ...user,
        userId: user.id,
        is_active: user.status === 'active',
        is_blocked: user.status === 'blocked'
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ======================== Permission rendering helpers ========================
  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const toggleSubMenu = (menuName, subMenuName) => {
    const key = `${menuName}_${subMenuName}`;
    setExpandedSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNestedMenu = (menuName, subMenuName, nestedName) => {
    const key = `${menuName}_${subMenuName}_${nestedName}`;
    setExpandedNestedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPermissionSelected = (permissionId) => {
    return formData.permissions.includes(permissionId);
  };

  // ======================== HIERARCHICAL TOGGLE ========================
  const handleMenuPermissionChange = (permissionId) => {
    setFormData(prev => {
      const newSet = new Set(prev.permissions);
      const isCurrentlySelected = newSet.has(permissionId);

      if (isCurrentlySelected) {
        newSet.delete(permissionId);
        const descendants = getAllDescendantIds(permissionId);
        descendants.forEach(id => newSet.delete(id));
      } else {
        newSet.add(permissionId);
        const descendants = getAllDescendantIds(permissionId);
        descendants.forEach(id => newSet.add(id));
      }

      updateParentCheckboxes(permissionId, newSet);
      return { ...prev, permissions: Array.from(newSet) };
    });
  };

  // ======================== Render functions ========================
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
                  <div className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer" style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}>
                    <i className={`bi ${expandedNestedMenus[nestedKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}
                      onClick={() => toggleNestedMenu(menuName, subMenuName, nested.name)}
                      style={{ cursor: 'pointer' }}></i>
                    <input type="checkbox" className="form-check-input me-2" id={permissionId}
                      checked={isPermissionSelected(permissionId)}
                      onChange={() => handleMenuPermissionChange(permissionId)} />
                    <i className={`${nested.icon} me-2 text-primary`}></i>
                    <label className="form-check-label fw-semibold" htmlFor={permissionId}>{nested.name}</label>
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
                  <input type="checkbox" className="form-check-input me-2" id={permissionId}
                    checked={isPermissionSelected(permissionId)}
                    onChange={() => handleMenuPermissionChange(permissionId)} />
                  <i className={`${nested.icon} me-2 text-secondary`}></i>
                  <label className="form-check-label" htmlFor={permissionId}>{nested.name}</label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

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
                  <div className="d-flex align-items-center p-2 rounded hover-bg cursor-pointer" style={{ cursor: 'pointer', backgroundColor: '#e9ecef' }}>
                    <i className={`bi ${expandedSubMenus[subMenuKey] ? 'bi-chevron-down' : 'bi-chevron-right'} me-2 text-info`}
                      onClick={() => toggleSubMenu(menuName, subMenu.name)}
                      style={{ cursor: 'pointer' }}></i>
                    <input type="checkbox" className="form-check-input me-2" id={permissionId}
                      checked={isPermissionSelected(permissionId)}
                      onChange={() => handleMenuPermissionChange(permissionId)} />
                    <i className={`${subMenu.icon} me-2 text-primary`}></i>
                    <label className="form-check-label fw-semibold" htmlFor={permissionId}>{subMenu.name}</label>
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
                  <input type="checkbox" className="form-check-input me-2" id={permissionId}
                    checked={isPermissionSelected(permissionId)}
                    onChange={() => handleMenuPermissionChange(permissionId)} />
                  <i className={`${subMenu.icon} me-2 text-secondary`}></i>
                  <label className="form-check-label" htmlFor={permissionId}>{subMenu.name}</label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // ======================== User action handlers ========================
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
        userId: selectedStaff.userId,
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

  const handleActivateStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to activate ${staff.full_name}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/activate-user/${staff.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${staff.full_name} has been activated successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate staff');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleDeactivateStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to deactivate ${staff.full_name}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/deactivate-user/${staff.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${staff.full_name} has been deactivated successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate staff');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleBlockLogin = async (staff) => {
    if (!window.confirm(`Are you sure you want to block login for ${staff.full_name}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/block-user/${staff.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Login blocked for ${staff.full_name}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to block login');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleUnblockLogin = async (staff) => {
    if (!window.confirm(`Are you sure you want to unblock login for ${staff.full_name}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/unblock-user/${staff.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Login unblocked for ${staff.full_name}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unblock login');
    } finally {
      setLoading(false);
      setOpenDropdown(null);
    }
  };

  const handleRemovePermission = async (staff, taskName) => {
    if (!window.confirm(`Remove permission "${taskName}" from ${staff.full_name}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/remove-task`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: staff.userId, task: taskName }
      });
      toast.success(`Permission "${taskName}" removed successfully`);
      
      if (viewingStaff && viewingStaff.userId === staff.userId && viewingRole) {
        const updatedPermissions = viewingRole.permissions.filter(p => p !== taskName);
        setViewingRole({
          ...viewingRole,
          permissions: updatedPermissions
        });
      }
      fetchUsers();
    } catch (error) {
      console.error('Error removing permission:', error);
      toast.error(error.response?.data?.message || 'Failed to remove permission');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStaffPermissions = async (staff) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-tasks/${staff.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const permissions = response.data.tasks || [];
      setViewingStaff(staff);
      setViewingRole({
        name: staff.role,
        description: `${staff.role} permissions`,
        permissions
      });
      setShowStaffPermissionsModal(true);
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error fetching staff permissions:", error);
      toast.error(error.response?.data?.message || "Failed to fetch staff permissions");
    }
  };

  const handleEditStaffRole = async (staff) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-tasks/${staff.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const permissions = res.data.tasks || [];
      setEditingStaff(staff);
      setFormData({
        name: staff.role,
        description: `${staff.role} permissions`,
        permissions: permissions
      });
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load staff permissions");
    } finally {
      setOpenDropdown(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingStaff) {
        await axios.post(`${process.env.REACT_APP_API_URL}/assign-tasks`, {
          userId: editingStaff.userId,
          staff_name: editingStaff.full_name,
          tasks: formData.permissions
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success(`Permissions updated successfully for ${editingStaff.full_name}`);
        await fetchUsers(); // ✅ Refresh user data so sidebar updates
      } else if (editingRole) {
        const updatedRoles = roles.map((role) =>
          role.name === editingRole.name ? { ...role, ...formData } : role
        );
        setRoles(updatedRoles);
        toast.success("Role updated successfully");
      } else {
        const newRole = {
          id: roles.length + 2,
          name: formData.name.toLowerCase().replace(/\s/g, "_"),
          description: formData.description,
          permissions: formData.permissions
        };
        setRoles([...roles, newRole]);
        toast.success("Role created successfully");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error(error.response?.data?.message || "Failed to save permissions/tasks");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
    setEditingRole(null);
    setEditingStaff(null);
    setShowModal(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const toggleDropdown = (staffId, event) => {
    event.stopPropagation();
    if (openDropdown === staffId) {
      setOpenDropdown(null);
      setDropdownPosition({});
      return;
    }
    const button = event.currentTarget;
    if (button && button.getBoundingClientRect) {
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 450;
      let top, bottom;
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        bottom = viewportHeight - rect.top + 10;
        top = 'auto';
      } else {
        top = rect.bottom + 5;
        bottom = 'auto';
      }
      setDropdownPosition({
        position: 'fixed',
        top: top,
        bottom: bottom,
        left: rect.left,
        zIndex: 9999
      });
    }
    setOpenDropdown(staffId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.custom-dropdown') && !event.target.closest('.dropdown-item')) {
        setOpenDropdown(null);
        setDropdownPosition({});
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const staffMembers = getStaffMembers();

  return (
    <div className="roles-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">Staff Management</h4>
          <p className="text-muted mb-0">Manage staff members, roles, and permissions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="text-muted mb-1">Total Staff</h6><h3 className="mb-0">{staffMembers.length}</h3></div>
                <i className="bi bi-people fs-1 text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="text-muted mb-1">Loan Officers</h6><h3 className="mb-0">{staffMembers.filter(u => u.role === 'loan_officer').length}</h3></div>
                <i className="bi bi-person-check fs-1 text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="text-muted mb-1">Supervisors</h6><h3 className="mb-0">{staffMembers.filter(u => u.role === 'supervisor').length}</h3></div>
                <i className="bi bi-person-badge fs-1 text-warning"></i>
              </div>
            </div>
          </div>
        </div>
        {/* ✅ NEW CARD FOR MASTER TILL */}
        <div className="col-md-3 mb-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Master Till</h6>
                  <h3 className="mb-0">{staffMembers.filter(u => u.role === 'master_till').length}</h3>
                </div>
                <i className="bi bi-cash-stack fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
        {/* End of new card */}
        <div className="col-md-3 mb-3">
          <div className="card bg-info bg-opacity-10 border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="text-muted mb-1">Managers & Admins</h6><h3 className="mb-0">{staffMembers.filter(u => u.role === 'manager' || u.role === 'admin').length}</h3></div>
                <i className="bi bi-shield-lock fs-1 text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Table with integrated search bar */}
      <div className="card">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-3">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            All Staff Members
            {searchTerm && <span className="badge bg-secondary ms-2">Filtered</span>}
          </h5>
          <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center">
            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, ID, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
          <div className="text-muted small w-100 mt-1">
            <i className="bi bi-info-circle me-1"></i>
            Showing {filteredStaffMembers.length} of {staffMembers.length} staff members
          </div>
        </div>
        <div className="card-body">
          {loading && !staffMembers.length ? (
            <div className="text-center p-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Loading staff members...</p></div>
          ) : filteredStaffMembers.length === 0 ? (
            <div className="text-center p-5">
              <i className="bi bi-people fs-1 text-muted"></i>
              <p className="mt-2 text-muted">
                {searchTerm ? 'No staff members match your search.' : 'No staff members found.'}
              </p>
              {searchTerm && (
                <button className="btn btn-sm btn-outline-primary" onClick={handleClearSearch}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Contact Information</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffMembers.map((staff) => (
                    <tr key={staff.userId}>
                      <td className="fw-semibold"><span className="badge bg-secondary">#{staff.userId}</span></td>
                      <td>{staff.username || '—'}</td>
                      <td className="fw-semibold">{staff.full_name || staff.username || '—'}</td>
                      <td><small>{displayContactInfo(staff)}</small></td>
                      <td><span className={`badge bg-${getRoleBadgeColor(staff.role)}`}>{getRoleDisplayName(staff.role)}</span></td>
                      <td>{getStatusBadge(staff)}</td>
                      <td>{staff.created_at ? new Date(staff.created_at).toLocaleDateString() : '—'}</td>
                      <td className="position-relative">
                        <div className="custom-dropdown">
                          <button ref={el => buttonRefs.current[staff.userId] = el} className="btn btn-sm btn-secondary dropdown-toggle" type="button" onClick={(e) => toggleDropdown(staff.userId, e)}>
                            <i className="bi bi-gear me-1"></i>Actions
                          </button>
                          {openDropdown === staff.userId && (
                            <div ref={el => dropdownRefs.current[staff.userId] = el} className="custom-dropdown-menu show" style={dropdownPosition}>
                              <button className="dropdown-item" onClick={() => handleViewStaffPermissions(staff)}><i className="bi bi-eye me-2"></i>View Permissions</button>
                              <button className="dropdown-item" onClick={() => handleEditStaffRole(staff)} disabled={staff.role === 'admin'}><i className="bi bi-pencil me-2"></i>Edit Role Permissions</button>
                              <div className="dropdown-divider"></div>
                              <button className="dropdown-item" onClick={() => handleResetPassword(staff)}><i className="bi bi-key me-2"></i>Reset Password</button>
                              {staff.status === 'active' ? (
                                <button className="dropdown-item text-warning" onClick={() => handleDeactivateStaff(staff)} disabled={staff.role === 'admin'}><i className="bi bi-pause-circle me-2"></i>Deactivate</button>
                              ) : staff.status === 'inactive' ? (
                                <button className="dropdown-item text-success" onClick={() => handleActivateStaff(staff)} disabled={staff.role === 'admin'}><i className="bi bi-play-circle me-2"></i>Activate</button>
                              ) : null}
                              {staff.status === 'blocked' ? (
                                <button className="dropdown-item text-success" onClick={() => handleUnblockLogin(staff)} disabled={staff.role === 'admin'}><i className="bi bi-unlock me-2"></i>Unblock Login</button>
                              ) : staff.status === 'active' ? (
                                <button className="dropdown-item text-danger" onClick={() => handleBlockLogin(staff)} disabled={staff.role === 'admin'}><i className="bi bi-lock me-2"></i>Block Login</button>
                              ) : null}
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
                <h5 className="modal-title"><i className="bi bi-key me-2"></i>Reset Password for: {selectedStaff.full_name} (ID #{selectedStaff.userId})</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResetPasswordModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                  <small className="text-muted">Password must be at least 6 characters long</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetPasswordModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitPasswordReset} disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</> : 'Reset Password'}
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
                  {editingRole ? (editingStaff ? <><i className="bi bi-person-badge me-2"></i>Editing Permissions for: {editingStaff.full_name} (ID #{editingStaff.userId})</> : <><i className="bi bi-pencil-square me-2"></i>Edit Role: {editingRole.name.replace('_', ' ').toUpperCase()}</>) : <><i className="bi bi-plus-circle me-2"></i>Create New Role & Assign Permissions</>}
                </h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {editingStaff && (
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <strong>Editing permissions for staff member:</strong> {editingStaff.full_name} (ID #{editingStaff.userId})<br />
                      <small className="text-muted">Role: {getRoleDisplayName(editingStaff.role)} | Status: {getStatusBadge(editingStaff)}</small>
                    </div>
                  )}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Role Name *</label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter role name" disabled={editingRole?.name === 'admin' || !!editingStaff} />
                      {editingStaff && <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Role name cannot be changed when editing staff permissions</small>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Description</label>
                      <input type="text" className="form-control" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief description of the role" />
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Menu Permissions (Click on blue headings to expand)</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleSelectAllPermissions}>Select All Permissions</button>
                  </div>
                  <div className="menu-tree">
                    {menuItems.map((menu, idx) => {
                      const menuPermissionId = getPermissionId(menu.name);
                      return (
                        <div key={idx} className="mb-3 border rounded">
                          <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-top cursor-pointer" style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                              <i className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-down' : 'bi-chevron-right'} me-3 text-primary fs-5`} onClick={() => toggleMenu(menu.name)} style={{ cursor: 'pointer' }}></i>
                              <input type="checkbox" className="form-check-input me-3" id={menuPermissionId} checked={isPermissionSelected(menuPermissionId)} onChange={() => handleMenuPermissionChange(menuPermissionId)} disabled={menu.name === 'Dashboard'} />
                              <i className={`${menu.icon} me-3 text-primary fs-4`}></i>
                              <label className="form-check-label h5 mb-0 text-primary" htmlFor={menuPermissionId}>{menu.name}</label>
                            </div>
                            <div className="d-flex align-items-center">
                              {menu.subMenus && menu.subMenus.length > 0 && <span className="badge bg-primary me-2">{menu.subMenus.length} items</span>}
                              <i className={`bi ${expandedMenus[menu.name] ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`} onClick={() => toggleMenu(menu.name)} style={{ cursor: 'pointer' }}></i>
                            </div>
                          </div>
                          {expandedMenus[menu.name] && (
                            <div className="p-3 border-top">
                              {menu.subMenus && menu.subMenus.length > 0 ? renderSubMenus(menu.subMenus, menu.name) : <div className="text-muted text-center py-3"><i className="bi bi-info-circle me-2"></i>No sub-menus available</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>{editingStaff ? 'Updating Permissions...' : 'Saving...'}</> : (editingRole ? (editingStaff ? 'Update Staff Permissions' : 'Update Role') : 'Update Role')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Permissions Modal – Grouped by Category (improved display) */}
      {showStaffPermissionsModal && viewingStaff && viewingRole && (() => {
        const groupedViewPermissions = groupPermissionsByCategory(
          viewingRole.permissions,
          availablePermissions
        );
        return (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-light">
                  <h5 className="modal-title">
                    <i className="bi bi-person-badge me-2"></i>
                    Permissions for: {viewingStaff.full_name} (User ID: #{viewingStaff.userId})
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowStaffPermissionsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-4"><p><strong>User ID:</strong> #{viewingStaff.userId}</p></div>
                    <div className="col-md-4"><p><strong>Staff Name:</strong> {viewingStaff.full_name}</p></div>
                    <div className="col-md-4"><p><strong>Role:</strong> <span className={`badge bg-${getRoleBadgeColor(viewingStaff.role)} ms-2`}>{getRoleDisplayName(viewingStaff.role)}</span></p></div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-12"><p><strong>Role Description:</strong> {viewingRole.description || 'No description'}</p></div>
                  </div>
                  <hr />
                  <h6 className="mb-3">Assigned Permissions ({viewingRole.permissions?.length || 0})</h6>
                  {Object.keys(groupedViewPermissions).length > 0 ? (
                    Object.entries(groupedViewPermissions).map(([category, perms]) => (
                      <div key={category} className="mb-3 border rounded p-2">
                        <div className="fw-bold text-primary mb-2 text-uppercase">
                          {category}
                        </div>
                        {perms.map((perm, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              <span>{perm.name}</span>
                              <small className="text-muted ms-2">(ID: {perm.id})</small>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemovePermission(viewingStaff, perm.id)}
                              disabled={loading}
                              title="Remove this permission"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      No permissions assigned to this staff member.
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStaffPermissionsModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        .cursor-pointer { cursor: pointer; }
        .hover-bg:hover { background-color: #f8f9fa !important; }
        .menu-tree { max-height: 500px; overflow-y: auto; }
        .menu-tree::-webkit-scrollbar { width: 8px; }
        .menu-tree::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .menu-tree::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        .menu-tree::-webkit-scrollbar-thumb:hover { background: #555; }
        .custom-dropdown { position: relative; display: inline-block; }
        .custom-dropdown-menu { min-width: 240px; padding: 0.5rem 0; margin: 0; font-size: 0.875rem; color: #212529; text-align: left; list-style: none; background-color: #fff; background-clip: padding-box; border: 1px solid rgba(0,0,0,0.15); border-radius: 0.375rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.175); }
        .custom-dropdown-menu .dropdown-item { display: flex; align-items: center; width: 100%; padding: 0.6rem 1rem; clear: both; font-weight: 400; color: #212529; text-align: inherit; text-decoration: none; white-space: nowrap; background-color: transparent; border: 0; cursor: pointer; transition: all 0.2s ease; }
        .custom-dropdown-menu .dropdown-item:hover { background-color: #f8f9fa; color: #0d6efd; }
        .custom-dropdown-menu .dropdown-item:active { background-color: #e9ecef; }
        .custom-dropdown-menu .dropdown-item.disabled, .custom-dropdown-menu .dropdown-item:disabled { color: #6c757d; pointer-events: none; background-color: transparent; cursor: not-allowed; opacity: 0.6; }
        .custom-dropdown-menu .dropdown-divider { height: 0; margin: 0.5rem 0; overflow: hidden; border-top: 1px solid #e9ecef; }
        .custom-dropdown-menu .text-warning { color: #ffc107 !important; }
        .custom-dropdown-menu .text-success { color: #198754 !important; }
        .custom-dropdown-menu .text-danger { color: #dc3545 !important; }
        .custom-dropdown-menu .dropdown-item.text-warning:hover { background-color: #fff3cd; color: #ffc107 !important; }
        .custom-dropdown-menu .dropdown-item.text-success:hover { background-color: #d1e7dd; color: #198754 !important; }
        .custom-dropdown-menu .dropdown-item.text-danger:hover { background-color: #f8d7da; color: #dc3545 !important; }
      `}</style>
    </div>
  );
};

export default Roles;