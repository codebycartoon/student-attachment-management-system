const express = require('express');
const {
  getDashboardStats,
  getUserActivity,
  getApplicationTrends,
  getTopCompanies,
  getIndustryAnalytics,
  getLocationAnalytics,
  getStudentAnalytics,
  getAllUsers,
  getSystemHealth,
  exportData,
  updateUserStatus,
  getAnalyticsSummary
} = require('../controllers/adminController');

const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Dashboard and Analytics
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/summary', getAnalyticsSummary);

// User Analytics
router.get('/analytics/users/activity', getUserActivity);
router.get('/analytics/users/all', getAllUsers);
router.get('/analytics/students', getStudentAnalytics);

// Application Analytics
router.get('/analytics/applications/trends', getApplicationTrends);

// Company Analytics
router.get('/analytics/companies/top', getTopCompanies);
router.get('/analytics/companies/industry', getIndustryAnalytics);
router.get('/analytics/companies/location', getLocationAnalytics);

// System Management
router.get('/system/health', getSystemHealth);

// Data Export
router.get('/export/:type', exportData);

// User Management
router.patch('/users/:userId/status', updateUserStatus);

module.exports = router;