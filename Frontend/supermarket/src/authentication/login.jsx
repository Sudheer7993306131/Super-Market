import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Reuse same CSS

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
      setMessage(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Image */}
      <div className="login-image"></div>

      {/* Right Side - Form */}
      <div className="login-form-section">
        <div className="login-box">
          <h1 className="brand-title">Friendly Mart</h1>
          <p className="login-text">Welcome back! Please log in to your account.</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {message && <p className="error-message">{message}</p>}

            <div className="form-actions">
              <button type="submit" className="login-btn">
                Login
              </button>
              <p className="signup-text">
                Don’t have an account? <a href="/signup">Sign Up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
