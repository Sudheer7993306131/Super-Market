import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState('black');
  const [actionMessage, setActionMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/product/${id}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const productImages = product?.image ? [
    product.image, 
    product.image, 
    product.image, 
    product.image
  ] : [];

  const imageUrl = (img) => (img?.startsWith('http') ? img : `http://127.0.0.1:8000${img}`);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setActionMessage("Please log in to add products to cart");
      setTimeout(() => setActionMessage(""), 3000);
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const payload = {
        product_id: product.id,
        quantity: quantity,
        color: selectedColor,
      };

      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionMessage("Product added to cart successfully");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (err) {
      console.error("Add to cart error:", err);
      setActionMessage("Failed to add product to cart. Please try again.");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setActionMessage("Please log in to place an order");
      setTimeout(() => setActionMessage(""), 3000);
      navigate("/login");
      return;
    }

    setBuyingNow(true);
    try {
      const payload = {
        product_id: product.id,
        quantity: quantity,
        color: selectedColor,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/order/place/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/order/confirmation", { state: { order: response.data } });
    } catch (err) {
      console.error("Order placement error:", err);
      setActionMessage("Failed to place order. Please try again.");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        <p>Loading product details...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-state">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Product</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="not-found-state">
        <div className="not-found-content">
          <div className="not-found-icon">🔍</div>
          <h3>Product Not Found</h3>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="back-to-products">
            Browse Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products" className="breadcrumb-link">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* Action Message */}
      {actionMessage && (
        <div className={`action-message ${actionMessage.includes('successfully') ? 'success' : 'error'}`}>
          <span className="message-icon">
            {actionMessage.includes('successfully') ? '✓' : '⚠'}
          </span>
          {actionMessage}
        </div>
      )}

      {/* Main Product Section */}
      <div className="product-main-grid">
        {/* Image Gallery */}
        <div className="product-gallery-section">
          <div className="main-image-container">
            <img
              src={imageUrl(productImages[selectedImage])}
              alt={product.name}
              className="main-product-image"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8f9fa'/%3E%3Cpath d='M300 200l150 200-150 100-150-100z' fill='%23e9ecef'/%3E%3Ctext x='300' y='500' text-anchor='middle' font-family='Arial' font-size='16' fill='%236c757d'%3EProduct Image%3C/text%3E%3C/svg%3E";
              }}
            />
            {product.discount_percentage > 0 && (
              <div className="discount-ribbon">
                Save {product.discount_percentage}%
              </div>
            )}
          </div>
          
          <div className="thumbnail-strip">
            {productImages.map((img, index) => (
              <button
                key={index}
                className={`thumbnail-item ${selectedImage === index ? 'thumbnail-active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={imageUrl(img)}
                  alt={`${product.name} view ${index + 1}`}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Cpath d='M50 30l20 30-20 30-20-30z' fill='%23e9ecef'/%3E%3C/svg%3E";
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Information */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <div className="rating-display">
                <div className="star-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-value">4.8</span>
                </div>
                <span className="review-count">2,428 reviews</span>
              </div>
              <div className="sku">SKU: {product.id}</div>
            </div>
          </div>

          <div className="pricing-section">
            <div className="price-container">
              <span className="current-price">
                ₹{product.discount_percentage > 0 ? product.discounted_price : product.price}
              </span>
              {product.discount_percentage > 0 && (
                <div className="price-comparison">
                  <span className="original-price">₹{product.price}</span>
                  <span className="savings">You save ₹{(product.price - product.discounted_price).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="availability-section">
            <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              <span className="stock-indicator"></span>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
            {product.stock > 0 && (
              <span className="stock-message">Only {product.stock} units left</span>
            )}
          </div>

          <div className="product-highlights">
            <h3 className="section-heading">Key Features</h3>
            <div className="highlights-grid">
              <div className="highlight-item">
                <div className="highlight-icon">🔇</div>
                <span>Active Noise Cancellation</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">⚡</div>
                <span>10min Charge = 3hrs Playback</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">🔋</div>
                <span>50 Hours Battery Life</span>
              </div>
              <div className="highlight-item">
                <div className="highlight-icon">💧</div>
                <span>IPX5 Water Resistance</span>
              </div>
            </div>
          </div>

          <div className="color-selection-section">
            <label className="option-label">Select Color</label>
            <div className="color-options-grid">
              {[
                { id: 'black', name: 'Phantom Black', color: '#1a1a1a' },
                { id: 'white', name: 'Arctic White', color: '#ffffff' },
                { id: 'blue', name: 'Midnight Blue', color: '#2563eb' }
              ].map((color) => (
                <button
                  key={color.id}
                  className={`color-option-card ${selectedColor === color.id ? 'color-selected' : ''}`}
                  onClick={() => setSelectedColor(color.id)}
                >
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: color.color }}
                  ></div>
                  <span className="color-name">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-section">
            <label className="option-label">Quantity</label>
            <div className="quantity-selector">
              <button 
                className="quantity-btn"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <span>−</span>
              </button>
              <span className="quantity-value">{quantity}</span>
              <button className="quantity-btn" onClick={increaseQuantity}>
                <span>+</span>
              </button>
            </div>
          </div>

          <div className="action-section">
            <button 
              className={`action-btn primary-btn ${addingToCart ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              {addingToCart ? (
                <div className="btn-spinner"></div>
              ) : (
                <span className="btn-icon">🛒</span>
              )}
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className={`action-btn secondary-btn ${buyingNow ? 'loading' : ''}`}
              onClick={handleBuyNow}
              disabled={product.stock === 0 || buyingNow}
            >
              {buyingNow ? (
                <div className="btn-spinner"></div>
              ) : (
                <span className="btn-icon">⚡</span>
              )}
              {buyingNow ? 'Processing...' : 'Buy Now'}
            </button>
          </div>

          <div className="service-features">
            <div className="service-item">
              <div className="service-icon">🚚</div>
              <div className="service-details">
                <strong>Free Shipping</strong>
                <p>Delivery in 2-4 business days</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">↩️</div>
              <div className="service-details">
                <strong>Easy Returns</strong>
                <p>30-day hassle-free returns</p>
              </div>
            </div>
            <div className="service-item">
              <div className="service-icon">🛡️</div>
              <div className="service-details">
                <strong>1 Year Warranty</strong>
                <p>Manufacturer warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-details-section">
        <div className="tabs-navigation">
          <button 
            className={`tab-nav-btn ${activeTab === 'description' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-nav-btn ${activeTab === 'specifications' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-nav-btn ${activeTab === 'reviews' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews & Ratings
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-panel">
              <h2>Product Overview</h2>
              <p className="product-description">
                {product.description || "Experience unparalleled audio quality with our premium wireless earbuds. Designed for the modern user who demands both style and substance, this product combines cutting-edge technology with elegant design."}
              </p>
              <div className="feature-details">
                <h3>What's Included</h3>
                <ul className="included-items">
                  <li>Wireless Earbuds (Pair)</li>
                  <li>Charging Case</li>
                  <li>USB-C Charging Cable</li>
                  <li>Multiple Ear Tip Sizes</li>
                  <li>User Manual & Documentation</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-panel">
              <h2>Technical Specifications</h2>
              <div className="specifications-table">
                <div className="spec-row">
                  <span className="spec-label">Product Name</span>
                  <span className="spec-value">{product.name}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Battery Life</span>
                  <span className="spec-value">Up to 50 hours (with charging case)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Charging Time</span>
                  <span className="spec-value">2 hours (full charge)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Connectivity</span>
                  <span className="spec-value">Bluetooth 5.3</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Water Resistance</span>
                  <span className="spec-value">IPX5 (Sweat & Water Resistant)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Warranty</span>
                  <span className="spec-value">1 Year Limited Warranty</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <h2>Customer Reviews</h2>
              <div className="reviews-overview">
                <div className="rating-summary">
                  <div className="overall-rating">
                    <div className="rating-score">4.8</div>
                    <div className="rating-stars-large">★★★★★</div>
                    <div className="total-reviews">2,428 reviews</div>
                  </div>
                  <div className="rating-distribution">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="rating-bar-item">
                        <span className="star-count">{stars} star</span>
                        <div className="rating-bar">
                          <div 
                            className="rating-fill"
                            style={{ width: `${[80, 15, 3, 1, 1][5 - stars]}%` }}
                          ></div>
                        </div>
                        <span className="rating-percentage">
                          {[1942, 364, 73, 24, 25][5 - stars]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;