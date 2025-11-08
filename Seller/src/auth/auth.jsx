import React, { useState } from "react";
import axios from "axios";
import "./auth.css";

const SellerAuth = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const showSuccessMsg = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/seller-login/", {
        username: credentials.username,
        password: credentials.password,
      });
      localStorage.setItem("token", res.data.access);
      showSuccessMsg("✅ Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/seller/dashboard";
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card">
        {/* Header Section */}
        <div className="auth-header">
          <div className="logo-container">
            <div className="logo">
              <svg viewBox="0 0 24 24" className="logo-icon">
                <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>SellerHub</h1>
              <span>Marketplace</span>
            </div>
          </div>

          <h2>Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your seller dashboard and manage your business
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message show">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div className="input-container">
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="form-input"
                placeholder=" "
                required
              />
              <label className="input-label">Username</label>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-input"
                placeholder=" "
                required
              />
              <label className="input-label">Password</label>
              <div className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">!</div>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

       

        

        {/* Support Links */}
        <div className="auth-footer">
          <div className="support-links">
            <a href="/forgot-password" className="footer-link">Forgot password?</a>
            <span className="divider">•</span>
            <a href="/contact-support" className="footer-link">Need help?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAuth;