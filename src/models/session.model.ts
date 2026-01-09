/**
 * Session Model & DTOs
 * Data Transfer Objects and business logic for User Session entity
 */

import { UserSession } from '@prisma/client';

// ============================================================================
// SESSION DTOs
// ============================================================================

export interface SessionDTO {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo?: DeviceInfo;
  lastActivity?: Date;
}

export interface SessionPublicDTO {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo?: DeviceInfo;
  lastActivity?: Date;
  isCurrent?: boolean;
}

export interface DeviceInfo {
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  ip?: string;
  location?: string;
}

export interface SessionCreateData {
  userId: string;
  jwtToken: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo?: DeviceInfo;
}

// ============================================================================
// SESSION BUSINESS LOGIC
// ============================================================================

export class SessionModel {
  /**
   * Convert Prisma UserSession to DTO
   */
  static toDTO(session: UserSession, deviceInfo?: DeviceInfo): SessionDTO {
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isActive: this.isSessionActive(session),
      deviceInfo,
      lastActivity: session.createdAt, // In future phases, track actual last activity
    };
  }

  /**
   * Convert to public DTO (safe for user consumption)
   */
  static toPublicDTO(session: UserSession, deviceInfo?: DeviceInfo, currentSessionId?: string): SessionPublicDTO {
    return {
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isActive: this.isSessionActive(session),
      deviceInfo,
      lastActivity: session.createdAt,
      isCurrent: session.sessionId === currentSessionId,
    };
  }

  /**
   * Check if session is active (not expired)
   */
  static isSessionActive(session: UserSession): boolean {
    return session.expiresAt > new Date();
  }

  /**
   * Check if session is expiring soon (within 1 hour)
   */
  static isSessionExpiringSoon(session: UserSession): boolean {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return session.expiresAt <= oneHourFromNow && this.isSessionActive(session);
  }

  /**
   * Get session duration in milliseconds
   */
  static getSessionDuration(session: UserSession): number {
    return session.expiresAt.getTime() - session.createdAt.getTime();
  }

  /**
   * Get remaining session time in milliseconds
   */
  static getRemainingTime(session: UserSession): number {
    const now = new Date().getTime();
    const expiresAt = session.expiresAt.getTime();
    return Math.max(0, expiresAt - now);
  }

  /**
   * Format remaining time as human readable string
   */
  static formatRemainingTime(session: UserSession): string {
    const remainingMs = this.getRemainingTime(session);
    
    if (remainingMs === 0) {
      return 'Expired';
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Less than 1m';
    }
  }

  /**
   * Parse device info from user agent string
   */
  static parseDeviceInfo(userAgent?: string, ip?: string): DeviceInfo {
    if (!userAgent) {
      return {};
    }

    const deviceInfo: DeviceInfo = {
      userAgent,
      ip,
    };

    // Simple browser detection
    if (userAgent.includes('Chrome')) {
      deviceInfo.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      deviceInfo.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      deviceInfo.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      deviceInfo.browser = 'Edge';
    } else {
      deviceInfo.browser = 'Unknown';
    }

    // Simple OS detection
    if (userAgent.includes('Windows')) {
      deviceInfo.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      deviceInfo.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      deviceInfo.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      deviceInfo.os = 'Android';
    } else if (userAgent.includes('iOS')) {
      deviceInfo.os = 'iOS';
    } else {
      deviceInfo.os = 'Unknown';
    }

    // Simple device detection
    if (userAgent.includes('Mobile')) {
      deviceInfo.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      deviceInfo.device = 'Tablet';
    } else {
      deviceInfo.device = 'Desktop';
    }

    return deviceInfo;
  }

  /**
   * Get session security level
   */
  static getSecurityLevel(session: UserSession, deviceInfo?: DeviceInfo): 'low' | 'medium' | 'high' {
    let score = 0;

    // Recent creation (within last hour) = more secure
    const ageHours = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 1) score += 2;
    else if (ageHours < 24) score += 1;

    // Shorter session duration = more secure
    const durationHours = this.getSessionDuration(session) / (1000 * 60 * 60);
    if (durationHours <= 24) score += 2;
    else if (durationHours <= 168) score += 1; // 1 week

    // Known device info = more secure
    if (deviceInfo?.browser && deviceInfo.browser !== 'Unknown') score += 1;
    if (deviceInfo?.os && deviceInfo.os !== 'Unknown') score += 1;

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Generate session summary for logging
   */
  static generateSessionSummary(session: UserSession, deviceInfo?: DeviceInfo): string {
    const browser = deviceInfo?.browser || 'Unknown';
    const os = deviceInfo?.os || 'Unknown';
    const device = deviceInfo?.device || 'Unknown';
    const duration = this.formatRemainingTime(session);

    return `${browser} on ${os} (${device}) - ${duration} remaining`;
  }

  /**
   * Check if session needs refresh (within 25% of expiration)
   */
  static needsRefresh(session: UserSession): boolean {
    const totalDuration = this.getSessionDuration(session);
    const remainingTime = this.getRemainingTime(session);
    const refreshThreshold = totalDuration * 0.25; // 25% of total duration

    return remainingTime <= refreshThreshold && this.isSessionActive(session);
  }

  /**
   * Get session risk factors
   */
  static getSessionRiskFactors(session: UserSession, deviceInfo?: DeviceInfo): string[] {
    const risks: string[] = [];

    // Long session duration
    const durationHours = this.getSessionDuration(session) / (1000 * 60 * 60);
    if (durationHours > 168) { // More than 1 week
      risks.push('Long session duration');
    }

    // Old session
    const ageHours = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours > 72) { // More than 3 days
      risks.push('Old session');
    }

    // Unknown device
    if (!deviceInfo || deviceInfo.browser === 'Unknown' || deviceInfo.os === 'Unknown') {
      risks.push('Unknown device');
    }

    // Expiring soon
    if (this.isSessionExpiringSoon(session)) {
      risks.push('Expiring soon');
    }

    return risks;
  }
}

