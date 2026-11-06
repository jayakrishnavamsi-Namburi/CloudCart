import React from 'react';
import { FiStar } from 'react-icons/fi';
import './StarRating.css';

const StarRating = ({ rating = 0, numReviews = null, showNumber = false, size = 'md' }) => {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className={`star-rating-container size-${size}`}>
      <div className="stars-wrapper" aria-label={`Rating: ${numericRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(0, Math.min(100, (numericRating - (starIndex - 1)) * 100));

          return (
            <div key={starIndex} className="star-box">
              <FiStar className="star-bg" />
              <div
                className="star-fg"
                style={{ width: `${fillPercentage}%` }}
              >
                <FiStar className="star-filled" />
              </div>
            </div>
          );
        })}
      </div>

      {showNumber && (
        <span className="rating-score">{numericRating.toFixed(1)}</span>
      )}

      {numReviews !== null && (
        <span className="review-count">({numReviews})</span>
      )}
    </div>
  );
};

export default StarRating;
