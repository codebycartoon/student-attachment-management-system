import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

// Company Controllers
import {
  getCompanyProfile,
  updateCompanyProfile,
  updateCompanyExtendedProfile,
  getCompanyOverview,
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from '../controllers/company.controller';

// Opportunity Controllers
import {
  getCompanyOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  addOpportunitySkills,
  publishOpportunity,
  closeOpportunity,
  getOpportunityCandidates,
  getOpportunityAnalytics,
} from '../controllers/opportunity.controller';

// Application Controllers
import {
  getOpportunityApplications,
  getApplication,
  updateApplicationStatus,
  bulkUpdateApplications,
  getCompanyApplicationStats,
  getCompanyApplications,
  exportApplications,
} from '../controllers/application.controller';

// Interview Controllers
import {
  scheduleInterview,
  getCompanyInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
  addInterviewFeedback,
  getCompanyInterviewStats,
  getUpcomingInterviews,
} from '../controllers/interview.controller';

// Reporting Controllers
import {
  getCompanyDashboardMetrics,
  getOpportunityReport,
  getCompanyPerformance,
  getHiringFunnelAnalytics,
  getCandidateQualityInsights,
  exportCompanyReport,
} from '../controllers/reporting.controller';

const router = Router();

// Apply authentication to all company routes
router.use(authenticateToken);

// ============================================================================
// COMPANY PROFILE ROUTES
// ============================================================================

/**
 * @route GET /api/v1/company/profile
 * @desc Get company profile with all related data
 * @access Company users only
 */
router.get('/profile', getCompanyProfile);

/**
 * @route PUT /api/v1/company/profile
 * @desc Update company basic profile
 * @access Company users only
 */
router.put('/profile', updateCompanyProfile);

/**
 * @route PUT /api/v1/company/profile/extended
 * @desc Update company extended profile
 * @access Company users only
 */
router.put('/profile/extended', updateCompanyExtendedProfile);

/**
 * @route GET /api/v1/company/overview
 * @desc Get company dashboard overview
 * @access Company users only
 */
router.get('/overview', getCompanyOverview);

// ============================================================================
// TEAM MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/company/team
 * @desc Get company team members
 * @access Company users only
 */
router.get('/team', getTeamMembers);

/**
 * @route POST /api/v1/company/team
 * @desc Add team member to company
 * @access Company admin/owner only
 */
router.post('/team', addTeamMember);

/**
 * @route PUT /api/v1/company/team/:userId
 * @desc Update team member role
 * @access Company admin/owner only
 */
router.put('/team/:userId', updateTeamMember);

/**
 * @route DELETE /api/v1/company/team/:userId
 * @desc Remove team member from company
 * @access Company admin/owner only
 */
router.delete('/team/:userId', removeTeamMember);

// ============================================================================
// OPPORTUNITY MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/company/opportunities
 * @desc Get company opportunities with filtering
 * @access Company users only
 * @query status, industry, jobType, search, page, limit
 */
router.get('/opportunities', getCompanyOpportunities);

/**
 * @route GET /api/v1/company/opportunities/:id
 * @desc Get single opportunity details
 * @access Company users only
 */
router.get('/opportunities/:id', getOpportunity);

/**
 * @route POST /api/v1/company/opportunities
 * @desc Create new opportunity
 * @access Company admin/manager only
 */
router.post('/opportunities', createOpportunity);

/**
 * @route PUT /api/v1/company/opportunities/:id
 * @desc Update opportunity
 * @access Company admin/manager only
 */
router.put('/opportunities/:id', updateOpportunity);

/**
 * @route DELETE /api/v1/company/opportunities/:id
 * @desc Delete opportunity
 * @access Company admin/manager only
 */
router.delete('/opportunities/:id', deleteOpportunity);

/**
 * @route POST /api/v1/company/opportunities/:id/skills
 * @desc Add skills to opportunity
 * @access Company admin/manager only
 */
router.post('/opportunities/:id/skills', addOpportunitySkills);

/**
 * @route POST /api/v1/company/opportunities/:id/publish
 * @desc Publish opportunity (submit for approval)
 * @access Company admin/manager only
 */
router.post('/opportunities/:id/publish', publishOpportunity);

/**
 * @route POST /api/v1/company/opportunities/:id/close
 * @desc Close opportunity
 * @access Company admin/manager only
 */
router.post('/opportunities/:id/close', closeOpportunity);

/**
 * @route GET /api/v1/company/opportunities/:id/candidates
 * @desc Get opportunity candidates with match scores
 * @access Company users only
 * @query minMatchScore, minGPA, location, limit
 */
router.get('/opportunities/:id/candidates', getOpportunityCandidates);

/**
 * @route GET /api/v1/company/opportunities/:id/analytics
 * @desc Get opportunity analytics
 * @access Company users only
 */
router.get('/opportunities/:id/analytics', getOpportunityAnalytics);

// ============================================================================
// APPLICATION MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /api/v1/company/opportunities/:opportunityId/applications
 * @desc Get applications for an opportunity
 * @access Company users only
 * @query status, minMatchScore, maxMatchScore, minGPA, search, sortBy, sortOrder, page, limit
 */
router.get('/opportunities/:opportunityId/applications', getOpportunityApplications);

/**
 * @route GET /api/v1/company/applications
 * @desc Get all company applications across opportunities
 * @access Company users only
 * @query status, opportunityId, minMatchScore, search, sortBy, sortOrder, page, limit
 */
router.get('/applications', getCompanyApplications);

/**
 * @route GET /api/v1/company/applications/:applicationId
 * @desc Get single application details
 * @access Company users only
 */
router.get('/applications/:applicationId', getApplication);

/**
 * @route PUT /api/v1/company/applications/:applicationId/status
 * @desc Update application status
 * @access Company recruiters and above
 */
router.put('/applications/:applicationId/status', updateApplicationStatus);

/**
 * @route PUT /api/v1/company/applications/bulk-update
 * @desc Bulk update application statuses
 * @access Company recruiters and above
 */
router.put('/applications/bulk-update', bulkUpdateApplications);

/**
 * @route GET /api/v1/company/applications/stats
 * @desc Get company application statistics
 * @access Company users only
 * @query timeframe
 */
router.get('/applications/stats', getCompanyApplicationStats);

/**
 * @route GET /api/v1/company/opportunities/:opportunityId/applications/export
 * @desc Export applications data
 * @access Company users only
 * @query format (csv, json)
 */
router.get('/opportunities/:opportunityId/applications/export', exportApplications);

// ============================================================================
// INTERVIEW MANAGEMENT ROUTES
// ============================================================================

/**
 * @route POST /api/v1/company/interviews
 * @desc Schedule new interview
 * @access Company recruiters and above
 */
router.post('/interviews', scheduleInterview);

/**
 * @route GET /api/v1/company/interviews
 * @desc Get company interviews with filtering
 * @access Company users only
 * @query status, interviewType, dateFrom, dateTo, interviewer, page, limit
 */
router.get('/interviews', getCompanyInterviews);

/**
 * @route GET /api/v1/company/interviews/upcoming
 * @desc Get upcoming interviews
 * @access Company users only
 * @query limit
 */
router.get('/interviews/upcoming', getUpcomingInterviews);

/**
 * @route GET /api/v1/company/interviews/stats
 * @desc Get interview statistics
 * @access Company users only
 * @query timeframe
 */
router.get('/interviews/stats', getCompanyInterviewStats);

/**
 * @route GET /api/v1/company/interviews/:interviewId
 * @desc Get single interview details
 * @access Company users only
 */
router.get('/interviews/:interviewId', getInterview);

/**
 * @route PUT /api/v1/company/interviews/:interviewId
 * @desc Update interview details
 * @access Company recruiters and above
 */
router.put('/interviews/:interviewId', updateInterview);

/**
 * @route POST /api/v1/company/interviews/:interviewId/cancel
 * @desc Cancel interview
 * @access Company recruiters and above
 */
router.post('/interviews/:interviewId/cancel', cancelInterview);

/**
 * @route POST /api/v1/company/interviews/:interviewId/feedback
 * @desc Add interview feedback
 * @access Company recruiters and above
 */
router.post('/interviews/:interviewId/feedback', addInterviewFeedback);

// ============================================================================
// ANALYTICS & REPORTING ROUTES
// ============================================================================

/**
 * @route GET /api/v1/company/reports/dashboard
 * @desc Get company dashboard metrics
 * @access Company users only
 * @query timeframe, opportunityId, dateFrom, dateTo
 */
router.get('/reports/dashboard', getCompanyDashboardMetrics);

/**
 * @route GET /api/v1/company/reports/performance
 * @desc Get company performance overview
 * @access Company users only
 * @query timeframe
 */
router.get('/reports/performance', getCompanyPerformance);

/**
 * @route GET /api/v1/company/reports/hiring-funnel
 * @desc Get hiring funnel analytics
 * @access Company users only
 * @query timeframe, opportunityId
 */
router.get('/reports/hiring-funnel', getHiringFunnelAnalytics);

/**
 * @route GET /api/v1/company/reports/candidate-quality
 * @desc Get candidate quality insights
 * @access Company users only
 * @query timeframe
 */
router.get('/reports/candidate-quality', getCandidateQualityInsights);

/**
 * @route GET /api/v1/company/reports/opportunities/:opportunityId
 * @desc Get detailed opportunity report
 * @access Company users only
 */
router.get('/reports/opportunities/:opportunityId', getOpportunityReport);

/**
 * @route GET /api/v1/company/reports/export
 * @desc Export company report
 * @access Company users only
 * @query format (csv, json), timeframe
 */
router.get('/reports/export', exportCompanyReport);

export default router;