/**
 * Create Admin User Script
 * Creates an admin user for the system
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔧 Creating admin user...');

  try {
    const email = 'admin@platform.com';
    const password = 'admin123';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
      include: { admin: true }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Super Admin: ${existingAdmin.admin?.superAdmin}`);
      console.log(`   Status: ${existingAdmin.status}`);
      return existingAdmin;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        admin: {
          create: {
            superAdmin: true
          }
        }
      },
      include: {
        admin: true
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Super Admin: ${adminUser.admin?.superAdmin}`);
    console.log(`   User ID: ${adminUser.userId}`);

    // Create initial system log
    await prisma.systemLog.create({
      data: {
        userId: adminUser.userId,
        level: 'INFO',
        action: 'ADMIN_CREATED',
        details: 'Initial admin user created',
        metadata: { initialSetup: true }
      }
    });

    console.log('✅ Initial system log created');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('\n🎉 Admin creation completed successfully');
      console.log('\nYou can now log in with:');
      console.log('Email: admin@platform.com');
      console.log('Password: admin123');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Admin creation failed:', error);
      process.exit(1);
    });
}

export default createAdmin;