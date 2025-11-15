import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('You must be logged in to view orders.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/orders/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const processedOrders = res.data.map(order => ({
        ...order,
        status: order.status || 'pending',
        items: order.items || [],
        total_price: order.total_price || 0,
        created_at: order.created_at || new Date().toISOString()
      }));
      
      setOrders(processedOrders);
      setError('');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to load orders. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (price) => {
    const priceValue = price || 0;
    return new Intl.NumberFormat('en-IN').format(priceValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    const statusValue = (status || 'pending').toLowerCase();
    switch (statusValue) {
      case 'confirmed':
      case 'processing':
        return '#f59e0b';
      case 'shipped':
        return '#3b82f6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
      case 'canceled':
        return '#ef4444';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    const statusValue = (status || 'pending').toLowerCase();
    switch (statusValue) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
      case 'canceled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status || 'Pending';
    }
  };

  const getOrderProgress = (status) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'pending':
        return 10;
      case 'confirmed':
        return 30;
      case 'processing':
        return 50;
      case 'shipped':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
      case 'canceled':
        return 0;
      default:
        return 0;
    }
  };

  const getProductImage = (product) => {
    if (!product) return '/default-product-image.jpg';
    
    const imageUrl = product?.image?.startsWith("http")
      ? product.image
      : `http://127.0.0.1:8000${product?.image}`;
    
    return imageUrl;
  };

  const continueShopping = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3>Loading Your Orders...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="error-container">
            <h3>{error}</h3>
            <button className="continue-shopping-btn" onClick={continueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className="continue-shopping-btn" onClick={continueShopping}>
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="container">
        <div className="order-header">
          <h1>Your Orders</h1>
          <div className="breadcrumb">
            <span>Home</span>
            <span className="active">My Orders</span>
          </div>
        </div>

        <div className="orders-content">
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                {/* Order Header */}
                <div className="order-header-info">
                  <div className="order-meta">
                    <div className="order-id">
                      <strong>Order #{order.id || 'N/A'}</strong>
                    </div>
                    <div className="order-date">
                      Placed on {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="order-progress-section">
                  <div className="progress-label">
                    <span>Status: {getStatusText(order.status)}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${getOrderProgress(order.status)}%`,
                        backgroundColor: getStatusColor(order.status),
                      }}
                    ></div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  {(order.items || []).map((item, index) => (
                    <div key={item.id || index} className="order-item">
                      <div className="item-image">
                        <img 
                          src={getProductImage(item.product)}
                          alt={item.product_name || 'Product'}
                          onError={(e) => { 
                            e.target.src = '/default-product-image.jpg'; 
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.product_name || 'Product Name Not Available'}</h4>
                        <div className="item-price-info">
                          <span className="item-price">
                            ₹{formatPrice(item.discounted_price || item.price)}
                          </span>
                          <span className="item-quantity">
                            × {item.quantity || 1}
                          </span>
                        </div>
                        <div className="item-subtotal">
                          Subtotal: ₹{formatPrice(
                            (item.discounted_price || item.price || 0) * (item.quantity || 1)
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Items Total:</span>
                    <span>₹{formatPrice(order.total_price)}</span>
                  </div>
                  {(order.discount || 0) > 0 && (
                    <div className="summary-row discount">
                      <span>Discount:</span>
                      <span>-₹{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Delivery:</span>
                    <span>
                      {(order.delivery_charge || 0) === 0 ? 'FREE' : `₹${formatPrice(order.delivery_charge)}`}
                    </span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span className="total-amount">
                      ₹{formatPrice(order.final_amount || order.total_price)}
                    </span>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="order-actions">
                  <button className="btn-outline">View Details</button>
                  {order.status && order.status.toLowerCase() === 'delivered' && (
                    <button className="btn-primary">Buy Again</button>
                  )}
                  {order.status && order.status.toLowerCase() === 'confirmed' && (
                    <button className="btn-cancel">Cancel Order</button>
                  )}
                  {order.status && order.status.toLowerCase() === 'shipped' && (
                    <button className="btn-primary">Track Order</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Order Statistics */}
          <div className="orders-sidebar">
            <div className="stats-card">
              <h3>Order Summary</h3>
              <div className="stats-content">
                <div className="stat-item">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{orders.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Amount Spent</span>
                  <span className="stat-value">
                    ₹{formatPrice(
                      orders.reduce((total, order) => 
                        total + (order.final_amount || order.total_price || 0), 0
                      )
                    )}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Orders</span>
                  <span className="stat-value">
                    {orders.filter(order => {
                      const status = (order.status || '').toLowerCase();
                      return ['confirmed', 'processing', 'shipped', 'pending'].includes(status);
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="support-card">
              <h3>Need Help?</h3>
              <div className="support-content">
                <p>If you have any questions about your orders, our support team is here to help.</p>
                <button className="support-btn">Contact Support</button>
                <div className="support-info">
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <span>+91-9876543210</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">✉️</span>
                    <span>support@example.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderPage;