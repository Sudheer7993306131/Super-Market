import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const carouselSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop",
    title: "Fresh Groceries Delivered",
    subtitle: "Get farm-fresh vegetables and fruits delivered to your doorstep",
    buttonText: "Shop Now"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop",
    title: "Daily Essentials",
    subtitle: "Everything you need for your daily routine, just a click away",
    buttonText: "Explore Essentials"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=1200&h=600&fit=crop",
    title: "Special Discounts",
    subtitle: "Enjoy up to 50% off on your favorite brands and products",
    buttonText: "View Offers"
  }
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

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York",
    rating: 5,
    comment: "The quality of fruits and vegetables is exceptional! Delivery is always on time.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Mike Chen",
    location: "San Francisco",
    rating: 5,
    comment: "Love the convenience and the fresh products. My go-to grocery app!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: 3,
    name: "Emily Davis",
    location: "Chicago",
    rating: 5,
    comment: "The customer service is outstanding and products are always fresh.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
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

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
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

      

      {/* About Supermarket Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <div className="section-header">
                <h2>Welcome to FreshMart</h2>
                <p>Your Trusted Neighborhood Supermarket</p>
              </div>
              <div className="about-description">
                <p>
                  At FreshMart, we believe that grocery shopping should be convenient, 
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
                src="data:image/jpeg;base64,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" 
                alt="FreshMart Store" 
              />
              <div className="experience-badge">
                <div className="years">5+</div>
                <div className="text">Years of Trust</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Shop With Us?</h2>
            <p>Experience the difference with FreshMart</p>
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
            <p>Join thousands of happy customers who trust FreshMart for their daily needs</p>
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

     
    </div>
  );
};

export default Home;