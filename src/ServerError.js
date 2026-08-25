import React from "react";
import { MdErrorOutline, MdHome, MdRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ServerError = ({
  code = 404,
  title = "Page Not Found",
  message = "Sorry, the page you're looking for doesn't exist or may have been moved.",
}) => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/demo");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "50px 35px",
          textAlign: "center",
          boxShadow:
            "0 10px 40px rgba(15, 23, 42, 0.08)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "82px",
            height: "82px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MdErrorOutline size={48} />
        </div>

        <div
          style={{
            fontSize: "72px",
            lineHeight: "1",
            fontWeight: "700",
            color: "#2563eb",
            marginBottom: "18px",
          }}
        >
          {code}
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "28px",
            lineHeight: "1.3",
            fontWeight: "600",
            color: "#1e293b",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "0 auto 30px",
            maxWidth: "420px",
            color: "#64748b",
            fontSize: "15px",
            lineHeight: "1.7",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleRetry}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 20px",
              minWidth: "120px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <MdRefresh size={19} />
            Try Again
          </button>

          <button
            type="button"
            onClick={handleHome}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 20px",
              minWidth: "120px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#334155",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <MdHome size={19} />
            Go Home
          </button>
        </div>

        <div
          style={{
            marginTop: "35px",
            paddingTop: "20px",
            borderTop: "1px solid #f1f5f9",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Yonkopa Micro Credit
        </div>
      </div>
    </div>
  );
};

export default ServerError;