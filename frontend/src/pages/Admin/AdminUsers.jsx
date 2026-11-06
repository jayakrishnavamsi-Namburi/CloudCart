import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUsers,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiCalendar,
  FiMail
} from 'react-icons/fi';
import { getAllUsers, updateUserRole } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminUsers.css';

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'admin', 'user'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Confirmation Modal State
  const [roleChangeTarget, setRoleChangeTarget] = useState(null); // { user, targetRole }
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Fetch Users
  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getAllUsers();
      if (data && data.users) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to retrieve users list:', err);
      const msg = err.response?.data?.message || 'Failed to retrieve registered users.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open confirmation modal
  const handleOpenRoleModal = (user, targetRole) => {
    // Prevent modifying own admin status
    if (currentAdmin && user._id === currentAdmin._id && targetRole !== 'admin') {
      toast.warn('You cannot demote your own active administrator account.');
      return;
    }
    setRoleChangeTarget({ user, targetRole });
  };

  // Close confirmation modal
  const handleCloseRoleModal = () => {
    if (!isUpdatingRole) {
      setRoleChangeTarget(null);
    }
  };

  // Confirm Role Modification
  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget) return;

    const { user, targetRole } = roleChangeTarget;
    setIsUpdatingRole(true);

    try {
      const res = await updateUserRole(user._id, targetRole);
      const updatedUser = res?.user || { ...user, role: targetRole };

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: targetRole } : u))
      );

      toast.success(
        `User "${user.name}" is now ${
          targetRole === 'admin' ? 'an Administrator' : 'a Standard User'
        }.`
      );
      setRoleChangeTarget(null);
    } catch (err) {
      console.error('Error modifying user role:', err);
      const msg = err.response?.data?.message || 'Failed to update user role.';
      toast.error(msg);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = u.name?.toLowerCase().includes(query) || false;
        const emailMatch = u.email?.toLowerCase().includes(query) || false;
        return nameMatch || emailMatch;
      }

      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stats Breakdown
  const userMetrics = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const standardCount = total - adminCount;
    return { total, adminCount, standardCount };
  }, [users]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-users-page">
      {/* Page Header */}
      <div className="admin-users-header">
        <div>
          <div className="header-breadcrumbs">
            <Link to="/admin">Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span>Users</span>
          </div>
          <h1>Manage Users</h1>
          <p className="header-desc">
            View registered user accounts, search by profile, and manage platform administrative roles.
          </p>
        </div>

        <button
          className={`btn-refresh-users ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          aria-label="Refresh users list"
        >
          <FiRefreshCw className="refresh-icon" />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Users'}</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      <div className="users-stat-cards">
        <button
          className={`user-stat-card ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setRoleFilter('all');
            setCurrentPage(1);
          }}
        >
          <div className="stat-card-icon icon-all">
            <FiUsers />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Accounts</span>
            <span className="stat-card-value">{userMetrics.total}</span>
          </div>
        </button>

        <button
          className={`user-stat-card ${roleFilter === 'admin' ? 'active' : ''}`}
          onClick={() => {
            setRoleFilter('admin');
            setCurrentPage(1);
          }}
        >
          <div className="stat-card-icon icon-admin">
            <FiShield />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Administrators</span>
            <span className="stat-card-value">{userMetrics.adminCount}</span>
          </div>
        </button>

        <button
          className={`user-stat-card ${roleFilter === 'user' ? 'active' : ''}`}
          onClick={() => {
            setRoleFilter('user');
            setCurrentPage(1);
          }}
        >
          <div className="stat-card-icon icon-user">
            <FiUserCheck />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Standard Users</span>
            <span className="stat-card-value">{userMetrics.standardCount}</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="users-toolbar">
        <div className="users-search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="users-search-input"
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

        <div className="users-filter-group">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="users-role-select"
            aria-label="Filter users by role"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Standard Users Only</option>
          </select>

          {(searchQuery || roleFilter !== 'all') && (
            <button
              className="btn-reset-user-filters"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="users-error-alert" role="alert">
          <span>{error}</span>
          <button className="btn-retry-users" onClick={() => fetchUsers()}>
            Retry
          </button>
        </div>
      )}

      {/* Table & Content */}
      {loading ? (
        <div className="users-loading-wrapper">
          <LoadingSpinner message="Loading user directory..." size="medium" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty-state">
          <FiUsers className="empty-user-icon" />
          <h3>No Users Found</h3>
          <p>
            {searchQuery || roleFilter !== 'all'
              ? 'No registered users match your current search or role filters.'
              : 'There are currently no users in the database.'}
          </p>
          {(searchQuery || roleFilter !== 'all') && (
            <button
              className="btn-clear-user-search"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setCurrentPage(1);
              }}
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="users-table-wrapper">
          <div className="table-responsive">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th className="col-user">User</th>
                  <th className="col-email">Email Address</th>
                  <th className="col-role">System Role</th>
                  <th className="col-joined">Joined Date</th>
                  <th className="col-action">Role Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const isCurrentAdminUser =
                    currentAdmin && (user._id === currentAdmin._id || user._id === currentAdmin.id);
                  const isAdminRole = user.role === 'admin';

                  return (
                    <tr key={user._id} className="user-row">
                      {/* Name with Avatar */}
                      <td className="cell-user">
                        <div className="user-profile-wrap">
                          <div className={`user-avatar ${isAdminRole ? 'avatar-admin' : ''}`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="user-details">
                            <span className="user-name">
                              {user.name}
                              {isCurrentAdminUser && <span className="you-badge">(You)</span>}
                            </span>
                            <span className="user-id-sub">ID: {user._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="cell-email">
                        <div className="email-wrap">
                          <FiMail className="email-icon" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="cell-role">
                        {isAdminRole ? (
                          <span className="badge-role badge-admin">
                            <FiShield className="role-icon" />
                            Admin
                          </span>
                        ) : (
                          <span className="badge-role badge-user">
                            <FiUserCheck className="role-icon" />
                            User
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="cell-joined">
                        <div className="joined-wrap">
                          <FiCalendar className="calendar-icon" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Role Action Button */}
                      <td className="cell-action">
                        {isCurrentAdminUser ? (
                          <span className="action-disabled-text" title="Cannot modify your own account">
                            Current Session
                          </span>
                        ) : isAdminRole ? (
                          <button
                            type="button"
                            className="btn-role-action btn-demote"
                            onClick={() => handleOpenRoleModal(user, 'user')}
                            title={`Demote ${user.name} to standard user`}
                          >
                            <FiUserX className="btn-icon" />
                            <span>Demote to User</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-role-action btn-promote"
                            onClick={() => handleOpenRoleModal(user, 'admin')}
                            title={`Promote ${user.name} to administrator`}
                          >
                            <FiShield className="btn-icon" />
                            <span>Make Admin</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="users-pagination-bar">
            <div className="pagination-info">
              Showing <strong>{paginatedUsers.length}</strong> of <strong>{filteredUsers.length}</strong> users
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

      {/* Confirmation Modal */}
      {roleChangeTarget && (
        <div
          className="user-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
        >
          <div className="user-modal-dialog">
            <div className="modal-top">
              <div
                className={`modal-icon-bubble ${
                  roleChangeTarget.targetRole === 'admin' ? 'bubble-promote' : 'bubble-demote'
                }`}
              >
                {roleChangeTarget.targetRole === 'admin' ? <FiShield /> : <FiAlertTriangle />}
              </div>
              <div className="modal-headings">
                <h3 id="role-modal-title">
                  {roleChangeTarget.targetRole === 'admin'
                    ? 'Promote User to Administrator?'
                    : 'Demote Administrator to Standard User?'}
                </h3>
                <p className="modal-sub">Confirm role privilege adjustments</p>
              </div>
            </div>

            <div className="modal-content-body">
              <p>
                You are about to change the system permissions for{' '}
                <strong>{roleChangeTarget.user.name}</strong> ({roleChangeTarget.user.email}).
              </p>

              {roleChangeTarget.targetRole === 'admin' ? (
                <div className="role-notice-box notice-promote">
                  <FiShield className="notice-icon" />
                  <div>
                    <strong>Full Access Granted:</strong> This user will gain complete administrative
                    access to manage products, modify customer orders, and alter system user privileges.
                  </div>
                </div>
              ) : (
                <div className="role-notice-box notice-demote">
                  <FiAlertTriangle className="notice-icon" />
                  <div>
                    <strong>Administrative Access Revoked:</strong> This user will lose all admin
                    privileges and will only be able to perform standard customer actions.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleCloseRoleModal}
                disabled={isUpdatingRole}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn-modal-confirm ${
                  roleChangeTarget.targetRole === 'admin' ? 'confirm-promote' : 'confirm-demote'
                }`}
                onClick={handleConfirmRoleChange}
                disabled={isUpdatingRole}
              >
                {isUpdatingRole
                  ? 'Updating Role...'
                  : roleChangeTarget.targetRole === 'admin'
                  ? 'Confirm Promotion'
                  : 'Confirm Demotion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
