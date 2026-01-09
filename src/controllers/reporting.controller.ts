import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import { reportingService } from '../services/reporting.service';
import { companyService } from '../services/company.service';
import { opportunityService } from '../services/opportunity.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const reportFiltersSchema = z.object({
  timeframe: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  opportunityId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// ============================================================================
// REPORTING & ANALYTICS CONTROLLERS
// ============================================================================

/**
 * Get company dashboard metrics
 * GET /api/v1/company/reports/dashboard
 */
export const getCompanyDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Parse and validate query parameters
    const filters = reportFiltersSchema.parse({
      timeframe: req.query.timeframe,
      opportunityId: req.query.opportunityId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    });

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

    // Convert date strings to Date objects if provided
    const processedFilters = {
      ...filters,
      ...(filters.dateFrom && { dateFrom: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { dateTo: new Date(filters.dateTo) }),
    };

    const metrics = await reportingService.getCompanyDashboardMetrics(
      company.companyId,
      processedFilters
    );

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid filters', details: error.errors });
    }
    logger.error('Error fetching company dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};

/**
 * Get detailed opportunity report
 * GET /api/v1/company/reports/opportunities/:opportunityId
 */
export const getOpportunityReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { opportunityId } = req.params;

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

    const report = await reportingService.getOpportunityReport(opportunityId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error fetching opportunity report:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity report' });
  }
};

/**
 * Get company performance overview
 * GET /api/v1/company/reports/performance
 */
export const getCompanyPerformance = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { timeframe = 'month' } = req.query;

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

    const metrics = await reportingService.getCompanyDashboardMetrics(company.companyId, {
      timeframe: timeframe as any,
    });

    // Extract performance-focused data
    const performance = {
      kpis: metrics.kpis,
      trends: {
        applicationTrends: metrics.trends.applications,
        candidateQuality: metrics.trends.candidateQuality,
      },
      timeframe,
      generatedAt: metrics.generatedAt,
    };

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    logger.error('Error fetching company performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};

/**
 * Get hiring funnel analytics
 * GET /api/v1/company/reports/hiring-funnel
 */
export const getHiringFunnelAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { timeframe = 'month', opportunityId } = req.query;

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

    // If specific opportunity requested, verify ownership
    if (opportunityId) {
      const isOwner = await opportunityService.verifyOpportunityOwnership(
        opportunityId as string, 
        company.companyId
      );
      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied to opportunity' });
      }
    }

    const filters = {
      timeframe: timeframe as any,
      ...(opportunityId && { opportunityId: opportunityId as string }),
    };

    const metrics = await reportingService.getCompanyDashboardMetrics(company.companyId, filters);

    // Build hiring funnel data
    const funnelData = {
      stages: [
        {
          stage: 'Applications Received',
          count: metrics.kpis.totalApplications,
          percentage: 100,
        },
        {
          stage: 'Under Review',
          count: Math.round(metrics.kpis.totalApplications * 0.7), // Estimated
          percentage: 70,
        },
        {
          stage: 'Interviews Scheduled',
          count: Math.round(metrics.kpis.totalApplications * 0.3), // Estimated
          percentage: 30,
        },
        {
          stage: 'Offers Extended',
          count: Math.round(metrics.kpis.totalApplications * (metrics.kpis.applicationConversionRate / 100)),
          percentage: metrics.kpis.applicationConversionRate,
        },
        {
          stage: 'Hires Completed',
          count: metrics.kpis.totalPlacements,
          percentage: metrics.kpis.totalApplications > 0 
            ? Math.round((metrics.kpis.totalPlacements / metrics.kpis.totalApplications) * 100 * 10) / 10
            : 0,
        },
      ],
      conversionRates: {
        applicationToInterview: 30, // Estimated
        interviewToOffer: metrics.kpis.applicationConversionRate,
        offerToHire: 85, // Estimated
        overallConversion: metrics.kpis.totalApplications > 0 
          ? Math.round((metrics.kpis.totalPlacements / metrics.kpis.totalApplications) * 100 * 10) / 10
          : 0,
      },
      timeToHire: {
        average: metrics.kpis.averageTimeToHire,
        unit: 'days',
      },
      timeframe,
      opportunityId: opportunityId || null,
    };

    res.json({
      success: true,
      data: funnelData,
    });
  } catch (error) {
    logger.error('Error fetching hiring funnel analytics:', error);
    res.status(500).json({ error: 'Failed to fetch hiring funnel analytics' });
  }
};

/**
 * Get candidate quality insights
 * GET /api/v1/company/reports/candidate-quality
 */
export const getCandidateQualityInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { timeframe = 'month' } = req.query;

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

    const metrics = await reportingService.getCompanyDashboardMetrics(company.companyId, {
      timeframe: timeframe as any,
    });

    const qualityInsights = {
      overview: {
        averageCandidateQuality: metrics.kpis.averageCandidateQuality,
        totalCandidates: metrics.kpis.totalApplications,
        qualityTrend: 'stable', // Would need historical data to calculate
      },
      qualityDistribution: {
        excellent: Math.round(metrics.kpis.totalApplications * 0.15), // 90-100 score
        good: Math.round(metrics.kpis.totalApplications * 0.25), // 80-89 score
        average: Math.round(metrics.kpis.totalApplications * 0.35), // 70-79 score
        belowAverage: Math.round(metrics.kpis.totalApplications * 0.25), // <70 score
      },
      trends: metrics.trends.candidateQuality,
      recommendations: [
        {
          type: 'skill_requirements',
          title: 'Optimize Skill Requirements',
          description: 'Consider adjusting skill requirements to attract higher quality candidates',
          priority: 'medium',
        },
        {
          type: 'sourcing_channels',
          title: 'Diversify Sourcing Channels',
          description: 'Explore additional channels to reach top-tier candidates',
          priority: 'high',
        },
        {
          type: 'employer_branding',
          title: 'Strengthen Employer Brand',
          description: 'Improve company profile to attract better candidates',
          priority: 'medium',
        },
      ],
      timeframe,
    };

    res.json({
      success: true,
      data: qualityInsights,
    });
  } catch (error) {
    logger.error('Error fetching candidate quality insights:', error);
    res.status(500).json({ error: 'Failed to fetch candidate quality insights' });
  }
};

/**
 * Export company report
 * GET /api/v1/company/reports/export
 */
export const exportCompanyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { format = 'json', timeframe = 'month' } = req.query;

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

    const metrics = await reportingService.getCompanyDashboardMetrics(company.companyId, {
      timeframe: timeframe as any,
    });

    if (format === 'csv') {
      // Generate CSV report
      const csvData = [
        ['Metric', 'Value'],
        ['Total Opportunities', metrics.kpis.totalOpportunities],
        ['Active Opportunities', metrics.kpis.activeOpportunities],
        ['Total Applications', metrics.kpis.totalApplications],
        ['Application Conversion Rate (%)', metrics.kpis.applicationConversionRate],
        ['Average Time to Hire (days)', metrics.kpis.averageTimeToHire],
        ['Total Placements', metrics.kpis.totalPlacements],
        ['Average Candidate Quality', metrics.kpis.averageCandidateQuality],
      ];

      const csvContent = csvData
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="company_report_${company.companyId}_${timeframe}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          company: {
            companyId: company.companyId,
            companyName: company.companyName,
          },
          report: metrics,
          exportedAt: new Date(),
          format: 'json',
        },
      });
    }
  } catch (error) {
    logger.error('Error exporting company report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
};