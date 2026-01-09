/**
 * Matching Engine Routes
 * API endpoints for AI-powered student-opportunity matching
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { param, body, query } from 'express-validator';
import { authenticateToken, requireAdmin, requireCompany, requireStudent } from '../middleware/auth';
import {
  getStudentsForOpportunity,
  getOpportunitiesForStudent,
  triggerRecomputation,
  processQueue,
  getAILogs,
  getMatchingStats,
  getStudentMatchInsights,
  getOpportunityMatchInsights
} from '../controllers/matching-engine.controller';

const router = Router();

// Rate limiting for matching operations
const matchingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many matching requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin-only rate limiting for management operations
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
router.use(matchingRateLimit);

/**
 * @route   GET /api/v1/matching/opportunity/:opportunityId
 * @desc    Get ranked list of students for an opportunity
 * @access  Private (Company/Admin only)
 */
router.get('/opportunity/:opportunityId', [
  param('opportunityId').isString().notEmpty().withMessage('Valid opportunity ID is required'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1 and 200'),
  query('forceRecompute').optional().isBoolean().withMessage('Force recompute must be boolean')
], requireCompany, getStudentsForOpportunity);

/**
 * @route   GET /api/v1/matching/student/:studentId
 * @desc    Get top matching opportunities for a student
 * @access  Private (Student/Admin only)
 */
router.get('/student/:studentId', [
  param('studentId').isString().notEmpty().withMessage('Valid student ID is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('forceRecompute').optional().isBoolean().withMessage('Force recompute must be boolean')
], requireStudent, getOpportunitiesForStudent);

/**
 * @route   GET /api/v1/matching/insights/student/:studentId/opportunity/:opportunityId
 * @desc    Get detailed match insights for student-opportunity pair
 * @access  Private (Company/Admin only)
 */
router.get('/insights/student/:studentId/opportunity/:opportunityId', [
  param('studentId').isString().notEmpty().withMessage('Valid student ID is required'),
  param('opportunityId').isString().notEmpty().withMessage('Valid opportunity ID is required')
], requireCompany, getStudentMatchInsights);

/**
 * @route   GET /api/v1/matching/insights/opportunity/:opportunityId/student/:studentId
 * @desc    Get detailed match insights for opportunity-student pair (student perspective)
 * @access  Private (Student/Admin only)
 */
router.get('/insights/opportunity/:opportunityId/student/:studentId', [
  param('studentId').isString().notEmpty().withMessage('Valid student ID is required'),
  param('opportunityId').isString().notEmpty().withMessage('Valid opportunity ID is required')
], requireStudent, getOpportunityMatchInsights);

// Admin-only routes
router.use(adminRateLimit);

/**
 * @route   POST /api/v1/matching/recompute
 * @desc    Trigger manual recomputation
 * @access  Private (Admin only)
 */
router.post('/recompute', [
  body('studentId').optional().isString().withMessage('Student ID must be a string'),
  body('opportunityId').optional().isString().withMessage('Opportunity ID must be a string'),
  body('priority').optional().isInt({ min: 0, max: 10 }).withMessage('Priority must be between 0 and 10')
], requireAdmin, triggerRecomputation);

/**
 * @route   POST /api/v1/matching/process-queue
 * @desc    Process recomputation queue
 * @access  Private (Admin only)
 */
router.post('/process-queue', [
  query('batchSize').optional().isInt({ min: 1, max: 100 }).withMessage('Batch size must be between 1 and 100')
], requireAdmin, processQueue);

/**
 * @route   GET /api/v1/matching/logs
 * @desc    View AI engine run logs
 * @access  Private (Admin only)
 */
router.get('/logs', [
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be between 1 and 200')
], requireAdmin, getAILogs);

/**
 * @route   GET /api/v1/matching/stats
 * @desc    Get matching engine statistics
 * @access  Private (Admin only)
 */
router.get('/stats', requireAdmin, getMatchingStats);

export default router;