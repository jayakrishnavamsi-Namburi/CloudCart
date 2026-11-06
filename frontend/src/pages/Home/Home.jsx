import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTruck,
  FiShield,
  FiHeadphones,
  FiRefreshCw,
  FiArrowRight,
  FiTv,
  FiShoppingBag,
  FiBookOpen,
  FiHome,
  FiActivity,
  FiHeart,
  FiGift,
  FiPackage,
  FiStar,
  FiCheckCircle
} from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getFeaturedProducts } from '../../services/api';
import './Home.css';

const CATEGORIES = [
  { name: 'Electronics', icon: FiTv, description: 'Gadgets, audio & computers', color: '#3b82f6' },
  { name: 'Clothing', icon: FiShoppingBag, description: 'Trendy styles & everyday wear', color: '#ec4899' },
  { name: 'Books', icon: FiBookOpen, description: 'Bestsellers, novels & guides', color: '#8b5cf6' },
  { name: 'Home & Kitchen', icon: FiHome, description: 'Appliances, decor & cookware', color: '#10b981' },
  { name: 'Sports', icon: FiActivity, description: 'Fitness gear & outdoor equipment', color: '#f59e0b' },
  { name: 'Beauty', icon: FiHeart, description: 'Skincare, makeup & fragrances', color: '#ef4444' },
  { name: 'Toys', icon: FiGift, description: 'Games, puzzles & fun for kids', color: '#06b6d4' },
  { name: 'Grocery', icon: FiPackage, description: 'Pantry essentials & fresh picks', color: '#84cc16' }
];

const FEATURES = [
  {
    icon: FiTruck,
    title: 'Free Shipping',
    description: 'On all orders over $50 with reliable tracked express delivery.'
  },
  {
    icon: FiShield,
    title: 'Secure Payment',
    description: 'Encrypted multi-tier payment gateways protecting your transactions.'
  },
  {
    icon: FiHeadphones,
    title: '24/7 Support',
    description: 'Dedicated customer assistance team standing by at any hour.'
  },
  {
    icon: FiRefreshCw,
    title: 'Easy Returns',
    description: 'Hassle-free 30-day money-back guarantee on all qualified purchases.'
  }
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getFeaturedProducts();
        if (isMounted) {
          if (res && Array.isArray(res.products)) {
            setFeaturedProducts(res.products);
          } else {
            setFeaturedProducts([]);
          }
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
        if (isMounted) {
          setError('Unable to load featured products at the moment.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="hero-badge">
              <FiStar className="hero-badge-icon" />
              <span>Next-Gen Online Shopping</span>
            </div>
            <h1 className="home-hero-headline">
              Discover Amazing Deals at <span>CloudCart</span>
            </h1>
            <p className="home-hero-subtitle">
              Shop from thousands of curated products across premier categories with lightning-fast delivery, competitive prices, and frictionless checkout.
            </p>
            <div className="home-hero-actions">
              <Link to="/products" className="btn btn-hero-primary">
                Shop Now <FiArrowRight />
              </Link>
              <a href="#categories" className="btn btn-hero-secondary">
                Explore Categories
              </a>
            </div>

            <div className="home-hero-highlights">
              <div className="hero-highlight-item">
                <FiCheckCircle className="highlight-icon" />
                <span>Verified Authentic</span>
              </div>
              <div className="hero-highlight-item">
                <FiCheckCircle className="highlight-icon" />
                <span>Free Returns</span>
              </div>
              <div className="hero-highlight-item">
                <FiCheckCircle className="highlight-icon" />
                <span>Express Delivery</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-visual-card hero-visual-card-primary">
              <div className="hero-card-tag">Special Offer</div>
              <h3>Save up to 40%</h3>
              <p>On select electronics & top home essentials this week.</p>
              <Link to="/products?category=Electronics" className="hero-visual-link">
                View Deals &rarr;
              </Link>
            </div>
            <div className="hero-stat-badge stat-badge-1">
              <span className="stat-number">50k+</span>
              <span className="stat-text">Active Shoppers</span>
            </div>
            <div className="hero-stat-badge stat-badge-2">
              <span className="stat-number">4.9/5</span>
              <span className="stat-text">Customer Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="home-features-section">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon-wrapper">
                    <IconComponent className="feature-icon" />
                  </div>
                  <div className="feature-text">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="home-categories-section">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-tag">Popular Departments</span>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-description">
                Browse our extensive catalog curated for quality and value.
              </p>
            </div>
            <Link to="/products" className="view-all-link">
              All Categories <FiArrowRight />
            </Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={idx}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="category-card"
                  style={{ '--cat-color': cat.color }}
                >
                  <div className="category-icon-bubble">
                    <IconComponent />
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-description">{cat.description}</p>
                  <span className="category-action">
                    Explore items <FiArrowRight className="action-arrow" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="home-featured-section">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-tag">Handpicked for You</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-description">
                Explore our best-rated recommendations and high-demand trending items.
              </p>
            </div>
            <Link to="/products" className="view-all-link">
              Browse All Products <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="featured-loading">
              <LoadingSpinner message="Loading featured products..." />
            </div>
          ) : error ? (
            <div className="featured-error">
              <p>{error}</p>
              <Link to="/products" className="btn btn-outline-primary">
                Explore Catalog
              </Link>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="featured-empty">
              <p>No featured products found right now. Check back soon!</p>
              <Link to="/products" className="btn btn-primary">
                View All Products
              </Link>
            </div>
          ) : (
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="home-promo-section">
        <div className="container">
          <div className="promo-card">
            <div className="promo-content">
              <span className="promo-badge">Limited Time Promo</span>
              <h2 className="promo-title">Ready to Elevate Your Shopping Experience?</h2>
              <p className="promo-description">
                Create a free CloudCart account today and get free express delivery on your first order.
              </p>
              <div className="promo-actions">
                <Link to="/register" className="btn btn-promo-primary">
                  Sign Up Now
                </Link>
                <Link to="/products" className="btn btn-promo-secondary">
                  Browse Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
