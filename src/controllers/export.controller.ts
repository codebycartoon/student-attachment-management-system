/**
 * Export Controller
 * Handles data export requests for analytics and reporting
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { exportService } from '../services/export.service';
import { eventSystemService } from '../services/event-system.service';

// Validation schemas
const exportOptionsSchema = z.object({
  format: z.enum(['json', 'csv', 'excel', 'pdf']).default('json'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  industry: z.string().optional(),
  university: z.string().optional(),
  location: z.string().optional(),
  gpaRange: z.string().optional(),
  skillCategory: z.string().optional()
});

/**
 * Export applications data
 */
export const exportApplications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedOptions = exportOptionsSchema.parse(req.query);

    const options = {
      format: validatedOptions.format,
      dateRange: validatedOptions.from && validatedOptions.to ? {
        from: new Date(validatedOptions.from),
        to: new Date(validatedOptions.to)
      } : undefined,
      filters: {
        industry: validatedOptions.industry,
        university: validatedOptions.university,
        location: validatedOptions.location,
        gpaRange: validatedOptions.gpaRange,
        skillCategory: validatedOptions.skillCategory
      }
    };

    const result = await exportService.exportApplications(options);

    // Log export action
    await eventSystemService.logEvent({
      type: 'export.applications',
      level: 'INFO',
      action: 'export_applications',
      details: `Admin exported applications data (${validatedOptions.format})`,
      userId: req.user.userId,
      metadata: {
        format: validatedOptions.format,
        recordCount: result.recordCount,
        filters: options.filters
      }
    });

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    if (validatedOptions.format !== 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    if (validatedOptions.format === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export parameters',
        errors: error.errors
      });
    }

    console.error('Export applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications data'
    });
  }
};

/**
 * Export placements data
 */
export const exportPlacements = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedOptions = exportOptionsSchema.parse(req.query);

    const options = {
      format: validatedOptions.format,
      dateRange: validatedOptions.from && validatedOptions.to ? {
        from: new Date(validatedOptions.from),
        to: new Date(validatedOptions.to)
      } : undefined,
      filters: {
        industry: validatedOptions.industry,
        university: validatedOptions.university,
        location: validatedOptions.location,
        gpaRange: validatedOptions.gpaRange,
        skillCategory: validatedOptions.skillCategory
      }
    };

    const result = await exportService.exportPlacements(options);

    // Log export action
    await eventSystemService.logEvent({
      type: 'export.placements',
      level: 'INFO',
      action: 'export_placements',
      details: `Admin exported placements data (${validatedOptions.format})`,
      userId: req.user.userId,
      metadata: {
        format: validatedOptions.format,
        recordCount: result.recordCount,
        filters: options.filters
      }
    });

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    if (validatedOptions.format !== 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    if (validatedOptions.format === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export parameters',
        errors: error.errors
      });
    }

    console.error('Export placements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export placements data'
    });
  }
};

/**
 * Export students data
 */
export const exportStudents = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedOptions = exportOptionsSchema.parse(req.query);

    const options = {
      format: validatedOptions.format,
      filters: {
        university: validatedOptions.university,
        location: validatedOptions.location,
        gpaRange: validatedOptions.gpaRange,
        skillCategory: validatedOptions.skillCategory
      }
    };

    const result = await exportService.exportStudents(options);

    // Log export action
    await eventSystemService.logEvent({
      type: 'export.students',
      level: 'INFO',
      action: 'export_students',
      details: `Admin exported students data (${validatedOptions.format})`,
      userId: req.user.userId,
      metadata: {
        format: validatedOptions.format,
        recordCount: result.recordCount,
        filters: options.filters
      }
    });

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    if (validatedOptions.format !== 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    if (validatedOptions.format === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export parameters',
        errors: error.errors
      });
    }

    console.error('Export students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export students data'
    });
  }
};

/**
 * Export companies data
 */
export const exportCompanies = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedOptions = exportOptionsSchema.parse(req.query);

    const options = {
      format: validatedOptions.format,
      filters: {
        industry: validatedOptions.industry,
        location: validatedOptions.location
      }
    };

    const result = await exportService.exportCompanies(options);

    // Log export action
    await eventSystemService.logEvent({
      type: 'export.companies',
      level: 'INFO',
      action: 'export_companies',
      details: `Admin exported companies data (${validatedOptions.format})`,
      userId: req.user.userId,
      metadata: {
        format: validatedOptions.format,
        recordCount: result.recordCount,
        filters: options.filters
      }
    });

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    if (validatedOptions.format !== 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    if (validatedOptions.format === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export parameters',
        errors: error.errors
      });
    }

    console.error('Export companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export companies data'
    });
  }
};

/**
 * Export analytics report
 */
export const exportAnalyticsReport = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { timeframe = 'month', format = 'json' } = req.query;

    const validatedTimeframe = z.enum(['week', 'month', 'quarter']).parse(timeframe);
    const validatedFormat = z.enum(['json', 'csv', 'pdf']).parse(format);

    const result = await exportService.exportAnalyticsReport(validatedTimeframe, validatedFormat);

    // Log export action
    await eventSystemService.logEvent({
      type: 'export.analytics_report',
      level: 'INFO',
      action: 'export_analytics_report',
      details: `Admin exported analytics report (${validatedFormat}, ${validatedTimeframe})`,
      userId: req.user.userId,
      metadata: {
        format: validatedFormat,
        timeframe: validatedTimeframe
      }
    });

    // Set response headers
    res.setHeader('Content-Type', result.contentType);
    if (validatedFormat !== 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    if (validatedFormat === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export parameters',
        errors: error.errors
      });
    }

    console.error('Export analytics report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics report'
    });
  }
};

/**
 * Get export statistics
 */
export const getExportStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { days = 30 } = req.query;
    const daysNum = Math.min(Math.max(Number(days), 1), 365);

    const stats = await exportService.getExportStats(daysNum);

    res.json({
      success: true,
      data: stats,
      period: `${daysNum} days`
    });

  } catch (error: any) {
    console.error('Get export stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get export statistics'
    });
  }
};