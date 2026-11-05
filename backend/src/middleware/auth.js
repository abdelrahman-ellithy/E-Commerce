import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * Requires a valid Bearer token and attaches the current user to `req.user`.
 * The user is loaded from the database on every request so role changes and
 * deleted accounts take effect immediately.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Not authorized. Please sign in.');
  }

  const token = header.slice(7).trim();

  if (!token) {
    throw ApiError.unauthorized('Not authorized. Please sign in.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Your session has expired or is invalid. Please sign in again.');
  }

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw ApiError.unauthorized('The account for this session no longer exists.');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to the given roles. Must run after `protect`.
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }

    return next();
  };
