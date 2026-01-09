/**
 * Main Server Entry Point
 * Minimal working Express server with database connection and authentication
 */

import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { matchingQueueService } from './services/matching-queue.service';
import { webSocketService } from './services/websocket.service';
import { eventSystemService } from './services/event-system.service';

// Import routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import studentProfileRoutes from './routes/student-profile.routes';
import studentDashboardRoutes from './routes/student-dashboard.routes';
import studentSettingsRoutes from './routes/student-settings.routes';
import referenceDataRoutes from './routes/reference-data.routes';
import documentUploadRoutes from './routes/document-upload.routes';
import matchingEngineRoutes from './routes/matching-engine.routes';
import companyDashboardRoutes from './routes/company-dashboard.routes';
import adminDashboardRoutes from './routes/admin-dashboard.routes';
import adminRoutes from './routes/admin.routes';
import interviewRoutes from './routes/interview.routes';
import placementRoutes from './routes/placement.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import exportRoutes from './routes/export.routes';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
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
app.use('/api/student', studentProfileRoutes);
app.use('/api/student', studentDashboardRoutes);
app.use('/api/student', studentSettingsRoutes);
app.use('/api/student', documentUploadRoutes);
app.use('/api/reference', referenceDataRoutes);
app.use('/api/v1/matching', matchingEngineRoutes);
app.use('/api/company', companyDashboardRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

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

    // Start matching queue processor
    matchingQueueService.startQueueProcessor();
    console.log('✅ Matching queue processor started');

    // Start event system queue processor
    eventSystemService.startQueueProcessor();
    console.log('✅ Event system queue processor started');

    // Start HTTP server
    const PORT = process.env['PORT'] || 3000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ API docs: http://localhost:${PORT}/api/v1/docs`);
      
      // Initialize WebSocket service after server starts
      try {
        webSocketService.initialize(server);
        console.log('✅ WebSocket service initialized');
      } catch (wsError) {
        console.warn('⚠️ WebSocket initialization failed:', wsError);
      }
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  // Stop matching queue processor
  matchingQueueService.stopQueueProcessor();
  console.log('✅ Matching queue processor stopped');
  
  // Stop event system queue processor
  eventSystemService.stopQueueProcessor();
  console.log('✅ Event system queue processor stopped');
  
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
  process.exit(0);
});

// Start the server
start();

// Export for testing
export default app;