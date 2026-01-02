const jwt = require('jsonwebtoken');

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
const requireAdmin = authorizeRole('admin');

// Middleware to check if user is company
const requireCompany = authorizeRole('company');

// Middleware to check if user is student
const requireStudent = authorizeRole('student');

// Middleware to allow multiple roles
const requireStudentOrCompany = authorizeRole('student', 'company');

module.exports = {
  authenticateToken,
  authorizeRole,
  requireAdmin,
  requireCompany,
  requireStudent,
  requireStudentOrCompany
};