const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to PostgreSQL without specifying a database
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Don't specify database - connect to default 'postgres' database
  });

  try {
    await client.connect();
    console.log('🔄 Connected to PostgreSQL server...');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database '${process.env.DB_NAME}' created successfully!`);
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists.`);
    }

  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Tips:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check your DB_PASSWORD in .env file');
      console.log('3. Verify your PostgreSQL user credentials');
    }
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;