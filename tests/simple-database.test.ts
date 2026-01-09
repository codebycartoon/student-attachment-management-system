import { PrismaClient } from '@prisma/client';

describe('Database Connection Test', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to database successfully', async () => {
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeTruthy();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  });

  test('should be able to query database tables', async () => {
    try {
      // Test if we can query the users table (should exist after migration)
      const userCount = await prisma.user.count();
      expect(typeof userCount).toBe('number');
      console.log(`✅ Database query successful - User count: ${userCount}`);
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  });
});