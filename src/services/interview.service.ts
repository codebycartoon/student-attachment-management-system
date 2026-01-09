/**
 * Interview Service
 * Manages interview scheduling, updates, and notifications
 */

import { PrismaClient, InterviewType, InterviewStatus } from '@prisma/client';
import { notificationService } from './notification.service';
import { webSocketService } from './websocket.service';

const prisma = new PrismaClient();

export interface InterviewData {
  applicationId: string;
  interviewType: InterviewType;
  scheduledDate: Date;
  scheduledTime?: string;
  duration?: number;
  interviewer?: string;
  interviewerEmail?: string;
  meetingLink?: string;
  location?: string;
}

export interface InterviewUpdateData {
  scheduledDate?: Date;
  scheduledTime?: string;
  duration?: number;
  interviewer?: string;
  interviewerEmail?: string;
  meetingLink?: string;
  location?: string;
  status?: InterviewStatus;
  feedback?: string;
  rating?: number;
}

export class InterviewService {
  /**
   * Schedule a new interview
   */
  async scheduleInterview(data: InterviewData) {
    try {
      // Verify application exists and is in correct status
      const application = await prisma.application.findUnique({
        where: { applicationId: data.applicationId },
        include: {
          student: { include: { user: true } },
          opportunity: { include: { company: true } }
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status !== 'IN_REVIEW') {
        throw new Error('Application must be in review status to schedule interview');
      }

      // Create interview
      const interview = await prisma.interview.create({
        data: {
          applicationId: data.applicationId,
          interviewType: data.interviewType,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          duration: data.duration || 60, // Default 60 minutes
          interviewer: data.interviewer,
          interviewerEmail: data.interviewerEmail,
          meetingLink: data.meetingLink,
          location: data.location,
          status: 'SCHEDULED'
        }
      });

      // Update application status
      await prisma.application.update({
        where: { applicationId: data.applicationId },
        data: { status: 'INTERVIEW' }
      });

      // Send notifications
      await notificationService.notifyInterviewScheduled(interview.interviewId);

      // Send real-time update
      webSocketService.sendInterviewUpdate(application.student.userId, {
        interviewId: interview.interviewId,
        scheduledDate: interview.scheduledDate,
        opportunityTitle: application.opportunity.title,
        companyName: application.opportunity.company.companyName
      });

      console.log(`📅 Interview scheduled: ${interview.interviewId} for application ${data.applicationId}`);
      return interview;

    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  }

  /**
   * Update interview details
   */
  async updateInterview(interviewId: string, data: InterviewUpdateData) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!interview) {
        throw new Error('Interview not found');
      }

      // Update interview
      const updatedInterview = await prisma.interview.update({
        where: { interviewId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });

      // If status changed to COMPLETED, handle completion logic
      if (data.status === 'COMPLETED' && interview.status !== 'COMPLETED') {
        await this.handleInterviewCompletion(interviewId);
      }

      // Send notification for significant changes
      if (data.scheduledDate || data.scheduledTime || data.status) {
        await notificationService.sendNotification({
          userId: interview.application.student.userId,
          type: 'INTERVIEW_SCHEDULED',
          title: `Interview Updated - ${interview.application.opportunity.title}`,
          message: this.getUpdateMessage(data),
          actionUrl: `/interviews/${interviewId}`,
          metadata: { interviewId, updateType: 'interview_updated' }
        });
      }

      console.log(`📅 Interview updated: ${interviewId}`);
      return updatedInterview;

    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  }

  /**
   * Cancel interview
   */
  async cancelInterview(interviewId: string, reason?: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!interview) {
        throw new Error('Interview not found');
      }

      // Update interview status
      const updatedInterview = await prisma.interview.update({
        where: { interviewId },
        data: {
          status: 'CANCELLED',
          feedback: reason,
          updatedAt: new Date()
        }
      });

      // Update application status back to IN_REVIEW
      await prisma.application.update({
        where: { applicationId: interview.applicationId },
        data: { status: 'IN_REVIEW' }
      });

      // Send notification
      await notificationService.sendNotification({
        userId: interview.application.student.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Cancelled - ${interview.application.opportunity.title}`,
        message: `Your interview has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: `/applications/${interview.applicationId}`,
        metadata: { interviewId, reason }
      });

      console.log(`❌ Interview cancelled: ${interviewId}`);
      return updatedInterview;

    } catch (error) {
      console.error('Error cancelling interview:', error);
      throw error;
    }
  }

