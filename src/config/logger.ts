/**
 * Enterprise Logging Configuration
 * Winston-based structured logging with security and performance monitoring
 */

import winston from 'winston';
import path from 'path';

// Custom log levels for application-specific needs
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    security: 5,
    performance: 6,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
    security: 'cyan',
    performance: 'blue',
  },
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env['NODE_ENV'] || 'development',
      service: 'student-matching-platform',
      version: process.env['APP_VERSION'] || '1.0.0',
    });
  })
);

// Development format for console readability
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Configure transports based on environment
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: process.env['NODE_ENV'] === 'production' ? logFormat : devFormat,
    level: process.env['LOG_LEVEL'] || 'info',
  })
);

// File transports for production
if (process.env['NODE_ENV'] === 'production') {
  // General application logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Error logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Security logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'security',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
    })
  );

  // Performance logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      level: 'performance',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
});

// Security logging helper
export const securityLogger = {
  loginAttempt: (email: string, success: boolean, ip: string, userAgent?: string) => {
    logger.log('security', 'Login attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  passwordReset: (email: string, ip: string) => {
    logger.log('security', 'Password reset requested', {
      event: 'password_reset',
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  suspiciousActivity: (userId: string, activity: string, details: any, ip: string) => {
    logger.log('security', 'Suspicious activity detected', {
      event: 'suspicious_activity',
      userId,
      activity,
      details,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  dataAccess: (userId: string, resource: string, action: string, ip: string) => {
    logger.log('security', 'Data access', {
      event: 'data_access',
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string, limit: number) => {
    logger.log('security', 'Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance logging helper
export const performanceLogger = {
  apiRequest: (method: string, url: string, duration: number, statusCode: number, userId?: string) => {
    logger.log('performance', 'API request completed', {
      event: 'api_request',
      method,
      url,
      duration,
      statusCode,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  databaseQuery: (query: string, duration: number, rowCount?: number) => {
    logger.log('performance', 'Database query executed', {
      event: 'database_query',
      query: query.substring(0, 100), // Truncate for security
      duration,
      rowCount,
      timestamp: new Date().toISOString(),
    });
  },

  fileUpload: (filename: string, size: number, duration: number, userId: string) => {
    logger.log('performance', 'File upload completed', {
      event: 'file_upload',
      filename,
      size,
      duration,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  matchingEngine: (studentCount: number, opportunityCount: number, duration: number) => {
    logger.log('performance', 'Matching engine execution', {
      event: 'matching_engine',
      studentCount,
      opportunityCount,
      duration,
      timestamp: new Date().toISOString(),
    });
  },
};

// Application event logging helper
export const auditLogger = {
  userRegistration: (userId: string, email: string, role: string, ip: string) => {
    logger.info('User registered', {
      event: 'user_registration',
      userId,
      email,
      role,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  profileUpdate: (userId: string, fields: string[], ip: string) => {
    logger.info('Profile updated', {
      event: 'profile_update',
      userId,
      fields,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  applicationSubmitted: (applicationId: string, studentId: string, opportunityId: string) => {
    logger.info('Application submitted', {
      event: 'application_submitted',
      applicationId,
      studentId,
      opportunityId,
      timestamp: new Date().toISOString(),
    });
  },

  opportunityCreated: (opportunityId: string, companyId: string, title: string) => {
    logger.info('Opportunity created', {
      event: 'opportunity_created',
      opportunityId,
      companyId,
      title,
      timestamp: new Date().toISOString(),
    });
  },

  interviewScheduled: (interviewId: string, applicationId: string, date: string) => {
    logger.info('Interview scheduled', {
      event: 'interview_scheduled',
      interviewId,
      applicationId,
      date,
      timestamp: new Date().toISOString(),
    });
  },

  placementConfirmed: (placementId: string, studentId: string, companyId: string) => {
    logger.info('Placement confirmed', {
      event: 'placement_confirmed',
      placementId,
      studentId,
      companyId,
      timestamp: new Date().toISOString(),
    });
  },
};

// Error logging helper with context
export const errorLogger = {
  apiError: (error: Error, req: any, userId?: string) => {
    logger.error('API Error', {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });
  },

  databaseError: (error: Error, operation: string, context?: any) => {
    logger.error('Database Error', {
      message: error.message,
      stack: error.stack,
      operation,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  validationError: (errors: any[], endpoint: string, userId?: string) => {
    logger.warn('Validation Error', {
      errors,
      endpoint,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  externalServiceError: (service: string, error: Error, context?: any) => {
    logger.error('External Service Error', {
      service,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export default logger
export default logger;