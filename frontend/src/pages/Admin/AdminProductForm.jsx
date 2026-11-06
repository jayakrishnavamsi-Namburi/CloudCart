import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiSave,
  FiImage,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiCheck,
  FiAlertCircle,
  FiLayers
} from 'react-icons/fi';
import { getProductById, createProduct, updateProduct } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './AdminProductForm.css';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Grocery'
];

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  imageUrl: '',
  stock: '',
  featured: false
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fetchingProduct, setFetchingProduct] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch existing product data if in edit mode
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    const loadProduct = async () => {
      try {
        setFetchingProduct(true);
        const data = await getProductById(id);
        if (data && data.product && isMounted) {
          setFormData({
            name: data.product.name || '',
            description: data.product.description || '',
            price: data.product.price !== undefined ? data.product.price.toString() : '',
            category: data.product.category || 'Electronics',
            imageUrl: data.product.imageUrl || '',
            stock: data.product.stock !== undefined ? data.product.stock.toString() : '',
            featured: Boolean(data.product.featured)
          });
        }
      } catch (err) {
        console.error('Error fetching product for edit:', err);
        const msg = err.response?.data?.message || 'Failed to retrieve product details.';
        toast.error(msg);
        navigate('/admin/products');
      } finally {
        if (isMounted) setFetchingProduct(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, navigate]);

  // Handle generic inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'imageUrl') {
      setImgLoadError(false);
    }

    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Product description is required.';
    }

    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      errors.price = 'Please enter a valid non-negative price.';
    }

    if (!formData.category) {
      errors.category = 'Category selection is required.';
    }

    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required.';
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        errors.imageUrl = 'Please enter a valid URL (e.g. https://example.com/photo.jpg).';
      }
    }

    if (
      formData.stock === '' ||
      isNaN(formData.stock) ||
      Number(formData.stock) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      errors.stock = 'Stock quantity must be a whole non-negative number.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(Number(formData.price).toFixed(2)),
      category: formData.category,
      imageUrl: formData.imageUrl.trim(),
      stock: parseInt(formData.stock, 10),
      featured: formData.featured
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success(`"${payload.name}" updated successfully!`);
      } else {
        await createProduct(payload);
        toast.success(`"${payload.name}" added to catalog successfully!`);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to save product:', err);
      const message =
        err.response?.data?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} product. Please try again.`;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="product-form-loading">
        <LoadingSpinner message="Retrieving product details..." size="medium" />
      </div>
    );
  }

  return (
    <div className="admin-product-form-page">
      {/* Page Header */}
      <div className="product-form-header">
        <div className="header-breadcrumbs">
          <Link to="/admin">Admin</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/admin/products">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{isEdit ? 'Edit Product' : 'New Product'}</span>
        </div>

        <div className="header-title-row">
          <div>
            <h1>{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
            <p className="header-sub">
              {isEdit
                ? 'Update specifications, pricing, inventory stock, or display settings for this product.'
                : 'Fill out the product information below to add a new item to the CloudCart catalog.'}
            </p>
          </div>

          <Link to="/admin/products" className="btn-back">
            <FiArrowLeft />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <form onSubmit={handleSubmit} className="product-form-grid" noValidate>
        {/* Left Column: Form Fields */}
        <div className="form-card main-fields-card">
          <div className="form-section-title">
            <FiLayers className="section-icon" />
            <h2>Product Details</h2>
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="product-name" className="form-label required">
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
              required
            />
            {validationErrors.name && (
              <span className="form-error-msg">
                <FiAlertCircle /> {validationErrors.name}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="product-desc" className="form-label required">
              Description
            </label>
            <textarea
              id="product-desc"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive description of the product features, specifications, and materials..."
              className={`form-textarea ${validationErrors.description ? 'input-error' : ''}`}
              required
            />
            {validationErrors.description && (
              <span className="form-error-msg">
                <FiAlertCircle /> {validationErrors.description}
              </span>
            )}
          </div>

          {/* Category & Price Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="product-category" className="form-label required">
                Category
              </label>
              <div className="input-icon-wrapper">
                <FiTag className="field-icon" />
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-select with-icon ${validationErrors.category ? 'input-error' : ''}`}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {validationErrors.category && (
                <span className="form-error-msg">
                  <FiAlertCircle /> {validationErrors.category}
                </span>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="product-price" className="form-label required">
                Price (USD)
              </label>
              <div className="input-icon-wrapper">
                <FiDollarSign className="field-icon" />
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="29.99"
                  className={`form-input with-icon ${validationErrors.price ? 'input-error' : ''}`}
                  required
                />
              </div>
              {validationErrors.price && (
                <span className="form-error-msg">
                  <FiAlertCircle /> {validationErrors.price}
                </span>
              )}
            </div>
          </div>

          {/* Stock & Featured Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="product-stock" className="form-label required">
                Stock Quantity
              </label>
              <div className="input-icon-wrapper">
                <FiPackage className="field-icon" />
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  className={`form-input with-icon ${validationErrors.stock ? 'input-error' : ''}`}
                  required
                />
              </div>
              {validationErrors.stock && (
                <span className="form-error-msg">
                  <FiAlertCircle /> {validationErrors.stock}
                </span>
              )}
            </div>

            <div className="form-group flex-1 checkbox-group-container">
              <label className="checkbox-label" htmlFor="product-featured">
                <input
                  id="product-featured"
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <div className="checkbox-text">
                  <span className="checkbox-title">Featured Product</span>
                  <span className="checkbox-subtitle">
                    Highlight this item on the store homepage & hero showcases
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Image URL Input */}
          <div className="form-group">
            <label htmlFor="product-image" className="form-label required">
              Product Image URL
            </label>
            <div className="input-icon-wrapper">
              <FiImage className="field-icon" />
              <input
                id="product-image"
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-... or placeholder URL"
                className={`form-input with-icon ${validationErrors.imageUrl ? 'input-error' : ''}`}
                required
              />
            </div>
            {validationErrors.imageUrl && (
              <span className="form-error-msg">
                <FiAlertCircle /> {validationErrors.imageUrl}
              </span>
            )}
            <span className="form-help-text">
              Direct link to a high-quality product image (JPG, PNG, WebP).
            </span>
          </div>
        </div>

        {/* Right Column: Live Preview & Submission Card */}
        <div className="form-sidebar">
          {/* Live Preview Card */}
          <div className="form-card preview-card">
            <div className="form-section-title">
              <FiImage className="section-icon" />
              <h2>Live Card Preview</h2>
            </div>
            <p className="preview-instructions">
              Real-time rendering of how customers will see this product in listings.
            </p>

            <div className="preview-product-card">
              <div className="preview-image-container">
                {formData.imageUrl && !imgLoadError ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.name || 'Product preview'}
                    onError={() => setImgLoadError(true)}
                    className="preview-img"
                  />
                ) : (
                  <div className="preview-placeholder">
                    <FiImage className="placeholder-icon" />
                    <span>{imgLoadError ? 'Image URL failed to load' : 'No image URL provided'}</span>
                  </div>
                )}
                {formData.featured && <span className="preview-badge-featured">Featured</span>}
              </div>

              <div className="preview-details">
                <span className="preview-category">{formData.category || 'Category'}</span>
                <h3 className="preview-name">{formData.name || 'Product Title Placeholder'}</h3>
                <p className="preview-desc">
                  {formData.description
                    ? formData.description.length > 80
                      ? formData.description.substring(0, 80) + '...'
                      : formData.description
                    : 'A brief product description will be shown here...'}
                </p>

                <div className="preview-bottom">
                  <div className="preview-price">
                    ${formData.price ? Number(formData.price).toFixed(2) : '0.00'}
                  </div>
                  <div className="preview-stock">
                    {Number(formData.stock) <= 0
                      ? 'Out of Stock'
                      : Number(formData.stock) < 10
                      ? `Low: ${formData.stock || 0}`
                      : `${formData.stock || 0} in stock`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Action Card */}
          <div className="form-card actions-card">
            <button
              type="submit"
              className="btn-submit-product"
              disabled={submitting}
              aria-label={isEdit ? 'Update Product' : 'Create Product'}
            >
              {submitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>{isEdit ? 'Saving Updates...' : 'Creating Product...'}</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                </>
              )}
            </button>

            <Link to="/admin/products" className="btn-cancel-form">
              Cancel & Discard
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
