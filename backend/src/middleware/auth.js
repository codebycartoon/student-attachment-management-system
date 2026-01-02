const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to add company_id and student_id to req.user
const enrichUserData = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const client = await pool.connect();
    
    try {
      if (req.user.role === 'company') {
        const result = await client.query(
          'SELECT id FROM companies WHERE user_id = $1',
          [req.user.id]
        );
        if (result.rows[0]) {
          req.user.company_id = result.rows[0].id;
        }
      } else if (req.user.role === 'student') {
        const result = await client.query(
          'SELECT id FROM students WHERE user_id = $1',
          [req.user.id]
        );
        if (result.rows[0]) {
          req.user.student_id = result.rows[0].id;
        }
      }
    } finally {
      client.release();
    }

    next();
  } catch (error) {
    console.error('Enrich user data error:', error);
    res.status(500).json({
      message: 'Authentication error'
    });
  }
};

// Middleware to check user role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = [authenticateToken, authorizeRole('admin')];

// Middleware to check if user is company
const requireCompany = [authenticateToken, enrichUserData, authorizeRole('company')];

// Middleware to check if user is student
const requireStudent = [authenticateToken, enrichUserData, authorizeRole('student')];

// Middleware to allow multiple roles
const requireStudentOrCompany = [authenticateToken, enrichUserData, authorizeRole('student', 'company')];

// Combined middleware for authenticated requests
const requireAuth = [authenticateToken, enrichUserData];

module.exports = {
  authenticateToken,
  enrichUserData,
  authorizeRole,
  requireAdmin,
  requireCompany,
  requireStudent,
  requireStudentOrCompany,
  requireAuth
};