/**
 * Event System Service
 * Centralized event management with queue processing and real-time delivery
 */

import { PrismaClient, NotificationType, QueueStatus, LogLevel } from '@prisma/client';
import { EventEmitter } from 'events';
import { notificationService } from './notification.service';
import { webSocketService } from './websocket.service';

const prisma = new PrismaClient();

export interface EventData {
  type: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  data?: any;
  priority?: number;
  metadata?: any;
}

export interface NotificationEvent extends EventData {
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export interface SystemEvent extends EventData {
  level: LogLevel;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class EventSystemService extends EventEmitter {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup internal event listeners
   */
  private setupEventListeners() {
    // Listen for profile updates
    this.on('profile.updated', this.handleProfileUpdate.bind(this));
    
    // Listen for application events
    this.on('application.created', this.handleApplicationCreated.bind(this));
    this.on('application.status_changed', this.handleApplicationStatusChanged.bind(this));
    
    // Listen for interview events
    this.on('interview.scheduled', this.handleInterviewScheduled.bind(this));
    this.on('interview.updated', this.handleInterviewUpdated.bind(this));
    this.on('interview.completed', this.handleInterviewCompleted.bind(this));
    
    // Listen for placement events
    this.on('placement.offered', this.handlePlacementOffered.bind(this));
    this.on('placement.accepted', this.handlePlacementAccepted.bind(this));
    this.on('placement.declined', this.handlePlacementDeclined.bind(this));
    
    // Listen for matching events
    this.on('match.computed', this.handleMatchComputed.bind(this));
    this.on('match.ranking_changed', this.handleRankingChanged.bind(this));
    
    // Listen for admin events
    this.on('admin.override', this.handleAdminOverride.bind(this));
    this.on('system.alert', this.handleSystemAlert.bind(this));
  }

  /**
   * Emit event and queue for processing
   */
  async emitEvent(eventType: string, data: EventData) {
    try {
      // Log the event
      await this.logEvent({
        type: eventType,
        level: 'INFO',
        action: eventType,
        details: `Event emitted: ${eventType}`,
        userId: data.userId,
        metadata: data.metadata
      });

      // Queue the event for processing
      await this.queueEvent(eventType, data);

      // Emit for immediate listeners
      this.emit(eventType, data);

      console.log(`📡 Event emitted: ${eventType}`);

    } catch (error) {
      console.error('Error emitting event:', error);
      await this.logEvent({
        type: 'system.error',
        level: 'ERROR',
        action: 'emit_event_failed',
        details: `Failed to emit event: ${eventType}`,
        metadata: { error: error.message, eventType, data }
      });
    }
  }

  /**
   * Queue event for background processing
   */
  async queueEvent(eventType: string, data: EventData) {
    try {
      const queueItem = await prisma.queue.create({
        data: {
          taskType: eventType,
          payload: data as any, // Cast to any for JSON compatibility
          priority: data.priority || 0,
          status: 'PENDING'
        }
      });

      console.log(`📋 Event queued: ${eventType} (${queueItem.queueId})`);
      return queueItem;

    } catch (error) {
      console.error('Error queuing event:', error);
      throw error;
    }
  }

  /**
   * Process event queue
   */
  async processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Get pending queue items ordered by priority and creation time
      const queueItems = await prisma.queue.findMany({
        where: { status: 'PENDING' },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        take: 10 // Process 10 items at a time
      });

      for (const item of queueItems) {
        await this.processQueueItem(item);
      }

    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: any) {
    try {
      // Mark as processing
      await prisma.queue.update({
        where: { queueId: item.queueId },
        data: { 
          status: 'PROCESSING',
          processedAt: new Date()
        }
      });

      // Process based on task type
      await this.handleQueuedEvent(item.taskType, item.payload);

      // Mark as completed
      await prisma.queue.update({
        where: { queueId: item.queueId },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      console.log(`✅ Queue item processed: ${item.taskType} (${item.queueId})`);

    } catch (error) {
      console.error(`Error processing queue item ${item.queueId}:`, error);

      // Increment attempts and handle retry logic
      const newAttempts = item.attempts + 1;
      const shouldRetry = newAttempts < item.maxAttempts;

      await prisma.queue.update({
        where: { queueId: item.queueId },
        data: {
          status: shouldRetry ? 'RETRYING' : 'FAILED',
          attempts: newAttempts,
          error: error.message
        }
      });

      if (shouldRetry) {
        console.log(`🔄 Queue item will retry: ${item.taskType} (${item.queueId})`);
      } else {
        console.log(`❌ Queue item failed permanently: ${item.taskType} (${item.queueId})`);
      }
    }
  }

  /**
   * Handle queued events
   */
  private async handleQueuedEvent(eventType: string, data: any) {
    // Emit the event for listeners
    this.emit(eventType, data);

    // Additional processing based on event type
    switch (eventType) {
      case 'notification.send':
        await this.processNotificationEvent(data);
        break;
      case 'email.send':
        await this.processEmailEvent(data);
        break;
      case 'websocket.broadcast':
        await this.processWebSocketEvent(data);
        break;
      default:
        // Generic event processing
        break;
    }
  }

  /**
   * Process notification events
   */
  private async processNotificationEvent(data: any) {
    if (!data.userId) return;

    await notificationService.sendNotification({
      userId: data.userId,
      type: 'SYSTEM_ALERT', // Default type, should be passed in data
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      metadata: data.metadata
    });
  }

  /**
   * Process email events (placeholder for email integration)
   */
  private async processEmailEvent(data: any) {
    // TODO: Implement email sending logic
    console.log('📧 Email event processed (placeholder):', data.subject);
  }

  /**
   * Process WebSocket events
   */
  private async processWebSocketEvent(data: any) {
    if (data.userId) {
      webSocketService.sendDashboardUpdate(data.userId, data.update);
    } else if (data.role) {
      webSocketService.broadcastToRole(data.role, data.event, data.data);
    }
  }

  /**
   * Log system events
   */
  async logEvent(event: SystemEvent) {
    try {
      await prisma.systemLog.create({
        data: {
          userId: event.userId,
          level: event.level,
          action: event.action,
          details: event.details,
          metadata: event.metadata,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent
        }
      });

    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  /**
   * Start queue processor
   */
  startQueueProcessor(intervalMs: number = 5000) {
    if (this.processingInterval) {
      console.log('Queue processor already running');
      return;
    }

    console.log(`🚀 Starting event queue processor (interval: ${intervalMs}ms)`);
    
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, intervalMs);
  }

  /**
   * Stop queue processor
   */
  stopQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Event queue processor stopped');
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle profile update events
   */
  private async handleProfileUpdate(data: EventData) {
    try {
      if (!data.userId) return;

      // Queue match recomputation
      await this.queueEvent('match.recompute', {
        type: 'match.recompute',
        userId: data.userId,
        entityId: data.entityId,
        entityType: 'student',
        priority: 5
      });

      // Notify relevant companies of profile changes
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: data.userId,
        title: 'Candidate Profile Updated',
        message: 'A candidate in your pipeline has updated their profile',
        priority: 3,
        metadata: { studentId: data.entityId }
      } as any);

    } catch (error) {
      console.error('Error handling profile update:', error);
    }
  }

  /**
   * Handle application created events
   */
  private async handleApplicationCreated(data: EventData) {
    try {
      const application = await prisma.application.findUnique({
        where: { applicationId: data.entityId },
        include: {
          student: { include: { user: true } },
          opportunity: { include: { company: { include: { user: true } } } }
        }
      });

      if (!application) return;

      // Notify student
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: application.student.userId,
        title: `Application Submitted - ${application.opportunity.title}`,
        message: `Your application has been submitted successfully`,
        actionUrl: `/applications/${application.applicationId}`,
        priority: 7
      } as any);

      // Notify company
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: application.opportunity.company.userId,
        title: `New Application - ${application.opportunity.title}`,
        message: `${application.student.firstName} ${application.student.lastName} has applied`,
        actionUrl: `/applications/${application.applicationId}`,
        priority: 6
      } as any);

    } catch (error) {
      console.error('Error handling application created:', error);
    }
  }

  /**
   * Handle application status change events
   */
  private async handleApplicationStatusChanged(data: EventData) {
    try {
      const application = await prisma.application.findUnique({
        where: { applicationId: data.entityId },
        include: {
          student: { include: { user: true } },
          opportunity: { include: { company: true } }
        }
      });

      if (!application) return;

      const statusMessages = {
        'IN_REVIEW': 'Your application is now under review',
        'INTERVIEW': 'Your application has progressed to interview stage',
        'HIRED': 'Congratulations! Your application has been accepted',
        'REJECTED': 'Your application was not selected this time'
      };

      const message = statusMessages[data.data?.newStatus as keyof typeof statusMessages] || 'Your application status has been updated';

      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: application.student.userId,
        title: `Application Update - ${application.opportunity.title}`,
        message,
        actionUrl: `/applications/${application.applicationId}`,
        priority: 8
      } as any);

    } catch (error) {
      console.error('Error handling application status change:', error);
    }
  }

  /**
   * Handle interview scheduled events
   */
  private async handleInterviewScheduled(data: EventData) {
    try {
      await notificationService.notifyInterviewScheduled(data.entityId!);
    } catch (error) {
      console.error('Error handling interview scheduled:', error);
    }
  }

  /**
   * Handle interview updated events
   */
  private async handleInterviewUpdated(data: EventData) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId: data.entityId },
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

      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: interview.application.student.userId,
        title: `Interview Updated - ${interview.application.opportunity.title}`,
        message: 'Your interview details have been updated',
        actionUrl: `/interviews/${interview.interviewId}`,
        priority: 7
      } as any);

    } catch (error) {
      console.error('Error handling interview updated:', error);
    }
  }

  /**
   * Handle interview completed events
   */
  private async handleInterviewCompleted(data: EventData) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId: data.entityId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!interview) return;

      // Notify student
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: interview.application.student.userId,
        title: `Interview Completed - ${interview.application.opportunity.title}`,
        message: 'Your interview has been completed. You will be notified of the next steps.',
        actionUrl: `/applications/${interview.applicationId}`,
        priority: 6
      } as any);

      // Notify company
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: interview.application.opportunity.company.userId,
        title: `Interview Completed - ${interview.application.opportunity.title}`,
        message: `Interview with ${interview.application.student.firstName} ${interview.application.student.lastName} has been completed`,
        actionUrl: `/interviews/${interview.interviewId}`,
        priority: 5
      } as any);

    } catch (error) {
      console.error('Error handling interview completed:', error);
    }
  }

  /**
   * Handle placement offered events
   */
  private async handlePlacementOffered(data: EventData) {
    try {
      await notificationService.notifyPlacementUpdate(data.entityId!);
    } catch (error) {
      console.error('Error handling placement offered:', error);
    }
  }

  /**
   * Handle placement accepted events
   */
  private async handlePlacementAccepted(data: EventData) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId: data.entityId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!placement) return;

      // Notify company
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: placement.application.opportunity.company.userId,
        title: `Placement Accepted - ${placement.application.opportunity.title}`,
        message: `${placement.application.student.firstName} ${placement.application.student.lastName} has accepted the placement offer`,
        actionUrl: `/placements/${placement.placementId}`,
        priority: 8
      } as any);

    } catch (error) {
      console.error('Error handling placement accepted:', error);
    }
  }

  /**
   * Handle placement declined events
   */
  private async handlePlacementDeclined(data: EventData) {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId: data.entityId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: { include: { user: true } } } }
            }
          }
        }
      });

      if (!placement) return;

      // Notify company
      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: placement.application.opportunity.company.userId,
        title: `Placement Declined - ${placement.application.opportunity.title}`,
        message: `${placement.application.student.firstName} ${placement.application.student.lastName} has declined the placement offer`,
        actionUrl: `/applications/${placement.applicationId}`,
        priority: 7
      } as any);

    } catch (error) {
      console.error('Error handling placement declined:', error);
    }
  }

  /**
   * Handle match computed events
   */
  private async handleMatchComputed(data: EventData) {
    try {
      // Notify student of new high-quality matches
      if (data.data?.matchScore > 0.8) {
        await notificationService.notifyOpportunityMatch(
          data.data.studentId,
          data.data.opportunityId,
          data.data.matchScore
        );
      }

    } catch (error) {
      console.error('Error handling match computed:', error);
    }
  }

  /**
   * Handle ranking changed events
   */
  private async handleRankingChanged(data: EventData) {
    try {
      // Notify companies of significant ranking changes
      if (data.data?.rankingChange > 10) {
        await this.queueEvent('notification.send', {
          type: 'notification.send',
          userId: data.data.companyUserId,
          title: 'Candidate Rankings Updated',
          message: 'Candidate rankings have been updated based on new profile data',
          actionUrl: `/opportunities/${data.data.opportunityId}/candidates`,
          priority: 4
        } as any);
      }

    } catch (error) {
      console.error('Error handling ranking changed:', error);
    }
  }

  /**
   * Handle admin override events
   */
  private async handleAdminOverride(data: EventData) {
    try {
      if (!data.userId) return;

      await this.queueEvent('notification.send', {
        type: 'notification.send',
        userId: data.userId,
        title: 'Admin Action Taken',
        message: data.data?.message || 'An administrator has taken action on your account',
        actionUrl: data.data?.actionUrl,
        priority: 9
      } as any);

    } catch (error) {
      console.error('Error handling admin override:', error);
    }
  }

  /**
   * Handle system alert events
   */
  private async handleSystemAlert(data: EventData) {
    try {
      await notificationService.notifySystemAlert(
        data.data?.title || 'System Alert',
        data.data?.message || 'System notification',
        data.metadata
      );

    } catch (error) {
      console.error('Error handling system alert:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const [total, pending, processing, completed, failed] = await Promise.all([
        prisma.queue.count(),
        prisma.queue.count({ where: { status: 'PENDING' } }),
        prisma.queue.count({ where: { status: 'PROCESSING' } }),
        prisma.queue.count({ where: { status: 'COMPLETED' } }),
        prisma.queue.count({ where: { status: 'FAILED' } })
      ]);

      return {
        total,
        pending,
        processing,
        completed,
        failed,
        successRate: total > 0 ? ((completed / total) * 100) : 0
      };

    } catch (error) {
      console.error('Error getting queue stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old queue items and logs
   */
  async cleanup(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean up completed queue items
      const deletedQueue = await prisma.queue.deleteMany({
        where: {
          status: 'COMPLETED',
          completedAt: { lt: cutoffDate }
        }
      });

      // Clean up old system logs
      const deletedLogs = await prisma.systemLog.deleteMany({
        where: {
          level: { in: ['INFO', 'DEBUG'] },
          createdAt: { lt: cutoffDate }
        }
      });

      console.log(`🧹 Cleanup completed: ${deletedQueue.count} queue items, ${deletedLogs.count} logs`);

      return {
        queueItemsDeleted: deletedQueue.count,
        logsDeleted: deletedLogs.count
      };

    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export const eventSystemService = new EventSystemService();