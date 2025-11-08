import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductPage.css";

const ProductsPage = () => {
  const { subcategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [filterPrice, setFilterPrice] = useState("all");

  const decodeSubcategory = (slug) => {
    if (!slug) return "";
    const decoded = decodeURIComponent(slug);
    return decoded.replace(/-/g, " ");
  };

  useEffect(() => {
    if (!subcategoryName) return;

    const subcategoryForApi = decodeSubcategory(subcategoryName);

    setLoading(true);
    setError(null);

    fetch(
      `http://127.0.0.1:8000/api/products/subcategory/${encodeURIComponent(subcategoryForApi)}/`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
          setError("Invalid response format from server.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load products. Please try again.");
        setLoading(false);
      });
  }, [subcategoryName]);

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Apply price filter
    if (filterPrice !== "all") {
      filtered = filtered.filter(product => {
        const price = product.price;
        switch (filterPrice) {
          case "under500": return price < 500;
          case "500-1000": return price >= 500 && price <= 1000;
          case "1000-2000": return price >= 1000 && price <= 2000;
          case "over2000": return price > 2000;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const prettyTitle = subcategoryName
    ? decodeSubcategory(subcategoryName).replace(/\b\w/g, (c) => c.toUpperCase())
    : "Products";

  return (
    <div className="products-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{prettyTitle}</h1>
          <p className="product-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="controls-left">
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Price:</label>
            <select 
              value={filterPrice} 
              onChange={(e) => setFilterPrice(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under500">Under ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="1000-2000">₹1000 - ₹2000</option>
              <option value="over2000">Over ₹2000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>We couldn't find any products matching your criteria.</p>
            <button 
              className="clear-filters"
              onClick={() => setFilterPrice("all")}
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const imageUrl = product.image?.startsWith("http")
                ? product.image
                : `http://127.0.0.1:8000${product.image}`;

              return (
                <div className="product-card" key={product.id}>
                  <div className="card-image">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="product-img"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="image-overlay">
                      <Link to={`/products/${product.id}`} className="view-details">
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description || "High-quality product with excellent features."}
                    </p>
                    <div className="price-section">
                      <span className="price">₹{product.price}</span>
                    </div>
                    <div className="card-actions">
                      <Link to={`/products/${product.id}`} className="details-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;