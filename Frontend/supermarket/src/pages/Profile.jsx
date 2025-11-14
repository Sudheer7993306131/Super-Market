import React, { useEffect, useState } from "react";
import "./Profile.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const token = localStorage.getItem("access_token");

  // Fetch user profile, orders, and addresses
  useEffect(() => {
    if (!token) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch("http://127.0.0.1:8000/api/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch("http://127.0.0.1:8000/api/addresses/", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([userData, orderData, addressData]) => {
        setUser(userData);
        setOrders(orderData || []);
        setAddresses(addressData || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile information.");
        setLoading(false);
      });
  }, [token]);

  // Add new address
  const handleAddAddress = (e) => {
    e.preventDefault();

    fetch("http://127.0.0.1:8000/api/addresses/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAddress),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save address");
        return res.json();
      })
      .then((data) => {
        setAddresses((prev) => [...prev, data]);
        setNewAddress({
          full_name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
        });
        setShowAddressForm(false);
        alert("Address added successfully!");
      })
      .catch(() => alert("Error adding address"));
  };

  if (loading)
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="profile-error">
        <p>{error}</p>
        {!token && <button onClick={() => (window.location.href = "/login")}>Go to Login</button>}
      </div>
    );

  return (
    <div className="profile-container">
      {/* User Info */}
      <section className="profile-header">
        <h1>👤 My Profile</h1>
        <div className="user-info">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
          <div className="user-details">
            <h2>{user?.name || "User Name"}</h2>
            <p>Email: {user?.email}</p>
          </div>
        </div>
      </section>

      {/* Addresses */}
      <section className="profile-section">
        <div className="section-header">
          <h2>🏠 My Addresses</h2>
          <button className="add-btn" onClick={() => setShowAddressForm(!showAddressForm)}>
            {showAddressForm ? "Cancel" : "Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form className="address-form" onSubmit={handleAddAddress}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddress.full_name}
                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
              />
            </div>
            <button type="submit" className="save-btn">Save Address</button>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="empty-msg">No saved addresses yet.</p>
        ) : (
          <div className="address-grid">
            {addresses.map((addr) => (
              <div className="address-card" key={addr.id}>
                <h4>{addr.full_name}</h4>
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} - {addr.postal_code}
                </p>
                <p>📞 {addr.phone}</p>
                <p>{addr.country}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="profile-section">
        <h2>🛍️ My Orders</h2>
        {orders.length === 0 ? (
          <p className="empty-msg">You haven’t placed any orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-header">
                  <h4>Order #{order.id}</h4>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ₹{order.total_amount}</p>
                <div className="order-items">
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item">
                      <img
                        src={
                          item.product.image?.startsWith("http")
                            ? item.product.image
                            : `http://127.0.0.1:8000${item.product.image}`
                        }
                        alt={item.product.name}
                      />
                      <div>
                        <p>{item.product.name}</p>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
