const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding sample data...');

    // Create sample company user
    const companyPassword = await bcrypt.hash('company123', 12);
    const companyUser = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['TechCorp Solutions', 'company@techcorp.com', companyPassword, 'company']
    );

    // Create company profile
    await client.query(
      'INSERT INTO companies (user_id, company_name, industry, location, description, website) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        companyUser.rows[0].id,
        'TechCorp Solutions',
        'Information Technology',
        'Nairobi, Kenya',
        'Leading software development company specializing in web and mobile applications.',
        'https://techcorp.com'
      ]
    );

    // Create sample student user
    const studentPassword = await bcrypt.hash('student123', 12);
    const studentUser = await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['John Doe', 'student@university.edu', studentPassword, 'student']
    );

    // Create student profile
    await client.query(
      'INSERT INTO students (user_id, registration_number, course, year, phone) VALUES ($1, $2, $3, $4, $5)',
      [
        studentUser.rows[0].id,
        'CS/2021/001',
        'Computer Science',
        3,
        '+254700123456'
      ]
    );

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await client.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['System Administrator', 'admin@system.com', adminPassword, 'admin']
    );

    console.log('✅ Sample data seeded successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👔 Company: company@techcorp.com / company123');
    console.log('👨‍🎓 Student: student@university.edu / student123');
    console.log('🛡️  Admin: admin@system.com / admin123');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;