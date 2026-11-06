import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token signed with user ID.
 * Token expires in 30 days.
 *
 * @param {string|import('mongoose').Types.ObjectId} id - User ID to encode in token payload.
 * @returns {string} Signed JWT token string.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_cloudcart', {
    expiresIn: '30d'
  });
};

export default generateToken;
