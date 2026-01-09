/**
 * Phase 1 Authentication Controller
 * Handles role-based registration, login, and session management
 */

import { Request, Response } from 'express';
import { AuthPhase1Service } from '../services/auth-phase1.service';
import { logger } from '../config/logger';
import { 
  StudentRegistrationSchema,
  CompanyRegistrationSchema,
  AdminRegistrationSchema,
  LoginRequestSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  AppError,
  ErrorCodes,
  ApiResponse
} from '../types/phase1';
import { 
  recordFailedAttempt, 
  clearFailedAttempts 
} from '../middleware/security';

export class AuthPhase1Controller {
  private authService: AuthPhase1Service;

  constructor() {
    this.authService = new AuthPhase1Service();
  }

  /**
   * Register a new student
   * POST /api/v1/auth/register/student
   */
  registerStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = StudentRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const userData = validationResult.data;
      const clientIP = req.ip;

      // Register student
      const result = await this.authService.registerStudent(userData, clientIP);

      // Clear any failed login attempts for this IP
      await clearFailedAttempts(clientIP);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Register a new company
   * POST /api/v1/auth/register/company
   */
  registerCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = CompanyRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const userData = validationResult.data;
      const clientIP = req.ip;

      // Register company
      const result = await this.authService.registerCompany(userData, clientIP);

      // Clear any failed login attempts for this IP
      await clearFailedAttempts(clientIP);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Company registered successfully',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Register a new admin (requires invite code)
   * POST /api/v1/auth/register/admin
   */
  registerAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = AdminRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const userData = validationResult.data;
      const clientIP = req.ip;

      // Register admin
      const result = await this.authService.registerAdmin(userData, clientIP);

      // Clear any failed login attempts for this IP
      await clearFailedAttempts(clientIP);

      // Set secure HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validationResult = LoginRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const credentials = validationResult.data;
      const clientIP = req.ip;
      const userAgent = req.get('User-Agent');

      try {
        // Attempt login
        const result = await this.authService.login(credentials, clientIP, userAgent);

        // Clear failed login attempts on success
        await clearFailedAttempts(clientIP);

        // Set secure HTTP-only cookie for refresh token
        res.cookie('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: result.user,
            accessToken: result.tokens.accessToken,
            expiresAt: result.tokens.expiresAt,
          },
        } as ApiResponse);

      } catch (loginError) {
        // Record failed login attempt
        await recordFailedAttempt(clientIP);
        throw loginError;
      }

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required',
        } as ApiResponse);
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      // Update refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          expiresAt: result.expiresAt,
        },
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.user?.sessionId;

      if (sessionId) {
        await this.authService.logout(sessionId);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Initiate password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = ForgotPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const { email } = validationResult.data;
      const clientIP = req.ip;

      await this.authService.initiatePasswordReset(email, clientIP);

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = ResetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const { token, password } = validationResult.data;
      const clientIP = req.ip;

      await this.authService.completePasswordReset(token, password, clientIP);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const validationResult = ChangePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        } as ApiResponse);
        return;
      }

      const { currentPassword, newPassword } = validationResult.data;
      const userId = req.user!.userId;
      const clientIP = req.ip;

      await this.authService.changePassword(userId, currentPassword, newPassword, clientIP);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user!;

      res.status(200).json({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          role: user.role,
        },
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Get user sessions
   * GET /api/v1/auth/sessions
   */
  getUserSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const sessions = await this.authService.getUserSessions(userId);

      res.status(200).json({
        success: true,
        data: sessions,
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Revoke specific session
   * DELETE /api/v1/auth/sessions/:sessionId
   */
  revokeSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      await this.authService.revokeSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Revoke all sessions except current
   * DELETE /api/v1/auth/sessions
   */
  revokeAllSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const currentSessionId = req.user!.sessionId;

      await this.authService.revokeAllSessions(userId, currentSessionId);

      res.status(200).json({
        success: true,
        message: 'All other sessions revoked successfully',
      } as ApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      } as ApiResponse);
    } else {
      logger.error('Authentication controller error', { error });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
      } as ApiResponse);
    }
  }
}