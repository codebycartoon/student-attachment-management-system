import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Global test setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL'] || 'postgresql://test_user:test_password@localhost:5432/matching_platform_test'
    }
  }
});

// Global test variables
declare global {
  var __PRISMA__: PrismaClient;
  var __TEST_DATA__: any;
}

global.__PRISMA__ = prisma;
global.__TEST_DATA__ = {};

beforeAll(async () => {
  // Ensure test database exists and is migrated
  try {
    // Reset database schema
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: process.env['DATABASE_URL'] },
      stdio: 'inherit'
    });

    // Run migrations
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env['DATABASE_URL'] },
      stdio: 'inherit'
    });

    // Generate Prisma client
    execSync('npx prisma generate', {
      stdio: 'inherit'
    });

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }

  // Create test upload directory
  const testUploadDir = path.join(process.cwd(), 'uploads', 'test');
  if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, { recursive: true });
  }
});

afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Close database connection
  await prisma.$disconnect();

  // Clean up test files
  const testUploadDir = path.join(process.cwd(), 'uploads', 'test');
  if (fs.existsSync(testUploadDir)) {
    fs.rmSync(testUploadDir, { recursive: true, force: true });
  }

  console.log('✅ Test cleanup complete');
});

// Helper function to clean up test data
export async function cleanupTestData() {
  const deleteOrder = [
    'student_documents',
    'student_metrics',
    'project_technologies',
    'projects',
    'experience_technologies',
    'experiences',
    'student_preferences',
    'student_courses',
    'student_skills',
    'student_profiles',
    'placements',
    'interviews',
    'applications',
    'opportunity_skills',
    'opportunities',
    'company_users',
    'company_profiles',
    'notifications',
    'system_logs',
    'queues',
    'user_sessions',
    'students',
    'companies',
    'admins',
    'users',
    'preferences',
    'skills',
    'courses',
    'majors',
    'degrees',
    'universities'
  ];

  for (const table of deleteOrder) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    } catch (error) {
      // Table might not exist or be empty, continue
      console.warn(`Warning: Could not clean table ${table}:`, error);
    }
  }
}

// Helper function to reset sequences
export async function resetSequences() {
  const tables = [
    'users', 'students', 'companies', 'admins', 'opportunities', 
    'applications', 'skills', 'courses', 'universities', 'degrees', 'majors'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
    } catch (error) {
      // Sequence might not exist, continue
    }
  }
}

export { prisma };