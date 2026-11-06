/**
 * Global error handling middleware for Express.
 * Handles known database errors (CastError, Duplicate Key, ValidationError)
 * and formats all errors into a standardized JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with ID: ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateFields = Object.keys(err.keyValue || {});
    const fieldName = duplicateFields.length > 0 ? duplicateFields[0] : 'field';
    message = `Duplicate value entered for ${fieldName}. Please provide another value.`;
    errors = [{ field: fieldName, message }];
  }

  // Handle Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }

  // Handle JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please authenticate again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
