/**
 * Match Service
 * Placeholder service for student-opportunity matching
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MatchService {
  async findMatches(studentId: string) {
    // Placeholder implementation
    console.log(`Finding matches for student ${studentId}`);
    return [];
  }

  async getMatchInsights(studentId: string, opportunityId: string) {
    // Get match insights from database or calculate
    try {
      const matchScore = await prisma.matchScore.findFirst({
        where: {
          studentId,
          opportunityId
        }
      });

      if (matchScore) {
        return {
          matchScore: matchScore.totalScore,
          breakdown: {
            skillMatch: matchScore.skillScore,
            academicFit: matchScore.academicScore,
            experienceMatch: matchScore.experienceScore,
            preferenceFit: matchScore.preferenceScore
          },
          strengths: ['Strong technical skills', 'Good academic background'],
          improvements: ['Gain more experience', 'Improve soft skills']
        };
      }

      // Fallback calculation
      return {
        matchScore: 75,
        breakdown: {
          skillMatch: 80,
          academicFit: 70,
          experienceMatch: 75,
          preferenceFit: 75
        },
        strengths: ['Technical aptitude'],
        improvements: ['More experience needed']
      };
    } catch (error) {
      console.error('Error getting match insights:', error);
      return {
        matchScore: 50,
        breakdown: {
          skillMatch: 50,
          academicFit: 50,
          experienceMatch: 50,
          preferenceFit: 50
        },
        strengths: [],
        improvements: ['Complete profile']
      };
    }
  }

  async getTopMatches(studentId: string, limit: number = 10) {
    // Get top matches from database
    try {
      const matches = await prisma.matchScore.findMany({
        where: { studentId },
        include: {
          opportunity: {
            include: {
              company: {
                select: {
                  companyName: true,
                  logoPath: true
                }
              }
            }
          }
        },
        orderBy: { totalScore: 'desc' },
        take: limit
      });

      return matches.map(match => ({
        opportunityId: match.opportunityId,
        matchScore: match.totalScore / 100, // Convert to 0-1 scale
        opportunity: match.opportunity
      }));
    } catch (error) {
      console.error('Error getting top matches:', error);
      return [];
    }
  }
}

export const matchService = new MatchService();