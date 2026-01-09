/**
 * Dashboard Routes
 * Role-based dashboard endpoints
 */

import { Router } from 'express';
import { authenticateToken, requireStudent, requireCompany, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/dashboard/student
 * @desc    Student dashboard
 * @access  Private (Student only)
 */
router.get('/student', authenticateToken, requireStudent, (req, res) => {
  res.json({
    success: true,
    message: 'Student dashboard',
    data: {
      user: req.user,
      dashboard: 'student',
      features: [
        'Profile Management',
        'Skill Assessment',
        'Job Matching',
        'Application Tracking'
      ]
    }
  });
});

/**
 * @route   GET /api/dashboard/company
 * @desc    Company dashboard
 * @access  Private (Company only)
 */
router.get('/company', authenticateToken, requireCompany, (req, res) => {
  res.json({
    success: true,
    message: 'Company dashboard',
    data: {
      user: req.user,
      dashboard: 'company',
      features: [
        'Job Posting',
        'Candidate Search',
        'Application Management',
        'Interview Scheduling'
      ]
    }
  });
});

/**
 * @route   GET /api/dashboard/admin
 * @desc    Admin dashboard
 * @access  Private (Admin only)
 */
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard',
    data: {
      user: req.user,
      dashboard: 'admin',
      features: [
        'User Management',
        'System Analytics',
        'Content Moderation',
        'Platform Configuration'
      ]
    }
  });
});

export default router;