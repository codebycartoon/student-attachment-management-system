/**
 * Authentication Controller
 * Handles user registration, login, logout, and password reset
 */

import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { validationResult } from 'express-validator';

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

interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Generate JWT tokens
 */
const generateTokens = (userId: string, email: string, role: UserRole) => {
  const jwtSecret = process.env['JWT_SECRET'];
  const refreshSecret = process.env['REFRESH_TOKEN_SECRET'];

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    refreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password, role, firstName, lastName, companyName }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and role-specific profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          status: 'ACTIVE'
        }
      });

      // Create role-specific profile
      let profile;
      switch (role) {
        case 'STUDENT':
          profile = await tx.student.create({
            data: {
              userId: user.userId,
              firstName: firstName || '',
              lastName: lastName || ''
            }
          });
          break;

        case 'COMPANY':
          profile = await tx.company.create({
            data: {
              userId: user.userId,
              companyName: companyName || ''
            }
          });
          break;

        case 'ADMIN':
          profile = await tx.admin.create({
            data: {
              userId: user.userId,
              superAdmin: false
            }
          });
          break;

        default:
          throw new Error(`Invalid role: ${role}`);
      }

      return { user, profile };
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      result.user.userId,
      result.user.email,
      result.user.role
    );

    // Store refresh token in session
    await prisma.userSession.create({
      data: {
        userId: result.user.userId,
        jwtToken: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          userId: result.user.userId,
          email: result.user.email,
          role: result.user.role,
          createdAt: result.user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        company: true,
        admin: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'Account suspended'
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.userId,
      user.email,
      user.role
    );

    // Store refresh token in session
    await prisma.userSession.create({
      data: {
        userId: user.userId,
        jwtToken: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Get profile data based on role
    let profileData;
    switch (user.role) {
      case 'STUDENT':
        profileData = user.student;
        break;
      case 'COMPANY':
        profileData = user.company;
        break;
      case 'ADMIN':
        profileData = user.admin;
        break;
      default:
        profileData = null;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
          profile: profileData
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    const refreshSecret = process.env['REFRESH_TOKEN_SECRET'];
    if (!refreshSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(token, refreshSecret) as any;

    // Check if session exists
    const session = await prisma.userSession.findFirst({
      where: {
        refreshToken: token,
        userId: decoded.userId
      },
      include: {
        user: true
      }
    });

    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await prisma.userSession.delete({
        where: { sessionId: session.sessionId }
      });
      res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      session.user.userId,
      session.user.email,
      session.user.role
    );

    // Update session with new tokens
    await prisma.userSession.update({
      where: { sessionId: session.sessionId },
      data: {
        jwtToken: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (refreshToken) {
      // Delete session with refresh token
      await prisma.userSession.deleteMany({
        where: { refreshToken }
      });
    } else if (accessToken) {
      // Delete session with access token
      await prisma.userSession.deleteMany({
        where: { jwtToken: accessToken }
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: {
        student: true,
        company: true,
        admin: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get profile data based on role
    let profileData;
    switch (user.role) {
      case 'STUDENT':
        profileData = user.student;
        break;
      case 'COMPANY':
        profileData = user.company;
        break;
      case 'ADMIN':
        profileData = user.admin;
        break;
      default:
        profileData = null;
    }

    res.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          profile: profileData
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};