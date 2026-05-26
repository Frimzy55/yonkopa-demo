

import React, { useState } from "react";

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
    account_type: "Loan",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  // Modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalAccountNumber, setModalAccountNumber] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");

  // ✅ Only "Head Office" is available
  const branches = ["Head Office"];

  const handleChange = (e) => {
  const { name, value } = e.target;
  // Allow account_type to be changed even if locked
  if (locked && name !== 'account_type') return;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

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

  const fetchCustomer = async () => {
    if (!formData.customer_id) {
      setError("Enter Customer ID");
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
      setError("Failed to fetch customer");
    } finally {
      setFetchingCustomer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/accounts/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

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
      setErrorModalMessage(err.message || "Something went wrong");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

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
      account_type: "Savings",
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
    <div className="container py-4">
      <h4 className="fw-bold">Create Bank Account</h4>
      <p className="text-muted">Customer ID‑based account creation</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* CUSTOMER SECTION */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="text-primary">Customer Details</h5>
            <div className="row">
              <div className="col-md-3 text-center">
                <div
                  style={{
                    width: 150,
                    height: 150,
                    border: "2px solid #ccc",
                    borderRadius: 10,
                    overflow: "hidden",
                    margin: "auto",
                    cursor: locked ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !locked && document.getElementById("img").click()}
                >
                  {preview && (
                    <img
                      src={preview}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <input id="img" type="file" hidden onChange={handleImageChange} />
              </div>

              <div className="col-md-9">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label>Customer ID</label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        disabled={locked}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={fetchCustomer}
                        disabled={fetchingCustomer}
                      >
                        {fetchingCustomer ? "Loading..." : "Fetch"}
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label>First Name</label>
                    <input className="form-control" value={formData.firstName} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label>Last Name</label>
                    <input className="form-control" value={formData.lastName} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label>Other Name</label>
                    <input className="form-control" value={formData.otherName} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label>DOB</label>
                    <input className="form-control" value={formData.dateofbirth} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label>Gender</label>
                    <input className="form-control" value={formData.gender} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label>Branch</label>
                    <select
                      className="form-select"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      disabled={locked}
                    >
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

        {/* ACCOUNT SECTION */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="text-success">Account Setup</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label>Account Name</label>
                <input
                  className="form-control"
                  name="account_name"
                  value={formData.account_name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label>Account Type</label>
                <select
                  className="form-select"
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleChange}
                >
                  <option value="Loan">Loan</option>
                   <option value="Lien">Lien</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetAll}>
            Reset
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeSuccessModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">✅ Account Created Successfully</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeSuccessModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
                </div>
                <p className="lead fw-bold">Account Number:</p>
                <h2 className="text-primary mb-3">{modalAccountNumber}</h2>
                <p className="text-muted">Please save this number for future transactions.</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-primary" onClick={closeSuccessModal}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeErrorModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">⚠️ Error</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeErrorModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                </div>
                <p className="lead">{errorModalMessage}</p>
                <p className="text-muted">Please check the customer ID or contact support.</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-danger" onClick={closeErrorModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;




