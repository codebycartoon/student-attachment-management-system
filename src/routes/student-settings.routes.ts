/**
 * Student Settings Routes
 * API endpoints for student account settings and preferences
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { authenticateToken, requireStudent } from '../middleware/auth';
import {
  getAccountSettings,
  updateNotificationPreferences,
  changePassword
} from '../controllers/student-settings.controller';

const router = Router();

// Rate limiting for settings operations
const settingsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many settings requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and student role requirement to all routes
router.use(authenticateToken);
router.use(requireStudent);
router.use(settingsRateLimit);

/**
 * @route   GET /api/student/settings
 * @desc    Get account settings
 * @access  Private (Student only)
 */
router.get('/settings', getAccountSettings);

/**
 * @route   PUT /api/student/settings/notifications
 * @desc    Update notification preferences
 * @access  Private (Student only)
 */
router.put('/settings/notifications', [
  body('emailNotifications').optional().isBoolean(),
  body('applicationUpdates').optional().isBoolean(),
  body('opportunityMatches').optional().isBoolean(),
  body('interviewReminders').optional().isBoolean()
], updateNotificationPreferences);

/**
 * @route   PUT /api/student/settings/password
 * @desc    Change password
 * @access  Private (Student only)
 */
router.put('/settings/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
], changePassword);

export default router;