import React, { useState, useEffect } from "react";
import {
  MdSearch,
  
  MdAdd,
  MdMoreVert,
} from "react-icons/md";
import KYCForm from "./KYCForm";

const OfficerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    idType: "national_id",
    idNumber: "",
    amountRequested: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Replace with actual API call
        // const res = await fetch("/api/officer/applications");
        // const data = await res.json();
        // setApplications(data);
        setApplications([]);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: { background: "#fef3c7", color: "#92400e" },
      Approved: { background: "#d1fae5", color: "#065f46" },
      Rejected: { background: "#fee2e2", color: "#991b1b" },
    };
    const s = styles[status] || styles.Pending;
    return {
      ...s,
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block",
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the KYC data (including photoFile) to your API
    // For example, using FormData:
    // const formDataToSend = new FormData();
    // formDataToSend.append("fullName", formData.fullName);
    // ... etc.
    // if (photoFile) formDataToSend.append("photo", photoFile);
    console.log("KYC Data submitted:", formData);
    console.log("Photo file:", photoFile);
    // Reset form and go back to list
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      idType: "national_id",
      idNumber: "",
      amountRequested: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(false);
    // Optionally refresh the applications list
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      idType: "national_id",
      idNumber: "",
      amountRequested: "",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(false);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading applications...</div>;
  }

  return (
    <div style={{ padding: "24px 16px" }}>
      {/* Header with actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
            {showForm ? "New Application" : "Applications"}
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0" }}>
            {showForm
              ? "Enter customer KYC details to start a new loan application."
              : "Manage all loan applications here."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {!showForm && (
            <>
              {/* Filter button removed */}
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: "8px 16px",
               
                   background: "#3b82f6", // 🔵 changed from indigo to blue
                  border: "none",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  color: "#fff",
                  fontWeight: "500",
                }}
              >
                <MdAdd /> New Application
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render either the KYC form or the application list */}
      {showForm ? (
        <KYCForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onFileChange={handleFileChange}
          photoPreview={photoPreview}
        />
      ) : (
        <>
          {/* Search bar */}
          <div
            style={{
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              padding: "4px 16px",
              maxWidth: "400px",
            }}
          >
            <MdSearch color="#94a3b8" size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              style={{
                padding: "10px 12px",
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                background: "transparent",
              }}
            />
          </div>

          {/* Applications table */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {applications.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ fontSize: "16px" }}>No applications found</p>
                <p style={{ fontSize: "14px", marginTop: "4px" }}>
                  New applications will appear here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Client
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "14px 16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontWeight: "500",
                            color: "#1e293b",
                          }}
                        >
                          {app.client}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>
                          {app.amount}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={getStatusBadge(app.status)}>{app.status}</span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>
                          {app.date}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                            }}
                          >
                            <MdMoreVert size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OfficerApplications;