import { Request, Response } from 'express';
import { PrismaClient, UserRole, UserStatus, OpportunityStatus, ApplicationStatus } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['STUDENT', 'COMPANY', 'ADMIN']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING', 'INACTIVE']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
});

const createOpportunitySchema = z.object({
  companyId: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().optional(),
  industry: z.string().optional(),
  jobTypes: z.array(z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT', 'FREELANCE'])),
  gpaThreshold: z.number().min(0).max(4).optional(),
  isTechnical: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  applicationDeadline: z.string().datetime().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  requirements: z.string().optional(),
  skills: z.array(z.object({
    skillId: z.string(),
    skillWeight: z.number().min(1).max(5),
    required: z.boolean().default(false)
  })).optional(),
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { student: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { student: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { company: { companyName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          student: true,
          company: true,
          admin: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { email, password, role, firstName, lastName, companyName } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as UserRole,
        status: UserStatus.ACTIVE,
        ...(role === 'STUDENT' && firstName && lastName && {
          student: {
            create: {
              firstName,
              lastName,
            },
          },
        }),
        ...(role === 'COMPANY' && companyName && {
          company: {
            create: {
              companyName,
            },
          },
        }),
        ...(role === 'ADMIN' && {
          admin: {
            create: {},
          },
        }),
      },
      include: {
        student: true,
        company: true,
        admin: true,
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'CREATE_USER',
        details: `Created user ${email} with role ${role}`,
        metadata: { targetUserId: user.userId },
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { userId: id },
      data: {
        ...validatedData,
        ...(validatedData.firstName && {
          student: {
            update: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
            },
          },
        }),
        ...(validatedData.companyName && {
          company: {
            update: {
              companyName: validatedData.companyName,
            },
          },
        }),
      },
      include: {
        student: true,
        company: true,
        admin: true,
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'UPDATE_USER',
        details: `Updated user ${user.email}`,
        metadata: { targetUserId: id, changes: validatedData },
      },
    });

    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { userId: id },
      data: { status: UserStatus.INACTIVE },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'DELETE_USER',
        details: `Suspended user ${user.email}`,
        metadata: { targetUserId: id },
      },
    });

    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ============================================================================
// DETAILED PROFILE VIEWS
// ============================================================================

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { studentId: id },
      include: {
        user: true,
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
        },
        courses: {
          include: {
            course: true,
          },
        },
        preferences: {
          include: {
            preference: true,
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
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true,
              },
            },
          },
        },
        applications: {
          include: {
            opportunity: {
              include: {
                company: true,
              },
            },
            interviews: true,
            placement: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate metrics
    const metrics = {
      totalApplications: student.applications.length,
      acceptedApplications: student.applications.filter(app => app.status === 'ACCEPTED').length,
      interviewsScheduled: student.applications.reduce((acc, app) => acc + app.interviews.length, 0),
      activePlacements: student.applications.filter(app => app.placement?.status === 'ACTIVE').length,
      completedPlacements: student.applications.filter(app => app.placement?.status === 'COMPLETED').length,
    };

    res.json({ student, metrics });
  } catch (error) {
    logger.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
};

export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { companyId: id },
      include: {
        user: true,
        profile: true,
        companyUsers: {
          include: {
            user: true,
          },
        },
        opportunities: {
          include: {
            opportunitySkills: {
              include: {
                skill: true,
              },
            },
            applications: {
              include: {
                student: true,
                interviews: true,
                placement: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Calculate metrics
    const metrics = {
      totalOpportunities: company.opportunities.length,
      activeOpportunities: company.opportunities.filter(opp => opp.status === 'ACTIVE').length,
      totalApplications: company.opportunities.reduce((acc, opp) => acc + opp.applications.length, 0),
      acceptedApplications: company.opportunities.reduce((acc, opp) => 
        acc + opp.applications.filter(app => app.status === 'ACCEPTED').length, 0),
      activePlacements: company.opportunities.reduce((acc, opp) => 
        acc + opp.applications.filter(app => app.placement?.status === 'ACTIVE').length, 0),
    };

    res.json({ company, metrics });
  } catch (error) {
    logger.error('Error fetching company profile:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

// ============================================================================
// OPPORTUNITY MANAGEMENT
// ============================================================================

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, companyId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { company: { companyName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          company: true,
          opportunitySkills: {
            include: {
              skill: true,
            },
          },
          applications: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.opportunity.count({ where }),
    ]);

    res.json({
      opportunities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const validatedData = createOpportunitySchema.parse(req.body);
    const { skills, ...opportunityData } = validatedData;

    const opportunity = await prisma.opportunity.create({
      data: {
        ...opportunityData,
        status: OpportunityStatus.PENDING_APPROVAL,
        ...(skills && {
          opportunitySkills: {
            create: skills,
          },
        }),
      },
      include: {
        company: true,
        opportunitySkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'CREATE_OPPORTUNITY',
        details: `Created opportunity ${opportunity.title}`,
        metadata: { opportunityId: opportunity.opportunityId },
      },
    });

    res.status(201).json({ opportunity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
};

export const approveOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.update({
      where: { opportunityId: id },
      data: { status: OpportunityStatus.ACTIVE },
      include: {
        company: true,
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'APPROVE_OPPORTUNITY',
        details: `Approved opportunity ${opportunity.title}`,
        metadata: { opportunityId: id },
      },
    });

    // Create notification for company
    await prisma.notification.create({
      data: {
        userId: opportunity.company.userId,
        type: 'SYSTEM_ALERT',
        title: 'Opportunity Approved',
        message: `Your opportunity "${opportunity.title}" has been approved and is now active.`,
        actionUrl: `/opportunities/${opportunity.opportunityId}`,
      },
    });

    res.json({ opportunity });
  } catch (error) {
    logger.error('Error approving opportunity:', error);
    res.status(500).json({ error: 'Failed to approve opportunity' });
  }
};

export const rejectOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const opportunity = await prisma.opportunity.update({
      where: { opportunityId: id },
      data: { status: OpportunityStatus.REJECTED },
      include: {
        company: true,
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'REJECT_OPPORTUNITY',
        details: `Rejected opportunity ${opportunity.title}. Reason: ${reason}`,
        metadata: { opportunityId: id, reason },
      },
    });

    // Create notification for company
    await prisma.notification.create({
      data: {
        userId: opportunity.company.userId,
        type: 'SYSTEM_ALERT',
        title: 'Opportunity Rejected',
        message: `Your opportunity "${opportunity.title}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: `/opportunities/${opportunity.opportunityId}`,
      },
    });

    res.json({ opportunity });
  } catch (error) {
    logger.error('Error rejecting opportunity:', error);
    res.status(500).json({ error: 'Failed to reject opportunity' });
  }
};

// ============================================================================
// APPLICATION MANAGEMENT
// ============================================================================

export const overrideApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid application status' });
    }

    const application = await prisma.application.update({
      where: { applicationId: id },
      data: {
        status,
        reviewedBy: req.user?.userId,
        reviewNotes: reason,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        opportunity: {
          include: {
            company: true,
          },
        },
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: req.user?.userId,
        action: 'OVERRIDE_APPLICATION_STATUS',
        details: `Override application status to ${status}. Reason: ${reason}`,
        metadata: { applicationId: id, newStatus: status, reason },
      },
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        type: 'APPLICATION_UPDATE',
        title: 'Application Status Updated',
        message: `Your application for "${application.opportunity.title}" has been updated to ${status}.`,
        actionUrl: `/applications/${application.applicationId}`,
      },
    });

    res.json({ application });
  } catch (error) {
    logger.error('Error overriding application status:', error);
    res.status(500).json({ error: 'Failed to override application status' });
  }
};

// ============================================================================
// METRICS & ANALYTICS
// ============================================================================

export const getPlacementMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const where = startDate || endDate ? { createdAt: dateFilter } : {};

    const [
      totalPlacements,
      activePlacements,
      completedPlacements,
      placementsByMonth,
      successRateByGPA,
      placementsByIndustry,
    ] = await Promise.all([
      prisma.placement.count({ where }),
      prisma.placement.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.placement.count({ where: { ...where, status: 'COMPLETED' } }),
      
      // Placements by month
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM placements 
        ${startDate || endDate ? 'WHERE created_at >= $1 AND created_at <= $2' : ''}
        GROUP BY month 
        ORDER BY month
      `,
      
      // Success rate by GPA
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN sp.gpa >= 3.5 THEN 'High (3.5+)'
            WHEN sp.gpa >= 3.0 THEN 'Medium (3.0-3.5)'
            WHEN sp.gpa >= 2.5 THEN 'Low (2.5-3.0)'
            ELSE 'Very Low (<2.5)'
          END as gpa_range,
          COUNT(p.placement_id) as placements,
          COUNT(a.application_id) as applications,
          ROUND(COUNT(p.placement_id)::numeric / COUNT(a.application_id) * 100, 2) as success_rate
        FROM applications a
        JOIN students s ON a.student_id = s.student_id
        LEFT JOIN student_profiles sp ON s.student_id = sp.student_id
        LEFT JOIN placements p ON a.application_id = p.application_id
        WHERE sp.gpa IS NOT NULL
        GROUP BY gpa_range
        ORDER BY success_rate DESC
      `,
      
      // Placements by industry
      prisma.$queryRaw`
        SELECT 
          o.industry,
          COUNT(p.placement_id) as count
        FROM placements p
        JOIN applications a ON p.application_id = a.application_id
        JOIN opportunities o ON a.opportunity_id = o.opportunity_id
        WHERE o.industry IS NOT NULL
        GROUP BY o.industry
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    res.json({
      summary: {
        totalPlacements,
        activePlacements,
        completedPlacements,
        completionRate: totalPlacements > 0 ? (completedPlacements / totalPlacements * 100).toFixed(2) : 0,
      },
      trends: {
        placementsByMonth,
        successRateByGPA,
        placementsByIndustry,
      },
    });
  } catch (error) {
    logger.error('Error fetching placement metrics:', error);
    res.status(500).json({ error: 'Failed to fetch placement metrics' });
  }
};

export const getActiveSessionsMetrics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      activeSessions,
      sessionsLastHour,
      sessionsLastDay,
      sessionsByRole,
      recentLogins,
    ] = await Promise.all([
      prisma.userSession.count({
        where: {
          expiresAt: { gt: now },
        },
      }),
      
      prisma.userSession.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      }),
      
      prisma.userSession.count({
        where: {
          createdAt: { gte: oneDayAgo },
        },
      }),
      
      prisma.$queryRaw`
        SELECT 
          u.role,
          COUNT(us.session_id) as active_sessions
        FROM user_sessions us
        JOIN users u ON us.user_id = u.user_id
        WHERE us.expires_at > NOW()
        GROUP BY u.role
      `,
      
      prisma.userSession.findMany({
        where: {
          createdAt: { gte: oneDayAgo },
        },
        include: {
          user: {
            include: {
              student: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      summary: {
        activeSessions,
        sessionsLastHour,
        sessionsLastDay,
      },
      breakdown: {
        sessionsByRole,
      },
      recentActivity: {
        recentLogins,
      },
    });
  } catch (error) {
    logger.error('Error fetching session metrics:', error);
    res.status(500).json({ error: 'Failed to fetch session metrics' });
  }
};

export const getQueueStatus = async (req: Request, res: Response) => {
  try {
    const [
      queueSummary,
      recentTasks,
      failedTasks,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          status,
          COUNT(*) as count
        FROM queues
        GROUP BY status
      `,
      
      prisma.queue.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      
      prisma.queue.findMany({
        where: { status: 'FAILED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      summary: queueSummary,
      recentTasks,
      failedTasks,
    });
  } catch (error) {
    logger.error('Error fetching queue status:', error);
    res.status(500).json({ error: 'Failed to fetch queue status' });
  }
};