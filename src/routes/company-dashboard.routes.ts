import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  getCompanyDashboard,
  searchCandidates,
  getCandidateDetails,
  performBulkAction,
  getCompanyAnalytics,
  getCompanyNotifications,
  markCompanyNotificationRead,
} from '../controllers/company-dashboard.controller';

const router = Router();

// ============================================================================
// COMPANY DASHBOARD ROUTES
// ============================================================================

// Get company dashboard overview
router.get('/:id/dashboard', authenticateToken, requireRole('COMPANY', 'ADMIN'), getCompanyDashboard);

// Search and filter candidates
router.get('/:id/candidates', authenticateToken, requireRole('COMPANY', 'ADMIN'), searchCandidates);

// Get detailed candidate information
router.get('/:id/candidates/:studentId', authenticateToken, requireRole('COMPANY', 'ADMIN'), getCandidateDetails);

// Perform bulk actions on candidates
router.post('/:id/candidates/bulk', authenticateToken, requireRole('COMPANY', 'ADMIN'), performBulkAction);

// Get company analytics
router.get('/:id/analytics', authenticateToken, requireRole('COMPANY', 'ADMIN'), getCompanyAnalytics);

// Get company notifications
router.get('/:id/notifications', authenticateToken, requireRole('COMPANY', 'ADMIN'), getCompanyNotifications);

// Mark company notification as read
router.patch('/:id/notifications/:notificationId/read', authenticateToken, requireRole('COMPANY', 'ADMIN'), markCompanyNotificationRead);

export default router;