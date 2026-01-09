import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { opportunityService } from '../services/opportunity.service';
import { companyService } from '../services/company.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  location: z.string().optional(),
  industry: z.string().optional(),
  jobTypes: z.array(z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT', 'FREELANCE'])),
  gpaThreshold: z.number().min(0).max(4).optional(),
  isTechnical: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  applicationDeadline: z.string().datetime().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  benefits: z.array(z.string()).optional(),
  requirements: z.string().optional(),
});

const updateOpportunitySchema = createOpportunitySchema.partial();

const addOpportunitySkillsSchema = z.object({
  skills: z.array(z.object({
    skillId: z.string(),
    skillWeight: z.number().min(1).max(5),
    required: z.boolean().default(false),
  })),
});

// ============================================================================
// OPPORTUNITY MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Get company opportunities
 * GET /api/v1/company/opportunities
 */
export const getCompanyOpportunities = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      status,
      industry,
      jobType,
      search,
      page = '1',
      limit = '10',
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

    const filters = {
      status: status as any,
      industry: industry as string,
      jobType: jobType as any,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await opportunityService.getCompanyOpportunities(company.companyId, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching company opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

/**
 * Get single opportunity
 * GET /api/v1/company/opportunities/:id
 */
export const getOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

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

    const opportunity = await opportunityService.getOpportunity(opportunityId);

    res.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    logger.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
};

/**
 * Create new opportunity
 * POST /api/v1/company/opportunities
 */
export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = createOpportunitySchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Convert date strings to Date objects
    const opportunityData = {
      ...validatedData,
      ...(validatedData.startDate && {
        startDate: new Date(validatedData.startDate),
      }),
      ...(validatedData.endDate && {
        endDate: new Date(validatedData.endDate),
      }),
      ...(validatedData.applicationDeadline && {
        applicationDeadline: new Date(validatedData.applicationDeadline),
      }),
    };

    const opportunity = await opportunityService.createOpportunity(company.companyId, opportunityData);

    res.status(201).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
};

/**
 * Update opportunity
 * PUT /api/v1/company/opportunities/:id
 */
export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;
    const validatedData = updateOpportunitySchema.parse(req.body);

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

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Convert date strings to Date objects
    const updateData = {
      ...validatedData,
      ...(validatedData.startDate && {
        startDate: new Date(validatedData.startDate),
      }),
      ...(validatedData.endDate && {
        endDate: new Date(validatedData.endDate),
      }),
      ...(validatedData.applicationDeadline && {
        applicationDeadline: new Date(validatedData.applicationDeadline),
      }),
    };

    const updatedOpportunity = await opportunityService.updateOpportunity(opportunityId, updateData);

    res.json({
      success: true,
      data: updatedOpportunity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};

/**
 * Delete opportunity
 * DELETE /api/v1/company/opportunities/:id
 */
export const deleteOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

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

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await opportunityService.deleteOpportunity(opportunityId);

    res.json({
      success: true,
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
};

/**
 * Add skills to opportunity
 * POST /api/v1/company/opportunities/:id/skills
 */
export const addOpportunitySkills = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;
    const validatedData = addOpportunitySkillsSchema.parse(req.body);

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

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updatedOpportunity = await opportunityService.addOpportunitySkills(
      opportunityId,
      validatedData.skills
    );

    res.json({
      success: true,
      data: updatedOpportunity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding opportunity skills:', error);
    res.status(500).json({ error: 'Failed to add skills' });
  }
};

/**
 * Publish opportunity (submit for approval)
 * POST /api/v1/company/opportunities/:id/publish
 */
export const publishOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

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

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const publishedOpportunity = await opportunityService.publishOpportunity(opportunityId);

    res.json({
      success: true,
      data: publishedOpportunity,
      message: 'Opportunity submitted for approval',
    });
  } catch (error) {
    logger.error('Error publishing opportunity:', error);
    res.status(500).json({ error: 'Failed to publish opportunity' });
  }
};

/**
 * Close opportunity
 * POST /api/v1/company/opportunities/:id/close
 */
export const closeOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

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

    // Verify access (must be admin or manager)
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const closedOpportunity = await opportunityService.closeOpportunity(opportunityId);

    res.json({
      success: true,
      data: closedOpportunity,
      message: 'Opportunity closed successfully',
    });
  } catch (error) {
    logger.error('Error closing opportunity:', error);
    res.status(500).json({ error: 'Failed to close opportunity' });
  }
};

/**
 * Get opportunity candidates
 * GET /api/v1/company/opportunities/:id/candidates
 */
export const getOpportunityCandidates = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;
    const {
      minMatchScore,
      minGPA,
      location,
      limit = '20',
    } = req.query;

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

    const filters = {
      minMatchScore: minMatchScore ? parseFloat(minMatchScore as string) : undefined,
      minGPA: minGPA ? parseFloat(minGPA as string) : undefined,
      location: location as string,
      limit: parseInt(limit as string),
    };

    const candidates = await opportunityService.getOpportunityCandidates(opportunityId, filters);

    res.json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    logger.error('Error fetching opportunity candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

/**
 * Get opportunity analytics
 * GET /api/v1/company/opportunities/:id/analytics
 */
export const getOpportunityAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id: opportunityId } = req.params;

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

    const analytics = await opportunityService.getOpportunityAnalytics(opportunityId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error fetching opportunity analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};