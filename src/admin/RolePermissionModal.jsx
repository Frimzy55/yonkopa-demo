// components/Roles/RolePermissionModal.js
import React from "react";
import MenuTree from "./MenuTree";
import {
  getRoleDisplayName,
  getStatusBadge,
} from "./staffHelpers";

const RolePermissionModal = ({
  editingStaff,
  formData,
  onInputChange,
  onPermissionChange,
  onSelectAll,
  expandedMenus,
  expandedSubMenus,
  expandedNestedMenus,
  onToggleMenu,
  onToggleSubMenu,
  onToggleNestedMenu,
  menuItems,
  onSubmit,
  onClose,
  loading,
}) => {
  return (
    <>
      <style>{`
  /* =====================================================
     FULL SCREEN ROLE PERMISSION MODAL
     ===================================================== */

  .role-permission-overlay {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    overflow: hidden !important;
    padding: 0 !important;
  }

  .role-permission-dialog {
    width: 99vw !important;
    max-width: 99vw !important;
    height: 99vh !important;
    max-height: 99vh !important;
    margin: 0.5vh auto !important;
    padding: 0 !important;
  }

  .role-permission-content {
    width: 100% !important;
    max-width: 100% !important;
    height: 99vh !important;
    max-height: 99vh !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* =====================================================
     HEADER
     ===================================================== */

  .role-permission-header {
    flex-shrink: 0 !important;
    min-height: 60px !important;
    padding: 12px 20px !important;
    background: #f8f9fa !important;
    border-bottom: 1px solid #dee2e6 !important;
  }

  .role-permission-title {
    color: #0d6efd !important;
    font-size: 1.35rem !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  /* =====================================================
     FORM
     ===================================================== */

  .role-permission-form {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    height: calc(99vh - 60px) !important;
    overflow: hidden !important;
  }

  /* =====================================================
     BODY
     ===================================================== */

  .role-permission-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    height: auto !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 20px 28px !important;
  }

  /* =====================================================
     PERMISSION TREE
     ===================================================== */

  .role-permission-body .menu-tree-container {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* =====================================================
     FOOTER
     ===================================================== */

  .role-permission-footer {
    flex-shrink: 0 !important;
    min-height: 58px !important;
    padding: 9px 20px !important;
    background: #fff !important;
    border-top: 1px solid #dee2e6 !important;
  }

  /* =====================================================
     MOBILE
     ===================================================== */

  @media (max-width: 768px) {
    .role-permission-dialog {
      width: 99vw !important;
      max-width: 99vw !important;
      height: 99vh !important;
      max-height: 99vh !important;
      margin: 0.5vh auto !important;
    }

    .role-permission-content {
      width: 100% !important;
      height: 99vh !important;
      max-height: 99vh !important;
      border-radius: 6px !important;
    }

    .role-permission-header {
      min-height: 52px !important;
      padding: 10px 12px !important;
    }

    .role-permission-title {
      font-size: 1.1rem !important;
    }

    .role-permission-body {
      padding: 14px !important;
    }

    .role-permission-footer {
      min-height: 52px !important;
      padding: 8px 12px !important;
    }
  }
`}</style>

      <div
        className="modal show d-block role-permission-overlay"
        tabIndex="-1"
      >
        <div className="modal-dialog role-permission-dialog">
          <div className="modal-content role-permission-content">

            {/* =================================================
                HEADER
                ================================================= */}
            <div className="modal-header role-permission-header">
              <h5 className="modal-title role-permission-title">
                {editingStaff ? (
                  <>
                    <i className="bi bi-person-badge me-2"></i>
                    Editing Permissions for:{" "}
                    {editingStaff.full_name}{" "}
                    (ID #{editingStaff.userId})
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Create New Role & Assign Permissions
                  </>
                )}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* =================================================
                FORM
                ================================================= */}
            <form
              onSubmit={onSubmit}
              className="role-permission-form"
            >
              {/* =================================================
                  BODY
                  ================================================= */}
              <div className="modal-body role-permission-body">

                {/* STAFF INFORMATION */}
                {editingStaff && (
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle-fill me-2"></i>

                    <strong>
                      Editing permissions for staff member:
                    </strong>{" "}
                    {editingStaff.full_name}{" "}
                    (ID #{editingStaff.userId})

                    <br />

                    <small className="text-muted">
                      Role:{" "}
                      {getRoleDisplayName(
                        editingStaff.role
                      )}{" "}
                      | Status:{" "}
                      <span className="badge bg-success">
                        {
                          getStatusBadge(
                            editingStaff
                          ).text
                        }
                      </span>
                    </small>
                  </div>
                )}

                {/* ROLE INFORMATION */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Role Name *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={onInputChange}
                      required
                      placeholder="Enter role name"
                      disabled={!!editingStaff}
                    />

                    {editingStaff && (
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Role name cannot be changed when
                        editing staff permissions
                      </small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Description
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={onInputChange}
                      placeholder="Brief description of the role"
                    />
                  </div>
                </div>

                <hr />

                {/* PERMISSION HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-semibold">
                    Menu Permissions{" "}
                    <small className="text-muted fw-normal">
                      (Click on blue headings to expand)
                    </small>
                  </h6>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={onSelectAll}
                  >
                    <i className="bi bi-check2-all me-1"></i>
                    Select All Permissions
                  </button>
                </div>

                {/* MENU TREE */}
                <MenuTree
                  menuItems={menuItems}
                  expandedMenus={expandedMenus}
                  expandedSubMenus={expandedSubMenus}
                  expandedNestedMenus={
                    expandedNestedMenus
                  }
                  onToggleMenu={onToggleMenu}
                  onToggleSubMenu={
                    onToggleSubMenu
                  }
                  onToggleNestedMenu={
                    onToggleNestedMenu
                  }
                  selectedPermissions={
                    formData.permissions
                  }
                  onPermissionChange={
                    onPermissionChange
                  }
                />
              </div>

              {/* =================================================
                  FOOTER
                  ================================================= */}
              <div className="modal-footer role-permission-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <i className="bi bi-x-circle me-1"></i>
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

                      {editingStaff
                        ? "Updating Permissions..."
                        : "Saving..."}
                    </>
                  ) : editingStaff ? (
                    <>
                      <i className="bi bi-check2-circle me-1"></i>
                      Update Staff Permissions
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      Create Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RolePermissionModal;