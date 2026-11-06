import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiGrid,
  FiChevronDown,
  FiLogIn,
  FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchExpanded(false);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Left Side: Brand Logo + Primary Nav Links */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo-icon">
              <FiShoppingCart />
            </span>
            <span className="navbar-brand-text">
              Cloud<span className="brand-accent">Cart</span>
            </span>
          </Link>

          <nav className="navbar-nav-links">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
            >
              All Products
            </Link>
            <Link
              to="/products?category=Electronics"
              className="nav-link"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=Clothing"
              className="nav-link"
            >
              Fashion
            </Link>
          </nav>
        </div>

        {/* Right Side: Search Bar + Cart + Auth / User Menu */}
        <div className="navbar-right">
          {/* Search Bar on the Right Side */}
          <form
            className={`navbar-search-right ${searchExpanded ? 'expanded' : ''}`}
            onSubmit={handleSearchSubmit}
          >
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => {
                  if (!searchQuery) setSearchExpanded(false);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
            <button type="submit" className="search-submit-btn" aria-label="Search">
              Search
            </button>
          </form>

          {/* Cart Icon */}
          <Link to="/cart" className="navbar-cart-btn" aria-label="Shopping Cart">
            <div className="cart-icon-wrapper">
              <FiShoppingCart className="nav-action-icon" />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </div>
            <span className="cart-label">Cart</span>
          </Link>

          {/* Authentication & User Dropdown */}
          {isAuthenticated ? (
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className="user-menu-btn"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
              >
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                <FiChevronDown className={`chevron-icon ${userDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-email">{user?.email}</p>
                    {isAdmin && <span className="admin-chip">Administrator</span>}
                  </div>
                  <div className="dropdown-divider"></div>

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FiUser /> Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FiPackage /> My Orders
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link
                        to="/admin"
                        className="dropdown-item admin-link"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FiGrid /> Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="dropdown-divider"></div>

                  <button
                    type="button"
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="nav-auth-btn nav-login-btn">
                <FiLogIn className="auth-btn-icon" />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="nav-auth-btn nav-register-btn">
                <FiUserPlus className="auth-btn-icon" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          <nav className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link">
              Home
            </Link>
            <Link to="/products" className="mobile-nav-link">
              All Products
            </Link>
            <Link to="/products?category=Electronics" className="mobile-nav-link">
              Electronics
            </Link>
            <Link to="/products?category=Clothing" className="mobile-nav-link">
              Fashion & Clothing
            </Link>
            <Link to="/cart" className="mobile-nav-link">
              Shopping Cart ({cartCount})
            </Link>

            {isAuthenticated ? (
              <>
                <div className="mobile-divider"></div>
                <div className="mobile-user-greeting">
                  Signed in as <strong>{user?.name}</strong>
                </div>
                <Link to="/profile" className="mobile-nav-link">
                  <FiUser /> Profile
                </Link>
                <Link to="/orders" className="mobile-nav-link">
                  <FiPackage /> My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="mobile-nav-link admin-highlight">
                    <FiGrid /> Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  className="mobile-nav-link mobile-logout-btn"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn btn-outline btn-block">
                  <FiLogIn /> Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-block">
                  <FiUserPlus /> Create Free Account
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;