import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Register user
      await axios.post("http://localhost:8000/api/auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Auto-login after registration
      const loginResponse = await axios.post("http://localhost:8000/api/auth/login/", {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = loginResponse.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      setMessage("🎉 Registration successful! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      
      if (error.response?.data?.username) {
        setErrors({ username: "Username already exists" });
      } else if (error.response?.data?.email) {
        setErrors({ email: "Email already registered" });
      } else {
        setMessage("❌ Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Left Section - Brand & Visual */}
      <div className="register-hero">
        <div className="hero-content">
          <div className="brand-section">
            <div className="logo">FM</div>
            <h1 className="brand-title">Friendly Mart</h1>
            <p className="brand-tagline">Your favorite shopping destination</p>
          </div>
          
          <div className="hero-image-container">
            <img
              src="/images/signup-hero.jpg"
              alt="Welcome to Friendly Mart"
              className="hero-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="image-placeholder">
              <div className="placeholder-icon">🛒</div>
              <p>Start your shopping journey with us</p>
            </div>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <span>Free delivery on first order</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Exclusive member deals</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Fast & secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="register-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Join thousands of happy shoppers</p>
          </div>

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {/* Terms and Conditions */}
            <div className="terms-section">
              <p className="terms-text">
                By creating an account, you agree to our{" "}
                <a href="/terms" className="terms-link">Terms of Service</a> and{" "}
                <a href="/privacy" className="terms-link">Privacy Policy</a>
              </p>
            </div>

            {message && (
              <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <div className="social-signup">
              <button type="button" className="social-btn google-btn">
                <span className="social-icon">🔍</span>
                Continue with Google
              </button>
              <button type="button" className="social-btn facebook-btn">
                <span className="social-icon">📘</span>
                Continue with Facebook
              </button>
            </div>

            <div className="login-redirect">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;