import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WishlistPage.css";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("You must be logged in to view your wishlist.");
          setLoading(false);
          return;
        }

        const response = await axios.get("https://super-market-back.onrender.com/api/wishlist/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load wishlist.");
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem("access_token");
    setRemovingId(productId);
    
    try {
      await axios.delete(`https://super-market-back.onrender.com/api/wishlist/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please log in to add items to cart.");
      return;
    }

    try {
      await axios.post("https://super-market-back.onrender.com/api/cart/add/", {
        product_id: product.id,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item added to cart successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add item to cart.");
    }
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="header-content">
            <h1 className="page-title">My Wishlist</h1>
            <p className="page-subtitle">Your saved favorites</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="header-content">
            <h1 className="page-title">My Wishlist</h1>
            <p className="page-subtitle">Your saved favorites</p>
          </div>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Access Required</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="header-content">
            <h1 className="page-title">My Wishlist</h1>
            <p className="page-subtitle">Your saved favorites</p>
          </div>
          <div className="wishlist-stats">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Items</span>
            </div>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">💝</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Start saving your favorite items for later!</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="header-content">
          <h1 className="page-title">My Wishlist</h1>
          <p className="page-subtitle">Your saved favorites ({wishlist.length} items)</p>
        </div>
        <div className="wishlist-stats">
          <div className="stat-item">
            <span className="stat-number">{wishlist.length}</span>
            <span className="stat-label">Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              ₹{wishlist.reduce((total, item) => total + (item.product?.price || 0), 0)}
            </span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div key={item.id} className="wishlist-card">
            <div className="card-badge">Saved</div>
            
            <div className="product-image">
              {item.product && item.product.product_image ? (
                <img
                  src={`https://super-market-back.onrender.com${item.product.product_image}`}
                  alt={item.product.name}
                  className="product-img"
                />
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-icon">🛍️</span>
                </div>
              )}
              <div className="image-overlay">
                <button 
                  className="btn-quick-view"
                  onClick={() => window.location.href = `/product/${item.product.id}`}
                >
                  Quick View
                </button>
              </div>
            </div>

            <div className="product-info">
              <h3 className="product-name">
                {item.product ? item.product.name : "Unnamed Product"}
              </h3>
              
              <div className="product-category">
                {item.product?.category?.name || "General"}
              </div>

              <div className="product-price">
                <span className="current-price">₹{item.product?.price ?? "N/A"}</span>
                {item.product?.discount_percentage > 0 && (
                  <span className="discount-badge">
                    {item.product.discount_percentage}% OFF
                  </span>
                )}
              </div>

              <div className="product-rating">
                <div className="stars">
                  {"⭐".repeat(5)}
                  <span className="rating-text">({item.product?.review_count || 0})</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn btn-add-cart"
                onClick={() => handleAddToCart(item.product)}
                disabled={removingId === item.product.id}
              >
                <span className="btn-icon">🛒</span>
                Add to Cart
              </button>
              
              <button
                className="btn-remove"
                onClick={() => handleRemove(item.product.id)}
                disabled={removingId === item.product.id}
              >
                {removingId === item.product.id ? (
                  <div className="remove-spinner"></div>
                ) : (
                  <span className="remove-icon">🗑️</span>
                )}
                Remove
              </button>
            </div>

            <div className="card-footer">
              <span className="added-date">
                Added on {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <div className="actions-content">
          <div className="actions-info">
            <span>{wishlist.length} items in wishlist</span>
            <span className="total-price">
              Total: ₹{wishlist.reduce((total, item) => total + (item.product?.price || 0), 0)}
            </span>
          </div>
          <button className="btn btn-primary">
            Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;