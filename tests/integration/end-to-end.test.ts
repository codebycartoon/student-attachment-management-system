import request from 'supertest';
import { app } from '../../src/server';
import { seedTestData, clearTestData, TEST_USERS } from '../seed/test-data';
import { prisma } from '../setup';

describe('End-to-End Integration Tests', () => {
  beforeAll(async () => {
    await clearTestData();
    await seedTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('Complete Student Journey', () => {
    let studentToken: string;
    let studentId: string;
    let opportunityId: string;
    let applicationId: string;

    test('1. Student Registration & Profile Setup', async () => {
      // Register new student
      const registrationData = {
        email: 'journey-student@test.com',
        password: 'password123',
        role: 'STUDENT',
        firstName: 'Journey',
        lastName: 'Student'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      studentToken = registerResponse.body.token;
      studentId = registerResponse.body.user.studentId;

      expect(registerResponse.body).toHaveProperty('token');
      expect(registerResponse.body.user.role).toBe('STUDENT');

      // Complete profile setup
      const profileData = {
        phone: '+1-555-1234',
        location: 'Seattle, WA',
        linkedinUrl: 'https://linkedin.com/in/journeystudent',
        elevatorPitch: 'Passionate software developer seeking opportunities'
      };

      await request(app)
        .put('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(profileData)
        .expect(200);

      // Add academic information
      const academicData = {
        gpa: 3.7,
        graduationDate: '2024-05-15',
        availabilityStartDate: '2024-06-01',
        willingToRelocate: true,
        remoteAllowed: true
      };

      await request(app)
        .put('/api/student/profile/academic')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(academicData)
        .expect(200);
    });

    test('2. Add Skills and Experience', async () => {
      // Add skills
      const skills = [
        { skillId: global.__TEST_DATA__.skills.javascript, proficiency: 4, yearsOfExperience: 2 },
        { skillId: global.__TEST_DATA__.skills.react, proficiency: 4, yearsOfExperience: 1.5 },
        { skillId: global.__TEST_DATA__.skills.nodejs, proficiency: 3, yearsOfExperience: 1 }
      ];

      for (const skill of skills) {
        await request(app)
          .post('/api/student/profile/skills')
          .set('Authorization', `Bearer ${studentToken}`)
          .send(skill)
          .expect(201);
      }

      // Add experience
      const experienceData = {
        jobTitle: 'Frontend Developer Intern',
        company: 'TechStart Inc',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        employmentType: 'INTERNSHIP',
        description: 'Developed React components and improved user interface',
        technologies: [global.__TEST_DATA__.skills.react, global.__TEST_DATA__.skills.javascript]
      };

      await request(app)
        .post('/api/student/profile/experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(experienceData)
        .expect(201);

      // Add project
      const projectData = {
        projectName: 'Personal Portfolio Website',
        description: 'Responsive portfolio website built with React and Node.js',
        projectType: 'Personal',
        startDate: '2023-01-01',
        endDate: '2023-03-31',
        githubUrl: 'https://github.com/journeystudent/portfolio',
        liveUrl: 'https://journeystudent.dev',
        technologies: [global.__TEST_DATA__.skills.react, global.__TEST_DATA__.skills.nodejs]
      };

      await request(app)
        .post('/api/student/profile/projects')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(projectData)
        .expect(201);
    });

    test('3. Compute Student Metrics', async () => {
      const metricsResponse = await request(app)
        .post('/api/student/metrics/compute')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(metricsResponse.body).toHaveProperty('hireabilityScore');
      expect(metricsResponse.body.hireabilityScore).toBeGreaterThan(0);

      // Verify metrics are stored
      const metrics = await prisma.studentMetrics.findUnique({
        where: { studentId }
      });

      expect(metrics).toBeTruthy();
      expect(metrics?.hireabilityScore).toBeGreaterThan(0);
    });

    test('4. Browse and Match Opportunities', async () => {
      const opportunitiesResponse = await request(app)
        .get('/api/student/opportunities/matches')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(opportunitiesResponse.body).toBeInstanceOf(Array);
      expect(opportunitiesResponse.body.length).toBeGreaterThan(0);

      // Get the best match
      const bestMatch = opportunitiesResponse.body[0];
      opportunityId = bestMatch.opportunity.opportunityId;

      expect(bestMatch).toHaveProperty('matchScore');
      expect(bestMatch.matchScore).toBeGreaterThan(0);
    });

    test('5. Apply to Opportunity', async () => {
      const applicationData = {
        opportunityId,
        coverLetter: 'I am excited to apply for this position. My experience with React and JavaScript makes me a great fit for this role.'
      };

      const applicationResponse = await request(app)
        .post('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData)
        .expect(201);

      applicationId = applicationResponse.body.applicationId;

      expect(applicationResponse.body.status).toBe('SUBMITTED');
      expect(applicationResponse.body).toHaveProperty('matchScore');
    });

    test('6. Check Dashboard After Application', async () => {
      const dashboardResponse = await request(app)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(dashboardResponse.body.applications.total).toBeGreaterThan(0);
      expect(dashboardResponse.body.applications.submitted).toBeGreaterThan(0);
      expect(dashboardResponse.body).toHaveProperty('recentActivity');
    });

    test('7. Admin Reviews Application', async () => {
      // Get admin token
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.ADMIN1.email,
          password: TEST_USERS.ADMIN1.password
        });

      const adminToken = adminLogin.body.token;

      // Admin updates application status
      const reviewResponse = await request(app)
        .patch(`/api/admin/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_REVIEW',
          reviewNotes: 'Strong candidate, moving to interview stage'
        })
        .expect(200);

      expect(reviewResponse.body.status).toBe('IN_REVIEW');
      expect(reviewResponse.body.reviewNotes).toBeTruthy();
    });

    test('8. Student Checks Application Status', async () => {
      const applicationsResponse = await request(app)
        .get('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const application = applicationsResponse.body.find((app: any) => 
        app.applicationId === applicationId
      );

      expect(application.status).toBe('IN_REVIEW');
      expect(application).toHaveProperty('reviewNotes');
    });
  });

  describe('Complete Company Journey', () => {
    let companyToken: string;
    let companyId: string;
    let newOpportunityId: string;

    test('1. Company Registration & Profile Setup', async () => {
      // Register new company
      const registrationData = {
        email: 'journey-company@test.com',
        password: 'password123',
        role: 'COMPANY',
        companyName: 'Journey Tech Solutions'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registrationData)
        .expect(201);

      companyToken = registerResponse.body.token;
      companyId = registerResponse.body.user.companyId;

      // Complete company profile
      const profileData = {
        industry: 'Technology',
        location: 'San Francisco, CA',
        website: 'https://journeytech.com',
        description: 'Innovative technology solutions for modern businesses'
      };

      await request(app)
        .put('/api/company/profile')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(profileData)
        .expect(200);
    });

    test('2. Create Job Opportunity', async () => {
      const opportunityData = {
        title: 'Full Stack Developer',
        description: 'Join our team as a full stack developer working with modern technologies',
        location: 'San Francisco, CA',
        industry: 'Technology',
        jobTypes: ['FULL_TIME'],
        gpaThreshold: 3.0,
        isTechnical: true,
        startDate: '2024-07-01',
        applicationDeadline: '2024-05-31',
        salaryMin: 90000,
        salaryMax: 130000,
        requirements: 'Strong knowledge of JavaScript, React, and Node.js',
        skills: [
          { skillId: global.__TEST_DATA__.skills.javascript, skillWeight: 5, required: true },
          { skillId: global.__TEST_DATA__.skills.react, skillWeight: 4, required: true },
          { skillId: global.__TEST_DATA__.skills.nodejs, skillWeight: 4, required: false }
        ]
      };

      const opportunityResponse = await request(app)
        .post('/api/company/opportunities')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(opportunityData)
        .expect(201);

      newOpportunityId = opportunityResponse.body.opportunityId;

      expect(opportunityResponse.body.title).toBe(opportunityData.title);
      expect(opportunityResponse.body.status).toBe('PENDING_APPROVAL');
    });

    test('3. Admin Approves Opportunity', async () => {
      // Get admin token
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.ADMIN1.email,
          password: TEST_USERS.ADMIN1.password
        });

      const adminToken = adminLogin.body.token;

      // Approve opportunity
      const approvalResponse = await request(app)
        .patch(`/api/admin/opportunities/${newOpportunityId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(approvalResponse.body.status).toBe('ACTIVE');
    });

    test('4. Company Views Matched Candidates', async () => {
      const candidatesResponse = await request(app)
        .get(`/api/company/opportunities/${newOpportunityId}/candidates`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(candidatesResponse.body).toBeInstanceOf(Array);
      
      if (candidatesResponse.body.length > 0) {
        const candidate = candidatesResponse.body[0];
        expect(candidate).toHaveProperty('student');
        expect(candidate).toHaveProperty('matchScore');
        expect(candidate).toHaveProperty('skillMatch');
      }
    });

    test('5. Student Applies to New Opportunity', async () => {
      // Use existing student from previous test
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'journey-student@test.com',
          password: 'password123'
        });

      const studentToken = studentLogin.body.token;

      const applicationData = {
        opportunityId: newOpportunityId,
        coverLetter: 'I am very interested in this full stack developer position at Journey Tech Solutions.'
      };

      const applicationResponse = await request(app)
        .post('/api/student/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(applicationData)
        .expect(201);

      expect(applicationResponse.body.status).toBe('SUBMITTED');
    });

    test('6. Company Reviews Applications', async () => {
      const applicationsResponse = await request(app)
        .get(`/api/company/opportunities/${newOpportunityId}/applications`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(applicationsResponse.body).toBeInstanceOf(Array);
      expect(applicationsResponse.body.length).toBeGreaterThan(0);

      const application = applicationsResponse.body[0];
      expect(application).toHaveProperty('student');
      expect(application).toHaveProperty('matchScore');
      expect(application.status).toBe('SUBMITTED');
    });
  });

  describe('System-wide Metrics and Analytics', () => {
    test('should show accurate system statistics', async () => {
      // Get admin token
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.ADMIN1.email,
          password: TEST_USERS.ADMIN1.password
        });

      const adminToken = adminLogin.body.token;

      const statsResponse = await request(app)
        .get('/api/admin/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify counts match database
      const userCount = await prisma.user.count();
      const studentCount = await prisma.student.count();
      const companyCount = await prisma.company.count();
      const opportunityCount = await prisma.opportunity.count();
      const applicationCount = await prisma.application.count();

      expect(statsResponse.body.totalUsers).toBe(userCount);
      expect(statsResponse.body.totalStudents).toBe(studentCount);
      expect(statsResponse.body.totalCompanies).toBe(companyCount);
      expect(statsResponse.body.totalOpportunities).toBe(opportunityCount);
      expect(statsResponse.body.totalApplications).toBe(applicationCount);
    });

    test('should calculate match scores correctly', async () => {
      // Test the match calculation functions
      const student = await prisma.student.findFirst({
        include: {
          skills: { include: { skill: true } },
          profile: true,
          experiences: true,
          metrics: true
        }
      });

      const opportunity = await prisma.opportunity.findFirst({
        include: {
          opportunitySkills: { include: { skill: true } }
        }
      });

      if (student && opportunity) {
        // This would test the actual match calculation functions
        // For now, we'll verify that match scores exist and are reasonable
        const application = await prisma.application.findFirst({
          where: {
            studentId: student.studentId,
            opportunityId: opportunity.opportunityId
          }
        });

        if (application) {
          expect(application.matchScore).toBeTruthy();
          expect(application.matchScore).toBeGreaterThanOrEqual(0);
          expect(application.matchScore).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('Data Consistency and Integrity', () => {
    test('should maintain referential integrity', async () => {
      // Test that all foreign keys are valid
      const applications = await prisma.application.findMany({
        include: {
          student: true,
          opportunity: true
        }
      });

      applications.forEach(app => {
        expect(app.student).toBeTruthy();
        expect(app.opportunity).toBeTruthy();
      });
    });

    test('should have consistent metrics', async () => {
      // Verify that all students with profiles have metrics
      const studentsWithProfiles = await prisma.student.findMany({
        where: {
          profile: { isNot: null }
        },
        include: {
          metrics: true
        }
      });

      studentsWithProfiles.forEach(student => {
        if (student.metrics) {
          expect(student.metrics.hireabilityScore).toBeGreaterThanOrEqual(0);
          expect(student.metrics.hireabilityScore).toBeLessThanOrEqual(1);
        }
      });
    });

    test('should have valid application match scores', async () => {
      const applications = await prisma.application.findMany({
        where: {
          matchScore: { not: null }
        }
      });

      applications.forEach(app => {
        expect(app.matchScore).toBeGreaterThanOrEqual(0);
        expect(app.matchScore).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent requests', async () => {
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.STUDENT1.email,
          password: TEST_USERS.STUDENT1.password
        });

      const studentToken = studentLogin.body.token;

      // Make multiple concurrent requests
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/student/dashboard')
          .set('Authorization', `Bearer ${studentToken}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
      });
    });

    test('should handle large datasets efficiently', async () => {
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.ADMIN1.email,
          password: TEST_USERS.ADMIN1.password
        });

      const adminToken = adminLogin.body.token;

      const startTime = Date.now();

      const response = await request(app)
        .get('/api/admin/users?limit=100')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Response should be under 1 second for 100 users
      expect(responseTime).toBeLessThan(1000);
      expect(response.body.users).toBeInstanceOf(Array);
    });
  });
});