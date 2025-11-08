import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const carouselSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    title: "Fresh Groceries Delivered",
    subtitle: "Get farm-fresh vegetables and fruits delivered to your doorstep",
    buttonText: "Shop Now",
    buttonColor: "#22c55e"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop",
    title: "Daily Essentials",
    subtitle: "Everything you need for your daily routine, just a click away",
    buttonText: "Explore Essentials",
    buttonColor: "#3b82f6"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=1200&h=600&fit=crop",
    title: "Special Discounts",
    subtitle: "Enjoy up to 50% off on your favorite brands and products",
    buttonText: "View Offers",
    buttonColor: "#ef4444"
  }
];

const categories = [
  { 
    name: "Fruits & Vegetables", 
    icon: "🍎", 
    items: "300+ items", 
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop",
    description: "Fresh from local farms"
  },
  { 
    name: "Dairy & Eggs", 
    icon: "🥛", 
    items: "120+ items", 
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop",
    description: "Pure and natural"
  },
  { 
    name: "Bakery", 
    icon: "🍞", 
    items: "80+ items", 
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
    description: "Freshly baked daily"
  },
  { 
    name: "Beverages", 
    icon: "🥤", 
    items: "200+ items", 
    image: "https://images.unsplash.com/photo-1544145945-f90425340c5e?w=300&h=200&fit=crop",
    description: "Refresh your day"
  },
];

const stats = [
  { number: "10K+", label: "Happy Customers", icon: "😊" },
  { number: "5K+", label: "Quality Products", icon: "📦" },
  { number: "50+", label: "Trusted Brands", icon: "🏷️" },
  { number: "2H", label: "Fast Delivery", icon: "⚡" },
];

const features = [
  {
    icon: "🛡️",
    title: "Quality Guaranteed",
    description: "Every product is carefully selected and quality checked to ensure you get the best"
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Get your orders delivered within 2 hours across the city. Free delivery on first order!"
  },
  {
    icon: "💳",
    title: "Secure Payment",
    description: "Multiple payment options with 100% secure transactions and easy returns"
  },
  {
    icon: "🌱",
    title: "Fresh & Organic",
    description: "Direct from farms to your doorstep. We prioritize freshness in every delivery"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.name.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <div className="home-container">
      {/* Hero Carousel Section */}
      <section className="hero-carousel">
        <div 
          className="carousel-container"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselSlides.map((slide) => (
              <div key={slide.id} className="carousel-slide">
                <div className="slide-image">
                  <img src={slide.image} alt={slide.title} />
                  <div className="slide-overlay"></div>
                </div>
                <div className="slide-content">
                  <div className="slide-text">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <button 
                      className="slide-button"
                      style={{ backgroundColor: slide.buttonColor }}
                      onClick={() => navigate("/products")}
                    >
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <button className="carousel-btn prev-btn" onClick={prevSlide}>
            ‹
          </button>
          <button className="carousel-btn next-btn" onClick={nextSlide}>
            ›
          </button>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.number}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Supermarket Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <div className="section-header">
                <h2>Welcome to Friendly Mart</h2>
                <p>Your Trusted Neighborhood Supermarket</p>
              </div>
              <div className="about-description">
                <p>
                  At Friendly Mart, we believe that grocery shopping should be convenient, 
                  affordable, and enjoyable. Founded with a vision to revolutionize the way 
                  you shop for daily essentials, we bring the supermarket experience right 
                  to your fingertips.
                </p>
                <p>
                  Our commitment to quality, freshness, and customer satisfaction sets us apart. 
                  From farm-fresh produce to household essentials, every product is carefully 
                  curated to meet the highest standards of quality and freshness.
                </p>
              </div>
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-check">✓</span>
                  <span>100% Quality Checked Products</span>
                </div>
                <div className="feature-item">
                  <span className="feature-check">✓</span>
                  <span>Same Day Delivery Available</span>
                </div>
                <div className="feature-item">
                  <span className="feature-check">✓</span>
                  <span>Competitive Prices & Daily Offers</span>
                </div>
                <div className="feature-item">
                  <span className="feature-check">✓</span>
                  <span>Eco-friendly Packaging</span>
                </div>
              </div>
              <button 
                className="learn-more-btn"
                onClick={() => navigate("/about")}
              >
                Learn More About Us
              </button>
            </div>
            <div className="about-visual">
              <img 
                src="https://images.unsplash.com/photo-1566842600175-97dca3c6f87f?w=500&h=600&fit=crop" 
                alt="Friendly Mart Store" 
              />
              <div className="experience-badge">
                <div className="years">5+</div>
                <div className="text">Years of Trust</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our wide range of fresh products and essentials</p>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                  <div className="category-overlay"></div>
                  <div className="category-icon">{category.icon}</div>
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <p className="category-items">{category.items}</p>
                  <button className="explore-btn">
                    Explore Category <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Shop With Us?</h2>
            <p>Experience the difference with Friendly Mart</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <span>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get your groceries in 3 simple steps</p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">📱</div>
              <h3>Browse & Select</h3>
              <p>Explore our wide range of products and add them to your cart</p>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">💳</div>
              <h3>Secure Checkout</h3>
              <p>Choose your payment method and complete your order securely</p>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Receive your fresh groceries at your doorstep within hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Convenient Shopping?</h2>
            <p>Join thousands of happy customers who trust Friendly Mart for their daily needs</p>
            <div className="cta-buttons">
              <button 
                className="cta-btn primary"
                onClick={() => navigate("/products")}
              >
                Start Shopping Now
              </button>
              <button 
                className="cta-btn secondary"
                onClick={() => navigate("/download")}
              >
                Download Our App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h2>Stay Updated</h2>
              <p>Subscribe to get exclusive offers, fresh deals, and shopping tips</p>
            </div>
            <div className="newsletter-form">
              <div className="input-group">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <button className="subscribe-btn">
                  <span className="btn-text">Subscribe</span>
                </button>
              </div>
              <p className="newsletter-note">No spam ever. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;