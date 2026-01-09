/**
 * Document Upload Controller
 * Handles CV and transcript upload with parsing
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { cvParser } from '../utils/cvParser';
import { transcriptParser } from '../utils/transcriptParser';
import { studentProfileService } from '../services/student-profile.service';
import { matchingQueueService } from '../services/matching-queue.service';

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const studentDir = path.join(uploadDir, 'students', req.user?.userId || 'unknown');
    
    // Create directory if it doesn't exist
    fs.mkdirSync(studentDir, { recursive: true });
    cb(null, studentDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow PDF, DOC, DOCX, TXT files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  }
});

/**
 * Upload document (CV or transcript)
 */
export const uploadDocument = async (req: Request, res: Response) => {
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const { documentType } = req.body;
    
    // Get student
    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    // Create document record
    const document = await prisma.studentDocument.create({
      data: {
        studentId: student.studentId,
        documentType: documentType as any,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        parseStatus: 'PENDING'
      }
    });

    // Start parsing process asynchronously
    parseDocumentAsync(document.documentId, req.file.path, documentType, student.studentId);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          documentId: document.documentId,
          fileName: document.fileName,
          documentType: document.documentType,
          fileSize: document.fileSize,
          parseStatus: document.parseStatus,
          uploadedAt: document.uploadedAt
        }
      }
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

/**
 * Parse document asynchronously
 */
