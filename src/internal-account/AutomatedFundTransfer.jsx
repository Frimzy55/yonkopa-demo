import React, { useState } from "react";
import { FaBuilding } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";

const AutomatedFundTransfer = () => {
  const [form, setForm] = useState({
    amount: "",
    fromAccountCode: "",
    fromAccountName: "",
    fromAvailableBalance: "",
    toAccountCode: "",
    toAccountName: "",
    toCurrentBalance: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Fund Transfer Data:", form);
    // Add your API call logic here
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 35px -12px rgba(0, 0, 0, 0.1)",
          padding: "32px",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: 600,
              color: "#111827",
              margin: "0 0 8px 0",
              letterSpacing: "-0.025em",
            }}
          >
            Create Fund Transfer
          </h2>
          <div
            style={{
              height: "4px",
              width: "60px",
              backgroundColor: "#3b82f6",
              borderRadius: "2px",
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Transfer Amount
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                
              </span>
              <input
                type="number"
                name="amount"
                placeholder=""
                value={form.amount}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 28px",
                  fontSize: "0.95rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          {/* From & To Accounts – Side by Side */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            {/* From Account Card – Credit */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#f9fafb",
                borderRadius: "20px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderTop: "4px solid #10b981",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1f2937",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaBuilding style={{ fontSize: "1.3rem", color: "#10b981" }} />
                  From Account
                </h3>
                <span
                  style={{
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "30px",
                  }}
                >
                  Credit
                </span>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Account Code</label>
                <input
                  type="text"
                  name="fromAccountCode"
                  placeholder="e.g., ACC-101"
                  value={form.fromAccountCode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Account Name</label>
                <input
                  type="text"
                  name="fromAccountName"
                  placeholder="Savings Account"
                  value={form.fromAccountName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Available Balance</label>
                <input
                  type="number"
                  name="fromAvailableBalance"
                  placeholder="0.00"
                  value={form.fromAvailableBalance}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* To Account Card – Debit */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#f9fafb",
                borderRadius: "20px",
                padding: "20px",
                border: "1px solid #e5e7eb",
                borderTop: "4px solid #ef4444",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#1f2937",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaMoneyBillWave style={{ fontSize: "1.3rem", color: "#ef4444" }} />
                  To Account
                </h3>
                <span
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "30px",
                  }}
                >
                  Debit
                </span>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Account Code</label>
                <input
                  type="text"
                  name="toAccountCode"
                  placeholder="e.g., ACC-202"
                  value={form.toAccountCode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Account Name</label>
                <input
                  type="text"
                  name="toAccountName"
                  placeholder="Checking Account"
                  value={form.toAccountName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Current Balance</label>
                <input
                  type="number"
                  name="toCurrentBalance"
                  placeholder="0.00"
                  value={form.toCurrentBalance}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "12px 20px",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "40px",
              cursor: "pointer",
              transition: "background-color 0.2s, transform 0.1s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
          >
            Transfer Funds
          </button>
        </form>
      </div>
    </div>
  );
};

// Reusable styles
const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "#4b5563",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "0.9rem",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  outline: "none",
  transition: "all 0.2s",
  fontFamily: "inherit",
  backgroundColor: "#ffffff",
};

export default AutomatedFundTransfer;