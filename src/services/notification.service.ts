/**
 * Notification Service
 * Handles real-time notifications and dashboard updates
 */

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

export interface NotificationData {
  userId: string;
  type: 'APPLICATION_UPDATE' | 'INTERVIEW_SCHEDULED' | 'OPPORTUNITY_MATCH' | 'SYSTEM_ALERT' | 'PLACEMENT_UPDATE';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export interface DashboardUpdate {
  userId: string;
  section: 'applications' | 'opportunities' | 'interviews' | 'metrics' | 'system';
  data: any;
}

class NotificationService extends EventEmitter {
  /**
   * Send notification to user
   */
  async sendNotification(notification: NotificationData) {
    try {
      // Store notification in database
      const dbNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
          metadata: notification.metadata
        }
      });

      // Emit real-time event
      this.emit('notification', {
        ...notification,
        notificationId: dbNotification.notificationId,
        createdAt: dbNotification.createdAt
      });

      console.log(`📢 Notification sent to user ${notification.userId}: ${notification.title}`);
      return dbNotification;

    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send dashboard update
   */
  async sendDashboardUpdate(update: DashboardUpdate) {
    try {
      // Emit real-time dashboard update
      this.emit('dashboard-update', update);
      
      console.log(`📊 Dashboard update sent to user ${update.userId}: ${update.section}`);

    } catch (error) {
      console.error('Error sending dashboard update:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 20, unreadOnly: boolean = false) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(unreadOnly && { read: false })
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return notifications;

    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          notificationId,
          userId
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return notification;

    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return result;

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notification count for user
   */
  async getNotificationCount(userId: string) {
    try {
      const [total, unread] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, read: false } })
      ]);

      return { total, unread };

    } catch (error) {
      console.error('Error getting notification count:', error);
      throw error;
    }
  }

  /**
   * Application status change notification
   */
  async notifyApplicationStatusChange(applicationId: string, newStatus: string) {
    try {
      const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
          student: {
            include: { user: true }
          },
          opportunity: {
            include: { company: true }
          }
        }
      });

      if (!application) return;

      const statusMessages = {
        'IN_REVIEW': 'Your application is now under review',
        'ACCEPTED': 'Congratulations! Your application has been accepted',
        'REJECTED': 'Your application was not selected this time',
        'WITHDRAWN': 'Your application has been withdrawn'
      };

      await this.sendNotification({
        userId: application.student.userId,
        type: 'APPLICATION_UPDATE',
        title: `Application Update - ${application.opportunity.title}`,
        message: statusMessages[newStatus as keyof typeof statusMessages] || 'Your application status has been updated',
        actionUrl: `/applications/${applicationId}`,
        metadata: {
          applicationId,
          opportunityId: application.opportunityId,
          companyName: application.opportunity.company.companyName,
          status: newStatus
        }
      });

      // Send dashboard update
      await this.sendDashboardUpdate({
        userId: application.student.userId,
        section: 'applications',
        data: {
          applicationId,
          status: newStatus,
          opportunityTitle: application.opportunity.title,
          companyName: application.opportunity.company.companyName
        }
      });

    } catch (error) {
      console.error('Error sending application status notification:', error);
    }
  }

  /**
   * Interview scheduled notification
   */
  async notifyInterviewScheduled(interviewId: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!interview) return;

      await this.sendNotification({
        userId: interview.application.student.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Scheduled - ${interview.application.opportunity.title}`,
        message: `Your interview has been scheduled for ${interview.scheduledDate.toLocaleDateString()}`,
        actionUrl: `/interviews/${interviewId}`,
        metadata: {
          interviewId,
          applicationId: interview.applicationId,
          scheduledDate: interview.scheduledDate,
          companyName: interview.application.opportunity.company.companyName
        }
      });

      // Send dashboard update
      await this.sendDashboardUpdate({
        userId: interview.application.student.userId,
        section: 'interviews',
        data: {
          interviewId,
          scheduledDate: interview.scheduledDate,
          opportunityTitle: interview.application.opportunity.title,
          companyName: interview.application.opportunity.company.companyName
        }
      });

    } catch (error) {
      console.error('Error sending interview notification:', error);
    }
  }

  /**
   * New opportunity match notification
   */
  async notifyOpportunityMatch(studentId: string, opportunityId: string, matchScore: number) {
    try {
      const [student, opportunity] = await Promise.all([
        prisma.student.findUnique({
          where: { studentId },
          include: { user: true }
        }),
        prisma.opportunity.findUnique({
          where: { opportunityId },
          include: { company: true }
        })
      ]);

      if (!student || !opportunity) return;

      // Only notify for high-quality matches (>70%)
      if (matchScore < 0.7) return;

      await this.sendNotification({
        userId: student.userId,
        type: 'OPPORTUNITY_MATCH',
        title: `New High-Quality Match - ${opportunity.title}`,
        message: `You have a ${Math.round(matchScore * 100)}% match with this opportunity at ${opportunity.company.companyName}`,
        actionUrl: `/opportunities/${opportunityId}`,
        metadata: {
          opportunityId,
          matchScore,
          companyName: opportunity.company.companyName,
          opportunityTitle: opportunity.title
        }
      });

      // Send dashboard update
      await this.sendDashboardUpdate({
        userId: student.userId,
        section: 'opportunities',
        data: {
          opportunityId,
          matchScore,
          title: opportunity.title,
          companyName: opportunity.company.companyName
        }
      });

    } catch (error) {
      console.error('Error sending opportunity match notification:', error);
    }
  }

  /**
   * System alert notification (admin)
   */
  async notifySystemAlert(title: string, message: string, metadata?: any) {
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      });

      // Send notification to all admins
      for (const admin of admins) {
        await this.sendNotification({
          userId: admin.userId,
          type: 'SYSTEM_ALERT',
          title,
          message,
          metadata
        });

        // Send dashboard update
        await this.sendDashboardUpdate({
          userId: admin.userId,
          section: 'system',
          data: {
            alert: title,
            message,
            timestamp: new Date()
          }
        });
      }

    } catch (error) {
      console.error('Error sending system alert:', error);
    }
  }

  /**
   * Placement update notification
   */
  async notifyPlacementUpdate(placementId: string) {
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

      if (!placement) return;

      await this.sendNotification({
        userId: placement.application.student.userId,
        type: 'PLACEMENT_UPDATE',
        title: `Placement Update - ${placement.application.opportunity.title}`,
        message: `Your placement status has been updated to ${placement.status}`,
        actionUrl: `/placements/${placementId}`,
        metadata: {
          placementId,
          status: placement.status,
          companyName: placement.application.opportunity.company.companyName
        }
      });

    } catch (error) {
      console.error('Error sending placement notification:', error);
    }
  }

  /**
   * Bulk notification for company updates
   */
  async notifyCompanyUpdate(companyId: string, title: string, message: string, actionUrl?: string) {
    try {
      // Get all applications for this company
      const applications = await prisma.application.findMany({
        where: {
          opportunity: { companyId }
        },
        include: {
          student: { include: { user: true } }
        },
        distinct: ['studentId']
      });

      // Send notification to all applicants
      for (const application of applications) {
        await this.sendNotification({
          userId: application.student.userId,
          type: 'SYSTEM_ALERT',
          title,
          message,
          actionUrl,
          metadata: { companyId }
        });
      }

    } catch (error) {
      console.error('Error sending company update notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();