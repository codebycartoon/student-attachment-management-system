/**
 * Authentication Service Tests
 * Comprehensive test suite for authentication functionality
 */

import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../src/services/auth.service';
import { prisma } from './setup';
import server from '../src/server';

const app = server.getApp();

describe('Authentication Service', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('User Registration', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      role: 'STUDENT' as const,
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
      expect(response.body.data.user.role).toBe(validRegistrationData.role);
      expect(response.body.data.accessToken).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: validRegistrationData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.role).toBe(validRegistrationData.role);
    });

    it('should create role-specific profile on registration', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Verify student profile was created
      const user = await prisma.user.findUnique({
        where: { email: validRegistrationData.email },
        include: { student: true },
      });
      expect(user?.student).toBeTruthy();
    });

    it('should hash password correctly', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistrationData)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: validRegistrationData.email },
      });

      const isPasswordValid = await bcrypt.compare(
        validRegistrationData.password,
        user!.passwordHash
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegistrationData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate password requirements', async () => {
      const weakPasswordData = {
        ...validRegistrationData,
        password: 'weak',
        confirmPassword: 'weak',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate password confirmation', async () => {
      const mismatchedPasswordData = {
        ...validRegistrationData,
        confirmPassword: 'DifferentPass123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(mismatchedPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('User Login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...loginCredentials,
          confirmPassword: loginCredentials.password,
          role: 'STUDENT',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginCredentials.email);
      expect(response.body.data.accessToken).toBeDefined();

      // Verify JWT token is valid
      const token = response.body.data.accessToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe(loginCredentials.email);
    });

    it('should create session on successful login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginCredentials)
        .expect(200);

      const token = response.body.data.accessToken;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Verify session exists in database
      const session = await prisma.userSession.findUnique({
        where: { sessionId: decoded.sessionId },
      });
      expect(session).toBeTruthy();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: loginCredentials.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: loginCredentials.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: loginCredentials.email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Token Refresh', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get tokens
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'STUDENT',
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
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

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(accessToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Refresh token required');
    });
  });

  describe('Logout', () => {
    let accessToken: string;
    let sessionId: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'STUDENT',
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.data.accessToken;
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
      sessionId = decoded.sessionId;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');

      // Verify session is removed from database
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
      });
      expect(session).toBeNull();
    });

    it('should require authentication for logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });
  });

  describe('Password Change', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'STUDENT',
        });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
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
          email: 'test@example.com',
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

    it('should validate new password requirements', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePass123!',
          newPassword: 'weak',
          confirmPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .send({
          currentPassword: 'SecurePass123!',
          newPassword: 'NewSecurePass456!',
          confirmPassword: 'NewSecurePass456!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Session Management', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'STUDENT',
        });

      userId = registerResponse.body.data.user.userId;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      accessToken = loginResponse.body.data.accessToken;
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

    it('should revoke all other sessions', async () => {
      // Create another session
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });

      const response = await request(app)
        .delete('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('All other sessions revoked');

      // Verify only current session remains
      const sessions = await prisma.userSession.findMany({
        where: { userId },
      });
      expect(sessions.length).toBe(1);
    });
  });
});