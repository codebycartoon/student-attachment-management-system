/**
 * Interview Routes
 * API endpoints for interview management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getStudentInterviews,
  getCompanyInterviews,
  getInterviewDetails,
  getUpcomingInterviews,
  getInterviewStats,
  respondToInterview
} from '../controllers/interview.controller';

const router = Router();

// Rate limiting for interview operations
const interviewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many interview requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication to all routes
router.use(authenticateToken);
router.use(interviewRateLimit);

// ============================================================================
// INTERVIEW MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/interviews
 * @desc    Schedule a new interview
 * @access  Company, Admin
 */
router.post('/', [
  body('applicationId').isString().notEmpty().withMessage('Application ID is required'),
  body('interviewType').isIn(['ONLINE', 'ONSITE', 'PHONE', 'VIDEO']).withMessage('Invalid interview type'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('interviewer').optional().isLength({ max: 100 }).withMessage('Interviewer name too long'),
  body('interviewerEmail').optional().isEmail().withMessage('Invalid interviewer email'),
  body('meetingLink').optional().isURL().withMessage('Invalid meeting link'),
  body('location').optional().isLength({ max: 200 }).withMessage('Location too long')
], requireRole('COMPANY', 'ADMIN'), scheduleInterview);

/**
 * @route   PUT /api/interviews/:interviewId
 * @desc    Update interview details
 * @access  Company, Admin
 */
router.put('/:interviewId', [
  param('interviewId').isString().notEmpty().withMessage('Interview ID is required'),
  body('scheduledDate').optional().isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('interviewer').optional().isLength({ max: 100 }).withMessage('Interviewer name too long'),
  body('interviewerEmail').optional().isEmail().withMessage('Invalid interviewer email'),
  body('meetingLink').optional().isURL().withMessage('Invalid meeting link'),
  body('location').optional().isLength({ max: 200 }).withMessage('Location too long'),
  body('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Invalid status'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback too long'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], requireRole('COMPANY', 'ADMIN'), updateInterview);

/**
 * @route   DELETE /api/interviews/:interviewId
 * @desc    Cancel interview
 * @access  Company, Admin, Student
 */
router.delete('/:interviewId', [
  param('interviewId').isString().notEmpty().withMessage('Interview ID is required'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], cancelInterview);

/**
 * @route   GET /api/interviews/:interviewId
 * @desc    Get interview details
 * @access  Student (own), Company (own), Admin
 */
router.get('/:interviewId', [
  param('interviewId').isString().notEmpty().withMessage('Interview ID is required')
], getInterviewDetails);

/**
 * @route   POST /api/interviews/:interviewId/respond
 * @desc    Student responds to interview invitation
 * @access  Student only
 */
router.post('/:interviewId/respond', [
  param('interviewId').isString().notEmpty().withMessage('Interview ID is required'),
  body('response').isIn(['accept', 'decline']).withMessage('Response must be accept or decline'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message too long')
], requireRole('STUDENT'), respondToInterview);

// ============================================================================
// INTERVIEW LISTING ROUTES
// ============================================================================

/**
 * @route   GET /api/interviews/student/:studentId
 * @desc    Get interviews for a student
 * @access  Student (own), Company, Admin
 */
router.get('/student/:studentId', [
  param('studentId').isString().notEmpty().withMessage('Student ID is required'),
  query('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Invalid status')
], getStudentInterviews);

/**
 * @route   GET /api/interviews/company/:companyId
 * @desc    Get interviews for a company
 * @access  Company (own), Admin
 */
router.get('/company/:companyId', [
  param('companyId').isString().notEmpty().withMessage('Company ID is required'),
  query('status').optional().isIn(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Invalid status')
], requireRole('COMPANY', 'ADMIN'), getCompanyInterviews);

/**
 * @route   GET /api/interviews/upcoming
 * @desc    Get upcoming interviews for current user
 * @access  Student, Company
 */
router.get('/upcoming', requireRole('STUDENT', 'COMPANY'), getUpcomingInterviews);

/**
 * @route   GET /api/interviews/stats
 * @desc    Get interview statistics
 * @access  Company (own), Admin
 */
router.get('/stats', [
  query('companyId').optional().isString().withMessage('Invalid company ID')
], requireRole('COMPANY', 'ADMIN'), getInterviewStats);

export default router;