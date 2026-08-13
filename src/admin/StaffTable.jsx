// components/Roles/StaffTable.js
import React from "react";
import {
  getRoleBadgeColor,
  getRoleDisplayName,
  getStatusBadge,
  displayContactInfo,
} from "./staffHelpers";

const StaffTable = ({
  staffMembers,
  onActionClick,
  openDropdownId,
  dropdownPosition,
  buttonRefs,
  dropdownRefs,
  loading,
}) => {
  const renderDropdown = (staff) => {
    if (openDropdownId !== staff.userId) return null;
    const status =
      staff.status?.toLowerCase() ||
      (staff.is_blocked
        ? "blocked"
        : staff.is_active === false
          ? "inactive"
          : "active");
    return (
      <div
        ref={(el) => (dropdownRefs.current[staff.userId] = el)}
        className="custom-dropdown-menu show"
        style={dropdownPosition}
      >
        <button
          className="dropdown-item"
          onClick={() => onActionClick("view", staff)}
        >
          <i className="bi bi-eye me-2"></i>View Permissions
        </button>
        <button
          className="dropdown-item"
          onClick={() => onActionClick("edit", staff)}
          disabled={staff.role === "admin"}
        >
          <i className="bi bi-pencil me-2"></i>Edit Role Permissions
        </button>
        <div className="dropdown-divider"></div>
        <button
          className="dropdown-item"
          onClick={() => onActionClick("resetPassword", staff)}
        >
          <i className="bi bi-key me-2"></i>Reset Password
        </button>
        {status === "active" && (
          <button
            className="dropdown-item text-warning"
            onClick={() => onActionClick("deactivate", staff)}
            disabled={staff.role === "admin"}
          >
            <i className="bi bi-pause-circle me-2"></i>Deactivate
          </button>
        )}
        {status === "inactive" && (
          <button
            className="dropdown-item text-success"
            onClick={() => onActionClick("activate", staff)}
            disabled={staff.role === "admin"}
          >
            <i className="bi bi-play-circle me-2"></i>Activate
          </button>
        )}
        {status === "blocked" ? (
          <button
            className="dropdown-item text-success"
            onClick={() => onActionClick("unblock", staff)}
            disabled={staff.role === "admin"}
          >
            <i className="bi bi-unlock me-2"></i>Unblock Login
          </button>
        ) : (
          status === "active" && (
            <button
              className="dropdown-item text-danger"
              onClick={() => onActionClick("block", staff)}
              disabled={staff.role === "admin"}
            >
              <i className="bi bi-lock me-2"></i>Block Login
            </button>
          )
        )}
      </div>
    );
  };

  const { text: statusText, class: statusClass } = getStatusBadge(
    staffMembers[0] || {},
  );
  // Note: status badge is dynamic per row, so we compute inside map.

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Contact Information</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffMembers.map((staff) => {
            const { text: statusText, class: statusClass } =
              getStatusBadge(staff);
            return (
              <tr key={staff.userId}>
                <td className="fw-semibold">
                  <span className="badge bg-secondary">#{staff.userId}</span>
                </td>
                <td className="fw-semibold">
                  {staff.full_name || staff.username || "—"}
                </td>
                <td>
                  <small>{displayContactInfo(staff)}</small>
                </td>
                <td>
                  <span className={`badge bg-${getRoleBadgeColor(staff.role)}`}>
                    {getRoleDisplayName(staff.role)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusClass}`}>{statusText}</span>
                </td>
                <td>
                  {staff.created_at
                    ? new Date(staff.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="position-relative">
                  <div className="custom-dropdown">
                    <button
                      ref={(el) => (buttonRefs.current[staff.userId] = el)}
                      className="btn btn-sm btn-secondary dropdown-toggle"
                      type="button"
                      onClick={(e) => onActionClick("toggleDropdown", staff, e)}
                    >
                      <i className="bi bi-gear me-1"></i>Actions
                    </button>
                    {renderDropdown(staff)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTable;
