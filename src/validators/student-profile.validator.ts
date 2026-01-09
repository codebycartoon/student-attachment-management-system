/**
 * Student Profile Validation Rules
 * Express-validator rules for student profile endpoints
 */

import { body } from 'express-validator';

/**
 * Profile update validation
 */
export const validateProfileUpdate = [
  body('basicInfo.firstName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),

  body('basicInfo.lastName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),

  body('basicInfo.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),

  body('basicInfo.location')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Location must be between 1 and 255 characters'),

  body('basicInfo.linkedinUrl')
    .optional()
    .isURL()
    .withMessage('Valid LinkedIn URL is required'),

  body('basicInfo.websiteUrl')
    .optional()
    .isURL()
    .withMessage('Valid website URL is required'),

  body('basicInfo.elevatorPitch')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Elevator pitch must be less than 500 characters'),

  body('academicInfo.gpa')
    .optional()
    .isFloat({ min: 0, max: 4.0 })
    .withMessage('GPA must be between 0 and 4.0'),

  body('academicInfo.graduationDate')
    .optional()
    .isISO8601()
    .withMessage('Valid graduation date is required'),

  body('academicInfo.availabilityStartDate')
    .optional()
    .isISO8601()
    .withMessage('Valid availability start date is required'),

  body('academicInfo.attachmentDuration')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Attachment duration must be between 1 and 24 months'),

  body('academicInfo.willingToRelocate')
    .optional()
    .isBoolean()
    .withMessage('Willing to relocate must be a boolean'),

  body('academicInfo.remoteAllowed')
    .optional()
    .isBoolean()
    .withMessage('Remote allowed must be a boolean')
];

/**
 * Skills update validation
 */
export const validateSkillsUpdate = [
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),

  body('skills.*.skillId')
    .notEmpty()
    .withMessage('Skill ID is required'),

  body('skills.*.proficiency')
    .isInt({ min: 1, max: 5 })
    .withMessage('Proficiency must be between 1 and 5'),

  body('skills.*.yearsOfExperience')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50')
];

/**
 * Preferences update validation
 */
export const validatePreferencesUpdate = [
  body('preferences')
    .isArray({ min: 1 })
    .withMessage('At least one preference is required'),

  body('preferences.*.preferenceId')
    .notEmpty()
    .withMessage('Preference ID is required'),

  body('preferences.*.priority')
    .isInt({ min: 1, max: 5 })
    .withMessage('Priority must be between 1 and 5')
];

/**
 * Experience validation
 */
export const validateExperience = [
  body('jobTitle')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Job title is required and must be less than 255 characters'),

  body('company')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Company name is required and must be less than 255 characters'),

  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),

  body('employmentType')
    .isIn(['INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT', 'FREELANCE'])
    .withMessage('Valid employment type is required'),

  body('role')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Role description must be less than 1000 characters'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),

  body('technologies')
    .isArray()
    .withMessage('Technologies must be an array'),

  body('technologies.*')
    .notEmpty()
    .withMessage('Each technology ID must be provided')
];

/**
 * Project validation
 */
export const validateProject = [
  body('projectName')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('Project name is required and must be less than 255 characters'),

  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),

  body('projectType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Project type must be less than 100 characters'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),

  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('Valid GitHub URL is required'),

  body('liveUrl')
    .optional()
    .isURL()
    .withMessage('Valid live URL is required'),

  body('technologies')
    .isArray()
    .withMessage('Technologies must be an array'),

  body('technologies.*')
    .notEmpty()
    .withMessage('Each technology ID must be provided')
];

/**
 * Document upload validation
 */
export const validateDocumentUpload = [
  body('documentType')
    .isIn(['CV', 'TRANSCRIPT', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE'])
    .withMessage('Valid document type is required'),

  body('fileName')
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name is required and must be less than 255 characters'),

  body('fileSize')
    .isInt({ min: 1, max: 10485760 }) // 10MB max
    .withMessage('File size must be between 1 byte and 10MB'),

  body('mimeType')
    .isIn([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ])
    .withMessage('File must be PDF, DOC, DOCX, or TXT format')
];