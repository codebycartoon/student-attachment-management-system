/**
 * Reference Data Routes
 * API endpoints for skills, universities, degrees, majors, and preferences
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth';
import {
  getSkills,
  getSkillCategories,
  getUniversities,
  getDegrees,
  getMajors,
  getMajorFields,
  getPreferences,
  getPreferenceTypes,
  getCourses
} from '../controllers/reference-data.controller';

const router = Router();

// Rate limiting for reference data
const referenceRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many reference data requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and rate limiting
router.use(authenticateToken);
router.use(referenceRateLimit);

/**
 * @route   GET /api/reference/skills
 * @desc    Get all skills (with optional category filter or search)
 * @query   category - Filter by skill category
 * @query   search - Search skills by name
 * @access  Private
 */
router.get('/skills', getSkills);

/**
 * @route   GET /api/reference/skill-categories
 * @desc    Get all skill categories
 * @access  Private
 */
router.get('/skill-categories', getSkillCategories);

/**
 * @route   GET /api/reference/universities
 * @desc    Get all universities (with optional search)
 * @query   search - Search universities by name
 * @access  Private
 */
router.get('/universities', getUniversities);

/**
 * @route   GET /api/reference/degrees
 * @desc    Get all degrees
 * @access  Private
 */
router.get('/degrees', getDegrees);

/**
 * @route   GET /api/reference/majors
 * @desc    Get all majors (with optional field filter)
 * @query   field - Filter by major field
 * @access  Private
 */
router.get('/majors', getMajors);

/**
 * @route   GET /api/reference/major-fields
 * @desc    Get all major fields
 * @access  Private
 */
router.get('/major-fields', getMajorFields);

/**
 * @route   GET /api/reference/preferences
 * @desc    Get all preferences (with optional type filter)
 * @query   type - Filter by preference type
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @route   GET /api/reference/preference-types
 * @desc    Get all preference types
 * @access  Private
 */
router.get('/preference-types', getPreferenceTypes);

/**
 * @route   GET /api/reference/courses
 * @desc    Get all courses (with optional search)
 * @query   search - Search courses by name or code
 * @access  Private
 */
router.get('/courses', getCourses);

export default router;