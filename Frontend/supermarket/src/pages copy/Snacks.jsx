import React from "react";
import "./Snacks.css";
import { Link } from 'react-router-dom';
const Snacks = () => {
  // Generate 30 sample snack products
  const snacks = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    name: `Snack Product ${index + 1}`,
    mrp: (Math.random() * 100 + 50).toFixed(0),
    marketPrice: (Math.random() * 100 + 30).toFixed(0),
    image: `/images/snacks.jpg`, // placeholder image
  }));

  return (
    <div className="snacks-page">
      <Link to='/' style={{color:'gray'}}> {'<-'}Back to Home</Link>
      <h2>All Snacks</h2>
      <div className="snacks-grid">
        {snacks.map((snack) => (
          <div key={snack.id} className="snack-card">
            <img src={snack.image} alt={snack.name} />
            <h4>{snack.name}</h4>
            <p className="price">
              MRP: <span className="mrp">₹{snack.mrp}</span>{" "}
              <span className="market-price">₹{snack.marketPrice}</span>
            </p>
            <button className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Snacks;
