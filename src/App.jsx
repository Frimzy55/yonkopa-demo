import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import CustomerLanding from "./auth/CustomerLanding";
import LoginPage from "./auth/StaffLoginPage";
import DefaultSuper from "./auth/DefaultSuper";

import Customerview from "./customerpage/CustomerPage";
import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./managerpage/ManagerDashboard";

import LoanOfficerDashboard from "./loanofficerpage/LoanOfficerDashboard";
import LoanSupervisorDashboard from "./supervisorpage/LoanSupervisorDashboard";

import ProtectedRoute from "./ProtectedRoute";
import AutoLogout from "./components/AutoLogout";

function App() {
  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600&display=swap');

      * {
        font-family: 'Inter', sans-serif !important;
      }

      body {
        margin: 0;
        padding: 0;
        font-size: 14px;
        font-weight: 300;
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #1f1f1f;
      }

      h1, h2 { font-weight: 600; }
      h3, h4, h5, h6 { font-weight: 500; }

      p, span, div { font-weight: 300; }

      button {
        font-weight: 500;
        letter-spacing: 0.2px;
      }

      small {
        font-size: 12px;
        font-weight: 300;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router>
      <AutoLogout />

      <div className="App">
        <Routes>

          {/* 🔥 FIX: Default route */}
          <Route path="/" element={<Navigate to="/demo" replace />} />

          {/* PUBLIC ROUTES */}
          <Route path="/apply" element={<CustomerLanding />} />
          <Route path="/demo" element={<LoginPage />} />
          <Route path="/signup" element={<DefaultSuper />} />

          {/* CUSTOMER */}
          <Route
            path="/customer-page"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Customerview />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER */}
          <Route
            path="/loan-manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* LOAN OFFICER */}
          <Route
            path="/loan-officer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["loan_officer"]}>
                <LoanOfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* SUPERVISOR */}
          <Route
            path="/loan-supervisor"
            element={
              <ProtectedRoute allowedRoles={["supervisor"]}>
                <LoanSupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🔥 CATCH ALL (VERY IMPORTANT) */}
          <Route path="*" element={<Navigate to="/demo" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;