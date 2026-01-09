/**
 * Student Dashboard Routes
 * API endpoints for student dashboard functionality
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { authenticateToken, requireStudent } from '../middleware/auth';
import {
  getStudentDashboard,
  getMatchReadiness,
  getStudentApplications,
  applyToOpportunity,
  withdrawApplication,
  getOpportunityMatches,
  getStudentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getStudentAnalytics
} from '../controllers/student-dashboard.controller';

const router = Router();

// Rate limiting for dashboard operations
const dashboardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many dashboard requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and student role requirement to all routes
router.use(authenticateToken);
router.use(requireStudent);
router.use(dashboardRateLimit);

/**
 * @route   GET /api/student/dashboard
 * @desc    Get student dashboard overview
 * @access  Private (Student only)
 */
router.get('/dashboard', getStudentDashboard);

/**
 * @route   GET /api/student/match-readiness
 * @desc    Get match readiness analysis
 * @access  Private (Student only)
 */
router.get('/match-readiness', getMatchReadiness);

/**
 * @route   GET /api/student/applications
 * @desc    Get student applications
 * @access  Private (Student only)
 */
router.get('/applications', getStudentApplications);

/**
 * @route   POST /api/student/applications
 * @desc    Apply to opportunity
 * @access  Private (Student only)
 */
router.post('/applications', [
  body('opportunityId').notEmpty().withMessage('Opportunity ID is required'),
  body('coverLetter').optional().isLength({ max: 2000 }).withMessage('Cover letter too long')
], applyToOpportunity);

/**
 * @route   PATCH /api/student/applications/:applicationId/withdraw
 * @desc    Withdraw application
 * @access  Private (Student only)
 */
router.patch('/applications/:applicationId/withdraw', withdrawApplication);

/**
 * @route   GET /api/student/opportunities/matches
 * @desc    Get opportunity matches for student
 * @access  Private (Student only)
 */
router.get('/opportunities/matches', getOpportunityMatches);

/**
 * @route   GET /api/student/notifications
 * @desc    Get student notifications
 * @access  Private (Student only)
 */
router.get('/notifications', getStudentNotifications);

/**
 * @route   PATCH /api/student/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private (Student only)
 */
router.patch('/notifications/:notificationId/read', markNotificationRead);

/**
 * @route   PATCH /api/student/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private (Student only)
 */
router.patch('/notifications/read-all', markAllNotificationsRead);

/**
 * @route   GET /api/student/analytics
 * @desc    Get student analytics
 * @access  Private (Student only)
 */
router.get('/analytics', getStudentAnalytics);

export default router;