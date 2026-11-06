import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
  FiBox,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiCheckCircle
} from 'react-icons/fi';
import { getProducts, deleteProduct } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminProducts.css';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Grocery'
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        sort: 'newest'
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }

      const data = await getProducts(params);

      if (data && data.products) {
        setProducts(data.products);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.total ?? data.products.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      const message = err.response?.data?.message || 'Failed to retrieve products list.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  // Handle Category Change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setPage(1);
  };

  // Open Delete Modal
  const openDeleteModal = (product) => {
    setProductToDelete(product);
  };

  // Close Delete Modal
  const closeDeleteModal = () => {
    if (!isDeleting) {
      setProductToDelete(null);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete._id);
      toast.success(`"${productToDelete.name}" was successfully removed.`);
      setProductToDelete(null);
      // Re-fetch or update local state
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const message = err.response?.data?.message || 'Failed to delete product. Please try again.';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
  };

  return (
    <div className="admin-products-page">
      {/* Top Banner & Header */}
      <div className="admin-products-header">
        <div>
          <div className="header-breadcrumbs">
            <Link to="/admin">Admin</Link>
            <span className="breadcrumb-separator">/</span>
            <span>Products</span>
          </div>
          <h1>Manage Products</h1>
          <p className="header-desc">
            Add, update inventory, review details, or remove products from the CloudCart store.
          </p>
        </div>

        <Link to="/admin/products/new" className="btn-add-product">
          <FiPlus className="btn-icon" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="products-filter-bar">
        <form className="products-search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search product by title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search">
            Search
          </button>
        </form>

        <div className="filter-controls">
          <div className="category-select-wrapper">
            <FiFilter className="select-icon" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-dropdown"
              aria-label="Filter products by category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'All Categories') && (
            <button className="btn-reset-filters" onClick={handleClearFilters} title="Reset all filters">
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="products-error-alert" role="alert">
          <FiAlertCircle className="error-alert-icon" />
          <span>{error}</span>
          <button className="btn-retry-products" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="products-loading-container">
          <LoadingSpinner message="Loading catalog items..." size="medium" />
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="products-empty-state">
          <FiBox className="empty-box-icon" />
          <h3>No products found</h3>
          <p>
            {searchQuery || selectedCategory !== 'All Categories'
              ? 'No products matched your search or category filter. Try clearing filters.'
              : 'Your store catalog is currently empty. Get started by creating your first product!'}
          </p>
          {searchQuery || selectedCategory !== 'All Categories' ? (
            <button className="btn-clear-empty" onClick={handleClearFilters}>
              Clear Search Filters
            </button>
          ) : (
            <Link to="/admin/products/new" className="btn-create-first">
              <FiPlus />
              <span>Create Product</span>
            </Link>
          )}
        </div>
      ) : (
        /* Products Table */
        <div className="products-table-wrapper">
          <div className="table-responsive">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th className="col-thumb">Image</th>
                  <th className="col-name">Product Name</th>
                  <th className="col-category">Category</th>
                  <th className="col-price">Price</th>
                  <th className="col-stock">Inventory Stock</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock < 10;

                  return (
                    <tr key={product._id} className="product-row">
                      {/* Thumbnail */}
                      <td className="cell-thumb">
                        <div className="thumb-container">
                          <img
                            src={product.imageUrl || 'https://via.placeholder.com/60?text=No+Image'}
                            alt={product.name || 'Product'}
                            onError={handleImageError}
                            className="product-thumbnail"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      {/* Name & Featured Badge */}
                      <td className="cell-name">
                        <div className="product-title-wrap">
                          <span className="product-name" title={product.name}>
                            {product.name}
                          </span>
                          {product.featured && (
                            <span className="badge-featured" title="Featured product on homepage">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="cell-category">
                        <span className="category-pill">{product.category}</span>
                      </td>

                      {/* Price */}
                      <td className="cell-price">
                        <span className="price-value">{formatPrice(product.price)}</span>
                      </td>

                      {/* Stock with Low-Stock badge */}
                      <td className="cell-stock">
                        {isOutOfStock ? (
                          <span className="stock-badge badge-out-of-stock">
                            <FiAlertCircle className="badge-icon" />
                            Out of Stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="stock-badge badge-low-stock">
                            <FiAlertCircle className="badge-icon" />
                            Low Stock ({product.stock})
                          </span>
                        ) : (
                          <span className="stock-badge badge-in-stock">
                            <FiCheckCircle className="badge-icon" />
                            {product.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="cell-actions">
                        <div className="actions-cluster">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="btn-action-edit"
                            title={`Edit ${product.name}`}
                            aria-label={`Edit ${product.name}`}
                          >
                            <FiEdit2 />
                            <span className="action-label">Edit</span>
                          </Link>

                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => openDeleteModal(product)}
                            title={`Delete ${product.name}`}
                            aria-label={`Delete ${product.name}`}
                          >
                            <FiTrash2 />
                            <span className="action-label">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="table-footer-controls">
            <div className="results-summary">
              Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
              (Page {page} of {totalPages})
            </div>

            {totalPages > 1 && (
              <div className="pagination-wrapper" aria-label="Products pagination">
                <button
                  className="page-nav-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Previous Page"
                >
                  <FiChevronLeft />
                  <span>Prev</span>
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((pageNum, index, arr) => {
                      const prevNum = arr[index - 1];
                      const showEllipsis = prevNum && pageNum - prevNum > 1;

                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="pagination-ellipsis">...</span>}
                          <button
                            className={`page-num-btn ${page === pageNum ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  className="page-nav-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-danger-icon">
                <FiTrash2 />
              </div>
              <div>
                <h3 id="modal-title">Delete Product Confirmation</h3>
                <p className="modal-subtitle">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong>"{productToDelete.name}"</strong>?
              </p>
              <div className="modal-product-preview">
                <img
                  src={productToDelete.imageUrl || 'https://via.placeholder.com/50'}
                  alt={productToDelete.name}
                  onError={handleImageError}
                />
                <div>
                  <div className="preview-name">{productToDelete.name}</div>
                  <div className="preview-meta">
                    Category: {productToDelete.category} • Price: {formatPrice(productToDelete.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-delete"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
