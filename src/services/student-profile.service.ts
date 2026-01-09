/**
 * Student Profile Service
 * Core business logic for student profile management and metrics calculation
 */

import { PrismaClient } from '@prisma/client';
import { StudentMetricsData, ProfileUpdateData } from '../types/student.types';
import { matchingQueueService } from './matching-queue.service';

const prisma = new PrismaClient();

export class StudentProfileService {
  /**
   * Get complete student profile with all related data
   */
  async getCompleteProfile(userId: string) {
    // First find the student by userId
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true
          }
        },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true
          }
        },
        skills: {
          include: {
            skill: true
          },
          orderBy: {
            proficiency: 'desc'
          }
        },
        courses: {
          include: {
            course: true
          },
          orderBy: {
            year: 'desc'
          }
        },
        preferences: {
          include: {
            preference: true
          },
          orderBy: {
            priority: 'desc'
          }
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        metrics: true,
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  /**
   * Update student basic profile information
   */
  async updateBasicProfile(studentId: string, data: ProfileUpdateData) {
    const { basicInfo, academicInfo } = data;

    return await prisma.$transaction(async (tx) => {
      // Update basic student info
      if (basicInfo) {
        await tx.student.update({
          where: { studentId },
          data: {
            firstName: basicInfo.firstName,
            lastName: basicInfo.lastName,
            phone: basicInfo.phone,
            location: basicInfo.location,
            linkedinUrl: basicInfo.linkedinUrl,
            websiteUrl: basicInfo.websiteUrl,
            elevatorPitch: basicInfo.elevatorPitch
          }
        });
      }

      // Update or create academic profile
      if (academicInfo) {
        await tx.studentProfile.upsert({
          where: { studentId },
          create: {
            studentId,
            ...academicInfo
          },
          update: academicInfo
        });
      }

      // Trigger metrics recalculation
      await this.recalculateMetrics(studentId);

      // Trigger matching recomputation
      await matchingQueueService.onStudentProfileUpdate(studentId, 'Profile updated');

      // Get the student by studentId to return updated profile
      const updatedStudent = await tx.student.findUnique({
        where: { studentId },
        include: {
          user: {
            select: {
              email: true,
              status: true,
              createdAt: true
            }
          },
          profile: {
            include: {
              university: true,
              degree: true,
              major: true
            }
          },
          skills: {
            include: {
              skill: true
            },
            orderBy: {
              proficiency: 'desc'
            }
          },
          courses: {
            include: {
              course: true
            },
            orderBy: {
              year: 'desc'
            }
          },
          preferences: {
            include: {
              preference: true
            },
            orderBy: {
              priority: 'desc'
            }
          },
          experiences: {
            include: {
              experienceTechnologies: {
                include: {
                  skill: true
                }
              }
            },
            orderBy: {
              startDate: 'desc'
            }
          },
          projects: {
            include: {
              projectTechnologies: {
                include: {
                  skill: true
                }
              }
            },
            orderBy: {
              startDate: 'desc'
            }
          },
          metrics: true,
          documents: {
            orderBy: {
              uploadedAt: 'desc'
            }
          }
        }
      });

      return updatedStudent;
    });
  }

  /**
   * Add or update student skills
   */
  async updateSkills(studentId: string, skills: Array<{
    skillId: string;
    proficiency: number;
    yearsOfExperience?: number;
  }>) {
    return await prisma.$transaction(async (tx) => {
      // Remove existing skills
      await tx.studentSkill.deleteMany({
        where: { studentId }
      });

      // Add new skills
      if (skills.length > 0) {
        await tx.studentSkill.createMany({
          data: skills.map(skill => ({
            studentId,
            ...skill
          }))
        });
      }

      // Trigger metrics recalculation
      await this.recalculateMetrics(studentId);

      // Trigger matching recomputation
      await matchingQueueService.onSkillsUpdate(studentId);

      return await this.getStudentSkills(studentId);
    });
  }

  /**
   * Add or update student preferences
   */
  async updatePreferences(studentId: string, preferences: Array<{
    preferenceId: string;
    priority: number;
  }>) {
    return await prisma.$transaction(async (tx) => {
      // Remove existing preferences
      await tx.studentPreference.deleteMany({
        where: { studentId }
      });

      // Add new preferences
      if (preferences.length > 0) {
        await tx.studentPreference.createMany({
          data: preferences.map(pref => ({
            studentId,
            ...pref
          }))
        });
      }

      // Trigger metrics recalculation
      await this.recalculateMetrics(studentId);

      return await this.getStudentPreferences(studentId);
    });
  }

  /**
   * Add work experience
   */
  async addExperience(studentId: string, experienceData: {
    jobTitle: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    role?: string;
    employmentType: string;
    description?: string;
    technologies: string[]; // skill IDs
  }) {
    return await prisma.$transaction(async (tx) => {
      const experience = await tx.experience.create({
        data: {
          studentId,
          jobTitle: experienceData.jobTitle,
          company: experienceData.company,
          startDate: experienceData.startDate,
          endDate: experienceData.endDate,
          role: experienceData.role,
          employmentType: experienceData.employmentType as any,
          description: experienceData.description
        }
      });

      // Add technologies used in this experience
      if (experienceData.technologies.length > 0) {
        await tx.experienceTechnology.createMany({
          data: experienceData.technologies.map(skillId => ({
            experienceId: experience.experienceId,
            skillId
          }))
        });
      }

      // Trigger metrics recalculation
      await this.recalculateMetrics(studentId);

      // Trigger matching recomputation
      await matchingQueueService.onExperienceUpdate(studentId);

      return experience;
    });
  }

  /**
   * Add project
   */
  async addProject(studentId: string, projectData: {
    projectName: string;
    description?: string;
    projectType?: string;
    startDate?: Date;
    endDate?: Date;
    githubUrl?: string;
    liveUrl?: string;
    technologies: string[]; // skill IDs
  }) {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          studentId,
          projectName: projectData.projectName,
          description: projectData.description,
          projectType: projectData.projectType,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          githubUrl: projectData.githubUrl,
          liveUrl: projectData.liveUrl
        }
      });

      // Add technologies used in this project
      if (projectData.technologies.length > 0) {
        await tx.projectTechnology.createMany({
          data: projectData.technologies.map(skillId => ({
            projectId: project.projectId,
            skillId
          }))
        });
      }

      // Trigger metrics recalculation
      await this.recalculateMetrics(studentId);

      // Trigger matching recomputation
      await matchingQueueService.onExperienceUpdate(studentId);

      return project;
    });
  }

  /**
   * Calculate and update student metrics
   */
  async recalculateMetrics(studentId: string): Promise<StudentMetricsData> {
    // Get student data by studentId instead of userId
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true
          }
        },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true
          }
        },
        skills: {
          include: {
            skill: true
          },
          orderBy: {
            proficiency: 'desc'
          }
        },
        courses: {
          include: {
            course: true
          },
          orderBy: {
            year: 'desc'
          }
        },
        preferences: {
          include: {
            preference: true
          },
          orderBy: {
            priority: 'desc'
          }
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        metrics: true,
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate individual scores
    const skillScore = this.calculateSkillScore(student);
    const academicScore = this.calculateAcademicScore(student);
    const experienceScore = this.calculateExperienceScore(student);
    const preferenceScore = this.calculatePreferenceScore(student);
    
    // Calculate overall hireability score (weighted average)
    const hireabilityScore = this.calculateHireabilityScore({
      skillScore,
      academicScore,
      experienceScore,
      preferenceScore
    });

    // Update or create metrics
    const metrics = await prisma.studentMetrics.upsert({
      where: { studentId },
      create: {
        studentId,
        skillScore,
        academicScore,
        experienceScore,
        preferenceScore,
        hireabilityScore,
        computeVersion: '1.0',
        metadata: {
          calculatedAt: new Date().toISOString(),
          skillsCount: student.skills.length,
          experiencesCount: student.experiences.length,
          projectsCount: student.projects.length
        }
      },
      update: {
        skillScore,
        academicScore,
        experienceScore,
        preferenceScore,
        hireabilityScore,
        lastComputed: new Date(),
        metadata: {
          calculatedAt: new Date().toISOString(),
          skillsCount: student.skills.length,
          experiencesCount: student.experiences.length,
          projectsCount: student.projects.length
        }
      }
    });

    return metrics;
  }

  /**
   * Calculate skill score based on skills and proficiency levels
   */
  private calculateSkillScore(student: any): number {
    if (!student.skills || student.skills.length === 0) return 0;

    const totalSkillPoints = student.skills.reduce((sum: number, studentSkill: any) => {
      const proficiencyWeight = studentSkill.proficiency / 5; // Normalize to 0-1
      const experienceBonus = studentSkill.yearsOfExperience ? Math.min(studentSkill.yearsOfExperience / 5, 1) : 0;
      return sum + (proficiencyWeight + experienceBonus * 0.5);
    }, 0);

    // Normalize to 0-100 scale
    const maxPossibleScore = student.skills.length * 1.5; // Max proficiency + experience bonus
    return Math.min((totalSkillPoints / maxPossibleScore) * 100, 100);
  }

  /**
   * Calculate academic score based on GPA and courses
   */
  private calculateAcademicScore(student: any): number {
    let score = 0;

    // GPA component (60% of academic score)
    if (student.profile?.gpa) {
      const gpaScore = (student.profile.gpa / 4.0) * 60; // Assuming 4.0 scale
      score += gpaScore;
    }

    // Course completion component (40% of academic score)
    if (student.courses && student.courses.length > 0) {
      const courseScore = Math.min(student.courses.length / 20, 1) * 40; // Max 20 courses for full score
      score += courseScore;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate experience score based on work history and projects
   */
  private calculateExperienceScore(student: any): number {
    let score = 0;

    // Work experience component (70% of experience score)
    if (student.experiences && student.experiences.length > 0) {
      const totalMonths = student.experiences.reduce((sum: number, exp: any) => {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return sum + months;
      }, 0);

      const experienceScore = Math.min(totalMonths / 24, 1) * 70; // Max 2 years for full score
      score += experienceScore;
    }

    // Project component (30% of experience score)
    if (student.projects && student.projects.length > 0) {
      const projectScore = Math.min(student.projects.length / 5, 1) * 30; // Max 5 projects for full score
      score += projectScore;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate preference score based on career preferences completeness
   */
  private calculatePreferenceScore(student: any): number {
    if (!student.preferences || student.preferences.length === 0) return 0;

    // Score based on number and priority of preferences
    const preferenceScore = student.preferences.reduce((sum: number, pref: any) => {
      return sum + (pref.priority / 5); // Normalize priority to 0-1
    }, 0);

    // Normalize to 0-100 scale
    const maxScore = student.preferences.length;
    return Math.min((preferenceScore / maxScore) * 100, 100);
  }

  /**
   * Calculate overall hireability score (weighted composite)
   */
  private calculateHireabilityScore(scores: {
    skillScore: number;
    academicScore: number;
    experienceScore: number;
    preferenceScore: number;
  }): number {
    // Weighted average: Skills 40%, Academic 25%, Experience 25%, Preferences 10%
    return (
      scores.skillScore * 0.4 +
      scores.academicScore * 0.25 +
      scores.experienceScore * 0.25 +
      scores.preferenceScore * 0.1
    );
  }

  /**
   * Get student skills with details
   */
  async getStudentSkills(studentId: string) {
    return await prisma.studentSkill.findMany({
      where: { studentId },
      include: {
        skill: true
      },
      orderBy: {
        proficiency: 'desc'
      }
    });
  }

  /**
   * Get student preferences with details
   */
  async getStudentPreferences(studentId: string) {
    return await prisma.studentPreference.findMany({
      where: { studentId },
      include: {
        preference: true
      },
      orderBy: {
        priority: 'desc'
      }
    });
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(studentId: string): Promise<{
    percentage: number;
    missingFields: string[];
    completedSections: string[];
  }> {
    // Get student data by studentId instead of calling getCompleteProfile with userId
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            createdAt: true
          }
        },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true
          }
        },
        skills: {
          include: {
            skill: true
          },
          orderBy: {
            proficiency: 'desc'
          }
        },
        courses: {
          include: {
            course: true
          },
          orderBy: {
            year: 'desc'
          }
        },
        preferences: {
          include: {
            preference: true
          },
          orderBy: {
            priority: 'desc'
          }
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        projects: {
          include: {
            projectTechnologies: {
              include: {
                skill: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        metrics: true,
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const sections = {
      basicInfo: !!(student.firstName && student.lastName && student.phone && student.location),
      academicInfo: !!(student.profile?.gpa && student.profile?.universityId && student.profile?.degreeId),
      skills: student.skills.length >= 3,
      experience: student.experiences.length >= 1,
      projects: student.projects.length >= 1,
      preferences: student.preferences.length >= 3,
      documents: student.documents.some(doc => doc.documentType === 'CV')
    };

    const completedSections = Object.entries(sections)
      .filter(([_, completed]) => completed)
      .map(([section, _]) => section);

    const missingFields = Object.entries(sections)
      .filter(([_, completed]) => !completed)
      .map(([section, _]) => section);

    const percentage = (completedSections.length / Object.keys(sections).length) * 100;

    return {
      percentage: Math.round(percentage),
      missingFields,
      completedSections
    };
  }
}

export const studentProfileService = new StudentProfileService();