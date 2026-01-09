import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { interviewService } from '../services/interview.service';
import { companyService } from '../services/company.service';
import { applicationService } from '../services/application.service';
import { opportunityService } from '../services/opportunity.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const scheduleInterviewSchema = z.object({
  applicationId: z.string(),
  interviewType: z.enum(['ONLINE', 'ONSITE', 'PHONE', 'VIDEO']),
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().optional(),
  duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  interviewer: z.string().optional(),
  interviewerEmail: z.string().email().optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
});

const updateInterviewSchema = z.object({
  scheduledDate: z.string().datetime().optional(),
  scheduledTime: z.string().optional(),
  duration: z.number().min(15).max(480).optional(),
  interviewer: z.string().optional(),
  interviewerEmail: z.string().email().optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
});

const addFeedbackSchema = z.object({
  feedback: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
});

const interviewFiltersSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  interviewType: z.enum(['ONLINE', 'ONSITE', 'PHONE', 'VIDEO']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  interviewer: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// ============================================================================
// INTERVIEW MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Schedule new interview
 * POST /api/v1/company/interviews
 */
export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = scheduleInterviewSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify user has permission to schedule interviews
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Verify application belongs to company
    const application = await applicationService.getApplication(validatedData.applicationId);
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const interviewData = {
      ...validatedData,
      scheduledDate: new Date(validatedData.scheduledDate),
    };

    const interview = await interviewService.scheduleInterview(interviewData, userId);

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview scheduled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
};

/**
 * Get company interviews
 * GET /api/v1/company/interviews
 */
export const getCompanyInterviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Parse and validate query parameters
    const filters = interviewFiltersSchema.parse({
      status: req.query.status,
      interviewType: req.query.interviewType,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      interviewer: req.query.interviewer,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    // Convert date strings to Date objects
    const processedFilters = {
      ...filters,
      ...(filters.dateFrom && { dateFrom: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { dateTo: new Date(filters.dateTo) }),
    };

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

    const result = await interviewService.getCompanyInterviews(company.companyId, processedFilters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filters', details: error.errors });
    }
    logger.error('Error fetching company interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

/**
 * Get single interview details
 * GET /api/v1/company/interviews/:interviewId
 */
export const getInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const interview = await interviewService.getInterview(interviewId);

    // Verify interview belongs to company
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      interview.application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    logger.error('Error fetching interview:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

/**
 * Update interview details
 * PUT /api/v1/company/interviews/:interviewId
 */
export const updateInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    const validatedData = updateInterviewSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify user has permission to update interviews
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get interview to verify ownership
    const interview = await interviewService.getInterview(interviewId);
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      interview.application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      ...validatedData,
      ...(validatedData.scheduledDate && {
        scheduledDate: new Date(validatedData.scheduledDate),
      }),
    };

    const updatedInterview = await interviewService.updateInterview(interviewId, updateData);

    res.json({
      success: true,
      data: updatedInterview,
      message: 'Interview updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating interview:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

/**
 * Cancel interview
 * POST /api/v1/company/interviews/:interviewId/cancel
 */
export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    const { reason } = req.body;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify user has permission to cancel interviews
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get interview to verify ownership
    const interview = await interviewService.getInterview(interviewId);
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      interview.application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cancelledInterview = await interviewService.cancelInterview(interviewId, reason);

    res.json({
      success: true,
      data: cancelledInterview,
      message: 'Interview cancelled successfully',
    });
  } catch (error) {
    logger.error('Error cancelling interview:', error);
    res.status(500).json({ error: 'Failed to cancel interview' });
  }
};

/**
 * Add interview feedback
 * POST /api/v1/company/interviews/:interviewId/feedback
 */
export const addInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { interviewId } = req.params;
    const validatedData = addFeedbackSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify user has permission to add feedback
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER' && userRole !== 'RECRUITER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get interview to verify ownership
    const interview = await interviewService.getInterview(interviewId);
    const isOwner = await opportunityService.verifyOpportunityOwnership(
      interview.application.opportunityId, 
      company.companyId
    );
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedInterview = await interviewService.addInterviewFeedback(interviewId, validatedData);

    res.json({
      success: true,
      data: updatedInterview,
      message: 'Interview feedback added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding interview feedback:', error);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
};

/**
 * Get interview statistics for company
 * GET /api/v1/company/interviews/stats
 */
export const getCompanyInterviewStats = async (req: Request, res: Response) => {
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

    const stats = await interviewService.getCompanyInterviewStats(
      company.companyId,
      timeframe as string
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching company interview stats:', error);
    res.status(500).json({ error: 'Failed to fetch interview statistics' });
  }
};

/**
 * Get upcoming interviews for company
 * GET /api/v1/company/interviews/upcoming
 */
export const getUpcomingInterviews = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { limit = '10' } = req.query;

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

    const filters = {
      status: 'SCHEDULED' as const,
      dateFrom: new Date(),
      limit: parseInt(limit as string),
    };

    const result = await interviewService.getCompanyInterviews(company.companyId, filters);

    res.json({
      success: true,
      data: {
        interviews: result.interviews,
        total: result.pagination.total,
      },
    });
  } catch (error) {
    logger.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' });
  }
};