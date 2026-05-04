import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import CustomerLanding from "./cls/CustomerLanding";
import LoginPage from "./cls/StaffLoginPage";
import DefaultSuper from "./cls/DefaultSuper";

import Customerview from "./customerpage/CustomerPage";
import AdminDashboard from "./AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* PUBLIC ROUTES */}
              <Route path="/apply" element={<CustomerLanding />} />  
          <Route path="/access" element={<LoginPage />} />
          <Route path="/signup" element={<DefaultSuper />} />
           



          {/* PROTECTED ROUTES */}
          <Route
            path="/customer-page"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Customerview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;