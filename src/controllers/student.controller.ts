import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../config/logger';
import { metricsService } from '../services/metrics.service';
import { matchService } from '../services/match.service';

const prisma = new PrismaClient();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateStudentProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  elevatorPitch: z.string().max(500).optional(),
});

const updateStudentExtendedProfileSchema = z.object({
  universityId: z.string().optional(),
  degreeId: z.string().optional(),
  majorId: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  graduationDate: z.string().datetime().optional(),
  availabilityStartDate: z.string().datetime().optional(),
  attachmentDuration: z.number().min(1).max(24).optional(),
  willingToRelocate: z.boolean().optional(),
  remoteAllowed: z.boolean().optional(),
});

const addStudentSkillSchema = z.object({
  skillId: z.string(),
  proficiency: z.number().min(1).max(5),
  yearsOfExperience: z.number().min(0).max(20).optional(),
  verified: z.boolean().default(false),
});

const addExperienceSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  role: z.string().optional(),
  employmentType: z.enum(['INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT', 'FREELANCE']),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(), // Array of skill IDs
});

const addProjectSchema = z.object({
  projectName: z.string(),
  description: z.string().optional(),
  projectType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  technologies: z.array(z.string()).optional(), // Array of skill IDs
});

const addStudentCourseSchema = z.object({
  courseId: z.string(),
  grade: z.string().optional(),
  semester: z.string().optional(),
  year: z.number().optional(),
});

const addStudentPreferenceSchema = z.object({
  preferenceId: z.string(),
  priority: z.number().min(1).max(5).default(1),
});

// ============================================================================
// STUDENT PROFILE MANAGEMENT
// ============================================================================

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify ownership or admin access
    if (req.user?.role !== 'ADMIN' && req.user?.userId !== id) {
      const student = await prisma.student.findUnique({
        where: { studentId: id },
        select: { userId: true },
      });
      
      if (!student || student.userId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const student = await prisma.student.findUnique({
      where: { studentId: id },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true,
          },
        },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            proficiency: 'desc',
          },
        },
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            year: 'desc',
          },
        },
        preferences: {
          include: {
            preference: true,
          },
          orderBy: {
            priority: 'asc',
          },
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
        applications: {
          include: {
            opportunity: {
              include: {
                company: true,
              },
            },
            interviews: true,
            placement: true,
          },
          orderBy: {
            appliedAt: 'desc',
          },
        },
        metrics: true,
        documents: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate profile completion percentage
    const completionScore = calculateProfileCompletion(student);

    res.json({
      student,
      profileCompletion: completionScore,
    });
  } catch (error) {
    logger.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStudentProfileSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedStudent = await prisma.student.update({
      where: { studentId: id },
      data: validatedData,
      include: {
        user: true,
        profile: true,
        metrics: true,
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ student: updatedStudent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating student profile:', error);
    res.status(500).json({ error: 'Failed to update student profile' });
  }
};

export const updateStudentExtendedProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStudentExtendedProfileSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert date strings to Date objects
    const profileData = {
      ...validatedData,
      ...(validatedData.graduationDate && {
        graduationDate: new Date(validatedData.graduationDate),
      }),
      ...(validatedData.availabilityStartDate && {
        availabilityStartDate: new Date(validatedData.availabilityStartDate),
      }),
    };

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { studentId: id },
      update: profileData,
      create: {
        studentId: id,
        ...profileData,
      },
      include: {
        university: true,
        degree: true,
        major: true,
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ profile: updatedProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating student extended profile:', error);
    res.status(500).json({ error: 'Failed to update extended profile' });
  }
};

// ============================================================================
// SKILLS MANAGEMENT
// ============================================================================

export const addStudentSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addStudentSkillSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: id,
          skillId: validatedData.skillId,
        },
      },
      update: {
        proficiency: validatedData.proficiency,
        yearsOfExperience: validatedData.yearsOfExperience,
        verified: validatedData.verified,
      },
      create: {
        studentId: id,
        ...validatedData,
      },
      include: {
        skill: true,
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ skill: studentSkill });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding student skill:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

