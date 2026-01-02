const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/auth');
const opportunityRoutes = require('./routes/opportunities');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Student Attachment Management System API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: '/auth',
      opportunities: '/opportunities',
      applications: '/applications',
      admin: '/admin',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database initialization endpoint
app.get('/setup', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { Pool } = require('pg');
    
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('student', 'company', 'admin')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create admin user
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@system.com']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['System Administrator', 'admin@system.com', hashedPassword, 'admin']
      );
    }
    
    // Create student user
    const studentCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['student@university.edu']);
    if (studentCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['John Doe', 'student@university.edu', hashedPassword, 'student']
      );
    }
    
    // Create company user
    const companyCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['company@techcorp.com']);
    if (companyCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('company123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['TechCorp Solutions', 'company@techcorp.com', hashedPassword, 'company']
      );
    }
    
    res.json({
      success: true,
      message: 'Database setup complete!',
      accounts: [
        'admin@system.com / admin123',
        'student@university.edu / student123', 
        'company@techcorp.com / company123'
      ]
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/opportunities', opportunityRoutes);
app.use('/applications', applicationRoutes);
app.use('/admin', adminRoutes);

// 404 handler - must come after all routes
app.all('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for serverless functions
module.exports = app;