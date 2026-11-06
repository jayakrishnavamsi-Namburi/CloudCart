import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiEye,
  FiArrowRight,
  FiShoppingBag,
  FiCalendar,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getMyOrders } from '../../services/api';
import './MyOrders.css';

const STATUS_BADGE_MAP = {
  processing: { label: 'Processing', className: 'status-processing' },
  confirmed: { label: 'Confirmed', className: 'status-confirmed' },
  shipped: { label: 'Shipped', className: 'status-shipped' },
  delivered: { label: 'Delivered', className: 'status-delivered' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyOrders();
        if (isMounted) {
          if (res && Array.isArray(res.orders)) {
            setOrders(res.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
        if (isMounted) {
          setError('Unable to load your orders. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getItemsCount = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container orders-loading-container">
          <LoadingSpinner message="Retrieving your order history..." />
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">
              View and track all your previous purchases and current shipments.
            </p>
          </div>
          <Link to="/products" className="btn btn-outline-primary btn-sm">
            <FiShoppingBag /> Continue Shopping
          </Link>
        </div>

        {error ? (
          <div className="orders-error-card">
            <FiAlertCircle className="orders-error-icon" />
            <h3>Failed to load orders</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="orders-empty-card">
            <div className="empty-order-icon-circle">
              <FiPackage />
            </div>
            <h2>No orders yet</h2>
            <p>
              You haven't placed any orders with CloudCart yet. Start browsing our catalog to find products you love!
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        ) : (
          /* Orders Table */
          <div className="orders-table-card">
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const shortId = order._id ? order._id.slice(-8).toUpperCase() : 'UNKNOWN';
                    const totalItems = getItemsCount(order);
                    const statusMeta = STATUS_BADGE_MAP[order.orderStatus] || {
                      label: order.orderStatus || 'Unknown',
                      className: 'status-processing'
                    };

                    return (
                      <tr key={order._id}>
                        {/* Order # */}
                        <td className="td-order-id">
                          <Link to={`/orders/${order._id}`} className="order-id-link">
                            #{shortId}
                          </Link>
                        </td>

                        {/* Date */}
                        <td className="td-date">
                          <span className="date-text">
                            <FiCalendar className="date-icon" />
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="td-items">
                          <span className="items-count-badge">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="td-total">
                          <span className="total-price">
                            ${Number(order.totalAmount || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="td-status">
                          <span className={`status-badge ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Action Link */}
                        <td className="td-action">
                          <Link
                            to={`/orders/${order._id}`}
                            className="btn btn-outline btn-sm view-order-btn"
                          >
                            <FiEye /> View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List fallback */}
            <div className="orders-mobile-list">
              {orders.map((order) => {
                const shortId = order._id ? order._id.slice(-8).toUpperCase() : 'UNKNOWN';
                const totalItems = getItemsCount(order);
                const statusMeta = STATUS_BADGE_MAP[order.orderStatus] || {
                  label: order.orderStatus || 'Unknown',
                  className: 'status-processing'
                };

                return (
                  <div key={order._id} className="order-mobile-card">
                    <div className="mobile-card-top">
                      <div>
                        <span className="mobile-order-num">#{shortId}</span>
                        <span className="mobile-order-date">{formatDate(order.createdAt)}</span>
                      </div>
                      <span className={`status-badge ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="mobile-card-middle">
                      <span className="mobile-items-text">{totalItems} items</span>
                      <span className="mobile-total-text">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-outline btn-sm mobile-details-btn"
                    >
                      <FiEye /> View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