  /**
   * Get interviews for student
   */
  async getStudentInterviews(studentId: string, status?: InterviewStatus) {
    try {
      const interviews = await prisma.interview.findMany({
        where: {
          application: { studentId },
          ...(status && { status })
        },
        include: {
          application: {
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
            }
          }
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return interviews;

    } catch (error) {
      console.error('Error getting student interviews:', error);
      throw error;
    }
  }

  /**
   * Get interviews for company
   */
  async getCompanyInterviews(companyId: string, status?: InterviewStatus) {
    try {
      const interviews = await prisma.interview.findMany({
        where: {
          application: {
            opportunity: { companyId }
          },
          ...(status && { status })
        },
        include: {
          application: {
            include: {
              student: {
                select: {
                  studentId: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  phone: true,
                  location: true
                }
              },
              opportunity: {
                select: {
                  title: true,
                  opportunityId: true
                }
              }
            }
          }
        },
        orderBy: { scheduledDate: 'asc' }
      });

      return interviews;

    } catch (error) {
      console.error('Error getting company interviews:', error);
      throw error;
    }
  }

  /**
   * Get interview details
   */
  async getInterviewDetails(interviewId: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId },
        include: {
          application: {
            include: {
              student: {
                include: {
                  profile: true,
                  skills: {
                    include: { skill: true }
                  }
                }
              },
              opportunity: {
                include: {
                  company: true
                }
              }
            }
          }
        }
      });

      return interview;

    } catch (error) {
      console.error('Error getting interview details:', error);
      throw error;
    }
  }

  /**
   * Handle interview completion
   */
  private async handleInterviewCompletion(interviewId: string) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { interviewId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!interview) return;

      // Update application status
      await prisma.application.update({
        where: { applicationId: interview.applicationId },
        data: { status: 'IN_REVIEW' } // Back to review for placement decision
      });

      // Send completion notification
      await notificationService.sendNotification({
        userId: interview.application.student.userId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview Completed - ${interview.application.opportunity.title}`,
        message: 'Your interview has been completed. You will be notified of the next steps.',
        actionUrl: `/applications/${interview.applicationId}`,
        metadata: { interviewId, status: 'completed' }
      });

      console.log(`✅ Interview completion handled: ${interviewId}`);

    } catch (error) {
      console.error('Error handling interview completion:', error);
    }
  }

  /**
   * Get upcoming interviews (next 7 days)
   */
  async getUpcomingInterviews(userId: string, userRole: string) {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      let interviews;

      if (userRole === 'STUDENT') {
        const student = await prisma.student.findUnique({
          where: { userId }
        });

        if (!student) return [];

        interviews = await this.getStudentInterviews(student.studentId, 'SCHEDULED');
      } else if (userRole === 'COMPANY') {
        const company = await prisma.company.findUnique({
          where: { userId }
        });

        if (!company) return [];

        interviews = await this.getCompanyInterviews(company.companyId, 'SCHEDULED');
      } else {
        return [];
      }

      // Filter for upcoming interviews
      return interviews.filter(interview => 
        interview.scheduledDate <= sevenDaysFromNow &&
        interview.scheduledDate >= new Date()
      );

    } catch (error) {
      console.error('Error getting upcoming interviews:', error);
      throw error;
    }
  }

  /**
   * Generate update message based on changes
   */
  private getUpdateMessage(data: InterviewUpdateData): string {
    const changes = [];
    
    if (data.scheduledDate) changes.push('date');
    if (data.scheduledTime) changes.push('time');
    if (data.location) changes.push('location');
    if (data.meetingLink) changes.push('meeting link');
    if (data.status) changes.push('status');

    if (changes.length === 0) return 'Interview details have been updated';
    
    return `Interview ${changes.join(', ')} has been updated`;
  }

  /**
   * Get interview statistics
   */
  async getInterviewStats(companyId?: string) {
    try {
      const whereClause = companyId 
        ? { application: { opportunity: { companyId } } }
        : {};

      const [total, scheduled, completed, cancelled] = await Promise.all([
        prisma.interview.count({ where: whereClause }),
        prisma.interview.count({ where: { ...whereClause, status: 'SCHEDULED' } }),
        prisma.interview.count({ where: { ...whereClause, status: 'COMPLETED' } }),
        prisma.interview.count({ where: { ...whereClause, status: 'CANCELLED' } })
      ]);

      return {
        total,
        scheduled,
        completed,
        cancelled,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };

    } catch (error) {
      console.error('Error getting interview stats:', error);
      throw error;
    }
  }
}

export const interviewService = new InterviewService();