/**
 * Authentication Routes
 * JWT-based authentication endpoints
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refreshToken, logout, getProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken
} from '../validators/auth.validator';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', authRateLimit, validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validateLogin, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', generalRateLimit, validateRefreshToken, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', generalRateLimit, logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', generalRateLimit, authenticateToken, getProfile);

export default router;