/**
 * Placement Controller
 * Handles placement offers, acceptances, and management
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { placementService } from '../services/placement.service';
import { PlacementStatus } from '@prisma/client';

// Validation schemas
const createPlacementOfferSchema = z.object({
  applicationId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  salary: z.number().min(0).optional(),
  currency: z.string().length(3).optional() // ISO currency code
});

const updatePlacementSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED']).optional(),
  salary: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  feedback: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  companyRating: z.number().min(1).max(5).optional()
});

const placementResponseSchema = z.object({
  response: z.enum(['accept', 'decline']),
  reason: z.string().max(500).optional()
});

/**
 * Create placement offer
 */
export const createPlacementOffer = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Only companies and admins can create placement offers
    if (req.user.role !== 'COMPANY' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can create placement offers'
      });
    }

    const validatedData = createPlacementOfferSchema.parse(req.body);

    const placement = await placementService.createPlacementOffer({
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) })
    });

    res.status(201).json({
      success: true,
      message: 'Placement offer created successfully',
      data: placement
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Create placement offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create placement offer'
    });
  }
};

/**
 * Student responds to placement offer
 */
export const respondToPlacementOffer = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can respond to placement offers'
      });
    }

    const { placementId } = req.params;
    const validatedData = placementResponseSchema.parse(req.body);

    // Get student ID
    const student = await req.prisma?.student.findUnique({
      where: { userId: req.user.userId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    let placement;

    if (validatedData.response === 'accept') {
      placement = await placementService.acceptPlacementOffer(placementId, student.studentId);
    } else {
      placement = await placementService.declinePlacementOffer(
        placementId,
        student.studentId,
        validatedData.reason
      );
    }

    res.json({
      success: true,
      message: `Placement offer ${validatedData.response}ed successfully`,
      data: placement
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Respond to placement offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to placement offer'
    });
  }
};

/**
 * Update placement details
 */
export const updatePlacement = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { placementId } = req.params;
    const validatedData = updatePlacementSchema.parse(req.body);

    const updateData = {
      ...validatedData,
      ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
      ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) })
    };

    const placement = await placementService.updatePlacement(placementId, updateData);

    res.json({
      success: true,
      message: 'Placement updated successfully',
      data: placement
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Update placement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update placement'
    });
  }
};

/**
 * Get student placements
 */
export const getStudentPlacements = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { studentId } = req.params;
    const { status } = req.query;

    // Students can only view their own placements
    if (req.user.role === 'STUDENT') {
      const userStudent = await req.prisma?.student.findUnique({
        where: { userId: req.user.userId }
      });

      if (!userStudent || userStudent.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const placements = await placementService.getStudentPlacements(
      studentId,
      status as PlacementStatus
    );

    res.json({
      success: true,
      data: placements
    });

  } catch (error: any) {
    console.error('Get student placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placements'
    });
  }
};

/**
 * Get company placements
 */
export const getCompanyPlacements = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { companyId } = req.params;
    const { status } = req.query;

    // Companies can only view their own placements
    if (req.user.role === 'COMPANY') {
      const userCompany = await req.prisma?.company.findUnique({
        where: { userId: req.user.userId }
      });

      if (!userCompany || userCompany.companyId !== companyId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const placements = await placementService.getCompanyPlacements(
      companyId,
      status as PlacementStatus
    );

    res.json({
      success: true,
      data: placements
    });

  } catch (error: any) {
    console.error('Get company placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placements'
    });
  }
};

/**
 * Get placement details
 */
export const getPlacementDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { placementId } = req.params;

    const placement = await placementService.getPlacementDetails(placementId);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: 'Placement not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'STUDENT') {
      if (placement.application.student.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'COMPANY') {
      if (placement.application.opportunity.company.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: placement
    });

  } catch (error: any) {
    console.error('Get placement details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placement details'
    });
  }
};

/**
 * Complete placement
 */
export const completePlacement = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { placementId } = req.params;
    const { feedback, rating, companyRating } = req.body;

    const placement = await placementService.completePlacement(
      placementId,
      feedback,
      rating,
      companyRating
    );

    res.json({
      success: true,
      message: 'Placement completed successfully',
      data: placement
    });

  } catch (error: any) {
    console.error('Complete placement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete placement'
    });
  }
};

/**
 * Get placement statistics
 */
export const getPlacementStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let companyId: string | undefined;

    // For company users, get their company ID
    if (req.user.role === 'COMPANY') {
      const company = await req.prisma?.company.findUnique({
        where: { userId: req.user.userId }
      });
      companyId = company?.companyId;
    }

    // For admin, companyId can be passed as query parameter
    if (req.user.role === 'ADMIN' && req.query.companyId) {
      companyId = req.query.companyId as string;
    }

    const stats = await placementService.getPlacementStats(companyId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Get placement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placement statistics'
    });
  }
};

/**
 * Get placements ending soon
 */
export const getPlacementsEndingSoon = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let companyId: string | undefined;

    // For company users, get their company ID
    if (req.user.role === 'COMPANY') {
      const company = await req.prisma?.company.findUnique({
        where: { userId: req.user.userId }
      });
      companyId = company?.companyId;
    }

    // For admin, companyId can be passed as query parameter
    if (req.user.role === 'ADMIN' && req.query.companyId) {
      companyId = req.query.companyId as string;
    }

    const placements = await placementService.getPlacementsEndingSoon(companyId);

    res.json({
      success: true,
      data: placements
    });

  } catch (error: any) {
    console.error('Get placements ending soon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placements ending soon'
    });
  }
};

/**
 * Get current user's placements
 */
export const getMyPlacements = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { status } = req.query;
    let placements;

    if (req.user.role === 'STUDENT') {
      const student = await req.prisma?.student.findUnique({
        where: { userId: req.user.userId }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      placements = await placementService.getStudentPlacements(
        student.studentId,
        status as PlacementStatus
      );
    } else if (req.user.role === 'COMPANY') {
      const company = await req.prisma?.company.findUnique({
        where: { userId: req.user.userId }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      placements = await placementService.getCompanyPlacements(
        company.companyId,
        status as PlacementStatus
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: placements
    });

  } catch (error: any) {
    console.error('Get my placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get placements'
    });
  }
};