import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './cartpage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Fetch the cart of the logged-in user
  const fetchCart = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setError('You must be logged in to view the cart.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/cart/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Transform API response to match the expected format
      const transformedItems = res.data.items?.map(item => ({
        id: item.id,
        product_id: item.product_id || item.product?.id,
        name: item.product_name || item.product?.name,
        price: item.discounted_price || item.product?.discounted_price || 0,
        originalPrice: item.product?.original_price || null,
        quantity: item.quantity,
        stock: item.product?.stock || 99, // Default stock if not provided
        image: item.product?.image || '/default-product-image.jpg'
      })) || [];

      setCartItems(transformedItems);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to fetch cart. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove an item from cart
  const handleRemove = async (productId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const item = cartItems.find(item => item.product_id === productId);
    if (!window.confirm(`Remove ${item?.name} from your cart?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/cart/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(); // Refresh cart after removal
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      } else {
        setError('Failed to remove item from cart.');
        console.error(err);
      }
    }
  };

  // ✅ Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await axios.put(`http://localhost:8000/api/cart/update/${productId}/`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart(); // Refresh cart after update
    } catch (err) {
      console.error('Failed to update quantity:', err);
      // Revert UI on error
      fetchCart();
    }
  };

  const incrementQty = (productId) => {
    const item = cartItems.find((item) => item.product_id === productId);
    if (item && item.quantity < item.stock) {
      updateQuantity(productId, item.quantity + 1);
    }
  };
  
  // Decrement quantity
  const decrementQty = (productId) => {
    const item = cartItems.find((item) => item.product_id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const deleteItem = (productId) => {
    handleRemove(productId);
  };

  const clearCart = async () => {
    if (!window.confirm("Clear all items from your cart?")) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Clear all items one by one (you might want to implement a bulk delete endpoint)
      for (const item of cartItems) {
        await axios.delete(`http://localhost:8000/api/cart/remove/${item.product_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCart(); // Refresh cart
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart. Please try again.');
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Save cart data to localStorage for OrderPage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Navigate to OrderPage
    navigate("/buy");
  };

  const continueShopping = () => {
    navigate("/");
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading Cart...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="error-container">
          <h3>{error}</h3>
          <button className="continue-shopping-btn" onClick={continueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-container">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Shopping Cart is Empty</h2>
          <p>Browse our products and add items to get started</p>
          <button className="continue-shopping-btn" onClick={continueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="header-content">
          <h1 className="page-title">Shopping Cart</h1>
          <div className="cart-stats">
            <span className="item-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
          </div>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items-section">
          <div className="section-title">
            <h2>Cart Items</h2>
          </div>
          
          {/* Cart Items Header */}
          <div className="cart-items-header">
            <div className="header-product">Product</div>
            <div className="header-quantity">Quantity</div>
            <div className="header-price">Price</div>
            <div className="header-subtotal">Subtotal</div>
            <div className="header-actions">Actions</div>
          </div>
          
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                {/* Product Info */}
                <div className="product-info">
                  <div className="item-image-container">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00NSA0NUg3NVY3NUg0NVY0NVoiIGZpbGw9IiNEOEQ4RDgiLz4KPHBhdGggZD0iTTUwIDUwVjcwTTcwIDUwVjcwTTUwIDUwSDcwTTUwIDcwSDcwIiBzdHJva2U9IiNCOEI4QjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{item.name}</h3>
                    <div className="stock-status">
                      <div className={`status-indicator ${item.stock > 10 ? 'in-stock' : item.stock > 0 ? 'low-stock' : 'out-of-stock'}`}></div>
                      <span className="stock-text">
                        {item.stock > 10 
                          ? `${item.stock} available` 
                          : item.stock > 0 
                          ? `Only ${item.stock} left` 
                          : 'Out of stock'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="quantity-column">
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn decrease"
                      onClick={() => decrementQty(item.product_id)}
                      disabled={item.quantity <= 1}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button 
                      className="qty-btn increase"
                      onClick={() => incrementQty(item.product_id)}
                      disabled={item.quantity >= item.stock}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="price-column">
                  <div className="price-info">
                    <span className="current-price">₹{formatPrice(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="original-price">₹{formatPrice(item.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Subtotal */}
                <div className="subtotal-column">
                  <span className="subtotal-amount">₹{formatPrice(item.price * item.quantity)}</span>
                </div>

                {/* Delete Button */}
                <div className="actions-column">
                  <button 
                    className="delete-item-btn"
                    onClick={() => deleteItem(item.product_id)}
                    aria-label={`Delete ${item.name}`}
                    title="Delete item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{formatPrice(totalCost)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-row">
                <span>Tax (18%)</span>
                <span>₹{formatPrice(Math.round(totalCost * 0.18))}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span className="total-amount">₹{formatPrice(totalCost + Math.round(totalCost * 0.18))}</span>
              </div>
            </div>

            <div className="checkout-actions">
              <button className="checkout-btn-primary" onClick={proceedToCheckout}>
                <span>Order Now</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              
              <button className="clear-cart-btn-bottom" onClick={clearCart}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Clear All Items
              </button>
            </div>

            <div className="security-assurance">
              <div className="security-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;