export const removeStudentSkill = async (req: Request, res: Response) => {
  try {
    const { id, skillId } = req.params;

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.studentSkill.delete({
      where: {
        studentId_skillId: {
          studentId: id,
          skillId,
        },
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    logger.error('Error removing student skill:', error);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
};

// ============================================================================
// EXPERIENCE MANAGEMENT
// ============================================================================

export const addExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addExperienceSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { technologies, ...experienceData } = validatedData;

    const experience = await prisma.experience.create({
      data: {
        studentId: id,
        ...experienceData,
        startDate: new Date(experienceData.startDate),
        endDate: experienceData.endDate ? new Date(experienceData.endDate) : null,
        ...(technologies && {
          experienceTechnologies: {
            create: technologies.map(skillId => ({ skillId })),
          },
        }),
      },
      include: {
        experienceTechnologies: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.status(201).json({ experience });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding experience:', error);
    res.status(500).json({ error: 'Failed to add experience' });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const { id, experienceId } = req.params;
    const validatedData = addExperienceSchema.partial().parse(req.body);

    // Verify ownership
    const experience = await prisma.experience.findUnique({
      where: { experienceId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!experience || experience.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { technologies, ...experienceData } = validatedData;

    const updatedExperience = await prisma.experience.update({
      where: { experienceId },
      data: {
        ...experienceData,
        ...(experienceData.startDate && {
          startDate: new Date(experienceData.startDate),
        }),
        ...(experienceData.endDate && {
          endDate: new Date(experienceData.endDate),
        }),
      },
      include: {
        experienceTechnologies: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Update technologies if provided
    if (technologies) {
      await prisma.experienceTechnology.deleteMany({
        where: { experienceId },
      });

      await prisma.experienceTechnology.createMany({
        data: technologies.map(skillId => ({
          experienceId,
          skillId,
        })),
      });
    }

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ experience: updatedExperience });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const { id, experienceId } = req.params;

    // Verify ownership
    const experience = await prisma.experience.findUnique({
      where: { experienceId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!experience || experience.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.experience.delete({
      where: { experienceId },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    logger.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
};

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

export const addProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addProjectSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { technologies, ...projectData } = validatedData;

    const project = await prisma.project.create({
      data: {
        studentId: id,
        ...projectData,
        startDate: projectData.startDate ? new Date(projectData.startDate) : null,
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        ...(technologies && {
          projectTechnologies: {
            create: technologies.map(skillId => ({ skillId })),
          },
        }),
      },
      include: {
        projectTechnologies: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.status(201).json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id, projectId } = req.params;
    const validatedData = addProjectSchema.partial().parse(req.body);

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { projectId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!project || project.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { technologies, ...projectData } = validatedData;

    const updatedProject = await prisma.project.update({
      where: { projectId },
      data: {
        ...projectData,
        ...(projectData.startDate && {
          startDate: new Date(projectData.startDate),
        }),
        ...(projectData.endDate && {
          endDate: new Date(projectData.endDate),
        }),
      },
      include: {
        projectTechnologies: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Update technologies if provided
    if (technologies) {
      await prisma.projectTechnology.deleteMany({
        where: { projectId },
      });

      await prisma.projectTechnology.createMany({
        data: technologies.map(skillId => ({
          projectId,
          skillId,
        })),
      });
    }

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id, projectId } = req.params;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { projectId },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!project || project.student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.project.delete({
      where: { projectId },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// ============================================================================
// COURSES & PREFERENCES MANAGEMENT
// ============================================================================

export const addStudentCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addStudentCourseSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const studentCourse = await prisma.studentCourse.upsert({
      where: {
        studentId_courseId: {
          studentId: id,
          courseId: validatedData.courseId,
        },
      },
      update: {
        grade: validatedData.grade,
        semester: validatedData.semester,
        year: validatedData.year,
      },
      create: {
        studentId: id,
        ...validatedData,
      },
      include: {
        course: true,
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ course: studentCourse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding student course:', error);
    res.status(500).json({ error: 'Failed to add course' });
  }
};

export const addStudentPreference = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addStudentPreferenceSchema.parse(req.body);

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { studentId: id },
      select: { userId: true },
    });

    if (!student || student.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const studentPreference = await prisma.studentPreference.upsert({
      where: {
        studentId_preferenceId: {
          studentId: id,
          preferenceId: validatedData.preferenceId,
        },
      },
      update: {
        priority: validatedData.priority,
      },
      create: {
        studentId: id,
        ...validatedData,
      },
      include: {
        preference: true,
      },
    });

    // Trigger metrics recomputation
    await metricsService.recomputeStudentMetrics(id);

    res.json({ preference: studentPreference });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    logger.error('Error adding student preference:', error);
    res.status(500).json({ error: 'Failed to add preference' });
  }
};

// ============================================================================
// STUDENT OVERVIEW & DASHBOARD
// ============================================================================

export const getStudentOverview = async (req: Request, res: Response) => {
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

    const [
      studentData,
      applicationStats,
      upcomingInterviews,
      topMatches,
    ] = await Promise.all([
      prisma.student.findUnique({
        where: { studentId: id },
        include: {
          profile: {
            include: {
              university: true,
              degree: true,
              major: true,
            },
          },
          metrics: true,
        },
      }),

      // Application activity stats
      prisma.application.groupBy({
        by: ['status'],
        where: { studentId: id },
        _count: true,
      }),

      // Upcoming interviews
      prisma.interview.findMany({
        where: {
          application: {
            studentId: id,
          },
          status: 'SCHEDULED',
          scheduledDate: {
            gte: new Date(),
          },
        },
        include: {
          application: {
            include: {
              opportunity: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
        orderBy: {
          scheduledDate: 'asc',
        },
        take: 5,
      }),

      // Top opportunity matches
      matchService.getTopMatches(id, 5),
    ]);

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(studentData);

    res.json({
      candidateSnapshot: {
        name: `${studentData?.firstName} ${studentData?.lastName}`,
        profilePicture: studentData?.profilePicture,
        major: studentData?.profile?.major?.name,
        gpa: studentData?.profile?.gpa,
        elevatorPitch: studentData?.elevatorPitch,
        university: studentData?.profile?.university?.name,
      },
      hireabilityScore: {
        overall: studentData?.metrics?.hireabilityScore || 0,
        breakdown: {
          skillScore: studentData?.metrics?.skillScore || 0,
          academicScore: studentData?.metrics?.academicScore || 0,
          experienceScore: studentData?.metrics?.experienceScore || 0,
          preferenceScore: studentData?.metrics?.preferenceScore || 0,
        },
        lastComputed: studentData?.metrics?.lastComputed,
      },
      applicationActivity: {
        stats: applicationStats.reduce((acc, stat) => {
          acc[stat.status.toLowerCase()] = stat._count;
          return acc;
        }, {} as Record<string, number>),
      },
      upcomingInterviews,
      topMatches,
      profileCompletion,
    });
  } catch (error) {
    logger.error('Error fetching student overview:', error);
    res.status(500).json({ error: 'Failed to fetch student overview' });
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateProfileCompletion(student: any): number {
  if (!student) return 0;

  let score = 0;
  const maxScore = 100;

  // Basic info (20 points)
  if (student.firstName && student.lastName) score += 5;
  if (student.phone) score += 3;
  if (student.location) score += 3;
  if (student.elevatorPitch) score += 5;
  if (student.linkedinUrl) score += 2;
  if (student.profilePicture) score += 2;

  // Academic info (20 points)
  if (student.profile) {
    if (student.profile.universityId) score += 5;
    if (student.profile.degreeId) score += 5;
    if (student.profile.majorId) score += 5;
    if (student.profile.gpa) score += 5;
  }

  // Skills (20 points)
  const skillCount = student.skills?.length || 0;
  score += Math.min(skillCount * 2, 20);

  // Experience (20 points)
  const experienceCount = student.experiences?.length || 0;
  score += Math.min(experienceCount * 5, 20);

  // Projects (10 points)
  const projectCount = student.projects?.length || 0;
  score += Math.min(projectCount * 3, 10);

  // Preferences (10 points)
  const preferenceCount = student.preferences?.length || 0;
  score += Math.min(preferenceCount * 2, 10);

  return Math.min(score, maxScore);
}