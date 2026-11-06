import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiShoppingCart,
  FiCreditCard,
  FiPlus,
  FiMinus,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
  FiArrowLeft
} from 'react-icons/fi';
import StarRating from '../../components/StarRating/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getProductById } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductById(id);
        if (isMounted) {
          if (res && res.product) {
            setProduct(res.product);
          } else {
            setError('Product details not found.');
          }
        }
      } catch (err) {
        console.error('Error fetching product by ID:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Could not find product details. It may have been removed.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProduct();
      setQuantity(1);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleQuantityChange = (delta) => {
    if (!product) return;
    const max = product.stock || 1;
    const newQty = Math.max(1, Math.min(max, quantity + delta));
    setQuantity(newQty);
  };

  const handleDirectQuantityInput = (e) => {
    if (!product) return;
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      const max = product.stock || 1;
      setQuantity(Math.max(1, Math.min(max, val)));
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      navigate('/checkout');
    } finally {
      setAdding(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container detail-loading-container">
          <LoadingSpinner message="Loading product information..." />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="detail-error-card">
            <FiAlertCircle className="error-icon" />
            <h2>Product Not Found</h2>
            <p>{error || "We couldn't retrieve the requested product."}</p>
            <Link to="/products" className="btn btn-primary">
              <FiArrowLeft /> Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight className="breadcrumb-separator" />
          <Link to="/products">Products</Link>
          {product.category && (
            <>
              <FiChevronRight className="breadcrumb-separator" />
              <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
                {product.category}
              </Link>
            </>
          )}
          <FiChevronRight className="breadcrumb-separator" />
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="detail-grid">
          {/* Left Column: Image Showcase */}
          <div className="detail-image-section">
            <div className="detail-image-wrapper">
              <img
                src={product.imageUrl || DEFAULT_IMAGE}
                alt={product.name}
                className="detail-main-image"
                onError={handleImageError}
              />
              {product.featured && (
                <span className="detail-featured-tag">Featured Pick</span>
              )}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="detail-info-section">
            {/* Category Badge & Stock Status */}
            <div className="detail-meta-top">
              {product.category && (
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="detail-category-badge"
                >
                  {product.category}
                </Link>
              )}

              {isOutOfStock ? (
                <span className="stock-badge stock-out">Out of Stock</span>
              ) : isLowStock ? (
                <span className="stock-badge stock-low">Only {product.stock} left in stock!</span>
              ) : (
                <span className="stock-badge stock-in">In Stock ({product.stock} available)</span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="detail-title">{product.name}</h1>

            {/* Ratings */}
            <div className="detail-rating-wrapper">
              <StarRating
                rating={product.rating || 0}
                numReviews={product.numReviews}
                showNumber={true}
                size="md"
              />
            </div>

            {/* Price Box */}
            <div className="detail-price-box">
              <span className="detail-currency">$</span>
              <span className="detail-price">{Number(product.price).toFixed(2)}</span>
              {product.price > 50 && (
                <span className="detail-free-shipping-tag">Eligible for FREE Shipping</span>
              )}
            </div>

            {/* Description */}
            <div className="detail-description-box">
              <h3 className="section-subheading">About This Item</h3>
              <p className="detail-description">{product.description}</p>
            </div>

            {/* Purchase Form: Quantity & Add to Cart */}
            <div className="detail-purchase-panel">
              <div className="quantity-control-wrapper">
                <label htmlFor="product-qty-input" className="quantity-label">
                  Quantity:
                </label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <input
                    id="product-qty-input"
                    type="number"
                    min="1"
                    max={product.stock || 1}
                    value={quantity}
                    onChange={handleDirectQuantityInput}
                    disabled={isOutOfStock}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="detail-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg detail-add-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                >
                  <FiShoppingCart />
                  <span>{isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-lg detail-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || adding}
                >
                  <FiCreditCard />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Trust & Guarantee Badges */}
            <div className="detail-trust-list">
              <div className="trust-item">
                <FiTruck className="trust-icon" />
                <div>
                  <h4>Fast & Reliable Delivery</h4>
                  <p>Ships within 24-48 business hours.</p>
                </div>
              </div>
              <div className="trust-item">
                <FiShield className="trust-icon" />
                <div>
                  <h4>Safe & Secure Transactions</h4>
                  <p>Encrypted multi-layer payment security.</p>
                </div>
              </div>
              <div className="trust-item">
                <FiRefreshCw className="trust-icon" />
                <div>
                  <h4>30-Day Free Returns</h4>
                  <p>Return within 30 days if unsatisfied.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
