/**
 * Main Server Entry Point
 * Minimal working Express server with database connection and authentication
 */

import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Ping route
app.get('/ping', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic API info route
app.get('/api/v1/docs', (_req, res) => {
  res.json({
    success: true,
    message: 'Student-Company Matching Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server function
async function start() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Start HTTP server
    const PORT = process.env['PORT'] || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ API docs: http://localhost:${PORT}/api/v1/docs`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

// Start the server
start();

// Export for testing
export default app;