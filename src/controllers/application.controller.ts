import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { applicationService } from '../services/application.service';
import { companyService } from '../services/company.service';
import { opportunityService } from '../services/opportunity.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateApplicationStatusSchema = z.object({
  status: z.enum(['IN_REVIEW', 'ACCEPTED', 'REJECTED']),
  reviewNotes: z.string().optional(),
});

const bulkUpdateApplicationsSchema = z.object({
  applicationIds: z.array(z.string()),
  status: z.enum(['IN_REVIEW', 'ACCEPTED', 'REJECTED']),
  reviewNotes: z.string().optional(),
});

const applicationFiltersSchema = z.object({
  status: z.enum(['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED']).optional(),
  minMatchScore: z.number().min(0).max(100).optional(),
  maxMatchScore: z.number().min(0).max(100).optional(),
  minGPA: z.number().min(0).max(4).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['appliedAt', 'matchScore', 'hireabilityScore', 'gpa']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// ============================================================================
// APPLICATION MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Get applications for an opportunity
 * GET /api/v1/company/opportunities/:opportunityId/applications
 */
export const getOpportunityApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { opportunityId } = req.params;
    
    // Parse and validate query parameters
    const filters = applicationFiltersSchema.parse({
      status: req.query.status,
      minMatchScore: req.query.minMatchScore ? parseFloat(req.query.minMatchScore as string) : undefined,
      maxMatchScore: req.query.maxMatchScore ? parseFloat(req.query.maxMatchScore as string) : undefined,
      minGPA: req.query.minGPA ? parseFloat(req.query.minGPA as string) : undefined,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify opportunity ownership
    const isOwner = await opportunityService.verifyOpportunityOwnership(opportunityId, company.companyId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await applicationService.getOpportunityApplications(opportunityId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filters', details: error.errors });
    }
    logger.error('Error fetching opportunity applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

/**
 * Get single application details
 * GET /api/v1/company/applications/:applicationId
 */
export const getApplication = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { applicationId } = req.params;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const application = await applicationService.getApplication(applicationId);

    // Verify opportunity ownership
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    logger.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
};

/**
 * Update application status
 * PUT /api/v1/company/applications/:applicationId/status
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { applicationId } = req.params;
    const validatedData = updateApplicationStatusSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get application to verify ownership
    const application = await applicationService.getApplication(applicationId);

    // Verify opportunity ownership
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify user has permission to review applications
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedApplication = await applicationService.updateApplicationStatus(
      applicationId,
      validatedData,
      userId
    );

    res.json({
      success: true,
      data: updatedApplication,
      message: `Application ${validatedData.status.toLowerCase().replace('_', ' ')} successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

/**
 * Bulk update application statuses
 * PUT /api/v1/company/applications/bulk-update
 */
export const bulkUpdateApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = bulkUpdateApplicationsSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify user has permission to review applications
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Verify all applications belong to company's opportunities
    for (const applicationId of validatedData.applicationIds) {
      const application = await applicationService.getApplication(applicationId);
      const isOwner = await opportunityService.verifyOpportunityOwnership(
        application.opportunityId, 
        company.companyId
      );
      if (!isOwner) {
        return res.status(403).json({ 
          error: 'Access denied', 
          details: `Application ${applicationId} does not belong to your company` 
        });
      }
    }

    const result = await applicationService.bulkUpdateApplications(
      validatedData.applicationIds,
      {
        status: validatedData.status,
        reviewNotes: validatedData.reviewNotes,
      },
      userId
    );

    res.json({
      success: true,
      data: result,
      message: `${result.updatedCount} applications updated successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error bulk updating applications:', error);
    res.status(500).json({ error: 'Failed to update applications' });
  }
};

/**
 * Get company application statistics
 * GET /api/v1/company/applications/stats
 */
export const getCompanyApplicationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { timeframe } = req.query;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify access
    const hasAccess = await companyService.verifyCompanyAccess(company.companyId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await applicationService.getCompanyApplicationStats(
      company.companyId,
      timeframe as string
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching company application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
};

/**
 * Get applications by company (across all opportunities)
 * GET /api/v1/company/applications
 */
export const getCompanyApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      status,
      opportunityId,
      minMatchScore,
      search,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify access
    const hasAccess = await companyService.verifyCompanyAccess(company.companyId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all company opportunities
    const opportunities = await opportunityService.getCompanyOpportunities(company.companyId, {});
    const opportunityIds = opportunities.opportunities.map((opp: any) => opp.opportunityId);

    if (opportunityIds.length === 0) {
      return res.json({
        success: true,
        data: {
          applications: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
          stats: { total: 0, byStatus: {}, averageMatchScore: 0, averageHireabilityScore: 0 },
        },
      });
    }

    // Build filters for specific opportunity if requested
    const filters = {
      status: status as any,
      minMatchScore: minMatchScore ? parseFloat(minMatchScore as string) : undefined,
      search: search as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    // If specific opportunity requested, use that; otherwise get from all opportunities
    const targetOpportunityId = opportunityId as string || opportunityIds[0];
    
    const result = await applicationService.getOpportunityApplications(targetOpportunityId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching company applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

/**
 * Export applications data
 * GET /api/v1/company/opportunities/:opportunityId/applications/export
 */
export const exportApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { opportunityId } = req.params;
    const { format = 'csv' } = req.query;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify opportunity ownership
    const isOwner = await opportunityService.verifyOpportunityOwnership(opportunityId, company.companyId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all applications for export
    const result = await applicationService.getOpportunityApplications(opportunityId, {
      limit: 1000, // Large limit for export
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Application ID',
        'Student Name',
        'Email',
        'University',
        'Major',
        'GPA',
        'Match Score',
        'Hireability Score',
        'Status',
        'Applied Date',
      ];

      const csvRows = result.applications.map((app: any) => [
        app.applicationId,
        `${app.student.firstName} ${app.student.lastName}`,
        app.student.user?.email || '',
        app.student.profile?.university?.name || '',
        app.student.profile?.major?.name || '',
        app.student.profile?.gpa || '',
        app.matchScore || '',
        app.student.metrics?.hireabilityScore || '',
        app.status,
        new Date(app.appliedAt).toISOString().split('T')[0],
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="applications_${opportunityId}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: result.applications,
        exportedAt: new Date(),
        format: 'json',
      });
    }
  } catch (error) {
    logger.error('Error exporting applications:', error);
    res.status(500).json({ error: 'Failed to export applications' });
  }
};