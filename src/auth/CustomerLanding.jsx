import React, { useState, useEffect, useRef } from 'react';
import SignUpPage from './SignUpPage';
import LoginPage from './LoginPage';
import { FaBolt, FaChartLine, FaShieldAlt, FaChevronDown } from 'react-icons/fa';
import logo from '../image/yonko1.jpeg';
import christmasTree from '../image/hat1.png';
import './CustomerLanding.css';

const CustomerLanding = () => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showChristmasTree, setShowChristmasTree] = useState(false);

  const featuresRef = useRef(null);
  const homeRef = useRef(null);

  // Christmas period
  useEffect(() => {
    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();
    if ((month === 11 && date >= 24 && date <= 31) || (month === 0 && date >= 1 && date <= 4)) {
      setShowChristmasTree(true);
    }
  }, []);

  const smoothScrollTo = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Updated openSignUp: shows the sign‑up form and scrolls to it
  const openSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
    // Delay scroll slightly to ensure the form renders and the layout is stable
    setTimeout(() => smoothScrollTo(homeRef), 150);
  };

  // Open login, close sign‑up
  const openLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
    // Optional: also scroll to the login form if desired
    // setTimeout(() => smoothScrollTo(homeRef), 150);
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
    setShowLogin(false);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setShowSignUp(false);
  };

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  return (
    <div className="customer-landing">
      {/* HEADER */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => smoothScrollTo(homeRef)}>
            <img src={logo} alt="Yonkopa Logo" className="logo-img" />
            <h3 className="m-0 fw-bold text-primary">Yonkopa Micro Credit</h3>
            {showChristmasTree && (
              <img src={christmasTree} alt="Christmas Tree" style={{ width: '35px', marginLeft: '10px' }} />
            )}
          </div>

          <div className="d-flex gap-3">
            <button className="btn btn-link text-decoration-none" onClick={() => smoothScrollTo(homeRef)} style={{ color: '#0d6efd' }}>
              Home
            </button>
            <button className="btn btn-link text-decoration-none" onClick={() => smoothScrollTo(featuresRef)} style={{ color: '#0d6efd' }}>
              Features
            </button>
            <button className="btn btn-orange rounded-pill px-4" onClick={openLogin}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Christmas banner */}
      {showChristmasTree && (
        <div className="christmas-greeting-banner">
          <span className="greeting-icon">🎄</span>
          <span className="greeting-text">Merry Christmas &amp; Happy New Year!</span>
          <span className="greeting-icon">🎁</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section ref={homeRef} className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-80">
            {/* Left column */}
            <div className={`col-lg-6 text-center text-lg-start ${(showSignUp || showLogin) ? 'col-lg-6' : 'col-lg-12'}`}>
              <h2 className="display-5 fw-bold">Get the Loan You Need</h2>
              <p className="lead mb-4">Simple, fast, and transparent loan process</p>
              <div className="d-flex justify-content-center justify-content-lg-start gap-3 flex-wrap align-items-center">
                <button className="btn btn-light text-primary px-4 rounded-pill" onClick={openSignUp}>
                  Create Account
                </button>
                <button className="btn btn-outline-light px-4 rounded-pill" onClick={openLogin}>
                  Login
                </button>
                {/* Enlarged second logo */}
                <img
                  src={logo}
                  alt="Yonkopa Logo"
                  className="d-none d-sm-inline-block"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginLeft: '20px',
                  }}
                />
              </div>
            </div>

            {/* Right column – form appears here when active */}
            {(showSignUp || showLogin) && (
              <div className="col-lg-6 mt-4 mt-lg-0 d-flex justify-content-center">
                {showSignUp && (
                  <SignUpPage
                    onClose={handleCloseSignUp}
                    onSwitchToLogin={handleSwitchToLogin}
                  />
                )}
                {showLogin && (
                  <LoginPage
                    onClose={handleCloseLogin}
                    onSwitchToSignUp={handleSwitchToSignUp}
                  />
                )}
              </div>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator" onClick={() => smoothScrollTo(featuresRef)}>
            <span>Scroll Down</span>
            <FaChevronDown className="scroll-arrow" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section ref={featuresRef} className="features-section">
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: '#0d6efd' }}>Why Choose Yonkopa?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4 feature-card">
                <FaBolt className="feature-icon" />
                <h4>Quick Approval</h4>
                <p>Get decisions within 24 hours</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4 feature-card">
                <FaChartLine className="feature-icon" />
                <h4>Low Interest Rates</h4>
                <p>Affordable and flexible repayment plans</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm h-100 text-center p-3 rounded-4 feature-card">
                <FaShieldAlt className="feature-icon" />
                <h4>No Hidden Fees</h4>
                <p>Transparent pricing, no surprises</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION – the "Sign Up Now" button now scrolls to the form */}
      <section className="cta-section">
        <div className="container text-center">
          <h3 className="mb-3">Ready to Get Started?</h3>
          <p className="mb-4">Join thousands of satisfied customers who trust Yonkopa</p>
          <button className="btn btn-orange btn-lg rounded-pill px-5" onClick={openSignUp}>
            Sign Up Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="custom-footer">
        <div className="container">
          <p className="m-0">&copy; 2026 Yonkopa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLanding;