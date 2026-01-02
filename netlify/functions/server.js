const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Import routes
const authRoutes = require('../../backend/src/routes/auth');
const opportunityRoutes = require('../../backend/src/routes/opportunities');
const applicationRoutes = require('../../backend/src/routes/applications');
const adminRoutes = require('../../backend/src/routes/admin');

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

// API Routes
app.use('/auth', authRoutes);
app.use('/opportunities', opportunityRoutes);
app.use('/applications', applicationRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Export the serverless function
exports.handler = serverless(app);