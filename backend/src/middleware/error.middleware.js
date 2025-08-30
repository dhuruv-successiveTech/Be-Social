const {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: 'error',
    message: 'Something went wrong',
    statusCode: 500,
    errors: []
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = new ValidationError(
      Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ValidationError([{
      field,
      message: `This ${field} is already taken`
    }]);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token has expired');
  }

  // Custom errors
  if (err instanceof CustomError) {
    error = err;
  }

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errors: error.errors,
      stack: err.stack,
      error: err
    });
  }

  // Production error response
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    errors: error.errors
  });
};

module.exports = errorHandler;
