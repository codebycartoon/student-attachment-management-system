/**
 * Notification Routes
 * API endpoints for notification management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationCount,
  sendNotification,
  sendBulkNotifications,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getSystemLogs,
  getQueueStats,
  triggerCleanup
} from '../controllers/notification.controller';

const router = Router();

// Rate limiting for notification operations
const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many notification requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin rate limiting for management operations
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 admin requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication to all routes
router.use(authenticateToken);
router.use(notificationRateLimit);

// ============================================================================
// USER NOTIFICATION ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('unreadOnly').optional().isBoolean().withMessage('UnreadOnly must be boolean'),
  query('type').optional().isIn(['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE']).withMessage('Invalid notification type')
], getUserNotifications);

/**
 * @route   GET /api/notifications/count
 * @desc    Get notification count
 * @access  Private
 */
router.get('/count', getNotificationCount);

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:notificationId/read', [
  param('notificationId').isString().notEmpty().withMessage('Notification ID is required')
], markNotificationRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', [
  param('notificationId').isString().notEmpty().withMessage('Notification ID is required')
], deleteNotification);

// ============================================================================
// NOTIFICATION PREFERENCES ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', getNotificationPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', [
  body('emailNotifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
  body('pushNotifications').optional().isBoolean().withMessage('Push notifications must be boolean'),
  body('applicationUpdates').optional().isBoolean().withMessage('Application updates must be boolean'),
  body('interviewReminders').optional().isBoolean().withMessage('Interview reminders must be boolean'),
  body('opportunityMatches').optional().isBoolean().withMessage('Opportunity matches must be boolean'),
  body('placementUpdates').optional().isBoolean().withMessage('Placement updates must be boolean'),
  body('systemAlerts').optional().isBoolean().withMessage('System alerts must be boolean')
], updateNotificationPreferences);

// ============================================================================
// ADMIN NOTIFICATION ROUTES
// ============================================================================

/**
 * @route   POST /api/notifications/send
 * @desc    Send notification to user
 * @access  Admin only
 */
router.post('/send', [
  adminRateLimit,
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('type').isIn(['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE']).withMessage('Invalid notification type'),
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('message').isString().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('actionUrl').optional().isURL().withMessage('Action URL must be valid'),
  body('metadata').optional()
], requireRole('ADMIN'), sendNotification);

/**
 * @route   POST /api/notifications/bulk
 * @desc    Send bulk notifications
 * @access  Admin only
 */
router.post('/bulk', [
  adminRateLimit,
  body('userIds').isArray({ min: 1, max: 100 }).withMessage('User IDs must be array with 1-100 items'),
  body('userIds.*').isString().notEmpty().withMessage('Each user ID must be valid'),
  body('type').isIn(['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE']).withMessage('Invalid notification type'),
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('message').isString().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('actionUrl').optional().isURL().withMessage('Action URL must be valid'),
  body('metadata').optional()
], requireRole('ADMIN'), sendBulkNotifications);

// ============================================================================
// ADMIN SYSTEM MONITORING ROUTES
// ============================================================================

/**
 * @route   GET /api/notifications/admin/logs
 * @desc    Get system event logs
 * @access  Admin only
 */
router.get('/admin/logs', [
  adminRateLimit,
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('level').optional().isIn(['INFO', 'WARNING', 'ERROR', 'DEBUG']).withMessage('Invalid log level'),
  query('action').optional().isString().withMessage('Action must be string'),
  query('userId').optional().isString().withMessage('User ID must be string')
], requireRole('ADMIN'), getSystemLogs);

/**
 * @route   GET /api/notifications/admin/queue-stats
 * @desc    Get queue statistics
 * @access  Admin only
 */
router.get('/admin/queue-stats', [
  adminRateLimit
], requireRole('ADMIN'), getQueueStats);

/**
 * @route   POST /api/notifications/admin/cleanup
 * @desc    Trigger system cleanup
 * @access  Admin only
 */
router.post('/admin/cleanup', [
  adminRateLimit,
  body('daysToKeep').optional().isInt({ min: 1, max: 365 }).withMessage('Days to keep must be between 1 and 365')
], requireRole('ADMIN'), triggerCleanup);

export default router;