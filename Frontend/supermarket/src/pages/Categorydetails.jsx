import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function CategoryDetailPage() {
  const { categoryId } = useParams();
  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    fetch(`https://super-market-back.onrender.com/api/products/category/${categoryId}/grouped/`)
      .then((res) => res.json())
      .then((data) => setCategoryData(data))
      .catch((err) => console.error("Error:", err));
  }, [categoryId]);

  if (!categoryData) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div style={{ padding: "40px", backgroundColor: "#f7f7f7" }}>
      <h1 style={{ textAlign: "center" }}>
        {categoryData.category.name} Products
      </h1>

      {categoryData.subcategories.map((sub) => (
        <div key={sub.id} style={{ marginTop: "40px" }}>
          <h2
            style={{
              color: "#007bff",
              borderBottom: "2px solid #ddd",
              paddingBottom: "5px",
            }}
          >
            {sub.name}
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              marginTop: "15px",
            }}
          >
            {sub.products.length > 0 ? (
              sub.products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "15px",
                    width: "250px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <h4>{p.name}</h4>
                  <p>Price: ₹{p.price}</p>
                  <p>Discount: {p.discount_percentage}%</p>
                  <p>
                    <strong>Discounted: ₹{p.discounted_price.toFixed(2)}</strong>
                  </p>
                </div>
              ))
            ) : (
              <p>No products available in this subcategory.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryDetailPage;
