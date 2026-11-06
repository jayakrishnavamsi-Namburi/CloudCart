import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiShoppingBag,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMapPin,
  FiDollarSign,
  FiRefreshCw
} from 'react-icons/fi';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminOrders.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'processing', label: 'Processing' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Updating status tracker by order ID
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all orders
  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getAllOrders();
      if (data && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to retrieve orders:', err);
      const msg = err.response?.data?.message || 'Failed to fetch customer orders.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];

    // Optimistically update status
    setOrders((prev) =>
      prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
    );
    setUpdatingOrderId(orderId);

    try {
      const res = await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId.slice(-6).toUpperCase()} status changed to "${newStatus}".`);

      // Update with server returned order if available
      if (res && res.order) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, ...res.order } : ord))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, ...res.order }));
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert optimistic update
      setOrders(originalOrders);
      const msg = err.response?.data?.message || 'Failed to update order status. Please try again.';
      toast.error(msg);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      // Search filter (Order ID, Customer Name, Customer Email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const idMatch = order._id.toLowerCase().includes(query);
        const nameMatch = order.user?.name?.toLowerCase().includes(query) || false;
        const emailMatch = order.user?.email?.toLowerCase().includes(query) || false;
        return idMatch || nameMatch || emailMatch;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Summary counts
  const summaryCounts = useMemo(() => {
    const counts = {
      total: orders.length,
      processing: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    orders.forEach((o) => {
      if (counts[o.orderStatus] !== undefined) {
        counts[o.orderStatus]++;
      }
    });
    return counts;
  }, [orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'confirmed':
        return 'status-confirmed';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="admin-orders-page">
      {/* Header */}
      <div className="admin-orders-header">
        <div>
          <div className="header-breadcrumbs">
            <Link to="/admin">Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span>Orders</span>
          </div>
          <h1>Manage Orders</h1>
          <p className="header-desc">
            Monitor, inspect, and update customer order fulfillment statuses in real-time.
          </p>
        </div>

        <button
          className={`btn-refresh-orders ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          aria-label="Refresh orders list"
        >
          <FiRefreshCw className="refresh-icon" />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="orders-summary-bar">
        <button
          className={`summary-pill ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
        >
          <FiShoppingBag className="pill-icon" />
          <span>All Orders</span>
          <span className="pill-count">{summaryCounts.total}</span>
        </button>

        <button
          className={`summary-pill pill-processing ${statusFilter === 'processing' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('processing');
            setCurrentPage(1);
          }}
        >
          <FiClock className="pill-icon" />
          <span>Processing</span>
          <span className="pill-count">{summaryCounts.processing}</span>
        </button>

        <button
          className={`summary-pill pill-confirmed ${statusFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('confirmed');
            setCurrentPage(1);
          }}
        >
          <FiCheckCircle className="pill-icon" />
          <span>Confirmed</span>
          <span className="pill-count">{summaryCounts.confirmed}</span>
        </button>

        <button
          className={`summary-pill pill-shipped ${statusFilter === 'shipped' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('shipped');
            setCurrentPage(1);
          }}
        >
          <FiTruck className="pill-icon" />
          <span>Shipped</span>
          <span className="pill-count">{summaryCounts.shipped}</span>
        </button>

        <button
          className={`summary-pill pill-delivered ${statusFilter === 'delivered' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('delivered');
            setCurrentPage(1);
          }}
        >
          <FiCheckCircle className="pill-icon" />
          <span>Delivered</span>
          <span className="pill-count">{summaryCounts.delivered}</span>
        </button>

        <button
          className={`summary-pill pill-cancelled ${statusFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('cancelled');
            setCurrentPage(1);
          }}
        >
          <FiXCircle className="pill-icon" />
          <span>Cancelled</span>
          <span className="pill-count">{summaryCounts.cancelled}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="orders-filter-toolbar">
        <div className="search-box-wrapper">
          <FiSearch className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer name, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-box-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="status-dropdown-wrapper">
          <FiFilter className="filter-dropdown-icon" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter-select"
            aria-label="Filter orders by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <button
            className="btn-clear-order-filters"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="orders-error-alert" role="alert">
          <span>{error}</span>
          <button className="btn-retry-orders" onClick={() => fetchOrders()}>
            Retry
          </button>
        </div>
      )}

      {/* Loading or Content */}
      {loading ? (
        <div className="orders-loading-wrap">
          <LoadingSpinner message="Fetching order records..." size="medium" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <FiShoppingBag className="empty-order-icon" />
          <h3>No Orders Found</h3>
          <p>
            {searchQuery || statusFilter !== 'all'
              ? 'No orders matched your search or status filter criteria.'
              : 'There are currently no customer orders in the system.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              className="btn-reset-order-search"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <div className="table-responsive">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Date & Time</th>
                  <th>Total Amount</th>
                  <th>Purchased Items</th>
                  <th>Fulfillment Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const isUpdating = updatingOrderId === order._id;
                  const itemsCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                  const itemPreviewNames = order.items
                    ?.map((i) => `${i.name} (x${i.quantity})`)
                    .join(', ');

                  return (
                    <tr key={order._id} className="order-row">
                      {/* ID */}
                      <td className="cell-id">
                        <span className="order-code" title={order._id}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="cell-customer">
                        <div className="customer-name">{order.user?.name || 'Guest User'}</div>
                        <div className="customer-email">{order.user?.email || 'N/A'}</div>
                      </td>

                      {/* Date */}
                      <td className="cell-date">{formatDate(order.createdAt)}</td>

                      {/* Total Amount */}
                      <td className="cell-amount">
                        <span className="amount-value">{formatCurrency(order.totalAmount)}</span>
                        <span className={`payment-pill payment-${order.paymentStatus || 'pending'}`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </td>

                      {/* Items Summary */}
                      <td className="cell-items">
                        <div className="items-summary" title={itemPreviewNames}>
                          <span className="items-count-badge">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                          <span className="items-names-trunc">{itemPreviewNames}</span>
                        </div>
                      </td>

                      {/* Inline Status Select */}
                      <td className="cell-status">
                        <div className="status-select-wrap">
                          <select
                            value={order.orderStatus || 'processing'}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={isUpdating}
                            className={`order-status-select ${getStatusBadgeClass(
                              order.orderStatus
                            )} ${isUpdating ? 'status-updating' : ''}`}
                            aria-label={`Update status for order ${order._id}`}
                          >
                            <option value="processing">Processing</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {isUpdating && <div className="status-spinner" />}
                        </div>
                      </td>

                      {/* View Details Action */}
                      <td className="cell-view">
                        <button
                          type="button"
                          className="btn-view-order"
                          onClick={() => setSelectedOrder(order)}
                          title="View complete order details"
                          aria-label={`View complete details for order ${order._id}`}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="orders-pagination-bar">
            <div className="pagination-info">
              Showing <strong>{paginatedOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
              (Page {currentPage} of {totalPages})
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous Page"
                >
                  <FiChevronLeft />
                  <span>Prev</span>
                </button>

                <div className="page-numbers-list">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((pageNum, index, arr) => {
                      const prevNum = arr[index - 1];
                      const showEllipsis = prevNum && pageNum - prevNum > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="order-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
        >
          <div className="order-modal-dialog">
            <div className="order-modal-header">
              <div>
                <h3 id="order-modal-title">
                  Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <span className="order-modal-date">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close dialog"
              >
                <FiX />
              </button>
            </div>

            <div className="order-modal-content">
              {/* Customer & Shipping Details */}
              <div className="modal-info-grid">
                <div className="modal-info-card">
                  <h4>Customer Information</h4>
                  <p className="info-main">{selectedOrder.user?.name || 'Guest User'}</p>
                  <p className="info-sub">{selectedOrder.user?.email || 'No email provided'}</p>
                </div>

                <div className="modal-info-card">
                  <h4>Shipping Address</h4>
                  {selectedOrder.shippingAddress ? (
                    <address className="shipping-address-block">
                      <FiMapPin className="address-icon" />
                      <span>
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode},{' '}
                        {selectedOrder.shippingAddress.country}
                      </span>
                    </address>
                  ) : (
                    <p className="info-sub">No shipping address recorded.</p>
                  )}
                </div>

                <div className="modal-info-card">
                  <h4>Payment & Status</h4>
                  <div className="modal-status-rows">
                    <div>
                      <span>Payment Status:</span>
                      <strong className={`payment-pill payment-${selectedOrder.paymentStatus || 'pending'}`}>
                        {selectedOrder.paymentStatus || 'pending'}
                      </strong>
                    </div>
                    <div>
                      <span>Fulfillment:</span>
                      <strong className={`status-badge ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="modal-items-section">
                <h4>Ordered Items ({selectedOrder.items?.length || 0})</h4>
                <div className="modal-items-table">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={item._id || idx} className="modal-item-row">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/50'}
                        alt={item.name}
                        className="modal-item-thumb"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50?text=No+Img';
                        }}
                      />
                      <div className="modal-item-name">
                        <span className="item-title">{item.name}</span>
                        <span className="item-qty-price">
                          ${(item.price || 0).toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                      <div className="modal-item-total">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-order-total-row">
                  <span>Grand Total</span>
                  <span className="modal-grand-total">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
