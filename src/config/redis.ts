/**
 * Redis Configuration and Connection Management
 * Enterprise-grade Redis setup for caching, sessions, and job queues
 */

import Redis from 'redis';
import { logger } from './logger';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Singleton Redis client manager
class RedisManager {
  private static instance: RedisManager;
  private client: Redis.RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = Redis.createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        connectTimeout: redisConfig.connectTimeout,
        commandTimeout: redisConfig.commandTimeout,
        keepAlive: redisConfig.keepAlive,
      },
      password: redisConfig.password,
      database: redisConfig.db,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client connected and ready');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis client error', { error: error.message });
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis client connection ended');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  public async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        logger.info('Redis connection established');
      }
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  public getClient(): Redis.RedisClientType {
    return this.client;
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Health check for Redis connection
   */
  public async healthCheck(): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await this.client.ping();
      const responseTime = Date.now() - startTime;

      return {
        connected: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown Redis error';

      return {
        connected: false,
        responseTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Get Redis server info and statistics
   */
  public async getStats(): Promise<{
    memory: { used: number; peak: number };
    clients: { connected: number; blocked: number };
    keyspace: { keys: number; expires: number };
    uptime: number;
  }> {
    try {
      const info = await this.client.info();
      const lines = info.split('\r\n');
      const stats: any = {};

      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      });

      return {
        memory: {
          used: parseInt(stats.used_memory || '0'),
          peak: parseInt(stats.used_memory_peak || '0'),
        },
        clients: {
          connected: parseInt(stats.connected_clients || '0'),
          blocked: parseInt(stats.blocked_clients || '0'),
        },
        keyspace: {
          keys: parseInt(stats.db0?.split(',')[0]?.split('=')[1] || '0'),
          expires: parseInt(stats.db0?.split(',')[1]?.split('=')[1] || '0'),
        },
        uptime: parseInt(stats.uptime_in_seconds || '0'),
      };
    } catch (error) {
      logger.error('Failed to get Redis statistics', { error });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis connection closed gracefully');
      }
    } catch (error) {
      logger.error('Error closing Redis connection', { error });
      throw error;
    }
  }
}

// Cache service for application-level caching
export class CacheService {
  private redis: Redis.RedisClientType;
  private defaultTTL: number = 3600; // 1 hour

  constructor(redisClient: Redis.RedisClientType) {
    this.redis = redisClient;
  }

  /**
   * Set cache value with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      
      await this.redis.setEx(key, expiration, serializedValue);
      
      logger.debug('Cache set', { key, ttl: expiration });
    } catch (error) {
      logger.error('Cache set error', { key, error });
      throw error;
    }
  }

  /**
   * Get cache value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      
      if (!value) {
        logger.debug('Cache miss', { key });
        return null;
      }

      logger.debug('Cache hit', { key });
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Cache deleted', { key });
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Set cache with pattern-based expiration
   */
  async setWithPattern(pattern: string, key: string, value: any, ttl?: number): Promise<void> {
    const fullKey = `${pattern}:${key}`;
    await this.set(fullKey, value, ttl);
  }

  /**
   * Get cache with pattern
   */
  async getWithPattern<T>(pattern: string, key: string): Promise<T | null> {
    const fullKey = `${pattern}:${key}`;
    return this.get<T>(fullKey);
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`${pattern}:*`);
      if (keys.length > 0) {
        await this.redis.del(keys);
        logger.debug('Cache pattern deleted', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Cache pattern delete error', { pattern, error });
      throw error;
    }
  }

  /**
   * Increment counter with expiration
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await this.redis.incr(key);
      
      if (value === 1 && ttl) {
        await this.redis.expire(key, ttl);
      }
      
      return value;
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      throw error;
    }
  }
}

// Session service for user session management
export class SessionService {
  private redis: Redis.RedisClientType;
  private sessionTTL: number = 86400; // 24 hours

  constructor(redisClient: Redis.RedisClientType) {
    this.redis = redisClient;
  }

  /**
   * Store user session
   */
  async setSession(sessionId: string, sessionData: any): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      const serializedData = JSON.stringify(sessionData);
      
      await this.redis.setEx(key, this.sessionTTL, serializedData);
      
      logger.debug('Session stored', { sessionId });
    } catch (error) {
      logger.error('Session store error', { sessionId, error });
      throw error;
    }
  }

  /**
   * Get user session
   */
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const sessionData = await this.redis.get(key);
      
      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      logger.error('Session get error', { sessionId, error });
      return null;
    }
  }

  /**
   * Delete user session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.del(key);
      
      logger.debug('Session deleted', { sessionId });
    } catch (error) {
      logger.error('Session delete error', { sessionId, error });
      throw error;
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.expire(key, this.sessionTTL);
      
      logger.debug('Session extended', { sessionId });
    } catch (error) {
      logger.error('Session extend error', { sessionId, error });
      throw error;
    }
  }
}

// Export instances
export const redisManager = RedisManager.getInstance();
export const redis = redisManager.getClient();

// Initialize cache and session services
export let cacheService: CacheService;
export let sessionService: SessionService;

// Initialize services after Redis connection
export const initializeRedisServices = async (): Promise<void> => {
  await redisManager.connect();
  cacheService = new CacheService(redis);
  sessionService = new SessionService(redis);
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing Redis connection...');
  await redisManager.disconnect();
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing Redis connection...');
  await redisManager.disconnect();
});

export default redisManager;