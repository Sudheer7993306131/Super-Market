import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SubCategoryPage() {
  const { subcategoryName } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/products/subcategory/${subcategoryName}/`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Error:", err));
  }, [subcategoryName]);

  if (!data) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div style={{ padding: "30px", backgroundColor: "#fafafa" }}>
      <h1 style={{ textAlign: "center", color: "#007bff" }}>
        {data.subcategory} Products
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {data.products.length > 0 ? (
            data.products.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: "#fff",
                  padding: "15px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  width: "250px",
                }}
              >
                <h3>{p.name}</h3>
                <p>Price: ₹{p.price}</p>
                <p>Discount: {p.discount_percentage}%</p>
                <p>
                  <strong>₹{(p.discounted_price || p.price).toFixed(2)}</strong>
                </p>
              </div>
            ))
          ) : (
            <p>No products available in this subcategory.</p>
          )}

      </div>
    </div>
  );
}

export default SubCategoryPage;
