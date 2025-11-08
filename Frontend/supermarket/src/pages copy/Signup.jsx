import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Mock user validation for demo
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = existingUsers.find(
      (user) => user.email === formData.email
    );

    if (userExists) {
      setMessage("⚠️ User already exists. Please login instead.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    // Save new user
    existingUsers.push(formData);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    setMessage("✅ Account created successfully!");
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="signup-container">
      {/* Left side image */}
      <div className="signup-left">
        <img
          src="/images/signup-bg.jpg"
          alt="Friendly Mart"
          className="signup-image"
        />
      </div>

      {/* Right side form */}
      <div className="signup-right">
        <div className="signup-box">
          <h1 className="brand-title">Friendly Mart</h1>
          <h2 className="signup-heading">Create Account</h2>

          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {message && <p className="signup-message">{message}</p>}

            <button type="submit" className="signup-btn">
              Sign Up
            </button>

            <p className="login-link">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>Login here</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
