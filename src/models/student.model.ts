/**
 * Student Model & DTOs
 * Data Transfer Objects and business logic for Student entity
 */

import { Student } from '@prisma/client';

// ============================================================================
// STUDENT DTOs
// ============================================================================

export interface StudentDTO {
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentPublicDTO {
  studentId: string;
  firstName: string;
  lastName: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
  profileCompletion: number;
}

export interface StudentUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  elevatorPitch?: string;
}

// ============================================================================
// STUDENT BUSINESS LOGIC
// ============================================================================

export class StudentModel {
  /**
   * Convert Prisma Student to DTO
   */
  static toDTO(student: Student): StudentDTO {
    return {
      studentId: student.studentId,
      userId: student.userId,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone || undefined,
      location: student.location || undefined,
      linkedinUrl: student.linkedinUrl || undefined,
      websiteUrl: student.websiteUrl || undefined,
      elevatorPitch: student.elevatorPitch || undefined,
      profileCompletion: this.calculateProfileCompletion(student),
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  /**
   * Convert to public DTO (safe for external consumption)
   */
  static toPublicDTO(student: Student): StudentPublicDTO {
    return {
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      location: student.location || undefined,
      linkedinUrl: student.linkedinUrl || undefined,
      websiteUrl: student.websiteUrl || undefined,
      elevatorPitch: student.elevatorPitch || undefined,
      profileCompletion: this.calculateProfileCompletion(student),
    };
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(student: Student): number {
    const fields = [
      student.firstName,
      student.lastName,
      student.phone,
      student.location,
      student.linkedinUrl,
      student.websiteUrl,
      student.elevatorPitch,
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Get full name
   */
  static getFullName(student: Student): string {
    return `${student.firstName} ${student.lastName}`.trim();
  }

  /**
   * Get display name (for UI)
   */
  static getDisplayName(student: Student): string {
    const fullName = this.getFullName(student);
    return fullName || 'Unnamed Student';
  }

  /**
   * Validate LinkedIn URL format
   */
  static isValidLinkedInUrl(url: string): boolean {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  }

  /**
   * Validate website URL format
   */
  static isValidWebsiteUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get missing profile fields
   */
  static getMissingFields(student: Student): string[] {
    const fieldMap = {
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      location: student.location,
      linkedinUrl: student.linkedinUrl,
      websiteUrl: student.websiteUrl,
      elevatorPitch: student.elevatorPitch,
    };

    return Object.entries(fieldMap)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field, _]) => field);
  }

  /**
   * Check if profile is ready for matching
   */
  static isReadyForMatching(student: Student): boolean {
    // Minimum requirements for matching
    const requiredFields = [
      student.firstName,
      student.lastName,
      student.location,
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get profile strength score (0-100)
   */
  static getProfileStrength(student: Student): number {
    let score = 0;

    // Basic info (40 points)
    if (student.firstName && student.firstName.trim()) score += 10;
    if (student.lastName && student.lastName.trim()) score += 10;
    if (student.phone && student.phone.trim()) score += 10;
    if (student.location && student.location.trim()) score += 10;

    // Professional links (30 points)
    if (student.linkedinUrl && this.isValidLinkedInUrl(student.linkedinUrl)) score += 20;
    if (student.websiteUrl && this.isValidWebsiteUrl(student.websiteUrl)) score += 10;

    // Personal branding (30 points)
    if (student.elevatorPitch && student.elevatorPitch.trim()) {
      const pitchLength = student.elevatorPitch.trim().length;
      if (pitchLength >= 50) score += 30;
      else if (pitchLength >= 20) score += 20;
      else score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Generate profile recommendations
   */
  static getProfileRecommendations(student: Student): string[] {
    const recommendations: string[] = [];
    const missingFields = this.getMissingFields(student);

    if (missingFields.includes('phone')) {
      recommendations.push('Add your phone number for better communication with employers');
    }

    if (missingFields.includes('location')) {
      recommendations.push('Add your location to find opportunities near you');
    }

    if (missingFields.includes('linkedinUrl')) {
      recommendations.push('Add your LinkedIn profile to showcase your professional network');
    }

    if (missingFields.includes('websiteUrl')) {
      recommendations.push('Add your portfolio website to showcase your work');
    }

    if (missingFields.includes('elevatorPitch')) {
      recommendations.push('Write an elevator pitch to make a great first impression');
    } else if (student.elevatorPitch && student.elevatorPitch.length < 50) {
      recommendations.push('Expand your elevator pitch to better describe your goals and skills');
    }

    return recommendations;
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const StudentValidation = {
  /**
   * Validate student update data
   */
  validateUpdateData(data: StudentUpdateDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.firstName !== undefined && (!data.firstName || data.firstName.trim().length < 1)) {
      errors.push('First name cannot be empty');
    }

    if (data.lastName !== undefined && (!data.lastName || data.lastName.trim().length < 1)) {
      errors.push('Last name cannot be empty');
    }

    if (data.phone !== undefined && data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.linkedinUrl !== undefined && data.linkedinUrl && !StudentModel.isValidLinkedInUrl(data.linkedinUrl)) {
      errors.push('Invalid LinkedIn URL format');
    }

    if (data.websiteUrl !== undefined && data.websiteUrl && !StudentModel.isValidWebsiteUrl(data.websiteUrl)) {
      errors.push('Invalid website URL format');
    }

    if (data.elevatorPitch !== undefined && data.elevatorPitch && data.elevatorPitch.length > 500) {
      errors.push('Elevator pitch must be 500 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};