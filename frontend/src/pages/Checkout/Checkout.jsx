import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  FiTruck,
  FiCreditCard,
  FiCheckCircle,
  FiShield,
  FiArrowLeft,
  FiAlertCircle,
  FiLock,
  FiShoppingBag
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_FEE = 5.99;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in to complete your checkout');
      navigate('/login', { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  // Form State
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '123'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update prefill if user profile loads
  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        fullName: prev.fullName || user.name || '',
        street: prev.street || user.address?.street || '',
        city: prev.city || user.address?.city || '',
        state: prev.state || user.address?.state || '',
        zipCode: prev.zipCode || user.address?.zipCode || '',
        country: prev.country || user.address?.country || 'United States'
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!shippingForm.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!shippingForm.street.trim()) errs.street = 'Street Address is required';
    if (!shippingForm.city.trim()) errs.city = 'City is required';
    if (!shippingForm.state.trim()) errs.state = 'State / Province is required';
    if (!shippingForm.zipCode.trim()) errs.zipCode = 'ZIP / Postal code is required';
    if (!shippingForm.country.trim()) errs.country = 'Country is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required shipping fields');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        shippingAddress: {
          street: shippingForm.street.trim(),
          city: shippingForm.city.trim(),
          state: shippingForm.state.trim(),
          zipCode: shippingForm.zipCode.trim(),
          country: shippingForm.country.trim()
        },
        paymentStatus: paymentMethod === 'card' ? 'completed' : 'pending'
      };

      const res = await createOrder(orderPayload);

      if (res && res.success && res.order) {
        toast.success('Order placed successfully! Thank you for shopping with us.');
        await clearCart();
        navigate(`/orders/${res.order._id}`);
      } else {
        throw new Error(res?.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const orderTotal = cartTotal + shippingCost;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty-card">
            <FiShoppingBag className="empty-checkout-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before proceeding to checkout.</p>
            <Link to="/products" className="btn btn-primary">
              <FiArrowLeft /> Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Page Header */}
        <div className="checkout-header">
          <Link to="/cart" className="checkout-back-link">
            <FiArrowLeft /> Back to Shopping Cart
          </Link>
          <h1 className="checkout-title">Secure Checkout</h1>
        </div>

        {/* Two-Column Checkout Layout */}
        <form onSubmit={handlePlaceOrder} className="checkout-grid" noValidate>
          {/* Left Column: Shipping & Payment Information */}
          <div className="checkout-main-column">
            {/* 1. Shipping Address Section */}
            <div className="checkout-card">
              <div className="card-section-header">
                <div className="step-number">1</div>
                <div>
                  <h2 className="card-section-title">Shipping Address</h2>
                  <p className="card-section-subtitle">
                    Enter the address where you want your order delivered.
                  </p>
                </div>
              </div>

              <div className="shipping-form-grid">
                {/* Full Name */}
                <div className="form-group span-2">
                  <label htmlFor="fullName" className="form-label">
                    Recipient Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="e.g. John Doe"
                    value={shippingForm.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                </div>

                {/* Street Address */}
                <div className="form-group span-2">
                  <label htmlFor="street" className="form-label">
                    Street Address <span className="required-star">*</span>
                  </label>
                  <input
                    id="street"
                    type="text"
                    name="street"
                    placeholder="123 Main Street, Apt 4B"
                    value={shippingForm.street}
                    onChange={handleInputChange}
                    className={`form-input ${errors.street ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.street && <span className="form-error">{errors.street}</span>}
                </div>

                {/* City */}
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="New York"
                    value={shippingForm.city}
                    onChange={handleInputChange}
                    className={`form-input ${errors.city ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>

                {/* State */}
                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State / Province <span className="required-star">*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    placeholder="NY"
                    value={shippingForm.state}
                    onChange={handleInputChange}
                    className={`form-input ${errors.state ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>

                {/* Zip Code */}
                <div className="form-group">
                  <label htmlFor="zipCode" className="form-label">
                    ZIP / Postal Code <span className="required-star">*</span>
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    placeholder="10001"
                    value={shippingForm.zipCode}
                    onChange={handleInputChange}
                    className={`form-input ${errors.zipCode ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
                </div>

                {/* Country */}
                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Country <span className="required-star">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    name="country"
                    placeholder="United States"
                    value={shippingForm.country}
                    onChange={handleInputChange}
                    className={`form-input ${errors.country ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.country && <span className="form-error">{errors.country}</span>}
                </div>
              </div>
            </div>

            {/* 2. Payment Method Section */}
            <div className="checkout-card">
              <div className="card-section-header">
                <div className="step-number">2</div>
                <div>
                  <h2 className="card-section-title">Payment Method</h2>
                  <p className="card-section-subtitle">
                    Select your preferred payment option.
                  </p>
                </div>
              </div>

              <div className="payment-options-list">
                {/* Cash On Delivery Radio */}
                <label className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option-info">
                    <div className="payment-option-title-row">
                      <FiTruck className="payment-type-icon" />
                      <span className="payment-title">Cash on Delivery (COD)</span>
                      <span className="badge badge-primary">Default</span>
                    </div>
                    <p className="payment-desc">
                      Pay with cash when your shipment arrives at your doorstep. No prepayment required.
                    </p>
                  </div>
                </label>

                {/* Credit Card Demo Radio */}
                <label className={`payment-option-card ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className="payment-option-info">
                    <div className="payment-option-title-row">
                      <FiCreditCard className="payment-type-icon" />
                      <span className="payment-title">Credit / Debit Card (Demo)</span>
                    </div>
                    <p className="payment-desc">
                      Instant simulated payment verification for demo purposes.
                    </p>
                  </div>
                </label>
              </div>

              {/* Demo Credit Card Input Fields */}
              {paymentMethod === 'card' && (
                <div className="card-details-box">
                  <div className="card-notice">
                    <FiShield />
                    <span>Demo mode active. Any 16-digit card number will be accepted.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <div className="card-input-wrapper">
                      <FiCreditCard className="card-inner-icon" />
                      <input
                        type="text"
                        className="form-input"
                        value={cardInfo.cardNumber}
                        onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                  </div>

                  <div className="card-inline-row">
                    <div className="form-group">
                      <label className="form-label">Expires</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardInfo.cardExpiry}
                        onChange={(e) => setCardInfo({ ...cardInfo, cardExpiry: e.target.value })}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardInfo.cardCvc}
                        onChange={(e) => setCardInfo({ ...cardInfo, cardCvc: e.target.value })}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <h2 className="summary-title">Order Summary ({cartItems.length} items)</h2>

              {/* Items List */}
              <div className="summary-items-list">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  const price = product.price ?? item.price ?? 0;

                  return (
                    <div key={item._id || product._id} className="summary-item-row">
                      <img
                        src={product.imageUrl || item.imageUrl || DEFAULT_IMAGE}
                        alt={product.name || 'Product'}
                        className="summary-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="summary-item-info">
                        <span className="summary-item-name">{product.name || item.name}</span>
                        <span className="summary-item-meta">
                          Qty: {item.quantity} × ${Number(price).toFixed(2)}
                        </span>
                      </div>
                      <span className="summary-item-price">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakup */}
              <div className="summary-pricing-list">
                <div className="pricing-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="pricing-row">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <strong className="shipping-free">FREE</strong>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="pricing-row total-row">
                  <span>Total to Pay</span>
                  <span className="total-amount">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg place-order-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner spinner-sm" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <FiLock />
                    <span>Place Order (${orderTotal.toFixed(2)})</span>
                  </>
                )}
              </button>

              <div className="checkout-guarantees">
                <div className="guarantee-line">
                  <FiShield className="g-icon" />
                  <span>256-bit SSL encrypted checkout</span>
                </div>
                <div className="guarantee-line">
                  <FiCheckCircle className="g-icon" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
