/**
 * Placement Routes
 * API endpoints for placement management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  createPlacementOffer,
  respondToPlacementOffer,
  updatePlacement,
  getStudentPlacements,
  getCompanyPlacements,
  getPlacementDetails,
  completePlacement,
  getPlacementStats,
  getPlacementsEndingSoon,
  getMyPlacements
} from '../controllers/placement.controller';

const router = Router();

// Rate limiting for placement operations
const placementRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many placement requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication to all routes
router.use(authenticateToken);
router.use(placementRateLimit);

// ============================================================================
// PLACEMENT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/placements
 * @desc    Create placement offer
 * @access  Company, Admin
 */
router.post('/', [
  body('applicationId').isString().notEmpty().withMessage('Application ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('salary').optional().isInt({ min: 0 }).withMessage('Salary must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
], requireRole('COMPANY', 'ADMIN'), createPlacementOffer);

/**
 * @route   POST /api/placements/:placementId/respond
 * @desc    Student responds to placement offer
 * @access  Student only
 */
router.post('/:placementId/respond', [
  param('placementId').isString().notEmpty().withMessage('Placement ID is required'),
  body('response').isIn(['accept', 'decline']).withMessage('Response must be accept or decline'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], requireRole('STUDENT'), respondToPlacementOffer);

/**
 * @route   PUT /api/placements/:placementId
 * @desc    Update placement details
 * @access  Company, Admin
 */
router.put('/:placementId', [
  param('placementId').isString().notEmpty().withMessage('Placement ID is required'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED']).withMessage('Invalid status'),
  body('salary').optional().isInt({ min: 0 }).withMessage('Salary must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback too long'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('companyRating').optional().isInt({ min: 1, max: 5 }).withMessage('Company rating must be between 1 and 5')
], requireRole('COMPANY', 'ADMIN'), updatePlacement);

/**
 * @route   GET /api/placements/:placementId
 * @desc    Get placement details
 * @access  Student (own), Company (own), Admin
 */
router.get('/:placementId', [
  param('placementId').isString().notEmpty().withMessage('Placement ID is required')
], getPlacementDetails);

/**
 * @route   POST /api/placements/:placementId/complete
 * @desc    Complete placement
 * @access  Company, Admin
 */
router.post('/:placementId/complete', [
  param('placementId').isString().notEmpty().withMessage('Placement ID is required'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback too long'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('companyRating').optional().isInt({ min: 1, max: 5 }).withMessage('Company rating must be between 1 and 5')
], requireRole('COMPANY', 'ADMIN'), completePlacement);

// ============================================================================
// PLACEMENT LISTING ROUTES
// ============================================================================

/**
 * @route   GET /api/placements/my
 * @desc    Get current user's placements
 * @access  Student, Company
 */
router.get('/my', [
  query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED']).withMessage('Invalid status')
], requireRole('STUDENT', 'COMPANY'), getMyPlacements);

/**
 * @route   GET /api/placements/student/:studentId
 * @desc    Get placements for a student
 * @access  Student (own), Company, Admin
 */
router.get('/student/:studentId', [
  param('studentId').isString().notEmpty().withMessage('Student ID is required'),
  query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED']).withMessage('Invalid status')
], getStudentPlacements);

/**
 * @route   GET /api/placements/company/:companyId
 * @desc    Get placements for a company
 * @access  Company (own), Admin
 */
router.get('/company/:companyId', [
  param('companyId').isString().notEmpty().withMessage('Company ID is required'),
  query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED']).withMessage('Invalid status')
], requireRole('COMPANY', 'ADMIN'), getCompanyPlacements);

/**
 * @route   GET /api/placements/ending-soon
 * @desc    Get placements ending soon (next 30 days)
 * @access  Company (own), Admin
 */
router.get('/ending-soon', [
  query('companyId').optional().isString().withMessage('Invalid company ID')
], requireRole('COMPANY', 'ADMIN'), getPlacementsEndingSoon);

/**
 * @route   GET /api/placements/stats
 * @desc    Get placement statistics
 * @access  Company (own), Admin
 */
router.get('/stats', [
  query('companyId').optional().isString().withMessage('Invalid company ID')
], requireRole('COMPANY', 'ADMIN'), getPlacementStats);

export default router;