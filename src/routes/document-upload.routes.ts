/**
 * Document Upload Routes
 * API endpoints for CV and transcript upload with parsing
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { authenticateToken, requireStudent } from '../middleware/auth';
import {
  upload,
  uploadDocument,
  getStudentDocuments,
  deleteDocument,
  getDocumentParseStatus
} from '../controllers/document-upload.controller';

const router = Router();

// Rate limiting for document operations
const documentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 document operations per windowMs
  message: {
    success: false,
    message: 'Too many document requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply authentication and student role requirement to all routes
router.use(authenticateToken);
router.use(requireStudent);
router.use(documentRateLimit);

// Document upload validation
const validateDocumentUpload = [
  body('documentType')
    .isIn(['CV', 'TRANSCRIPT', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE'])
    .withMessage('Valid document type is required')
];

/**
 * @route   POST /api/student/documents/cv
 * @desc    Upload CV with automatic parsing
 * @access  Private (Student only)
 */
router.post('/documents/cv', 
  upload.single('cv'), 
  (req, res, next) => {
    req.body.documentType = 'CV';
    next();
  },
  validateDocumentUpload, 
  uploadDocument
);

/**
 * @route   POST /api/student/documents/transcript
 * @desc    Upload transcript with automatic parsing
 * @access  Private (Student only)
 */
router.post('/documents/transcript', 
  upload.single('transcript'), 
  (req, res, next) => {
    req.body.documentType = 'TRANSCRIPT';
    next();
  },
  validateDocumentUpload, 
  uploadDocument
);

/**
 * @route   POST /api/student/documents
 * @desc    Upload document (CV or transcript) with automatic parsing
 * @access  Private (Student only)
 */
router.post('/documents', 
  upload.single('document'), 
  validateDocumentUpload, 
  uploadDocument
);

/**
 * @route   GET /api/student/documents
 * @desc    Get all student documents
 * @access  Private (Student only)
 */
router.get('/documents', getStudentDocuments);

/**
 * @route   DELETE /api/student/documents/:documentId
 * @desc    Delete a document
 * @access  Private (Student only)
 */
router.delete('/documents/:documentId', deleteDocument);

/**
 * @route   GET /api/student/documents/:documentId/status
 * @desc    Get document parse status
 * @access  Private (Student only)
 */
router.get('/documents/:documentId/status', getDocumentParseStatus);

export default router;