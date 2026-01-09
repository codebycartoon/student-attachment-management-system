import request from 'supertest';
import { app } from '../src/server';
import { seedTestData, clearTestData, TEST_USERS } from './seed/test-data';
import { prisma } from './setup';

describe('Phase 1: Authentication & User Management', () => {
  beforeAll(async () => {
    await clearTestData();
    await seedTestData();
  });

  afterAll(async () => {
    await clearTestData();
  });

  describe('User Registration', () => {
    test('should register a new student successfully', async () => {
      const newStudent = {
        email: 'newstudent@test.com',
        password: 'password123',
        role: 'STUDENT',
        firstName: 'New',
        lastName: 'Student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newStudent)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newStudent.email);
      expect(response.body.user.role).toBe('STUDENT');
      expect(response.body.user).not.toHaveProperty('passwordHash');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: newStudent.email },
        include: { student: true }
      });

      expect(user).toBeTruthy();
      expect(user?.student).toBeTruthy();
      expect(user?.student?.firstName).toBe(newStudent.firstName);
    });

    test('should register a new company successfully', async () => {
      const newCompany = {
        email: 'newcompany@test.com',
        password: 'password123',
        role: 'COMPANY',
        companyName: 'New Tech Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newCompany)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('COMPANY');

      // Verify company was created
      const user = await prisma.user.findUnique({
        where: { email: newCompany.email },
        include: { company: true }
      });

      expect(user?.company).toBeTruthy();
      expect(user?.company?.companyName).toBe(newCompany.companyName);
    });

    test('should reject registration with duplicate email', async () => {
      const duplicateUser = {
        email: TEST_USERS.STUDENT1.email,
        password: 'password123',
        role: 'STUDENT',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    test('should reject registration with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        role: 'STUDENT',
        firstName: 'Invalid',
        lastName: 'User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    test('should reject registration with weak password', async () => {
      const weakPasswordUser = {
        email: 'weakpass@test.com',
        password: '123',
        role: 'STUDENT',
        firstName: 'Weak',
        lastName: 'Password'
      };

      await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser)
        .expect(400);
    });
  });

  describe('User Login', () => {
    test('should login student with correct credentials', async () => {
      const loginData = {
        email: TEST_USERS.STUDENT1.email,
        password: TEST_USERS.STUDENT1.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.role).toBe('STUDENT');

      // Verify session was created
      const sessions = await prisma.userSession.findMany({
        where: { user: { email: loginData.email } }
      });
      expect(sessions.length).toBeGreaterThan(0);
    });

    test('should login company with correct credentials', async () => {
      const loginData = {
        email: TEST_USERS.COMPANY1.email,
        password: TEST_USERS.COMPANY1.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.role).toBe('COMPANY');
    });

    test('should login admin with correct credentials', async () => {
      const loginData = {
        email: TEST_USERS.ADMIN1.email,
        password: TEST_USERS.ADMIN1.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.role).toBe('ADMIN');
    });

    test('should reject login with incorrect password', async () => {
      const loginData = {
        email: TEST_USERS.STUDENT1.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('Protected Routes & Role-based Access', () => {
    let studentToken: string;
    let companyToken: string;
    let adminToken: string;

    beforeAll(async () => {
      // Get tokens for each role
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

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.ADMIN1.email,
          password: TEST_USERS.ADMIN1.password
        });
      adminToken = adminLogin.body.token;
    });

    test('should allow student access to student routes', async () => {
      await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    test('should allow company access to company routes', async () => {
      await request(app)
        .get('/api/company/profile')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);
    });

    test('should allow admin access to admin routes', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    test('should deny student access to company routes', async () => {
      await request(app)
        .get('/api/company/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    test('should deny company access to student routes', async () => {
      await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });

    test('should deny non-admin access to admin routes', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });

    test('should deny access without token', async () => {
      await request(app)
        .get('/api/student/profile')
        .expect(401);

      await request(app)
        .get('/api/company/profile')
        .expect(401);

      await request(app)
        .get('/api/admin/users')
        .expect(401);
    });

    test('should deny access with invalid token', async () => {
      await request(app)
        .get('/api/student/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Session Management', () => {
    test('should create session on login', async () => {
      const loginData = {
        email: TEST_USERS.STUDENT2.email,
        password: TEST_USERS.STUDENT2.password
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData);

      const sessions = await prisma.userSession.findMany({
        where: { user: { email: loginData.email } }
      });

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0]?.jwtToken).toBeTruthy();
    });

    test('should handle multiple sessions for same user', async () => {
      const loginData = {
        email: TEST_USERS.STUDENT2.email,
        password: TEST_USERS.STUDENT2.password
      };

      // Login multiple times
      await request(app).post('/api/auth/login').send(loginData);
      await request(app).post('/api/auth/login').send(loginData);

      const sessions = await prisma.userSession.findMany({
        where: { user: { email: loginData.email } }
      });

      expect(sessions.length).toBeGreaterThanOrEqual(2);
    });

    test('should logout and invalidate session', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.STUDENT3.email,
          password: TEST_USERS.STUDENT3.password
        });

      const token = loginResponse.body.token;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Try to use the token after logout
      await request(app)
        .get('/api/student/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });

  describe('Password Security', () => {
    test('should hash passwords in database', async () => {
      const user = await prisma.user.findUnique({
        where: { email: TEST_USERS.STUDENT1.email }
      });

      expect(user?.passwordHash).toBeTruthy();
      expect(user?.passwordHash).not.toBe(TEST_USERS.STUDENT1.password);
      expect(user?.passwordHash.length).toBeGreaterThan(50); // bcrypt hash length
    });

    test('should not return password hash in API responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.STUDENT1.email,
          password: TEST_USERS.STUDENT1.password
        });

      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });
});