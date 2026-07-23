import React from "react";

const CustomerMomoDetails = ({ formData, handleInputChange }) => {
  return (
    <div>
      <h4 className="mb-3">Mobile Money Details</h4>

      <div className="mb-3">
        <label>Momo Provider</label>
        <select
          name="momoProvider"
          className="form-control"
          value={formData.momoProvider}
          onChange={handleInputChange}
        >
          <option value="">Select Provider</option>
          <option value="MTN">MTN Mobile Money</option>
          <option value="Vodafone">Vodafone Cash</option>
          <option value="AirtelTigo">AirtelTigo Money</option>
        </select>
      </div>

      <div className="mb-3">
        <label>Momo Number</label>
        <input
          type="text"
          name="momoNumber"
          className="form-control"
          value={formData.momoNumber}
          onChange={handleInputChange}
          placeholder="Enter mobile money number"
        />
      </div>

      <div className="mb-3">
        <label>Account Name</label>
        <input
          type="text"
          name="momoAccountName"
          className="form-control"
          value={formData.momoAccountName}
          onChange={handleInputChange}
          placeholder="Name on mobile money account"
        />
      </div>
    </div>
  );
};

export default CustomerMomoDetails;