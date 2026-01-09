import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

// ============================================================================
// ADMIN DASHBOARD OVERVIEW
// ============================================================================

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // System Users Card
    const [
      totalUsers,
      totalStudents,
      totalCompanies,
      totalAdmins,
      newUsersThisWeek,
      newUsersThisMonth,
      usersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM users
        GROUP BY status
      `,
    ]);

    // Active Opportunities Card
    const [
      totalOpportunities,
      activeOpportunities,
      pendingOpportunities,
      rejectedOpportunities,
      newOpportunitiesThisWeek,
      opportunitiesByStatus,
    ] = await Promise.all([
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
      prisma.opportunity.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.opportunity.count({ where: { status: 'REJECTED' } }),
      prisma.opportunity.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM opportunities
        GROUP BY status
      `,
    ]);

    // Applications Card
    const [
      totalApplications,
      submittedApplications,
      inReviewApplications,
      acceptedApplications,
      rejectedApplications,
      newApplicationsThisWeek,
      applicationsByStatus,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SUBMITTED' } }),
      prisma.application.count({ where: { status: 'IN_REVIEW' } }),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.count({ where: { appliedAt: { gte: sevenDaysAgo } } }),
      prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `,
    ]);

    // Interviews Card
    const [
      totalInterviews,
      scheduledInterviews,
      completedInterviews,
      upcomingInterviews,
      interviewsThisWeek,
    ] = await Promise.all([
      prisma.interview.count(),
      prisma.interview.count({ where: { status: 'SCHEDULED' } }),
      prisma.interview.count({ where: { status: 'COMPLETED' } }),
      prisma.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledDate: { gte: now },
        },
      }),
      prisma.interview.count({
        where: {
          scheduledDate: {
            gte: sevenDaysAgo,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // System Health Card
    const [
      activeSessions,
      pendingQueueTasks,
      failedQueueTasks,
      recentErrors,
      systemLoad,
    ] = await Promise.all([
      prisma.userSession.count({
        where: { expiresAt: { gt: now } },
      }),
      prisma.queue.count({ where: { status: 'PENDING' } }),
      prisma.queue.count({ where: { status: 'FAILED' } }),
      prisma.systemLog.count({
        where: {
          level: 'ERROR',
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      // System load calculation (simplified)
      prisma.$queryRaw`
        SELECT 
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as requests_last_hour,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as requests_last_day
        FROM system_logs
        WHERE action IN ('LOGIN', 'API_REQUEST', 'DATA_ACCESS')
      `,
    ]);

    res.json({
      cards: {
        systemUsers: {
          total: totalUsers,
          breakdown: {
            students: totalStudents,
            companies: totalCompanies,
            admins: totalAdmins,
          },
          trends: {
            newThisWeek: newUsersThisWeek,
            newThisMonth: newUsersThisMonth,
          },
          statusBreakdown: usersByStatus,
        },
        activeOpportunities: {
          total: totalOpportunities,
          breakdown: {
            active: activeOpportunities,
            pending: pendingOpportunities,
            rejected: rejectedOpportunities,
          },
          trends: {
            newThisWeek: newOpportunitiesThisWeek,
          },
          statusBreakdown: opportunitiesByStatus,
        },
        applications: {
          total: totalApplications,
          breakdown: {
            submitted: submittedApplications,
            inReview: inReviewApplications,
            accepted: acceptedApplications,
            rejected: rejectedApplications,
          },
          trends: {
            newThisWeek: newApplicationsThisWeek,
          },
          statusBreakdown: applicationsByStatus,
        },
        interviews: {
          total: totalInterviews,
          breakdown: {
            scheduled: scheduledInterviews,
            completed: completedInterviews,
            upcoming: upcomingInterviews,
          },
          trends: {
            thisWeek: interviewsThisWeek,
          },
        },
        systemHealth: {
          activeSessions,
          queueStatus: {
            pending: pendingQueueTasks,
            failed: failedQueueTasks,
          },
          errors: {
            recentErrors,
          },
          load: systemLoad,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
};

// ============================================================================
// DASHBOARD GRAPHS & KPIs
// ============================================================================

export const getStudentSuccessRates = async (req: Request, res: Response) => {
  try {
    const { timeframe = '6months' } = req.query;
    
    let dateFilter: Date;
    switch (timeframe) {
      case '1month':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        dateFilter = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    }

    // Success rates by GPA
    const successByGPA = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN sp.gpa >= 3.5 THEN 'High (3.5+)'
          WHEN sp.gpa >= 3.0 THEN 'Medium (3.0-3.5)'
          WHEN sp.gpa >= 2.5 THEN 'Low (2.5-3.0)'
          ELSE 'Very Low (<2.5)'
        END as gpa_range,
        COUNT(a.application_id) as total_applications,
        COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as accepted_applications,
        COUNT(p.placement_id) as placements,
        ROUND(
          COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END)::numeric / 
          NULLIF(COUNT(a.application_id), 0) * 100, 2
        ) as acceptance_rate,
        ROUND(
          COUNT(p.placement_id)::numeric / 
          NULLIF(COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END), 0) * 100, 2
        ) as placement_rate
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      LEFT JOIN student_profiles sp ON s.student_id = sp.student_id
      LEFT JOIN placements p ON a.application_id = p.application_id
      WHERE a.applied_at >= $1 AND sp.gpa IS NOT NULL
      GROUP BY gpa_range
      ORDER BY MIN(sp.gpa) DESC
    `;

    // Success rates by major
    const successByMajor = await prisma.$queryRaw`
      SELECT 
        m.name as major,
        COUNT(a.application_id) as total_applications,
        COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as accepted_applications,
        COUNT(p.placement_id) as placements,
        ROUND(
          COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END)::numeric / 
          NULLIF(COUNT(a.application_id), 0) * 100, 2
        ) as acceptance_rate
      FROM applications a
      JOIN students s ON a.student_id = s.student_id
      LEFT JOIN student_profiles sp ON s.student_id = sp.student_id
      LEFT JOIN majors m ON sp.major_id = m.major_id
      LEFT JOIN placements p ON a.application_id = p.application_id
      WHERE a.applied_at >= $1 AND m.name IS NOT NULL
      GROUP BY m.name
      HAVING COUNT(a.application_id) >= 5
      ORDER BY acceptance_rate DESC
      LIMIT 10
    `;

    res.json({
      timeframe,
      successByGPA,
      successByMajor,
    });
  } catch (error) {
    logger.error('Error fetching student success rates:', error);
    res.status(500).json({ error: 'Failed to fetch student success rates' });
  }
};

