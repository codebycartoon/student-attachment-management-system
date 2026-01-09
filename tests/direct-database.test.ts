import { PrismaClient } from '@prisma/client';

// Direct database test without setup file
describe('Direct Database Test', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres:Qwe@123rty@localhost:5432/matching_platform_test'
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should connect to PostgreSQL database', async () => {
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeTruthy();
      console.log('✅ Database connection successful!');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  });

  test('should have database tables created', async () => {
    try {
      // Check if tables exist by querying them
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `;
      
      console.log('📊 Database tables found:', tables);
      expect(Array.isArray(tables)).toBe(true);
      expect((tables as any[]).length).toBeGreaterThan(0);
    } catch (error) {
      console.error('❌ Table query failed:', error);
      throw error;
    }
  });

  test('should be able to perform basic CRUD operations', async () => {
    try {
      // Test creating a user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      });

      expect(testUser).toBeTruthy();
      expect(testUser.email).toBe('test@example.com');
      console.log('✅ User creation successful:', testUser.userId);

      // Test reading the user
      const foundUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.email).toBe('test@example.com');
      console.log('✅ User retrieval successful');

      // Test updating the user
      const updatedUser = await prisma.user.update({
        where: { userId: testUser.userId },
        data: { status: 'SUSPENDED' }
      });

      expect(updatedUser.status).toBe('SUSPENDED');
      console.log('✅ User update successful');

      // Test deleting the user
      await prisma.user.delete({
        where: { userId: testUser.userId }
      });

      const deletedUser = await prisma.user.findUnique({
        where: { userId: testUser.userId }
      });

      expect(deletedUser).toBeNull();
      console.log('✅ User deletion successful');

    } catch (error) {
      console.error('❌ CRUD operations failed:', error);
      throw error;
    }
  });
});