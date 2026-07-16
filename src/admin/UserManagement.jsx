import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateUserModal from './CreateUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const roles = ['ceo', 'loan_officer', 'supervisor', 'manager', 'admin','master_till'];

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/getusers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setFilteredUsers([]);
      setShowTable(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleFilter = () => {
    if (!selectedRole) {
      toast.warning('Please select a role to filter');
      return;
    }
    
    const filtered = users.filter(user => user.role === selectedRole);
    setFilteredUsers(filtered);
    setShowTable(true);
    
    if (filtered.length === 0) {
      toast.info(`No users found with role: ${selectedRole}`);
    } else {
      toast.success(`Found ${filtered.length} user(s) with role: ${selectedRole}`);
    }
  };

  const handleResetFilter = () => {
    setSelectedRole('');
    setFilteredUsers([]);
    setShowTable(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Reset password for this user? A temporary password will be sent.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.REACT_APP_API_URL}/users/${userId}/reset-password`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Password reset email sent');
      } catch (error) {
        console.error('Error resetting password:', error);
        toast.error('Failed to reset password');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleUserCreated = () => {
    fetchUsers();
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'bg-danger',
      'manager': 'bg-primary',
      'supervisor': 'bg-warning',
      'loan_officer': 'bg-info',
      'customer': 'bg-success'
    };
    return colors[role] || 'bg-secondary';
  };

  const displayUsers = showTable ? filteredUsers : [];

  return (
    <div className="user-management-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 className="mb-1">User Management</h4>
          <p className="text-muted mb-0">Filter users by role to view details</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-person-plus me-2"></i>
          Create User
        </button>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label fw-semibold">Find by Role</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleRoleFilter}
                  disabled={!selectedRole}
                >
                  <i className="bi bi-filter me-2"></i>
                  Find Users
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleResetFilter}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - Only show after filter */}
      {showTable && displayUsers.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card bg-primary bg-opacity-10 border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Filtered Users</h6>
                    <h3 className="mb-0">{displayUsers.length}</h3>
                  </div>
                  <i className="bi bi-people fs-1 text-primary"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-info bg-opacity-10 border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Selected Role</h6>
                    <h3 className="mb-0 text-capitalize">{selectedRole}</h3>
                  </div>
                  <i className="bi bi-tag fs-1 text-info"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-success bg-opacity-10 border-0">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total in System</h6>
                    <h3 className="mb-0">{users.length}</h3>
                  </div>
                  <i className="bi bi-database fs-1 text-success"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table - Only shown after filter */}
      {showTable ? (
        <div className="card">
          <div className="card-header bg-white">
            <h6 className="mb-0">
              {displayUsers.length > 0 
                ? `Users with role: ${selectedRole.toUpperCase()}`
                : `No users found with role: ${selectedRole.toUpperCase()}`}
            </h6>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading users...</p>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center p-5">
                <i className="bi bi-people fs-1 text-muted"></i>
                <p className="mt-2 text-muted">
                  No users found with role: {selectedRole}
                </p>
                <button
                  className="btn btn-outline-primary mt-2"
                  onClick={handleResetFilter}
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email/Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="fw-semibold">{user.full_name || '—'}</td>
                        <td>{user.email || user.phone || '—'}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                            {user.role?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleResetPassword(user.id)}
                            title="Reset Password"
                          >
                            <i className="bi bi-key"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-funnel fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted">No Data to Display</h5>
            <p className="text-muted mb-0">
              Please select a role and click "Find Users" to view user details
            </p>
            <div className="mt-3">
              <select
                className="form-select w-auto d-inline-block me-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="">Select role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleRoleFilter}
                disabled={!selectedRole}
              >
                <i className="bi bi-filter me-2"></i>
                Find Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      <CreateUserModal
        show={showModal}
        onClose={handleCloseModal}
        onUserCreated={handleUserCreated}
        editingUser={editingUser}
        roles={roles}
      />
    </div>
  );
};

export default UserManagement;