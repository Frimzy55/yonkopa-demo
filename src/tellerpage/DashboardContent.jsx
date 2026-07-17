import React from 'react';

const DashboardContent = ({ realUserName, user }) => {
  return (
    <div className="mt-4">

      {/* Welcome user section */}
      <div className="card p-3 mb-3 bg-light">
        <h5 className="mb-0">
          Welcome, <span className="text-primary">{realUserName}</span>
        </h5>
        <small className="text-muted">
          Role: {user?.role || 'Loan Supervisor'}
        </small>
      </div>

      {/* Quick Actions (simple, no stats) */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <i className="bi bi-person-plus fs-1 text-primary"></i>
            <h6 className="mt-2">Create Customer</h6>
            <button className="btn btn-sm btn-outline-primary mt-1">+ New</button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <i className="bi bi-file-text fs-1 text-success"></i>
            <h6 className="mt-2">Loan Application</h6>
            <button className="btn btn-sm btn-outline-success mt-1">Apply</button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <i className="bi bi-check-circle fs-1 text-warning"></i>
            <h6 className="mt-2">Pending Approvals</h6>
            <button className="btn btn-sm btn-outline-warning mt-1">Review</button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card p-3">
        <h6>Recent Activities</h6>
        <ul className="list-unstyled mb-0">
          <li>New customer created - IND000123</li>
          <li>Loan approved - LN004512</li>
          <li>Deposit posted - GHS 4,500</li>
          <li>KYC pending review - 12 accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardContent;