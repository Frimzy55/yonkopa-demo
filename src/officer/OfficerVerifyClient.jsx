import React, { useState } from "react";

const OfficerVerifyClient = () => {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5002";

  const handleSearch = async (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      setClients([]);
      setError("Please enter a client name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/clients/search?search=${encodeURIComponent(value)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to search clients.");
      }

      setClients(data.clients || []);
    } catch (err) {
      console.error("Client search error:", err);
      setClients([]);
      setError(err.message || "Unable to search clients.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        padding: "40px 32px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#1e293b",
            }}
          >
            Verify Client
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Search for an existing client using their full name or popular name.
          </p>
        </div>

        {/* Search Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            marginBottom: "24px",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Client Name
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter full name or popular name..."
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
                padding: "12px 24px",
                background: loading ? "#94a3b8" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#b91c1c",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {clients.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#1e293b",
                }}
              >
                Search Results
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                {clients.length} client(s) found
              </p>
            </div>

            <div>
              {clients.map((client) => (
                <div
                  key={client.client_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 20px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "15px",
                      }}
                    >
                      {client.fullName}
                    </div>

                    {client.popularName && (
                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "13px",
                          color: "#64748b",
                        }}
                      >
                        Popular name: {client.popularName}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      Client ID: {client.client_id}
                    </div>

                    {client.phone && (
                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "13px",
                          color: "#64748b",
                        }}
                      >
                        Phone: {client.phone}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => console.log("Selected client:", client)}
                    style={{
                      padding: "9px 18px",
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Verify
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && search.trim() && clients.length === 0 && !error && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No clients found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerVerifyClient;