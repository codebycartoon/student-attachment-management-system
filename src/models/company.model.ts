/**
 * Company Model & DTOs
 * Data Transfer Objects and business logic for Company entity
 */

import { Company } from '@prisma/client';

// ============================================================================
// COMPANY DTOs
// ============================================================================

export interface CompanyDTO {
  companyId: string;
  userId: string;
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  logoPath?: string;
  description?: string;
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyPublicDTO {
  companyId: string;
  companyName: string;
  industry?: string;
  location?: string;
  website?: string;
  logoPath?: string;
  description?: string;
  profileCompletion: number;
}

export interface CompanyUpdateDTO {
  companyName?: string;
  industry?: string;
  location?: string;
  website?: string;
  logoPath?: string;
  description?: string;
}

// ============================================================================
// COMPANY BUSINESS LOGIC
// ============================================================================

export class CompanyModel {
  /**
   * Convert Prisma Company to DTO
   */
  static toDTO(company: Company): CompanyDTO {
    return {
      companyId: company.companyId,
      userId: company.userId,
      companyName: company.companyName,
      industry: company.industry || undefined,
      location: company.location || undefined,
      website: company.website || undefined,
      logoPath: company.logoPath || undefined,
      description: company.description || undefined,
      profileCompletion: this.calculateProfileCompletion(company),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  /**
   * Convert to public DTO (safe for external consumption)
   */
  static toPublicDTO(company: Company): CompanyPublicDTO {
    return {
      companyId: company.companyId,
      companyName: company.companyName,
      industry: company.industry || undefined,
      location: company.location || undefined,
      website: company.website || undefined,
      logoPath: company.logoPath || undefined,
      description: company.description || undefined,
      profileCompletion: this.calculateProfileCompletion(company),
    };
  }

  /**
   * Calculate profile completion percentage
   */
  static calculateProfileCompletion(company: Company): number {
    const fields = [
      company.companyName,
      company.industry,
      company.location,
      company.website,
      company.description,
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Get display name
   */
  static getDisplayName(company: Company): string {
    return company.companyName || 'Unnamed Company';
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
  static getMissingFields(company: Company): string[] {
    const fieldMap = {
      companyName: company.companyName,
      industry: company.industry,
      location: company.location,
      website: company.website,
      description: company.description,
    };

    return Object.entries(fieldMap)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field, _]) => field);
  }

  /**
   * Check if profile is ready for posting opportunities
   */
  static isReadyForOpportunities(company: Company): boolean {
    // Minimum requirements for posting opportunities
    const requiredFields = [
      company.companyName,
      company.industry,
      company.location,
    ];

    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get profile strength score (0-100)
   */
  static getProfileStrength(company: Company): number {
    let score = 0;

    // Basic info (60 points)
    if (company.companyName && company.companyName.trim()) score += 20;
    if (company.industry && company.industry.trim()) score += 20;
    if (company.location && company.location.trim()) score += 20;

    // Online presence (20 points)
    if (company.website && this.isValidWebsiteUrl(company.website)) score += 20;

    // Company branding (20 points)
    if (company.description && company.description.trim()) {
      const descLength = company.description.trim().length;
      if (descLength >= 100) score += 20;
      else if (descLength >= 50) score += 15;
      else score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Generate profile recommendations
   */
  static getProfileRecommendations(company: Company): string[] {
    const recommendations: string[] = [];
    const missingFields = this.getMissingFields(company);

    if (missingFields.includes('industry')) {
      recommendations.push('Add your industry to help students find relevant opportunities');
    }

    if (missingFields.includes('location')) {
      recommendations.push('Add your company location to attract local talent');
    }

    if (missingFields.includes('website')) {
      recommendations.push('Add your company website to build credibility');
    }

    if (missingFields.includes('description')) {
      recommendations.push('Add a company description to showcase your culture and values');
    } else if (company.description && company.description.length < 100) {
      recommendations.push('Expand your company description to better attract candidates');
    }

    if (!company.logoPath) {
      recommendations.push('Upload a company logo to improve your brand presence');
    }

    return recommendations;
  }

  /**
   * Get company size category (placeholder for future implementation)
   */
  static getCompanySize(company: Company): 'startup' | 'small' | 'medium' | 'large' | 'enterprise' {
    // This would be based on employee count in future phases
    // For now, return a default
    return 'medium';
  }

  /**
   * Get industry category
   */
  static getIndustryCategory(industry?: string): string {
    if (!industry) return 'Other';

    const industryMap: { [key: string]: string } = {
      'technology': 'Technology',
      'software': 'Technology',
      'it': 'Technology',
      'finance': 'Finance',
      'banking': 'Finance',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'retail': 'Retail',
      'manufacturing': 'Manufacturing',
      'consulting': 'Consulting',
      'marketing': 'Marketing',
      'media': 'Media',
      'nonprofit': 'Non-Profit',
    };

    const normalizedIndustry = industry.toLowerCase();
    
    for (const [key, category] of Object.entries(industryMap)) {
      if (normalizedIndustry.includes(key)) {
        return category;
      }
    }

    return 'Other';
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const CompanyValidation = {
  /**
   * Validate company update data
   */
  validateUpdateData(data: CompanyUpdateDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.companyName !== undefined && (!data.companyName || data.companyName.trim().length < 1)) {
      errors.push('Company name cannot be empty');
    }

    if (data.companyName !== undefined && data.companyName && data.companyName.length > 100) {
      errors.push('Company name must be 100 characters or less');
    }

    if (data.industry !== undefined && data.industry && data.industry.length > 100) {
      errors.push('Industry must be 100 characters or less');
    }

    if (data.location !== undefined && data.location && data.location.length > 100) {
      errors.push('Location must be 100 characters or less');
    }

    if (data.website !== undefined && data.website && !CompanyModel.isValidWebsiteUrl(data.website)) {
      errors.push('Invalid website URL format');
    }

    if (data.description !== undefined && data.description && data.description.length > 2000) {
      errors.push('Description must be 2000 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate company name uniqueness (would check database in real implementation)
   */
  async validateCompanyNameUniqueness(companyName: string, excludeCompanyId?: string): Promise<boolean> {
    // This would check the database for existing company names
    // For now, return true (assuming unique)
    return true;
  },
};