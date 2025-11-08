import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, getProductByCategoryAndName } from '../data/productsdata';
import './productdetails.css';

const ProductDetailsPage = () => {
  const { category, subcategory, productname } = useParams();
  const navigate = useNavigate();
  
  // State declarations - moved to the top
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 ProductDetailsPage mounted with params:', { category, subcategory, productname });
    
    // Check for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Find product using category-based lookup (more reliable)
    if (category && subcategory && productname) {
      console.log('🎯 Using category-based product lookup');
      const foundProduct = getProductByCategoryAndName(category, subcategory, productname);
      
      if (foundProduct) {
        console.log('🎉 Product found!', foundProduct);
        setProduct(foundProduct);
        
        // Check if product is in wishlist
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsInWishlist(wishlist.includes(foundProduct.id));
      } else {
        console.log('❌ Product not found with category lookup, trying slug lookup...');
        // Fallback to slug-based lookup
        const fallbackProduct = getProductBySlug(productname);
        if (fallbackProduct) {
          console.log('🎉 Product found with fallback!', fallbackProduct);
          setProduct(fallbackProduct);
          
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
          setIsInWishlist(wishlist.includes(fallbackProduct.id));
        }
      }
    }
    
    setLoading(false);
  }, [category, subcategory, productname]);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    const newWishlistStatus = !isInWishlist;
    setIsInWishlist(newWishlistStatus);
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (newWishlistStatus) {
      if (!wishlist.includes(product.id)) {
        wishlist.push(product.id);
      }
    } else {
      const index = wishlist.indexOf(product.id);
      if (index > -1) {
        wishlist.splice(index, 1);
      }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };

  const shareProduct = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const buyNow = () => {
    addToCart();
    navigate('/pages/cartpage');
  };

  // Mock customer reviews data
  const customerReviews = [
    {
      id: 1,
      name: "Rahul Sharma",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent product! Fast delivery and great quality. Will definitely buy again.",
      verified: true
    },
    {
      id: 2,
      name: "Priya Patel",
      rating: 4,
      date: "2024-01-10",
      comment: "Good quality product. Packaging was perfect and arrived on time.",
      verified: true
    },
    {
      id: 3,
      name: "Amit Kumar",
      rating: 5,
      date: "2024-01-08",
      comment: "Absolutely loved it! Better than expected. Great value for money.",
      verified: false
    }
  ];

  if (loading) {
    return (
      <div className={`loading-container ${isDarkTheme ? 'dark' : 'light'}`}>
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`loading-container ${isDarkTheme ? 'dark' : 'light'}`}>
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>We couldn't find the product "{productname}" in {category} &gt; {subcategory}.</p>
          <p><strong>URL:</strong> /products/{category}/{subcategory}/{productname}</p>
          <div className="suggestions">
            <p>Available products in this category:</p>
            <ul>
              <li>Lays Classic Salted (slug: lays-classic-salted)</li>
              <li>Kurkure Masala Munch (slug: kurkure-masala-munch)</li>
              <li>Parle G (slug: parle-g)</li>
            </ul>
          </div>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Go Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Create multiple image views from single image
  const productImages = [product.image, product.image, product.image];

  return (
    <div className={`product-details-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
      <header className="product-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1>Product Details</h1>
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="product-content">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={productImages[selectedImage]} 
              alt={product.name}
            />
            {/* Wishlist + Share Buttons on Top Right */}
            <div className="image-top-actions">
              <button 
                className={`wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
                onClick={toggleWishlist}
              >
                {isInWishlist ? '❤️' : '🤍'}
              </button>
              <button 
                className="share-btn"
                onClick={shareProduct}
              >
                📤
              </button>
            </div>
          </div>
          <div className="image-thumbnails">
            {productImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} view ${index + 1}`}
                className={selectedImage === index ? 'active' : ''}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header-info">
            <h1 className="product-name">{product.name}</h1>
          </div>

          <div className="product-category">
            <span className="category-badge">{product.category} &gt; {product.subcategory}</span>
          </div>

          <div className="product-rating">
            <span className="stars">
              {'★'.repeat(Math.floor(product.rating || 4))}
              {'☆'.repeat(5 - Math.floor(product.rating || 4))}
            </span>
            <span className="rating-text">
              {product.rating || 4.0} ({product.reviews || 25} reviews)
            </span>
          </div>

          <div className="product-pricing">
            <span className="current-price">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="original-price">₹{product.mrp}</span>
            )}
            {product.mrp > product.price && (
              <span className="discount">
                Save ₹{(product.mrp - product.price)}
              </span>
            )}
          </div>

          <div className="stock-status">
            <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.longDescription || product.description}</p>
          </div>

          {/* Quantity Selection */}
          <div className="quantity-selection">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* Horizontal Add to Cart & Buy Now Buttons */}
          <div className="action-buttons-horizontal">
            <button 
              className="add-to-cart-btn"
              onClick={addToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? `Add to Cart - ₹${(product.price * quantity)}` : 'Out of Stock'}
            </button>
            <button 
              className="buy-now-btn"
              onClick={buyNow}
              disabled={!product.inStock}
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Horizontal Specifications - FULL WIDTH */}
        {product.specifications && (
          <div className="specifications">
            <h3>Specifications</h3>
            <div className="specs-horizontal">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item-horizontal">
                  <span className="spec-key">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews - FULL WIDTH */}
        <div className="customer-reviews">
          <h3>Customer Reviews</h3>
          <div className="reviews-summary">
            <div className="overall-rating">
              <span className="rating-score">{product.rating || 4.0}</span>
              <span className="stars">
                {'★'.repeat(Math.floor(product.rating || 4))}
                {'☆'.repeat(5 - Math.floor(product.rating || 4))}
              </span>
              <span className="total-reviews">{product.reviews || 25} reviews</span>
            </div>
          </div>
          
          <div className="reviews-list">
            {customerReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.name}</span>
                    {review.verified && <span className="verified-badge">✅ Verified</span>}
                  </div>
                  <div className="review-meta">
                    <span className="review-stars">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="review-date">{review.date}</span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;