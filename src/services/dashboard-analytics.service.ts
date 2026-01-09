/**
 * Dashboard Analytics Service
 * Provides comprehensive analytics and insights for all dashboard types
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface AnalyticsData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StudentAnalytics {
  profileCompletion: AnalyticsData;
  applicationSuccess: AnalyticsData;
  matchQuality: AnalyticsData;
  skillGrowth: AnalyticsData;
  applicationTrend: TimeSeriesData[];
  matchScoreTrend: TimeSeriesData[];
  skillDistribution: { skill: string; count: number; avgProficiency: number }[];
}

export interface CompanyAnalytics {
  applicationVolume: AnalyticsData;
  candidateQuality: AnalyticsData;
  timeToHire: AnalyticsData;
  placementSuccess: AnalyticsData;
  applicationTrend: TimeSeriesData[];
  candidateSourceTrend: TimeSeriesData[];
  opportunityPerformance: { title: string; applications: number; avgMatchScore: number }[];
}

export interface AdminAnalytics {
  userGrowth: AnalyticsData;
  platformActivity: AnalyticsData;
  matchingEfficiency: AnalyticsData;
  systemHealth: AnalyticsData;
  userGrowthTrend: TimeSeriesData[];
  applicationVolumeTrend: TimeSeriesData[];
  matchingPerformance: { date: string; computations: number; avgRuntime: number }[];
}

class DashboardAnalyticsService {
  /**
   * Get student dashboard analytics
   */
  async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get student profile completion
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        profile: true,
        skills: true,
        experiences: true,
        projects: true,
        preferences: true,
        documents: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate profile completion
    const completionScore = this.calculateProfileCompletion(student);
    
    // Get applications data
    const [currentApplications, previousApplications] = await Promise.all([
      prisma.application.count({
        where: {
          studentId,
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.application.count({
        where: {
          studentId,
          appliedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get application success rate
    const [acceptedApplications, totalApplications] = await Promise.all([
      prisma.application.count({
        where: {
          studentId,
          status: 'ACCEPTED'
        }
      }),
      prisma.application.count({
        where: { studentId }
      })
    ]);

    const successRate = totalApplications > 0 ? acceptedApplications / totalApplications : 0;

    // Get match quality
    const avgMatchScore = await prisma.matchScore.aggregate({
      where: { studentId },
      _avg: { totalScore: true }
    });

    // Get application trend (last 30 days)
    const applicationTrend = await this.getApplicationTrend(studentId, 30);

    // Get match score trend
    const matchScoreTrend = await this.getMatchScoreTrend(studentId, 30);

    // Get skill distribution
    const skillDistribution = await this.getSkillDistribution(studentId);

    return {
      profileCompletion: {
        current: completionScore,
        previous: completionScore, // Would need historical data
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      applicationSuccess: {
        current: successRate,
        previous: successRate, // Would need historical data
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      matchQuality: {
        current: avgMatchScore._avg.totalScore || 0,
        previous: avgMatchScore._avg.totalScore || 0,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      skillGrowth: {
        current: student.skills.length,
        previous: student.skills.length,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      applicationTrend,
      matchScoreTrend,
      skillDistribution
    };
  }

  /**
   * Get company dashboard analytics
   */
  async getCompanyAnalytics(companyId: string): Promise<CompanyAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get application volume
    const [currentApplications, previousApplications] = await Promise.all([
      prisma.application.count({
        where: {
          opportunity: { companyId },
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.application.count({
        where: {
          opportunity: { companyId },
          appliedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get candidate quality (average match score)
    const avgCandidateQuality = await prisma.application.aggregate({
      where: {
        opportunity: { companyId },
        appliedAt: { gte: thirtyDaysAgo }
      },
      _avg: { matchScore: true }
    });

    // Get time to hire
    const placements = await prisma.placement.findMany({
      where: {
        application: {
          opportunity: { companyId }
        },
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
        application: true
      }
    });

    const avgTimeToHire = placements.length > 0 
      ? placements.reduce((sum, placement) => {
          const days = (placement.createdAt.getTime() - placement.application.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / placements.length
      : 0;

    // Get placement success rate
    const [successfulPlacements, totalApplications] = await Promise.all([
      prisma.placement.count({
        where: {
          application: {
            opportunity: { companyId }
          },
          status: 'ACTIVE'
        }
      }),
      prisma.application.count({
        where: {
          opportunity: { companyId }
        }
      })
    ]);

    const placementSuccessRate = totalApplications > 0 ? successfulPlacements / totalApplications : 0;

    // Get trends
    const applicationTrend = await this.getCompanyApplicationTrend(companyId, 30);
    const candidateSourceTrend = await this.getCandidateSourceTrend(companyId, 30);
    const opportunityPerformance = await this.getOpportunityPerformance(companyId);

    return {
      applicationVolume: this.calculateAnalyticsData(currentApplications, previousApplications),
      candidateQuality: {
        current: avgCandidateQuality._avg.matchScore || 0,
        previous: avgCandidateQuality._avg.matchScore || 0,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      timeToHire: {
        current: avgTimeToHire,
        previous: avgTimeToHire,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      placementSuccess: {
        current: placementSuccessRate,
        previous: placementSuccessRate,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      },
      applicationTrend,
      candidateSourceTrend,
      opportunityPerformance
    };
  }

  /**
   * Get admin dashboard analytics
   */
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get user growth
    const [currentUsers, previousUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get platform activity
    const [currentActivity, previousActivity] = await Promise.all([
      prisma.application.count({
        where: {
          appliedAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.application.count({
        where: {
          appliedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get matching efficiency
    const [currentMatches, previousMatches] = await Promise.all([
      prisma.matchScore.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.matchScore.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Get system health (queue size)
    const queueSize = await prisma.recomputationQueue.count({
      where: { status: 'PENDING' }
    });

    // Get trends
    const userGrowthTrend = await this.getUserGrowthTrend(30);
    const applicationVolumeTrend = await this.getApplicationVolumeTrend(30);
    const matchingPerformance = await this.getMatchingPerformance(30);

    return {
      userGrowth: this.calculateAnalyticsData(currentUsers, previousUsers),
      platformActivity: this.calculateAnalyticsData(currentActivity, previousActivity),
      matchingEfficiency: this.calculateAnalyticsData(currentMatches, previousMatches),
      systemHealth: {
        current: queueSize,
        previous: queueSize,
        change: 0,
        changePercent: 0,
        trend: queueSize > 100 ? 'up' : 'stable'
      },
      userGrowthTrend,
      applicationVolumeTrend,
      matchingPerformance
    };
  }

  // Helper methods

  private calculateProfileCompletion(student: any): number {
    const sections = {
      basicInfo: !!(student.firstName && student.lastName && student.phone && student.location),
      academicInfo: !!(student.profile?.gpa && student.profile?.universityId && student.profile?.degreeId),
      skills: student.skills.length >= 3,
      experience: student.experiences.length >= 1,
      projects: student.projects.length >= 1,
      preferences: student.preferences.length >= 3,
      documents: student.documents.some((doc: any) => doc.documentType === 'CV')
    };

    const completedSections = Object.values(sections).filter(Boolean).length;
    return (completedSections / Object.keys(sections).length) * 100;
  }

  private calculateAnalyticsData(current: number, previous: number): AnalyticsData {
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

    return {
      current,
      previous,
      change,
      changePercent,
      trend
    };
  }

  private async getApplicationTrend(studentId: string, days: number): Promise<TimeSeriesData[]> {
    // Use Prisma aggregation instead of raw SQL
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const applications = await prisma.application.findMany({
      where: {
        studentId,
        appliedAt: { gte: startDate }
      },
      select: {
        appliedAt: true
      }
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    applications.forEach(app => {
      const date = app.appliedAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      value: count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getMatchScoreTrend(studentId: string, days: number): Promise<TimeSeriesData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const matchScores = await prisma.matchScore.findMany({
      where: {
        studentId,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        totalScore: true
      }
    });

    // Group by date and average scores
    const dateGroups: Record<string, { total: number; count: number }> = {};
    matchScores.forEach(score => {
      const date = score.createdAt.toISOString().split('T')[0];
      if (!dateGroups[date]) {
        dateGroups[date] = { total: 0, count: 0 };
      }
      dateGroups[date].total += score.totalScore;
      dateGroups[date].count += 1;
    });

    return Object.entries(dateGroups).map(([date, group]) => ({
      date,
      value: group.total / group.count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getSkillDistribution(studentId: string) {
    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId },
      include: {
        skill: true
      }
    });

    return studentSkills.map(ss => ({
      skill: ss.skill.name,
      count: 1,
      avgProficiency: ss.proficiency
    }));
  }

  private async getCompanyApplicationTrend(companyId: string, days: number): Promise<TimeSeriesData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const applications = await prisma.application.findMany({
      where: {
        opportunity: { companyId },
        appliedAt: { gte: startDate }
      },
      select: {
        appliedAt: true
      }
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    applications.forEach(app => {
      const date = app.appliedAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      value: count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getCandidateSourceTrend(companyId: string, days: number): Promise<TimeSeriesData[]> {
    // Simplified - would track actual source data in a real implementation
    return [];
  }

  private async getOpportunityPerformance(companyId: string) {
    const opportunities = await prisma.opportunity.findMany({
      where: { companyId },
      include: {
        applications: {
          select: {
            matchScore: true
          }
        }
      }
    });

    return opportunities.map(opp => ({
      title: opp.title,
      applications: opp.applications.length,
      avgMatchScore: opp.applications.length > 0 
        ? opp.applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / opp.applications.length
        : 0
    })).sort((a, b) => b.applications - a.applications).slice(0, 10);
  }

  private async getUserGrowthTrend(days: number): Promise<TimeSeriesData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      value: count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getApplicationVolumeTrend(days: number): Promise<TimeSeriesData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const applications = await prisma.application.findMany({
      where: {
        appliedAt: { gte: startDate }
      },
      select: {
        appliedAt: true
      }
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    applications.forEach(app => {
      const date = app.appliedAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      value: count
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getMatchingPerformance(days: number) {
    // Simplified implementation - would use AI logs in real system
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const matchScores = await prisma.matchScore.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const dateGroups: Record<string, number> = {};
    matchScores.forEach(score => {
      const date = score.createdAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups).map(([date, count]) => ({
      date,
      computations: count,
      avgRuntime: 150 // Mock average runtime
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const dashboardAnalyticsService = new DashboardAnalyticsService();