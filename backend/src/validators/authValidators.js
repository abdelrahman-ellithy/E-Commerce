import { body } from 'express-validator';

const nameRule = body('name')
  .trim()
  .isLength({ min: 2, max: 60 })
  .withMessage('Name must be between 2 and 60 characters.');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Please enter a valid email address.')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8, max: 72 })
  .withMessage('Password must be between 8 and 72 characters.')
  .matches(/[A-Za-z]/)
  .withMessage('Password must contain at least one letter.')
  .matches(/\d/)
  .withMessage('Password must contain at least one number.');

export const registerValidator = [nameRule, emailRule, passwordRule];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters.')
    .matches(/^[+\d][\d\s().-]*$/)
    .withMessage('Please enter a valid phone number.'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 72 })
    .withMessage('New password must be between 8 and 72 characters.')
    .matches(/[A-Za-z]/)
    .withMessage('New password must contain at least one letter.')
    .matches(/\d/)
    .withMessage('New password must contain at least one number.')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from your current password.'),
];
