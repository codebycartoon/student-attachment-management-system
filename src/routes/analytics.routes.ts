/**
 * Analytics Routes
 * Admin analytics and reporting API endpoints
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getOverviewKPIs,
  getFunnelMetrics,
  getStudentAnalytics,
  getCompanyAnalytics,
  getMatchingAnalytics,
  getSystemHealth,
  getGeographicAnalytics,
  getTrendAnalytics,
  getComprehensiveReport,
  exportAnalytics,
  getRealTimeDashboard
} from '../controllers/analytics.controller';

const router = Router();

// Rate limiting for analytics operations
const analyticsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many analytics requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Export rate limiting (more restrictive)
const exportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 export requests per hour
  message: {
    success: false,
    message: 'Too many export requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireRole('ADMIN'));
router.use(analyticsRateLimit);

// ============================================================================
// OVERVIEW & DASHBOARD ROUTES
// ============================================================================

/**
 * @route   GET /api/analytics/overview
 * @desc    Get overview KPIs for admin dashboard
 * @access  Admin only
 * @query   timeframe (week|month|quarter)
 */
router.get('/overview', [
  query('timeframe').optional().isIn(['week', 'month', 'quarter']).withMessage('Invalid timeframe')
], getOverviewKPIs);

/**
 * @route   GET /api/analytics/dashboard/realtime
 * @desc    Get real-time dashboard data
 * @access  Admin only
 */
router.get('/dashboard/realtime', getRealTimeDashboard);

/**
 * @route   GET /api/analytics/comprehensive
 * @desc    Get comprehensive analytics report
 * @access  Admin only
 * @query   timeframe (week|month|quarter)
 */
router.get('/comprehensive', [
  query('timeframe').optional().isIn(['week', 'month', 'quarter']).withMessage('Invalid timeframe')
], getComprehensiveReport);

// ============================================================================
// FUNNEL & PERFORMANCE ROUTES
// ============================================================================

/**
 * @route   GET /api/analytics/funnel
 * @desc    Get application funnel metrics (Application → Interview → Placement)
 * @access  Admin only
 * @query   timeframe (number of days, 7-365)
 */
router.get('/funnel', [
  query('timeframe').optional().isInt({ min: 7, max: 365 }).withMessage('Timeframe must be between 7 and 365 days')
], getFunnelMetrics);

/**
 * @route   GET /api/analytics/students
 * @desc    Get student performance analytics
 * @access  Admin only
 */
router.get('/students', getStudentAnalytics);

/**
 * @route   GET /api/analytics/companies
 * @desc    Get company quality analytics
 * @access  Admin only
 */
router.get('/companies', getCompanyAnalytics);

/**
 * @route   GET /api/analytics/matching
 * @desc    Get matching algorithm performance metrics
 * @access  Admin only
 */
router.get('/matching', getMatchingAnalytics);

// ============================================================================
// SYSTEM & GEOGRAPHIC ROUTES
// ============================================================================

/**
 * @route   GET /api/analytics/system-health
 * @desc    Get system health metrics
 * @access  Admin only
 */
router.get('/system-health', getSystemHealth);

/**
 * @route   GET /api/analytics/geographic
 * @desc    Get geographic analytics
 * @access  Admin only
 */
router.get('/geographic', getGeographicAnalytics);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trend data over time
 * @access  Admin only
 * @query   months (number of months, 3-24)
 */
router.get('/trends', [
  query('months').optional().isInt({ min: 3, max: 24 }).withMessage('Months must be between 3 and 24')
], getTrendAnalytics);

// ============================================================================
// EXPORT ROUTES
// ============================================================================

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data in various formats
 * @access  Admin only
 * @query   type (overview|funnel|students|companies|matching|comprehensive)
 * @query   format (json|csv|pdf)
 * @query   timeframe (week|month|quarter)
 */
router.get('/export', [
  exportRateLimit,
  query('type').isIn(['overview', 'funnel', 'students', 'companies', 'matching', 'comprehensive']).withMessage('Invalid export type'),
  query('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid export format'),
  query('timeframe').optional().isIn(['week', 'month', 'quarter']).withMessage('Invalid timeframe')
], exportAnalytics);

export default router;