import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Centralized error handler. Normalizes Mongoose/JWT/body-parser errors into
 * a consistent JSON shape and hides internal details in production.
 */
export function errorHandler(err, _req, res, _next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'CastError') {
      error = ApiError.notFound('Resource not found.');
    } else if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      }));
      error = ApiError.unprocessable('Validation failed.', details);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'value';
      error = ApiError.conflict(`A record with that ${field} already exists.`);
    } else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid authentication token.');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Your session has expired. Please sign in again.');
    } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      error = ApiError.badRequest('Invalid JSON payload.');
    } else {
      error = new ApiError(500, 'Something went wrong on the server.');
      error.stack = err.stack;
    }
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err.stack || err);
  } else if (!env.isTest && env.nodeEnv === 'development') {
    console.warn(`[${statusCode}] ${error.message}`);
  }

  const payload = {
    success: false,
    message: error.message,
  };

  if (error.details) {
    payload.errors = error.details;
  }

  if (!env.isProduction && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
