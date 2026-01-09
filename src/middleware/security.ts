/**
 * Security Middleware Collection
 * Enterprise-grade security implementations following OWASP Top 10
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import { logger, securityLogger } from '../config/logger';
import { cacheService } from '../config/redis';
import { AppError, ErrorCodes } from '../types';

// ============================================================================
// RATE LIMITING & DDOS PROTECTION
// ============================================================================

/**
 * General API Rate Limiting
 * Prevents abuse and ensures fair usage
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    securityLogger.rateLimitExceeded(req.ip, req.path, 100);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Authentication Rate Limiting
 * Stricter limits for login/register endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    securityLogger.rateLimitExceeded(req.ip, req.path, 5);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * File Upload Rate Limiting
 * Prevents abuse of file upload endpoints
 */
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later',
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
  },
  handler: (req: Request, res: Response) => {
    securityLogger.rateLimitExceeded(req.ip, req.path, 10);
    res.status(429).json({
      success: false,
      message: 'Too many file uploads, please try again later',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Speed Limiting for Suspicious Activity
 * Gradually slows down responses for repeated requests
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// ============================================================================
// HELMET SECURITY HEADERS
// ============================================================================

/**
 * Comprehensive Security Headers
 * Implements multiple security headers following OWASP recommendations
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions Policy
  permissionsPolicy: {
    features: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
    },
  },
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

/**
 * CORS Configuration
 * Secure cross-origin resource sharing setup
 */
export const corsOptions = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      securityLogger.suspiciousActivity('', 'cors_violation', { origin }, '');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
});

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * Request Size Limiting
 * Prevents large payload attacks
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.get('content-length') || '0');
  
  if (contentLength > maxSize) {
    securityLogger.suspiciousActivity('', 'large_payload_attempt', { size: contentLength }, req.ip);
    res.status(413).json({
      success: false,
      message: 'Payload too large',
      code: ErrorCodes.VALIDATION_ERROR,
    });
    return;
  }
  
  next();
};

/**
 * SQL Injection Prevention
 * Additional validation layer for database queries
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  ];
  
  const checkValue = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).some(([key, val]) => 
        checkValue(val, `${path}.${key}`)
      );
    }
    
    return false;
  };
  
  const requestData = { ...req.query, ...req.body, ...req.params };
  
  if (checkValue(requestData)) {
    securityLogger.suspiciousActivity(
      req.user?.userId || '',
      'sql_injection_attempt',
      { data: requestData },
      req.ip
    );
    
    res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      code: ErrorCodes.VALIDATION_ERROR,
    });
    return;
  }
  
  next();
};

/**
 * XSS Protection
 * Prevents cross-site scripting attacks
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi,
  ];
  
  const checkForXSS = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(val => checkForXSS(val));
    }
    
    return false;
  };
  
  const requestData = { ...req.query, ...req.body };
  
  if (checkForXSS(requestData)) {
    securityLogger.suspiciousActivity(
      req.user?.userId || '',
      'xss_attempt',
      { data: requestData },
      req.ip
    );
    
    res.status(400).json({
      success: false,
      message: 'Potentially malicious content detected',
      code: ErrorCodes.VALIDATION_ERROR,
    });
    return;
  }
  
  next();
};

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * CSRF Token Validation
 * Prevents cross-site request forgery attacks
 */
export const csrfProtection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] as string;
  const sessionId = req.user?.sessionId;
  
  if (!token || !sessionId) {
    res.status(403).json({
      success: false,
      message: 'CSRF token required',
      code: ErrorCodes.AUTHORIZATION_FAILED,
    });
    return;
  }
  
  try {
    // Validate CSRF token against session
    const expectedToken = await cacheService?.get(`csrf:${sessionId}`);
    
    if (!expectedToken || token !== expectedToken) {
      securityLogger.suspiciousActivity(
        req.user?.userId || '',
        'csrf_token_mismatch',
        { providedToken: token },
        req.ip
      );
      
      res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
        code: ErrorCodes.AUTHORIZATION_FAILED,
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('CSRF validation error', { error });
    res.status(500).json({
      success: false,
      message: 'CSRF validation failed',
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

// ============================================================================
// IP WHITELISTING & GEOLOCATION
// ============================================================================

/**
 * IP Whitelisting for Admin Routes
 * Restricts admin access to specific IP addresses
 */
export const adminIPWhitelist = (req: Request, res: Response, next: NextFunction): void => {
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];
  
  if (allowedIPs.length === 0) {
    return next(); // No IP restrictions configured
  }
  
  const clientIP = req.ip;
  
  if (!allowedIPs.includes(clientIP)) {
    securityLogger.suspiciousActivity(
      req.user?.userId || '',
      'admin_ip_restriction_violation',
      { clientIP, allowedIPs },
      clientIP
    );
    
    res.status(403).json({
      success: false,
      message: 'Access denied from this IP address',
      code: ErrorCodes.AUTHORIZATION_FAILED,
    });
    return;
  }
  
  next();
};

// ============================================================================
// SECURITY MONITORING
// ============================================================================

/**
 * Security Event Logging
 * Comprehensive logging of security-related events
 */
export const securityEventLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Log all requests for security monitoring
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log suspicious status codes
    if (res.statusCode >= 400) {
      securityLogger.suspiciousActivity(
        req.user?.userId || '',
        'http_error_response',
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
        },
        req.ip
      );
    }
    
    // Log slow requests (potential DoS)
    if (duration > 5000) { // 5 seconds
      securityLogger.suspiciousActivity(
        req.user?.userId || '',
        'slow_request',
        {
          method: req.method,
          url: req.url,
          duration,
        },
        req.ip
      );
    }
  });
  
  next();
};

/**
 * Brute Force Protection
 * Tracks failed login attempts and implements progressive delays
 */
export const bruteForceProtection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const key = `brute_force:${req.ip}`;
  
  try {
    if (cacheService) {
      const attempts = await cacheService.get<number>(key) || 0;
      
      if (attempts >= 5) {
        const lockoutTime = Math.min(Math.pow(2, attempts - 5) * 60, 3600); // Max 1 hour
        
        securityLogger.suspiciousActivity(
          '',
          'brute_force_lockout',
          { attempts, lockoutTime },
          req.ip
        );
        
        res.status(429).json({
          success: false,
          message: `Too many failed attempts. Try again in ${Math.ceil(lockoutTime / 60)} minutes`,
          code: ErrorCodes.RATE_LIMIT_EXCEEDED,
        });
        return;
      }
    }
    
    next();
  } catch (error) {
    logger.error('Brute force protection error', { error });
    next(); // Continue on error
  }
};

/**
 * Record Failed Login Attempt
 * Helper function to record failed authentication attempts
 */
export const recordFailedAttempt = async (ip: string): Promise<void> => {
  try {
    if (cacheService) {
      const key = `brute_force:${ip}`;
      const attempts = await cacheService.increment(key, 3600); // 1 hour TTL
      
      securityLogger.loginAttempt('', false, ip);
      
      if (attempts >= 3) {
        securityLogger.suspiciousActivity(
          '',
          'multiple_failed_logins',
          { attempts },
          ip
        );
      }
    }
  } catch (error) {
    logger.error('Failed to record login attempt', { error });
  }
};

/**
 * Clear Failed Attempts
 * Helper function to clear failed attempts on successful login
 */
export const clearFailedAttempts = async (ip: string): Promise<void> => {
  try {
    if (cacheService) {
      const key = `brute_force:${ip}`;
      await cacheService.delete(key);
    }
  } catch (error) {
    logger.error('Failed to clear login attempts', { error });
  }
};