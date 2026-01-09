/**
 * Analytics Controller
 * Admin analytics and reporting endpoints
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service';
import { eventSystemService } from '../services/event-system.service';

// Validation schemas
const timeframeSchema = z.enum(['week', 'month', 'quarter']).optional();
const exportFormatSchema = z.enum(['json', 'csv', 'pdf']).optional();
const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

/**
 * Get overview KPIs for admin dashboard
 */
export const getOverviewKPIs = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeframe = 'month' } = req.query;
    const validatedTimeframe = timeframeSchema.parse(timeframe);

    const kpis = await analyticsService.getOverviewKPIs(validatedTimeframe || 'month');

    // Log analytics access
    await eventSystemService.logEvent({
      type: 'analytics.overview_accessed',
      level: 'INFO',
      action: 'get_overview_kpis',
      details: `Admin accessed overview KPIs (${validatedTimeframe})`,
      userId: req.user.userId,
      metadata: { timeframe: validatedTimeframe }
    });

    res.json({
      success: true,
      data: kpis,
      timeframe: validatedTimeframe || 'month'
    });

  } catch (error: any) {
    console.error('Get overview KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overview KPIs'
    });
  }
};

/**
 * Get funnel metrics (Application → Interview → Placement)
 */
export const getFunnelMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeframe = 90 } = req.query;
    const days = Math.min(Math.max(Number(timeframe), 7), 365); // Between 7 and 365 days

    const funnel = await analyticsService.getFunnelMetrics(days);

    res.json({
      success: true,
      data: funnel,
      timeframeDays: days
    });

  } catch (error: any) {
    console.error('Get funnel metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get funnel metrics'
    });
  }
};

/**
 * Get student performance analytics
 */
export const getStudentAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const studentMetrics = await analyticsService.getStudentPerformanceMetrics();

    res.json({
      success: true,
      data: studentMetrics
    });

  } catch (error: any) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student analytics'
    });
  }
};

/**
 * Get company quality analytics
 */
export const getCompanyAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const companyMetrics = await analyticsService.getCompanyQualityMetrics();

    res.json({
      success: true,
      data: companyMetrics
    });

  } catch (error: any) {
    console.error('Get company analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get company analytics'
    });
  }
};

/**
 * Get matching algorithm performance
 */
export const getMatchingAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const matchingMetrics = await analyticsService.getMatchingAlgorithmMetrics();

    res.json({
      success: true,
      data: matchingMetrics
    });

  } catch (error: any) {
    console.error('Get matching analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get matching analytics'
    });
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const healthMetrics = await analyticsService.getSystemHealthMetrics();

    res.json({
      success: true,
      data: healthMetrics
    });

  } catch (error: any) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health metrics'
    });
  }
};

/**
 * Get geographic analytics
 */
export const getGeographicAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const geoMetrics = await analyticsService.getGeographicMetrics();

    res.json({
      success: true,
      data: geoMetrics
    });

  } catch (error: any) {
    console.error('Get geographic analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get geographic analytics'
    });
  }
};

/**
 * Get trend data over time
 */
export const getTrendAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { months = 12 } = req.query;
    const monthsNum = Math.min(Math.max(Number(months), 3), 24); // Between 3 and 24 months

    const trends = await analyticsService.getTrendData(monthsNum);

    res.json({
      success: true,
      data: trends,
      months: monthsNum
    });

  } catch (error: any) {
    console.error('Get trend analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trend analytics'
    });
  }
};

/**
 * Get comprehensive analytics report
 */
export const getComprehensiveReport = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeframe = 'month' } = req.query;
    const validatedTimeframe = timeframeSchema.parse(timeframe);

    const report = await analyticsService.getComprehensiveReport(validatedTimeframe || 'month');

    // Log comprehensive report access
    await eventSystemService.logEvent({
      type: 'analytics.comprehensive_report_accessed',
      level: 'INFO',
      action: 'get_comprehensive_report',
      details: `Admin accessed comprehensive analytics report (${validatedTimeframe})`,
      userId: req.user.userId,
      metadata: { timeframe: validatedTimeframe }
    });

    res.json({
      success: true,
      data: report
    });

  } catch (error: any) {
    console.error('Get comprehensive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comprehensive report'
    });
  }
};

/**
 * Export analytics data
 */
export const exportAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { type, format = 'json', timeframe = 'month' } = req.query;
    const validatedFormat = exportFormatSchema.parse(format);
    const validatedTimeframe = timeframeSchema.parse(timeframe);

    let data: any;
    let filename: string;

    switch (type) {
      case 'overview':
        data = await analyticsService.getOverviewKPIs(validatedTimeframe || 'month');
        filename = `overview-kpis-${validatedTimeframe}`;
        break;
      case 'funnel':
        data = await analyticsService.getFunnelMetrics(validatedTimeframe === 'week' ? 7 : validatedTimeframe === 'month' ? 30 : 90);
        filename = `funnel-metrics-${validatedTimeframe}`;
        break;
      case 'students':
        data = await analyticsService.getStudentPerformanceMetrics();
        filename = `student-performance`;
        break;
      case 'companies':
        data = await analyticsService.getCompanyQualityMetrics();
        filename = `company-quality`;
        break;
      case 'matching':
        data = await analyticsService.getMatchingAlgorithmMetrics();
        filename = `matching-algorithm`;
        break;
      case 'comprehensive':
        data = await analyticsService.getComprehensiveReport(validatedTimeframe || 'month');
        filename = `comprehensive-report-${validatedTimeframe}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Log export action
    await eventSystemService.logEvent({
      type: 'analytics.data_exported',
      level: 'INFO',
      action: 'export_analytics',
      details: `Admin exported ${type} analytics data (${validatedFormat})`,
      userId: req.user.userId,
      metadata: { type, format: validatedFormat, timeframe: validatedTimeframe }
    });

    // Handle different export formats
    switch (validatedFormat) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json({
          success: true,
          data,
          exportedAt: new Date(),
          exportedBy: req.user.email
        });
        break;

      case 'csv':
        // Convert to CSV format (simplified)
        const csvData = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csvData);
        break;

      case 'pdf':
        // For PDF, return JSON with instructions (PDF generation would require additional libraries)
        res.json({
          success: true,
          message: 'PDF export not yet implemented. Use JSON or CSV format.',
          data,
          exportedAt: new Date(),
          exportedBy: req.user.email
        });
        break;

      default:
        res.json({
          success: true,
          data,
          exportedAt: new Date(),
          exportedBy: req.user.email
        });
    }

  } catch (error: any) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
};

/**
 * Get real-time analytics dashboard data
 */
export const getRealTimeDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get real-time metrics (last 24 hours)
    const [overview, systemHealth, recentTrends] = await Promise.all([
      analyticsService.getOverviewKPIs('week'),
      analyticsService.getSystemHealthMetrics(),
      analyticsService.getTrendData(1) // Last month for trend context
    ]);

    res.json({
      success: true,
      data: {
        overview,
        systemHealth,
        recentTrends,
        lastUpdated: new Date()
      }
    });

  } catch (error: any) {
    console.error('Get real-time dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time dashboard data'
    });
  }
};

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') {
    return 'No data available';
  }

  // Simple CSV conversion for flat objects
  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
      } else if (Array.isArray(obj[key])) {
        flattened[`${prefix}${key}`] = JSON.stringify(obj[key]);
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }
    return flattened;
  };

  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);

  return [
    headers.join(','),
    values.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\n');
}