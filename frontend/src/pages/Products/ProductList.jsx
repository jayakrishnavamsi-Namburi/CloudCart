import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiRotateCcw,
  FiAlertCircle
} from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getProducts, getCategories } from '../../services/api';
import './ProductList.css';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Grocery'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' }
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // State from URL Params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local form state
  const [searchInput, setSearchInput] = useState(searchParam);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Products Data State
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res && Array.isArray(res.categories) && res.categories.length > 0) {
          setCategoriesList(res.categories);
        }
      } catch (err) {
        console.warn('Using default categories fallback:', err);
      }
    };
    fetchCats();
  }, []);

  // Synchronize local input state if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [searchParam, minPriceParam, maxPriceParam]);

  // Fetch products whenever searchParams change
  const fetchProductsList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 12,
        page: pageParam
      };

      if (categoryParam) params.category = categoryParam;
      if (searchParam) params.search = searchParam;
      if (minPriceParam) params.minPrice = minPriceParam;
      if (maxPriceParam) params.maxPrice = maxPriceParam;
      if (sortParam) params.sort = sortParam;

      const res = await getProducts(params);

      if (res && res.success) {
        setProducts(res.products || []);
        setTotalProducts(res.total ?? (res.products ? res.products.length : 0));
        setTotalPages(res.pages ?? 1);
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  useEffect(() => {
    fetchProductsList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProductsList]);

  // Helper to update URL params
  const updateParams = (newEntries) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(newEntries).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });

    // Reset to page 1 whenever any filter other than page changes
    if (!('page' in newEntries)) {
      updated.delete('page');
    }

    startTransition(() => {
      setSearchParams(updated);
    });
  };

  // Category toggle handler
  const handleCategoryToggle = (catName) => {
    if (categoryParam === catName) {
      updateParams({ category: '' });
    } else {
      updateParams({ category: catName });
    }
  };

  // Price range apply handler
  const handlePriceApply = (e) => {
    e.preventDefault();
    updateParams({
      minPrice: minPriceInput ? Number(minPriceInput) : '',
      maxPrice: maxPriceInput ? Number(maxPriceInput) : ''
    });
    setMobileFilterOpen(false);
  };

  // Search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() });
  };

  // Clear single search
  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ search: '' });
  };

  // Sort change handler
  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    categoryParam || searchParam || minPriceParam || maxPriceParam || sortParam !== 'newest'
  );

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Top Header */}
        <div className="product-list-header">
          <div className="product-list-heading">
            <h1 className="page-title">
              {categoryParam ? `${categoryParam}` : 'Explore All Products'}
            </h1>
            <p className="page-subtitle">
              {searchParam
                ? `Results matching "${searchParam}"`
                : 'Browse our entire inventory with fast shipping and guaranteed quality.'}
            </p>
          </div>

          <div className="product-list-top-bar">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="search-form-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
              <button type="submit" className="btn btn-primary search-submit-btn">
                Search
              </button>
            </form>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              className="btn btn-outline mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
            >
              <FiSliders />
              <span>Filters</span>
              {hasActiveFilters && <span className="filter-active-dot" />}
            </button>
          </div>
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="product-list-layout">
          {/* Backdrop for Mobile Sidebar */}
          {mobileFilterOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setMobileFilterOpen(false)}
            />
          )}

          {/* Left Sidebar Filters */}
          <aside className={`product-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title-wrapper">
                <FiFilter className="filter-title-icon" />
                <h2 className="sidebar-title">Filters</h2>
              </div>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <FiX />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline-danger btn-sm reset-all-btn"
              >
                <FiRotateCcw /> Reset All Filters
              </button>
            )}

            {/* Category Filter */}
            <div className="filter-group">
              <h3 className="filter-group-title">Categories</h3>
              <div className="filter-options-list">
                <label className="filter-checkbox-item">
                  <input
                    type="radio"
                    name="category"
                    checked={!categoryParam}
                    onChange={() => updateParams({ category: '' })}
                  />
                  <span className="checkbox-label">All Categories</span>
                </label>
                {categoriesList.map((cat) => (
                  <label key={cat} className="filter-checkbox-item">
                    <input
                      type="radio"
                      name="category"
                      checked={categoryParam === cat}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    <span className="checkbox-label">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <h3 className="filter-group-title">Price Range ($)</h3>
              <form onSubmit={handlePriceApply} className="price-filter-form">
                <div className="price-inputs-row">
                  <div className="price-input-box">
                    <label htmlFor="minPrice" className="price-sublabel">Min</label>
                    <input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </div>
                  <span className="price-separator">-</span>
                  <div className="price-input-box">
                    <label htmlFor="maxPrice" className="price-sublabel">Max</label>
                    <input
                      id="maxPrice"
                      type="number"
                      placeholder="1000"
                      min="0"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="form-input form-input-sm"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-primary btn-sm price-apply-btn">
                  Apply Price
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="product-main-content">
            {/* Meta Control Bar: Result count & Sort */}
            <div className="product-meta-bar">
              <div className="product-count-text">
                {loading ? (
                  <span>Searching catalog...</span>
                ) : (
                  <span>
                    Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products
                    {categoryParam && ` in "${categoryParam}"`}
                  </span>
                )}
              </div>

              <div className="product-sort-wrapper">
                <label htmlFor="sortSelect" className="sort-label">Sort by:</label>
                <select
                  id="sortSelect"
                  value={sortParam}
                  onChange={handleSortChange}
                  className="form-select sort-select"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid or State View */}
            {loading ? (
              <div className="products-loading-wrapper">
                <LoadingSpinner message="Loading products catalog..." />
              </div>
            ) : error ? (
              <div className="products-error-card">
                <FiAlertCircle className="error-card-icon" />
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={fetchProductsList}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty-card">
                <div className="empty-icon-circle">
                  <FiSearch />
                </div>
                <h3>No Products Found</h3>
                <p>
                  We couldn't find any items matching your selected criteria. Try adjusting your search query or removing filters.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn btn-primary"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <nav className="pagination-container" aria-label="Product list pagination">
                <button
                  type="button"
                  className="btn btn-outline pagination-btn"
                  onClick={() => updateParams({ page: Math.max(1, pageParam - 1) })}
                  disabled={pageParam <= 1}
                >
                  <FiChevronLeft /> Previous
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
                    // Show current page, first, last, and immediate neighbors
                    if (
                      pNum === 1 ||
                      pNum === totalPages ||
                      Math.abs(pNum - pageParam) <= 1
                    ) {
                      return (
                        <button
                          key={pNum}
                          type="button"
                          className={`page-number-btn ${pNum === pageParam ? 'active' : ''}`}
                          onClick={() => updateParams({ page: pNum })}
                        >
                          {pNum}
                        </button>
                      );
                    } else if (
                      pNum === pageParam - 2 ||
                      pNum === pageParam + 2
                    ) {
                      return <span key={pNum} className="page-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-outline pagination-btn"
                  onClick={() => updateParams({ page: Math.min(totalPages, pageParam + 1) })}
                  disabled={pageParam >= totalPages}
                >
                  Next <FiChevronRight />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
