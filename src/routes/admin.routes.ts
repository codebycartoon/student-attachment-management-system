import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import {
  // User Management
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  
  // Profile Views
  getStudentProfile,
  getCompanyProfile,
  
  // Opportunity Management
  getOpportunities,
  createOpportunity,
  approveOpportunity,
  rejectOpportunity,
  
  // Application Management
  overrideApplicationStatus,
  
  // Metrics & Analytics
  getPlacementMetrics,
  getActiveSessionsMetrics,
  getQueueStatus,
} from '../controllers/admin.controller';

const router = Router();

// Apply authentication and admin role requirement to all routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /admin/users
 * @desc Get all users with filtering and pagination
 * @access Admin only
 * @query page, limit, role, status, search
 */
router.get('/users', getUsers);

/**
 * @route POST /admin/users
 * @desc Create a new user
 * @access Admin only
 * @body { email, password, role, firstName?, lastName?, companyName? }
 */
router.post('/users', createUser);

/**
 * @route PUT /admin/users/:id
 * @desc Update user information
 * @access Admin only
 * @body { email?, status?, firstName?, lastName?, companyName? }
 */
router.put('/users/:id', updateUser);

/**
 * @route DELETE /admin/users/:id
 * @desc Suspend/delete user
 * @access Admin only
 */
router.delete('/users/:id', deleteUser);

// ============================================================================
// DETAILED PROFILE VIEWS
// ============================================================================

/**
 * @route GET /admin/students/:id
 * @desc Get detailed student profile with metrics
 * @access Admin only
 */
router.get('/students/:id', getStudentProfile);

/**
 * @route GET /admin/companies/:id
 * @desc Get detailed company profile with metrics
 * @access Admin only
 */
router.get('/companies/:id', getCompanyProfile);

// ============================================================================
// OPPORTUNITY MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /admin/opportunities
 * @desc Get all opportunities with filtering and pagination
 * @access Admin only
 * @query page, limit, status, companyId, search
 */
router.get('/opportunities', getOpportunities);

/**
 * @route POST /admin/opportunities
 * @desc Create a new opportunity
 * @access Admin only
 * @body { companyId, title, description, location?, industry?, jobTypes, gpaThreshold?, isTechnical?, startDate?, endDate?, applicationDeadline?, salaryMin?, salaryMax?, requirements?, skills? }
 */
router.post('/opportunities', createOpportunity);

/**
 * @route PATCH /admin/opportunities/:id/approve
 * @desc Approve an opportunity
 * @access Admin only
 */
router.patch('/opportunities/:id/approve', approveOpportunity);

/**
 * @route PATCH /admin/opportunities/:id/reject
 * @desc Reject an opportunity
 * @access Admin only
 * @body { reason? }
 */
router.patch('/opportunities/:id/reject', rejectOpportunity);

// ============================================================================
// APPLICATION MANAGEMENT ROUTES
// ============================================================================

/**
 * @route PATCH /admin/applications/:id/override
 * @desc Manually override application status
 * @access Admin only
 * @body { status, reason? }
 */
router.patch('/applications/:id/override', overrideApplicationStatus);

// ============================================================================
// METRICS & ANALYTICS ROUTES
// ============================================================================

/**
 * @route GET /admin/metrics/placements
 * @desc Get placement KPIs and analytics
 * @access Admin only
 * @query startDate?, endDate?
 */
router.get('/metrics/placements', getPlacementMetrics);

/**
 * @route GET /admin/metrics/active_sessions
 * @desc Monitor live user activity and sessions
 * @access Admin only
 */
router.get('/metrics/active_sessions', getActiveSessionsMetrics);

/**
 * @route GET /admin/queues
 * @desc Monitor background task queues
 * @access Admin only
 */
router.get('/queues', getQueueStatus);

export default router;