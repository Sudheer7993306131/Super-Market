import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css"; // plain CSS

const DeliveryAgentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/delivery-login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("username", res.data.username);

      navigate("/dash"); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="dal-page">
      <div className="dal-card" role="main">
        <h3 className="dal-title">🚚 Delivery Agent Login</h3>

        {error && <div className="dal-alert">{error}</div>}

        <form onSubmit={handleLogin} className="dal-form" noValidate>
          <label className="dal-label">
            Username
            <input
              type="text"
              className="dal-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="dal-label">
            Password
            <input
              type="password"
              className="dal-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="dal-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryAgentLogin;
