/**
 * Health Check Routes
 * System health monitoring and status endpoints
 */

import { Router } from 'express';
import { Request, Response } from 'express';
import { dbManager } from '../config/database';
import { redisManager } from '../config/redis';
import { logger } from '../config/logger';
import { ApiResponse } from '../types/phase1';

const router = Router();

/**
 * Basic health check
 * GET /api/v1/health/ping
 */
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0-phase1',
  } as ApiResponse);
});

/**
 * Comprehensive health check
 * GET /api/v1/health/status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check database health
    const dbHealth = await dbManager.healthCheck();
    
    // Check Redis health (optional in Phase 1)
    let redisHealth = { connected: false, responseTime: 0 };
    try {
      redisHealth = await redisManager.healthCheck();
    } catch (error) {
      logger.warn('Redis health check failed', { error });
    }

    // Get system metrics
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const totalTime = Date.now() - startTime;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0-phase1',
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(uptime),
      responseTime: totalTime,
      services: {
        database: {
          status: dbHealth.connected ? 'healthy' : 'unhealthy',
          responseTime: dbHealth.responseTime,
          error: dbHealth.error,
        },
        redis: {
          status: redisHealth.connected ? 'healthy' : 'unavailable',
          responseTime: redisHealth.responseTime,
        },
        api: {
          status: 'healthy',
          responseTime: totalTime,
        },
      },
      system: {
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024), // MB
        },
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    // Determine overall health status
    const isHealthy = dbHealth.connected;
    const statusCode = isHealthy ? 200 : 503;
    
    if (!isHealthy) {
      healthStatus.status = 'unhealthy';
    }

    res.status(statusCode).json({
      success: isHealthy,
      data: healthStatus,
    } as ApiResponse);

  } catch (error) {
    logger.error('Health check error', { error });
    
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    } as ApiResponse);
  }
});

/**
 * Database-specific health check
 * GET /api/v1/health/database
 */
router.get('/database', async (req: Request, res: Response) => {
  try {
    const dbHealth = await dbManager.healthCheck();
    const dbStats = await dbManager.getStats();

    res.status(dbHealth.connected ? 200 : 503).json({
      success: dbHealth.connected,
      data: {
        ...dbHealth,
        stats: dbStats,
      },
    } as ApiResponse);

  } catch (error) {
    logger.error('Database health check error', { error });
    
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
});

/**
 * System metrics endpoint
 * GET /api/v1/health/metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    res.status(200).json({
      success: true,
      data: metrics,
    } as ApiResponse);

  } catch (error) {
    logger.error('Metrics endpoint error', { error });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve metrics',
    } as ApiResponse);
  }
});

export default router;