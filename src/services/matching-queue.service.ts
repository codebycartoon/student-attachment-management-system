/**
 * Matching Queue Service
 * Background processing for recomputation queue and automatic triggers
 */

import { PrismaClient } from '@prisma/client';
import { matchingEngineService } from './matching-engine.service';
import { studentProfileService } from './student-profile.service';

const prisma = new PrismaClient();

export class MatchingQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start automatic queue processing
   */
  startQueueProcessor(intervalMs: number = 30000) { // 30 seconds default
    if (this.processingInterval) {
      console.log('Queue processor already running');
      return;
    }

    console.log(`🤖 Starting matching queue processor (interval: ${intervalMs}ms)`);
    
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processQueueBatch();
      }
    }, intervalMs);

    // Process immediately on start
    setTimeout(() => this.processQueueBatch(), 1000);
  }

  /**
   * Stop automatic queue processing
   */
  stopQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Matching queue processor stopped');
    }
  }

  /**
   * Process a batch of queue items
   */
  private async processQueueBatch() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const result = await matchingEngineService.processRecomputationQueue(10);
      
      if (result.processedCount > 0) {
        console.log(`✅ Processed ${result.processedCount} matching tasks (${result.errorCount} errors)`);
      }
    } catch (error) {
      console.error('❌ Error processing matching queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Trigger recomputation when student profile is updated
   */
  async onStudentProfileUpdate(studentId: string, reason: string = 'Profile updated') {
    try {
      await matchingEngineService.queueRecomputation(
        studentId,
        undefined,
        reason,
        3 // Medium priority
      );
      
      console.log(`📊 Queued student recomputation: ${studentId} (${reason})`);
    } catch (error) {
      console.error('Error queuing student recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when opportunity is updated
   */
  async onOpportunityUpdate(opportunityId: string, reason: string = 'Opportunity updated') {
    try {
      await matchingEngineService.queueRecomputation(
        undefined,
        opportunityId,
        reason,
        4 // Higher priority for opportunity updates
      );
      
      console.log(`🎯 Queued opportunity recomputation: ${opportunityId} (${reason})`);
    } catch (error) {
      console.error('Error queuing opportunity recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when student uploads CV/transcript
   */
  async onDocumentUpload(studentId: string, documentType: string) {
    try {
      await matchingEngineService.queueRecomputation(
        studentId,
        undefined,
        `${documentType} uploaded`,
        5 // High priority for document uploads
      );
      
      console.log(`📄 Queued recomputation for document upload: ${studentId} (${documentType})`);
    } catch (error) {
      console.error('Error queuing document recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when student skills are updated
   */
  async onSkillsUpdate(studentId: string) {
    try {
      await matchingEngineService.queueRecomputation(
        studentId,
        undefined,
        'Skills updated',
        4 // High priority for skills updates
      );
      
      console.log(`🛠️ Queued recomputation for skills update: ${studentId}`);
    } catch (error) {
      console.error('Error queuing skills recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when student academic info is updated
   */
  async onAcademicUpdate(studentId: string) {
    try {
      await matchingEngineService.queueRecomputation(
        studentId,
        undefined,
        'Academic info updated',
        3 // Medium priority
      );
      
      console.log(`🎓 Queued recomputation for academic update: ${studentId}`);
    } catch (error) {
      console.error('Error queuing academic recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when student experience/projects are updated
   */
  async onExperienceUpdate(studentId: string) {
    try {
      await matchingEngineService.queueRecomputation(
        studentId,
        undefined,
        'Experience updated',
        4 // High priority
      );
      
      console.log(`💼 Queued recomputation for experience update: ${studentId}`);
    } catch (error) {
      console.error('Error queuing experience recomputation:', error);
    }
  }

  /**
   * Trigger recomputation when opportunity skills are updated
   */
  async onOpportunitySkillsUpdate(opportunityId: string) {
    try {
      await matchingEngineService.queueRecomputation(
        undefined,
        opportunityId,
        'Required skills updated',
        5 // High priority
      );
      
      console.log(`🎯 Queued recomputation for opportunity skills update: ${opportunityId}`);
    } catch (error) {
      console.error('Error queuing opportunity skills recomputation:', error);
    }
  }

  /**
   * Schedule periodic full recomputation (e.g., daily)
   */
  async schedulePeriodicRecomputation() {
    try {
      // Get all active students and opportunities
      const [students, opportunities] = await Promise.all([
        prisma.student.count({ where: { user: { status: 'ACTIVE' } } }),
        prisma.opportunity.count({ where: { status: 'ACTIVE' } })
      ]);

      console.log(`📅 Scheduling periodic recomputation for ${students} students and ${opportunities} opportunities`);

      // Queue recomputation for all students (lower priority)
      const activeStudents = await prisma.student.findMany({
        where: { user: { status: 'ACTIVE' } },
        select: { studentId: true }
      });

      for (const student of activeStudents) {
        await matchingEngineService.queueRecomputation(
          student.studentId,
          undefined,
          'Scheduled periodic recomputation',
          1 // Low priority
        );
      }

      console.log(`✅ Scheduled periodic recomputation for ${activeStudents.length} students`);
    } catch (error) {
      console.error('Error scheduling periodic recomputation:', error);
    }
  }

  /**
   * Get queue status and statistics
   */
  async getQueueStatus() {
    try {
      const [
        pendingCount,
        processingCount,
        completedToday,
        failedToday,
        oldestPending
      ] = await Promise.all([
        prisma.recomputationQueue.count({ where: { status: 'PENDING' } }),
        prisma.recomputationQueue.count({ where: { status: 'PROCESSING' } }),
        prisma.recomputationQueue.count({
          where: {
            status: 'COMPLETED',
            completedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.recomputationQueue.count({
          where: {
            status: 'FAILED',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.recomputationQueue.findFirst({
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true }
        })
      ]);

      return {
        pending: pendingCount,
        processing: processingCount,
        completedToday,
        failedToday,
        isProcessorRunning: this.processingInterval !== null,
        isCurrentlyProcessing: this.isProcessing,
        oldestPendingAge: oldestPending 
          ? Date.now() - oldestPending.createdAt.getTime()
          : null
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw error;
    }
  }

  /**
   * Clean up old completed/failed queue items
   */
  async cleanupOldQueueItems(olderThanDays: number = 7) {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      const result = await prisma.recomputationQueue.deleteMany({
        where: {
          status: { in: ['COMPLETED', 'FAILED'] },
          createdAt: { lt: cutoffDate }
        }
      });

      console.log(`🧹 Cleaned up ${result.count} old queue items (older than ${olderThanDays} days)`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up queue items:', error);
      throw error;
    }
  }
}

export const matchingQueueService = new MatchingQueueService();