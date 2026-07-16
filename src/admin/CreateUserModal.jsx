import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateUserModal = ({ show, onClose, onUserCreated, editingUser }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',                 // <-- NEW FIELD
    identifier: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });

  const roles = ['ceo', 'loan_officer', 'supervisor', 'manager', 'admin','master_till'];

  useEffect(() => {
    if (editingUser) {
      setFormData({
        full_name: editingUser.full_name || '',
        username: editingUser.username || '',    // <-- populate username if exists
        identifier: editingUser.email || editingUser.phone || '',
        password: '',
        confirmPassword: '',
        role: editingUser.role || 'customer'
      });
    } else {
      resetForm();
    }
  }, [editingUser, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateIdentifier = (identifier) => {
    if (!identifier.trim()) {
      return 'Email or phone number is required';
    }
    
    // Check if it's an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    // Check if it's a phone number (10-12 digits)
    const cleaned = identifier.replace(/\D/g, '');
    const isPhone = /^\d{10,12}$/.test(cleaned);
    
    if (!isEmail && !isPhone) {
      return 'Enter a valid email or phone number (10-12 digits)';
    }
    
    return null;
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return false;
    }

    // NEW: Validate username
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return false;
    }

    const identifierError = validateIdentifier(formData.identifier);
    if (identifierError) {
      toast.error(identifierError);
      return false;
    }

    if (!editingUser) {
      if (!formData.password) {
        toast.error('Password is required');
        return false;
      }
      
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return false;
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        toast.error('Password must contain uppercase, lowercase, and a number');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }

    if (!formData.role) {
      toast.error('Role is required');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      username: '',        // reset username
      identifier: '',
      password: '',
      confirmPassword: '',
      role: 'customer'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const userData = {
        fullName: formData.full_name,
        username: formData.username,      // <-- include username
        identifier: formData.identifier,
        role: formData.role
      };

      if (!editingUser) {
        userData.password = formData.password;
        userData.confirmPassword = formData.confirmPassword;

        await axios.post(
          `${process.env.REACT_APP_API_URL}/signup2`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('User created successfully');
      } else {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/users/${editingUser.id}`,
          userData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('User updated successfully');
      }

      resetForm();
      onUserCreated?.();
      onClose();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierType = () => {
    if (!formData.identifier) return '';
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
    return isEmail ? 'email' : 'phone';
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>

              {/* NEW USERNAME FIELD */}
              <div className="mb-3">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username (letters, numbers, underscores)"
                  required
                  disabled={loading}
                />
                {formData.username && formData.username.length < 3 && (
                  <small className="text-danger">Username must be at least 3 characters</small>
                )}
                {formData.username && formData.username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(formData.username) && (
                  <small className="text-success">✓ Username available</small>
                )}
                {formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username) && (
                  <small className="text-danger">Only letters, numbers, and underscores allowed</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Email or Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  placeholder="Enter email or phone number (e.g., user@example.com or 0244123456)"
                  required
                  disabled={loading}
                />
                {formData.identifier && (
                  <small className="text-muted">
                    {getIdentifierType() === 'email' 
                      ? '✓ Email format detected' 
                      : getIdentifierType() === 'phone'
                      ? '✓ Phone number detected'
                      : 'Enter a valid email or phone number'}
                  </small>
                )}
              </div>

              {!editingUser && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password (min 8 characters)"
                      required
                      disabled={loading}
                    />
                    {formData.password && formData.password.length < 8 && (
                      <small className="text-danger">Password must be at least 8 characters</small>
                    )}
                    {formData.password && formData.password.length >= 8 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) && (
                      <small className="text-danger">Password must contain uppercase, lowercase, and a number</small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                      disabled={loading}
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <small className="text-danger">Passwords do not match</small>
                    )}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                      <small className="text-success">✓ Passwords match</small>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Role *</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;