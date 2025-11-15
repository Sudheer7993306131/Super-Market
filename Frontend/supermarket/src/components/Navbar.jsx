import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../assets/Logo.jpeg";
import {
  faShoppingCart,
  faBell,
  faUser,
  faSearch,
  faXmark,
  faBox,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
  faTruck,
  faEnvelopeOpenText,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleProfile = () => {
    setShowNotifications(false);
    setShowProfile(!showProfile);
  };

  const toggleNotifications = () => {
    setShowProfile(false);
    setShowNotifications(!showNotifications);
  };

  const closeAll = () => {
    setShowProfile(false);
    setShowNotifications(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Navigate to home if search is cleared
    if (value.trim() === "") {
      navigate("/");
    }
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      {/* =================== Navbar =================== */}
      <nav className="supermarket-navbar">
        {/* Left Section - Logo */}
        <div className="navbar-left" onClick={() => navigate("/")}>
          <img src={logo} alt="SuperMarket Logo" className="navbar-logo" />
          <h2 className="navbar-title">Friendy Mart</h2>
        </div>

        {/* Center - Search */}
        <div className="navbar-center">
          <form className="search-container" onSubmit={handleSearchSubmit}>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </form>
        </div>

        {/* Right Section - Icons */}
        <div className="navbar-right">
          <FontAwesomeIcon
            icon={faShoppingCart}
            className="nav-icon"
            title="Cart"
            onClick={() => navigate("/cart")}
          />
         
          <FontAwesomeIcon
            icon={faUser}
            className="nav-icon profile-icon"
            title="Profile"
            onClick={toggleProfile}
          />
        </div>
      </nav>

      {/* =================== Profile Offcanvas =================== */}
      <div className={`offcanvas-panel ${showProfile ? "active" : ""}`}>
        <div className="offcanvas-header">
          <h3>Welcome to Friendly Mart</h3>
          <FontAwesomeIcon icon={faXmark} className="close-icon" onClick={closeAll} />
        </div>

        <div className="offcanvas-content">
          <p className="welcome-text">Access your account and manage your profile easily.</p>

          <button className="offcanvas-action" onClick={() => navigate("/login")}>
            <FontAwesomeIcon icon={faRightToBracket} className="action-icon" />
            Login
          </button>

          <button className="offcanvas-action" onClick={() => navigate("/register")}>
            <FontAwesomeIcon icon={faUserPlus} className="action-icon" />
            Sign Up
          </button>

          <div className="divider"></div>

          <button className="offcanvas-action" onClick={() => navigate("/orders")}>
            <FontAwesomeIcon icon={faBox} className="action-icon" />
            My Orders
          </button>

          <button className="offcanvas-action logout" onClick={() => navigate("/login")}>
            <FontAwesomeIcon icon={faRightFromBracket} className="action-icon" />
            Logout
          </button>
        </div>
      </div>

      

      

      {/* =================== Backdrop =================== */}
      {(showProfile || showNotifications) && (
        <div className="offcanvas-backdrop" onClick={closeAll}></div>
      )}
    </>
  );
};

export default Navbar;
