/**
 * Admin Model & DTOs
 * Data Transfer Objects and business logic for Admin entity
 */

import { Admin } from '@prisma/client';

// ============================================================================
// ADMIN DTOs
// ============================================================================

export interface AdminDTO {
  adminId: string;
  userId: string;
  superAdmin: boolean;
  inviteCode?: string;
  permissions: AdminPermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPublicDTO {
  adminId: string;
  superAdmin: boolean;
  permissions: AdminPermission[];
  createdAt: Date;
}

export interface AdminUpdateDTO {
  superAdmin?: boolean;
  inviteCode?: string;
}

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

export type AdminPermission = 
  | 'user_management'
  | 'opportunity_management'
  | 'application_oversight'
  | 'system_monitoring'
  | 'data_export'
  | 'security_logs'
  | 'super_admin_actions';

export interface AdminPermissionSet {
  canManageUsers: boolean;
  canManageOpportunities: boolean;
  canViewApplications: boolean;
  canMonitorSystem: boolean;
  canExportData: boolean;
  canViewSecurityLogs: boolean;
  canPerformSuperAdminActions: boolean;
}

// ============================================================================
// ADMIN BUSINESS LOGIC
// ============================================================================

export class AdminModel {
  /**
   * Convert Prisma Admin to DTO
   */
  static toDTO(admin: Admin): AdminDTO {
    return {
      adminId: admin.adminId,
      userId: admin.userId,
      superAdmin: admin.superAdmin,
      inviteCode: admin.inviteCode || undefined,
      permissions: this.getPermissions(admin),
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  /**
   * Convert to public DTO (safe for external consumption)
   */
  static toPublicDTO(admin: Admin): AdminPublicDTO {
    return {
      adminId: admin.adminId,
      superAdmin: admin.superAdmin,
      permissions: this.getPermissions(admin),
      createdAt: admin.createdAt,
    };
  }

  /**
   * Get admin permissions based on role
   */
  static getPermissions(admin: Admin): AdminPermission[] {
    const basePermissions: AdminPermission[] = [
      'user_management',
      'opportunity_management',
      'application_oversight',
      'system_monitoring',
    ];

    const superAdminPermissions: AdminPermission[] = [
      ...basePermissions,
      'data_export',
      'security_logs',
      'super_admin_actions',
    ];

    return admin.superAdmin ? superAdminPermissions : basePermissions;
  }

  /**
   * Get permission set as boolean flags
   */
  static getPermissionSet(admin: Admin): AdminPermissionSet {
    const permissions = this.getPermissions(admin);

    return {
      canManageUsers: permissions.includes('user_management'),
      canManageOpportunities: permissions.includes('opportunity_management'),
      canViewApplications: permissions.includes('application_oversight'),
      canMonitorSystem: permissions.includes('system_monitoring'),
      canExportData: permissions.includes('data_export'),
      canViewSecurityLogs: permissions.includes('security_logs'),
      canPerformSuperAdminActions: permissions.includes('super_admin_actions'),
    };
  }

  /**
   * Check if admin has specific permission
   */
  static hasPermission(admin: Admin, permission: AdminPermission): boolean {
    const permissions = this.getPermissions(admin);
    return permissions.includes(permission);
  }

  /**
   * Get display name
   */
  static getDisplayName(admin: Admin): string {
    return admin.superAdmin ? 'Super Administrator' : 'Administrator';
  }

  /**
   * Get admin level
   */
  static getAdminLevel(admin: Admin): 'admin' | 'super_admin' {
    return admin.superAdmin ? 'super_admin' : 'admin';
  }

  /**
   * Generate new invite code
   */
  static generateInviteCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ADMIN_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Validate invite code format
   */
  static isValidInviteCode(code: string): boolean {
    // Basic validation - in production, this would check against a database
    const inviteCodeRegex = /^ADMIN_[A-Z0-9_]+$/;
    return inviteCodeRegex.test(code) && code.length >= 10;
  }

  /**
   * Get admin capabilities description
   */
  static getCapabilitiesDescription(admin: Admin): string[] {
    const capabilities: string[] = [];
    const permissions = this.getPermissionSet(admin);

    if (permissions.canManageUsers) {
      capabilities.push('Manage user accounts and profiles');
    }

    if (permissions.canManageOpportunities) {
      capabilities.push('Oversee job opportunities and postings');
    }

    if (permissions.canViewApplications) {
      capabilities.push('Monitor application processes');
    }

    if (permissions.canMonitorSystem) {
      capabilities.push('Access system health and performance metrics');
    }

    if (permissions.canExportData) {
      capabilities.push('Export system data and generate reports');
    }

    if (permissions.canViewSecurityLogs) {
      capabilities.push('Access security logs and audit trails');
    }

    if (permissions.canPerformSuperAdminActions) {
      capabilities.push('Perform system-wide administrative actions');
    }

    return capabilities;
  }

  /**
   * Check if admin can access resource
   */
  static canAccessResource(admin: Admin, resource: AdminResource): boolean {
    const permissions = this.getPermissionSet(admin);

    switch (resource) {
      case 'users':
        return permissions.canManageUsers;
      case 'opportunities':
        return permissions.canManageOpportunities;
      case 'applications':
        return permissions.canViewApplications;
      case 'system_health':
        return permissions.canMonitorSystem;
      case 'data_export':
        return permissions.canExportData;
      case 'security_logs':
        return permissions.canViewSecurityLogs;
      case 'super_admin_panel':
        return permissions.canPerformSuperAdminActions;
      default:
        return false;
    }
  }
}

// ============================================================================
// ADMIN RESOURCE TYPES
// ============================================================================

export type AdminResource = 
  | 'users'
  | 'opportunities'
  | 'applications'
  | 'system_health'
  | 'data_export'
  | 'security_logs'
  | 'super_admin_panel';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const AdminValidation = {
  /**
   * Validate admin update data
   */
  validateUpdateData(data: AdminUpdateDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.inviteCode !== undefined && data.inviteCode && !AdminModel.isValidInviteCode(data.inviteCode)) {
      errors.push('Invalid invite code format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate permission change
   */
  validatePermissionChange(
    currentAdmin: Admin,
    targetAdmin: Admin,
    newPermissions: Partial<AdminPermissionSet>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Only super admins can modify super admin permissions
    if (newPermissions.canPerformSuperAdminActions && !currentAdmin.superAdmin) {
      errors.push('Only super administrators can grant super admin permissions');
    }

    // Admins cannot modify their own super admin status
    if (currentAdmin.adminId === targetAdmin.adminId && newPermissions.canPerformSuperAdminActions !== undefined) {
      errors.push('Cannot modify your own super admin status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};