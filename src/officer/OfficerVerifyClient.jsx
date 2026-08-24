// OfficerVerifyClient.jsx
import React, { useState, useEffect } from "react";

const OfficerVerifyClient = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [loadingKyc, setLoadingKyc] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) {
      setClients([]);
      setError("Please enter a name or phone number.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${API_BASE_URL}/api/kyc/clients/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to search clients.");
      setClients(data.clients || []);
    } catch (err) {
      console.error("Client search error:", err);
      setClients([]);
      setError(err.message || "Unable to search clients.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (client) => {
    try {
      setLoadingKyc(true);
      const response = await fetch(
        `${API_BASE_URL}/api/kyc/client/${client.client_id}/full-kyc`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch KYC details.");
      setSelectedKyc(data);
      setShowModal(true);
    } catch (err) {
      console.error("KYC fetch error:", err);
      setError(err.message || "Could not load KYC details.");
    } finally {
      setLoadingKyc(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedKyc(null);
  };

  // Common responsive styles
  const containerPadding = isMobile ? "20px 16px" : "40px 32px";
  const cardPadding = isMobile ? "16px" : "24px";
  const titleFontSize = isMobile ? "20px" : "24px";
  const resultItemPadding = isMobile ? "14px 16px" : "18px 20px";

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: containerPadding, background: "#f8fafc" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: isMobile ? "20px" : "28px" }}>
          <h2 style={{ margin: 0, fontSize: titleFontSize, fontWeight: "700", color: "#1e293b" }}>
            Verify Client
          </h2>
          <p style={{ marginTop: "6px", color: "#64748b", fontSize: isMobile ? "13px" : "14px" }}>
            Search for an existing client using their full name or phone number.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: cardPadding,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: "24px",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "12px",
              alignItems: isMobile ? "stretch" : "flex-end",
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                Client Name or Phone
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter full name or phone number..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: isMobile ? "12px 16px" : "12px 24px",
                background: loading ? "#94a3b8" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                width: isMobile ? "100%" : "auto",
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          {error && (
            <div style={{ marginTop: "16px", padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "14px" }}>
              {error}
            </div>
          )}
        </div>

        {clients.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: isMobile ? "14px 16px" : "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? "15px" : "16px", color: "#1e293b" }}>Search Results</h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>{clients.length} client(s) found</p>
            </div>
            <div>
              {clients.map((client) => (
                <div
                  key={client.client_id}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "stretch" : "center",
                    padding: resultItemPadding,
                    borderBottom: "1px solid #f1f5f9",
                    gap: isMobile ? "12px" : "0",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", color: "#1e293b", fontSize: isMobile ? "14px" : "15px" }}>{client.fullName}</div>
                    {client.popularName && <div style={{ marginTop: "4px", fontSize: "13px", color: "#64748b" }}>Popular name: {client.popularName}</div>}
                    <div style={{ marginTop: "4px", fontSize: "13px", color: "#64748b" }}>Client ID: {client.client_id}</div>
                    {client.phone && <div style={{ marginTop: "4px", fontSize: "13px", color: "#64748b" }}>Phone: {client.phone}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVerify(client)}
                    disabled={loadingKyc}
                    style={{
                      padding: isMobile ? "10px 16px" : "9px 18px",
                      background: loadingKyc ? "#94a3b8" : "#f1f5f9",
                      color: loadingKyc ? "#fff" : "#334155",
                      border: "1px solid #e2e8f0",
                      borderRadius: "7px",
                      cursor: loadingKyc ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      width: isMobile ? "100%" : "auto",
                      textAlign: "center",
                    }}
                  >
                    {loadingKyc ? "Loading..." : "Verify"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && search.trim() && clients.length === 0 && !error && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: isMobile ? "30px 20px" : "40px", textAlign: "center", color: "#64748b" }}>
            No clients found.
          </div>
        )}
      </div>

      {/* Modal would go here – kept as in your original */}
    </div>
  );
};

export default OfficerVerifyClient;