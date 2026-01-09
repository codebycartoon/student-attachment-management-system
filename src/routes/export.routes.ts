/**
 * Export Routes
 * Data export API endpoints for analytics and reporting
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  exportApplications,
  exportPlacements,
  exportStudents,
  exportCompanies,
  exportAnalyticsReport,
  getExportStats
} from '../controllers/export.controller';

const router = Router();

// Export rate limiting (more restrictive than regular API calls)
const exportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 export requests per hour
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
router.use(exportRateLimit);

// ============================================================================
// DATA EXPORT ROUTES
// ============================================================================

/**
 * @route   GET /api/export/applications
 * @desc    Export applications data
 * @access  Admin only
 * @query   format (json|csv|excel|pdf), from, to, industry, university, location
 */
router.get('/applications', [
  query('format').optional().isIn(['json', 'csv', 'excel', 'pdf']).withMessage('Invalid export format'),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  query('industry').optional().isString().withMessage('Industry must be string'),
  query('university').optional().isString().withMessage('University must be string'),
  query('location').optional().isString().withMessage('Location must be string')
], exportApplications);

/**
 * @route   GET /api/export/placements
 * @desc    Export placements data
 * @access  Admin only
 * @query   format (json|csv|excel|pdf), from, to, industry, university, location
 */
router.get('/placements', [
  query('format').optional().isIn(['json', 'csv', 'excel', 'pdf']).withMessage('Invalid export format'),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  query('industry').optional().isString().withMessage('Industry must be string'),
  query('university').optional().isString().withMessage('University must be string'),
  query('location').optional().isString().withMessage('Location must be string')
], exportPlacements);

/**
 * @route   GET /api/export/students
 * @desc    Export students data
 * @access  Admin only
 * @query   format (json|csv|excel|pdf), university, location, gpaRange, skillCategory
 */
router.get('/students', [
  query('format').optional().isIn(['json', 'csv', 'excel', 'pdf']).withMessage('Invalid export format'),
  query('university').optional().isString().withMessage('University must be string'),
  query('location').optional().isString().withMessage('Location must be string'),
  query('gpaRange').optional().isString().withMessage('GPA range must be string'),
  query('skillCategory').optional().isString().withMessage('Skill category must be string')
], exportStudents);

/**
 * @route   GET /api/export/companies
 * @desc    Export companies data
 * @access  Admin only
 * @query   format (json|csv|excel|pdf), industry, location
 */
router.get('/companies', [
  query('format').optional().isIn(['json', 'csv', 'excel', 'pdf']).withMessage('Invalid export format'),
  query('industry').optional().isString().withMessage('Industry must be string'),
  query('location').optional().isString().withMessage('Location must be string')
], exportCompanies);

/**
 * @route   GET /api/export/analytics-report
 * @desc    Export comprehensive analytics report
 * @access  Admin only
 * @query   timeframe (week|month|quarter), format (json|csv|pdf)
 */
router.get('/analytics-report', [
  query('timeframe').optional().isIn(['week', 'month', 'quarter']).withMessage('Invalid timeframe'),
  query('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Invalid export format')
], exportAnalyticsReport);

// ============================================================================
// EXPORT STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/export/stats
 * @desc    Get export statistics and usage metrics
 * @access  Admin only
 * @query   days (1-365)
 */
router.get('/stats', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], getExportStats);

export default router;