async function parseDocumentAsync(documentId: string, filePath: string, documentType: string, studentId: string) {
  try {
    // Update status to processing
    await prisma.studentDocument.update({
      where: { documentId },
      data: { parseStatus: 'PROCESSING' }
    });

    let parsedText = '';
    let extractedData: any = null;

    if (documentType === 'CV') {
      const cvData = await cvParser.parseCV(filePath);
      parsedText = cvData.text;
      extractedData = cvData.extractedData;
      
      // Update student profile with extracted data
      await updateStudentFromCVData(studentId, extractedData);
      
    } else if (documentType === 'TRANSCRIPT') {
      const transcriptData = await transcriptParser.parseTranscript(filePath);
      parsedText = transcriptData.text;
      extractedData = transcriptData.extractedData;
      
      // Update student profile with extracted data
      await updateStudentFromTranscriptData(studentId, extractedData);
    }

    // Update document with parsed data
    await prisma.studentDocument.update({
      where: { documentId },
      data: {
        parsedText,
        parseStatus: 'COMPLETED',
        parsedAt: new Date()
      }
    });

    // Update student profile file paths
    if (documentType === 'CV') {
      await prisma.studentProfile.upsert({
        where: { studentId },
        create: {
          studentId,
          cvFilePath: filePath
        },
        update: {
          cvFilePath: filePath
        }
      });
    } else if (documentType === 'TRANSCRIPT') {
      await prisma.studentProfile.upsert({
        where: { studentId },
        create: {
          studentId,
          transcriptFilePath: filePath
        },
        update: {
          transcriptFilePath: filePath
        }
      });
    }

    // Trigger metrics recalculation
    await studentProfileService.recalculateMetrics(studentId);

    // Trigger matching recomputation
    await matchingQueueService.onDocumentUpload(studentId, documentType);

    console.log(`✅ Document ${documentId} parsed successfully`);

  } catch (error) {
    console.error(`❌ Error parsing document ${documentId}:`, error);
    
    // Update status to failed
    await prisma.studentDocument.update({
      where: { documentId },
      data: {
        parseStatus: 'FAILED',
        parseError: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

/**
 * Update student profile from CV data
 */
async function updateStudentFromCVData(studentId: string, extractedData: any) {
  if (!extractedData) return;

  try {
    // Update contact info if available
    if (extractedData.contact) {
      const updateData: any = {};
      if (extractedData.contact.phone) updateData.phone = extractedData.contact.phone;
      if (extractedData.contact.linkedin) updateData.linkedinUrl = extractedData.contact.linkedin;
      if (extractedData.contact.website) updateData.websiteUrl = extractedData.contact.website;

      if (Object.keys(updateData).length > 0) {
        await prisma.student.update({
          where: { studentId },
          data: updateData
        });
      }
    }

    // Add skills if available
    if (extractedData.skills && extractedData.skills.length > 0) {
      for (const skillName of extractedData.skills) {
        // Find or create skill
        let skill = await prisma.skill.findFirst({
          where: { name: { equals: skillName, mode: 'insensitive' } }
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillName,
              category: 'Technical' // Default category
            }
          });
        }

        // Add to student skills if not already present
        const existingSkill = await prisma.studentSkill.findUnique({
          where: {
            studentId_skillId: {
              studentId,
              skillId: skill.skillId
            }
          }
        });

        if (!existingSkill) {
          await prisma.studentSkill.create({
            data: {
              studentId,
              skillId: skill.skillId,
              proficiency: 3, // Default proficiency
              yearsOfExperience: 1 // Default experience
            }
          });
        }
      }
    }

    // Add experiences if available
    if (extractedData.experience && extractedData.experience.length > 0) {
      for (const exp of extractedData.experience) {
        await prisma.experience.create({
          data: {
            studentId,
            jobTitle: exp.position || 'Position',
            company: exp.company || 'Company',
            startDate: new Date(), // Would need better date parsing
            employmentType: 'FULL_TIME', // Default
            description: exp.description || ''
          }
        });
      }
    }

  } catch (error) {
    console.error('Error updating student from CV data:', error);
  }
}

/**
 * Update student profile from transcript data
 */
async function updateStudentFromTranscriptData(studentId: string, extractedData: any) {
  if (!extractedData) return;

  try {
    const profileUpdate: any = {};

    // Update GPA if available
    if (extractedData.gpa) {
      profileUpdate.gpa = extractedData.gpa;
    }

    // Update institution if available
    if (extractedData.institution) {
      // Find or create university
      let university = await prisma.university.findFirst({
        where: { name: { equals: extractedData.institution, mode: 'insensitive' } }
      });

      if (!university) {
        university = await prisma.university.create({
          data: { name: extractedData.institution }
        });
      }

      profileUpdate.universityId = university.universityId;
    }

    // Update degree if available
    if (extractedData.degree) {
      let degree = await prisma.degree.findFirst({
        where: { name: { equals: extractedData.degree, mode: 'insensitive' } }
      });

      if (!degree) {
        degree = await prisma.degree.create({
          data: {
            name: extractedData.degree,
            level: 'Bachelor' // Default
          }
        });
      }

      profileUpdate.degreeId = degree.degreeId;
    }

    // Update major if available
    if (extractedData.major) {
      let major = await prisma.major.findFirst({
        where: { name: { equals: extractedData.major, mode: 'insensitive' } }
      });

      if (!major) {
        major = await prisma.major.create({
          data: {
            name: extractedData.major,
            field: 'General' // Default
          }
        });
      }

      profileUpdate.majorId = major.majorId;
    }

    // Update student profile
    if (Object.keys(profileUpdate).length > 0) {
      await prisma.studentProfile.upsert({
        where: { studentId },
        create: {
          studentId,
          ...profileUpdate
        },
        update: profileUpdate
      });
    }

    // Add courses if available
    if (extractedData.courses && extractedData.courses.length > 0) {
      for (const courseData of extractedData.courses) {
        // Find or create course
        let course = await prisma.course.findFirst({
          where: { courseCode: courseData.courseCode }
        });

        if (!course) {
          course = await prisma.course.create({
            data: {
              courseCode: courseData.courseCode,
              courseName: courseData.courseName,
              credits: courseData.credits || 3
            }
          });
        }

        // Add to student courses
        const existingCourse = await prisma.studentCourse.findUnique({
          where: {
            studentId_courseId: {
              studentId,
              courseId: course.courseId
            }
          }
        });

        if (!existingCourse) {
          await prisma.studentCourse.create({
            data: {
              studentId,
              courseId: course.courseId,
              grade: courseData.grade || 'A',
              semester: courseData.semester || 'Fall',
              year: courseData.year || new Date().getFullYear()
            }
          });
        }
      }
    }

  } catch (error) {
    console.error('Error updating student from transcript data:', error);
  }
}

/**
 * Get student documents
 */
export const getStudentDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const student = await studentProfileService.getCompleteProfile(req.user.userId);

    const documents = await prisma.studentDocument.findMany({
      where: { studentId: student.studentId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        documentId: true,
        documentType: true,
        fileName: true,
        fileSize: true,
        parseStatus: true,
        parseError: true,
        uploadedAt: true,
        parsedAt: true
      }
    });

    res.json({
      success: true,
      data: {
        documents
      }
    });

  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get documents'
    });
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { documentId } = req.params;

    // Find document and verify ownership
    const document = await prisma.studentDocument.findUnique({
      where: { documentId },
      include: {
        student: {
          select: { userId: true }
        }
      }
    });

    if (!document || document.student.userId !== req.user.userId) {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Update student profile to remove file path references
    if (document.documentType === 'CV') {
      await prisma.studentProfile.updateMany({
        where: { studentId: document.studentId },
        data: { cvFilePath: null }
      });
    } else if (document.documentType === 'TRANSCRIPT') {
      await prisma.studentProfile.updateMany({
        where: { studentId: document.studentId },
        data: { transcriptFilePath: null }
      });
    }

    // Delete document record
    await prisma.studentDocument.delete({
      where: { documentId }
    });

    // Recalculate metrics
    await studentProfileService.recalculateMetrics(document.studentId);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

/**
 * Get document parse status
 */
export const getDocumentParseStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { documentId } = req.params;

    const document = await prisma.studentDocument.findUnique({
      where: { documentId },
      include: {
        student: {
          select: { userId: true }
        }
      }
    });

    if (!document || document.student.userId !== req.user.userId) {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        documentId: document.documentId,
        parseStatus: document.parseStatus,
        parseError: document.parseError,
        parsedAt: document.parsedAt
      }
    });

  } catch (error) {
    console.error('Get document parse status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parse status'
    });
  }
};