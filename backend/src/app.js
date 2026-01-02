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

    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        course VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create opportunities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        slots INTEGER DEFAULT 1,
        deadline DATE NOT NULL,
        location VARCHAR(255),
        duration_months INTEGER DEFAULT 3,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
        status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected', 'placed')) DEFAULT 'pending',
        cover_letter TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, opportunity_id)
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
    let studentUserId;
    if (studentCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('student123', 10);
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['John Doe', 'student@university.edu', hashedPassword, 'student']
      );
      studentUserId = result.rows[0].id;
    } else {
      studentUserId = studentCheck.rows[0].id;
    }
    
    // Create student profile
    const studentProfileCheck = await pool.query('SELECT id FROM students WHERE user_id = $1', [studentUserId]);
    if (studentProfileCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO students (user_id, registration_number, course, year, phone) VALUES ($1, $2, $3, $4, $5)',
        [studentUserId, 'STU2024001', 'Computer Science', 3, '+1234567890']
      );
    }
    
    // Create company user
    const companyCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['company@techcorp.com']);
    let companyUserId;
    if (companyCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('company123', 10);
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['TechCorp Solutions', 'company@techcorp.com', hashedPassword, 'company']
      );
      companyUserId = result.rows[0].id;
    } else {
      companyUserId = companyCheck.rows[0].id;
    }
    
    // Create company profile
    const companyProfileCheck = await pool.query('SELECT id FROM companies WHERE user_id = $1', [companyUserId]);
    if (companyProfileCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO companies (user_id, company_name, industry, location, description, website) VALUES ($1, $2, $3, $4, $5, $6)',
        [companyUserId, 'TechCorp Solutions', 'Technology', 'San Francisco, CA', 'Leading technology solutions provider', 'https://techcorp.com']
      );
    }
    
    res.json({
      success: true,
      message: 'Complete database setup finished!',
      tables: ['users', 'students', 'companies', 'opportunities', 'applications'],
      accounts: [
        'admin@system.com / admin123',
        'student@university.edu / student123', 
        'company@techcorp.com / company123'
      ],
      note: 'Admin dashboard should now work properly!'
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