import React, { useEffect, useState } from "react";
import axios from "axios";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("You must be logged in to view your wishlist.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/wishlist/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load wishlist.");
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`http://localhost:8000/api/wishlist/remove/${productId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 30 }}>Loading wishlist...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: 30 }}>{error}</p>;
  if (wishlist.length === 0) return <p style={{ textAlign: "center", marginTop: 30 }}>No items in your wishlist.</p>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 20,
        marginTop: 30,
      }}
    >
      {wishlist.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            width: 250,
            padding: 15,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {item.product && item.product.product_image && (
            <img
              src={`http://localhost:8000${item.product.product_image}`}
              alt={item.product.name}
              style={{
                width: "100%",
                height: 150,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
          <h4 style={{ margin: "10px 0" }}>
            {item.product ? item.product.name : "Unnamed Product"}
          </h4>
          <p>Price: ₹{item.product?.price ?? "N/A"}</p>

          <button
            onClick={() => handleRemove(item.product.id)}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "5px 10px",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default WishlistPage;
