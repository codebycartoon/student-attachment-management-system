const { pool, initializeTables } = require('../config/database');

async function deploymentInit() {
  console.log('🚀 Starting deployment initialization...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
    // Initialize tables
    console.log('🏗️ Initializing database tables...');
    await initializeTables();
    
    // Seed admin user if not exists
    console.log('👤 Creating admin user...');
    const adminClient = await pool.connect();
    
    try {
      // Check if admin exists
      const adminCheck = await adminClient.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@system.com']
      );
      
      if (adminCheck.rows.length === 0) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await adminClient.query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
          ['System Administrator', 'admin@system.com', hashedPassword, 'admin']
        );
        
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } finally {
      adminClient.release();
    }
    
    console.log('🎉 Deployment initialization completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Deployment initialization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  deploymentInit();
}

module.exports = deploymentInit;