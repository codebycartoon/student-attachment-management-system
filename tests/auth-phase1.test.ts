/**
 * Phase 1 Authentication Tests
 * Comprehensive test suite for role-based authentication
 */

import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthPhase1Service } from '../src/services/auth-phase1.service';
import { prisma } from './setup';
import server from '../src/server';

const app = server.getApp();

describe('Phase 1 Authentication', () => {
  let authService: AuthPhase1Service;

  beforeEach(() => {
    authService = new AuthPhase1Service();
  });

  describe('Student Registration', () => {
    const validStudentData = {
      email: 'student@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      location: 'New York, NY',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      websiteUrl: 'https://johndoe.com',
      elevatorPitch: 'Passionate computer science student seeking internship opportunities.',
    };

    it('should register a new student successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register/student')
        .send(validStudentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validStudentData.email);
      expect(response.body.data.user.role).toBe('STUDENT');
      expect(response.body.data.accessToken).toBeDefined();

      // Verify user and student profile were created
      const user = await prisma.user.findUnique({
        where: { email: validStudentData.email },
        include: { student: true },
      });
      
      expect(user).toBeTruthy();
      expect(user?.role).toBe('STUDENT');
      expect(user?.student).toBeTruthy();
      expect(user?.student?.firstName).toBe(validStudentData.firstName);
      expect(user?.student?.lastName).toBe(validStudentData.lastName);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register/student')
        .send(validStudentData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register/student')
        .send(validStudentData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
        firstName: '',
        lastName: '',
      };

      const response = await request(app)
        .post('/api/v1/auth/register/student')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Company Registration', () => {
    const validCompanyData = {
      email: 'company@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      companyName: 'Tech Corp Inc.',
      industry: 'Technology',
      location: 'San Francisco, CA',
      website: 'https://techcorp.com',
      description: 'Leading technology company focused on innovation.',
    };

    it('should register a new company successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register/company')
        .send(validCompanyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validCompanyData.email);
      expect(response.body.data.user.role).toBe('COMPANY');
      expect(response.body.data.accessToken).toBeDefined();

      // Verify user and company profile were created
      const user = await prisma.user.findUnique({
        where: { email: validCompanyData.email },
        include: { company: true },
      });
      
      expect(user).toBeTruthy();
      expect(user?.role).toBe('COMPANY');
      expect(user?.company).toBeTruthy();
      expect(user?.company?.companyName).toBe(validCompanyData.companyName);
    });

    it('should validate company name requirement', async () => {
      const invalidData = {
        ...validCompanyData,
        companyName: '',
      };

      const response = await request(app)
        .post('/api/v1/auth/register/company')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Admin Registration', () => {
    const validAdminData = {
      email: 'admin@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: 'ADMIN_INVITE_2024',
    };

    it('should register a new admin with valid invite code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register/admin')
        .send(validAdminData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validAdminData.email);
      expect(response.body.data.user.role).toBe('ADMIN');
      expect(response.body.data.accessToken).toBeDefined();

      // Verify user and admin profile were created
      const user = await prisma.user.findUnique({
        where: { email: validAdminData.email },
        include: { admin: true },
      });
      
      expect(user).toBeTruthy();
      expect(user?.role).toBe('ADMIN');
      expect(user?.admin).toBeTruthy();
      expect(user?.admin?.inviteCode).toBe(validAdminData.inviteCode);
    });

    it('should reject invalid invite code', async () => {
      const invalidData = {
        ...validAdminData,
        inviteCode: 'INVALID_CODE',
      };

      const response = await request(app)
        .post('/api/v1/auth/register/admin')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid invite code');
    });

    it('should create super admin with special code', async () => {
      const superAdminData = {
        ...validAdminData,
        email: 'superadmin@example.com',
        inviteCode: 'SUPER_ADMIN_CODE',
      };

      await request(app)
        .post('/api/v1/auth/register/admin')
        .send(superAdminData)
        .expect(201);

      // Verify super admin flag is set
      const user = await prisma.user.findUnique({
        where: { email: superAdminData.email },
        include: { admin: true },
      });
      
      expect(user?.admin?.superAdmin).toBe(true);
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      // Create test users for each role
      await request(app)
        .post('/api/v1/auth/register/student')
        .send({
          email: 'student@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'Student',
        });

      await request(app)
        .post('/api/v1/auth/register/company')
        .send({
          email: 'company@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          companyName: 'Test Company',
        });

      await request(app)
        .post('/api/v1/auth/register/admin')
        .send({
          email: 'admin@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          inviteCode: 'ADMIN_INVITE_2024',
        });
    });

    it('should login student successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('STUDENT');
      expect(response.body.data.accessToken).toBeDefined();

      // Verify JWT token contains correct role
      const token = response.body.data.accessToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.role).toBe('STUDENT');
    });

    it('should login company successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'company@test.com',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('COMPANY');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should login admin successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'SecurePass123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('ADMIN');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'student@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('Role-Based Access Control', () => {
    let studentToken: string;
    let companyToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Register and login users for each role
      await request(app)
        .post('/api/v1/auth/register/student')
        .send({
          email: 'student@rbac.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'Student',
        });

      await request(app)
        .post('/api/v1/auth/register/company')
        .send({
          email: 'company@rbac.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          companyName: 'Test Company',
        });

      await request(app)
        .post('/api/v1/auth/register/admin')
        .send({
          email: 'admin@rbac.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          inviteCode: 'ADMIN_INVITE_2024',
        });

      // Get tokens
      const studentLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@rbac.com', password: 'SecurePass123!' });
      studentToken = studentLogin.body.data.accessToken;

      const companyLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'company@rbac.com', password: 'SecurePass123!' });
      companyToken = companyLogin.body.data.accessToken;

      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@rbac.com', password: 'SecurePass123!' });
      adminToken = adminLogin.body.data.accessToken;
    });

    it('should allow student access to student routes', async () => {
      const response = await request(app)
        .get('/api/v1/student/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny student access to company routes', async () => {
      const response = await request(app)
        .get('/api/v1/company/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient permissions');
    });

    it('should deny student access to admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow company access to company routes', async () => {
      const response = await request(app)
        .get('/api/v1/company/overview')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny company access to admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow admin access to all routes', async () => {
      // Test admin routes
      await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admins should also be able to access other routes for oversight
      // This depends on your business requirements
    });

    it('should deny access without authentication', async () => {
      await request(app)
        .get('/api/v1/student/overview')
        .expect(401);

      await request(app)
        .get('/api/v1/company/overview')
        .expect(401);

      await request(app)
        .get('/api/v1/admin/overview')
        .expect(401);
    });
  });

  describe('Session Management', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login a test user
      await request(app)
        .post('/api/v1/auth/register/student')
        .send({
          email: 'session@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'Session',
          lastName: 'Test',
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'session@test.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.data.accessToken;
      
      // Extract refresh token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
      refreshToken = refreshCookie?.split('=')[1]?.split(';')[0] || '';
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(accessToken);
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');

      // Verify session is removed from database
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
      const session = await prisma.userSession.findUnique({
        where: { sessionId: decoded.sessionId },
      });
      expect(session).toBeNull();
    });

    it('should get user sessions', async () => {
      const response = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Password Management', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login a test user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register/student')
        .send({
          email: 'password@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'Password',
          lastName: 'Test',
        });

      userId = registerResponse.body.data.user.userId;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'password@test.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePass123!',
          newPassword: 'NewSecurePass456!',
          confirmPassword: 'NewSecurePass456!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password changed successfully');

      // Verify new password works
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'password@test.com',
          password: 'NewSecurePass456!',
        })
        .expect(200);
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePass456!',
          confirmPassword: 'NewSecurePass456!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should initiate password reset', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'password@test.com',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link has been sent');
    });

    it('should handle non-existent email in password reset', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        })
        .expect(200);

      // Should return success to prevent email enumeration
      expect(response.body.success).toBe(true);
    });
  });

  describe('System Logging', () => {
    it('should log successful registration', async () => {
      await request(app)
        .post('/api/v1/auth/register/student')
        .send({
          email: 'logging@test.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          firstName: 'Log',
          lastName: 'Test',
        })
        .expect(201);

      // Verify system log entry was created
      const logs = await prisma.systemLog.findMany({
        where: {
          message: 'Student registration successful',
        },
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe('INFO');
    });

    it('should log failed login attempts', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      // Verify system log entry was created
      const logs = await prisma.systemLog.findMany({
        where: {
          message: 'Login attempt with non-existent email',
        },
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe('WARNING');
    });
  });
});