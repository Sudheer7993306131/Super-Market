  import React, { useState } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';

  const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:8000/api/auth/login/', {
          username,
          password
        });

        // Save tokens and user info
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('user_id', response.data.user_id);

        // Redirect to Home page
        navigate('/', { replace: true });
      } catch (error) {
        setMessage(error.response?.data?.error || 'Login failed');
      }
    };

    return (
      <div style={{ maxWidth: 400, margin: '50px auto' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button type="submit" style={{ padding: 10, width: '100%' }}>Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  };

  export default LoginPage;
