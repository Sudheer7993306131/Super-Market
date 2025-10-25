import React, { useEffect, useState } from "react";

function CategoryProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch all categories
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Fetch products when a category is selected
  const fetchProductsByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    fetch(`http://127.0.0.1:8000/api/products/category/${categoryId}/`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h1>Browse Products by Category</h1>

      {/* Category Buttons */}
      <div style={{ marginBottom: "30px" }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => fetchProductsByCategory(cat.id)}
            style={{
              margin: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                selectedCategory === cat.id ? "#007bff" : "#ccc",
              color: "white",
              cursor: "pointer",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Section */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        {products.length > 0 ? (
          products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                width: "250px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3>{p.name}</h3>
              <p>Price: ₹{p.price}</p>
              <p>Discount: {p.discount_percentage}%</p>
              <p>Stock: {p.stock}</p>
              <p style={{ fontSize: "14px", color: "#666" }}>
                {p.description}
              </p>
            </div>
          ))
        ) : (
          <p>Select a category to view products.</p>
        )}
      </div>
    </div>
  );
}

export default CategoryProductsPage;
