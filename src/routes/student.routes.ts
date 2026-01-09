import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload } from '../controllers/upload.controller';
import {
  // Profile management
  getStudentProfile,
  updateStudentProfile,
  updateStudentExtendedProfile,
  getStudentOverview,

  // Skills management
  addStudentSkill,
  removeStudentSkill,

  // Experience management
  addExperience,
  updateExperience,
  deleteExperience,

  // Project management
  addProject,
  updateProject,
  deleteProject,

  // Courses & preferences
  addStudentCourse,
  addStudentPreference,
} from '../controllers/student.controller';

import {
  // Document upload
  uploadCV,
  uploadTranscript,
  uploadDocument,
  getStudentDocuments,
  deleteDocument,
  getDocumentParseStatus,
} from '../controllers/upload.controller';

import { matchService } from '../services/match.service';
import { metricsService } from '../services/metrics.service';

const router = Router();

// ============================================================================
// STUDENT PROFILE ROUTES
// ============================================================================

// Get student profile with all related data
router.get('/:id/profile', authenticateToken, getStudentProfile);

// Update basic student profile
router.put('/:id/profile', authenticateToken, updateStudentProfile);

// Update extended student profile (academic info, preferences, etc.)
router.put('/:id/profile/extended', authenticateToken, updateStudentExtendedProfile);

// Get student overview/dashboard data
router.get('/:id/overview', authenticateToken, getStudentOverview);

// ============================================================================
// SKILLS MANAGEMENT ROUTES
// ============================================================================

// Add or update a student skill
router.post('/:id/skills', authenticateToken, addStudentSkill);

// Remove a student skill
router.delete('/:id/skills/:skillId', authenticateToken, removeStudentSkill);

// ============================================================================
// EXPERIENCE MANAGEMENT ROUTES
// ============================================================================

// Add new work experience
router.post('/:id/experiences', authenticateToken, addExperience);

// Update existing work experience
router.put('/:id/experiences/:experienceId', authenticateToken, updateExperience);

// Delete work experience
router.delete('/:id/experiences/:experienceId', authenticateToken, deleteExperience);

// ============================================================================
// PROJECT MANAGEMENT ROUTES
// ============================================================================

// Add new project
router.post('/:id/projects', authenticateToken, addProject);

// Update existing project
router.put('/:id/projects/:projectId', authenticateToken, updateProject);

// Delete project
router.delete('/:id/projects/:projectId', authenticateToken, deleteProject);

// ============================================================================
// COURSES & PREFERENCES ROUTES
// ============================================================================

// Add student course
router.post('/:id/courses', authenticateToken, addStudentCourse);

// Add student preference
router.post('/:id/preferences', authenticateToken, addStudentPreference);

// ============================================================================
// DOCUMENT UPLOAD ROUTES
// ============================================================================

// Upload CV
router.post('/:id/upload/cv', authenticateToken, upload.single('cv'), uploadCV);

// Upload transcript
router.post('/:id/upload/transcript', authenticateToken, upload.single('transcript'), uploadTranscript);

// Upload general document
router.post('/:id/upload/document', authenticateToken, upload.single('document'), uploadDocument);

// Get all student documents
router.get('/:id/documents', authenticateToken, getStudentDocuments);

// Delete a document
router.delete('/:id/documents/:documentId', authenticateToken, deleteDocument);

// Get document parse status
router.get('/:id/documents/:documentId/status', authenticateToken, getDocumentParseStatus);

// ============================================================================
// OPPORTUNITY MATCHING ROUTES
// ============================================================================

// Get top opportunity matches for student
router.get('/:id/matches', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5, industry, location, jobType, minMatchScore } = req.query;

    // Verify ownership
    const student = await require('@prisma/client').PrismaClient().student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filters = {
      ...(industry && { industry: industry as string }),
      ...(location && { location: location as string }),
      ...(jobType && { jobType: jobType as string }),
      ...(minMatchScore && { minMatchScore: parseFloat(minMatchScore as string) }),
    };

    const matches = await matchService.getTopMatches(
      id, 
      parseInt(limit as string), 
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({ matches });
  } catch (error) {
    console.error('Error getting student matches:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Get detailed match insights for a specific opportunity
router.get('/:id/matches/:opportunityId/insights', authenticateToken, async (req, res) => {
  try {
    const { id, opportunityId } = req.params;

    // Verify ownership
    const student = await require('@prisma/client').PrismaClient().student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const insights = await matchService.getMatchInsights(id, opportunityId);
    res.json({ insights });
  } catch (error) {
    console.error('Error getting match insights:', error);
    res.status(500).json({ error: 'Failed to get match insights' });
  }
});

// ============================================================================
// METRICS & RECOMMENDATIONS ROUTES
// ============================================================================

// Trigger manual metrics recomputation
router.post('/:id/metrics/recompute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const student = await require('@prisma/client').PrismaClient().student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await metricsService.recomputeStudentMetrics(id);
    res.json({ message: 'Metrics recomputed successfully' });
  } catch (error) {
    console.error('Error recomputing metrics:', error);
    res.status(500).json({ error: 'Failed to recompute metrics' });
  }
});

// Get metrics recommendations for improvement
router.get('/:id/metrics/recommendations', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const student = await require('@prisma/client').PrismaClient().student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recommendations = await metricsService.getMetricsRecommendations(id);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// ============================================================================
// REFERENCE DATA ROUTES (for dropdowns, etc.)
// ============================================================================

// Get all available skills
router.get('/reference/skills', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    const prisma = new (require('@prisma/client').PrismaClient)();

    const where: any = {};
    if (category) where.category = category as string;
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50, // Limit results
    });

    res.json({ skills });
  } catch (error) {
    console.error('Error getting skills:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
});

// Get all universities
router.get('/reference/universities', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const prisma = new (require('@prisma/client').PrismaClient)();

    const where: any = {};
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const universities = await prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });

    res.json({ universities });
  } catch (error) {
    console.error('Error getting universities:', error);
    res.status(500).json({ error: 'Failed to get universities' });
  }
});

// Get all degrees
router.get('/reference/degrees', authenticateToken, async (req, res) => {
  try {
    const prisma = new (require('@prisma/client').PrismaClient)();

    const degrees = await prisma.degree.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({ degrees });
  } catch (error) {
    console.error('Error getting degrees:', error);
    res.status(500).json({ error: 'Failed to get degrees' });
  }
});

// Get all majors
router.get('/reference/majors', authenticateToken, async (req, res) => {
  try {
    const { field, search } = req.query;
    const prisma = new (require('@prisma/client').PrismaClient)();

    const where: any = {};
    if (field) where.field = field as string;
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive',
      };
    }

    const majors = await prisma.major.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });

    res.json({ majors });
  } catch (error) {
    console.error('Error getting majors:', error);
    res.status(500).json({ error: 'Failed to get majors' });
  }
});

// Get all courses
router.get('/reference/courses', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const prisma = new (require('@prisma/client').PrismaClient)();

    const where: any = {};
    if (search) {
      where.OR = [
        { courseCode: { contains: search as string, mode: 'insensitive' } },
        { courseName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { courseCode: 'asc' },
      take: 50,
    });

    res.json({ courses });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get all preferences
router.get('/reference/preferences', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const prisma = new (require('@prisma/client').PrismaClient)();

    const where: any = {};
    if (type) where.type = type as string;

    const preferences = await prisma.preference.findMany({
      where,
      orderBy: [{ type: 'asc' }, { value: 'asc' }],
    });

    res.json({ preferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

export default router;