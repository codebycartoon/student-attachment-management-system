/**
 * Reference Data Controller
 * Handles skills, universities, degrees, majors, and preferences
 */

import { Request, Response } from 'express';
import { referenceDataService } from '../services/reference-data.service';

/**
 * Get all skills
 */
export const getSkills = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let skills;
    if (search) {
      skills = await referenceDataService.searchSkills(search as string);
    } else if (category) {
      skills = await referenceDataService.getSkillsByCategory(category as string);
    } else {
      skills = await referenceDataService.getAllSkills();
    }

    res.json({
      success: true,
      data: {
        skills
      }
    });

  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skills'
    });
  }
};

/**
 * Get skill categories
 */
export const getSkillCategories = async (req: Request, res: Response) => {
  try {
    const categories = await referenceDataService.getSkillCategories();

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill categories'
    });
  }
};

/**
 * Get all universities
 */
export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let universities;
    if (search) {
      universities = await referenceDataService.searchUniversities(search as string);
    } else {
      universities = await referenceDataService.getAllUniversities();
    }

    res.json({
      success: true,
      data: {
        universities
      }
    });

  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get universities'
    });
  }
};

/**
 * Get all degrees
 */
export const getDegrees = async (req: Request, res: Response) => {
  try {
    const degrees = await referenceDataService.getAllDegrees();

    res.json({
      success: true,
      data: {
        degrees
      }
    });

  } catch (error) {
    console.error('Get degrees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get degrees'
    });
  }
};

/**
 * Get all majors
 */
export const getMajors = async (req: Request, res: Response) => {
  try {
    const { field } = req.query;

    let majors;
    if (field) {
      majors = await referenceDataService.getMajorsByField(field as string);
    } else {
      majors = await referenceDataService.getAllMajors();
    }

    res.json({
      success: true,
      data: {
        majors
      }
    });

  } catch (error) {
    console.error('Get majors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get majors'
    });
  }
};

/**
 * Get major fields
 */
export const getMajorFields = async (req: Request, res: Response) => {
  try {
    const fields = await referenceDataService.getMajorFields();

    res.json({
      success: true,
      data: {
        fields
      }
    });

  } catch (error) {
    console.error('Get major fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get major fields'
    });
  }
};

/**
 * Get all preferences
 */
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    let preferences;
    if (type) {
      preferences = await referenceDataService.getPreferencesByType(type as string);
    } else {
      preferences = await referenceDataService.getAllPreferences();
    }

    res.json({
      success: true,
      data: {
        preferences
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences'
    });
  }
};

/**
 * Get preference types
 */
export const getPreferenceTypes = async (req: Request, res: Response) => {
  try {
    const types = await referenceDataService.getPreferenceTypes();

    res.json({
      success: true,
      data: {
        types
      }
    });

  } catch (error) {
    console.error('Get preference types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preference types'
    });
  }
};

/**
 * Get all courses
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let courses;
    if (search) {
      courses = await referenceDataService.searchCourses(search as string);
    } else {
      courses = await referenceDataService.getAllCourses();
    }

    res.json({
      success: true,
      data: {
        courses
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses'
    });
  }
};