import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const OrderPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    delivery: 0,
    total: 0
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'home'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
    calculateOrderSummary(savedCart);
    
    // Load saved address if exists
    const savedAddress = JSON.parse(localStorage.getItem('deliveryAddress') || '{}');
    if (savedAddress.fullName) {
      setDeliveryAddress(savedAddress);
    }
  }, []);

  const calculateOrderSummary = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.1; // 10% discount
    const delivery = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    const total = subtotal - discount + delivery;

    setOrderSummary({
      subtotal,
      discount,
      delivery,
      total
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
  if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address) {
    alert('Please fill in all required address details');
    return;
  }

  if (cartItems.length === 0) {
    alert('Your cart is empty');
    return;
  }

  setIsProcessing(true);

  // Save address for future use
  localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));

  // Simulate order processing
  setTimeout(() => {
    // Create order object
    const order = {
      id: Date.now(),
      items: cartItems,
      address: deliveryAddress,
      summary: orderSummary,
      status: 'confirmed',
      date: new Date().toLocaleDateString(),
      paymentMethod: 'Cash on Delivery'
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...existingOrders, order]));

    // Clear cart
    localStorage.removeItem('cart');
    
    setIsProcessing(false);
    
    // Redirect to place order confirmation page
    navigate('/order-confirmation', { state: { order } });
  }, 2000);
};

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateOrderSummary(updatedCart);
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateOrderSummary(updatedCart);
  };

  if (cartItems.length === 0) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to place an order</p>
            <button 
              className="continue-shopping-btn"
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
    <div className="order-page">
      <div className="container">
        <div className="order-header">
          <h1>Checkout</h1>
          <div className="breadcrumb">
            <span>Cart</span>
            <span className="active">Delivery Address</span>
            <span>Order Confirmation</span>
          </div>
        </div>

        <div className="order-content">
          {/* Left Column - Delivery Address */}
          <div className="order-left">
            <div className="address-section">
              <h2>Delivery Address</h2>
              <div className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={deliveryAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="Enter pincode"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address (House No, Building, Street) *</label>
                  <textarea
                    name="address"
                    value={deliveryAddress.address}
                    onChange={handleAddressChange}
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Enter your state"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={deliveryAddress.landmark}
                    onChange={handleAddressChange}
                    placeholder="Nearby landmark"
                  />
                </div>

                <div className="address-type">
                  <label>Address Type:</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="addressType"
                        value="home"
                        checked={deliveryAddress.addressType === 'home'}
                        onChange={handleAddressChange}
                      />
                      <span>Home</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="addressType"
                        value="work"
                        checked={deliveryAddress.addressType === 'work'}
                        onChange={handleAddressChange}
                      />
                      <span>Work</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="payment-section">
              <h2>Payment Method</h2>
              <div className="payment-method">
                <div className="payment-option selected">
                  <div className="payment-icon">💵</div>
                  <div className="payment-info">
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                  <div className="payment-check">✓</div>
                </div>
                <div className="payment-note">
                  <p>You will pay ₹{orderSummary.total} in cash when your order is delivered.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-right">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60/10b981/ffffff?text=Product';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">₹{item.price} × {item.quantity}</p>
                      <div className="item-actions">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row discount">
                  <span>Discount (10%)</span>
                  <span>-₹{orderSummary.discount.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Delivery Fee</span>
                  <span>{orderSummary.delivery === 0 ? 'FREE' : `₹${orderSummary.delivery}`}</span>
                </div>
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span>₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                className={`place-order-btn ${isProcessing ? 'processing' : ''}`}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Processing Order...
                  </>
                ) : (
                  `Place Order - ₹${orderSummary.total.toFixed(2)}`
                )}
              </button>

              <div className="order-note">
                <p>✅ Your order will be delivered in 2-3 business days</p>
                <p>💰 Pay ₹{orderSummary.total.toFixed(2)} cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;