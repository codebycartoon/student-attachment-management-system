import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getDashboardOverview,
  getStudentSuccessRates,
  getPlacementTrends,
  getActiveSessionsTrends,
  getOpportunityApprovalRates,
  getPendingApprovals,
  getRecentActivity,
  getAdminAnalytics,
  getAdminNotifications,
  markAdminNotificationRead,
  sendSystemAlert,
} from '../controllers/admin-dashboard.controller';

const router = Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// ============================================================================
// DASHBOARD OVERVIEW ROUTES
// ============================================================================

/**
 * @route GET /admin/dashboard/overview
 * @desc Get complete dashboard overview with all cards and metrics
 * @access Admin only
 */
router.get('/overview', getDashboardOverview);

/**
 * @route GET /admin/dashboard/pending-approvals
 * @desc Get items requiring admin approval (users, opportunities)
 * @access Admin only
 */
router.get('/pending-approvals', getPendingApprovals);

/**
 * @route GET /admin/dashboard/recent-activity
 * @desc Get recent admin actions and system activity
 * @access Admin only
 */
router.get('/recent-activity', getRecentActivity);

// ============================================================================
// ANALYTICS & GRAPHS ROUTES
// ============================================================================

/**
 * @route GET /admin/dashboard/analytics/student-success
 * @desc Get student success rates by GPA and major
 * @access Admin only
 * @query timeframe (1month, 3months, 6months, 1year)
 */
router.get('/analytics/student-success', getStudentSuccessRates);

/**
 * @route GET /admin/dashboard/analytics/placement-trends
 * @desc Get placement trends by month, industry, and location
 * @access Admin only
 * @query timeframe (6months, 12months, 24months)
 */
router.get('/analytics/placement-trends', getPlacementTrends);

/**
 * @route GET /admin/dashboard/analytics/session-trends
 * @desc Get active session trends and login patterns
 * @access Admin only
 */
router.get('/analytics/session-trends', getActiveSessionsTrends);

/**
 * @route GET /admin/dashboard/analytics/opportunity-approvals
 * @desc Get opportunity approval rates and timing metrics
 * @access Admin only
 * @query timeframe (1month, 3months, 6months, 12months)
 */
router.get('/analytics/opportunity-approvals', getOpportunityApprovalRates);

/**
 * @route GET /admin/dashboard/analytics
 * @desc Get comprehensive admin analytics
 * @access Admin only
 */
router.get('/analytics', getAdminAnalytics);

/**
 * @route GET /admin/dashboard/notifications
 * @desc Get admin notifications
 * @access Admin only
 */
router.get('/notifications', getAdminNotifications);

/**
 * @route PATCH /admin/dashboard/notifications/:notificationId/read
 * @desc Mark admin notification as read
 * @access Admin only
 */
router.patch('/notifications/:notificationId/read', markAdminNotificationRead);

/**
 * @route POST /admin/dashboard/system-alert
 * @desc Send system alert to all admins
 * @access Admin only
 */
router.post('/system-alert', sendSystemAlert);

export default router;