import React, { useEffect, useState } from "react";
import axios from "axios";
import './SellerOrders.css';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Orders", color: "gray" },
    { value: "pending", label: "Pending", color: "orange" },
    { value: "confirmed", label: "Confirmed", color: "blue" },
    { value: "shipped", label: "Shipped", color: "purple" },
    { value: "delivered", label: "Delivered", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/api/seller/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setError("Unexpected response format from server.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://127.0.0.1:8000/api/seller/orders/${orderId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError("Failed to update order status.");
      console.error("Update order error:", err);
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = {
      pending: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
      confirmed: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
      shipped: { bg: "#e9d5ff", text: "#6b21a8", border: "#8b5cf6" },
      delivered: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
      cancelled: { bg: "#fecaca", text: "#991b1b", border: "#ef4444" }
    };
    return statusConfig[status] || { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div className="seller-orders-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-orders-container">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Order Management</h1>
            <p>Manage and track your customer orders</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-section">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search orders by ID, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-filter"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
          <button onClick={() => setError("")} className="alert-close">×</button>
        </div>
      )}

      {/* Orders Content */}
      <div className="orders-content">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <svg viewBox="0 0 200 200" width="120" height="120">
                <path fill="#e2e8f0" d="M100 20a80 80 0 100 160 80 80 0 000-160zm0 20a60 60 0 110 120 60 60 0 010-120z"/>
                <path fill="#94a3b8" d="M140 80H60v40h80V80z"/>
                <rect x="70" y="85" width="60" height="30" rx="4" fill="#64748b"/>
              </svg>
            </div>
            <h3>No orders found</h3>
            <p>
              {orders.length === 0 
                ? "You haven't received any orders yet. Orders will appear here when customers purchase your products."
                : "No orders match your current filters. Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <h3 className="order-id">Order #{order.id}</h3>
                      <span className="order-date">
                        {formatDate(order.created_at || new Date())}
                      </span>
                    </div>
                    <div 
                      className="order-status"
                      style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderColor: statusColor.border
                      }}
                    >
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </div>
                  </div>

                  <div className="order-customer">
                    <div className="customer-info">
                      <svg className="customer-icon" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span>{order.user || "Guest Customer"}</span>
                    </div>
                  </div>

                  <div className="order-items">
                    <div className="items-summary">
                      <span className="items-count">
                        {getTotalItems(order.items)} items
                      </span>
                      <span className="items-price">
                        {formatPrice(order.total_price || 0)}
                      </span>
                    </div>
                    <div className="items-preview">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="item-preview">
                          <div className="item-image">
                            {item.product?.image ? (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`image-fallback ${item.product?.image ? 'hidden' : ''}`}>
                              <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                            </div>
                          </div>
                          <span className="item-name">
                            {item.product?.name || "Unnamed Product"}
                          </span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="more-items">+{order.items.length - 3} more</div>
                      )}
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="btn btn-outline"
                      onClick={() => openOrderDetails(order)}
                    >
                      View Details
                    </button>
                    <select 
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                      style={{
                        borderColor: statusColor.border,
                        color: statusColor.text
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirm</option>
                      <option value="shipped">Ship</option>
                      <option value="delivered">Mark Delivered</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Customer</span>
                    <span className="detail-value">{selectedOrder.user || "Guest"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order Date</span>
                    <span className="detail-value">
                      {formatDate(selectedOrder.created_at || new Date())}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span 
                      className="detail-status"
                      style={getStatusColor(selectedOrder.status)}
                    >
                      {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item-detail">
                      <div className="item-image">
                        {item.product?.image ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`image-fallback ${item.product?.image ? 'hidden' : ''}`}>
                          <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="item-info">
                        <h4>{item.product?.name || "Unnamed Product"}</h4>
                        <p className="item-price">
                          {formatPrice(item.product?.price || 0)} × {item.quantity}
                        </p>
                      </div>
                      <div className="item-total">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-total">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.total_price || 0)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total_price || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowOrderModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <select 
                value={selectedOrder.status || 'pending'}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder.id, e.target.value);
                  setShowOrderModal(false);
                }}
                className="status-select modal-status"
                style={getStatusColor(selectedOrder.status)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirm Order</option>
                <option value="shipped">Mark as Shipped</option>
                <option value="delivered">Mark as Delivered</option>
                <option value="cancelled">Cancel Order</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;