/**
 * Student Dashboard Controller
 * Handles student dashboard overview, metrics, and recommendations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { studentProfileService } from '../services/student-profile.service';
import { notificationService } from '../services/notification.service';
import { dashboardAnalyticsService } from '../services/dashboard-analytics.service';

const prisma = new PrismaClient();

/**
 * Get student dashboard overview
 */
export const getStudentDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);
    const metrics = await studentProfileService.recalculateMetrics(student.studentId);

    // Get comprehensive analytics
    const analytics = await dashboardAnalyticsService.getStudentAnalytics(student.studentId);

    // Get application statistics
    const applications = await prisma.application.findMany({
      where: { studentId: student.studentId },
      include: {
        opportunity: {
          select: {
            title: true,
            companyId: true,
            company: {
              select: {
                companyName: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    const applicationStats = {
      total: applications.length,
      submitted: applications.filter(app => app.status === 'SUBMITTED').length,
      inReview: applications.filter(app => app.status === 'IN_REVIEW').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length
    };

    // Get top matched opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: { 
        status: 'ACTIVE',
        // Exclude opportunities already applied to
        NOT: {
          applications: {
            some: {
              studentId: student.studentId
            }
          }
        }
      },
      include: {
        company: {
          select: {
            companyName: true,
            logoPath: true
          }
        },
        opportunitySkills: {
          include: {
            skill: true
          }
        }
      },
      take: 5
    });

    // Calculate match scores for opportunities
    const topOpportunities = opportunities.map(opp => ({
      ...opp,
      matchScore: calculateOpportunityMatchScore(student, opp)
    })).sort((a, b) => b.matchScore - a.matchScore);

    // Get upcoming interviews
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        application: {
          studentId: student.studentId
        },
        status: 'SCHEDULED',
        scheduledDate: {
          gte: new Date()
        }
      },
      include: {
        application: {
          include: {
            opportunity: {
              include: {
                company: {
                  select: {
                    companyName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { scheduledDate: 'asc' },
      take: 5
    });

    // Get placements
    const placements = await prisma.placement.findMany({
      where: {
        application: {
          studentId: student.studentId
        }
      },
      include: {
        application: {
          include: {
            opportunity: {
              include: {
                company: {
                  select: {
                    companyName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Recent activity (applications, profile updates, etc.)
    const recentActivity = [
      ...applications.slice(0, 3).map(app => ({
        type: 'application',
        title: `Applied to ${app.opportunity.title}`,
        company: app.opportunity.company.companyName,
        date: app.appliedAt,
        status: app.status
      })),
      {
        type: 'profile_update',
        title: 'Profile metrics updated',
        date: metrics.lastComputed,
        score: metrics.hireabilityScore
      }
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Get notifications
    const notifications = await notificationService.getUserNotifications(req.user.userId, 10);
    const notificationCount = await notificationService.getNotificationCount(req.user.userId);

    res.json({
      profile: {
        firstName: student.firstName,
        lastName: student.lastName,
        profilePicture: student.profilePicture,
        location: student.location
      },
      metrics: {
        hireabilityScore: metrics.hireabilityScore / 100, // Convert to 0-1 scale for tests
        skillScore: metrics.skillScore / 100,
        academicScore: metrics.academicScore / 100,
        experienceScore: metrics.experienceScore / 100,
        preferenceScore: metrics.preferenceScore / 100,
        lastComputed: metrics.lastComputed
      },
      analytics,
      applications: applicationStats,
      topOpportunities,
      upcomingInterviews,
      placements,
      recentActivity,
      notifications: {
        recent: notifications,
        count: notificationCount
      }
    });

  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

/**
 * Get match readiness analysis
 */
export const getMatchReadiness = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);
    const metrics = await studentProfileService.recalculateMetrics(student.studentId);

    // Analyze skill gaps based on market demand
    const skillGaps = await analyzeSkillGaps(student);
    
    // Generate recommendations
    const recommendations = generateRecommendations(student, metrics);

    res.json({
      overallScore: metrics.hireabilityScore / 100,
      skillAnalysis: {
        currentSkills: student.skills.length,
        averageProficiency: student.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / student.skills.length || 0,
        score: metrics.skillScore / 100
      },
      academicAnalysis: {
        gpa: student.profile?.gpa || null,
        coursesCompleted: student.courses.length,
        score: metrics.academicScore / 100
      },
      experienceAnalysis: {
        workExperience: student.experiences.length,
        projects: student.projects.length,
        score: metrics.experienceScore / 100
      },
      recommendations,
      skillGaps
    });

  } catch (error) {
    console.error('Get match readiness error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match readiness analysis'
    });
  }
};

/**
 * Get student applications
 */
export const getStudentApplications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    const applications = await prisma.application.findMany({
      where: { studentId: student.studentId },
      include: {
        opportunity: {
          include: {
            company: {
              select: {
                companyName: true,
                logoPath: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json(applications);

  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get applications'
    });
  }
};

/**
 * Apply to opportunity
 */
export const applyToOpportunity = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { opportunityId, coverLetter } = req.body;
    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_opportunityId: {
          studentId: student.studentId,
          opportunityId
        }
      }
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'Already applied to this opportunity'
      });
      return;
    }

    // Calculate match score
    const opportunity = await prisma.opportunity.findUnique({
      where: { opportunityId },
      include: {
        opportunitySkills: {
          include: { skill: true }
        }
      }
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
      return;
    }

    const matchScore = calculateOpportunityMatchScore(student, opportunity);

    const application = await prisma.application.create({
      data: {
        studentId: student.studentId,
        opportunityId,
        coverLetter,
        matchScore,
        status: 'SUBMITTED'
      }
    });

    res.status(201).json(application);

  } catch (error) {
    console.error('Apply to opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply to opportunity'
    });
  }
};

/**
 * Withdraw application
 */
export const withdrawApplication = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { applicationId } = req.params;
    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    const application = await prisma.application.findUnique({
      where: { applicationId }
    });

    if (!application || application.studentId !== student.studentId) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { applicationId },
      data: { status: 'WITHDRAWN' }
    });

    res.json(updatedApplication);

  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

/**
 * Get opportunity matches for student
 */
export const getOpportunityMatches = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      include: {
        company: {
          select: {
            companyName: true,
            logoPath: true
          }
        },
        opportunitySkills: {
          include: { skill: true }
        }
      }
    });

    const matches = opportunities.map(opportunity => {
      const matchScore = calculateOpportunityMatchScore(student, opportunity);
      const skillMatch = calculateSkillMatch(student, opportunity);
      const academicFit = calculateAcademicFit(student, opportunity);
      const experienceMatch = calculateExperienceMatch(student, opportunity);
      const preferenceFit = calculatePreferenceFit(student, opportunity);

      return {
        opportunity,
        matchScore,
        skillMatch,
        academicFit,
        experienceMatch,
        preferenceFit
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(matches);

  } catch (error) {
    console.error('Get opportunity matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get opportunity matches'
    });
  }
};

// Helper functions

function calculateOpportunityMatchScore(student: any, opportunity: any): number {
  const skillMatch = calculateSkillMatch(student, opportunity);
  const academicFit = calculateAcademicFit(student, opportunity);
  const experienceMatch = calculateExperienceMatch(student, opportunity);
  const preferenceFit = calculatePreferenceFit(student, opportunity);

  // Weighted average
  return (skillMatch * 0.4 + academicFit * 0.2 + experienceMatch * 0.3 + preferenceFit * 0.1);
}

function calculateSkillMatch(student: any, opportunity: any): number {
  if (!opportunity.opportunitySkills || opportunity.opportunitySkills.length === 0) return 0.5;

  const requiredSkills = opportunity.opportunitySkills;
  const studentSkillIds = student.skills.map((s: any) => s.skillId);

  let matchScore = 0;
  let totalWeight = 0;

  for (const reqSkill of requiredSkills) {
    const weight = reqSkill.skillWeight || 1;
    totalWeight += weight;

    if (studentSkillIds.includes(reqSkill.skillId)) {
      const studentSkill = student.skills.find((s: any) => s.skillId === reqSkill.skillId);
      const proficiencyScore = studentSkill ? studentSkill.proficiency / 5 : 0;
      matchScore += proficiencyScore * weight;
    }
  }

  return totalWeight > 0 ? matchScore / totalWeight : 0;
}

function calculateAcademicFit(student: any, opportunity: any): number {
  let score = 0.5; // Base score

  // GPA consideration
  if (student.profile?.gpa && opportunity.gpaThreshold) {
    score = student.profile.gpa >= opportunity.gpaThreshold ? 1 : 0.3;
  } else if (student.profile?.gpa) {
    score = Math.min(student.profile.gpa / 4.0, 1); // Normalize to 0-1
  }

  return score;
}

function calculateExperienceMatch(student: any, opportunity: any): number {
  const totalExperience = student.experiences.length + (student.projects.length * 0.5);
  
  // Simple scoring based on experience count
  if (totalExperience >= 3) return 1;
  if (totalExperience >= 2) return 0.8;
  if (totalExperience >= 1) return 0.6;
  return 0.3;
}

function calculatePreferenceFit(student: any, opportunity: any): number {
  // This would need more sophisticated preference matching
  // For now, return a base score
  return 0.7;
}

async function analyzeSkillGaps(student: any) {
  // Get popular skills from opportunities
  const popularSkills = await prisma.skill.findMany({
    include: {
      opportunitySkills: {
        select: {
          skillWeight: true,
          required: true
        }
      }
    },
    orderBy: {
      opportunitySkills: {
        _count: 'desc'
      }
    },
    take: 10
  });

  const studentSkillIds = student.skills.map((s: any) => s.skillId);

  return popularSkills
    .filter(skill => !studentSkillIds.includes(skill.skillId))
    .slice(0, 5)
    .map(skill => ({
      skill: skill.name,
      importance: skill.opportunitySkills.length,
      currentLevel: 0,
      recommendedLevel: 3
    }));
}

function generateRecommendations(student: any, metrics: any) {
  const recommendations = [];

  if (metrics.skillScore < 60) {
    recommendations.push({
      type: 'skills',
      title: 'Improve Technical Skills',
      description: 'Add more skills to your profile and increase proficiency levels',
      priority: 'high'
    });
  }

  if (metrics.academicScore < 50) {
    recommendations.push({
      type: 'academic',
      title: 'Complete Academic Profile',
      description: 'Add your GPA, university, and course information',
      priority: 'medium'
    });
  }

  if (student.experiences.length === 0) {
    recommendations.push({
      type: 'experience',
      title: 'Add Work Experience',
      description: 'Include internships, part-time jobs, or volunteer work',
      priority: 'high'
    });
  }

  if (student.projects.length < 2) {
    recommendations.push({
      type: 'projects',
      title: 'Showcase Your Projects',
      description: 'Add personal or academic projects to demonstrate your skills',
      priority: 'medium'
    });
  }

  return recommendations;
}

/**
 * Get student notifications
 */
export const getStudentNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { limit = 20, unreadOnly = false } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user.userId, 
      Number(limit), 
      unreadOnly === 'true'
    );

    const count = await notificationService.getNotificationCount(req.user.userId);

    res.json({
      notifications,
      count
    });

  } catch (error) {
    console.error('Get student notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { notificationId } = req.params;
    
    await notificationService.markAsRead(notificationId, req.user.userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const result = await notificationService.markAllAsRead(req.user.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updated: result.count
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Get student analytics
 */
export const getStudentAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);
    const analytics = await dashboardAnalyticsService.getStudentAnalytics(student.studentId);

    res.json(analytics);

  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};