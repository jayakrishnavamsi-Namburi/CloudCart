import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingCart,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <span className="footer-logo-icon">
                <FiShoppingCart />
              </span>
              <span className="footer-brand-name">
                Cloud<span>Cart</span>
              </span>
            </Link>
            <p className="footer-description">
              Your one-stop destination for quality products across electronics, fashion,
              home goods, and everyday essentials. Fast shipping, secure payments, and 24/7 care.
            </p>
            <div className="footer-social-links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                FB
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                TW
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                IG
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                IN
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=Electronics">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=Clothing">Clothing</Link>
              </li>
              <li>
                <Link to="/products?category=Home%20%26%20Kitchen">Home & Kitchen</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li>
                <Link to="/orders">Order Tracking</Link>
              </li>
              <li>
                <Link to="/cart">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/profile">My Account</Link>
              </li>
              <li>
                <a href="#help">Help & FAQs</a>
              </li>
              <li>
                <a href="#returns">Returns & Refunds</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <FiMapPin className="contact-icon" />
                <span>123 Cloud Way, Tech Valley, CA 94016</span>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <span>+1 (800) 555-CART</span>
              </li>
              <li>
                <FiMail className="contact-icon" />
                <span>support@cloudcart.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} CloudCart, Inc. All rights reserved.
          </p>
          <p className="footer-credit">
            Built with <FiHeart className="heart-icon" /> for a seamless shopping experience
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
