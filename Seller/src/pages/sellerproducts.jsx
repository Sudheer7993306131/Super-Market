import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './SellerProducts.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/seller/products/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Fetch products error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/seller/products/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error("Delete product error:", err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const deletePromises = Array.from(selectedProducts).map(productId =>
        axios.delete(`http://127.0.0.1:8000/api/seller/products/${productId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(deletePromises);
      setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      setShowDeleteConfirm(false);
    } catch (err) {
      setError("Failed to delete some products. Please try again.");
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://127.0.0.1:8000/api/seller/products/${productId}/`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, stock: newStock } : p)
      );
    } catch (err) {
      setError("Failed to update stock. Please try again.");
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category_name === categoryFilter;
      const matchesStatus = !statusFilter || 
                           (statusFilter === "in_stock" && product.stock > 0) ||
                           (statusFilter === "out_of_stock" && product.stock === 0) ||
                           (statusFilter === "low_stock" && product.stock > 0 && product.stock <= 10);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "price_high": return b.price - a.price;
        case "price_low": return a.price - b.price;
        case "stock_high": return b.stock - a.stock;
        case "stock_low": return a.stock - b.stock;
        case "recent": return new Date(b.created_at) - new Date(a.created_at);
        default: return 0;
      }
    });

  const categories = [...new Set(products.map(p => p.category_name))];

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: "out_of_stock", label: "Out of Stock", color: "danger" };
    if (stock <= 10) return { status: "low_stock", label: "Low Stock", color: "warning" };
    return { status: "in_stock", label: "In Stock", color: "success" };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (image) => {
    if (!image) return null;
  
    // If backend already sends full URL
    if (image.startsWith("http")) return image;
  
    // If backend sends path without leading slash
    if (!image.startsWith("/")) image = "/" + image;
  
    return `http://127.0.0.1:8000${image}`;
  };
  

  if (isLoading) {
    return (
      <div className="seller-products-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-products-container">
      {/* Header */}
      <div className="products-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Product Inventory</h1>
            <p>Manage your product catalog and inventory levels</p>
          </div>
          <div className="header-actions">
            <Link to="/seller/add-product" className="btn btn-primary">
              <svg className="btn-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-trend positive">+12%</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{products.filter(p => p.stock > 0).length}</div>
          <div className="stat-label">Active</div>
          <div className="stat-trend positive">+8%</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{products.filter(p => p.stock === 0).length}</div>
          <div className="stat-label">Out of Stock</div>
          <div className="stat-trend negative">+3%</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {formatPrice(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
          </div>
          <div className="stat-label">Inventory Value</div>
          <div className="stat-trend positive">+15%</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-section">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="recent">Recently Added</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
            <option value="stock_high">Stock: High to Low</option>
            <option value="stock_low">Stock: Low to High</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-selection-info">
            <span>{selectedProducts.size} products selected</span>
          </div>
          <div className="bulk-actions">
            <select 
              value={bulkAction} 
              onChange={(e) => {
                if (e.target.value === 'delete') {
                  setShowDeleteConfirm(true);
                }
                setBulkAction('');
              }}
              className="bulk-action-select"
            >
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button 
              onClick={toggleSelectAll}
              className="btn btn-secondary"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
          <button onClick={() => setError("")} className="alert-close">×</button>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-content">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <svg viewBox="0 0 200 200" width="120" height="120">
                <path fill="#e2e8f0" d="M100 20a80 80 0 100 160 80 80 0 000-160zm0 20a60 60 0 110 120 60 60 0 010-120z"/>
                <path fill="#94a3b8" d="M100 40a50 50 0 100 100 50 50 0 000-100zm0 20a30 30 0 110 60 30 30 0 010-60z"/>
                <circle cx="100" cy="100" r="10" fill="#64748b"/>
              </svg>
            </div>
            <h3>No products found</h3>
            <p>
              {products.length === 0 
                ? "Get started by adding your first product to the catalog."
                : "No products match your current search criteria."
              }
            </p>
            {products.length === 0 && (
              <Link to="/seller/add-product" className="btn btn-primary">
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const imageUrl = getImageUrl(product.image);
              
              return (
                <div key={product.id} className="product-card">
                  <div className="product-card-header">
                    <label className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="product-checkbox"
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="product-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => {/* Edit functionality */}}
                        title="Edit Product"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="product-image">
                    {imageUrl ? (
                    
                      <img 
                        src={imageUrl} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`image-fallback ${imageUrl ? 'hidden' : ''}`}>
                      <svg viewBox="0 0 24 24" width="32" height="32">
                        <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                    <div className={`stock-indicator ${stockStatus.status}`}>
                      {stockStatus.label}
                    </div>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description || "No description provided."}
                    </p>
                    
                    <div className="product-meta">
                      <div className="meta-item">
                        <span className="meta-label">Category</span>
                        <span className="meta-value">{product.category_name}</span>
                      </div>
                      {product.subcategory_name && (
                        <div className="meta-item">
                          <span className="meta-label">Subcategory</span>
                          <span className="meta-value">{product.subcategory_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="product-footer">
                      <div className="price-section">
                        <div className="current-price">{formatPrice(product.price)}</div>
                        {product.discount_percentage > 0 && (
                          <div className="discount-info">
                            <span className="original-price">
                              {formatPrice(product.original_price)}
                            </span>
                            <span className="discount-tag">
                              {product.discount_percentage}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="stock-section">
                        <div className="stock-control">
                          <button
                            className="stock-btn decrement"
                            onClick={() => handleStockUpdate(product.id, Math.max(0, product.stock - 1))}
                            disabled={product.stock === 0}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
                            </svg>
                          </button>
                          <div className="stock-display">
                            <span className="stock-value">{product.stock}</span>
                            <span className="stock-unit">units</span>
                          </div>
                          <button
                            className="stock-btn increment"
                            onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete {selectedProducts.size} selected products? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkDelete}
                className="btn btn-danger"
              >
                Delete Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;