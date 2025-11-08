import React from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const featuredProducts = [
  { 
    name: "Snickers Chocolate", 
    price: 140, 
    originalPrice: 180,
    image: "/images/snickers.png",
    category: "Snacks",
    rating: 4.5,
    reviews: 128
  },
  { 
    name: "Dairy Milk Silk", 
    price: 120, 
    originalPrice: 150,
    image: "/images/dairy-milk.png",
    category: "Chocolates",
    rating: 4.8,
    reviews: 256
  },
  { 
    name: "Organic Apples", 
    price: 250, 
    image: "/images/apples.png",
    category: "Fruits",
    rating: 4.7,
    reviews: 89,
    organic: true
  },
  { 
    name: "Premium Cotton Bedsheet", 
    price: 1200, 
    originalPrice: 1599,
    image: "/images/bedsheet.png",
    category: "Home",
    rating: 4.3,
    reviews: 342
  },
];

const categories = [
  { name: "Groceries", icon: "fa-seedling", items: "500+ items", color: "#22c55e" },
  { name: "Dairy & Eggs", icon: "fa-egg", items: "120+ items", color: "#16a34a" },
  { name: "Fruits & Veggies", icon: "fa-apple-whole", items: "300+ items", color: "#15803d" },
  { name: "Beverages", icon: "fa-wine-bottle", items: "200+ items", color: "#22c55e" },
  { name: "Snacks", icon: "fa-cookie", items: "450+ items", color: "#16a34a" },
  { name: "Home Care", icon: "fa-spray-can", items: "180+ items", color: "#15803d" },
];

const stats = [
  { number: "10K+", label: "Happy Customers", icon: "fa-users" },
  { number: "5K+", label: "Products", icon: "fa-cubes" },
  { number: "50+", label: "Brands", icon: "fa-tags" },
  { number: "2H", label: "Delivery Time", icon: "fa-clock" },
];

const Home = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i 
        key={i} 
        className={`fas fa-star ${i < Math.floor(rating) ? 'filled' : ''} ${i === Math.floor(rating) && rating % 1 !== 0 ? 'half-filled' : ''}`}
      ></i>
    ));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-bolt"></i>
              <span>Fastest Delivery in Town</span>
            </div>
            <h1>Fresh Groceries <span className="highlight">Delivered</span> to Your Doorstep</h1>
            <p>Discover the finest selection of fresh produce, household essentials, and more with same-day delivery</p>
            <div className="hero-actions">
              <button onClick={() => navigate("/products/packaged-foods/snacks")} className="shop-now-btn primary">
                <i className="fas fa-basket-shopping"></i>
                Start Shopping
              </button>
              <button className="shop-now-btn secondary">
                <i className="fas fa-play"></i>
                How It Works
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <i className={`fas ${stat.icon}`}></i>
                  <div>
                    <h3>{stat.number}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <img src="/images/hero-1.png" alt="Fresh Fruits" />
              <span>Fresh Fruits</span>
            </div>
            <div className="floating-card card-2">
              <img src="/images/hero-2.png" alt="Vegetables" />
              <span>Vegetables</span>
            </div>
            <div className="floating-card card-3">
              <img src="/images/hero-3.png" alt="Dairy" />
              <span>Dairy Products</span>
            </div>
          </div>
        </div>
      </section>

      

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Featured Products</h2>
              <p>Curated picks for your shopping delight</p>
            </div>
            <button 
              className="view-all-btn"
              onClick={() => navigate("/products/packaged-foods/snacks")}
            >
              View All Products
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.name} 
                className="product-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-badge category">{product.category}</div>
                  {product.organic && <div className="product-badge organic">Organic</div>}
                  {product.originalPrice && (
                    <div className="discount-badge">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </div>
                  )}
                  <button className="wishlist-btn">
                    <i className="far fa-heart"></i>
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-rating">
                    <div className="stars">
                      {renderStars(product.rating)}
                    </div>
                    <span>({product.reviews})</span>
                  </div>
                  <div className="product-price">
                    <span className="current-price">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <button className="add-to-cart-btn">
                    <i className="fas fa-plus"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Quality Guarantee</h3>
              <p>100% quality checked products with money-back guarantee</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-truck-fast"></i>
              </div>
              <h3>Fast Delivery</h3>
              <p>Same-day delivery for orders placed before 2 PM</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h3>Fresh & Organic</h3>
              <p>Direct from farms to your doorstep within hours</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for all your queries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Banner */}
      <section className="offers-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-text">
              <h2>Weekend Special Offer!</h2>
              <p>Get flat 30% off on all fresh fruits and vegetables</p>
              <button className="cta-button">
                Shop Now <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="banner-visual">
              <div className="offer-timer">
                <div className="timer-item">
                  <span>02</span>
                  <small>Days</small>
                </div>
                <div className="timer-item">
                  <span>12</span>
                  <small>Hours</small>
                </div>
                <div className="timer-item">
                  <span>45</span>
                  <small>Mins</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Fresh, Stay Updated</h2>
            <p>Subscribe to get exclusive offers, fresh deals, and health tips</p>
            <div className="newsletter-form">
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
              </div>
              <button className="subscribe-btn">
                <i className="fas fa-paper-plane"></i>
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;