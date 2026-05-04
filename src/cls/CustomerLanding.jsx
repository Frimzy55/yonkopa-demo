import React, { useState } from 'react';
import SignUpPage from './SignUpPage';
import LoginPage from './LoginPage';
import logo from '../image/yonko.png';

const CustomerLanding = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleCloseSignUp = () => setShowSignUp(false);
  const handleCloseLogin = () => setShowLogin(false);

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">

      {/* HEADER */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <img
              src={logo}
              alt="Yonkopa Logo"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain"
              }}
            />
            <h3 className="navbar-brand m-0">
              Yonkopa Micro Credit
            </h3>
          </div>

          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h2 className="display-5 fw-bold">
            Get the Loan You Need
          </h2>

          <p className="lead mb-4">
            Simple, fast, and transparent loan process
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-light text-primary px-4 rounded-pill"
              onClick={() => setShowSignUp(true)}
            >
              Create Account
            </button>

            <button
              className="btn btn-outline-light px-4 rounded-pill"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">

            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4">
                <h4>Quick Approval</h4>
                <p>Get decisions within 24 hours</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4">
                <h4>Low Interest Rates</h4>
                <p>Affordable and flexible repayment plans</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4">
                <h4>No Hidden Fees</h4>
                <p>Transparent pricing, no surprises</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-4 bg-dark text-white text-center">
        <div className="container">
          <p className="mb-1">
            &copy; 2026 Yonkopa. All rights reserved.
          </p>
        </div>
      </footer>

      {/* SIGN UP MODAL */}
      {showSignUp && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-start overflow-auto p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded-4 shadow p-3 my-4"
            style={{
              width: "95%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <SignUpPage
              onClose={handleCloseSignUp}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLogin && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-start overflow-auto p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded-4 shadow p-3 my-4"
            style={{
              width: "95%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <LoginPage
              onClose={handleCloseLogin}
              onSwitchToSignUp={handleSwitchToSignUp}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerLanding;