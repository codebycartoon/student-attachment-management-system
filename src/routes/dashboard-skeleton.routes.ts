/**
 * Phase 1 Dashboard Skeleton Routes
 * Role-based dashboard endpoints for frontend integration
 */

import { Router } from 'express';
import { 
  StudentDashboardController,
  CompanyDashboardController,
  AdminDashboardController
} from '../controllers/dashboard-skeleton.controller';
import { 
  authenticateToken,
  requireRole
} from '../middleware/auth';

// Initialize controllers
const studentController = new StudentDashboardController();
const companyController = new CompanyDashboardController();
const adminController = new AdminDashboardController();

// ============================================================================
// STUDENT DASHBOARD ROUTES
// ============================================================================

export const studentRoutes = Router();

// All student routes require authentication and STUDENT role
studentRoutes.use(authenticateToken);
studentRoutes.use(requireRole('STUDENT'));

studentRoutes.get('/overview', studentController.getOverview);
studentRoutes.get('/profile', studentController.getProfile);
studentRoutes.get('/match-readiness', studentController.getMatchReadiness);
studentRoutes.get('/opportunities', studentController.getOpportunities);
studentRoutes.get('/applications', studentController.getApplications);
studentRoutes.get('/interviews', studentController.getInterviews);
studentRoutes.get('/placements', studentController.getPlacements);
studentRoutes.get('/settings', studentController.getSettings);

// ============================================================================
// COMPANY DASHBOARD ROUTES
// ============================================================================

export const companyRoutes = Router();

// All company routes require authentication and COMPANY role
companyRoutes.use(authenticateToken);
companyRoutes.use(requireRole('COMPANY'));

companyRoutes.get('/overview', companyController.getOverview);
companyRoutes.get('/opportunities', companyController.getOpportunities);
companyRoutes.get('/applicants', companyController.getApplicants);
companyRoutes.get('/interviews', companyController.getInterviews);
companyRoutes.get('/reports', companyController.getReports);
companyRoutes.get('/settings', companyController.getSettings);

// ============================================================================
// ADMIN DASHBOARD ROUTES
// ============================================================================

export const adminRoutes = Router();

// All admin routes require authentication and ADMIN role
adminRoutes.use(authenticateToken);
adminRoutes.use(requireRole('ADMIN'));

adminRoutes.get('/overview', adminController.getOverview);
adminRoutes.get('/users', adminController.getUsers);
adminRoutes.get('/opportunities', adminController.getOpportunities);
adminRoutes.get('/applications', adminController.getApplications);
adminRoutes.get('/interviews', adminController.getInterviews);
adminRoutes.get('/reports', adminController.getReports);
adminRoutes.get('/system-health', adminController.getSystemHealth);