/**
 * WebSocket Service
 * Handles real-time dashboard updates and notifications
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { userId: decoded.userId }
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('Invalid or inactive user'));
        }

        socket.userId = user.userId;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket: any) => {
      console.log(`🔌 User ${socket.userId} connected (${socket.userRole})`);
      
      // Store connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join role-based rooms
      socket.join(`role:${socket.userRole.toLowerCase()}`);
      socket.join(`user:${socket.userId}`);

      // Handle dashboard subscription
      socket.on('subscribe:dashboard', (data: { section?: string }) => {
        const room = `dashboard:${socket.userRole.toLowerCase()}:${socket.userId}`;
        socket.join(room);
        console.log(`📊 User ${socket.userId} subscribed to dashboard updates`);
      });

      // Handle notification subscription
      socket.on('subscribe:notifications', () => {
        const room = `notifications:${socket.userId}`;
        socket.join(room);
        console.log(`🔔 User ${socket.userId} subscribed to notifications`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        userId: socket.userId,
        role: socket.userRole,
        timestamp: new Date().toISOString()
      });
    });

    // Listen to notification service events
    this.setupNotificationListeners();

    console.log('✅ WebSocket service initialized');
  }

  /**
   * Setup notification service event listeners
   */
  private setupNotificationListeners() {
    if (!notificationService) return;

    // Listen for new notifications
    notificationService.on('notification', (notification) => {
      this.sendNotificationToUser(notification.userId, notification);
    });

    // Listen for dashboard updates
    notificationService.on('dashboard-update', (update) => {
      this.sendDashboardUpdate(update.userId, update);
    });
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    if (!this.io) return;

    const room = `notifications:${userId}`;
    this.io.to(room).emit('notification', notification);
    
    console.log(`🔔 Notification sent to user ${userId}: ${notification.title}`);
  }

  /**
   * Send dashboard update to specific user
   */
  sendDashboardUpdate(userId: string, update: any) {
    if (!this.io) return;

    const room = `dashboard:${update.userRole || 'user'}:${userId}`;
    this.io.to(room).emit('dashboard-update', update);
    
    console.log(`📊 Dashboard update sent to user ${userId}: ${update.section}`);
  }

  /**
   * Broadcast to all users of a specific role
   */
  broadcastToRole(role: string, event: string, data: any) {
    if (!this.io) return;

    const room = `role:${role.toLowerCase()}`;
    this.io.to(room).emit(event, data);
    
    console.log(`📢 Broadcast to ${role}: ${event}`);
  }

  /**
   * Send system alert to all admins
   */
  sendSystemAlert(title: string, message: string, metadata?: any) {
    if (!this.io) return;

    const alertData = {
      type: 'system-alert',
      title,
      message,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRole('ADMIN', 'system-alert', alertData);
  }

  /**
   * Send application status update
   */
  sendApplicationUpdate(studentId: string, applicationData: any) {
    if (!this.io) return;

    const room = `user:${studentId}`;
    this.io.to(room).emit('application-update', {
      type: 'application-status',
      data: applicationData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send interview notification
   */
  sendInterviewUpdate(studentId: string, interviewData: any) {
    if (!this.io) return;

    const room = `user:${studentId}`;
    this.io.to(room).emit('interview-update', {
      type: 'interview-scheduled',
      data: interviewData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send new opportunity match notification
   */
  sendOpportunityMatch(studentId: string, matchData: any) {
    if (!this.io) return;

    const room = `user:${studentId}`;
    this.io.to(room).emit('opportunity-match', {
      type: 'new-match',
      data: matchData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send real-time metrics update
   */
  sendMetricsUpdate(userId: string, metricsData: any) {
    if (!this.io) return;

    const room = `user:${userId}`;
    this.io.to(room).emit('metrics-update', {
      type: 'metrics-updated',
      data: metricsData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users by role
   */
  getConnectedUsersByRole(): Record<string, number> {
    if (!this.io) return {};

    const rooms = this.io.sockets.adapter.rooms;
    const roleStats: Record<string, number> = {};

    for (const [roomName, room] of rooms) {
      if (roomName.startsWith('role:')) {
        const role = roomName.replace('role:', '').toUpperCase();
        roleStats[role] = room.size;
      }
    }

    return roleStats;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Disconnect user
   */
  disconnectUser(userId: string, reason?: string) {
    if (!this.io) return;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
        console.log(`🔌 User ${userId} forcibly disconnected: ${reason || 'No reason provided'}`);
      }
    }
  }

  /**
   * Get WebSocket server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const webSocketService = new WebSocketService();