// ============================================================================
// SESSION STATISTICS
// ============================================================================

export interface SessionStatistics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  expiringSoon: number;
  averageDuration: number;
  deviceBreakdown: { [key: string]: number };
  browserBreakdown: { [key: string]: number };
  osBreakdown: { [key: string]: number };
}

export class SessionAnalytics {
  /**
   * Calculate session statistics for a user
   */
  static calculateStatistics(sessions: UserSession[], deviceInfos: DeviceInfo[] = []): SessionStatistics {
    const stats: SessionStatistics = {
      totalSessions: sessions.length,
      activeSessions: 0,
      expiredSessions: 0,
      expiringSoon: 0,
      averageDuration: 0,
      deviceBreakdown: {},
      browserBreakdown: {},
      osBreakdown: {},
    };

    let totalDuration = 0;

    sessions.forEach((session, index) => {
      const deviceInfo = deviceInfos[index];

      // Count session states
      if (SessionModel.isSessionActive(session)) {
        stats.activeSessions++;
        if (SessionModel.isSessionExpiringSoon(session)) {
          stats.expiringSoon++;
        }
      } else {
        stats.expiredSessions++;
      }

      // Calculate duration
      totalDuration += SessionModel.getSessionDuration(session);

      // Device breakdown
      if (deviceInfo?.device) {
        stats.deviceBreakdown[deviceInfo.device] = (stats.deviceBreakdown[deviceInfo.device] || 0) + 1;
      }

      // Browser breakdown
      if (deviceInfo?.browser) {
        stats.browserBreakdown[deviceInfo.browser] = (stats.browserBreakdown[deviceInfo.browser] || 0) + 1;
      }

      // OS breakdown
      if (deviceInfo?.os) {
        stats.osBreakdown[deviceInfo.os] = (stats.osBreakdown[deviceInfo.os] || 0) + 1;
      }
    });

    // Calculate average duration in hours
    stats.averageDuration = sessions.length > 0 ? totalDuration / sessions.length / (1000 * 60 * 60) : 0;

    return stats;
  }
}