export const getPlacementTrends = async (req: Request, res: Response) => {
  try {
    const { timeframe = '12months' } = req.query;
    
    let months: number;
    switch (timeframe) {
      case '6months':
        months = 6;
        break;
      case '12months':
        months = 12;
        break;
      case '24months':
        months = 24;
        break;
      default:
        months = 12;
    }

    // Placement trends by month
    const placementsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as placements,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_placements,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_placements
      FROM placements 
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY month 
      ORDER BY month
    `;

    // Placement trends by industry
    const placementsByIndustry = await prisma.$queryRaw`
      SELECT 
        o.industry,
        COUNT(p.placement_id) as placements,
        AVG(p.salary) as avg_salary,
        COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed_placements
      FROM placements p
      JOIN applications a ON p.application_id = a.application_id
      JOIN opportunities o ON a.opportunity_id = o.opportunity_id
      WHERE p.created_at >= NOW() - INTERVAL '${months} months'
        AND o.industry IS NOT NULL
      GROUP BY o.industry
      ORDER BY placements DESC
      LIMIT 10
    `;

    // Placement trends by location
    const placementsByLocation = await prisma.$queryRaw`
      SELECT 
        o.location,
        COUNT(p.placement_id) as placements,
        AVG(p.salary) as avg_salary
      FROM placements p
      JOIN applications a ON p.application_id = a.application_id
      JOIN opportunities o ON a.opportunity_id = o.opportunity_id
      WHERE p.created_at >= NOW() - INTERVAL '${months} months'
        AND o.location IS NOT NULL
      GROUP BY o.location
      ORDER BY placements DESC
      LIMIT 10
    `;

    res.json({
      timeframe,
      placementsByMonth,
      placementsByIndustry,
      placementsByLocation,
    });
  } catch (error) {
    logger.error('Error fetching placement trends:', error);
    res.status(500).json({ error: 'Failed to fetch placement trends' });
  }
};

export const getActiveSessionsTrends = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Sessions by hour for the last 24 hours
    const sessionsByHour = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', created_at) as hour,
        COUNT(*) as new_sessions,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions
      FROM user_sessions
      WHERE created_at >= $1
      GROUP BY hour
      ORDER BY hour
    `;

    // Login trends by role
    const loginsByRole = await prisma.$queryRaw`
      SELECT 
        u.role,
        COUNT(us.session_id) as sessions,
        COUNT(DISTINCT us.user_id) as unique_users
      FROM user_sessions us
      JOIN users u ON us.user_id = u.user_id
      WHERE us.created_at >= $1
      GROUP BY u.role
    `;

    // Current active sessions
    const currentActiveSessions = await prisma.$queryRaw`
      SELECT 
        u.role,
        COUNT(us.session_id) as active_sessions
      FROM user_sessions us
      JOIN users u ON us.user_id = u.user_id
      WHERE us.expires_at > NOW()
      GROUP BY u.role
    `;

    res.json({
      sessionsByHour,
      loginsByRole,
      currentActiveSessions,
    });
  } catch (error) {
    logger.error('Error fetching session trends:', error);
    res.status(500).json({ error: 'Failed to fetch session trends' });
  }
};

