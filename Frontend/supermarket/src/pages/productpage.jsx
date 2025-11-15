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
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch(`https://super-market-back.onrender.com/api/product/${id}/`)
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

  const increaseQuantity = () => setQuantity((q) => Math.min(q + 1, product.stock));
  const decreaseQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!token) return alert("Please log in to add to cart.");
    setAddingToCart(true);
    fetch("https://super-market-back.onrender.com/api/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: product.id, quantity, color: selectedColor }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        alert("Product added to cart!");
      })
      .catch(() => alert("Error adding to cart"))
      .finally(() => setAddingToCart(false));
  };

  const handleBuyNow = () => {
    if (!token) return alert("Please log in to continue.");
    navigate(`/buy`, { state: { product, quantity, selectedColor } });
  };

  const productImages = [
    product?.image?.startsWith("http")
      ? product.image
      : `https://super-market-back.onrender.com${product?.image}`,
  ];

  if (loading) return <div className="loading-state">Loading product...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="product-detail-container">

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span>Home</span> <span>/</span>
        <span>{product.category?.name || "Products"}</span> <span>/</span>
        <span className="current">{product.name}</span>
      </nav>

      <div className="product-main-grid">

        {/* Left - Product Image */}
        <div className="product-gallery-section">
          <div className="main-image-wrapper">
            <img src={productImages[0]} alt={product.name} className="main-product-image" />
            {product.discount_percentage > 0 && (
              <span className="discount-badge">{product.discount_percentage}% OFF</span>
            )}
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <span className="category">{product.category?.name}</span>
            <span className="rating">⭐ {product.rating || 4.5} ({product.review_count || 0})</span>
          </div>

          <div className="price-section">
            {product.discount_percentage > 0 ? (
              <div className="discount-price-group">
                <span className="current-price">₹{product.discounted_price || product.price}</span>
                <span className="original-price">₹{product.price}</span>
                <span className="discount-percent">Save {product.discount_percentage}%</span>
              </div>
            ) : <span className="current-price">₹{product.price}</span>}
          </div>

          <div className={`stock-status ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
            {product.stock > 0 ? `✅ In Stock (${product.stock})` : "❌ Out of Stock"}
          </div>

          {/* Quantity Selector */}
          <div className="selection-section">
            <h3>Quantity</h3>
            <div className="quantity-selector">
              <button onClick={decreaseQuantity} disabled={quantity <= 1}>−</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0} className="btn btn-cart">
              {addingToCart ? "Adding..." : "🛒 Add to Cart"}
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn btn-buy">
              ⚡ Buy Now
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div><span>🚚</span> Free Delivery</div>
            <div><span>↩️</span> Easy Returns</div>
            <div><span>🔒</span> Secure Payment</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-details-tabs">
        <div className="tabs-header">
          {["description","specifications","reviews"].map(tab => (
            <button
              key={tab}
              className={activeTab===tab?"tab-btn active":"tab-btn"}
              onClick={()=>setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab==="description" && <p>{product.description || "No description available."}</p>}
          {activeTab==="specifications" && (
            <div className="specs-grid">
              <div><strong>Brand:</strong> {product.brand}</div>
              <div><strong>Material:</strong> {product.material}</div>
              <div><strong>Color:</strong> {selectedColor}</div>
            </div>
          )}
          {activeTab==="reviews" && <p>Be the first to review this product!</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
