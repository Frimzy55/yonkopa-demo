import React, { useState } from "react";
//import "./CreateAccount.css"; // optional – you can extract styles

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    customer_id: "",
    firstName: "",
    lastName: "",
    otherName: "",
    dateofbirth: "",
    gender: "",
    branch: "Head Office",
    image: null,
    account_name: "",
    account_type: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalAccountNumber, setModalAccountNumber] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const branches = ["Head Office"];

  // Handle input changes (account_type is always editable)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (locked && name !== "account_type") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (locked) return;
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Fetch customer details from API
  const fetchCustomer = async () => {
    if (!formData.customer_id) {
      setError("Please enter a Customer ID");
      return;
    }
    setFetchingCustomer(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/customer/${formData.customer_id}`
      );
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      const c = data.customer;
      setFormData((prev) => ({
        ...prev,
        firstName: c.firstname || "",
        lastName: c.lastname || "",
        otherName: c.middlename || "",
        dateofbirth: c.dateofbirth ? String(c.dateofbirth).split("T")[0] : "",
        gender: c.personal_gender || "",
        account_name: `${c.firstname || ""} ${c.lastname || ""}`.trim(),
      }));
      if (c.avatar) {
        setPreview(
          `${process.env.REACT_APP_API_URL.replace(/\/$/, "")}/uploads/${c.avatar}`
        );
      }
      setLocked(true);
      setSuccess("Customer loaded successfully");
    } catch (err) {
      setError("Failed to fetch customer. Please try again.");
    } finally {
      setFetchingCustomer(false);
    }
  };

  // Create account submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_type) {
      setError("Please select an account type");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        customer_id: formData.customer_id,
        branch: formData.branch,
        account_name: formData.account_name,
        account_type: formData.account_type,
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/accounts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        if (data.message && data.message.toLowerCase().includes("already")) {
          setErrorModalMessage(data.message);
          setShowErrorModal(true);
        } else {
          setError(data.message);
        }
        return;
      }
      setModalAccountNumber(data.account_number);
      setShowSuccessModal(true);
      resetAll();
    } catch (err) {
      setErrorModalMessage("Network error. Please check your connection.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset entire form
  const resetAll = () => {
    setFormData({
      customer_id: "",
      firstName: "",
      lastName: "",
      otherName: "",
      dateofbirth: "",
      gender: "",
      branch: "Head Office",
      image: null,
      account_name: "",
      account_type: "",
    });
    setPreview(null);
    setLocked(false);
    setError("");
    setSuccess("");
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setModalAccountNumber("");
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorModalMessage("");
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">Create Bank Account</h2>
        <p className="text-muted">Enter customer ID to fetch details and assign account type</p>
        <hr className="w-25 mx-auto" />
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError("")}></button></div>}
      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">{success}<button type="button" className="btn-close" onClick={() => setSuccess("")}></button></div>}

      <form onSubmit={handleSubmit}>
        {/* Customer Card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
          <div className="card-header bg-primary bg-opacity-10 py-3 border-0">
            <h5 className="card-title mb-0 text-primary fw-semibold">
              <i className="bi bi-person-badge me-2"></i> Customer Information
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4 align-items-start">
              {/* Photo Upload */}
              <div className="col-md-3 text-center">
                <div
                  className="border rounded-3 overflow-hidden bg-light mx-auto"
                  style={{ width: 150, height: 150, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.7 : 1 }}
                  onClick={() => !locked && document.getElementById("img").click()}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-100 h-100 object-fit-cover" />
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                      <i className="bi bi-camera fs-2"></i>
                      <small>Upload Photo</small>
                    </div>
                  )}
                </div>
                <input id="img" type="file" hidden accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Customer Details Fields */}
              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Customer ID *</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        disabled={locked}
                        placeholder="Enter Customer ID"
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={fetchCustomer}
                        disabled={fetchingCustomer}
                      >
                        {fetchingCustomer ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Loading...
                          </>
                        ) : (
                          <>Fetch</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input className="form-control bg-light" value={formData.account_name} readOnly />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input className="form-control bg-light" value={formData.firstName} readOnly />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input className="form-control bg-light" value={formData.lastName} readOnly />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Other Name</label>
                    <input className="form-control bg-light" value={formData.otherName} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-control bg-light" value={formData.dateofbirth} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <input className="form-control bg-light" value={formData.gender} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Branch</label>
                    <select className="form-select" name="branch" value={formData.branch} onChange={handleChange} disabled={locked}>
                      {branches.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-header bg-success bg-opacity-10 py-3 border-0">
            <h5 className="card-title mb-0 text-success fw-semibold">
              <i className="bi bi-bank2 me-2"></i> Account Setup
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Account Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe Savings"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Account Type *</label>
                <select
                  className="form-select"
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Account Type --</option>
                  <option value="Loan"> Loan Account</option>
                  <option value="Lien"> Lien Account</option>
                  <option value="Fixed Deposit"> Fixed Deposit Account</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-end">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={resetAll}>
            Reset
          </button>
          <button type="submit" className="btn btn-primary px-5" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeSuccessModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-success text-white border-0 rounded-top-4">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle-fill me-2"></i> Success
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeSuccessModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                <p className="lead fw-bold mt-3">Account Created Successfully</p>
                <h3 className="text-primary mb-2">{modalAccountNumber}</h3>
                <p className="text-muted">Please save this number for future reference.</p>
              </div>
              <div className="modal-footer justify-content-center border-0 pb-4">
                <button className="btn btn-success px-4" onClick={closeSuccessModal}>Continue</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeErrorModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-danger text-white border-0 rounded-top-4">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Error
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeErrorModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "4rem" }}></i>
                <p className="lead mt-3">{errorModalMessage}</p>
                <p className="text-muted">Please verify the customer ID or contact support.</p>
              </div>
              <div className="modal-footer justify-content-center border-0 pb-4">
                <button className="btn btn-danger px-4" onClick={closeErrorModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;