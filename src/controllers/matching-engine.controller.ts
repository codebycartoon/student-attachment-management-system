/**
 * Matching Engine Controller
 * API endpoints for AI-powered student-opportunity matching
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { matchingEngineService } from '../services/matching-engine.service';

/**
 * Get ranked list of students for an opportunity
 */
export const getStudentsForOpportunity = async (req: Request, res: Response) => {
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

    const { opportunityId } = req.params;
    const { limit = 50, forceRecompute = false } = req.query;

    const studentMatches = await matchingEngineService.getStudentsForOpportunity(
      opportunityId,
      parseInt(limit as string),
      forceRecompute === 'true'
    );

    res.json({
      success: true,
      data: {
        opportunityId,
        totalMatches: studentMatches.length,
        students: studentMatches
      }
    });

  } catch (error) {
    console.error('Get students for opportunity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student matches'
    });
  }
};

/**
 * Get top matching opportunities for a student
 */
export const getOpportunitiesForStudent = async (req: Request, res: Response) => {
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

    const { studentId } = req.params;
    const { limit = 20, forceRecompute = false } = req.query;

    const opportunityMatches = await matchingEngineService.getOpportunitiesForStudent(
      studentId,
      parseInt(limit as string),
      forceRecompute === 'true'
    );

    res.json({
      success: true,
      data: {
        studentId,
        totalMatches: opportunityMatches.length,
        opportunities: opportunityMatches
      }
    });

  } catch (error) {
    console.error('Get opportunities for student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get opportunity matches'
    });
  }
};

/**
 * Trigger manual recomputation (admin only)
 */
export const triggerRecomputation = async (req: Request, res: Response) => {
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

    const { studentId, opportunityId, priority = 5 } = req.body;
    const reason = `Manual trigger by ${req.user.email}`;

    await matchingEngineService.queueRecomputation(
      studentId,
      opportunityId,
      reason,
      priority
    );

    res.json({
      success: true,
      message: 'Recomputation queued successfully',
      data: {
        studentId,
        opportunityId,
        priority,
        triggeredBy: req.user.email
      }
    });

  } catch (error) {
    console.error('Trigger recomputation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger recomputation'
    });
  }
};

/**
 * Process recomputation queue (admin only)
 */
export const processQueue = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { batchSize = 10 } = req.query;

    const result = await matchingEngineService.processRecomputationQueue(
      parseInt(batchSize as string)
    );

    res.json({
      success: true,
      message: 'Queue processing completed',
      data: result
    });

  } catch (error) {
    console.error('Process queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process queue'
    });
  }
};

/**
 * Get AI logs for monitoring (admin only)
 */
export const getAILogs = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { limit = 50 } = req.query;

    const logs = await matchingEngineService.getAILogs(parseInt(limit as string));

    res.json({
      success: true,
      data: {
        logs,
        total: logs.length
      }
    });

  } catch (error) {
    console.error('Get AI logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI logs'
    });
  }
};

/**
 * Get matching statistics (admin only)
 */
export const getMatchingStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const stats = await matchingEngineService.getMatchingStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get matching stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get matching statistics'
    });
  }
};

/**
 * Get student match insights for a specific opportunity
 */
export const getStudentMatchInsights = async (req: Request, res: Response) => {
  try {
    const { studentId, opportunityId } = req.params;

    // Get the existing match score with detailed breakdown
    const matchScore = await matchingEngineService.getStudentsForOpportunity(opportunityId, 1000);
    const studentMatch = matchScore.find(match => match.studentId === studentId);

    if (!studentMatch) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        studentId,
        opportunityId,
        matchScore: studentMatch.matchScore,
        rank: studentMatch.rank,
        insights: {
          strengths: generateStrengths(studentMatch.matchScore),
          improvements: generateImprovements(studentMatch.matchScore),
          recommendations: generateRecommendations(studentMatch.matchScore)
        }
      }
    });

  } catch (error) {
    console.error('Get student match insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match insights'
    });
  }
};

/**
 * Get opportunity match insights for a specific student
 */
