import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("black");
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/product/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found or failed to load");
        setLoading(false);
      });
  }, [id]);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!token) {
      alert("Please log in to add to cart.");
      return;
    }

    setAddingToCart(true);
    fetch("http://127.0.0.1:8000/api/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity,
        color: selectedColor,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add to cart");
        alert("Product added to cart!");
      })
      .catch(() => alert("Error adding to cart"))
      .finally(() => setAddingToCart(false));
  };

  const handleBuyNow = () => {
    if (!token) {
      alert("Please log in to continue.");
      return;
    }
    navigate(`/buy`, { state: { product, quantity, selectedColor } });
  };

  /** FINAL IMAGE ARRAY – ONLY BACKEND IMAGE */
  const productImages = [
    product?.image?.startsWith("http")
      ? product.image
      : `http://127.0.0.1:8000${product?.image}`,
  ];

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );

  return (
    <div className="product-detail-container">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Home</span> <span className="breadcrumb-divider">/</span>
        <span>{product.category?.name || "Products"}</span>
        <span className="breadcrumb-divider">/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="product-main-grid">

        {/* Product Gallery */}
        <div className="product-gallery-section">
          <div className="gallery-main">
            <img
              src={productImages[0]}
              alt={product.name}
              className="main-product-image"
            />

            {product.discount_percentage > 0 && (
              <div className="discount-badge">
                {product.discount_percentage}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">

          <h1 className="product-title">{product.name}</h1>

          {/* Meta */}
          <div className="product-meta">
            <span className="category-badge">{product.category?.name}</span>
            <div className="rating-badge">
              ⭐ {product.rating || 4.5}
              <span className="review-count">({product.review_count || 100})</span>
            </div>
          </div>

          {/* Price */}
          <div className="price-section">
            {product.discount_percentage > 0 ? (
              <div className="discount-price-group">
                <span className="current-price">
                  ₹{product.discounted_price || product.price}
                </span>
                <span className="original-price">₹{product.price}</span>
                <span className="discount-percent">
                  Save {product.discount_percentage}%
                </span>
              </div>
            ) : (
              <span className="current-price">₹{product.price}</span>
            )}
          </div>

          {/* Stock */}
          <div
            className={`stock-status ${
              product.stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {product.stock > 0
              ? `✅ In Stock (${product.stock} available)`
              : "❌ Out of Stock"}
          </div>

         

          {/* Quantity */}
          <div className="selection-section">
            <h3 className="section-title">Quantity</h3>
            <div className="quantity-selector">
              <button
                className="quantity-btn"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                −
              </button>

              <span className="quantity-display">{quantity}</span>

              <button
                className="quantity-btn"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="action-buttons">
            <button
              className={`btn btn-cart ${addingToCart ? "loading" : ""}`}
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
            >
              {addingToCart ? "Adding..." : "🛒 Add to Cart"}
            </button>

            <button
              className={`btn btn-buy ${buyingNow ? "loading" : ""}`}
              onClick={handleBuyNow}
              disabled={buyingNow || product.stock === 0}
            >
              {buyingNow ? "Processing..." : "⚡ Buy Now"}
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>Free Delivery</strong>
                <p>Order above ₹499</p>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">↩️</span>
              <div>
                <strong>Easy Returns</strong>
                <p>30 days return policy</p>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">🔒</span>
              <div>
                <strong>Secure Payment</strong>
                <p>100% safe checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-details-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${
              activeTab === "description" ? "active" : ""
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>

          <button
            className={`tab-btn ${
              activeTab === "specifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>

          <button
            className={`tab-btn ${
              activeTab === "reviews" ? "active" : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="description-content">
              <h3>About this product</h3>
              <p>{product.description || "No description available."}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="specifications-content">
              <h3>Product Specifications</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Brand</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Material</span>
                  <span className="spec-value">{product.material}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Color</span>
                  <span className="spec-value">{selectedColor}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-content">
              <h3>Customer Reviews</h3>
              <p>Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
