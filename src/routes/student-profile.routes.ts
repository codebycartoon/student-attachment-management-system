/**
 * Student Profile Routes
 * API endpoints for student profile management
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, requireStudent } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  updateSkills,
  updatePreferences,
  addExperience,
  addProject,
  getMetrics,
  getProfileCompletion,
  recalculateMetrics
} from '../controllers/student-profile.controller';
import {
  validateProfileUpdate,
  validateSkillsUpdate,
  validatePreferencesUpdate,
  validateExperience,
  validateProject
} from '../validators/student-profile.validator';

const router = Router();

// Rate limiting for profile operations
const profileRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many profile requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and student role requirement to all routes
router.use(authenticateToken);
router.use(requireStudent);
router.use(profileRateLimit);

/**
 * @route   GET /api/student/profile
 * @desc    Get complete student profile
 * @access  Private (Student only)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/student/profile
 * @desc    Update basic profile information
 * @access  Private (Student only)
 */
router.put('/profile', validateProfileUpdate, updateProfile);

/**
 * @route   PUT /api/student/profile/academic
 * @desc    Update academic profile information
 * @access  Private (Student only)
 */
router.put('/profile/academic', validateProfileUpdate, updateProfile);

/**
 * @route   PUT /api/student/skills
 * @desc    Update student skills
 * @access  Private (Student only)
 */
router.put('/skills', validateSkillsUpdate, updateSkills);

/**
 * @route   POST /api/student/profile/skills
 * @desc    Add a skill to student profile
 * @access  Private (Student only)
 */
router.post('/profile/skills', validateSkillsUpdate, updateSkills);

/**
 * @route   PUT /api/student/profile/skills/:skillId
 * @desc    Update a specific skill
 * @access  Private (Student only)
 */
router.put('/profile/skills/:skillId', validateSkillsUpdate, updateSkills);

/**
 * @route   DELETE /api/student/profile/skills/:skillId
 * @desc    Remove a skill from profile
 * @access  Private (Student only)
 */
router.delete('/profile/skills/:skillId', updateSkills);

/**
 * @route   PUT /api/student/preferences
 * @desc    Update student preferences
 * @access  Private (Student only)
 */
router.put('/preferences', validatePreferencesUpdate, updatePreferences);

/**
 * @route   POST /api/student/experience
 * @desc    Add work experience
 * @access  Private (Student only)
 */
router.post('/experience', validateExperience, addExperience);

/**
 * @route   POST /api/student/profile/experiences
 * @desc    Add work experience (alternative route for tests)
 * @access  Private (Student only)
 */
router.post('/profile/experiences', validateExperience, addExperience);

/**
 * @route   PUT /api/student/profile/experiences/:experienceId
 * @desc    Update work experience
 * @access  Private (Student only)
 */
router.put('/profile/experiences/:experienceId', validateExperience, addExperience);

/**
 * @route   POST /api/student/project
 * @desc    Add project
 * @access  Private (Student only)
 */
router.post('/project', validateProject, addProject);

/**
 * @route   POST /api/student/profile/projects
 * @desc    Add project (alternative route for tests)
 * @access  Private (Student only)
 */
router.post('/profile/projects', validateProject, addProject);

/**
 * @route   GET /api/student/metrics
 * @desc    Get student metrics and breakdown
 * @access  Private (Student only)
 */
router.get('/metrics', getMetrics);

/**
 * @route   POST /api/student/metrics/compute
 * @desc    Manually recalculate student metrics
 * @access  Private (Student only)
 */
router.post('/metrics/compute', recalculateMetrics);

/**
 * @route   GET /api/student/completion
 * @desc    Get profile completion status
 * @access  Private (Student only)
 */
router.get('/completion', getProfileCompletion);

/**
 * @route   POST /api/student/recalculate-metrics
 * @desc    Manually recalculate student metrics
 * @access  Private (Student only)
 */
router.post('/recalculate-metrics', recalculateMetrics);

export default router;