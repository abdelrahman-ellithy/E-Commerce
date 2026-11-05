import { body, param, query } from 'express-validator';

const urlRule = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
    .withMessage('Image must be a valid http(s) URL.');

export const productIdValidator = [
  param('id').isMongoId().withMessage('Invalid product id.'),
];

export const productQueryValidator = [
  query('keyword').optional().trim().isLength({ max: 100 }),
  query('category').optional().trim().isLength({ max: 60 }),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('inStock').optional().isIn(['true', 'false']),
  query('featured').optional().isIn(['true', 'false']),
  query('active').optional().isIn(['true', 'false']),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'price-asc', 'price-desc', 'rating', 'name']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const createProductValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters.'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters.'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Brand is required and cannot exceed 60 characters.'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Category must be between 2 and 60 characters.'),
  body('price')
    .isFloat({ min: 0, max: 1_000_000 })
    .withMessage('Price must be a number between 0 and 1,000,000.')
    .toFloat(),
  body('compareAtPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 1_000_000 })
    .withMessage('Compare-at price must be a valid number.')
    .toFloat(),
  body('stock')
    .isInt({ min: 0, max: 1_000_000 })
    .withMessage('Stock must be a non-negative whole number.')
    .toInt(),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean.').toBoolean(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.').toBoolean(),
  urlRule('image'),
  body('images')
    .optional()
    .isArray({ max: 6 })
    .withMessage('You can add up to 6 additional images.'),
  body('images.*')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
    .withMessage('Each additional image must be a valid http(s) URL.'),
];

export const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters.'),
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Brand cannot exceed 60 characters.'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Category must be between 2 and 60 characters.'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 1_000_000 })
    .withMessage('Price must be a number between 0 and 1,000,000.')
    .toFloat(),
  body('compareAtPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 1_000_000 })
    .withMessage('Compare-at price must be a valid number.')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0, max: 1_000_000 })
    .withMessage('Stock must be a non-negative whole number.')
    .toInt(),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean.').toBoolean(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.').toBoolean(),
  urlRule('image'),
  body('images')
    .optional()
    .isArray({ max: 6 })
    .withMessage('You can add up to 6 additional images.'),
  body('images.*')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true, protocols: ['http', 'https'], require_tld: false })
    .withMessage('Each additional image must be a valid http(s) URL.'),
];

export const reviewValidator = [
  param('id').isMongoId().withMessage('Invalid product id.'),
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5.')
    .toFloat(),
  body('comment')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Review must be between 3 and 1000 characters.'),
];
