/**
 * Authentication & Authorization Middleware
 * JWT-based authentication with role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: {
        userId: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'Account suspended'
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired'
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Require specific role(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Require student role
 */
export const requireStudent = requireRole('STUDENT');

/**
 * Require company role
 */
export const requireCompany = requireRole('COMPANY');

/**
 * Require admin role
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Allow multiple roles
 */
export const requireAnyRole = (...roles: UserRole[]) => requireRole(...roles);