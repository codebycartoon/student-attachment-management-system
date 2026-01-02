const express = require('express');
const {
  createApplication,
  getStudentApplications,
  getOpportunityApplications,
  updateApplicationStatus,
  getApplicationById,
  withdrawApplication,
  getCompanyApplicationsByStatus,
  getApplicationStats
} = require('../controllers/applicationController');

const {
  requireAuth,
  requireCompany,
  requireStudent,
  requireAdmin,
  requireStudentOrCompany
} = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/', requireStudent, createApplication);
router.get('/my', requireStudent, getStudentApplications);
router.delete('/:id', requireStudent, withdrawApplication);

// Company routes
router.get('/opportunity/:opportunity_id', requireCompany, getOpportunityApplications);
router.patch('/:application_id/opportunity/:opportunity_id/status', requireCompany, updateApplicationStatus);
router.get('/company/status/:status', requireCompany, getCompanyApplicationsByStatus);

// Shared routes (students and companies can view application details)
router.get('/:id', requireStudentOrCompany, getApplicationById);

// Admin routes
router.get('/admin/stats', requireAdmin, getApplicationStats);

module.exports = router;