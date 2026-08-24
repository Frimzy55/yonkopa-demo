// OfficerKYCFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import KYCForm from "./KYCForm"; // adjust path as needed

const OfficerKYCFormPage = () => {
  const navigate = useNavigate();
  const { draftUuid } = useParams();
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        navigate("/officer-access");
      }
    } else {
      navigate("/officer-access");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    // Navigate back to the drafts tab on the officer dashboard
    navigate("/officer-dashboard?tab=drafts");
  };

  if (!user) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <KYCForm
        formData={formData}
        onChange={handleChange}
        onCancel={handleCancel}
        userId={user.id}
        initialDraftUuid={draftUuid}
      />
    </div>
  );
};

export default OfficerKYCFormPage;