/**
 * Interview Controller
 * Handles interview scheduling, management, and tracking
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { interviewService } from '../services/interview.service';
import { InterviewType, InterviewStatus } from '@prisma/client';

// Validation schemas
const scheduleInterviewSchema = z.object({
  applicationId: z.string().cuid(),
  interviewType: z.enum(['ONLINE', 'ONSITE', 'PHONE', 'VIDEO']),
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  interviewer: z.string().max(100).optional(),
  interviewerEmail: z.string().email().optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().max(200).optional()
});

const updateInterviewSchema = z.object({
  scheduledDate: z.string().datetime().optional(),
  scheduledTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(15).max(480).optional(),
  interviewer: z.string().max(100).optional(),
  interviewerEmail: z.string().email().optional(),
  meetingLink: z.string().url().optional(),
  location: z.string().max(200).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  feedback: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional()
});

/**
 * Schedule a new interview
 */
export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Only companies and admins can schedule interviews
    if (req.user.role !== 'COMPANY' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only companies can schedule interviews'
      });
    }

    const validatedData = scheduleInterviewSchema.parse(req.body);

    const interview = await interviewService.scheduleInterview({
      ...validatedData,
      scheduledDate: new Date(validatedData.scheduledDate)
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule interview'
    });
  }
};

/**
 * Update interview details
 */
export const updateInterview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { interviewId } = req.params;
    const validatedData = updateInterviewSchema.parse(req.body);

    const updateData = {
      ...validatedData,
      ...(validatedData.scheduledDate && { scheduledDate: new Date(validatedData.scheduledDate) })
    };

    const interview = await interviewService.updateInterview(interviewId, updateData);

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Update interview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update interview'
    });
  }
};

/**
 * Cancel interview
 */
export const cancelInterview = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { interviewId } = req.params;
    const { reason } = req.body;

    const interview = await interviewService.cancelInterview(interviewId, reason);

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: interview
    });

  } catch (error: any) {
    console.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel interview'
    });
  }
};

/**
 * Get student interviews
 */
export const getStudentInterviews = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { studentId } = req.params;
    const { status } = req.query;

    // Students can only view their own interviews
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

    const interviews = await interviewService.getStudentInterviews(
      studentId,
      status as InterviewStatus
    );

    res.json({
      success: true,
      data: interviews
    });

  } catch (error: any) {
    console.error('Get student interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interviews'
    });
  }
};

/**
 * Get company interviews
 */
export const getCompanyInterviews = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { companyId } = req.params;
    const { status } = req.query;

    // Companies can only view their own interviews
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

    const interviews = await interviewService.getCompanyInterviews(
      companyId,
      status as InterviewStatus
    );

    res.json({
      success: true,
      data: interviews
    });

  } catch (error: any) {
    console.error('Get company interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interviews'
    });
  }
};

/**
 * Get interview details
 */
export const getInterviewDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { interviewId } = req.params;

    const interview = await interviewService.getInterviewDetails(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'STUDENT') {
      if (interview.application.student.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'COMPANY') {
      if (interview.application.opportunity.company.userId !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: interview
    });

  } catch (error: any) {
    console.error('Get interview details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview details'
    });
  }
};

/**
 * Get upcoming interviews for current user
 */
export const getUpcomingInterviews = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const interviews = await interviewService.getUpcomingInterviews(
      req.user.userId,
      req.user.role
    );

    res.json({
      success: true,
      data: interviews
    });

  } catch (error: any) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming interviews'
    });
  }
};

/**
 * Get interview statistics
 */
export const getInterviewStats = async (req: Request, res: Response) => {
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

    const stats = await interviewService.getInterviewStats(companyId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Get interview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interview statistics'
    });
  }
};

/**
 * Student responds to interview invitation
 */
export const respondToInterview = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can respond to interview invitations'
      });
    }

    const { interviewId } = req.params;
    const { response, message } = req.body; // response: 'accept' | 'decline'

    if (!['accept', 'decline'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Response must be either "accept" or "decline"'
      });
    }

    // Get interview details to verify student access
    const interview = await interviewService.getInterviewDetails(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.application.student.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (response === 'decline') {
      // Cancel the interview if student declines
      const updatedInterview = await interviewService.cancelInterview(
        interviewId,
        message || 'Student declined interview invitation'
      );

      res.json({
        success: true,
        message: 'Interview invitation declined',
        data: updatedInterview
      });
    } else {
      // If accepting, just send a confirmation (interview remains scheduled)
      res.json({
        success: true,
        message: 'Interview invitation accepted',
        data: interview
      });
    }

  } catch (error: any) {
    console.error('Respond to interview error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to interview'
    });
  }
};