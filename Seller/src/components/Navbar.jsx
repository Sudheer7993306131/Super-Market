import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ setloginstatus }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setloginstatus(false);
    navigate("/");
  };

  // Get current path for active link styling
  const currentPath = window.location.pathname;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="logo" onClick={() => navigate("/seller/dashboard")}>
          🛍️ Seller Dashboard
        </div>
        <div className="nav-links">
          <Link
            to="/seller/dashboard"
            className={`nav-link ${currentPath === "/seller/auth" ? "active" : ""}`}
          >
            Dashboard
          </Link>

          <Link
            to="/seller/add-product"
            className={`nav-link ${currentPath === "/seller/add-product" ? "active" : ""}`}
          >
            Add Product
          </Link>

          <Link
            to="/seller/products"
            className={`nav-link ${currentPath === "/seller/products" ? "active" : ""}`}
          >
            My Products
          </Link>

          <Link
            to="/seller/orders"
            className={`nav-link ${currentPath === "/seller/orders" ? "active" : ""}`}
          >
            Orders
          </Link>

          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
