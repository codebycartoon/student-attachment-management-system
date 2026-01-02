const { testConnection, initializeTables } = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await testConnection();
    
    // Initialize tables
    await initializeTables();
    
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;