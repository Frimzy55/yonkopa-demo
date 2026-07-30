// src/pages/CustomerDashboard/CustomerNotificationService.jsx
import React from "react";

const NotificationService = ({ formData, handleInputChange }) => {
  const alertMethod = formData.alertMethod || "";

  return (
    <div className="form-step">
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Transaction Alert Preference</h5>
        </div>
        <div className="card-body">
          {/* Alert Method Selection */}
          <div className="form-group">
            <label>Alert Method</label>
            <select
              name="alertMethod"
              value={alertMethod}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="">Select Alert Method</option>
              <option value="SMS">SMS</option>
              <option value="Email">Email</option>
            </select>
          </div>

          {/* Conditional fields based on selection */}
          {alertMethod === "SMS" && (
            <div className="mt-3 p-3 border rounded">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>MOMO Provider</label>
                    <select
                      name="momoProvider"
                      value={formData.momoProvider || ""}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select</option>
                      <option value="MTN">MTN</option>
                      <option value="Vodafone">Vodafone</option>
                      <option value="AirtelTigo">AirtelTigo</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>MOMO Number</label>
                    <input
                      type="text"
                      name="momoNumber"
                      value={formData.momoNumber || ""}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g 0241234567"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Account Name</label>
                    <input
                      type="text"
                      name="momoAccountName"
                      value={formData.momoAccountName || ""}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter account name"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {alertMethod === "Email" && (
            <div className="mt-3 p-3 border rounded">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress || ""}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="example@domain.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationService;