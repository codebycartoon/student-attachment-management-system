/**
 * Phase 1 Type Definitions
 * Focused on authentication and basic user management
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================================

export const UserRoleSchema = z.enum(['STUDENT', 'COMPANY', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Registration Schemas by Role
export const StudentRegistrationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  location: z.string().max(100).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  elevatorPitch: z.string().max(500, 'Elevator pitch too long').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const CompanyRegistrationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, 'Company name is required').max(100),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().max(2000).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const AdminRegistrationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
  inviteCode: z.string().min(1, 'Invite code is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  sessionId: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Password Reset Schemas
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AuthResponse {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
} as const;

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type StudentRegistration = z.infer<typeof StudentRegistrationSchema>;
export type CompanyRegistration = z.infer<typeof CompanyRegistrationSchema>;
export type AdminRegistration = z.infer<typeof AdminRegistrationSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;