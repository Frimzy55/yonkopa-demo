import React from "react";
import "./MaintenancePage.css";

const MaintenancePage = () => {
  return (
    <div className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-icon">
          <span>⚙</span>
        </div>

        <h1>Yonkopa is currently under maintenance</h1>

        <p className="maintenance-message">
          We're making some improvements to the system.
          We'll be back shortly.
        </p>

        <div className="maintenance-status">
          <span className="status-dot"></span>
          System maintenance in progress
        </div>

        <p className="maintenance-small">
          Your data is safe. Please try again later.
        </p>

        <button
          className="maintenance-refresh"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>

      <div className="maintenance-footer">
        © {new Date().getFullYear()} Yonkopa Micro Credit
      </div>
    </div>
  );
};

export default MaintenancePage;