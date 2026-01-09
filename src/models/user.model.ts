/**
 * User Model & DTOs
 * Data Transfer Objects and Prisma model mappings for User entity
 */

import { User, UserRole } from '@prisma/client';

// ============================================================================
// BASE USER INTERFACES
// ============================================================================

export interface UserBase {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithProfile extends UserBase {
  student?: StudentProfile | null;
  company?: CompanyProfile | null;
  admin?: AdminProfile | null;
}

// ============================================================================
// USER DTOs (Data Transfer Objects)
// ============================================================================

export interface UserPublicDTO {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserPrivateDTO extends UserPublicDTO {
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface UserRegistrationDTO {
  email: string;
  role: UserRole;
  profileData: StudentRegistrationData | CompanyRegistrationData | AdminRegistrationData;
}

// ============================================================================
// ROLE-SPECIFIC PROFILE INTERFACES
// ============================================================================

export interface StudentProfile {
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  companyId: string;
  userId: string;
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  logoPath?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  adminId: string;
  userId: string;
  superAdmin: boolean;
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REGISTRATION DATA INTERFACES
// ============================================================================

export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
}

export interface CompanyRegistrationData {
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
}

export interface AdminRegistrationData {
  inviteCode: string;
}

// ============================================================================
// USER UTILITY FUNCTIONS
// ============================================================================

export class UserModel {
  /**
   * Convert Prisma User to Public DTO
   */
  static toPublicDTO(user: User): UserPublicDTO {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Convert Prisma User to Private DTO
   */
  static toPrivateDTO(user: User): UserPrivateDTO {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: true, // TODO: Add isActive field to schema in future phases
    };
  }

  /**
   * Get display name based on role and profile
   */
  static getDisplayName(user: UserWithProfile): string {
    switch (user.role) {
      case 'STUDENT':
        return user.student 
          ? `${user.student.firstName} ${user.student.lastName}`
          : user.email;
      case 'COMPANY':
        return user.company?.companyName || user.email;
      case 'ADMIN':
        return `Admin (${user.email})`;
      default:
        return user.email;
    }
  }

  /**
   * Check if user profile is complete
   */
  static isProfileComplete(user: UserWithProfile): boolean {
    switch (user.role) {
      case 'STUDENT':
        return !!(user.student?.firstName && user.student?.lastName);
      case 'COMPANY':
        return !!(user.company?.companyName);
      case 'ADMIN':
        return true; // Admin profiles are always considered complete
      default:
        return false;
    }
  }

  /**
   * Get profile completion percentage
   */
  static getProfileCompletionPercentage(user: UserWithProfile): number {
    switch (user.role) {
      case 'STUDENT':
        if (!user.student) return 0;
        
        const studentFields = [
          user.student.firstName,
          user.student.lastName,
          user.student.phone,
          user.student.location,
          user.student.linkedinUrl,
          user.student.elevatorPitch,
        ];
        
        const completedFields = studentFields.filter(field => field && field.trim() !== '').length;
        return Math.round((completedFields / studentFields.length) * 100);

      case 'COMPANY':
        if (!user.company) return 0;
        
        const companyFields = [
          user.company.companyName,
          user.company.industry,
          user.company.location,
          user.company.website,
          user.company.description,
        ];
        
        const completedCompanyFields = companyFields.filter(field => field && field.trim() !== '').length;
        return Math.round((completedCompanyFields / companyFields.length) * 100);

      case 'ADMIN':
        return 100; // Admin profiles are always 100%

      default:
        return 0;
    }
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isStudentProfile(profile: any): profile is StudentProfile {
  return profile && typeof profile.firstName === 'string' && typeof profile.lastName === 'string';
}

export function isCompanyProfile(profile: any): profile is CompanyProfile {
  return profile && typeof profile.companyName === 'string';
}

export function isAdminProfile(profile: any): profile is AdminProfile {
  return profile && typeof profile.superAdmin === 'boolean';
}