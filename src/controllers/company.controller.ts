import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { companyService } from '../services/company.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateCompanyProfileSchema = z.object({
  companyName: z.string().min(1).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  logoPath: z.string().optional(),
});

const updateCompanyExtendedProfileSchema = z.object({
  phone: z.string().optional(),
  employeeCount: z.string().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  headquarters: z.string().optional(),
  companyType: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  culture: z.string().optional(),
});

const addTeamMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'RECRUITER']),
});

const updateTeamMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'RECRUITER']),
});

// ============================================================================
// COMPANY PROFILE CONTROLLERS
// ============================================================================

/**
 * Get company profile with all related data
 * GET /api/v1/company/profile
 */
export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const profile = await companyService.getCompanyProfile(company.companyId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

/**
 * Update company basic profile
 * PUT /api/v1/company/profile
 */
export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = updateCompanyProfileSchema.parse(req.body);

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

    const updatedCompany = await companyService.updateCompanyProfile(
      company.companyId,
      validatedData
    );

    res.json({
      success: true,
      data: updatedCompany,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating company profile:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
};

/**
 * Update company extended profile
 * PUT /api/v1/company/profile/extended
 */
export const updateCompanyExtendedProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = updateCompanyExtendedProfileSchema.parse(req.body);

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

    const updatedProfile = await companyService.updateCompanyExtendedProfile(
      company.companyId,
      validatedData
    );

    res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating company extended profile:', error);
    res.status(500).json({ error: 'Failed to update extended profile' });
  }
};

/**
 * Get company dashboard overview
 * GET /api/v1/company/overview
 */
export const getCompanyOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

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

    const overview = await companyService.getCompanyOverview(company.companyId);

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    logger.error('Error fetching company overview:', error);
    res.status(500).json({ error: 'Failed to fetch company overview' });
  }
};

// ============================================================================
// TEAM MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * Get company team members
 * GET /api/v1/company/team
 */
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

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

    const teamMembers = await companyService.getTeamMembers(company.companyId);

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    logger.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

/**
 * Add team member to company
 * POST /api/v1/company/team
 */
export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = addTeamMemberSchema.parse(req.body);

    // Find company for this user
    const company = await companyService.getCompanyByUserId(userId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify admin access
    const userRole = await companyService.getCompanyRole(company.companyId, userId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const teamMember = await companyService.addTeamMember(company.companyId, {
      ...validatedData,
      invitedBy: userId,
    });

    res.status(201).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
};

/**
 * Update team member role
 * PUT /api/v1/company/team/:userId
 */
export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { userId: targetUserId } = req.params;
    const validatedData = updateTeamMemberSchema.parse(req.body);

    // Find company for current user
    const company = await companyService.getCompanyByUserId(currentUserId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify admin access
    const userRole = await companyService.getCompanyRole(company.companyId, currentUserId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updatedTeamMember = await companyService.updateTeamMember(
      company.companyId,
      targetUserId,
      validatedData.role
    );

    res.json({
      success: true,
      data: updatedTeamMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
};

/**
 * Remove team member from company
 * DELETE /api/v1/company/team/:userId
 */
export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { userId: targetUserId } = req.params;

    // Find company for current user
    const company = await companyService.getCompanyByUserId(currentUserId);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Verify admin access
    const userRole = await companyService.getCompanyRole(company.companyId, currentUserId);
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await companyService.removeTeamMember(company.companyId, targetUserId);

    res.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    logger.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to get company by user ID
 * This should be added to the company service
 */
declare module '../services/company.service' {
  interface CompanyService {
    getCompanyByUserId(userId: string): Promise<any>;
  }
}