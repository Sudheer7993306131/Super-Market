import React, { useState, useEffect } from "react";
import axios from "axios";
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
    price: "",
    stock: "",
    discount_percentage: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/categories/");
        setCategories(res.data);
      } catch (err) {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch subcategories when a category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.category_id) {
        try {
          const res = await axios.get(
            `http://127.0.0.1:8000/api/subcategories/${formData.category_id}/`
          );
          setSubcategories(res.data);
        } catch (err) {
          setError("Failed to load subcategories");
        }
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [formData.category_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError("Please upload only JPG, PNG, or WebP images");
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Images must be smaller than 5MB each");
      return;
    }

    // Limit to 5 images
    if (images.length + files.length > 5) {
      setError("You can upload maximum 5 images");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append product data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach((image, index) => {
        submitData.append(`images`, image.file);
      });

      await axios.post("http://127.0.0.1:8000/api/seller/add-product/", submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setSuccess("✅ Product added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        category_id: "",
        subcategory_id: "",
        price: "",
        stock: "",
        discount_percentage: "",
        description: "",
      });
      setImages([]);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);

    } catch (err) {
      console.error("Add product error:", err);
      setError(err.response?.data?.message || "❌ Failed to add product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount_percentage) || 0;
    if (price > 0 && discount > 0) {
      return (price - (price * discount / 100)).toFixed(2);
    }
    return null;
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        {/* Header */}
        <div className="form-header">
          <div className="header-content">
            <h1>Add New Product</h1>
            <p>Fill in the details to list your product in the marketplace</p>
          </div>
          <div className="header-illustration">
            <span className="illustration-icon">📦</span>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message show">
            <div className="success-content">
              <div className="success-icon">✓</div>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Product Information */}
            <div className="form-section">
              <h3>Product Information</h3>
              
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <select
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    className="form-select"
                    disabled={!formData.category_id}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Describe your product features, specifications, and benefits..."
                  rows="4"
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="form-section">
              <h3>Pricing & Inventory</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Discount Percentage</label>
                <div className="discount-input-container">
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <span className="input-suffix">%</span>
                </div>
                {formData.discount_percentage && (
                  <div className="discount-preview">
                    <span className="discount-text">
                      Discounted Price: <strong>${calculateDiscountedPrice()}</strong>
                    </span>
                    <span className="discount-save">
                      Save {formData.discount_percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-section">
              <h3>Product Images</h3>
              <p className="section-subtitle">Upload up to 5 images (JPG, PNG, WebP, max 5MB each)</p>
              
              <div className="image-upload-container">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
                <label htmlFor="image-upload" className="image-upload-label">
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Click to upload images</span>
                    <span className="upload-hint">or drag and drop</span>
                  </div>
                </label>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="image-previews">
                    {images.map((image) => (
                      <div key={image.id} className="image-preview">
                        <img src={image.preview} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  name: "",
                  category_id: "",
                  subcategory_id: "",
                  price: "",
                  stock: "",
                  discount_percentage: "",
                  description: "",
                });
                setImages([]);
                setError("");
              }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;