import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BuyNowPage.css";

const BuyNowPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();

  // Fetch cart items and calculate order summary
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Please login to continue");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/cart/", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart data");
        }

        const cartData = await response.json();
        
        // Transform cart data to order summary format
        const items = cartData.items?.map(item => ({
          id: item.id,
          name: item.product.name,
          price: item.product.discounted_price || item.product.price,
          quantity: item.quantity,
          image: item.product.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop",
          product: item.product.id
        })) || [];

        if (items.length === 0) {
          setError("Your cart is empty");
          setLoading(false);
          return;
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 999 ? 0 : 49;
        const discount = Math.min(200, subtotal * 0.1); // 10% discount up to 200
        const total = subtotal + shipping - discount;

        setOrderSummary({
          items,
          subtotal,
          shipping,
          discount,
          total,
          cartId: cartData.id
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required";
      } else if (formData.fullName.trim().length < 2) {
        errors.fullName = "Please enter a valid name";
      }

      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }

      if (!formData.email.trim()) {
        errors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        errors.address = "Address is required";
      } else if (formData.address.trim().length < 10) {
        errors.address = "Please enter a complete address";
      }

      if (!formData.city.trim()) {
        errors.city = "City is required";
      }

      if (!formData.state.trim()) {
        errors.state = "State is required";
      }

      if (!formData.pincode.trim()) {
        errors.pincode = "Pincode is required";
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = "Please enter a valid 6-digit pincode";
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateStep(3);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!orderSummary) {
      setError("No order items found");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const orderPayload = {
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        payment_method: formData.paymentMethod,
      };

      const response = await fetch("http://localhost:8000/api/order/place/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const orderResponse = await response.json();
      setOrderData(orderResponse);
      
      // Show order placed animation
      setOrderPlaced(true);

      // After animation, show success message and redirect
      setTimeout(() => {
        // Redirect to order confirmation page after animation
        navigate(`/`, { 
          state: { 
            orderData: orderResponse,
            customerName: formData.fullName,
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
            paymentMethod: formData.paymentMethod,
            orderTotal: orderSummary.total
          }
        });
      }, 3000);

    } catch (err) {
      setError(err.message);
      alert(`Order failed: ${err.message}`);
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setFormErrors({});
    setCurrentStep(currentStep - 1);
  };

  const formattedAddress = formData.address ? 
    `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}` : 
    "Address not provided";

  // Order Placed Animation
  if (orderPlaced) {
    return (
      <div className="order-success-container">
        <div className="order-success-animation">
          <div className="success-icon">
            <div className="success-circle">
              <div className="success-checkmark">✓</div>
            </div>
            <div className="confetti">
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
              <div className="confetti-piece"></div>
            </div>
          </div>
          <h2 className="success-title">Order Placed Successfully!</h2>
          <p className="success-message">
            Thank you for your purchase, {formData.fullName}!<br />
            Your order is being processed and will be shipped soon.
          </p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p className="redirect-message">Redirecting to order details...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <div className="container">
            <div className="header-content">
              <div className="brand-section">
                <div className="brand-logo">
                  <div className="logo-icon">🛒</div>
                  <span className="brand-name">Friendly Mart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container checkout-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading your order...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <div className="container">
            <div className="header-content">
              <div className="brand-section">
                <div className="brand-logo">
                  <div className="logo-icon">🛒</div>
                  <span className="brand-name">Friendly Mart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container checkout-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Unable to load order</h3>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Professional Header */}
      <div className="checkout-header">
        <div className="container">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-logo">
                <div className="logo-icon">🛒</div>
                <span className="brand-name">Friendly Mart</span>
              </div>
              <div className="secure-badge">
                <span className="secure-icon">🔒</span>
                Secure Checkout
              </div>
            </div>
            
            <div className="checkout-progress">
              <h1 className="checkout-title">Complete Your Purchase</h1>
              <div className="checkout-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-bubble">
                    <div className="step-number">1</div>
                    <div className="step-check">✓</div>
                  </div>
                  <span className="step-label">Personal Info</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-bubble">
                    <div className="step-number">2</div>
                    <div className="step-check">✓</div>
                  </div>
                  <span className="step-label">Shipping</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-bubble">
                    <div className="step-number">3</div>
                    <div className="step-check">✓</div>
                  </div>
                  <span className="step-label">Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container checkout-content">
        <div className="checkout-grid">
          {/* Checkout Form */}
          <div className="checkout-form-section">
            <div className="form-card">
              <div className="card-header">
                <div className="step-info">
                  <span className="step-current">Step {currentStep}</span>
                  <span className="step-total">of 3</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="checkout-form">
                
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <div className="step-icon">👤</div>
                      <div>
                        <h2>Personal Information</h2>
                        <p>Let's get to know you better</p>
                      </div>
                    </div>
                    
                    <div className="input-grid">
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-text">Full Name</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            className={`form-input ${formErrors.fullName ? 'error' : ''}`}
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.fullName && (
                          <div className="error-message">{formErrors.fullName}</div>
                        )}
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-text">Phone Number</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="tel"
                            className={`form-input ${formErrors.phone ? 'error' : ''}`}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="9876543210"
                            maxLength="10"
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.phone && (
                          <div className="error-message">{formErrors.phone}</div>
                        )}
                      </div>
                      
                      <div className="input-group full-width">
                        <label className="input-label">
                          <span className="label-text">Email Address</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="email"
                            className={`form-input ${formErrors.email ? 'error' : ''}`}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.email && (
                          <div className="error-message">{formErrors.email}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="step-actions">
                      <button type="button" className="btn btn-next" onClick={nextStep}>
                        Continue to Shipping
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping Address */}
                {currentStep === 2 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <div className="step-icon">🏠</div>
                      <div>
                        <h2>Shipping Address</h2>
                        <p>Where should we deliver your order?</p>
                      </div>
                    </div>
                    
                    <div className="input-grid">
                      <div className="input-group full-width">
                        <label className="input-label">
                          <span className="label-text">Complete Address</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <textarea
                            className={`form-input ${formErrors.address ? 'error' : ''}`}
                            name="address"
                            rows="3"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Flat / House No., Street, Locality, Landmark"
                            required
                          ></textarea>
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.address && (
                          <div className="error-message">{formErrors.address}</div>
                        )}
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-text">City</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            className={`form-input ${formErrors.city ? 'error' : ''}`}
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="Mumbai"
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.city && (
                          <div className="error-message">{formErrors.city}</div>
                        )}
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-text">State</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            className={`form-input ${formErrors.state ? 'error' : ''}`}
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            placeholder="Maharashtra"
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.state && (
                          <div className="error-message">{formErrors.state}</div>
                        )}
                      </div>
                      
                      <div className="input-group">
                        <label className="input-label">
                          <span className="label-text">Pincode</span>
                          <span className="required">*</span>
                        </label>
                        <div className="input-container">
                          <input
                            type="text"
                            className={`form-input ${formErrors.pincode ? 'error' : ''}`}
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                            placeholder="400001"
                            maxLength="6"
                          />
                          <div className="input-decoration"></div>
                        </div>
                        {formErrors.pincode && (
                          <div className="error-message">{formErrors.pincode}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="step-actions">
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        <span className="btn-arrow">←</span>
                        Back
                      </button>
                      <button type="button" className="btn btn-next" onClick={nextStep}>
                        Continue to Payment
                        <span className="btn-arrow">→</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {currentStep === 3 && (
                  <div className="form-step active">
                    <div className="step-header">
                      <div className="step-icon">💳</div>
                      <div>
                        <h2>Payment Method</h2>
                        <p>Choose your preferred payment option</p>
                      </div>
                    </div>
                    
                    <div className="payment-options">
                      <div className={`payment-option ${formData.paymentMethod === "cod" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          id="cod"
                          value="cod"
                          checked={formData.paymentMethod === "cod"}
                          onChange={handleChange}
                        />
                        <label htmlFor="cod" className="payment-label">
                          <div className="payment-icon">
                            <div className="icon-wrapper">💵</div>
                          </div>
                          <div className="payment-info">
                            <div className="payment-name">Cash on Delivery</div>
                            <div className="payment-desc">Pay when you receive your order</div>
                          </div>
                          <div className="payment-badge">Popular</div>
                        </label>
                      </div>
                      
                      
                      
                      
                    </div>

                    {/* Order Review */}
                    <div className="order-review">
                      <h4>Order Review</h4>
                      <div className="review-content">
                        <div className="customer-info">
                          <div className="info-item">
                            <span className="info-label">Contact</span>
                            <span className="info-value">{formData.email}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Phone</span>
                            <span className="info-value">{formData.phone}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Ship to</span>
                            <span className="info-value">{formattedAddress}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Method</span>
                            <span className="info-value">
                              {formData.paymentMethod === "cod" ? "Cash on Delivery" : 
                               formData.paymentMethod === "card" ? "Credit/Debit Card" : "UPI Payment"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="step-actions" style={{justifyContent:"space-between"}}>
                      <button type="button" className="btn btn-secondary" onClick={prevStep}>
                        <span className="btn-arrow">←</span>
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="btn-spinner"></div>
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">✨</span>
                            Complete Purchase
                            <span className="price-badge">₹{orderSummary.total}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="summary-card">
              <div className="card-glow"></div>
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="order-items">
                {orderSummary.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      <span className="item-quantity-badge">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">₹{item.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-divider">
                <div className="divider-line"></div>
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className={orderSummary.shipping === 0 ? "free-shipping" : ""}>
                    {orderSummary.shipping === 0 ? "FREE" : `₹${orderSummary.shipping}`}
                  </span>
                </div>
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-₹{orderSummary.discount}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{orderSummary.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="security-features">
                <div className="security-item">
                  <div className="security-icon">🔒</div>
                  <span>SSL Secure Payment</span>
                </div>
                <div className="security-item">
                  <div className="security-icon">🛡️</div>
                  <span>256-bit Encryption</span>
                </div>
                <div className="security-item">
                  <div className="security-icon">✓</div>
                  <span>PCI DSS Compliant</span>
                </div>
              </div>
            </div>

            {/* Trust Assurance */}
            <div className="trust-assurance">
              <div className="assurance-item">
                <div className="assurance-icon">🚚</div>
                <div className="assurance-content">
                  <div className="assurance-title">Free Shipping</div>
                  <div className="assurance-desc">On orders over ₹999</div>
                </div>
              </div>
              <div className="assurance-item">
                <div className="assurance-icon">↩️</div>
                <div className="assurance-content">
                  <div className="assurance-title">Easy Returns</div>
                  <div className="assurance-desc">30-day money back guarantee</div>
                </div>
              </div>
              <div className="assurance-item">
                <div className="assurance-icon">🌟</div>
                <div className="assurance-content">
                  <div className="assurance-title">24/7 Support</div>
                  <div className="assurance-desc">We're here to help</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNowPage;