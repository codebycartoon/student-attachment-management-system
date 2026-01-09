import request from 'supertest';
import { app } from '../src/server';
import { seedTestData, clearTestData, TEST_USERS } from './seed/test-data';
import { prisma } from './setup';
import path from 'path';
import fs from 'fs';

describe('Phase 3: Student Dashboard & Profile Management', () => {
  let studentToken: string;
  let student2Token: string;
  let adminToken: string;

  beforeAll(async () => {
    await clearTestData();
    await seedTestData();

    // Get authentication tokens
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.STUDENT1.email,
        password: TEST_USERS.STUDENT1.password
      });
    studentToken = studentLogin.body.token;

    const student2Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.STUDENT2.email,
        password: TEST_USERS.STUDENT2.password
      });
    student2Token = student2Login.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USERS.ADMIN1.email,
        password: TEST_USERS.ADMIN1.password
      });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('Student Profile Management', () => {
    test('should get student profile', async () => {
      const response = await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('skills');
      expect(response.body).toHaveProperty('experiences');
      expect(response.body).toHaveProperty('projects');
    });

    test('should update basic profile information', async () => {
      const updateData = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        phone: '+1-555-9999',
        location: 'New York, NY',
        linkedinUrl: 'https://linkedin.com/in/johnupdated',
        elevatorPitch: 'Updated elevator pitch for testing'
      };

      const response = await request(app)
        .put('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.phone).toBe(updateData.phone);
      expect(response.body.location).toBe(updateData.location);
      expect(response.body.elevatorPitch).toBe(updateData.elevatorPitch);
    });

    test('should update academic profile', async () => {
      const academicData = {
        gpa: 3.9,
        graduationDate: '2024-12-15',
        availabilityStartDate: '2025-01-15',
        willingToRelocate: false,
        remoteAllowed: true
      };

      const response = await request(app)
        .put('/api/student/profile/academic')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(academicData)
        .expect(200);

      expect(response.body.gpa).toBe(academicData.gpa);
      expect(response.body.willingToRelocate).toBe(academicData.willingToRelocate);
      expect(response.body.remoteAllowed).toBe(academicData.remoteAllowed);
    });

    test('should add skills to profile', async () => {
      const skillData = {
        skillId: global.__TEST_DATA__.skills.nodejs,
        proficiency: 4,
        yearsOfExperience: 1.5
      };

      const response = await request(app)
        .post('/api/student/profile/skills')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(skillData)
        .expect(201);

      expect(response.body.proficiency).toBe(skillData.proficiency);
      expect(response.body.yearsOfExperience).toBe(skillData.yearsOfExperience);
    });

    test('should update existing skill', async () => {
      const updateData = {
        proficiency: 5,
        yearsOfExperience: 3
      };

      const response = await request(app)
        .put(`/api/student/profile/skills/${global.__TEST_DATA__.skills.javascript}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.proficiency).toBe(updateData.proficiency);
      expect(response.body.yearsOfExperience).toBe(updateData.yearsOfExperience);
    });

    test('should remove skill from profile', async () => {
      await request(app)
        .delete(`/api/student/profile/skills/${global.__TEST_DATA__.skills.typescript}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      // Verify skill was removed
      const profile = await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      const hasSkill = profile.body.skills.some((s: any) => 
        s.skillId === global.__TEST_DATA__.skills.typescript
      );
      expect(hasSkill).toBe(false);
    });

    test('should add experience', async () => {
      const experienceData = {
        jobTitle: 'Software Developer Intern',
        company: 'Tech Startup Inc',
        startDate: '2023-09-01',
        endDate: '2023-12-31',
        employmentType: 'INTERNSHIP',
        description: 'Worked on full-stack development using React and Node.js',
        technologies: [global.__TEST_DATA__.skills.react, global.__TEST_DATA__.skills.nodejs]
      };

      const response = await request(app)
        .post('/api/student/profile/experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(experienceData)
        .expect(201);

      expect(response.body.jobTitle).toBe(experienceData.jobTitle);
      expect(response.body.company).toBe(experienceData.company);
      expect(response.body.employmentType).toBe(experienceData.employmentType);
    });

    test('should update experience', async () => {
      const experiences = await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      const experienceId = experiences.body.experiences[0].experienceId;

      const updateData = {
        jobTitle: 'Senior Software Developer Intern',
        description: 'Updated description with more responsibilities'
      };

      const response = await request(app)
        .put(`/api/student/profile/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.jobTitle).toBe(updateData.jobTitle);
      expect(response.body.description).toBe(updateData.description);
    });

    test('should add project', async () => {
      const projectData = {
        projectName: 'Task Management App',
        description: 'A full-stack task management application with real-time updates',
        projectType: 'Personal',
        startDate: '2023-05-01',
        endDate: '2023-07-31',
        githubUrl: 'https://github.com/johndoe/task-manager',
        liveUrl: 'https://task-manager-demo.vercel.app',
        technologies: [global.__TEST_DATA__.skills.react, global.__TEST_DATA__.skills.nodejs]
      };

      const response = await request(app)
        .post('/api/student/profile/projects')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.projectName).toBe(projectData.projectName);
      expect(response.body.projectType).toBe(projectData.projectType);
      expect(response.body.githubUrl).toBe(projectData.githubUrl);
    });
  });

  describe('Student Dashboard Overview', () => {
    test('should get dashboard overview', async () => {
      const response = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('applications');
      expect(response.body).toHaveProperty('topOpportunities');
      expect(response.body).toHaveProperty('upcomingInterviews');
      expect(response.body).toHaveProperty('recentActivity');
    });

    test('should display correct hireability score', async () => {
      const response = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.metrics).toHaveProperty('hireabilityScore');
      expect(typeof response.body.metrics.hireabilityScore).toBe('number');
      expect(response.body.metrics.hireabilityScore).toBeGreaterThanOrEqual(0);
      expect(response.body.metrics.hireabilityScore).toBeLessThanOrEqual(1);
    });

    test('should show application statistics', async () => {
      const response = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.applications).toHaveProperty('total');
      expect(response.body.applications).toHaveProperty('submitted');
      expect(response.body.applications).toHaveProperty('inReview');
      expect(response.body.applications).toHaveProperty('accepted');
      expect(response.body.applications).toHaveProperty('rejected');
    });

    test('should show top matched opportunities', async () => {
      const response = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.topOpportunities).toBeInstanceOf(Array);
      expect(response.body.topOpportunities.length).toBeGreaterThan(0);

      // Check that opportunities are sorted by match score
      const opportunities = response.body.topOpportunities;
      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i-1].matchScore).toBeGreaterThanOrEqual(opportunities[i].matchScore);
      }
    });
  });

  describe('Student Match Readiness', () => {
    test('should get match readiness analysis', async () => {
      const response = await request(app)
        .get('/api/student/match-readiness')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overallScore');
      expect(response.body).toHaveProperty('skillAnalysis');
      expect(response.body).toHaveProperty('academicAnalysis');
      expect(response.body).toHaveProperty('experienceAnalysis');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('skillGaps');
    });

    test('should identify skill gaps', async () => {
      const response = await request(app)
        .get('/api/student/match-readiness')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.skillGaps).toBeInstanceOf(Array);
      
      if (response.body.skillGaps.length > 0) {
        response.body.skillGaps.forEach((gap: any) => {
          expect(gap).toHaveProperty('skill');
          expect(gap).toHaveProperty('importance');
          expect(gap).toHaveProperty('currentLevel');
          expect(gap).toHaveProperty('recommendedLevel');
        });
      }
    });

    test('should provide actionable recommendations', async () => {
      const response = await request(app)
        .get('/api/student/match-readiness')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.recommendations).toBeInstanceOf(Array);
      
      response.body.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('priority');
      });
    });
  });

  describe('File Upload & Document Management', () => {
    const createTestFile = (filename: string, content: string) => {
      const testDir = path.join(process.cwd(), 'uploads', 'test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      const filePath = path.join(testDir, filename);
      fs.writeFileSync(filePath, content);
      return filePath;
    };

    test('should upload CV successfully', async () => {
      const testFilePath = createTestFile('test-cv.txt', 'Test CV content with skills: JavaScript, React, Node.js');

      const response = await request(app)
        .post('/api/student/documents/cv')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('cv', testFilePath)
        .expect(200);

      expect(response.body).toHaveProperty('documentId');
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('filePath');
      expect(response.body.documentType).toBe('CV');

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('should upload transcript successfully', async () => {
      const testFilePath = createTestFile('test-transcript.txt', 'Test transcript content with courses and grades');

      const response = await request(app)
        .post('/api/student/documents/transcript')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('transcript', testFilePath)
        .expect(200);

      expect(response.body.documentType).toBe('TRANSCRIPT');

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('should reject invalid file types', async () => {
      const testFilePath = createTestFile('test-invalid.exe', 'Invalid file content');

      await request(app)
        .post('/api/student/documents/cv')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('cv', testFilePath)
        .expect(400);

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('should reject files that are too large', async () => {
      // Create a large file (assuming max size is 5MB)
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const testFilePath = createTestFile('test-large.txt', largeContent);

      await request(app)
        .post('/api/student/documents/cv')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('cv', testFilePath)
        .expect(400);

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('should get uploaded documents', async () => {
      const response = await request(app)
        .get('/api/student/documents')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach((doc: any) => {
          expect(doc).toHaveProperty('documentId');
          expect(doc).toHaveProperty('documentType');
          expect(doc).toHaveProperty('fileName');
          expect(doc).toHaveProperty('uploadedAt');
        });
      }
    });

    test('should delete uploaded document', async () => {
      // First upload a document
      const testFilePath = createTestFile('test-delete.txt', 'Test content for deletion');

      const uploadResponse = await request(app)
        .post('/api/student/documents/cv')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('cv', testFilePath);

      const documentId = uploadResponse.body.documentId;

      // Then delete it
      await request(app)
        .delete(`/api/student/documents/${documentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      // Verify it's deleted
      const documents = await request(app)
        .get('/api/student/documents')
        .set('Authorization', `Bearer ${studentToken}`);

      const deletedDoc = documents.body.find((doc: any) => doc.documentId === documentId);
      expect(deletedDoc).toBeUndefined();

      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });

  describe('Student Metrics & Calculations', () => {
    test('should compute and update student metrics', async () => {
      const response = await request(app)
        .post('/api/student/metrics/compute')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('skillScore');
      expect(response.body).toHaveProperty('academicScore');
      expect(response.body).toHaveProperty('experienceScore');
      expect(response.body).toHaveProperty('preferenceScore');
      expect(response.body).toHaveProperty('hireabilityScore');
      expect(response.body).toHaveProperty('lastComputed');

      // Verify scores are within valid range
      expect(response.body.skillScore).toBeGreaterThanOrEqual(0);
      expect(response.body.skillScore).toBeLessThanOrEqual(1);
      expect(response.body.hireabilityScore).toBeGreaterThanOrEqual(0);
      expect(response.body.hireabilityScore).toBeLessThanOrEqual(1);
    });

    test('should get current metrics', async () => {
      const response = await request(app)
        .get('/api/student/metrics')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('skillScore');
      expect(response.body).toHaveProperty('academicScore');
      expect(response.body).toHaveProperty('experienceScore');
      expect(response.body).toHaveProperty('hireabilityScore');
      expect(response.body).toHaveProperty('lastComputed');
      expect(response.body).toHaveProperty('computeVersion');
    });

    test('should calculate match scores for opportunities', async () => {
      const response = await request(app)
        .get('/api/student/opportunities/matches')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach((match: any) => {
          expect(match).toHaveProperty('opportunity');
          expect(match).toHaveProperty('matchScore');
          expect(match).toHaveProperty('skillMatch');
          expect(match).toHaveProperty('academicFit');
          expect(match).toHaveProperty('experienceMatch');
          expect(match).toHaveProperty('preferenceFit');
          
          expect(match.matchScore).toBeGreaterThanOrEqual(0);
          expect(match.matchScore).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('Student Applications', () => {
    test('should get student applications', async () => {
      const response = await request(app)
        .get('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      
      if (response.body.length > 0) {
        response.body.forEach((app: any) => {
          expect(app).toHaveProperty('applicationId');
          expect(app).toHaveProperty('opportunity');
          expect(app).toHaveProperty('status');
          expect(app).toHaveProperty('appliedAt');
          expect(app).toHaveProperty('matchScore');
        });
      }
    });

    test('should apply to opportunity', async () => {
      const applicationData = {
        opportunityId: global.__TEST_DATA__.opportunities.opportunity2,
        coverLetter: 'I am very interested in this backend developer position...'
      };

      const response = await request(app)
        .post('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData)
        .expect(201);

      expect(response.body).toHaveProperty('applicationId');
      expect(response.body.status).toBe('SUBMITTED');
      expect(response.body.coverLetter).toBe(applicationData.coverLetter);
    });

    test('should not allow duplicate applications', async () => {
      const applicationData = {
        opportunityId: global.__TEST_DATA__.opportunities.opportunity1, // Already applied
        coverLetter: 'Duplicate application attempt'
      };

      await request(app)
        .post('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData)
        .expect(400);
    });

    test('should withdraw application', async () => {
      const applicationId = global.__TEST_DATA__.applications.application1;

      const response = await request(app)
        .patch(`/api/student/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.status).toBe('WITHDRAWN');
    });
  });

  describe('Student Settings', () => {
    test('should get account settings', async () => {
      const response = await request(app)
        .get('/api/student/settings')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('notificationPreferences');
      expect(response.body).toHaveProperty('privacySettings');
    });

    test('should update notification preferences', async () => {
      const preferences = {
        emailNotifications: true,
        applicationUpdates: true,
        opportunityMatches: false,
        interviewReminders: true
      };

      const response = await request(app)
        .put('/api/student/settings/notifications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body.emailNotifications).toBe(preferences.emailNotifications);
      expect(response.body.opportunityMatches).toBe(preferences.opportunityMatches);
    });

    test('should change password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      await request(app)
        .put('/api/student/settings/password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordData)
        .expect(200);

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.STUDENT1.email,
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');

      // Change back to original password for other tests
      await request(app)
        .put('/api/student/settings/password')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          currentPassword: 'newpassword123',
          newPassword: 'password123',
          confirmPassword: 'password123'
        });
    });

    test('should reject password change with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      await request(app)
        .put('/api/student/settings/password')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(passwordData)
        .expect(400);
    });
  });

  describe('Access Control', () => {
    test('should deny access to other student profiles', async () => {
      await request(app)
        .get(`/api/student/${global.__TEST_DATA__.students.student2}/profile`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    test('should allow admin access to student profiles', async () => {
      const response = await request(app)
        .get(`/api/admin/students/${global.__TEST_DATA__.students.student1}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('profile');
    });
  });
});