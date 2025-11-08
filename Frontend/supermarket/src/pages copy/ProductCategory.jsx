import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ import useNavigate
import "./ProductCategory.css";
import productsData from "../data/productsdata.js";

const ProductSubcategoryPage = () => {
  const { category, subcategory } = useParams();
  const navigate = useNavigate(); // ✅ initialize navigate
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products dynamically from the constant based on URL
  useEffect(() => {
    const formatText = (text) =>
      decodeURIComponent(text)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const cat = formatText(category);
    const sub = formatText(subcategory);

    const foundProducts = productsData[cat]?.[sub] || [];
    setProducts(foundProducts);
    setLoading(false);
  }, [category, subcategory]);

  // Navigate to product details page
  const handleProductClick = (prodName) => {
    const path = `/products/${category}/${subcategory}/${prodName
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    navigate(path);
  };

  if (loading) {
    return <p className="loading">Loading products...</p>;
  }

  if (products.length === 0) {
    return (
      <div className="subcategory-page">
        <h2>
          {subcategory.replace(/-/g, " ")} -{" "}
          <span className="category">{category.replace(/-/g, " ")}</span>
        </h2>
        <p className="no-products">No products found for this subcategory.</p>
      </div>
    );
  }

  return (
    <div className="subcategory-page">
      <h2>
        {subcategory.replace(/-/g, " ")} -{" "}
        <span className="category">{category.replace(/-/g, " ")}</span>
      </h2>

      <div className="product-grid">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="product-card"
            onClick={() => handleProductClick(prod.name)} // ✅ add onClick
            style={{ cursor: "pointer" }} // optional: cursor pointer
          >
            <img src={prod.image} alt={prod.name} />
            <h4>{prod.name}</h4>
            <p className="price">
              MRP: <span className="mrp">₹{prod.mrp}</span>{" "}
              <span className="market-price">₹{prod.price}</span>
            </p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSubcategoryPage;
