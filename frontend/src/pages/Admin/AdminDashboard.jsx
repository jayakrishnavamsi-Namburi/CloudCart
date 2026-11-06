import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiArrowRight,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { getOrderStats, getUserStats, getAllOrders, getProducts } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    ordersByStatus: {
      processing: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }
  });
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [orderStatsRes, userStatsRes, productsRes, allOrdersRes] = await Promise.allSettled([
        getOrderStats(),
        getUserStats(),
        getProducts({ limit: 1 }),
        getAllOrders()
      ]);

      // Order Stats
      if (orderStatsRes.status === 'fulfilled' && orderStatsRes.value?.stats) {
        setStats(orderStatsRes.value.stats);
      }

      // User Stats
      if (userStatsRes.status === 'fulfilled' && userStatsRes.value?.stats) {
        setUserStats(userStatsRes.value.stats);
      }

      // Total Products
      if (productsRes.status === 'fulfilled' && productsRes.value) {
        setTotalProducts(productsRes.value.total ?? productsRes.value.count ?? 0);
      }

      // Recent Orders (last 5)
      if (allOrdersRes.status === 'fulfilled' && allOrdersRes.value?.orders) {
        const sorted = [...allOrdersRes.value.orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sorted.slice(0, 5));
      }

      // If all failed, show error
      const allFailed = [orderStatsRes, userStatsRes, productsRes, allOrdersRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        setError('Failed to load dashboard statistics. Please check your backend connection.');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('An unexpected error occurred while loading dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <LoadingSpinner message="Loading administrator dashboard..." size="large" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header Section */}
      <div className="admin-dashboard-header">
        <div className="admin-header-title">
          <span className="admin-badge">Admin Portal</span>
          <h1>System Overview & Analytics</h1>
          <p>Monitor your e-commerce platform performance, sales, orders, and customer activity in real-time.</p>
        </div>
        <div className="admin-header-actions">
          <button
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard data"
          >
            <FiRefreshCw className="refresh-icon" />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error-banner" role="alert">
          <FiAlertCircle className="error-icon" />
          <div className="error-content">
            <strong>Unable to sync data</strong>
            <p>{error}</p>
          </div>
          <button className="btn-retry" onClick={() => fetchDashboardData()}>
            Retry
          </button>
        </div>
      )}

      {/* 4 Stat Metric Cards */}
      <section className="admin-metrics-grid" aria-label="Key Performance Indicators">
        {/* Card 1: Total Orders */}
        <div className="metric-card card-orders">
          <div className="metric-card-inner">
            <div className="metric-info">
              <span className="metric-label">Total Orders</span>
              <h2 className="metric-value">{(stats.totalOrders || 0).toLocaleString()}</h2>
              <div className="metric-subtext">
                <FiClock className="subtext-icon" />
                <span>Across all customer accounts</span>
              </div>
            </div>
            <div className="metric-icon-wrapper icon-orders" aria-hidden="true">
              <FiShoppingBag />
            </div>
          </div>
          <div className="metric-footer">
            <Link to="/admin/orders" className="metric-link">
              <span>View all orders</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="metric-card card-revenue">
          <div className="metric-card-inner">
            <div className="metric-info">
              <span className="metric-label">Total Revenue</span>
              <h2 className="metric-value">{formatCurrency(stats.totalRevenue)}</h2>
              <div className="metric-subtext">
                <FiTrendingUp className="subtext-icon" />
                <span>Excludes cancelled orders</span>
              </div>
            </div>
            <div className="metric-icon-wrapper icon-revenue" aria-hidden="true">
              <FiDollarSign />
            </div>
          </div>
          <div className="metric-footer">
            <Link to="/admin/orders" className="metric-link">
              <span>Inspect financial logs</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Card 3: Total Users */}
        <div className="metric-card card-users">
          <div className="metric-card-inner">
            <div className="metric-info">
              <span className="metric-label">Total Users</span>
              <h2 className="metric-value">{(userStats.totalUsers || 0).toLocaleString()}</h2>
              <div className="metric-subtext">
                <FiCheckCircle className="subtext-icon" />
                <span>
                  {userStats.newUsersThisMonth > 0
                    ? `+${userStats.newUsersThisMonth} new this month`
                    : 'Active user base'}
                </span>
              </div>
            </div>
            <div className="metric-icon-wrapper icon-users" aria-hidden="true">
              <FiUsers />
            </div>
          </div>
          <div className="metric-footer">
            <Link to="/admin/users" className="metric-link">
              <span>Manage registered users</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Card 4: Total Products */}
        <div className="metric-card card-products">
          <div className="metric-card-inner">
            <div className="metric-info">
              <span className="metric-label">Total Products</span>
              <h2 className="metric-value">{(totalProducts || 0).toLocaleString()}</h2>
              <div className="metric-subtext">
                <FiPackage className="subtext-icon" />
                <span>Listed in catalog</span>
              </div>
            </div>
            <div className="metric-icon-wrapper icon-products" aria-hidden="true">
              <FiPackage />
            </div>
          </div>
          <div className="metric-footer">
            <Link to="/admin/products" className="metric-link">
              <span>Manage product catalog</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section className="admin-section quick-actions-section">
        <div className="section-header">
          <div>
            <h2>Quick Actions</h2>
            <p className="section-subtitle">Jump straight to administrative controls and operations</p>
          </div>
        </div>
        <div className="quick-actions-grid">
          <Link to="/admin/products" className="quick-action-card">
            <div className="action-icon action-icon-products">
              <FiPackage />
            </div>
            <div className="action-details">
              <h3>Manage Products</h3>
              <p>Add new products, adjust inventory levels, edit pricing and details</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>

          <Link to="/admin/orders" className="quick-action-card">
            <div className="action-icon action-icon-orders">
              <FiShoppingBag />
            </div>
            <div className="action-details">
              <h3>Manage Orders</h3>
              <p>Review customer orders, update delivery progress, and handle fulfillments</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>

          <Link to="/admin/users" className="quick-action-card">
            <div className="action-icon action-icon-users">
              <FiUsers />
            </div>
            <div className="action-details">
              <h3>Manage Users</h3>
              <p>Inspect registered customer accounts and configure administrator privileges</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>
        </div>
      </section>

      {/* Order Status Distribution Overview */}
      {stats.ordersByStatus && (
        <section className="admin-section status-breakdown-section">
          <div className="section-header">
            <div>
              <h2>Order Status Distribution</h2>
              <p className="section-subtitle">Current state of customer fulfillment pipelines</p>
            </div>
          </div>
          <div className="status-chips-grid">
            <div className="status-chip chip-processing">
              <span className="chip-count">{stats.ordersByStatus.processing || 0}</span>
              <span className="chip-label">Processing</span>
            </div>
            <div className="status-chip chip-confirmed">
              <span className="chip-count">{stats.ordersByStatus.confirmed || 0}</span>
              <span className="chip-label">Confirmed</span>
            </div>
            <div className="status-chip chip-shipped">
              <span className="chip-count">{stats.ordersByStatus.shipped || 0}</span>
              <span className="chip-label">Shipped</span>
            </div>
            <div className="status-chip chip-delivered">
              <span className="chip-count">{stats.ordersByStatus.delivered || 0}</span>
              <span className="chip-label">Delivered</span>
            </div>
            <div className="status-chip chip-cancelled">
              <span className="chip-count">{stats.ordersByStatus.cancelled || 0}</span>
              <span className="chip-label">Cancelled</span>
            </div>
          </div>
        </section>
      )}

      {/* Recent Orders Table */}
      <section className="admin-section recent-orders-section">
        <div className="section-header">
          <div>
            <h2>Recent Orders</h2>
            <p className="section-subtitle">The last 5 placed customer orders across the platform</p>
          </div>
          <Link to="/admin/orders" className="view-all-link">
            <span>View All Orders</span>
            <FiArrowRight />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-orders-state">
            <FiShoppingBag className="empty-icon" />
            <p>No orders recorded in the system yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id-cell">
                      <span className="order-id" title={order._id}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-name">{order.user?.name || 'Guest / Removed'}</div>
                      <div className="customer-email">{order.user?.email || 'N/A'}</div>
                    </td>
                    <td className="date-cell">{formatDate(order.createdAt)}</td>
                    <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus || 'processing'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <Link to="/admin/orders" className="table-action-link">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
