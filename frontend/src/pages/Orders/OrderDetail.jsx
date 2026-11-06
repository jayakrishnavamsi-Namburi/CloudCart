import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTruck,
  FiShield
} from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getOrderById } from '../../services/api';
import './OrderDetail.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';

const STATUS_BADGE_MAP = {
  processing: { label: 'Processing', className: 'status-processing' },
  confirmed: { label: 'Confirmed', className: 'status-confirmed' },
  shipped: { label: 'Shipped', className: 'status-shipped' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' }
};

const ORDER_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getOrderById(id);
        if (isMounted) {
          if (res && res.order) {
            setOrder(res.order);
          } else {
            setError('Order details could not be retrieved.');
          }
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Unable to retrieve order details. Please verify the link.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_IMAGE;
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container order-detail-loading">
          <LoadingSpinner message="Loading order details..." />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-detail-error">
            <FiAlertCircle className="error-icon" />
            <h2>Order Not Found</h2>
            <p>{error || "We couldn't locate the requested order."}</p>
            <Link to="/orders" className="btn btn-primary">
              <FiArrowLeft /> Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shortId = order._id ? order._id.slice(-8).toUpperCase() : 'UNKNOWN';
  const statusMeta = STATUS_BADGE_MAP[order.orderStatus] || {
    label: order.orderStatus || 'Unknown',
    className: 'status-processing'
  };

  // Calculate current step index for the progress timeline
  const currentStepIndex = ORDER_STEPS.indexOf(order.orderStatus);

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Navigation & Top Meta */}
        <div className="order-detail-header">
          <Link to="/orders" className="back-link">
            <FiArrowLeft /> Back to My Orders
          </Link>

          <div className="order-header-info">
            <div className="order-title-group">
              <h1 className="order-detail-title">Order #{shortId}</h1>
              <span className={`status-badge ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>

            <div className="order-meta-sub">
              <span className="order-date-label">
                <FiCalendar className="order-icon" /> Placed on {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Tracker Bar (only for non-cancelled) */}
        {order.orderStatus !== 'cancelled' && (
          <div className="order-timeline-card">
            <div className="timeline-steps">
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="step-indicator">
                      {isCompleted ? <FiCheckCircle /> : idx + 1}
                    </div>
                    <span className="step-label">
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Two-Column Layout */}
        <div className="order-detail-grid">
          {/* Left Column: Ordered Items Table & Totals */}
          <div className="order-items-column">
            <div className="order-card">
              <h2 className="order-card-title">
                <FiPackage className="title-icon" /> Ordered Items ({order.items?.length || 0})
              </h2>

              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th className="th-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => {
                      const itemSubtotal = (item.price || 0) * (item.quantity || 1);
                      const productId = item.product?._id || item.product || '';

                      return (
                        <tr key={item._id || index}>
                          <td className="td-product">
                            <div className="product-item-cell">
                              <img
                                src={item.imageUrl || DEFAULT_IMAGE}
                                alt={item.name}
                                className="item-thumbnail"
                                onError={handleImageError}
                              />
                              <div className="item-name-box">
                                {productId ? (
                                  <Link to={`/products/${productId}`} className="item-name-link">
                                    {item.name}
                                  </Link>
                                ) : (
                                  <span className="item-name-text">{item.name}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="td-qty">{item.quantity}</td>
                          <td className="td-price">${Number(item.price).toFixed(2)}</td>
                          <td className="td-subtotal th-right">${itemSubtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Totals Summary */}
              <div className="order-totals-box">
                <div className="totals-row">
                  <span>Items Total</span>
                  <span>${Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Shipping & Handling</span>
                  <span>{order.totalAmount >= 50 ? 'FREE' : '$5.99'}</span>
                </div>
                <div className="totals-divider" />
                <div className="totals-row grand-total-row">
                  <span>Total Amount</span>
                  <span className="grand-total-amount">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shipping & Payment Cards */}
          <div className="order-sidebar-column">
            {/* Shipping Address Card */}
            <div className="order-card">
              <h2 className="order-card-title">
                <FiMapPin className="title-icon" /> Shipping Address
              </h2>
              {order.shippingAddress ? (
                <div className="address-details">
                  <p className="address-line street">{order.shippingAddress.street}</p>
                  <p className="address-line">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p className="address-line country">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="no-info-text">No address information recorded.</p>
              )}
            </div>

            {/* Payment Information Card */}
            <div className="order-card">
              <h2 className="order-card-title">
                <FiCreditCard className="title-icon" /> Payment Details
              </h2>
              <div className="payment-details-list">
                <div className="payment-detail-row">
                  <span className="detail-key">Method:</span>
                  <span className="detail-val">
                    {order.paymentStatus === 'completed'
                      ? 'Credit Card (Demo)'
                      : 'Cash on Delivery (COD)'}
                  </span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-key">Payment Status:</span>
                  <span
                    className={`payment-status-badge status-${order.paymentStatus || 'pending'}`}
                  >
                    {order.paymentStatus === 'completed'
                      ? 'Paid'
                      : order.paymentStatus === 'failed'
                      ? 'Failed'
                      : 'Pending (Due on Delivery)'}
                  </span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-key">Total Paid:</span>
                  <span className="detail-val font-bold">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
