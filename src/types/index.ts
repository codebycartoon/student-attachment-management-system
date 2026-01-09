/**
 * Core Type Definitions for Student-Company Matching Platform
 * Enterprise-grade TypeScript definitions with comprehensive validation
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================================

export const UserRoleSchema = z.enum(['STUDENT', 'COMPANY', 'ADMIN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  role: UserRoleSchema,
  confirmPassword: z.string()
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

// ============================================================================
// STUDENT PROFILE MANAGEMENT
// ============================================================================

export const StudentProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  location: z.string().max(100).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
  elevatorPitch: z.string().max(500, 'Elevator pitch too long').optional(),
  universityId: z.string().optional(),
  degreeId: z.string().optional(),
  majorId: z.string().optional(),
  gpa: z.number().min(0).max(4.0, 'GPA must be between 0 and 4.0').optional(),
  graduationDate: z.string().datetime().optional(),
  availabilityStartDate: z.string().datetime().optional(),
  attachmentDuration: z.number().int().min(1).max(24).optional(),
  willingToRelocate: z.boolean().default(false),
  remoteAllowed: z.boolean().default(false),
});

export const StudentSkillSchema = z.object({
  skillId: z.string(),
  proficiency: z.number().int().min(1).max(5),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  verified: z.boolean().default(false),
});

export const ExperienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  company: z.string().min(1, 'Company name is required').max(100),
  employmentType: z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  role: z.string().max(1000).optional(),
  technologies: z.array(z.string()).default([]),
});

export const ProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  projectType: z.string().max(50).optional(),
  link: z.string().url('Invalid project URL').optional(),
  technologies: z.array(z.string()).default([]),
});

// ============================================================================
// COMPANY MANAGEMENT
// ============================================================================

export const CompanyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
  industry: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().max(2000).optional(),
});

export const OpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  location: z.string().max(100).optional(),
  isRemote: z.boolean().default(false),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.number().int().min(1).max(24).optional(),
  gpaThreshold: z.number().min(0).max(4.0).optional(),
  isTechnical: z.boolean().default(true),
  desiredJobTypes: z.array(z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME'])).min(1),
  requiredSkills: z.array(z.object({
    skillId: z.string(),
    weight: z.number().min(0).max(1),
  })).min(1, 'At least one skill is required'),
});

// ============================================================================
// MATCHING & SCORING
// ============================================================================

export const MatchScoreSchema = z.object({
  studentId: z.string(),
  opportunityId: z.string(),
  skillMatch: z.number().min(0).max(100),
  academicFit: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100),
  preferenceFit: z.number().min(0).max(100),
  totalScore: z.number().min(0).max(100),
});

export const StudentMetricsSchema = z.object({
  studentId: z.string(),
  skillScore: z.number().min(0).max(100),
  academicScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  preferenceScore: z.number().min(0).max(100),
  hireabilityScore: z.number().min(0).max(100),
});

// ============================================================================
// APPLICATION MANAGEMENT
// ============================================================================

export const ApplicationStatusSchema = z.enum(['SUBMITTED', 'IN_REVIEW', 'INTERVIEW', 'HIRED', 'REJECTED']);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const ApplicationSchema = z.object({
  studentId: z.string(),
  opportunityId: z.string(),
  status: ApplicationStatusSchema.default('SUBMITTED'),
});

export const InterviewSchema = z.object({
  applicationId: z.string(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  interviewer: z.string().max(100).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
});

// ============================================================================
// FILE UPLOAD & PROCESSING
// ============================================================================

export const FileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  buffer: z.instanceof(Buffer),
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// SEARCH & FILTERING
// ============================================================================

export const OpportunityFiltersSchema = z.object({
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  jobTypes: z.array(z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME'])).optional(),
  skills: z.array(z.string()).optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  maxGpa: z.number().min(0).max(4.0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minDuration: z.number().int().min(1).optional(),
  maxDuration: z.number().int().max(24).optional(),
});

export const StudentFiltersSchema = z.object({
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  maxGpa: z.number().min(0).max(4.0).optional(),
  graduationYear: z.number().int().optional(),
  availabilityDate: z.string().datetime().optional(),
  willingToRelocate: z.boolean().optional(),
  remoteAllowed: z.boolean().optional(),
});

// ============================================================================
// SYSTEM MONITORING
// ============================================================================

export const SystemHealthSchema = z.object({
  database: z.object({
    connected: z.boolean(),
    responseTime: z.number(),
  }),
  redis: z.object({
    connected: z.boolean(),
    responseTime: z.number(),
  }),
  queue: z.object({
    pending: z.number(),
    processing: z.number(),
    failed: z.number(),
  }),
  memory: z.object({
    used: z.number(),
    total: z.number(),
    percentage: z.number(),
  }),
  uptime: z.number(),
});

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
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type StudentSkill = z.infer<typeof StudentSkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type MatchScore = z.infer<typeof MatchScoreSchema>;
export type StudentMetrics = z.infer<typeof StudentMetricsSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type Interview = z.infer<typeof InterviewSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type OpportunityFilters = z.infer<typeof OpportunityFiltersSchema>;
export type StudentFilters = z.infer<typeof StudentFiltersSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;