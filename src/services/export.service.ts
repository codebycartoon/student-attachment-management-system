/**
 * Export Service
 * Handles data export in various formats for analytics and reporting
 */

import { PrismaClient } from '@prisma/client';
import { analyticsService } from './analytics.service';

const prisma = new PrismaClient();

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: {
    industry?: string;
    university?: string;
    location?: string;
    gpaRange?: string;
    skillCategory?: string;
  };
}

export interface ExportResult {
  success: boolean;
  data?: any;
  filename: string;
  contentType: string;
  size?: number;
  recordCount?: number;
}

export class ExportService {
  /**
   * Export applications data
   */
  async exportApplications(options: ExportOptions): Promise<ExportResult> {
    try {
      const whereClause: any = {};

      // Apply date range filter
      if (options.dateRange) {
        whereClause.appliedAt = {
          gte: options.dateRange.from,
          lte: options.dateRange.to
        };
      }

      // Apply industry filter
      if (options.filters?.industry) {
        whereClause.opportunity = {
          industry: options.filters.industry
        };
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: { select: { email: true } },
              profile: {
                include: {
                  university: true,
                  degree: true,
                  major: true
                }
              }
            }
          },
          opportunity: {
            include: {
              company: true
            }
          },
          interviews: true,
          placement: true
        },
        orderBy: { appliedAt: 'desc' }
      });

      // Transform data for export
      const exportData = applications.map(app => ({
        applicationId: app.applicationId,
        studentName: `${app.student.firstName} ${app.student.lastName}`,
        studentEmail: app.student.user.email,
        university: app.student.profile?.university?.name || 'N/A',
        degree: app.student.profile?.degree?.name || 'N/A',
        major: app.student.profile?.major?.name || 'N/A',
        gpa: app.student.profile?.gpa || 'N/A',
        opportunityTitle: app.opportunity.title,
        companyName: app.opportunity.company.companyName,
        industry: app.opportunity.industry || 'N/A',
        location: app.opportunity.location || 'N/A',
        applicationStatus: app.status,
        appliedAt: app.appliedAt,
        matchScore: app.matchScore || 'N/A',
        interviewsCount: app.interviews.length,
        hasPlacement: !!app.placement,
        placementStatus: app.placement?.status || 'N/A'
      }));

      return this.formatExportData(exportData, 'applications', options.format);

    } catch (error) {
      console.error('Export applications error:', error);
      throw error;
    }
  }

  /**
   * Export placements data
   */
  async exportPlacements(options: ExportOptions): Promise<ExportResult> {
    try {
      const whereClause: any = {};

      // Apply date range filter
      if (options.dateRange) {
        whereClause.createdAt = {
          gte: options.dateRange.from,
          lte: options.dateRange.to
        };
      }

      // Apply industry filter through opportunity
      if (options.filters?.industry) {
        whereClause.application = {
          opportunity: {
            industry: options.filters.industry
          }
        };
      }

      const placements = await prisma.placement.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              student: {
                include: {
                  user: { select: { email: true } },
                  profile: {
                    include: {
                      university: true,
                      degree: true,
                      major: true
                    }
                  }
                }
              },
              opportunity: {
                include: {
                  company: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform data for export
      const exportData = placements.map(placement => ({
        placementId: placement.placementId,
        studentName: `${placement.application.student.firstName} ${placement.application.student.lastName}`,
        studentEmail: placement.application.student.user.email,
        university: placement.application.student.profile?.university?.name || 'N/A',
        degree: placement.application.student.profile?.degree?.name || 'N/A',
        major: placement.application.student.profile?.major?.name || 'N/A',
        gpa: placement.application.student.profile?.gpa || 'N/A',
        opportunityTitle: placement.application.opportunity.title,
        companyName: placement.application.opportunity.company.companyName,
        industry: placement.application.opportunity.industry || 'N/A',
        location: placement.application.opportunity.location || 'N/A',
        startDate: placement.startDate,
        endDate: placement.endDate,
        status: placement.status,
        salary: placement.salary || 'N/A',
        currency: placement.currency || 'N/A',
        duration: placement.endDate ? 
          Math.ceil((placement.endDate.getTime() - placement.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
          'Ongoing',
        placedAt: placement.createdAt
      }));

      return this.formatExportData(exportData, 'placements', options.format);

    } catch (error) {
      console.error('Export placements error:', error);
      throw error;
    }
  }

  /**
   * Export students data
   */
  async exportStudents(options: ExportOptions): Promise<ExportResult> {
    try {
      const whereClause: any = {};

      // Apply university filter
      if (options.filters?.university) {
        whereClause.profile = {
          university: {
            name: options.filters.university
          }
        };
      }

      // Apply location filter
      if (options.filters?.location) {
        whereClause.location = options.filters.location;
      }

      const students = await prisma.student.findMany({
        where: whereClause,
        include: {
          user: { select: { email: true, status: true, createdAt: true } },
          profile: {
            include: {
              university: true,
              degree: true,
              major: true
            }
          },
          skills: {
            include: {
              skill: true
            }
          },
          applications: {
            include: {
              opportunity: {
                include: {
                  company: true
                }
              },
              placement: true
            }
          },
          metrics: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform data for export
      const exportData = students.map(student => {
        const applications = student.applications;
        const placements = applications.filter(app => app.placement);
        const skills = student.skills.map(s => s.skill.name).join(', ');

        return {
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          email: student.user.email,
          phone: student.phone || 'N/A',
          location: student.location || 'N/A',
          university: student.profile?.university?.name || 'N/A',
          degree: student.profile?.degree?.name || 'N/A',
          major: student.profile?.major?.name || 'N/A',
          gpa: student.profile?.gpa || 'N/A',
          graduationDate: student.profile?.graduationDate || 'N/A',
          skills: skills || 'N/A',
          skillCount: student.skills.length,
          applicationsCount: applications.length,
          placementsCount: placements.length,
          successRate: applications.length > 0 ? 
            Math.round((placements.length / applications.length) * 100) : 0,
          hireabilityScore: student.metrics?.hireabilityScore || 'N/A',
          skillScore: student.metrics?.skillScore || 'N/A',
          academicScore: student.metrics?.academicScore || 'N/A',
          experienceScore: student.metrics?.experienceScore || 'N/A',
          accountStatus: student.user.status,
          registeredAt: student.user.createdAt
        };
      });

      return this.formatExportData(exportData, 'students', options.format);

    } catch (error) {
      console.error('Export students error:', error);
      throw error;
    }
  }

  /**
   * Export companies data
   */
  async exportCompanies(options: ExportOptions): Promise<ExportResult> {
    try {
      const whereClause: any = {};

      // Apply industry filter
      if (options.filters?.industry) {
        whereClause.industry = options.filters.industry;
      }

      // Apply location filter
      if (options.filters?.location) {
        whereClause.location = options.filters.location;
      }

      const companies = await prisma.company.findMany({
        where: whereClause,
        include: {
          user: { select: { email: true, status: true, createdAt: true } },
          profile: true,
          opportunities: {
            include: {
              applications: {
                include: {
                  placement: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform data for export
      const exportData = companies.map(company => {
        const opportunities = company.opportunities;
        const applications = opportunities.flatMap(opp => opp.applications);
        const placements = applications.filter(app => app.placement);

        return {
          companyId: company.companyId,
          companyName: company.companyName,
          email: company.user.email,
          industry: company.industry || 'N/A',
          location: company.location || 'N/A',
          website: company.website || 'N/A',
          employeeCount: company.profile?.employeeCount || 'N/A',
          foundedYear: company.profile?.foundedYear || 'N/A',
          companyType: company.profile?.companyType || 'N/A',
          opportunitiesCount: opportunities.length,
          activeOpportunities: opportunities.filter(opp => opp.status === 'ACTIVE').length,
          applicationsReceived: applications.length,
          placementsMade: placements.length,
          hiringSuccessRate: applications.length > 0 ? 
            Math.round((placements.length / applications.length) * 100) : 0,
          avgApplicationsPerOpportunity: opportunities.length > 0 ? 
            Math.round(applications.length / opportunities.length) : 0,
          accountStatus: company.user.status,
          registeredAt: company.user.createdAt
        };
      });

      return this.formatExportData(exportData, 'companies', options.format);

    } catch (error) {
      console.error('Export companies error:', error);
      throw error;
    }
  }

  /**
   * Export comprehensive analytics report
   */
  async exportAnalyticsReport(timeframe: 'week' | 'month' | 'quarter', format: 'json' | 'csv' | 'pdf'): Promise<ExportResult> {
    try {
      const report = await analyticsService.getComprehensiveReport(timeframe);

      // Flatten the report for CSV export
      const flattenedReport = {
        // Overview KPIs
        activeStudents: report.overview.activeStudents,
        activeCompanies: report.overview.activeCompanies,
        opportunitiesOpen: report.overview.opportunitiesOpen,
        applicationsThisMonth: report.overview.applicationsThisMonth,
        interviewsScheduled: report.overview.interviewsScheduled,
        placementsThisMonth: report.overview.placementsThisMonth,
        placementSuccessRate: report.overview.placementSuccessRate,
        avgMatchScoreOfPlacements: report.overview.avgMatchScoreOfPlacements,

        // Funnel Metrics
        applicationToInterviewRate: report.funnel.applicationToInterviewRate,
        interviewToPlacementRate: report.funnel.interviewToPlacementRate,
        applicationToPlacementRate: report.funnel.applicationToPlacementRate,
        dropOffAfterApplication: report.funnel.dropOffStages.afterApplication,
        dropOffAfterInterview: report.funnel.dropOffStages.afterInterview,

        // Student Performance
        avgMatchScoreOfPlaced: report.studentPerformance.avgMatchScoreOfPlaced,
        topUniversityByPlacement: report.studentPerformance.placementRateByUniversity[0]?.university || 'N/A',
        topSkillByPlacement: report.studentPerformance.placementRateBySkill[0]?.skill || 'N/A',

        // Company Quality
        applicantsPerOpportunity: report.companyQuality.applicantsPerOpportunity,
        companyInterviewToPlacementRate: report.companyQuality.interviewToPlacementRate,
        averageTimeToHire: report.companyQuality.averageTimeToHire,
        offerAcceptanceRate: report.companyQuality.offerAcceptanceRate,

        // Matching Algorithm
        algorithmAccuracy: report.matchingAlgorithm.algorithmAccuracy,
        falsePositives: report.matchingAlgorithm.falsePositives,
        falseNegatives: report.matchingAlgorithm.falseNegatives,

        // System Health
        failedJobs: report.systemHealth.failedJobs,
        notificationBacklog: report.systemHealth.notificationBacklog,
        errorSpikes: report.systemHealth.errorSpikes,
        systemUptime: report.systemHealth.systemUptime,

        // Report Metadata
        generatedAt: report.generatedAt,
        timeframe: report.timeframe
      };

      return this.formatExportData(format === 'csv' ? [flattenedReport] : report, 'analytics-report', format);

    } catch (error) {
      console.error('Export analytics report error:', error);
      throw error;
    }
  }

  /**
   * Format export data based on requested format
   */
  private formatExportData(data: any, type: string, format: 'json' | 'csv' | 'excel' | 'pdf'): ExportResult {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-export-${timestamp}`;

    switch (format) {
      case 'json':
        return {
          success: true,
          data: {
            exportType: type,
            exportedAt: new Date(),
            recordCount: Array.isArray(data) ? data.length : 1,
            data
          },
          filename: `${filename}.json`,
          contentType: 'application/json',
          recordCount: Array.isArray(data) ? data.length : 1
        };

      case 'csv':
        const csvData = this.convertToCSV(data);
        return {
          success: true,
          data: csvData,
          filename: `${filename}.csv`,
          contentType: 'text/csv',
          size: csvData.length,
          recordCount: Array.isArray(data) ? data.length : 1
        };

      case 'excel':
        // For Excel, return CSV format with Excel content type
        const excelData = this.convertToCSV(data);
        return {
          success: true,
          data: excelData,
          filename: `${filename}.xlsx`,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: excelData.length,
          recordCount: Array.isArray(data) ? data.length : 1
        };

      case 'pdf':
        // PDF export would require additional libraries (like puppeteer or jsPDF)
        return {
          success: true,
          data: {
            message: 'PDF export not yet implemented. Please use JSON or CSV format.',
            data
          },
          filename: `${filename}.pdf`,
          contentType: 'application/pdf',
          recordCount: Array.isArray(data) ? data.length : 1
        };

      default:
        return {
          success: true,
          data,
          filename: `${filename}.json`,
          contentType: 'application/json',
          recordCount: Array.isArray(data) ? data.length : 1
        };
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return 'No data available';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle null/undefined values
          if (value === null || value === undefined) {
            return '';
          }
          // Handle strings with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          // Handle dates
          if (value instanceof Date) {
            return value.toISOString();
          }
          return String(value);
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Get export statistics
   */
  async getExportStats(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const exportLogs = await prisma.systemLog.findMany({
        where: {
          action: 'export_analytics',
          createdAt: { gte: startDate }
        },
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      });

      const stats = {
        totalExports: exportLogs.length,
        exportsByType: {} as Record<string, number>,
        exportsByFormat: {} as Record<string, number>,
        exportsByUser: {} as Record<string, number>,
        recentExports: exportLogs.slice(0, 10)
      };

      exportLogs.forEach(log => {
        const metadata = log.metadata as any;
        
        // Count by type
        if (metadata?.type) {
          stats.exportsByType[metadata.type] = (stats.exportsByType[metadata.type] || 0) + 1;
        }
        
        // Count by format
        if (metadata?.format) {
          stats.exportsByFormat[metadata.format] = (stats.exportsByFormat[metadata.format] || 0) + 1;
        }
        
        // Count by user
        if (log.user?.email) {
          stats.exportsByUser[log.user.email] = (stats.exportsByUser[log.user.email] || 0) + 1;
        }
      });

      return stats;

    } catch (error) {
      console.error('Error getting export stats:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();