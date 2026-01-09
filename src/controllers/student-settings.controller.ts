/**
 * Student Settings Controller
 * Handles student account settings, notifications, and preferences
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { studentProfileService } from '../services/student-profile.service';

const prisma = new PrismaClient();

/**
 * Get account settings
 */
export const getAccountSettings = async (req: Request, res: Response) => {
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
      select: {
        email: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Default notification preferences (in a real app, these would be stored in DB)
    const notificationPreferences = {
      emailNotifications: true,
      applicationUpdates: true,
      opportunityMatches: true,
      interviewReminders: true
    };

    const privacySettings = {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    };

    res.json({
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      notificationPreferences,
      privacySettings
    });

  } catch (error) {
    console.error('Get account settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get account settings'
    });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const preferences = req.body;

    // In a real app, you'd store these in a user_preferences table
    // For now, just return the updated preferences
    res.json({
      success: true,
      message: 'Notification preferences updated',
      ...preferences
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { userId: req.user.userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};