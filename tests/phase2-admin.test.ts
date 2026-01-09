import request from 'supertest';
import { app } from '../src/server';
import { seedTestData, clearTestData, TEST_USERS } from './seed/test-data';
import { prisma } from './setup';
import { UserStatus, OpportunityStatus, ApplicationStatus } from '@prisma/client';

describe('Phase 2: Core Data Models & Admin APIs', () => {
  let adminToken: string;
  let studentToken: string;
  let companyToken: string;

  beforeAll(async () => {
    await clearTestData();
    await seedTestData();

    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.ADMIN1.email,
        password: TEST_USERS.ADMIN1.password
      });
    adminToken = adminLogin.body.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.STUDENT1.email,
        password: TEST_USERS.STUDENT1.password
      });
    studentToken = studentLogin.body.token;

    const companyLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.COMPANY1.email,
        password: TEST_USERS.COMPANY1.password
      });
    companyToken = companyLogin.body.token;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('Admin User Management', () => {
    test('should fetch all users with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    test('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users).toBeInstanceOf(Array);
      response.body.users.forEach((user: any) => {
        expect(user.role).toBe('STUDENT');
      });
    });

    test('should filter users by status', async () => {
      const response = await request(app)
        .get('/api/admin/users?status=ACTIVE')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.users.forEach((user: any) => {
        expect(user.status).toBe('ACTIVE');
      });
    });

    test('should get user details by ID', async () => {
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      const studentUser = usersResponse.body.users.find((u: any) => u.role === 'STUDENT');

      const response = await request(app)
        .get(`/api/admin/users/${studentUser.userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body.role).toBe('STUDENT');
    });

    test('should suspend a user', async () => {
      // Create a test user to suspend
      const newUser = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'suspend-test@test.com',
          password: 'password123',
          role: 'STUDENT',
          firstName: 'Suspend',
          lastName: 'Test'
        });

      const userId = newUser.body.user.userId;

      const response = await request(app)
        .patch(`/api/admin/users/${userId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('SUSPENDED');

      // Verify user cannot login when suspended
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'suspend-test@test.com',
          password: 'password123'
        })
        .expect(401);
    });

    test('should reactivate a suspended user', async () => {
      // Find a suspended user or create one
      const user = await prisma.user.findFirst({
        where: { status: UserStatus.SUSPENDED }
      });

      if (user) {
        const response = await request(app)
          .patch(`/api/admin/users/${user.userId}/activate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.status).toBe('ACTIVE');
      }
    });

    test('should delete a user', async () => {
      // Create a test user to delete
      const newUser = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'delete-test@test.com',
          password: 'password123',
          role: 'STUDENT',
          firstName: 'Delete',
          lastName: 'Test'
        });

      const userId = newUser.body.user.userId;

      await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { userId }
      });
      expect(deletedUser).toBeNull();
    });

    test('should deny non-admin access to user management', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe('Admin Opportunity Management', () => {
    test('should fetch all opportunities', async () => {
      const response = await request(app)
        .get('/api/admin/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('opportunities');
      expect(response.body.opportunities).toBeInstanceOf(Array);
      expect(response.body.opportunities.length).toBeGreaterThan(0);
    });

    test('should filter opportunities by status', async () => {
      const response = await request(app)
        .get('/api/admin/opportunities?status=ACTIVE')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.opportunities.forEach((opp: any) => {
        expect(opp.status).toBe('ACTIVE');
      });
    });

    test('should approve a pending opportunity', async () => {
      // Create a pending opportunity
      const opportunity = await prisma.opportunity.create({
        data: {
          companyId: global.__TEST_DATA__.companies.company1,
          title: 'Test Pending Opportunity',
          description: 'Test description',
          status: OpportunityStatus.PENDING_APPROVAL,
          jobTypes: ['INTERNSHIP']
        }
      });

      const response = await request(app)
        .patch(`/api/admin/opportunities/${opportunity.opportunityId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('ACTIVE');
    });

    test('should reject an opportunity', async () => {
      // Create a pending opportunity
      const opportunity = await prisma.opportunity.create({
        data: {
          companyId: global.__TEST_DATA__.companies.company1,
          title: 'Test Reject Opportunity',
          description: 'Test description',
          status: OpportunityStatus.PENDING_APPROVAL,
          jobTypes: ['INTERNSHIP']
        }
      });

      const response = await request(app)
        .patch(`/api/admin/opportunities/${opportunity.opportunityId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Does not meet quality standards' })
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
    });

    test('should get opportunity details', async () => {
      const opportunitiesResponse = await request(app)
        .get('/api/admin/opportunities')
        .set('Authorization', `Bearer ${adminToken}`);

      const opportunity = opportunitiesResponse.body.opportunities[0];

      const response = await request(app)
        .get(`/api/admin/opportunities/${opportunity.opportunityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('opportunityId');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('company');
      expect(response.body).toHaveProperty('applications');
    });
  });

  describe('Admin Application Management', () => {
    test('should fetch all applications', async () => {
      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('applications');
      expect(response.body.applications).toBeInstanceOf(Array);
      expect(response.body.applications.length).toBeGreaterThan(0);
    });

    test('should filter applications by status', async () => {
      const response = await request(app)
        .get('/api/admin/applications?status=SUBMITTED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.applications.forEach((app: any) => {
        expect(app.status).toBe('SUBMITTED');
      });
    });

    test('should override application status', async () => {
      const applicationsResponse = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      const application = applicationsResponse.body.applications[0];

      const response = await request(app)
        .patch(`/api/admin/applications/${application.applicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'ACCEPTED',
          reviewNotes: 'Excellent candidate, approved by admin'
        })
        .expect(200);

      expect(response.body.status).toBe('ACCEPTED');
      expect(response.body.reviewNotes).toBe('Excellent candidate, approved by admin');
    });

    test('should get application details', async () => {
      const applicationsResponse = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      const application = applicationsResponse.body.applications[0];

      const response = await request(app)
        .get(`/api/admin/applications/${application.applicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('applicationId');
      expect(response.body).toHaveProperty('student');
      expect(response.body).toHaveProperty('opportunity');
      expect(response.body).toHaveProperty('matchScore');
    });
  });

  describe('Admin Analytics & Metrics', () => {
    test('should fetch system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalStudents');
      expect(response.body).toHaveProperty('totalCompanies');
      expect(response.body).toHaveProperty('totalOpportunities');
      expect(response.body).toHaveProperty('totalApplications');
      expect(response.body).toHaveProperty('activeSessions');

      expect(typeof response.body.totalUsers).toBe('number');
      expect(typeof response.body.totalStudents).toBe('number');
      expect(typeof response.body.totalCompanies).toBe('number');
    });

    test('should fetch user registration trends', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/user-trends?period=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toBeInstanceOf(Array);
    });

    test('should fetch application metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalApplications');
      expect(response.body).toHaveProperty('applicationsByStatus');
      expect(response.body).toHaveProperty('averageMatchScore');
      expect(response.body.applicationsByStatus).toBeInstanceOf(Object);
    });

    test('should fetch opportunity metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/opportunities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalOpportunities');
      expect(response.body).toHaveProperty('opportunitiesByStatus');
      expect(response.body).toHaveProperty('averageApplicationsPerOpportunity');
    });

    test('should fetch placement metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/placements')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalPlacements');
      expect(response.body).toHaveProperty('placementsByStatus');
      expect(response.body).toHaveProperty('averagePlacementDuration');
    });
  });

  describe('Admin System Logs', () => {
    test('should fetch system logs', async () => {
      const response = await request(app)
        .get('/api/admin/logs?page=1&limit=50')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.logs).toBeInstanceOf(Array);
    });

    test('should filter logs by level', async () => {
      const response = await request(app)
        .get('/api/admin/logs?level=ERROR')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.logs.forEach((log: any) => {
        expect(log.level).toBe('ERROR');
      });
    });

    test('should filter logs by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app)
        .get(`/api/admin/logs?startDate=${today}&endDate=${today}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.logs).toBeInstanceOf(Array);
    });
  });

  describe('Admin Notifications', () => {
    test('should send notification to user', async () => {
      const response = await request(app)
        .post('/api/admin/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: global.__TEST_DATA__.users.student1,
          type: 'SYSTEM_ALERT',
          title: 'Test Notification',
          message: 'This is a test notification from admin'
        })
        .expect(201);

      expect(response.body).toHaveProperty('notificationId');
      expect(response.body.title).toBe('Test Notification');

      // Verify notification was created
      const notification = await prisma.notification.findUnique({
        where: { notificationId: response.body.notificationId }
      });
      expect(notification).toBeTruthy();
    });

    test('should send bulk notifications', async () => {
      const response = await request(app)
        .post('/api/admin/notifications/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [global.__TEST_DATA__.users.student1, global.__TEST_DATA__.users.student2],
          type: 'SYSTEM_ALERT',
          title: 'Bulk Test Notification',
          message: 'This is a bulk test notification'
        })
        .expect(201);

      expect(response.body).toHaveProperty('notificationIds');
      expect(response.body.notificationIds).toBeInstanceOf(Array);
      expect(response.body.notificationIds.length).toBe(2);
    });
  });

  describe('Database Relationships & Constraints', () => {
    test('should enforce foreign key constraints', async () => {
      // Try to create an application with non-existent student
      try {
        await prisma.application.create({
          data: {
            studentId: 'non-existent-id',
            opportunityId: global.__TEST_DATA__.opportunities.opportunity1,
            status: ApplicationStatus.SUBMITTED
          }
        });
        fail('Should have thrown foreign key constraint error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    test('should cascade delete properly', async () => {
      // Create a test user with related data
      const testUser = await prisma.user.create({
        data: {
          email: 'cascade-test@test.com',
          passwordHash: 'hashed-password',
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      });

      const testStudent = await prisma.student.create({
        data: {
          userId: testUser.userId,
          firstName: 'Cascade',
          lastName: 'Test'
        }
      });

      // Create related data
      await prisma.studentMetrics.create({
        data: {
          studentId: testStudent.studentId,
          skillScore: 0.5,
          academicScore: 0.5,
          experienceScore: 0.5,
          preferenceScore: 0.5,
          hireabilityScore: 0.5
        }
      });

      // Delete user - should cascade to student and metrics
      await prisma.user.delete({
        where: { userId: testUser.userId }
      });

      // Verify cascade deletion
      const deletedStudent = await prisma.student.findUnique({
        where: { studentId: testStudent.studentId }
      });
      expect(deletedStudent).toBeNull();

      const deletedMetrics = await prisma.studentMetrics.findUnique({
        where: { studentId: testStudent.studentId }
      });
      expect(deletedMetrics).toBeNull();
    });

    test('should enforce unique constraints', async () => {
      // Try to create duplicate email
      try {
        await prisma.user.create({
          data: {
            email: TEST_USERS.STUDENT1.email, // Duplicate email
            passwordHash: 'hashed-password',
            role: 'STUDENT',
            status: 'ACTIVE'
          }
        });
        fail('Should have thrown unique constraint error');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});