/**
 * Student Profile Controller
 * Handles student profile management, metrics, and recommendations
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { studentProfileService } from '../services/student-profile.service';
import { 
  ProfileUpdateData, 
  StudentSkillData, 
  StudentPreferenceData,
  ExperienceData,
  ProjectData 
} from '../types/student.types';

/**
 * Get complete student profile
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

    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    const completion = await studentProfileService.getProfileCompletion(currentStudent.studentId);

    // Return the student data directly (not wrapped in data object) to match test expectations
    res.json({
      ...currentStudent,
      completion
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

/**
 * Update basic profile information
 */
export const updateProfile = async (req: Request, res: Response) => {
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

    const updateData: ProfileUpdateData = req.body;
    
    // Find student by user ID
    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    
    const updatedStudent = await studentProfileService.updateBasicProfile(
      currentStudent.studentId, 
      updateData
    );

    const completion = await studentProfileService.getProfileCompletion(currentStudent.studentId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        student: updatedStudent,
        completion
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Update student skills
 */
export const updateSkills = async (req: Request, res: Response) => {
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

    const { skills }: { skills: StudentSkillData[] } = req.body;
    
    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    
    const updatedSkills = await studentProfileService.updateSkills(
      currentStudent.studentId, 
      skills
    );

    res.json({
      success: true,
      message: 'Skills updated successfully',
      data: {
        skills: updatedSkills
      }
    });

  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skills'
    });
  }
};

/**
 * Update student preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
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

    const { preferences }: { preferences: StudentPreferenceData[] } = req.body;
    
    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    
    const updatedPreferences = await studentProfileService.updatePreferences(
      currentStudent.studentId, 
      preferences
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: updatedPreferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

/**
 * Add work experience
 */
export const addExperience = async (req: Request, res: Response) => {
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

    const experienceData: ExperienceData = req.body;
    
    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    
    const newExperience = await studentProfileService.addExperience(
      currentStudent.studentId, 
      experienceData
    );

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: {
        experience: newExperience
      }
    });

  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add experience'
    });
  }
};

/**
 * Add project
 */
export const addProject = async (req: Request, res: Response) => {
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

    const projectData: ProjectData = req.body;
    
    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    
    const newProject = await studentProfileService.addProject(
      currentStudent.studentId, 
      projectData
    );

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: {
        project: newProject
      }
    });

  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project'
    });
  }
};

/**
 * Get student metrics and breakdown
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    const metrics = await studentProfileService.recalculateMetrics(currentStudent.studentId);

    // Return metrics in 0-1 scale for tests
    res.json({
      skillScore: metrics.skillScore / 100,
      academicScore: metrics.academicScore / 100,
      experienceScore: metrics.experienceScore / 100,
      preferenceScore: metrics.preferenceScore / 100,
      hireabilityScore: metrics.hireabilityScore / 100,
      lastComputed: metrics.lastComputed,
      computeVersion: metrics.computeVersion
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics'
    });
  }
};

/**
 * Get profile completion status
 */
export const getProfileCompletion = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    const completion = await studentProfileService.getProfileCompletion(currentStudent.studentId);

    res.json({
      success: true,
      data: completion
    });

  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile completion'
    });
  }
};

/**
 * Recalculate student metrics manually
 */
export const recalculateMetrics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const currentStudent = await studentProfileService.getCompleteProfile(req.user.userId);
    const metrics = await studentProfileService.recalculateMetrics(currentStudent.studentId);

    // Return metrics in the format expected by tests (0-1 scale)
    res.json({
      skillScore: metrics.skillScore / 100,
      academicScore: metrics.academicScore / 100,
      experienceScore: metrics.experienceScore / 100,
      preferenceScore: metrics.preferenceScore / 100,
      hireabilityScore: metrics.hireabilityScore / 100,
      lastComputed: metrics.lastComputed,
      computeVersion: metrics.computeVersion
    });

  } catch (error) {
    console.error('Recalculate metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate metrics'
    });
  }
};