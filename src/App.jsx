import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CustomerLanding from "./auth/CustomerLanding";
import LoginPage from "./auth/StaffLoginPage";
import DefaultSuper from "./auth/DefaultSuper";
import OfficerAccess from "./auth/OfficerAccess";

import ServerError from "./ServerError";

import Customerview from "./customerpage/CustomerPage";
import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./managerpage/ManagerDashboard";

import LoanOfficerDashboard from "./loanofficerpage/LoanOfficerDashboard";
import LoanSupervisorDashboard from "./supervisorpage/LoanSupervisorDashboard";
import TellerDashboard from "./tellerpage/TellerDashboard";

import Officerdasboard from "./officer/Officerdasboard"; // component named "Officer"

import ProtectedRoute from "./ProtectedRoute";
import AutoLogout from "./components/AutoLogout";

import MaintenancePage from "./components/MaintenancePage";

//import { syncPendingDrafts } from "./utils/offlineSync";

const MAINTENANCE_MODE = false;
//  process.env.REACT_APP_MAINTENANCE_MODE === "true";

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








  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      {" "}
      {/* ✅ basename prop removed – no more "/yonkopa-demo" */}
      <AutoLogout />
      <div className="App">
        <Routes>
           
          <Route path="/" element={<Navigate to="/access" replace />} />   

          {/* PUBLIC ROUTES */}
          <Route path="/apply" element={<CustomerLanding />} />
          <Route path="/access" element={<LoginPage />} />
          <Route path="/signup" element={<DefaultSuper />} />
          <Route path="/officer-access" element={<OfficerAccess />} />

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

          <Route
            path="/officer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["loan_officer"]}>
                <Officerdasboard />
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

          {/* TELLER */}
          <Route
            path="/teller-dashboard"
            element={
              <ProtectedRoute allowedRoles={["teller"]}>
                <TellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/server-error"
            element={
              <ServerError
                code={404}
                title="Page Not Found"
                message="Sorry, the page you're looking for doesn't exist or may have been moved."
              />
            }
          />

           
          <Route path="*" element={<Navigate to="/access" replace />} />  
        </Routes>
      </div>
    </Router>
  );
}

export default App;
