import React from 'react';

const HomePage = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(); // Redirect to login
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Welcome to Supermarket</h1>
      <button onClick={handleLogout} style={{ padding: 10, marginTop: 20 }}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;
