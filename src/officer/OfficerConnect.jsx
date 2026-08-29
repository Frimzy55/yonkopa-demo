// OfficerConnect.jsx
import React, { useState } from "react";
import {
  MdSearch,
  MdPersonAdd,
  MdChat,
  MdVideoCall,
  MdPeople,
} from "react-icons/md";

const OfficerConnect = ({ user }) => {
  // ─── Dummy data ──────────────────────────────────────────────
  const [officers] = useState([
    {
      id: 1,
      name: "John Doe",
      role: "Senior Officer",
      department: "Credit",
      online: true,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "KYC Officer",
      department: "Compliance",
      online: false,
      avatar: "JS",
    },
    {
      id: 3,
      name: "Michael Johnson",
      role: "Loan Officer",
      department: "Operations",
      online: true,
      avatar: "MJ",
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Branch Manager",
      department: "Management",
      online: true,
      avatar: "ED",
    },
    {
      id: 5,
      name: "Robert Brown",
      role: "Risk Analyst",
      department: "Risk",
      online: false,
      avatar: "RB",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOfficers = officers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Helper for online status indicator ──────────────────────
  const getStatusColor = (online) => (online ? "#22c55e" : "#94a3b8");
  const getStatusText = (online) => (online ? "Online" : "Offline");

  // ─── Handlers ──────────────────────────────────────────────────
  const handleChat = (officerId) => {
    alert(`Chat with officer ${officerId} (placeholder)`);
    // Replace with actual chat logic
  };

  const handleCall = (officerId) => {
    alert(`Call officer ${officerId} (placeholder)`);
    // Replace with actual call logic
  };

  const handleConnect = () => {
    alert("Connect with new officer (placeholder)");
    // Replace with actual connection logic
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 4px" }}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          justifyContent: "space-between",
          alignItems: window.innerWidth < 768 ? "stretch" : "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MdPeople size={28} color="#3b82f6" /> Officer's Connect
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
            Connect with fellow officers and collaborate in real-time.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "0 12px",
              flex: 1,
              minWidth: "200px",
            }}
          >
            <MdSearch size={20} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search officers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                padding: "10px 8px",
                width: "100%",
                outline: "none",
                fontSize: "14px",
                background: "transparent",
                color: "#1e293b",
              }}
            />
          </div>
          <button
            onClick={handleConnect}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            <MdPersonAdd size={20} /> Connect
          </button>
        </div>
      </div>

      {/* ─── Officer Grid ───────────────────────────────────────── */}
      {filteredOfficers.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          <p style={{ fontSize: "18px", margin: 0 }}>No officers found</p>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Try adjusting your search term.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredOfficers.map((officer) => (
            <div
              key={officer.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* ─── Avatar + Status ───────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "#2563eb",
                  }}
                >
                  {officer.avatar}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: getStatusColor(officer.online),
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {getStatusText(officer.online)}
                  </span>
                </div>
              </div>

              {/* ─── Info ───────────────────────────────────────── */}
              <div>
                <h4
                  style={{
                    margin: "0 0 4px",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1e293b",
                  }}
                >
                  {officer.name}
                </h4>
                <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
                  {officer.role}
                </p>
                <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>
                  {officer.department}
                </p>
              </div>

              {/* ─── Actions ────────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "16px",
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "16px",
                }}
              >
                <button
                  onClick={() => handleChat(officer.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: "#e0f2fe",
                    border: "none",
                    borderRadius: "8px",
                    color: "#0369a1",
                    fontWeight: "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#bae6fd")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#e0f2fe")
                  }
                >
                  <MdChat size={18} /> Chat
                </button>
                <button
                  onClick={() => handleCall(officer.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    background: "#dcfce7",
                    border: "none",
                    borderRadius: "8px",
                    color: "#166534",
                    fontWeight: "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#bbf7d0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#dcfce7")
                  }
                >
                  <MdVideoCall size={18} /> Call
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Footer ────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: "32px",
          textAlign: "center",
          fontSize: "14px",
          color: "#94a3b8",
        }}
      >
        Showing {filteredOfficers.length} of {officers.length} officers
      </div>
    </div>
  );
};

export default OfficerConnect;