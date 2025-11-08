import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PlaceOrderPage.css';

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState('processing');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get order details from location state or localStorage
    const orderFromState = location.state?.order;
    if (orderFromState) {
      setOrderDetails(orderFromState);
    } else {
      // Fallback: get the latest order from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      if (orders.length > 0) {
        setOrderDetails(orders[orders.length - 1]);
      }
    }

    // Simulate order processing
    const timer = setTimeout(() => {
      setOrderStatus('confirmed');
      startCountdown();
    }, 3000);

    return () => clearTimeout(timer);
  }, [location]);

  const startCountdown = () => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const downloadInvoice = () => {
    // Simulate invoice download
    alert('Invoice download started!');
  };

  const trackOrder = () => {
    navigate('/orders');
  };

  const continueShopping = () => {
    navigate('/');
  };

  if (!orderDetails) {
    return (
      <div className="place-order-page">
        <div className="container">
          <div className="order-not-found">
            <div className="error-icon">❌</div>
            <h2>Order Not Found</h2>
            <p>We couldn't find your order details.</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order-page">
      <div className="container">
        {/* Header Section */}
        <div className="order-header-section">
          <div className="header-content">
            {orderStatus === 'processing' ? (
              <>
                <div className="processing-animation">
                  <div className="spinner"></div>
                </div>
                <h1>Processing Your Order</h1>
                <p>Please wait while we confirm your order details...</p>
              </>
            ) : (
              <>
                <div className="success-animation">
                  <div className="success-checkmark">
                    <div className="check-icon">
                      <span className="icon-line line-tip"></span>
                      <span className="icon-line line-long"></span>
                      <div className="icon-circle"></div>
                      <div className="icon-fix"></div>
                    </div>
                  </div>
                </div>
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase. Your order has been successfully placed.</p>
              </>
            )}
          </div>
        </div>

        <div className="order-content">
          {/* Left Column - Order Details */}
          <div className="order-left">
            {/* Order Summary Card */}
            <div className="order-card">
              <div className="card-header">
                <h2>Order Summary</h2>
                <div className="order-badge">
                  <span className={`status-badge ${orderStatus}`}>
                    {orderStatus === 'processing' ? 'Processing' : 'Confirmed'}
                  </span>
                </div>
              </div>
              
              <div className="order-items">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60/10b981/ffffff?text=Product';
                      }}
                    />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                      <p className="item-price">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Items Total</span>
                  <span>₹{orderDetails.summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-₹{orderDetails.summary.discount.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Delivery</span>
                  <span>{orderDetails.summary.delivery === 0 ? 'FREE' : `₹${orderDetails.summary.delivery}`}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total Amount</span>
                  <span>₹{orderDetails.summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="order-card">
              <div className="card-header">
                <h2>Delivery Information</h2>
              </div>
              <div className="delivery-info">
                <div className="info-row">
                  <span className="info-label">Delivery Address:</span>
                  <span className="info-value">
                    {orderDetails.address.address}, {orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.pincode}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact Person:</span>
                  <span className="info-value">{orderDetails.address.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone Number:</span>
                  <span className="info-value">{orderDetails.address.phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Estimated Delivery:</span>
                  <span className="info-value highlight">2-3 Business Days</span>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="order-card">
              <div className="card-header">
                <h2>Payment Information</h2>
              </div>
              <div className="payment-info">
                <div className="payment-method-display">
                  <div className="payment-icon">💵</div>
                  <div className="payment-details">
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                </div>
                <div className="payment-amount">
                  <span>Amount to pay on delivery:</span>
                  <span className="amount">₹{orderDetails.summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Actions */}
          <div className="order-right">
            <div className="action-card">
              <div className="order-id-section">
                <h3>Order ID</h3>
                <div className="order-id">#{orderDetails.id}</div>
                <p className="order-date">Order Date: {orderDetails.date}</p>
              </div>

              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={trackOrder}
                >
                  <span>Track Your Order</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>

                <button 
                  className="action-btn secondary"
                  onClick={downloadInvoice}
                >
                  <span>Download Invoice</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>

                <button 
                  className="action-btn outline"
                  onClick={continueShopping}
                >
                  <span>Continue Shopping</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 12l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {/* Support Section */}
              <div className="support-section">
                <h4>Need Help?</h4>
                <div className="support-options">
                  <div className="support-option">
                    <div className="support-icon">📞</div>
                    <div className="support-info">
                      <span>Call Support</span>
                      <small>+91 1800-123-4567</small>
                    </div>
                  </div>
                  <div className="support-option">
                    <div className="support-icon">💬</div>
                    <div className="support-info">
                      <span>Live Chat</span>
                      <small>24/7 Available</small>
                    </div>
                  </div>
                  <div className="support-option">
                    <div className="support-icon">📧</div>
                    <div className="support-info">
                      <span>Email Support</span>
                      <small>support@eshop.com</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              {orderStatus === 'confirmed' && (
                <div className="countdown-section">
                  <p>Redirecting to orders page in <span className="countdown-timer">{countdown}</span> seconds...</p>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="timeline-card">
              <h3>Order Timeline</h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Order Placed</h4>
                    <p>Your order has been received</p>
                    <span>Just now</span>
                  </div>
                </div>
                <div className="timeline-item active">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Order Confirmed</h4>
                    <p>We're preparing your items</p>
                    <span>Next step</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Shipped</h4>
                    <p>Your order is on the way</p>
                    <span>Expected in 1 day</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Delivered</h4>
                    <p>Your order will be delivered</p>
                    <span>Expected in 2-3 days</span>
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

export default PlaceOrderPage;