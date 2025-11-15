import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./ProductsPageall.css";

const ProductsPageall = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const search = params.get("search") || "";

      const res = await axios.get("https://super-market-back.onrender.com/api/products/", {
        params: search ? { search } : {},
      });

      let filtered = res.data;
      if (search) {
        filtered = res.data.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      setProducts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (!product.image) return "/default-product-image.jpg";
    return product.image.startsWith("http")
      ? product.image
      : `http://127.0.0.1:8000${product.image}`;
  };

  if (loading)
    return (
      <div className="products-page-loading">
        <p>Loading products...</p>
      </div>
    );

  if (!products.length)
    return (
      <div className="products-page-empty">
        <p>No products found</p>
      </div>
    );

  return (
    <div className="products-page">
      <h1 className="products-title">Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img
                src={getProductImage(product)}
                alt={product.name}
                onError={(e) => {
                  e.target.src = "/default-product-image.jpg";
                }}
              />
              {product.stock === 0 && (
                <span className="badge out-of-stock">Out of Stock</span>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="badge low-stock">Only {product.stock} left!</span>
              )}
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}
              <div className="price-section">
                <span className="product-price">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="original-price">₹{product.original_price}</span>
                )}
              </div>
              <button
                className="add-to-cart-btn"
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPageall;
