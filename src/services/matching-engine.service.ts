/**
 * AI-Powered Matching Engine Service
 * Core logic for evaluating student profiles against company requirements
 */

import { PrismaClient } from '@prisma/client';
import { studentProfileService } from './student-profile.service';

const prisma = new PrismaClient();

export interface MatchingWeights {
  skillWeight: number;
  academicWeight: number;
  experienceWeight: number;
  preferenceWeight: number;
}

export interface MatchScoreBreakdown {
  totalScore: number;
  skillScore: number;
  academicScore: number;
  experienceScore: number;
  preferenceScore: number;
  breakdown: {
    skillDetails: any;
    academicDetails: any;
    experienceDetails: any;
    preferenceDetails: any;
  };
}

export interface StudentMatch {
  studentId: string;
  student: any;
  matchScore: MatchScoreBreakdown;
  rank: number;
}

export interface OpportunityMatch {
  opportunityId: string;
  opportunity: any;
  matchScore: MatchScoreBreakdown;
  rank: number;
}

export class MatchingEngineService {
  private defaultWeights: MatchingWeights = {
    skillWeight: 0.4,      // 40% - Most important for technical roles
    academicWeight: 0.25,  // 25% - Academic performance
    experienceWeight: 0.25, // 25% - Work experience and projects
    preferenceWeight: 0.1   // 10% - Location and job type preferences
  };