export const getOpportunityMatchInsights = async (req: Request, res: Response) => {
  try {
    const { studentId, opportunityId } = req.params;

    // Get the existing match score with detailed breakdown
    const matchScores = await matchingEngineService.getOpportunitiesForStudent(studentId, 1000);
    const opportunityMatch = matchScores.find(match => match.opportunityId === opportunityId);

    if (!opportunityMatch) {
      res.status(404).json({
        success: false,
        message: 'Match not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        studentId,
        opportunityId,
        matchScore: opportunityMatch.matchScore,
        rank: opportunityMatch.rank,
        insights: {
          fitAnalysis: analyzeFit(opportunityMatch.matchScore),
          skillGaps: identifySkillGaps(opportunityMatch.matchScore),
          recommendations: generateStudentRecommendations(opportunityMatch.matchScore)
        }
      }
    });

  } catch (error) {
    console.error('Get opportunity match insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get match insights'
    });
  }
};

// Helper functions for generating insights

function generateStrengths(matchScore: any): string[] {
  const strengths = [];
  
  if (matchScore.skillScore > 0.8) {
    strengths.push('Strong technical skill alignment');
  }
  if (matchScore.academicScore > 0.8) {
    strengths.push('Excellent academic background');
  }
  if (matchScore.experienceScore > 0.7) {
    strengths.push('Relevant work experience');
  }
  if (matchScore.preferenceScore > 0.8) {
    strengths.push('Strong preference alignment');
  }
  
  return strengths;
}

function generateImprovements(matchScore: any): string[] {
  const improvements = [];
  
  if (matchScore.skillScore < 0.6) {
    improvements.push('Consider developing additional technical skills');
  }
  if (matchScore.academicScore < 0.5) {
    improvements.push('Academic performance could be strengthened');
  }
  if (matchScore.experienceScore < 0.4) {
    improvements.push('More relevant work experience would be beneficial');
  }
  
  return improvements;
}

function generateRecommendations(matchScore: any): string[] {
  const recommendations = [];
  
  if (matchScore.breakdown?.skillDetails?.missingRequiredSkills > 0) {
    recommendations.push('Focus on acquiring the missing required skills');
  }
  if (matchScore.experienceScore < 0.5) {
    recommendations.push('Consider taking on relevant projects or internships');
  }
  if (matchScore.totalScore > 0.7) {
    recommendations.push('This is a strong match - consider applying');
  }
  
  return recommendations;
}

function analyzeFit(matchScore: any): any {
  return {
    overall: matchScore.totalScore > 0.7 ? 'Excellent' : matchScore.totalScore > 0.5 ? 'Good' : 'Fair',
    skillFit: matchScore.skillScore > 0.8 ? 'Excellent' : matchScore.skillScore > 0.6 ? 'Good' : 'Needs Improvement',
    academicFit: matchScore.academicScore > 0.8 ? 'Excellent' : matchScore.academicScore > 0.6 ? 'Good' : 'Fair',
    experienceFit: matchScore.experienceScore > 0.7 ? 'Strong' : matchScore.experienceScore > 0.4 ? 'Moderate' : 'Limited'
  };
}

function identifySkillGaps(matchScore: any): string[] {
  const skillGaps = [];
  
  if (matchScore.breakdown?.skillDetails?.missingRequiredSkills > 0) {
    const missingSkills = matchScore.breakdown.skillDetails.skillMatches
      .filter((skill: any) => skill.missing && skill.required)
      .map((skill: any) => skill.skill);
    
    skillGaps.push(...missingSkills);
  }
  
  return skillGaps;
}

function generateStudentRecommendations(matchScore: any): string[] {
  const recommendations = [];
  
  if (matchScore.totalScore > 0.8) {
    recommendations.push('Excellent match! Strongly consider applying');
  } else if (matchScore.totalScore > 0.6) {
    recommendations.push('Good match with some areas for improvement');
  } else {
    recommendations.push('Consider developing skills before applying');
  }
  
  if (matchScore.skillScore < 0.6) {
    recommendations.push('Focus on building technical skills relevant to this role');
  }
  
  if (matchScore.experienceScore < 0.4) {
    recommendations.push('Gain more relevant experience through projects or internships');
  }
  
  return recommendations;
}