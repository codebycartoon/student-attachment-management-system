/**
 * Email Service
 * Handles email notifications for critical events
 */

import { PrismaClient } from '@prisma/client';
import { eventSystemService } from './event-system.service';

const prisma = new PrismaClient();

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: any;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates() {
    // Interview scheduled template
    this.templates.set('interview_scheduled', {
      name: 'interview_scheduled',
      subject: 'Interview Scheduled - {{opportunityTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Scheduled</h2>
          <p>Dear {{studentName}},</p>
          <p>Your interview has been scheduled for the position <strong>{{opportunityTitle}}</strong> at {{companyName}}.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Interview Details</h3>
            <p><strong>Date:</strong> {{scheduledDate}}</p>
            <p><strong>Time:</strong> {{scheduledTime}}</p>
            <p><strong>Type:</strong> {{interviewType}}</p>
            {{#if meetingLink}}<p><strong>Meeting Link:</strong> <a href="{{meetingLink}}">{{meetingLink}}</a></p>{{/if}}
            {{#if location}}<p><strong>Location:</strong> {{location}}</p>{{/if}}
            {{#if interviewer}}<p><strong>Interviewer:</strong> {{interviewer}}</p>{{/if}}
          </div>
          
          <p>Please make sure to join the interview on time. Good luck!</p>
          <p>Best regards,<br>The Placement Platform Team</p>
        </div>
      `,
      text: `
        Interview Scheduled - {{opportunityTitle}}
        
        Dear {{studentName}},
        
        Your interview has been scheduled for the position {{opportunityTitle}} at {{companyName}}.
        
        Interview Details:
        Date: {{scheduledDate}}
        Time: {{scheduledTime}}
        Type: {{interviewType}}
        {{#if meetingLink}}Meeting Link: {{meetingLink}}{{/if}}
        {{#if location}}Location: {{location}}{{/if}}
        {{#if interviewer}}Interviewer: {{interviewer}}{{/if}}
        
        Please make sure to join the interview on time. Good luck!
        
        Best regards,
        The Placement Platform Team
      `
    });

    // Placement offered template
    this.templates.set('placement_offered', {
      name: 'placement_offered',
      subject: 'Placement Offer - {{opportunityTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Congratulations! Placement Offer</h2>
          <p>Dear {{studentName}},</p>
          <p>We are pleased to inform you that you have received a placement offer for the position <strong>{{opportunityTitle}}</strong> at {{companyName}}.</p>
          
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Placement Details</h3>
            <p><strong>Position:</strong> {{opportunityTitle}}</p>
            <p><strong>Company:</strong> {{companyName}}</p>
            <p><strong>Start Date:</strong> {{startDate}}</p>
            {{#if endDate}}<p><strong>End Date:</strong> {{endDate}}</p>{{/if}}
            {{#if salary}}<p><strong>Salary:</strong> {{currency}}{{salary}}</p>{{/if}}
          </div>
          
          <p>Please log in to your dashboard to review the complete offer details and respond.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{actionUrl}}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Offer</a>
          </p>
          
          <p>Congratulations once again!</p>
          <p>Best regards,<br>The Placement Platform Team</p>
        </div>
      `,
      text: `
        Congratulations! Placement Offer - {{opportunityTitle}}
        
        Dear {{studentName}},
        
        We are pleased to inform you that you have received a placement offer for the position {{opportunityTitle}} at {{companyName}}.
        
        Placement Details:
        Position: {{opportunityTitle}}
        Company: {{companyName}}
        Start Date: {{startDate}}
        {{#if endDate}}End Date: {{endDate}}{{/if}}
        {{#if salary}}Salary: {{currency}}{{salary}}{{/if}}
        
        Please log in to your dashboard to review the complete offer details and respond.
        
        View Offer: {{actionUrl}}
        
        Congratulations once again!
        
        Best regards,
        The Placement Platform Team
      `
    });

    // Application status update template
    this.templates.set('application_update', {
      name: 'application_update',
      subject: 'Application Update - {{opportunityTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Update</h2>
          <p>Dear {{studentName}},</p>
          <p>There has been an update to your application for the position <strong>{{opportunityTitle}}</strong> at {{companyName}}.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Status:</strong> {{status}}</p>
            <p><strong>Update:</strong> {{message}}</p>
          </div>
          
          <p>Please log in to your dashboard for more details.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{actionUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Application</a>
          </p>
          
          <p>Best regards,<br>The Placement Platform Team</p>
        </div>
      `,
      text: `
        Application Update - {{opportunityTitle}}
        
        Dear {{studentName}},
        
        There has been an update to your application for the position {{opportunityTitle}} at {{companyName}}.
        
        Status: {{status}}
        Update: {{message}}
        
        Please log in to your dashboard for more details.
        
        View Application: {{actionUrl}}
        
        Best regards,
        The Placement Platform Team
      `
    });

    // System alert template
    this.templates.set('system_alert', {
      name: 'system_alert',
      subject: 'System Alert - {{title}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">System Alert</h2>
          <p>Dear User,</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">{{title}}</h3>
            <p>{{message}}</p>
          </div>
          
          {{#if actionUrl}}
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{actionUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Take Action</a>
          </p>
          {{/if}}
          
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>The Placement Platform Team</p>
        </div>
      `,
      text: `
        System Alert - {{title}}
        
        Dear User,
        
        {{title}}
        
        {{message}}
        
        {{#if actionUrl}}Take Action: {{actionUrl}}{{/if}}
        
        If you have any questions, please contact our support team.
        
        Best regards,
        The Placement Platform Team
      `
    });
  }

  /**
   * Send email
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with an email service
      // like SendGrid, AWS SES, Mailgun, etc.
      
      console.log('📧 Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        hasHtml: !!emailData.html,
        hasText: !!emailData.text,
        template: emailData.template
      });

      // Log the email event
      await eventSystemService.logEvent({
        type: 'email.sent',
        level: 'INFO',
        action: 'send_email',
        details: `Email sent to ${emailData.to}: ${emailData.subject}`,
        metadata: {
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template
        }
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;

    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log the error
      await eventSystemService.logEvent({
        type: 'email.failed',
        level: 'ERROR',
        action: 'send_email_failed',
        details: `Failed to send email to ${emailData.to}: ${error.message}`,
        metadata: {
          to: emailData.to,
          subject: emailData.subject,
          error: error.message
        }
      });

      return false;
    }
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(templateName: string, to: string, data: any, actionUrl?: string): Promise<boolean> {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // Simple template rendering (in production, use a proper template engine)
      const subject = this.renderTemplate(template.subject, data);
      const html = this.renderTemplate(template.html, { ...data, actionUrl });
      const text = this.renderTemplate(template.text, { ...data, actionUrl });

      return await this.sendEmail({
        to,
        subject,
        html,
        text,
        template: templateName,
        templateData: data
      });

    } catch (error) {
      console.error('Error sending templated email:', error);
      return false;
    }
  }

  /**
   * Simple template rendering
   */
  private renderTemplate(template: string, data: any): string {
    let rendered = template;

    // Replace {{variable}} with data values
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    }

    // Handle conditional blocks {{#if variable}}...{{/if}}
    rendered = rendered.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    return rendered;
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduledEmail(interviewId: string): Promise<boolean> {
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

      const templateData = {
        studentName: `${interview.application.student.firstName} ${interview.application.student.lastName}`,
        opportunityTitle: interview.application.opportunity.title,
        companyName: interview.application.opportunity.company.companyName,
        scheduledDate: interview.scheduledDate.toLocaleDateString(),
        scheduledTime: interview.scheduledTime || 'TBD',
        interviewType: interview.interviewType,
        meetingLink: interview.meetingLink,
        location: interview.location,
        interviewer: interview.interviewer
      };

      return await this.sendTemplatedEmail(
        'interview_scheduled',
        interview.application.student.user.email,
        templateData,
        `/interviews/${interviewId}`
      );

    } catch (error) {
      console.error('Error sending interview scheduled email:', error);
      return false;
    }
  }

  /**
   * Send placement offered email
   */
  async sendPlacementOfferedEmail(placementId: string): Promise<boolean> {
    try {
      const placement = await prisma.placement.findUnique({
        where: { placementId },
        include: {
          application: {
            include: {
              student: { include: { user: true } },
              opportunity: { include: { company: true } }
            }
          }
        }
      });

      if (!placement) {
        throw new Error('Placement not found');
      }

      const templateData = {
        studentName: `${placement.application.student.firstName} ${placement.application.student.lastName}`,
        opportunityTitle: placement.application.opportunity.title,
        companyName: placement.application.opportunity.company.companyName,
        startDate: placement.startDate.toLocaleDateString(),
        endDate: placement.endDate?.toLocaleDateString(),
        salary: placement.salary,
        currency: placement.currency || 'USD'
      };

      return await this.sendTemplatedEmail(
        'placement_offered',
        placement.application.student.user.email,
        templateData,
        `/placements/${placementId}`
      );

    } catch (error) {
      console.error('Error sending placement offered email:', error);
      return false;
    }
  }

  /**
   * Send application update email
   */
  async sendApplicationUpdateEmail(applicationId: string, status: string, message: string): Promise<boolean> {
    try {
      const application = await prisma.application.findUnique({
        where: { applicationId },
        include: {
          student: { include: { user: true } },
          opportunity: { include: { company: true } }
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      const templateData = {
        studentName: `${application.student.firstName} ${application.student.lastName}`,
        opportunityTitle: application.opportunity.title,
        companyName: application.opportunity.company.companyName,
        status,
        message
      };

      return await this.sendTemplatedEmail(
        'application_update',
        application.student.user.email,
        templateData,
        `/applications/${applicationId}`
      );

    } catch (error) {
      console.error('Error sending application update email:', error);
      return false;
    }
  }

  /**
   * Send system alert email
   */
  async sendSystemAlertEmail(userEmail: string, title: string, message: string, actionUrl?: string): Promise<boolean> {
    try {
      const templateData = {
        title,
        message
      };

      return await this.sendTemplatedEmail(
        'system_alert',
        userEmail,
        templateData,
        actionUrl
      );

    } catch (error) {
      console.error('Error sending system alert email:', error);
      return false;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [sent, failed] = await Promise.all([
        prisma.systemLog.count({
          where: {
            action: 'send_email',
            level: 'INFO',
            createdAt: { gte: startDate }
          }
        }),
        prisma.systemLog.count({
          where: {
            action: 'send_email_failed',
            level: 'ERROR',
            createdAt: { gte: startDate }
          }
        })
      ]);

      const total = sent + failed;
      const successRate = total > 0 ? (sent / total) * 100 : 0;

      return {
        sent,
        failed,
        total,
        successRate
      };

    } catch (error) {
      console.error('Error getting email stats:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();