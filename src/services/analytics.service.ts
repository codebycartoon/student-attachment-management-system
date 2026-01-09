/**
 * Analytics Service
 * Core analytics engine for platform intelligence and reporting
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FunnelMetrics {
  applicationToInterviewRate: number;
  interviewToPlacementRate: number;
  applicationToPlacementRate: number;
  dropOffStages: {
    afterApplication: number;
    afterInterview: number;
  };
}

export interface StudentPerformanceMetrics {
  avgMatchScoreOfPlaced: number;
  placementRateByGPA: Array<{
    gpaRange: string;
    placementRate: number;
    totalStudents: number;
    placedStudents: number;
  }>;
  placementRateByUniversity: Array<{
    university: string;
    placementRate: number;
    totalStudents: number;
    placedStudents: number;
  }>;
  placementRateBySkill: Array<{
    skill: string;
    placementRate: number;
    totalStudents: number;
    placedStudents: number;
  }>;
}

export interface CompanyQualityMetrics {
  applicantsPerOpportunity: number;
  interviewToPlacementRate: number;
  averageTimeToHire: number;
  offerAcceptanceRate: number;
  topPerformingCompanies: Array<{
    companyName: string;
    opportunities: number;
    applications: number;
    placements: number;
    successRate: number;
  }>;
}

export interface MatchingAlgorithmMetrics {
  avgMatchScoreOfPlaced: number;
  avgMatchScoreOfRejected: number;
  falsePositives: number; // High score but rejected
  falseNegatives: number; // Low score but placed
  algorithmAccuracy: number;
  scoreDistribution: Array<{
    scoreRange: string;
    count: number;
    placementRate: number;
  }>;
}

export interface SystemHealthMetrics {
  failedJobs: number;
  notificationBacklog: number;
  matchRecomputationDelays: number;
  errorSpikes: number;
  avgDbQueryTime: number;
  systemUptime: number;
}

export interface OverviewKPIs {
  activeStudents: number;
  activeCompanies: number;
  opportunitiesOpen: number;
  applicationsThisMonth: number;
  interviewsScheduled: number;
  placementsThisMonth: number;
  placementSuccessRate: number;
  avgMatchScoreOfPlacements: number;
}

export interface GeographicMetrics {
  locationBreakdown: Array<{
    location: string;
    students: number;
    companies: number;
    opportunities: number;
    placements: number;
  }>;
  topCities: Array<{
    city: string;
    activity: number;
    successRate: number;
  }>;
}

export interface TrendData {
  placementTrends: Array<{
    month: string;
    placements: number;
    applications: number;
    successRate: number;
  }>;
  applicationTrends: Array<{
    month: string;
    applications: number;
    interviews: number;
    placements: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get overview KPIs for admin dashboard
   */
  async getOverviewKPIs(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<OverviewKPIs> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      activeStudents,
      activeCompanies,
      opportunitiesOpen,
      applicationsThisMonth,
      interviewsScheduled,
      placementsThisMonth,
      totalApplications,
      totalPlacements,
      avgMatchScore
    ] = await Promise.all([
      // Active students (with recent activity)
      prisma.student.count({
        where: {
          user: { status: 'ACTIVE' },
          OR: [
            { applications: { some: { appliedAt: { gte: startDate } } } },
            { updatedAt: { gte: startDate } }
          ]
        }
      }),

      // Active companies (with recent activity)
      prisma.company.count({
        where: {
          user: { status: 'ACTIVE' },
          OR: [
            { opportunities: { some: { createdAt: { gte: startDate } } } },
            { updatedAt: { gte: startDate } }
          ]
        }
      }),

      // Open opportunities
      prisma.opportunity.count({
        where: { status: 'ACTIVE' }
      }),

      // Applications this period
      prisma.application.count({
        where: { appliedAt: { gte: startDate } }
      }),

      // Scheduled interviews
      prisma.interview.count({
        where: {
          status: 'SCHEDULED',
          scheduledDate: { gte: now }
        }
      }),

      // Placements this period
      prisma.placement.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Total applications for success rate
      prisma.application.count(),

      // Total placements for success rate
      prisma.placement.count(),

      // Average match score of placed candidates using Prisma
      prisma.matchScore.aggregate({
        where: {
          totalScore: { gt: 0 },
          student: {
            applications: {
              some: {
                placement: { isNot: null }
              }
            }
          }
        },
        _avg: {
          totalScore: true
        }
      })
    ]);

    const placementSuccessRate = totalApplications > 0 ? (totalPlacements / totalApplications) * 100 : 0;
    const avgMatchScoreOfPlacements = avgMatchScore._avg.totalScore || 0;

    return {
      activeStudents,
      activeCompanies,
      opportunitiesOpen,
      applicationsThisMonth,
      interviewsScheduled,
      placementsThisMonth,
      placementSuccessRate: Math.round(placementSuccessRate * 100) / 100,
      avgMatchScoreOfPlacements: Math.round(avgMatchScoreOfPlacements * 100) / 100
    };
  }

  /**
   * Calculate funnel metrics (Application → Interview → Placement)
   */
  async getFunnelMetrics(timeframe: number = 90): Promise<FunnelMetrics> {
    const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

    // Get applications in timeframe
    const applications = await prisma.application.findMany({
      where: { appliedAt: { gte: startDate } },
      include: {
        interviews: true,
        placement: true
      }
    });

    const totalApplications = applications.length;
    const applicationsWithInterviews = applications.filter(app => app.interviews.length > 0).length;
    const applicationsWithPlacements = applications.filter(app => app.placement).length;

    const applicationToInterviewRate = totalApplications > 0 ? (applicationsWithInterviews / totalApplications) * 100 : 0;
    const interviewToPlacementRate = applicationsWithInterviews > 0 ? (applicationsWithPlacements / applicationsWithInterviews) * 100 : 0;
    const applicationToPlacementRate = totalApplications > 0 ? (applicationsWithPlacements / totalApplications) * 100 : 0;

    return {
      applicationToInterviewRate: Math.round(applicationToInterviewRate * 100) / 100,
      interviewToPlacementRate: Math.round(interviewToPlacementRate * 100) / 100,
      applicationToPlacementRate: Math.round(applicationToPlacementRate * 100) / 100,
      dropOffStages: {
        afterApplication: Math.round((totalApplications - applicationsWithInterviews) / totalApplications * 100 * 100) / 100,
        afterInterview: Math.round((applicationsWithInterviews - applicationsWithPlacements) / applicationsWithInterviews * 100 * 100) / 100
      }
    };
  }

  /**
   * Get student performance metrics
   */
  async getStudentPerformanceMetrics(): Promise<StudentPerformanceMetrics> {
    // Average match score of placed students
    const placedApplications = await prisma.application.findMany({
      where: { placement: { isNot: null } },
      select: { matchScore: true }
    });

    const avgMatchScoreOfPlaced = placedApplications.length > 0 ? 
      placedApplications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / placedApplications.length : 0;

    // Placement rate by GPA (simplified)
    const studentsWithGPA = await prisma.student.findMany({
      include: {
        profile: true,
        applications: {
          include: { placement: true }
        }
      },
      where: {
        profile: {
          gpa: { not: null }
        }
      }
    });

    const gpaRanges = [
      { range: 'High (3.5+)', min: 3.5, max: 4.0 },
      { range: 'Medium (3.0-3.5)', min: 3.0, max: 3.5 },
      { range: 'Low (2.5-3.0)', min: 2.5, max: 3.0 },
      { range: 'Very Low (<2.5)', min: 0, max: 2.5 }
    ];

    const placementRateByGPA = gpaRanges.map(range => {
      const studentsInRange = studentsWithGPA.filter(s => 
        s.profile?.gpa && s.profile.gpa >= range.min && s.profile.gpa < range.max
      );
      const placedStudents = studentsInRange.filter(s => 
        s.applications.some(app => app.placement)
      );

      return {
        gpaRange: range.range,
        placementRate: studentsInRange.length > 0 ? 
          Math.round((placedStudents.length / studentsInRange.length) * 100 * 100) / 100 : 0,
        totalStudents: studentsInRange.length,
        placedStudents: placedStudents.length
      };
    });

    // Simplified university and skill metrics
    const placementRateByUniversity: Array<{
      university: string;
      placementRate: number;
      totalStudents: number;
      placedStudents: number;
    }> = [];

    const placementRateBySkill: Array<{
      skill: string;
      placementRate: number;
      totalStudents: number;
      placedStudents: number;
    }> = [];

    return {
      avgMatchScoreOfPlaced: Math.round(avgMatchScoreOfPlaced * 100) / 100,
      placementRateByGPA,
      placementRateByUniversity,
      placementRateBySkill
    };
  }

  /**
   * Get company quality metrics
   */
  async getCompanyQualityMetrics(): Promise<CompanyQualityMetrics> {
    // Get all opportunities with their applications
    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      include: {
        applications: {
          include: {
            interviews: true,
            placement: true
          }
        },
        company: true
      }
    });

    // Calculate applicants per opportunity
    const totalApplications = opportunities.reduce((sum, opp) => sum + opp.applications.length, 0);
    const applicantsPerOpportunity = opportunities.length > 0 ? totalApplications / opportunities.length : 0;

    // Calculate interview to placement rate
    const totalInterviews = opportunities.reduce((sum, opp) => 
      sum + opp.applications.reduce((appSum, app) => appSum + app.interviews.length, 0), 0
    );
    const totalPlacements = opportunities.reduce((sum, opp) => 
      sum + opp.applications.filter(app => app.placement).length, 0
    );
    const interviewToPlacementRate = totalInterviews > 0 ? (totalPlacements / totalInterviews) * 100 : 0;

    // Calculate average time to hire (simplified)
    const placementsWithTiming = await prisma.placement.findMany({
      include: {
        application: true
      }
    });

    const avgTimeToHire = placementsWithTiming.length > 0 ? 
      placementsWithTiming.reduce((sum, placement) => {
        const days = (placement.createdAt.getTime() - placement.application.appliedAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / placementsWithTiming.length : 0;

    // Calculate offer acceptance rate (assuming placements are accepted offers)
    const activePlacements = await prisma.placement.count({ where: { status: 'ACTIVE' } });
    const totalPlacementsCount = await prisma.placement.count();
    const offerAcceptanceRate = totalPlacementsCount > 0 ? (activePlacements / totalPlacementsCount) * 100 : 0;

    // Top performing companies (simplified)
    const companies = await prisma.company.findMany({
      include: {
        opportunities: {
          include: {
            applications: {
              include: { placement: true }
            }
          }
        }
      }
    });

    const topPerformingCompanies = companies
      .map(company => {
        const allApplications = company.opportunities.flatMap(opp => opp.applications);
        const placements = allApplications.filter(app => app.placement);
        const successRate = allApplications.length > 0 ? (placements.length / allApplications.length) * 100 : 0;

        return {
          companyName: company.companyName,
          opportunities: company.opportunities.length,
          applications: allApplications.length,
          placements: placements.length,
          successRate: Math.round(successRate * 100) / 100
        };
      })
      .filter(company => company.applications >= 5)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    return {
      applicantsPerOpportunity: Math.round(applicantsPerOpportunity * 100) / 100,
      interviewToPlacementRate: Math.round(interviewToPlacementRate * 100) / 100,
      averageTimeToHire: Math.round(avgTimeToHire * 100) / 100,
      offerAcceptanceRate: Math.round(offerAcceptanceRate * 100) / 100,
      topPerformingCompanies
    };
  }

  /**
   * Get matching algorithm performance metrics
   */
  async getMatchingAlgorithmMetrics(): Promise<MatchingAlgorithmMetrics> {
    // Get applications with their match scores and outcomes
    const applicationsWithScores = await prisma.application.findMany({
      include: {
        placement: true,
        student: {
          include: {
            matchScores: true
          }
        }
      }
    });

    // Calculate averages for placed vs rejected
    const placedScores: number[] = [];
    const rejectedScores: number[] = [];

    applicationsWithScores.forEach(application => {
      const matchScore = application.student.matchScores.find(score => 
        score.opportunityId === application.opportunityId
      );
      
      if (matchScore) {
        if (application.placement) {
          placedScores.push(matchScore.totalScore);
        } else if (application.status === 'REJECTED') {
          rejectedScores.push(matchScore.totalScore);
        }
      }
    });

    const avgMatchScoreOfPlaced = placedScores.length > 0 ? 
      placedScores.reduce((sum, score) => sum + score, 0) / placedScores.length : 0;
    
    const avgMatchScoreOfRejected = rejectedScores.length > 0 ? 
      rejectedScores.reduce((sum, score) => sum + score, 0) / rejectedScores.length : 0;

    // Calculate false positives and negatives using the applications data
    const falsePositives = applicationsWithScores.filter(application => {
      const matchScore = application.student.matchScores.find(score => 
        score.opportunityId === application.opportunityId
      );
      return matchScore && matchScore.totalScore >= 0.7 && application.status === 'REJECTED';
    }).length;

    const falseNegatives = applicationsWithScores.filter(application => {
      const matchScore = application.student.matchScores.find(score => 
        score.opportunityId === application.opportunityId
      );
      return matchScore && matchScore.totalScore < 0.5 && application.placement;
    }).length;

    // Calculate algorithm accuracy
    const allMatchScores = await prisma.matchScore.findMany();
    const totalHighScores = allMatchScores.filter(score => score.totalScore >= 0.7).length;
    const totalLowScores = allMatchScores.filter(score => score.totalScore < 0.5).length;
    const accuracy = totalHighScores + totalLowScores > 0 ? 
      ((totalHighScores - falsePositives + totalLowScores - falseNegatives) / 
       (totalHighScores + totalLowScores)) * 100 : 0;

    // Score distribution
    const scoreRanges = [
      { range: 'Excellent (80-100%)', min: 0.8, max: 1.0 },
      { range: 'Good (60-80%)', min: 0.6, max: 0.8 },
      { range: 'Fair (40-60%)', min: 0.4, max: 0.6 },
      { range: 'Poor (20-40%)', min: 0.2, max: 0.4 },
      { range: 'Very Poor (0-20%)', min: 0.0, max: 0.2 }
    ];

    const scoreDistribution = scoreRanges.map(range => {
      const scoresInRange = allMatchScores.filter(score => 
        score.totalScore >= range.min && score.totalScore < range.max
      );
      const placedInRange = applicationsWithScores.filter(application => {
        const matchScore = application.student.matchScores.find(score => 
          score.opportunityId === application.opportunityId
        );
        return matchScore && 
               matchScore.totalScore >= range.min && 
               matchScore.totalScore < range.max && 
               application.placement;
      }).length;

      return {
        scoreRange: range.range,
        count: scoresInRange.length,
        placementRate: scoresInRange.length > 0 ? 
          Math.round((placedInRange / scoresInRange.length) * 100 * 100) / 100 : 0
      };
    });

    return {
      avgMatchScoreOfPlaced: Math.round(avgMatchScoreOfPlaced * 100) / 100,
      avgMatchScoreOfRejected: Math.round(avgMatchScoreOfRejected * 100) / 100,
      falsePositives,
      falseNegatives,
      algorithmAccuracy: Math.round(accuracy * 100) / 100,
      scoreDistribution
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      failedJobs,
      notificationBacklog,
      matchRecomputationDelays,
      errorSpikes,
      recentLogs
    ] = await Promise.all([
      // Failed jobs in queue
      prisma.queue.count({
        where: { status: 'FAILED' }
      }),

      // Notification backlog
      prisma.queue.count({
        where: {
          taskType: { contains: 'notification' },
          status: 'PENDING'
        }
      }),

      // Match recomputation delays
      prisma.recomputationQueue.count({
        where: {
          status: 'PENDING',
          createdAt: { lt: oneHourAgo }
        }
      }),

      // Error spikes in last hour
      prisma.systemLog.count({
        where: {
          level: 'ERROR',
          createdAt: { gte: oneHourAgo }
        }
      }),

      // Recent system logs for query time analysis
      prisma.systemLog.findMany({
        where: {
          createdAt: { gte: oneDayAgo }
        },
        take: 100
      })
    ]);

    // Calculate average "DB query time" (simulated from log processing time)
    const avgDbQueryTime = recentLogs.length > 0 ? 
      recentLogs.reduce((acc, log) => acc + (log.createdAt.getTime() % 1000), 0) / recentLogs.length : 0;

    // System uptime (simplified - time since oldest active session)
    const oldestSession = await prisma.userSession.findFirst({
      where: { expiresAt: { gt: now } },
      orderBy: { createdAt: 'asc' }
    });

    const systemUptime = oldestSession ? 
      (now.getTime() - oldestSession.createdAt.getTime()) / (1000 * 60 * 60) : 0;

    return {
      failedJobs,
      notificationBacklog,
      matchRecomputationDelays,
      errorSpikes,
      avgDbQueryTime: Math.round(avgDbQueryTime * 100) / 100,
      systemUptime: Math.round(systemUptime * 100) / 100
    };
  }

  /**
   * Get geographic metrics
   */
  async getGeographicMetrics(): Promise<GeographicMetrics> {
    // Get location data from students and companies
    const [students, companies, opportunities] = await Promise.all([
      prisma.student.findMany({
        where: { location: { not: null } },
        include: { applications: { include: { placement: true } } }
      }),
      prisma.company.findMany({
        where: { location: { not: null } },
        include: { opportunities: true }
      }),
      prisma.opportunity.findMany({
        where: { location: { not: null } },
        include: { applications: { include: { placement: true } } }
      })
    ]);

    // Group by location
    const locationMap = new Map<string, {
      students: number;
      companies: number;
      opportunities: number;
      placements: number;
    }>();

    // Count students by location
    students.forEach(student => {
      if (student.location) {
        const current = locationMap.get(student.location) || { students: 0, companies: 0, opportunities: 0, placements: 0 };
        current.students++;
        current.placements += student.applications.filter(app => app.placement).length;
        locationMap.set(student.location, current);
      }
    });

    // Count companies by location
    companies.forEach(company => {
      if (company.location) {
        const current = locationMap.get(company.location) || { students: 0, companies: 0, opportunities: 0, placements: 0 };
        current.companies++;
        current.opportunities += company.opportunities.length;
        locationMap.set(company.location, current);
      }
    });

    // Count opportunities by location
    opportunities.forEach(opportunity => {
      if (opportunity.location) {
        const current = locationMap.get(opportunity.location) || { students: 0, companies: 0, opportunities: 0, placements: 0 };
        current.opportunities++;
        locationMap.set(opportunity.location, current);
      }
    });

    const locationBreakdown = Array.from(locationMap.entries()).map(([location, data]) => ({
      location,
      ...data
    })).sort((a, b) => (b.students + b.companies) - (a.students + a.companies)).slice(0, 15);

    const topCities = locationBreakdown.map(location => ({
      city: location.location,
      activity: location.students + location.companies + location.opportunities,
      successRate: location.opportunities > 0 ? 
        Math.round((location.placements / location.opportunities) * 100 * 100) / 100 : 0
    })).sort((a, b) => b.activity - a.activity).slice(0, 10);

    return {
      locationBreakdown,
      topCities
    };
  }

  /**
   * Get trend data over time
   */
  async getTrendData(months: number = 12): Promise<TrendData> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get placement trends by month using Prisma aggregation
    const placements = await prisma.placement.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        application: true
      }
    });

    const applications = await prisma.application.findMany({
      where: {
        appliedAt: { gte: startDate }
      }
    });

    // Group by month manually since Prisma doesn't have native date grouping
    const monthlyData = new Map<string, {
      placements: number;
      applications: number;
      successRate: number;
    }>();

    // Process placements
    placements.forEach(placement => {
      const monthKey = placement.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      const current = monthlyData.get(monthKey) || { placements: 0, applications: 0, successRate: 0 };
      current.placements++;
      monthlyData.set(monthKey, current);
    });

    // Process applications
    applications.forEach(application => {
      const monthKey = application.appliedAt.toISOString().substring(0, 7); // YYYY-MM format
      const current = monthlyData.get(monthKey) || { placements: 0, applications: 0, successRate: 0 };
      current.applications++;
      monthlyData.set(monthKey, current);
    });

    // Calculate success rates
    monthlyData.forEach((data, month) => {
      data.successRate = data.applications > 0 ? 
        Math.round((data.placements / data.applications) * 100 * 100) / 100 : 0;
    });

    // Convert to arrays and sort by month
    const placementTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        placements: data.placements,
        applications: data.applications,
        successRate: data.successRate
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get interview data for application trends
    const interviews = await prisma.interview.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        application: true
      }
    });

    const applicationTrendsData = new Map<string, {
      applications: number;
      interviews: number;
      placements: number;
    }>();

    // Process applications for trends
    applications.forEach(application => {
      const monthKey = application.appliedAt.toISOString().substring(0, 7);
      const current = applicationTrendsData.get(monthKey) || { applications: 0, interviews: 0, placements: 0 };
      current.applications++;
      applicationTrendsData.set(monthKey, current);
    });

    // Process interviews
    interviews.forEach(interview => {
      const monthKey = interview.application.appliedAt.toISOString().substring(0, 7);
      const current = applicationTrendsData.get(monthKey) || { applications: 0, interviews: 0, placements: 0 };
      current.interviews++;
      applicationTrendsData.set(monthKey, current);
    });

    // Process placements for application trends
    placements.forEach(placement => {
      const monthKey = placement.application.appliedAt.toISOString().substring(0, 7);
      const current = applicationTrendsData.get(monthKey) || { applications: 0, interviews: 0, placements: 0 };
      current.placements++;
      applicationTrendsData.set(monthKey, current);
    });

    const applicationTrends = Array.from(applicationTrendsData.entries())
      .map(([month, data]) => ({
        month,
        applications: data.applications,
        interviews: data.interviews,
        placements: data.placements
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      placementTrends,
      applicationTrends
    };
  }

  /**
   * Get comprehensive analytics report
   */
  async getComprehensiveReport(timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const [
      overview,
      funnel,
      studentPerformance,
      companyQuality,
      matchingAlgorithm,
      systemHealth,
      geographic,
      trends
    ] = await Promise.all([
      this.getOverviewKPIs(timeframe),
      this.getFunnelMetrics(timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90),
      this.getStudentPerformanceMetrics(),
      this.getCompanyQualityMetrics(),
      this.getMatchingAlgorithmMetrics(),
      this.getSystemHealthMetrics(),
      this.getGeographicMetrics(),
      this.getTrendData(timeframe === 'week' ? 3 : timeframe === 'month' ? 6 : 12)
    ]);

    return {
      overview,
      funnel,
      studentPerformance,
      companyQuality,
      matchingAlgorithm,
      systemHealth,
      geographic,
      trends,
      generatedAt: new Date(),
      timeframe
    };
  }
}

export const analyticsService = new AnalyticsService();