export const getOpportunityApprovalRates = async (req: Request, res: Response) => {
  try {
    const { timeframe = '3months' } = req.query;
    
    let months: number;
    switch (timeframe) {
      case '1month':
        months = 1;
        break;
      case '3months':
        months = 3;
        break;
      case '6months':
        months = 6;
        break;
      case '12months':
        months = 12;
        break;
      default:
        months = 3;
    }

    // Approval rates by month
    const approvalsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_opportunities,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'PENDING_APPROVAL' THEN 1 END) as pending,
        ROUND(
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::numeric / 
          NULLIF(COUNT(CASE WHEN status IN ('ACTIVE', 'REJECTED') THEN 1 END), 0) * 100, 2
        ) as approval_rate
      FROM opportunities
      WHERE created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY month
      ORDER BY month
    `;

    // Approval rates by industry
    const approvalsByIndustry = await prisma.$queryRaw`
      SELECT 
        industry,
        COUNT(*) as total_opportunities,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
        ROUND(
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END)::numeric / 
          NULLIF(COUNT(CASE WHEN status IN ('ACTIVE', 'REJECTED') THEN 1 END), 0) * 100, 2
        ) as approval_rate
      FROM opportunities
      WHERE created_at >= NOW() - INTERVAL '${months} months'
        AND industry IS NOT NULL
      GROUP BY industry
      HAVING COUNT(*) >= 3
      ORDER BY approval_rate DESC
    `;

    // Average approval time
    const approvalTimes = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_approval_time_hours,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as median_approval_time_hours
      FROM opportunities
      WHERE status IN ('ACTIVE', 'REJECTED')
        AND created_at >= NOW() - INTERVAL '${months} months'
    `;

    res.json({
      timeframe,
      approvalsByMonth,
      approvalsByIndustry,
      approvalTimes,
    });
  } catch (error) {
    logger.error('Error fetching opportunity approval rates:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity approval rates' });
  }
};

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const [pendingUsers, pendingOpportunities] = await Promise.all([
      prisma.user.findMany({
        where: { status: 'PENDING' },
        include: {
          student: true,
          company: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
      
      prisma.opportunity.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          company: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      }),
    ]);

    res.json({
      pendingUsers,
      pendingOpportunities,
    });
  } catch (error) {
    logger.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const recentLogs = await prisma.systemLog.findMany({
      where: {
        action: {
          in: [
            'CREATE_USER',
            'UPDATE_USER',
            'CREATE_OPPORTUNITY',
            'APPROVE_OPPORTUNITY',
            'REJECT_OPPORTUNITY',
            'OVERRIDE_APPLICATION_STATUS',
          ],
        },
      },
      include: {
        user: {
          include: {
            student: true,
            company: true,
            admin: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ recentActivity: recentLogs });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};