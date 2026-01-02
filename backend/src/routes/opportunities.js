const express = require('express');
const {
  createOpportunity,
  getActiveOpportunities,
  getCompanyOpportunities,
  getOpportunityById,
  updateOpportunity,
  closeOpportunity,
  searchOpportunities,
  getOpportunityStats
} = require('../controllers/opportunityController');

const {
  requireAuth,
  requireCompany,
  requireStudent,
  requireAdmin
} = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/active', getActiveOpportunities);
router.get('/search', searchOpportunities);
router.get('/:id', getOpportunityById);

// Company routes
router.post('/', requireCompany, createOpportunity);
router.get('/company/my', requireCompany, getCompanyOpportunities);
router.put('/:id', requireCompany, updateOpportunity);
router.patch('/:id/close', requireCompany, closeOpportunity);

// Admin routes
router.get('/admin/stats', requireAdmin, getOpportunityStats);

module.exports = router;