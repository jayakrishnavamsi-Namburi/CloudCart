import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiTruck,
  FiAlertCircle
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_FEE = 5.99;

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    cartCount,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_IMAGE;
  };

  const getProductId = (item) => {
    return item.product?._id || item.product?.id || item._id;
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      clearCart();
    }
  };

  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const orderTotal = cartTotal + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingPercentage = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

  if (!loading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty-card">
            <div className="empty-cart-icon-circle">
              <FiShoppingCart />
            </div>
            <h1 className="empty-cart-title">Your Cart is Empty</h1>
            <p className="empty-cart-subtitle">
              Looks like you haven't added anything to your cart yet. Explore our products and find great deals today!
            </p>
            <Link to="/products" className="btn btn-primary btn-lg empty-shop-btn">
              <FiArrowLeft /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Page Heading */}
        <div className="cart-header">
          <div className="cart-title-row">
            <h1 className="cart-title">Shopping Cart</h1>
            <span className="cart-count-badge">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <Link to="/products" className="cart-continue-link">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="shipping-progress-banner">
          <div className="progress-text-row">
            <FiTruck className="shipping-truck-icon" />
            {amountToFreeShipping > 0 ? (
              <span>
                Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more to get{' '}
                <strong>FREE Shipping</strong>!
              </span>
            ) : (
              <span className="free-shipping-unlocked">
                🎉 Congratulations! You have unlocked <strong>FREE Shipping</strong>!
              </span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${freeShippingPercentage}%` }}
            />
          </div>
        </div>

        {/* Cart Main Content Grid */}
        <div className="cart-grid">
          {/* Left Column: Items List */}
          <div className="cart-items-section">
            <div className="cart-table-card">
              <div className="cart-table-header">
                <span className="col-product">Product</span>
                <span className="col-price">Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-total">Subtotal</span>
                <span className="col-action"></span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  const productId = getProductId(item);
                  const price = product.price ?? item.price ?? 0;
                  const itemSubtotal = price * item.quantity;
                  const stock = product.stock ?? 99;

                  return (
                    <div key={item._id || productId} className="cart-item-row">
                      {/* Product Thumbnail & Name */}
                      <div className="cart-item-product">
                        <Link to={`/products/${product._id || productId}`} className="cart-item-image-link">
                          <img
                            src={product.imageUrl || item.imageUrl || DEFAULT_IMAGE}
                            alt={product.name || 'Product'}
                            className="cart-item-image"
                            onError={handleImageError}
                          />
                        </Link>
                        <div className="cart-item-details">
                          <Link to={`/products/${product._id || productId}`} className="cart-item-name">
                            {product.name || item.name || 'Product'}
                          </Link>
                          {product.category && (
                            <span className="cart-item-category">{product.category}</span>
                          )}
                          {stock <= 5 && stock > 0 && (
                            <span className="cart-item-stock-warning">
                              Only {stock} left in stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="cart-item-price">
                        <span className="mobile-col-label">Price:</span>
                        ${Number(price).toFixed(2)}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="cart-item-quantity">
                        <span className="mobile-col-label">Quantity:</span>
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>
                          <span className="cart-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            disabled={item.quantity >= stock || loading}
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                      {/* Line Subtotal */}
                      <div className="cart-item-subtotal">
                        <span className="mobile-col-label">Total:</span>
                        ${itemSubtotal.toFixed(2)}
                      </div>

                      {/* Remove Button */}
                      <div className="cart-item-actions">
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(productId)}
                          title="Remove item"
                          aria-label="Remove item from cart"
                          disabled={loading}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Table Footer */}
              <div className="cart-table-footer">
                <Link to="/products" className="btn btn-outline btn-sm">
                  <FiArrowLeft /> Continue Shopping
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  <FiTrash2 /> Clear Entire Cart
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="summary-label">Items Subtotal</span>
                  <span className="summary-value">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Estimated Shipping</span>
                  <span className="summary-value">
                    {shippingCost === 0 ? (
                      <strong className="shipping-free-label">FREE</strong>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row summary-total-row">
                  <span className="summary-total-label">Estimated Total</span>
                  <span className="summary-total-value">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight />
              </button>

              <div className="summary-guarantee-note">
                <FiShield className="guarantee-icon" />
                <span>Safe & Secure 256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
