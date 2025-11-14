import React, { useEffect, useState } from "react";
import axios from "axios";
import './delivery.css';

const DeliveryAgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://127.0.0.1:8000/api/delivery/order/${id}/update/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Order status updated to ${status}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update order status");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'status-pending', label: 'Pending' },
      'Out for Delivery': { class: 'status-out', label: 'Out for Delivery' },
      'Delivered': { class: 'status-delivered', label: 'Delivered' }
    };
    
    const config = statusConfig[status] || { class: 'status-pending', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      'Pending': ['Out for Delivery', 'Delivered'],
      'Out for Delivery': ['Delivered'],
      'Delivered': []
    };
    
    return statusFlow[currentStatus] || [];
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
          <div className="stat-card">
            <div className="stat-icon total">📦</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon out">🚗</div>
            <div className="stat-info">
              <h3>{stats.outForDelivery}</h3>
              <p>Out for Delivery</p>
            </div>
          </div>
          <div className="stat-card">
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

      {/* Filters */}
      <section className="filters-section">
        <div className="filter-tabs">
          {[
            { id: "all", label: "All Orders", count: stats.total },
            { id: "Pending", label: "Pending", count: stats.pending },
            { id: "Out for Delivery", label: "Out for Delivery", count: stats.outForDelivery },
            { id: "Delivered", label: "Delivered", count: stats.delivered }
          ].map(filter => (
            <button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span className="filter-label">{filter.label}</span>
              <span className="filter-count">{filter.count}</span>
            </button>
          ))}
        </div>
      </section>

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
                  onMouseEnter={(e) => showUserPopup(order, e)}
                  onMouseMove={(e) => showUserPopup(order, e)}
                  onMouseLeave={hideUserPopup}
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
                    <td>
                      {getStatusBadge(order.status)}
                    </td>
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

      {/* Quick Actions */}
      <section className="actions-section">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => setActiveFilter('Pending')}>
            <span className="action-icon">⏳</span>
            <span className="action-text">View Pending Orders</span>
          </button>
          <button className="action-card" onClick={() => setActiveFilter('Out for Delivery')}>
            <span className="action-icon">🚗</span>
            <span className="action-text">Active Deliveries</span>
          </button>
          <button className="action-card" onClick={fetchOrders}>
            <span className="action-icon">🔄</span>
            <span className="action-text">Refresh Orders</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DeliveryAgentDashboard;  