// src/App.js
import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

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
  // Inject global font styles
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

    h1 {
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    h2 {
      font-weight: 600;
      letter-spacing: -0.4px;
    }

    h3 {
      font-weight: 500;
    }

    h4, h5, h6 {
      font-weight: 500;
    }

    p, span, div {
      font-weight: 300;
    }

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
          {/* PUBLIC ROUTES */}
          <Route path="/apply" element={<CustomerLanding />} />
          <Route path="/access" element={<LoginPage />} />
          <Route path="/signup" element={<DefaultSuper />} />

          {/* CUSTOMER ROUTE */}
          <Route
            path="/customer-page"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Customerview />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTE */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* MANAGER ROUTE */}
          <Route
            path="/loan-manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* LOAN OFFICER ROUTE */}
          <Route
            path="/loan-officer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["loan_officer"]}>
                <LoanOfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* SUPERVISOR ROUTE */}
          <Route
            path="/loan-supervisor"
            element={
              <ProtectedRoute allowedRoles={["supervisor"]}>
                <LoanSupervisorDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;