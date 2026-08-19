import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import logo from "../image/yonko1.jpeg";

function OfficerAccess() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const card = document.querySelector(".light-card");

    if (card) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Please enter your username.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      // ============================================================
      // API BASE URL
      // ============================================================
      const API_BASE_URL = process.env.REACT_APP_API_URL || "";

      // If using Vite instead of Create React App, use:
      // const API_BASE_URL = import.meta.env.VITE_API_URL || "";

      // ============================================================
      // LOGIN REQUEST
      // ============================================================
      const response = await fetch(`${API_BASE_URL}/login2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      // ============================================================
      // CHECK RESPONSE TYPE
      // ============================================================
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Server returned an invalid response. Please check your API endpoint or proxy configuration."
        );
      }

      const data = await response.json();

      console.log("========================================");
      console.log("OFFICER LOGIN RESPONSE:", data);
      console.log("========================================");

      // ============================================================
      // HANDLE LOGIN ERRORS
      // ============================================================
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Invalid username or password. Please try again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Your account has been deactivated. Please contact support."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "User not found. Please check your username."
          );
        }

        throw new Error(data.message || "Login failed. Please try again.");
      }

      // ============================================================
      // VALIDATE RESPONSE
      // ============================================================
      if (!data.token) {
        throw new Error(
          "Login successful, but no authentication token was returned."
        );
      }

      if (!data.user) {
        throw new Error(
          "Login successful, but user information was not returned."
        );
      }

      // ============================================================
      // NORMALIZE ROLE
      // ============================================================
      const userRole = data.user?.role
        ?.toString()
        ?.trim()
        ?.toLowerCase();

      console.log("Logged-in user:", data.user);
      console.log("Logged-in role:", userRole);

      // ============================================================
      // CHECK OFFICER ROLE
      // Backend currently returns: loan_officer
      // ============================================================
      if (userRole !== "loan_officer") {
        setErrorMessage(
          `Access denied. This account has the role "${data.user?.role}". Loan Officer access is required.`
        );

        return;
      }

      // ============================================================
      // SAVE AUTHENTICATION DATA
      // ============================================================
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "loan_officer");

      console.log("========================================");
      console.log("LOAN OFFICER LOGIN SUCCESSFUL");
      console.log("Redirecting to /officer-dashboard");
      console.log("========================================");

      // ============================================================
      // REDIRECT
      // ============================================================
      navigate("/officer-dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Officer login error:", error);

      setErrorMessage(
        error?.message ||
          "An error occurred while logging in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Shapes */}
      <div className="shape shape-1" />
      <div className="shape shape-2" />
      <div className="shape shape-3" />

      {/* Login Card */}
      <div
        className="light-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "32px",
          padding: "48px 40px 40px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.03)",
          border: "1px solid rgba(0,0,0,0.04)",
          opacity: 0,
          transform: "translateY(30px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          position: "relative",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "#f8faff",
              boxShadow: "0 8px 24px rgba(99,102,241,0.10)",
              overflow: "hidden",
              animation: "floatLogo 4s ease-in-out infinite",
            }}
          >
            <img
              src={logo}
              alt="Yonkopa"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <h2
            style={{
              margin: "16px 0 4px",
              fontSize: "26px",
              fontWeight: "600",
              color: "#1e293b",
              letterSpacing: "-0.5px",
            }}
          >
            Yonkopa
          </h2>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "14px",
              fontWeight: "400",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Officer Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="identifier"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                letterSpacing: "0.3px",
                textTransform: "uppercase",
              }}
            >
              Username
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <MdPerson />
              </span>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 48px",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  fontSize: "15px",
                  color: "#1e293b",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#818cf8";
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(129,140,248,0.12)";
                  e.target.style.background = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                htmlFor="password"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(
                    "Please contact your administrator to reset your password."
                  );
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "#818cf8",
                  cursor: "pointer",
                  fontWeight: "500",
                  padding: 0,
                }}
              >
                Forgot?
              </button>
            </div>

            <div
              style={{
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <MdLock />
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // placeholder removed as requested
                required
                autoComplete="current-password"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "14px 52px 14px 48px",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  fontSize: "15px",
                  color: "#1e293b",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#818cf8";
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(129,140,248,0.12)";
                  e.target.style.background = "#ffffff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#f8fafc";
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "20px",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #fecaca",
                lineHeight: "1.5",
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "16px",
              background: isLoading
                ? "#c7d2fe"
                : "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 30px rgba(99,102,241,0.25)",
              position: "relative",
              overflow: "hidden",
              letterSpacing: "0.5px",
              minHeight: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform =
                  "translateY(-3px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(99,102,241,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform =
                  "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(99,102,241,0.25)";
              }
            }}
          >
            {isLoading ? (
              <span
                style={{
                  display: "inline-block",
                  width: "24px",
                  height: "24px",
                  border: "3px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            fontSize: "12px",
            color: "#94a3b8",
            letterSpacing: "0.3px",
          }}
        >
          © {new Date().getFullYear()} Yonkopa Micro Credit
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes floatLogo {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-6px);
            }
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.08;
            animation: floatShape 12s ease-in-out infinite;
          }

          .shape-1 {
            width: 300px;
            height: 300px;
            background: #818cf8;
            top: -120px;
            right: -80px;
            animation-delay: 0s;
          }

          .shape-2 {
            width: 400px;
            height: 400px;
            background: #a78bfa;
            bottom: -160px;
            left: -120px;
            animation-delay: -4s;
          }

          .shape-3 {
            width: 200px;
            height: 200px;
            background: #c4b5fd;
            top: 40%;
            left: 10%;
            animation-delay: -8s;
          }

          @keyframes floatShape {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }

            33% {
              transform: translate(40px, -50px) scale(1.1);
            }

            66% {
              transform: translate(-30px, 30px) scale(0.9);
            }
          }

          .light-card {
            animation: cardAppear 0.9s ease forwards;
          }

          @keyframes cardAppear {
            0% {
              opacity: 0;
              transform: translateY(40px) scale(0.96);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 520px) {
            .light-card {
              padding: 40px 24px 30px !important;
              border-radius: 24px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default OfficerAccess;