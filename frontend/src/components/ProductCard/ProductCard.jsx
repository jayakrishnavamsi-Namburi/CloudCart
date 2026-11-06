import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import StarRating from '../StarRating/StarRating';
import './ProductCard.css';

// Fallback image SVG data uri
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_IMAGE;
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-image-wrapper">
        <img
          src={product.imageUrl || DEFAULT_IMAGE}
          alt={product.name || 'CloudCart Product'}
          className="product-card-image"
          onError={handleImageError}
          loading="lazy"
        />
        {product.category && (
          <span className="product-card-category-badge">{product.category}</span>
        )}
        {product.featured && (
          <span className="product-card-featured-badge">Featured</span>
        )}
        <div className="product-card-quick-overlay">
          <span className="quick-view-btn">
            <FiEye /> View Details
          </span>
        </div>
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product._id}`} className="product-card-title-link">
          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="product-card-rating">
          <StarRating rating={product.rating || 0} numReviews={product.numReviews} />
        </div>

        <div className="product-card-footer">
          <div className="product-card-price-box">
            <span className="product-card-price-currency">$</span>
            <span className="product-card-price">{Number(product.price).toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm product-card-btn"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            title={product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <FiShoppingCart />
            <span>{product.stock <= 0 ? 'Out of Stock' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
