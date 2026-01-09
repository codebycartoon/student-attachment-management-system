/**
 * Notification Controller
 * Handles notification management and delivery
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notification.service';
import { eventSystemService } from '../services/event-system.service';
import { NotificationType } from '@prisma/client';

// Validation schemas
const sendNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.enum(['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional(),
  metadata: z.any().optional()
});

const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1).max(100),
  type: z.enum(['APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional(),
  metadata: z.any().optional()
});

const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  applicationUpdates: z.boolean().optional(),
  interviewReminders: z.boolean().optional(),
  opportunityMatches: z.boolean().optional(),
  placementUpdates: z.boolean().optional(),
  systemAlerts: z.boolean().optional()
});

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { limit = 20, unreadOnly = false, type } = req.query;

    const notifications = await notificationService.getUserNotifications(
      req.user.userId,
      Number(limit),
      unreadOnly === 'true'
    );

    // Filter by type if specified
    const filteredNotifications = type 
      ? notifications.filter(n => n.type === type)
      : notifications;

    const count = await notificationService.getNotificationCount(req.user.userId);

    res.json({
      success: true,
      data: filteredNotifications,
      count
    });

  } catch (error: any) {
    console.error('Get user notifications error:', error);
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, req.user.userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error: any) {
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
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const result = await notificationService.markAllAsRead(req.user.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updated: result.count
    });

  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Get notification count
 */
export const getNotificationCount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const count = await notificationService.getNotificationCount(req.user.userId);

    res.json({
      success: true,
      data: count
    });

  } catch (error: any) {
    console.error('Get notification count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification count'
    });
  }
};

/**
 * Send notification (Admin only)
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedData = sendNotificationSchema.parse(req.body);

    const notification = await notificationService.sendNotification({
      userId: validatedData.userId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      actionUrl: validatedData.actionUrl,
      metadata: validatedData.metadata
    });

    // Log the admin action
    await eventSystemService.logEvent({
      type: 'admin.notification_sent',
      level: 'INFO',
      action: 'send_notification',
      details: `Admin sent notification to user ${validatedData.userId}`,
      userId: req.user.userId,
      metadata: { notificationId: notification.notificationId, targetUserId: validatedData.userId }
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
};

/**
 * Send bulk notifications (Admin only)
 */
export const sendBulkNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedData = bulkNotificationSchema.parse(req.body);

    const notifications = [];
    const errors = [];

    for (const userId of validatedData.userIds) {
      try {
        const notification = await notificationService.sendNotification({
          userId,
          type: validatedData.type,
          title: validatedData.title,
          message: validatedData.message,
          actionUrl: validatedData.actionUrl,
          metadata: validatedData.metadata
        });
        notifications.push(notification);
      } catch (error: any) {
        errors.push({ userId, error: error.message });
      }
    }

    // Log the admin action
    await eventSystemService.logEvent({
      type: 'admin.bulk_notification_sent',
      level: 'INFO',
      action: 'send_bulk_notification',
      details: `Admin sent bulk notification to ${validatedData.userIds.length} users`,
      userId: req.user.userId,
      metadata: { 
        targetUserIds: validatedData.userIds,
        successCount: notifications.length,
        errorCount: errors.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bulk notifications processed',
      data: {
        sent: notifications.length,
        failed: errors.length,
        notifications: notifications.map(n => n.notificationId),
        errors
      }
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications'
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { notificationId } = req.params;

    // Only allow users to delete their own notifications or admins to delete any
    const notification = await req.prisma?.notification.findUnique({
      where: { notificationId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await req.prisma?.notification.delete({
      where: { notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user preferences (this would typically be stored in a user_preferences table)
    // For now, return default preferences
    const preferences = {
      emailNotifications: true,
      pushNotifications: true,
      applicationUpdates: true,
      interviewReminders: true,
      opportunityMatches: true,
      placementUpdates: true,
      systemAlerts: true
    };

    res.json({
      success: true,
      data: preferences
    });

  } catch (error: any) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences'
    });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const validatedData = notificationPreferencesSchema.parse(req.body);

    // TODO: Store preferences in database
    // For now, just return the updated preferences
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: validatedData
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

/**
 * Get system event logs (Admin only)
 */
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { limit = 50, level, action, userId } = req.query;

    const whereClause: any = {};
    if (level) whereClause.level = level;
    if (action) whereClause.action = { contains: action as string };
    if (userId) whereClause.userId = userId;

    const logs = await req.prisma?.systemLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json({
      success: true,
      data: logs
    });

  } catch (error: any) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system logs'
    });
  }
};

/**
 * Get queue statistics (Admin only)
 */
export const getQueueStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await eventSystemService.getQueueStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue statistics'
    });
  }
};

/**
 * Trigger system cleanup (Admin only)
 */
export const triggerCleanup = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { daysToKeep = 30 } = req.body;

    const result = await eventSystemService.cleanup(Number(daysToKeep));

    // Log the admin action
    await eventSystemService.logEvent({
      type: 'admin.system_cleanup',
      level: 'INFO',
      action: 'trigger_cleanup',
      details: `Admin triggered system cleanup (${daysToKeep} days retention)`,
      userId: req.user.userId,
      metadata: result
    });

    res.json({
      success: true,
      message: 'System cleanup completed',
      data: result
    });

  } catch (error: any) {
    console.error('Trigger cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger cleanup'
    });
  }
};