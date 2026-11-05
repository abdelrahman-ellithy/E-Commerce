import { body, param, query } from 'express-validator';

const PHONE_REGEX = /^[+\d][\d\s().-]{5,29}$/;

export const orderIdValidator = [
  param('id').isMongoId().withMessage('Invalid order id.'),
];

export const createOrderValidator = [
  body('items')
    .isArray({ min: 1, max: 50 })
    .withMessage('Your cart must contain at least one item.'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Each cart item must reference a valid product.'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Item quantity must be between 1 and 99.')
    .toInt(),
  body('shippingAddress.fullName')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters.'),
  body('shippingAddress.phone')
    .trim()
    .matches(PHONE_REGEX)
    .withMessage('Please enter a valid phone number.')
    .isLength({ max: 30 }),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters.'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('City must be between 2 and 80 characters.'),
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Postal code must be between 2 and 20 characters.'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Country must be between 2 and 80 characters.'),
  body('paymentMethod')
    .optional()
    .isIn(['cod'])
    .withMessage('Only cash on delivery is currently supported.'),
];

export const adminOrderQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status.'),
  query('keyword').optional().trim().isLength({ max: 60 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order id.'),
  body('status')
    .isIn(['processing', 'shipped', 'delivered'])
    .withMessage('Status must be processing, shipped, or delivered.'),
  body('note').optional().trim().isLength({ max: 200 }),
];

export const markPaidValidator = [
  param('id').isMongoId().withMessage('Invalid order id.'),
];
