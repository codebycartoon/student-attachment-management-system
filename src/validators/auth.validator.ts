/**
 * Authentication Validation Rules
 * Express-validator rules for auth endpoints
 */

import { body } from 'express-validator';

/**
 * Registration validation
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('role')
    .isIn(['STUDENT', 'COMPANY', 'ADMIN'])
    .withMessage('Role must be STUDENT, COMPANY, or ADMIN'),

  body('firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('companyName')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Company name must be between 1 and 255 characters')
];

/**
 * Login validation
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Refresh token validation
 */
export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

/**
 * Password reset request validation
 */
export const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

/**
 * Password reset validation
 */
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];