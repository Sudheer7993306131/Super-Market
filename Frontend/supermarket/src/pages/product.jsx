import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductPage.css";

const ProductsPage = () => {
  const { subcategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [filterPrice, setFilterPrice] = useState("all");

  const token = localStorage.getItem("token"); // 🔐 Get Bearer token

  const decodeSubcategory = (slug) => {
    if (!slug) return "";
    const decoded = decodeURIComponent(slug);
    return decoded.replace(/-/g, " ");
  };

  // 🧩 Fetch products by subcategory
  useEffect(() => {
    if (!subcategoryName) return;

    const subcategoryForApi = decodeSubcategory(subcategoryName);
    setLoading(true);
    setError(null);

    fetch(
      `https://super-market-back.onrender.com/api/products/subcategory/${encodeURIComponent(subcategoryForApi)}/`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (Array.isArray(data.products)) setProducts(data.products);
        else {
          setProducts([]);
          setError("Invalid response format from server.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products. Please try again.");
        setLoading(false);
      });
  }, [subcategoryName]);

  // 💖 Fetch wishlist once when page loads (only if token exists)
  useEffect(() => {
    if (!token) {
      console.warn("No token found. Wishlist will not be fetched.");
      return;
    }

    fetch("https://super-market-back.onrender.com/api/wishlist/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
        }
      })
      .catch(() => console.warn("Failed to fetch wishlist"));
  }, [token]);

  // 🧠 Toggle wishlist (add/remove) with Bearer token
  const toggleWishlist = (productId) => {
    if (!token) {
      alert("Please log in to use wishlist.");
      return;
    }
  
    const isInWishlist = wishlist.includes(productId);
  
    // Remove
    if (isInWishlist) {
      fetch(`https://super-market-back.onrender.com/api/wishlist/remove/${productId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlist((prev) => prev.filter((id) => id !== productId));
        });
  
    } else {
      // Add
      fetch("https://super-market-back.onrender.com/api/wishlist/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      })
        .then((res) => res.json())
        .then((data) => {
          setWishlist((prev) => [...prev, productId]);
        });
    }
  };
  

  // ✅ Filtering and sorting
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    if (filterPrice !== "all") {
      filtered = filtered.filter((product) => {
        const price = product.price;
        switch (filterPrice) {
          case "under500":
            return price < 500;
          case "500-1000":
            return price >= 500 && price <= 1000;
          case "1000-2000":
            return price >= 1000 && price <= 2000;
          case "over2000":
            return price > 2000;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} available
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
                : `https://super-market-back.onrender.com${product.image}`;
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div className="product-card" key={product.id}>
                  <div className="card-image">
                    <img src={imageUrl} alt={product.name} className="product-img" />
                    
                  </div>

                  <div className="card-content">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description ||
                        "High-quality product with excellent features."}
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
