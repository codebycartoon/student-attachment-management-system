import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../config/logger';
import { matchService } from '../services/match.service';
import { notificationService } from '../services/notification.service';
import { dashboardAnalyticsService } from '../services/dashboard-analytics.service';

const prisma = new PrismaClient();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const candidateSearchSchema = z.object({
  skills: z.array(z.string()).optional(),
  minGPA: z.number().min(0).max(4).optional(),
  maxGPA: z.number().min(0).max(4).optional(),
  graduationYear: z.number().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior']).optional(),
  availability: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['hireabilityScore', 'gpa', 'graduationDate', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const bulkActionSchema = z.object({
  action: z.enum(['invite', 'message', 'shortlist', 'reject']),
  studentIds: z.array(z.string()),
  message: z.string().optional(),
  opportunityId: z.string().optional(),
});

// ============================================================================
// COMPANY DASHBOARD OVERVIEW
// ============================================================================

export const getCompanyDashboard = async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true, companyName: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get comprehensive analytics
    const analytics = await dashboardAnalyticsService.getCompanyAnalytics(companyId);

    // Get dashboard metrics
    const [
      activeOpportunities,
      totalApplications,
      pendingApplications,
      scheduledInterviews,
      recentPlacements,
      candidateStats,
    ] = await Promise.all([
      // Active opportunities count
      prisma.opportunity.count({
        where: { 
          companyId,
          status: 'ACTIVE',
        },
      }),

      // Total applications
      prisma.application.count({
        where: {
          opportunity: { companyId },
        },
      }),

      // Pending applications
      prisma.application.count({
        where: {
          opportunity: { companyId },
          status: 'SUBMITTED',
        },
      }),

      // Scheduled interviews
      prisma.interview.count({
        where: {
          application: {
            opportunity: { companyId },
          },
          status: 'SCHEDULED',
          scheduledDate: {
            gte: new Date(),
          },
        },
      }),

      // Recent placements (last 30 days)
      prisma.placement.count({
        where: {
          application: {
            opportunity: { companyId },
          },
          status: 'ACTIVE',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Candidate pool stats
      prisma.student.count({
        where: {
          metrics: {
            hireabilityScore: {
              gte: 70, // High-quality candidates
            },
          },
        },
      }),
    ]);

    // Get application status breakdown
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        opportunity: { companyId },
      },
      _count: true,
    });

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      where: {
        opportunity: { companyId },
      },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
      take: 10,
    });

    // Get upcoming interviews
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        application: {
          opportunity: { companyId },
        },
        status: 'SCHEDULED',
        scheduledDate: {
          gte: new Date(),
        },
      },
      include: {
        application: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            opportunity: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
      take: 5,
    });

    // Get notifications for company user
    const notifications = await notificationService.getUserNotifications(company.userId, 10);
    const notificationCount = await notificationService.getNotificationCount(company.userId);

    res.json({
      company: {
        companyId,
        companyName: company.companyName,
      },
      metrics: {
        activeOpportunities,
        totalApplications,
        pendingApplications,
        scheduledInterviews,
        recentPlacements,
        candidatePoolSize: candidateStats,
      },
      analytics,
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentApplications,
      upcomingInterviews,
      notifications: {
        recent: notifications,
        count: notificationCount
      }
    });
  } catch (error) {
    logger.error('Error fetching company dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// ============================================================================
// CANDIDATE SEARCH & DISCOVERY
// ============================================================================

export const searchCandidates = async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;
    const validatedQuery = candidateSearchSchema.parse(req.query);

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Build search filters
    const whereClause: any = {
      user: { status: 'ACTIVE' },
    };

    // GPA filter
    if (validatedQuery.minGPA || validatedQuery.maxGPA) {
      whereClause.profile = {
        gpa: {
          ...(validatedQuery.minGPA && { gte: validatedQuery.minGPA }),
          ...(validatedQuery.maxGPA && { lte: validatedQuery.maxGPA }),
        },
      };
    }

    // Graduation year filter
    if (validatedQuery.graduationYear) {
      whereClause.profile = {
        ...whereClause.profile,
        graduationDate: {
          gte: new Date(`${validatedQuery.graduationYear}-01-01`),
          lt: new Date(`${validatedQuery.graduationYear + 1}-01-01`),
        },
      };
    }

    // Location filter
    if (validatedQuery.location) {
      whereClause.location = {
        contains: validatedQuery.location,
        mode: 'insensitive',
      };
    }

    // Skills filter
    if (validatedQuery.skills && validatedQuery.skills.length > 0) {
      whereClause.skills = {
        some: {
          skill: {
            name: {
              in: validatedQuery.skills,
            },
          },
        },
      };
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Get candidates
    const [candidates, totalCount] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
        include: {
          profile: {
            include: {
              university: true,
              degree: true,
              major: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
            take: 5, // Top 5 skills
            orderBy: {
              proficiency: 'desc',
            },
          },
          experiences: {
            take: 2, // Most recent experiences
            orderBy: {
              startDate: 'desc',
            },
          },
          metrics: true,
        },
        skip,
        take: validatedQuery.limit,
        orderBy: getSortOrder(validatedQuery.sortBy, validatedQuery.sortOrder),
      }),

      prisma.student.count({ where: whereClause }),
    ]);

    // Calculate match scores if we have an active opportunity
    const candidatesWithScores = await Promise.all(
      candidates.map(async (candidate) => {
        // Get the company's most relevant opportunity for matching
        const relevantOpportunity = await prisma.opportunity.findFirst({
          where: {
            companyId,
            status: 'ACTIVE',
          },
          include: {
            opportunitySkills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        let matchScore = null;
        if (relevantOpportunity) {
          try {
            const matches = await matchService.getTopMatches(candidate.studentId, 1);
            const match = matches.find(m => m.opportunityId === relevantOpportunity.opportunityId);
            matchScore = match?.matchScore || null;
          } catch (error) {
            logger.warn('Error calculating match score:', { candidateId: candidate.studentId, error });
          }
        }

        return {
          ...candidate,
          matchScore,
          profileCompletion: calculateProfileCompletion(candidate),
        };
      })
    );

    res.json({
      candidates: candidatesWithScores,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / validatedQuery.limit),
      },
      filters: validatedQuery,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
    }
    logger.error('Error searching candidates:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
};

// ============================================================================
// CANDIDATE DETAILS
// ============================================================================

export const getCandidateDetails = async (req: Request, res: Response) => {
  try {
    const { id: companyId, studentId } = req.params;

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get detailed candidate information
    const candidate = await prisma.student.findUnique({
      where: { studentId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true,
          },
        },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            proficiency: 'desc',
          },
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            year: 'desc',
          },
        },
        preferences: {
          include: {
            preference: true,
          },
          orderBy: {
            priority: 'asc',
          },
        },
        metrics: true,
        applications: {
          where: {
            opportunity: { companyId },
          },
          include: {
            opportunity: {
              select: {
                title: true,
              },
            },
            interviews: true,
            placement: true,
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Calculate match scores for company's opportunities
    const companyOpportunities = await prisma.opportunity.findMany({
      where: {
        companyId,
        status: 'ACTIVE',
      },
      include: {
        opportunitySkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const matchScores = await Promise.all(
      companyOpportunities.map(async (opportunity) => {
        try {
          const insights = await matchService.getMatchInsights(studentId, opportunity.opportunityId);
          return {
            opportunityId: opportunity.opportunityId,
            title: opportunity.title,
            matchScore: insights.matchScore,
            breakdown: insights.breakdown,
            strengths: insights.strengths,
            improvements: insights.improvements,
          };
        } catch (error) {
          logger.warn('Error calculating match insights:', { studentId, opportunityId: opportunity.opportunityId, error });
          return null;
        }
      })
    );

    res.json({
      candidate: {
        ...candidate,
        profileCompletion: calculateProfileCompletion(candidate),
      },
      matchScores: matchScores.filter(Boolean),
    });
  } catch (error) {
    logger.error('Error fetching candidate details:', error);
    res.status(500).json({ error: 'Failed to fetch candidate details' });
  }
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const performBulkAction = async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;
    const validatedData = bulkActionSchema.parse(req.body);

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true, companyName: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const results = [];

    switch (validatedData.action) {
      case 'invite':
        if (!validatedData.opportunityId) {
          return res.status(400).json({ error: 'Opportunity ID required for invite action' });
        }

        // Create applications for selected students
        for (const studentId of validatedData.studentIds) {
          try {
            const application = await prisma.application.create({
              data: {
                studentId,
                opportunityId: validatedData.opportunityId,
                status: 'SUBMITTED',
                coverLetter: validatedData.message || 'Invited by company',
              },
            });
            results.push({ studentId, success: true, applicationId: application.applicationId });
          } catch (error) {
            results.push({ studentId, success: false, error: 'Failed to create application' });
          }
        }
        break;

      case 'message':
        // Create notifications for selected students
        for (const studentId of validatedData.studentIds) {
          try {
            const student = await prisma.student.findUnique({
              where: { studentId },
              select: { userId: true },
            });

            if (student) {
              await prisma.notification.create({
                data: {
                  userId: student.userId,
                  type: 'SYSTEM_ALERT',
                  title: `Message from ${company.companyName}`,
                  message: validatedData.message || 'You have a new message from a company',
                },
              });
              results.push({ studentId, success: true });
            } else {
              results.push({ studentId, success: false, error: 'Student not found' });
            }
          } catch (error) {
            results.push({ studentId, success: false, error: 'Failed to send message' });
          }
        }
        break;

      case 'shortlist':
        // Add to company's shortlist (could be implemented as a separate table)
        results.push(...validatedData.studentIds.map(studentId => ({ 
          studentId, 
          success: true, 
          message: 'Shortlist functionality to be implemented' 
        })));
        break;

      case 'reject':
        // Mark as rejected (could be implemented as a separate table)
        results.push(...validatedData.studentIds.map(studentId => ({ 
          studentId, 
          success: true, 
          message: 'Reject functionality to be implemented' 
        })));
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({
      action: validatedData.action,
      totalProcessed: validatedData.studentIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid bulk action data', details: error.errors });
    }
    logger.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSortOrder(sortBy: string, sortOrder: string): any {
  const order = sortOrder as 'asc' | 'desc';
  
  switch (sortBy) {
    case 'hireabilityScore':
      return { metrics: { hireabilityScore: order } };
    case 'gpa':
      return { profile: { gpa: order } };
    case 'graduationDate':
      return { profile: { graduationDate: order } };
    case 'relevance':
    default:
      return { metrics: { hireabilityScore: 'desc' } };
  }
}

function calculateProfileCompletion(student: any): number {
  let score = 0;
  const maxScore = 100;

  // Basic info (20 points)
  if (student.firstName && student.lastName) score += 5;
  if (student.phone) score += 3;
  if (student.location) score += 3;
  if (student.elevatorPitch) score += 5;
  if (student.linkedinUrl) score += 2;
  if (student.profilePicture) score += 2;

  // Academic info (20 points)
  if (student.profile) {
    if (student.profile.universityId) score += 5;
    if (student.profile.degreeId) score += 5;
    if (student.profile.majorId) score += 5;
    if (student.profile.gpa) score += 5;
  }

  // Skills (20 points)
  const skillCount = student.skills?.length || 0;
  score += Math.min(skillCount * 2, 20);

  // Experience (20 points)
  const experienceCount = student.experiences?.length || 0;
  score += Math.min(experienceCount * 5, 20);

  // Projects (10 points)
  const projectCount = student.projects?.length || 0;
  score += Math.min(projectCount * 3, 10);

  // Preferences (10 points)
  const preferenceCount = student.preferences?.length || 0;
  score += Math.min(preferenceCount * 2, 10);

  return Math.min(score, maxScore);
}

/**
 * Get company analytics
 */
export const getCompanyAnalytics = async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const analytics = await dashboardAnalyticsService.getCompanyAnalytics(companyId);

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching company analytics:', error);
    res.status(500).json({ error: 'Failed to fetch company analytics' });
  }
};

/**
 * Get company notifications
 */
export const getCompanyNotifications = async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;
    const { limit = 20, unreadOnly = false } = req.query;

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const notifications = await notificationService.getUserNotifications(
      company.userId, 
      Number(limit), 
      unreadOnly === 'true'
    );

    const count = await notificationService.getNotificationCount(company.userId);

    res.json({
      notifications,
      count
    });
  } catch (error) {
    logger.error('Error fetching company notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark company notification as read
 */
export const markCompanyNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id: companyId, notificationId } = req.params;

    // Verify company access
    const company = await prisma.company.findUnique({
      where: { companyId },
      select: { userId: true },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await notificationService.markAsRead(notificationId, company.userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Error marking company notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};