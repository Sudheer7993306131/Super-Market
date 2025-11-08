import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h2 className="footer-title">SuperMart</h2>
          <p className="footer-tagline">
            Your one-stop shop for daily essentials. Fresh produce, groceries, and
            more — delivered to your doorstep.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="contact-title">Contact Us</h4>
          <p>Email: support@supermart.com</p>
          <p>Phone: +91 98765 43210</p>
        </div>

        <div className="footer-section social">
          <span className="follow-text">Follow Us</span>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
          </div>
        </div>

      </div>
      <p className="footer-bottom">© 2025 SuperMart. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
