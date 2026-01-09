import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';
import { logger } from '../config/logger';
import { metricsService } from '../services/metrics.service';
import { cvParser } from '../utils/cvParser';
import { transcriptParser } from '../utils/transcriptParser';

const prisma = new PrismaClient();

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const studentId = req.params.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const docType = req.body.documentType || 'document';
    cb(null, `${studentId}_${docType}_${timestamp}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow PDF, DOC, DOCX files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const uploadDocumentSchema = z.object({
  documentType: z.enum(['CV', 'TRANSCRIPT', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE']),
});

// ============================================================================
// UPLOAD CONTROLLERS
// ============================================================================

export const uploadCV = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    logger.info('CV upload started', { studentId: id, fileName, fileSize });

    // Create document record
    const document = await prisma.studentDocument.create({
      data: {
        studentId: id,
        documentType: 'CV',
        fileName,
        filePath,
        fileSize,
        mimeType,
        parseStatus: 'PENDING',
      },
    });

    // Parse CV asynchronously
    parseDocumentAsync(document.documentId, filePath, 'CV');

    // Update student profile with CV path
    await prisma.studentProfile.upsert({
      where: { studentId: id },
      update: { cvFilePath: filePath },
      create: {
        studentId: id,
        cvFilePath: filePath,
      },
    });

    res.status(201).json({
      message: 'CV uploaded successfully',
      document: {
        documentId: document.documentId,
        fileName,
        fileSize,
        uploadedAt: document.uploadedAt,
        parseStatus: document.parseStatus,
      },
    });
  } catch (error) {
    logger.error('Error uploading CV:', error);
    
    // Clean up file if upload failed
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up failed upload:', cleanupError);
      }
    }

    res.status(500).json({ error: 'Failed to upload CV' });
  }
};

export const uploadTranscript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    logger.info('Transcript upload started', { studentId: id, fileName, fileSize });

    // Create document record
    const document = await prisma.studentDocument.create({
      data: {
        studentId: id,
        documentType: 'TRANSCRIPT',
        fileName,
        filePath,
        fileSize,
        mimeType,
        parseStatus: 'PENDING',
      },
    });

    // Parse transcript asynchronously
    parseDocumentAsync(document.documentId, filePath, 'TRANSCRIPT');

    // Update student profile with transcript path
    await prisma.studentProfile.upsert({
      where: { studentId: id },
      update: { transcriptFilePath: filePath },
      create: {
        studentId: id,
        transcriptFilePath: filePath,
      },
    });

    res.status(201).json({
      message: 'Transcript uploaded successfully',
      document: {
        documentId: document.documentId,
        fileName,
        fileSize,
        uploadedAt: document.uploadedAt,
        parseStatus: document.parseStatus,
      },
    });
  } catch (error) {
    logger.error('Error uploading transcript:', error);
    
    // Clean up file if upload failed
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up failed upload:', cleanupError);
      }
    }

    res.status(500).json({ error: 'Failed to upload transcript' });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = uploadDocumentSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    logger.info('Document upload started', { 
      studentId: id, 
      documentType: validatedData.documentType,
      fileName, 
      fileSize 
    });

    // Create document record
    const document = await prisma.studentDocument.create({
      data: {
        studentId: id,
        documentType: validatedData.documentType,
        fileName,
        filePath,
        fileSize,
        mimeType,
        parseStatus: validatedData.documentType === 'CV' || validatedData.documentType === 'TRANSCRIPT' 
          ? 'PENDING' 
          : 'COMPLETED',
      },
    });

    // Parse document if it's CV or transcript
    if (validatedData.documentType === 'CV' || validatedData.documentType === 'TRANSCRIPT') {
      parseDocumentAsync(document.documentId, filePath, validatedData.documentType);
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        documentId: document.documentId,
        documentType: validatedData.documentType,
        fileName,
        fileSize,
        uploadedAt: document.uploadedAt,
        parseStatus: document.parseStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    logger.error('Error uploading document:', error);
    
    // Clean up file if upload failed
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up failed upload:', cleanupError);
      }
    }

    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export const getStudentDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const documents = await prisma.studentDocument.findMany({
      where: { studentId: id },
      select: {
        documentId: true,
        documentType: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        parseStatus: true,
        parseError: true,
        uploadedAt: true,
        parsedAt: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    res.json({ documents });
  } catch (error) {
    logger.error('Error fetching student documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id, documentId } = req.params;

    // Verify ownership
    const document = await prisma.studentDocument.findUnique({
      where: { documentId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!document || document.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      logger.warn('Could not delete file from filesystem:', { 
        filePath: document.filePath, 
        error: fileError 
      });
    }

    // Delete document record
    await prisma.studentDocument.delete({
      where: { documentId },
    });

    // Update student profile if it was CV or transcript
    if (document.documentType === 'CV') {
      await prisma.studentProfile.updateMany({
        where: { 
          studentId: id,
          cvFilePath: document.filePath,
        },
        data: { 
          cvFilePath: null,
          cvParsedText: null,
        },
      });
    } else if (document.documentType === 'TRANSCRIPT') {
      await prisma.studentProfile.updateMany({
        where: { 
          studentId: id,
          transcriptFilePath: document.filePath,
        },
        data: { 
          transcriptFilePath: null,
          transcriptParsedText: null,
        },
      });
    }

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export const getDocumentParseStatus = async (req: Request, res: Response) => {
  try {
    const { id, documentId } = req.params;

    // Verify ownership
    const document = await prisma.studentDocument.findUnique({
      where: { documentId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!document || document.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      documentId: document.documentId,
      parseStatus: document.parseStatus,
      parseError: document.parseError,
      parsedAt: document.parsedAt,
      hasContent: !!document.parsedText,
    });
  } catch (error) {
    logger.error('Error getting document parse status:', error);
    res.status(500).json({ error: 'Failed to get parse status' });
  }
};

// ============================================================================
// ASYNC DOCUMENT PARSING
// ============================================================================

async function parseDocumentAsync(documentId: string, filePath: string, documentType: string) {
  try {
    logger.info('Starting document parsing', { documentId, documentType });

    // Update status to processing
    await prisma.studentDocument.update({
      where: { documentId },
      data: { parseStatus: 'PROCESSING' },
    });

    let parsedText = '';
    let profileUpdates: any = {};

    if (documentType === 'CV') {
      const cvData = await cvParser.parseCV(filePath);
      parsedText = cvData.text;
      profileUpdates.cvParsedText = parsedText;

      // Extract and update skills, experience, etc. from CV
      if (cvData.extractedData) {
        await updateStudentFromCVData(documentId, cvData.extractedData);
      }
    } else if (documentType === 'TRANSCRIPT') {
      const transcriptData = await transcriptParser.parseTranscript(filePath);
      parsedText = transcriptData.text;
      profileUpdates.transcriptParsedText = parsedText;

      // Extract and update academic info from transcript
      if (transcriptData.extractedData) {
        await updateStudentFromTranscriptData(documentId, transcriptData.extractedData);
      }
    }

    // Update document with parsed text
    await prisma.studentDocument.update({
      where: { documentId },
      data: {
        parsedText,
        parseStatus: 'COMPLETED',
        parsedAt: new Date(),
      },
    });

    // Update student profile with parsed text
    const document = await prisma.studentDocument.findUnique({
      where: { documentId },
      select: { studentId: true },
    });

    if (document && Object.keys(profileUpdates).length > 0) {
      await prisma.studentProfile.upsert({
        where: { studentId: document.studentId },
        update: profileUpdates,
        create: {
          studentId: document.studentId,
          ...profileUpdates,
        },
      });

      // Trigger metrics recomputation
      await metricsService.recomputeStudentMetrics(document.studentId);
    }

    logger.info('Document parsing completed', { documentId, documentType });
  } catch (error) {
    logger.error('Error parsing document:', { documentId, documentType, error });

    // Update status to failed
    await prisma.studentDocument.update({
      where: { documentId },
      data: {
        parseStatus: 'FAILED',
        parseError: error instanceof Error ? error.message : 'Unknown parsing error',
      },
    });
  }
}

async function updateStudentFromCVData(documentId: string, cvData: any) {
  // This would contain logic to extract skills, experience, etc. from parsed CV
  // For now, we'll just log that we received the data
  logger.info('CV data extracted', { documentId, dataKeys: Object.keys(cvData) });
}

async function updateStudentFromTranscriptData(documentId: string, transcriptData: any) {
  // This would contain logic to extract GPA, courses, etc. from parsed transcript
  // For now, we'll just log that we received the data
  logger.info('Transcript data extracted', { documentId, dataKeys: Object.keys(transcriptData) });
}