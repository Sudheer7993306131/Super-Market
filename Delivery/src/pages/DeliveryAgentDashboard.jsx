import React, { useEffect, useState } from "react";
import axios from "axios";
import './delivery.css';

const DeliveryAgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/delivery/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user addresses by username
  const fetchUserAddress = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://127.0.0.1:8000/api/address/${username}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const addresses = res.data.user_addresses; // array of addresses
        console.log("Addresses for", username, ":", addresses);

        setSelectedOrder(prev => ({
          ...prev,
          user_addresses: addresses
        }));
      } else {
        console.error(res.data.error);
        setSelectedOrder(prev => ({ ...prev, user_addresses: [] }));
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      setSelectedOrder(prev => ({ ...prev, user_addresses: [] }));
    }
  };

  // Fetch order details (now uses username)
  const fetchOrderDetails = async (order) => {
    await fetchUserAddress(order.customer_name);
  };

  // Update order status
  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://127.0.0.1:8000/api/delivery/order/${id}/update/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Order status updated to ${status}`);
      setTimeout(() => setMessage(""), 3000);

      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );

      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update order status");
    }
  };

  // Status badge UI
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'status-pending', label: 'Pending' },
      'Out for Delivery': { class: 'status-out', label: 'Out for Delivery' },
      'Delivered': { class: 'status-delivered', label: 'Delivered' }
    };

    const config = statusConfig[status] || { class: 'status-pending', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
    delivered: orders.filter(o => o.status === 'Delivered').length
  };

  if (loading) {
    return (
      <div className="delivery-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your delivery assignments...</p>
        </div>
      </div>
    );
  }

  const handleCardClick = (filterId) => {
    setActiveFilter(filterId);
    const filtered = orders.filter(o => filterId === "all" ? true : o.status === filterId);
    setSelectedOrder(filtered.length > 0 ? filtered[0] : null);
  };

  return (
    <div className="delivery-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">🚚</div>
            <div>
              <h1>Delivery Agent Dashboard</h1>
              <p>Manage your delivery assignments efficiently</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={fetchOrders}>
            <span className="refresh-icon">🔄</span>
            Refresh
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => handleCardClick("all")}>
            <div className="stat-icon total">📦</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick("Pending")}>
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick("Out for Delivery")}>
            <div className="stat-icon out">🚗</div>
            <div className="stat-info">
              <h3>{stats.outForDelivery}</h3>
              <p>Out for Delivery</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => handleCardClick("Delivered")}>
            <div className="stat-icon delivered">✅</div>
            <div className="stat-info">
              <h3>{stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Message Alert */}
      {message && (
        <div className="alert-message success">
          <span className="alert-icon">✅</span>
          {message}
        </div>
      )}

      {/* Orders Table */}
      <section className="orders-section">
        <div className="section-header">
          <h2>Delivery Assignments</h2>
          <p>Update order status as you complete deliveries</p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>There are no orders matching your current filter.</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="order-row"
                    onClick={() => {
                      setSelectedOrder(order);
                      fetchOrderDetails(order);
                    }}
                    style={{ cursor: "pointer", backgroundColor: selectedOrder?.id === order.id ? "#f0f8ff" : "transparent" }}
                  >
                    <td>
                      <div className="order-info">
                        <div className="order-id">Order #{order.order_id}</div>
                        <div className="order-date">
                          Assigned: {new Date(order.assigned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customer_name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="amount">₹{order.total_price}</div>
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <div className="status-update">
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={order.status === 'Delivered'}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        {order.status === 'Delivered' && (
                          <div className="delivered-badge">
                            <span className="check-icon">✓</span>
                            Completed
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Selected Order Details */}
      {selectedOrder?.user_addresses && selectedOrder.user_addresses.length > 0 && (
        <section className="order-detail-section">
          <h3>Delivery Addresses for {selectedOrder.customer_name}</h3>
          {selectedOrder.user_addresses.map((address, idx) => (
            <div key={idx} className="address-card">
              <p><strong>Name:</strong> {address.full_name}</p>
              <p><strong>Phone:</strong> {address.phone_number}</p>
              <p><strong>Address:</strong> {address.address_line}</p>
              <p><strong>City:</strong> {address.city}</p>
              <p><strong>State:</strong> {address.state}</p>
              <p><strong>ZIP Code:</strong> {address.postal_code}</p>
              {address.landmark && <p><strong>Landmark:</strong> {address.landmark}</p>}
              {address.is_default && <p><em>Default Address</em></p>}
            </div>
          ))}
          <button onClick={() => setSelectedOrder(null)} className="close-btn">Close</button>
        </section>
      )}
    </div>
  );
};

export default DeliveryAgentDashboard;
