import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ApproveNewCustomer.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5002";

const ApproveNewCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionCustomer, setActionCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [approvedCustomerId, setApprovedCustomerId] = useState(null);
  const [isApproving, setIsApproving] = useState(false); // NEW loading state

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/customers/pending-customers`
      );
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (src, alt) => {
    if (!src) return <span className="no-image">No image</span>;
    return (
      <img
        src={`${API_BASE_URL}/uploads/${src}`}
        alt={alt}
        className="detail-image"
        onError={(e) => (e.target.style.display = "none")}
      />
    );
  };

  const renderField = (label, value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "—"
    ) {
      return null;
    }
    return (
      <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{value}</span>
      </div>
    );
  };

  const openActionMenu = (customer) => {
    setActionCustomer(customer);
    setShowActionModal(true);
  };

  const closeActionMenu = () => {
    setShowActionModal(false);
    setActionCustomer(null);
  };

  const handleView = () => {
    setSelectedCustomer(actionCustomer);
    setShowDetailsModal(true);
    closeActionMenu();
  };

  const handleApprove = async () => {
  if (isApproving) return;

  setIsApproving(true);
  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/customers/approve/${actionCustomer.kycCode}`
    );

    if (res.data.success) {
      // ✅ Remove using the unique PID
      setCustomers((prev) =>
        prev.filter((c) => c.pid !== actionCustomer.pid)
      );

      setApprovedCustomerId(res.data.customer_id);
      setShowSuccessModal(true);
      closeActionMenu();

      // ❌ Remove this line to avoid re-adding approved customer
      // fetchCustomers();
    } else {
      alert(res.data.message || "Approval failed");
    }
  } catch (error) {
    console.error(error);
    alert("Failed to approve customer");
  } finally {
    setIsApproving(false);
  }
};
  const handleReject = () => {
    console.log("Reject", actionCustomer);
    // Add your reject logic here
    closeActionMenu();
  };

  return (
    <div className="approve-container">
      <div className="approve-header">
        <h2>Approve New Customer</h2>
        <span className="badge">{customers.length} pending</span>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading pending customers…</div>
      ) : (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Employment Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No pending customers
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.pid}>
                    <td>
                      <div className="customer-name">
                        {customer.firstname}{" "}
                        {customer.middlename || ""}{" "}
                        {customer.lastname}
                      </div>
                    </td>
                    <td>{customer.mobileNumber}</td>
                    <td>{customer.email}</td>
                    <td>
                      <span className="status-badge">
                        {customer.employmentStatus || "Not specified"}
                      </span>
                    </td>
                    <td>
                      {customer.createdat
                        ? new Date(customer.createdat).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="action-dots"
                        onClick={() => openActionMenu(customer)}
                        disabled={isApproving} // Disable while approving
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && actionCustomer && (
        <div className="modal-overlay" onClick={closeActionMenu}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeActionMenu}>
              &times;
            </button>
            <h3>Choose action for {actionCustomer.firstname}</h3>
            <div className="action-buttons-vertical">
              <button className="btn-view" onClick={handleView}>
                👁 View Details
              </button>
              <button
                className="btn-approve"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Approving…
                  </>
                ) : (
                  "✅ Approve Customer"
                )}
              </button>
              <button className="btn-reject" onClick={handleReject}>
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowDetailsModal(false)}
            >
              &times;
            </button>
            <h3>Customer Details</h3>
            <div className="detail-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                {renderField("PID", selectedCustomer.pid)}
                {renderField("User ID", selectedCustomer.userId)}
                {renderField("Customer ID", selectedCustomer.customer_id)}
                {renderField("KYC Code", selectedCustomer.kycCode)}
                {renderField("Title", selectedCustomer.title)}
                {renderField("First Name", selectedCustomer.firstname)}
                {renderField("Middle Name", selectedCustomer.middlename)}
                {renderField("Last Name", selectedCustomer.lastname)}
                {renderField("Date of Birth", selectedCustomer.dateofbirth)}
                {renderField("Gender", selectedCustomer.gender)}
                {renderField("Marital Status", selectedCustomer.maritalstatus)}
                {renderField("National ID", selectedCustomer.nationalid)}
                {renderField("Residential Location", selectedCustomer.residentiallocation)}
                {renderField("Spouse Name", selectedCustomer.spousename)}
                {renderField("Spouse Contact", selectedCustomer.spousecontact)}
                {renderField("Created At", selectedCustomer.createdat)}
              </div>

              <div className="detail-section">
                <h4>Contact Information</h4>
                {renderField("Mobile", selectedCustomer.mobileNumber)}
                {renderField("Email", selectedCustomer.email)}
                {renderField("Residential Address", selectedCustomer.residentialAddress)}
                {renderField("Landmark", selectedCustomer.residentialLandmark)}
                {renderField("City", selectedCustomer.city)}
                {renderField("State", selectedCustomer.state)}
                {renderField("Alternate Phone", selectedCustomer.alternatePhone)}
              </div>

              <div className="detail-section">
                <h4>Employment / Business</h4>
                {renderField("Employment Status", selectedCustomer.employmentStatus)}
                {renderField("Employer Name", selectedCustomer.employerName)}
                {renderField("Job Title", selectedCustomer.jobTitle)}
                {renderField("Monthly Income", selectedCustomer.monthlyIncome)}
                {renderField("Years in Employment", selectedCustomer.yearsInCurrentEmployment)}
                {renderField("Work Location", selectedCustomer.workPlaceLocation)}
                {renderField("Business Name", selectedCustomer.businessName)}
                {renderField("Business Type", selectedCustomer.businessType)}
                {renderField("Monthly Business Income", selectedCustomer.monthlyBusinessIncome)}
                {renderField("Business Location", selectedCustomer.businessLocation)}
                {renderField("Business GPS Address", selectedCustomer.businessGpsAddress)}
                {renderField("Number of Workers", selectedCustomer.numberOfWorkers)}
                {renderField("Years in Business", selectedCustomer.yearsInBusiness)}
                {renderField("Working Capital", selectedCustomer.workingCapital)}
              </div>

              <div className="detail-section">
                <h4>References</h4>
                {renderField("Reference 1 Name", selectedCustomer.referenceName1)}
                {renderField("Reference 1 Phone", selectedCustomer.referencePhone1)}
                {renderField("Reference 1 Relationship", selectedCustomer.referenceRelationship1)}
                {renderField("Reference 2 Name", selectedCustomer.referenceName2)}
                {renderField("Reference 2 Phone", selectedCustomer.referencePhone2)}
                {renderField("Reference 2 Relationship", selectedCustomer.referenceRelationship2)}
              </div>

              <div className="detail-section">
                <h4>Uploaded Documents</h4>
                <div className="image-grid">
                  <div>
                    <label>Avatar</label>
                    {renderImage(selectedCustomer.avatar, "Avatar")}
                  </div>
                  <div>
                    <label>Ghana Card Front</label>
                    {renderImage(selectedCustomer.ghanaCardFront, "Ghana Card Front")}
                  </div>
                  <div>
                    <label>Ghana Card Back</label>
                    {renderImage(selectedCustomer.ghanaCardBack, "Ghana Card Back")}
                  </div>
                  <div>
                    <label>Payslip</label>
                    {renderImage(selectedCustomer.payslip, "Payslip")}
                  </div>
                  <div>
                    <label>Business Picture</label>
                    {renderImage(selectedCustomer.businessPicture, "Business Picture")}
                  </div>
                  <div>
                    <label>Employment ID</label>
                    {renderImage(selectedCustomer.employmentId, "Employment ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Modal – special design */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h3>Customer Approved!</h3>
            <p>The customer has been successfully approved.</p>
            <div className="customer-id-box">
              <span className="id-label">Customer ID</span>
              <span className="id-value">{approvedCustomerId}</span>
            </div>
            <button
              className="success-close-btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveNewCustomer;