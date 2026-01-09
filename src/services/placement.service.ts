/**
 * Placement Service
 * Manages placement offers, acceptances, and tracking
 */

import { PrismaClient, PlacementStatus } from '@prisma/client';
import { notificationService } from './notification.service';
import { webSocketService } from './websocket.service';

const prisma = new PrismaClient();

export interface PlacementOfferData {
  applicationId: string;
  startDate: Date;
  endDate?: Date;
  salary?: number;
  currency?: string;
}

export interface PlacementUpdateData {
  startDate?: Date;
  endDate?: Date;
  status?: PlacementStatus;
  salary?: number;
  currency?: string;
  feedback?: string;
  rating?: number;
  companyRating?: number;
}

export class PlacementService {
  /**
   * Create placement offer
   */
  async createPlacementOffer(data: PlacementOfferData) {
    try {
      // Verify application exists and interview is completed
      const application = await prisma.application.findUnique({
        where: { applicationId: data.applicationId },
        include: {
          student: { include: { user: true } },
          opportunity: { include: { company: true } },
          interviews: true
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Check if there's a completed interview
      const hasCompletedInterview = application.interviews.some(
        interview => interview.status === 'COMPLETED'
      );

      if (!hasCompletedInterview) {
        throw new Error('Cannot create placement offer without completed interview');
      }

      // Check if placement already exists
      const existingPlacement = await prisma.placement.findUnique({
        where: { applicationId: data.applicationId }
      });

      if (existingPlacement) {
        throw new Error('Placement offer already exists for this application');
      }

      // Create placement offer
      const placement = await prisma.placement.create({
        data: {
          applicationId: data.applicationId,
          startDate: data.startDate,
          endDate: data.endDate,
          salary: data.salary,
          currency: data.currency || 'USD',
          status: 'ACTIVE'
        }
      });

      // Update application status
      await prisma.application.update({
        where: { applicationId: data.applicationId },
        data: { status: 'HIRED' }
      });

      // Send notification to student
      await notificationService.sendNotification({
        userId: application.student.userId,
        type: 'PLACEMENT_UPDATE',
        title: `Placement Offer - ${application.opportunity.title}`,
        message: `Congratulations! You have received a placement offer from ${application.opportunity.company.companyName}`,
        actionUrl: `/placements/${placement.placementId}`,
        metadata: {
          placementId: placement.placementId,
          companyName: application.opportunity.company.companyName,
          startDate: placement.startDate,
          salary: placement.salary
        }
      });

      // Send real-time update
      webSocketService.sendDashboardUpdate(application.student.userId, {
        section: 'applications',
        data: {
          applicationId: data.applicationId,
          status: 'HIRED',
          placementOffer: true
        }
      });

      console.log(`🎉 Placement offer created: ${placement.placementId} for application ${data.applicationId}`);
      return placement;

    } catch (error) {
      console.error('Error creating placement offer:', error);
      throw error;
    }
  }

  /**
   * Student accepts placement offer
   */
  async acceptPlacementOffer(placementId: string, studentId: string) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!placement) {
        throw new Error('Placement not found');
      }

      // Verify student owns this placement
      if (placement.application.studentId !== studentId) {
        throw new Error('Unauthorized: Student does not own this placement');
      }

      if (placement.status !== 'ACTIVE') {
        throw new Error('Placement offer is no longer active');
      }

      // Update placement status (keep as ACTIVE but mark as accepted)
      const updatedPlacement = await prisma.placement.update({
        where: { placementId },
        data: {
          status: 'ACTIVE', // Remains active as placement is confirmed
          updatedAt: new Date()
        }
      });

      // Send notification to company
      await notificationService.sendNotification({
        userId: placement.application.opportunity.company.userId,
        type: 'PLACEMENT_UPDATE',
        title: `Placement Accepted - ${placement.application.opportunity.title}`,
        message: `${placement.application.student.firstName} ${placement.application.student.lastName} has accepted the placement offer`,
        actionUrl: `/placements/${placementId}`,
        metadata: {
          placementId,
          studentName: `${placement.application.student.firstName} ${placement.application.student.lastName}`,
          opportunityTitle: placement.application.opportunity.title
        }
      });

      // Send notification to student
      await notificationService.sendNotification({
        userId: placement.application.student.userId,
        type: 'PLACEMENT_UPDATE',
        title: `Placement Confirmed - ${placement.application.opportunity.title}`,
        message: `Your placement with ${placement.application.opportunity.company.companyName} has been confirmed`,
        actionUrl: `/placements/${placementId}`,
        metadata: { placementId, status: 'confirmed' }
      });

      console.log(`✅ Placement accepted: ${placementId} by student ${studentId}`);
      return updatedPlacement;

    } catch (error) {
      console.error('Error accepting placement offer:', error);
      throw error;
    }
  }

  /**
   * Student declines placement offer
   */
  async declinePlacementOffer(placementId: string, studentId: string, reason?: string) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!placement) {
        throw new Error('Placement not found');
      }

      // Verify student owns this placement
      if (placement.application.studentId !== studentId) {
        throw new Error('Unauthorized: Student does not own this placement');
      }

      // Update placement status
      const updatedPlacement = await prisma.placement.update({
        where: { placementId },
        data: {
          status: 'CANCELLED',
          feedback: reason,
          updatedAt: new Date()
        }
      });

      // Update application status back to IN_REVIEW
      await prisma.application.update({
        where: { applicationId: placement.applicationId },
        data: { status: 'IN_REVIEW' }
      });

      // Send notification to company
      await notificationService.sendNotification({
        userId: placement.application.opportunity.company.userId,
        type: 'PLACEMENT_UPDATE',
        title: `Placement Declined - ${placement.application.opportunity.title}`,
        message: `${placement.application.student.firstName} ${placement.application.student.lastName} has declined the placement offer. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: `/applications/${placement.applicationId}`,
        metadata: {
          placementId,
          studentName: `${placement.application.student.firstName} ${placement.application.student.lastName}`,
          reason
        }
      });

      console.log(`❌ Placement declined: ${placementId} by student ${studentId}`);
      return updatedPlacement;

    } catch (error) {
      console.error('Error declining placement offer:', error);
      throw error;
    }
  }

  /**
   * Update placement details
   */
  async updatePlacement(placementId: string, data: PlacementUpdateData) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!placement) {
        throw new Error('Placement not found');
      }

      // Update placement
      const updatedPlacement = await prisma.placement.update({
        where: { placementId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // Send notification for significant changes
      if (data.status || data.startDate || data.endDate) {
        await notificationService.sendNotification({
          userId: placement.application.student.userId,
          type: 'PLACEMENT_UPDATE',
          title: `Placement Updated - ${placement.application.opportunity.title}`,
          message: this.getUpdateMessage(data),
          actionUrl: `/placements/${placementId}`,
          metadata: { placementId, updateType: 'placement_updated' }
        });
      }

      console.log(`📝 Placement updated: ${placementId}`);
      return updatedPlacement;

    } catch (error) {
      console.error('Error updating placement:', error);
      throw error;
    }
  }

  /**
   * Get student placements
   */
  async getStudentPlacements(studentId: string, status?: PlacementStatus) {
    try {
      const placements = await prisma.placement.findMany({
        where: {
          application: { studentId },
          ...(status && { status })
        },
        include: {
          application: {
            include: {
              opportunity: {
                include: {
                  company: {
                    select: {
                      companyName: true,
                      logoPath: true,
                      location: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return placements;

    } catch (error) {
      console.error('Error getting student placements:', error);
      throw error;
    }
  }

  /**
   * Get company placements
   */
  async getCompanyPlacements(companyId: string, status?: PlacementStatus) {
    try {
      const placements = await prisma.placement.findMany({
        where: {
          application: {
            opportunity: { companyId }
          },
          ...(status && { status })
        },
        include: {
          application: {
            include: {
              student: {
                select: {
                  studentId: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  phone: true,
                  location: true
                }
              },
              opportunity: {
                select: {
                  title: true,
                  opportunityId: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return placements;

    } catch (error) {
      console.error('Error getting company placements:', error);
      throw error;
    }
  }

  /**
   * Get placement details
   */
  async getPlacementDetails(placementId: string) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: {
                include: {
                  profile: true,
                  skills: {
                    include: { skill: true }
                  }
                }
              },
              opportunity: {
                include: {
                  company: true
                }
              },
              interviews: true
            }
          }
        }
      });

      return placement;

    } catch (error) {
      console.error('Error getting placement details:', error);
      throw error;
    }
  }

  /**
   * Complete placement (end of internship/job)
   */
  async completePlacement(placementId: string, feedback?: string, rating?: number, companyRating?: number) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!placement) {
        throw new Error('Placement not found');
      }

      // Update placement to completed
      const updatedPlacement = await prisma.placement.update({
        where: { placementId },
        data: {
          status: 'COMPLETED',
          endDate: new Date(),
          feedback,
          rating,
          companyRating,
          updatedAt: new Date()
        }
      });

      // Send completion notifications
      await Promise.all([
        // Notify student
        notificationService.sendNotification({
          userId: placement.application.student.userId,
          type: 'PLACEMENT_UPDATE',
          title: `Placement Completed - ${placement.application.opportunity.title}`,
          message: `Your placement with ${placement.application.opportunity.company.companyName} has been completed`,
          actionUrl: `/placements/${placementId}`,
          metadata: { placementId, status: 'completed' }
        }),
        
        // Notify company
        notificationService.sendNotification({
          userId: placement.application.opportunity.company.userId,
          type: 'PLACEMENT_UPDATE',
          title: `Placement Completed - ${placement.application.opportunity.title}`,
          message: `Placement for ${placement.application.student.firstName} ${placement.application.student.lastName} has been completed`,
          actionUrl: `/placements/${placementId}`,
          metadata: { placementId, status: 'completed' }
        })
      ]);

      console.log(`🎓 Placement completed: ${placementId}`);
      return updatedPlacement;

    } catch (error) {
      console.error('Error completing placement:', error);
      throw error;
    }
  }

  /**
   * Get placement statistics
   */
  async getPlacementStats(companyId?: string) {
    try {
      const whereClause = companyId 
        ? { application: { opportunity: { companyId } } }
        : {};

      const [total, active, completed, cancelled] = await Promise.all([
        prisma.placement.count({ where: whereClause }),
        prisma.placement.count({ where: { ...whereClause, status: 'ACTIVE' } }),
        prisma.placement.count({ where: { ...whereClause, status: 'COMPLETED' } }),
        prisma.placement.count({ where: { ...whereClause, status: 'CANCELLED' } })
      ]);

      // Calculate average salary
      const salaryStats = await prisma.placement.aggregate({
        where: { ...whereClause, salary: { not: null } },
        _avg: { salary: true },
        _min: { salary: true },
        _max: { salary: true }
      });

      // Calculate average rating
      const ratingStats = await prisma.placement.aggregate({
        where: { ...whereClause, rating: { not: null } },
        _avg: { rating: true }
      });

      return {
        total,
        active,
        completed,
        cancelled,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        averageSalary: salaryStats._avg.salary || 0,
        minSalary: salaryStats._min.salary || 0,
        maxSalary: salaryStats._max.salary || 0,
        averageRating: ratingStats._avg.rating || 0
      };

    } catch (error) {
      console.error('Error getting placement stats:', error);
      throw error;
    }
  }

  /**
   * Generate update message based on changes
   */
  private getUpdateMessage(data: PlacementUpdateData): string {
    const changes = [];
    
    if (data.startDate) changes.push('start date');
    if (data.endDate) changes.push('end date');
    if (data.salary) changes.push('salary');
    if (data.status) changes.push('status');

    if (changes.length === 0) return 'Placement details have been updated';
    
    return `Placement ${changes.join(', ')} has been updated`;
  }

  /**
   * Get active placements ending soon (next 30 days)
   */
  async getPlacementsEndingSoon(companyId?: string) {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const whereClause = {
        status: 'ACTIVE' as PlacementStatus,
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        ...(companyId && { application: { opportunity: { companyId } } })
      };

      const placements = await prisma.placement.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                  profilePicture: true
                }
              },
              opportunity: {
                select: {
                  title: true
                }
              }
            }
          }
        },
        orderBy: { endDate: 'asc' }
      });

      return placements;

    } catch (error) {
      console.error('Error getting placements ending soon:', error);
      throw error;
    }
  }
}

export const placementService = new PlacementService();