  import React, { useState } from "react";
  import axios from "axios";
  import { useNavigate, Link } from "react-router-dom";
  import "./Login.css";

  const LoginPage = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Professional e-commerce/shopping image from online
    const loginImage = "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      // Clear message when user starts typing
      if (message) setMessage("");
    };

    const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setMessage("");

      try {
        const response = await axios.post("http://localhost:8000/api/auth/login/", {
          username: formData.username,
          password: formData.password,
        });

        // ✅ Save tokens and user info
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("user_id", response.data.user_id);

        // ✅ Redirect to homepage
        navigate("/", { replace: true });
      } catch (error) {
        setMessage(error.response?.data?.error || "Login failed. Please check your credentials and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="login-container">
        {/* Left Side - Image Section */}
        <div className="login-image-section">
          <div 
            className="login-image"
            style={{ backgroundImage: `url(${loginImage})` }}
          >
            <div className="image-overlay">
              <div className="brand-content">
                <div className="brand-header">
                  <div className="brand-logo">
                    <div className="logo-icon">FM</div>
                    <h1 className="brand-title">Friendly Mart</h1>
                  </div>
                  <p className="brand-tagline">Your trusted shopping companion</p>
                </div>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon">🛒</div>
                    <div className="feature-text">
                      <h3>Seamless Shopping</h3>
                      <p>Browse thousands of products with ease</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🚚</div>
                    <div className="feature-text">
                      <h3>Fast Delivery</h3>
                      <p>Get your orders delivered in no time</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🔒</div>
                    <div className="feature-text">
                      <h3>Secure Payments</h3>
                      <p>Your data is protected with encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your Friendly Mart account</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={message ? "error" : ""}
                />
              </div>

              <div className="input-group">
                <div className="label-container">
                  <label htmlFor="password">Password</label>
                 
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={message ? "error" : ""}
                />
              </div>

              {message && (
                <div className="message-container">
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {message}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`login-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              

              <div className="signup-section">
                <p>
                  Don't have an account?{" "}
                  <Link to="/register" className="signup-link">
                    Create account
                  </Link>
                </p>
              </div>
            </form>

            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default LoginPage;