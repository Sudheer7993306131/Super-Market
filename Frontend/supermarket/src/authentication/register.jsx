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
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:8000/api/auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

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
      console.error(error.response?.data);
      if (error.response?.data?.username) setErrors({ username: "Username already exists" });
      else if (error.response?.data?.email) setErrors({ email: "Email already registered" });
      else setMessage("❌ Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const heroImage = "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=2070&q=80";

  return (
    <div className="register-container">
      {/* Left Hero Section */}
      <div className="register-hero">
        <img src={heroImage} alt="Shopping Hero" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="hero-title">Friendly Mart</h1>
          <p className="hero-subtitle">Your favorite shopping destination</p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="register-form-section">
        <div className="form-container">
          <h2>Create Your Account</h2>
          <p className="form-subtitle">Join thousands of happy shoppers</p>

          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <label className={formData.username ? "filled" : ""}>Username</label>
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <label className={formData.email ? "filled" : ""}>Email Address</label>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <label className={formData.password ? "filled" : ""}>Password</label>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <label className={formData.confirmPassword ? "filled" : ""}>Confirm Password</label>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="terms-section">
              <p>
                By creating an account, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>

            {message && <div className={message.includes("❌") ? "message error" : "message success"}>{message}</div>}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="login-redirect">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