  /**
   * Get ranked list of students for an opportunity
   */
  async getStudentsForOpportunity(
    opportunityId: string, 
    limit: number = 50,
    forceRecompute: boolean = false
  ): Promise<StudentMatch[]> {
    const startTime = Date.now();

    try {
      // Get opportunity details
      const opportunity = await prisma.opportunity.findUnique({
        where: { opportunityId },
        include: {
          company: true,
          opportunitySkills: {
            include: { skill: true }
          }
        }
      });

      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      // Get existing match scores or compute new ones
      let matchScores;
      if (forceRecompute) {
        matchScores = await this.recomputeMatchesForOpportunity(opportunityId);
      } else {
        matchScores = await prisma.matchScore.findMany({
          where: { opportunityId },
          include: {
            student: {
              include: {
                user: { select: { email: true } },
                profile: {
                  include: {
                    university: true,
                    degree: true,
                    major: true
                  }
                },
                skills: {
                  include: { skill: true }
                },
                experiences: {
                  include: {
                    experienceTechnologies: {
                      include: { skill: true }
                    }
                  }
                },
                projects: {
                  include: {
                    projectTechnologies: {
                      include: { skill: true }
                    }
                  }
                },
                preferences: {
                  include: { preference: true }
                },
                metrics: true
              }
            }
          },
          orderBy: { totalScore: 'desc' },
          take: limit
        });

        // If no scores exist, compute them
        if (matchScores.length === 0) {
          matchScores = await this.recomputeMatchesForOpportunity(opportunityId);
        }
      }

      // Transform to StudentMatch format
      const studentMatches: StudentMatch[] = matchScores.map((score, index) => ({
        studentId: score.studentId,
        student: score.student,
        matchScore: {
          totalScore: score.totalScore,
          skillScore: score.skillScore,
          academicScore: score.academicScore,
          experienceScore: score.experienceScore,
          preferenceScore: score.preferenceScore,
          breakdown: score.metadata as any || {}
        },
        rank: index + 1
      }));

      // Log the operation
      await this.logAIRun('OPPORTUNITY_UPDATE', matchScores.length, studentMatches.length, Date.now() - startTime);

      return studentMatches;

    } catch (error) {
      await this.logAIRun('OPPORTUNITY_UPDATE', 0, 0, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Get top matching opportunities for a student
   */
  async getOpportunitiesForStudent(
    studentId: string, 
    limit: number = 20,
    forceRecompute: boolean = false
  ): Promise<OpportunityMatch[]> {
    const startTime = Date.now();

    try {
      // Get student details
      const student = await studentProfileService.getCompleteProfile(
        (await prisma.student.findUnique({ 
          where: { studentId }, 
          include: { user: true } 
        }))?.user.userId || ''
      );

      if (!student) {
        throw new Error('Student not found');
      }

      // Get existing match scores or compute new ones
      let matchScores;
      if (forceRecompute) {
        matchScores = await this.recomputeMatchesForStudent(studentId);
      } else {
        matchScores = await prisma.matchScore.findMany({
          where: { studentId },
          include: {
            opportunity: {
              include: {
                company: true,
                opportunitySkills: {
                  include: { skill: true }
                }
              }
            }
          },
          orderBy: { totalScore: 'desc' },
          take: limit
        });

        // If no scores exist, compute them
        if (matchScores.length === 0) {
          matchScores = await this.recomputeMatchesForStudent(studentId);
        }
      }

      // Transform to OpportunityMatch format
      const opportunityMatches: OpportunityMatch[] = matchScores.map((score, index) => ({
        opportunityId: score.opportunityId,
        opportunity: score.opportunity,
        matchScore: {
          totalScore: score.totalScore,
          skillScore: score.skillScore,
          academicScore: score.academicScore,
          experienceScore: score.experienceScore,
          preferenceScore: score.preferenceScore,
          breakdown: score.metadata as any || {}
        },
        rank: index + 1
      }));

      // Log the operation
      await this.logAIRun('STUDENT_UPDATE', matchScores.length, opportunityMatches.length, Date.now() - startTime);

      return opportunityMatches;

    } catch (error) {
      await this.logAIRun('STUDENT_UPDATE', 0, 0, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Recompute matches for a specific opportunity
   */
  async recomputeMatchesForOpportunity(opportunityId: string) {
    // Get all active students
    const students = await prisma.student.findMany({
      where: {
        user: { status: 'ACTIVE' }
      },
      include: {
        user: { select: { email: true } },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true
          }
        },
        skills: {
          include: { skill: true }
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: { skill: true }
            }
          }
        },
        projects: {
          include: {
            projectTechnologies: {
              include: { skill: true }
            }
          }
        },
        preferences: {
          include: { preference: true }
        },
        metrics: true
      }
    });

    // Get opportunity details
    const opportunity = await prisma.opportunity.findUnique({
      where: { opportunityId },
      include: {
        company: true,
        opportunitySkills: {
          include: { skill: true }
        }
      }
    });

    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Compute scores for each student
    const matchScores = [];
    for (const student of students) {
      const score = await this.computeMatchScore(student, opportunity);
      matchScores.push(score);
    }

    // Sort by total score
    matchScores.sort((a, b) => b.totalScore - a.totalScore);

    // Save to database
    await prisma.$transaction(async (tx) => {
      // Delete existing scores for this opportunity
      await tx.matchScore.deleteMany({
        where: { opportunityId }
      });

      // Insert new scores
      await tx.matchScore.createMany({
        data: matchScores.map(score => ({
          studentId: score.studentId,
          opportunityId,
          totalScore: score.totalScore,
          skillScore: score.skillScore,
          academicScore: score.academicScore,
          experienceScore: score.experienceScore,
          preferenceScore: score.preferenceScore,
          status: 'COMPUTED',
          metadata: score.breakdown
        }))
      });
    });

    // Return the computed scores with student data
    return await prisma.matchScore.findMany({
      where: { opportunityId },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
            profile: {
              include: {
                university: true,
                degree: true,
                major: true
              }
            },
            skills: {
              include: { skill: true }
            },
            experiences: {
              include: {
                experienceTechnologies: {
                  include: { skill: true }
                }
              }
            },
            projects: {
              include: {
                projectTechnologies: {
                  include: { skill: true }
                }
              }
            },
            preferences: {
              include: { preference: true }
            },
            metrics: true
          }
        }
      },
      orderBy: { totalScore: 'desc' }
    });
  }

  /**
   * Recompute matches for a specific student
   */
  async recomputeMatchesForStudent(studentId: string) {
    // Get student details
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: {
        user: { select: { email: true } },
        profile: {
          include: {
            university: true,
            degree: true,
            major: true
          }
        },
        skills: {
          include: { skill: true }
        },
        experiences: {
          include: {
            experienceTechnologies: {
              include: { skill: true }
            }
          }
        },
        projects: {
          include: {
            projectTechnologies: {
              include: { skill: true }
            }
          }
        },
        preferences: {
          include: { preference: true }
        },
        metrics: true
      }
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get all active opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      include: {
        company: true,
        opportunitySkills: {
          include: { skill: true }
        }
      }
    });

    // Compute scores for each opportunity
    const matchScores = [];
    for (const opportunity of opportunities) {
      const score = await this.computeMatchScore(student, opportunity);
      matchScores.push({
        ...score,
        opportunityId: opportunity.opportunityId
      });
    }

    // Sort by total score
    matchScores.sort((a, b) => b.totalScore - a.totalScore);

    // Save to database
    await prisma.$transaction(async (tx) => {
      // Delete existing scores for this student
      await tx.matchScore.deleteMany({
        where: { studentId }
      });

      // Insert new scores
      await tx.matchScore.createMany({
        data: matchScores.map(score => ({
          studentId,
          opportunityId: score.opportunityId,
          totalScore: score.totalScore,
          skillScore: score.skillScore,
          academicScore: score.academicScore,
          experienceScore: score.experienceScore,
          preferenceScore: score.preferenceScore,
          status: 'COMPUTED',
          metadata: score.breakdown
        }))
      });
    });

    // Return the computed scores with opportunity data
    return await prisma.matchScore.findMany({
      where: { studentId },
      include: {
        opportunity: {
          include: {
            company: true,
            opportunitySkills: {
              include: { skill: true }
            }
          }
        }
      },
      orderBy: { totalScore: 'desc' }
    });
  }

  /**
   * Core matching algorithm - compute match score between student and opportunity
   */
  private async computeMatchScore(student: any, opportunity: any): Promise<MatchScoreBreakdown & { studentId: string }> {
    const weights = await this.getMatchingWeights(opportunity.opportunityId);

    // Calculate individual scores
    const skillScore = this.calculateSkillMatch(student, opportunity);
    const academicScore = this.calculateAcademicFit(student, opportunity);
    const experienceScore = this.calculateExperienceMatch(student, opportunity);
    const preferenceScore = this.calculatePreferenceFit(student, opportunity);

    // Calculate weighted total score
    const totalScore = (
      skillScore.score * weights.skillWeight +
      academicScore.score * weights.academicWeight +
      experienceScore.score * weights.experienceWeight +
      preferenceScore.score * weights.preferenceWeight
    );

    return {
      studentId: student.studentId,
      totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
      skillScore: Math.round(skillScore.score * 100) / 100,
      academicScore: Math.round(academicScore.score * 100) / 100,
      experienceScore: Math.round(experienceScore.score * 100) / 100,
      preferenceScore: Math.round(preferenceScore.score * 100) / 100,
      breakdown: {
        skillDetails: skillScore.details,
        academicDetails: academicScore.details,
        experienceDetails: experienceScore.details,
        preferenceDetails: preferenceScore.details
      }
    };
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillMatch(student: any, opportunity: any): { score: number; details: any } {
    if (!opportunity.opportunitySkills || opportunity.opportunitySkills.length === 0) {
      return { score: 0.5, details: { reason: 'No required skills specified' } };
    }

    const requiredSkills = opportunity.opportunitySkills;
    const studentSkills = student.skills || [];
    const studentSkillMap = new Map<string, { proficiency: number; experience: number }>(
      studentSkills.map((s: any) => [s.skillId, { proficiency: s.proficiency, experience: s.yearsOfExperience }])
    );

    let totalWeight = 0;
    let matchedWeight = 0;
    const skillMatches: any[] = [];

    for (const reqSkill of requiredSkills) {
      const weight = reqSkill.skillWeight || 1;
      totalWeight += weight;

      if (studentSkillMap.has(reqSkill.skillId)) {
        const studentSkill = studentSkillMap.get(reqSkill.skillId)!;
        const proficiencyScore = studentSkill.proficiency / 5; // Normalize to 0-1
        const experienceBonus = Math.min((studentSkill.experience || 0) / 5, 0.2); // Max 20% bonus
        const skillScore = Math.min(proficiencyScore + experienceBonus, 1);
        
        matchedWeight += skillScore * weight;
        skillMatches.push({
          skill: reqSkill.skill.name,
          required: reqSkill.required,
          weight: weight,
          studentProficiency: studentSkill.proficiency,
          studentExperience: studentSkill.experience,
          score: skillScore
        });
      } else if (reqSkill.required) {
        // Missing required skill is a significant penalty
        skillMatches.push({
          skill: reqSkill.skill.name,
          required: true,
          weight: weight,
          studentProficiency: 0,
          studentExperience: 0,
          score: 0,
          missing: true
        });
      }
    }

    const finalScore = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return {
      score: finalScore,
      details: {
        totalRequiredSkills: requiredSkills.length,
        matchedSkills: skillMatches.filter(s => !s.missing).length,
        missingRequiredSkills: skillMatches.filter(s => s.missing && s.required).length,
        skillMatches
      }
    };
  }

  /**
   * Calculate academic fit score
   */
  private calculateAcademicFit(student: any, opportunity: any): { score: number; details: any } {
    let score = 0.5; // Base score
    const details: any = {};

    // GPA consideration
    if (student.profile?.gpa && opportunity.gpaThreshold) {
      if (student.profile.gpa >= opportunity.gpaThreshold) {
        // Exceeds threshold - scale based on how much higher
        const excess = student.profile.gpa - opportunity.gpaThreshold;
        score = Math.min(0.7 + (excess / 4.0) * 0.3, 1.0); // 70% base + up to 30% bonus
      } else {
        // Below threshold - penalty based on gap
        const gap = opportunity.gpaThreshold - student.profile.gpa;
        score = Math.max(0.2, 0.7 - (gap / 4.0) * 0.5); // Penalty but minimum 20%
      }
      details.gpaComparison = {
        studentGpa: student.profile.gpa,
        requiredGpa: opportunity.gpaThreshold,
        meetsRequirement: student.profile.gpa >= opportunity.gpaThreshold
      };
    } else if (student.profile?.gpa) {
      // No threshold specified, score based on GPA quality
      score = Math.min(student.profile.gpa / 4.0, 1.0);
      details.gpaScore = student.profile.gpa;
    }

    // University prestige (simplified - could be enhanced with rankings)
    if (student.profile?.university) {
      details.university = student.profile.university.name;
    }

    // Degree relevance
    if (student.profile?.major && opportunity.isTechnical) {
      const technicalMajors = ['computer science', 'software engineering', 'information systems', 'computer engineering'];
      const majorName = student.profile.major.name.toLowerCase();
      const isTechnicalMajor = technicalMajors.some(tm => majorName.includes(tm));
      
      if (isTechnicalMajor) {
        score = Math.min(score + 0.1, 1.0); // 10% bonus for relevant major
      }
      
      details.majorRelevance = {
        major: student.profile.major.name,
        isTechnicalRole: opportunity.isTechnical,
        isRelevantMajor: isTechnicalMajor
      };
    }

    return { score, details };
  }

  /**
   * Calculate experience match score
   */
  private calculateExperienceMatch(student: any, opportunity: any): { score: number; details: any } {
    const experiences = student.experiences || [];
    const projects = student.projects || [];
    
    let experienceScore = 0;
    let projectScore = 0;

    // Work experience scoring
    if (experiences.length > 0) {
      const totalMonths = experiences.reduce((sum: number, exp: any) => {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return sum + months;
      }, 0);

      // Score based on total experience (diminishing returns)
      experienceScore = Math.min(totalMonths / 24, 1.0); // Max score at 2 years

      // Bonus for relevant experience
      const relevantExperiences = experiences.filter((exp: any) => {
        return exp.employmentType === opportunity.jobTypes[0] || 
               exp.jobTitle.toLowerCase().includes(opportunity.title.toLowerCase().split(' ')[0]);
      });

      if (relevantExperiences.length > 0) {
        experienceScore = Math.min(experienceScore + 0.2, 1.0); // 20% bonus
      }
    }

    // Project scoring
    if (projects.length > 0) {
      projectScore = Math.min(projects.length / 3, 1.0); // Max score at 3 projects

      // Bonus for projects with relevant technologies
      const opportunitySkillIds = opportunity.opportunitySkills?.map((os: any) => os.skillId) || [];
      const relevantProjects = projects.filter((proj: any) => {
        const projectSkillIds = proj.projectTechnologies?.map((pt: any) => pt.skillId) || [];
        return projectSkillIds.some((skillId: string) => opportunitySkillIds.includes(skillId));
      });

      if (relevantProjects.length > 0) {
        projectScore = Math.min(projectScore + 0.3, 1.0); // 30% bonus
      }
    }

    // Combined score (70% experience, 30% projects)
    const finalScore = experienceScore * 0.7 + projectScore * 0.3;

    return {
      score: finalScore,
      details: {
        workExperience: {
          count: experiences.length,
          totalMonths: experiences.reduce((sum: number, exp: any) => {
            const start = new Date(exp.startDate);
            const end = exp.endDate ? new Date(exp.endDate) : new Date();
            return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
          }, 0),
          score: experienceScore
        },
        projects: {
          count: projects.length,
          score: projectScore
        },
        combinedScore: finalScore
      }
    };
  }

  /**
   * Calculate preference fit score
   */
  private calculatePreferenceFit(student: any, opportunity: any): { score: number; details: any } {
    const preferences = student.preferences || [];
    let score = 0.7; // Default neutral score
    const details: any = {};

    // Location preference
    const locationPrefs = preferences.filter((p: any) => p.preference.type === 'LOCATION');
    if (locationPrefs.length > 0 && opportunity.location) {
      const matchingLocation = locationPrefs.find((p: any) => 
        opportunity.location.toLowerCase().includes(p.preference.value.toLowerCase()) ||
        p.preference.value.toLowerCase() === 'remote'
      );
      
      if (matchingLocation) {
        score = Math.min(score + 0.2, 1.0); // 20% bonus for location match
        details.locationMatch = true;
      } else {
        score = Math.max(score - 0.3, 0.2); // 30% penalty for location mismatch
        details.locationMatch = false;
      }
    }

    // Job type preference
    const jobTypePrefs = preferences.filter((p: any) => p.preference.type === 'JOB_TYPE');
    if (jobTypePrefs.length > 0 && opportunity.jobTypes.length > 0) {
      const matchingJobType = jobTypePrefs.find((p: any) => 
        opportunity.jobTypes.some((jt: string) => 
          jt.toLowerCase().includes(p.preference.value.toLowerCase())
        )
      );
      
      if (matchingJobType) {
        score = Math.min(score + 0.1, 1.0); // 10% bonus for job type match
        details.jobTypeMatch = true;
      }
    }

    // Industry preference
    const industryPrefs = preferences.filter((p: any) => p.preference.type === 'INDUSTRY');
    if (industryPrefs.length > 0 && opportunity.industry) {
      const matchingIndustry = industryPrefs.find((p: any) => 
        opportunity.industry.toLowerCase().includes(p.preference.value.toLowerCase())
      );
      
      if (matchingIndustry) {
        score = Math.min(score + 0.1, 1.0); // 10% bonus for industry match
        details.industryMatch = true;
      }
    }

    return { score, details };
  }

  /**
   * Get matching weights for an opportunity (or use defaults)
   */
  private async getMatchingWeights(opportunityId: string): Promise<MatchingWeights> {
    // For now, return default weights
    // In the future, this could be customized per opportunity or company
    return this.defaultWeights;
  }

  /**
   * Add recomputation task to queue
   */
  async queueRecomputation(
    studentId?: string, 
    opportunityId?: string, 
    reason?: string,
    priority: number = 0
  ) {
    await prisma.recomputationQueue.create({
      data: {
        studentId,
        opportunityId,
        triggerReason: reason,
        priority,
        status: 'PENDING'
      }
    });
  }

  /**
   * Process recomputation queue
   */
  async processRecomputationQueue(batchSize: number = 10) {
    const startTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    try {
      // Get pending tasks
      const tasks = await prisma.recomputationQueue.findMany({
        where: { status: 'PENDING' },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        take: batchSize
      });

      for (const task of tasks) {
        try {
          // Mark as processing
          await prisma.recomputationQueue.update({
            where: { queueId: task.queueId },
            data: { 
              status: 'PROCESSING',
              processedAt: new Date(),
              attempts: task.attempts + 1
            }
          });

          // Process the task
          if (task.studentId && task.opportunityId) {
            // Recompute specific student-opportunity pair
            const student = await prisma.student.findUnique({
              where: { studentId: task.studentId },
              include: {
                profile: { include: { university: true, degree: true, major: true } },
                skills: { include: { skill: true } },
                experiences: { include: { experienceTechnologies: { include: { skill: true } } } },
                projects: { include: { projectTechnologies: { include: { skill: true } } } },
                preferences: { include: { preference: true } }
              }
            });

            const opportunity = await prisma.opportunity.findUnique({
              where: { opportunityId: task.opportunityId },
              include: {
                company: true,
                opportunitySkills: { include: { skill: true } }
              }
            });

            if (student && opportunity) {
              const score = await this.computeMatchScore(student, opportunity);
              
              await prisma.matchScore.upsert({
                where: {
                  studentId_opportunityId: {
                    studentId: task.studentId,
                    opportunityId: task.opportunityId
                  }
                },
                create: {
                  studentId: task.studentId,
                  opportunityId: task.opportunityId,
                  totalScore: score.totalScore,
                  skillScore: score.skillScore,
                  academicScore: score.academicScore,
                  experienceScore: score.experienceScore,
                  preferenceScore: score.preferenceScore,
                  status: 'COMPUTED',
                  metadata: score.breakdown
                },
                update: {
                  totalScore: score.totalScore,
                  skillScore: score.skillScore,
                  academicScore: score.academicScore,
                  experienceScore: score.experienceScore,
                  preferenceScore: score.preferenceScore,
                  status: 'COMPUTED',
                  metadata: score.breakdown,
                  updatedAt: new Date()
                }
              });
            }
          } else if (task.studentId) {
            // Recompute all matches for student
            await this.recomputeMatchesForStudent(task.studentId);
          } else if (task.opportunityId) {
            // Recompute all matches for opportunity
            await this.recomputeMatchesForOpportunity(task.opportunityId);
          }

          // Mark as completed
          await prisma.recomputationQueue.update({
            where: { queueId: task.queueId },
            data: { 
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });

          processedCount++;

        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Mark as failed or retry
          const shouldRetry = task.attempts < task.maxAttempts;
          await prisma.recomputationQueue.update({
            where: { queueId: task.queueId },
            data: { 
              status: shouldRetry ? 'PENDING' : 'FAILED',
              error: errorMessage
            }
          });
        }
      }

      // Log the batch processing
      await this.logAIRun('SCHEDULED_BATCH', tasks.length, processedCount, Date.now() - startTime, errorCount === 0);

      return { processedCount, errorCount };

    } catch (error) {
      await this.logAIRun('SCHEDULED_BATCH', 0, 0, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Log AI engine run for audit and debugging
   */
  private async logAIRun(
    runType: 'STUDENT_UPDATE' | 'OPPORTUNITY_UPDATE' | 'MANUAL_TRIGGER' | 'SCHEDULED_BATCH',
    inputCount: number,
    outputCount: number,
    runtimeMs: number,
    success: boolean = true,
    error?: string,
    triggeredBy?: string
  ) {
    await prisma.aILog.create({
      data: {
        runType,
        inputCount,
        outputCount,
        runtimeMs,
        success,
        error,
        triggeredBy,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      }
    });
  }

  /**
   * Get AI logs for monitoring
   */
  async getAILogs(limit: number = 50) {
    return await prisma.aILog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Get matching statistics
   */
  async getMatchingStats() {
    const [
      totalMatches,
      recentMatches,
      queueSize,
      avgScore,
      topScores
    ] = await Promise.all([
      prisma.matchScore.count(),
      prisma.matchScore.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.recomputationQueue.count({
        where: { status: 'PENDING' }
      }),
      prisma.matchScore.aggregate({
        _avg: { totalScore: true }
      }),
      prisma.matchScore.findMany({
        orderBy: { totalScore: 'desc' },
        take: 10,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          opportunity: {
            select: {
              title: true,
              company: {
                select: { companyName: true }
              }
            }
          }
        }
      })
    ]);

    return {
      totalMatches,
      recentMatches,
      queueSize,
      averageScore: avgScore._avg.totalScore || 0,
      topMatches: topScores
    };
  }
}

export const matchingEngineService = new MatchingEngineService();