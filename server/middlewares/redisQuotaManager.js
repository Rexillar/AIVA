/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : MIDDLEWARE

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import Redis from 'ioredis';

/**
 * Redis-based quota manager for production use
 * Supports distributed rate limiting across multiple server instances
 */
export class RedisQuotaManager {
  constructor(redisConfig = {}) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      ...redisConfig
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis for quota management');
    });
  }

  /**
   * Generate Redis key for quota tracking
   */
  getKey(userId, operation, window) {
    const windowName = this.getWindowName(window);
    return `quota:${userId}:${operation}:${windowName}`;
  }

  /**
   * Get window name for Redis key
   */
  getWindowName(windowMs) {
    if (windowMs <= 60 * 1000) return 'minute';
    if (windowMs <= 60 * 60 * 1000) return 'hour';
    if (windowMs <= 24 * 60 * 60 * 1000) return 'day';
    return 'custom';
  }

  /**
   * Get current quota for a user
   */
  async getQuota(userId, operation, windowMs) {
    const key = this.getKey(userId, operation, windowMs);

    try {
      const [count, ttl] = await Promise.all([
        this.redis.get(key),
        this.redis.ttl(key)
      ]);

      const currentCount = parseInt(count || '0', 10);
      const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + windowMs;

      return {
        count: currentCount,
        resetTime
      };
    } catch (error) {
      console.error('Error getting quota from Redis:', error);
      // Fallback to allow operation on Redis error
      return {
        count: 0,
        resetTime: Date.now() + windowMs
      };
    }
  }

  /**
   * Increment quota and check if operation is allowed
   */
  async incrementQuota(userId, operation, windowMs, maxCount) {
    const key = this.getKey(userId, operation, windowMs);
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, windowSeconds);
      pipeline.ttl(key);

      const results = await pipeline.exec();

      if (!results || results.some(([err]) => err)) {
        throw new Error('Redis pipeline execution failed');
      }

      const newCount = results[0][1];
      const ttl = results[2][1];
      const resetTime = Date.now() + (ttl * 1000);

      if (newCount > maxCount) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          current: newCount
        };
      }

      return {
        allowed: true,
        remaining: maxCount - newCount,
        resetTime,
        current: newCount
      };
    } catch (error) {
      console.error('Error incrementing quota in Redis:', error);
      // Fail open (allow operation) on Redis error - adjust based on your security needs
      return {
        allowed: true,
        remaining: maxCount,
        resetTime: Date.now() + windowMs,
        error: true
      };
    }
  }

  /**
   * Track concurrent operations
   */
  async startOperation(userId, operation, maxConcurrent = 10) {
    const key = `concurrent:${userId}:${operation}`;

    try {
      const current = await this.redis.incr(key);

      // Set expiry if this is the first operation
      if (current === 1) {
        await this.redis.expire(key, 300); // 5 minutes timeout
      }

      if (current > maxConcurrent) {
        // Decrement back since we exceeded limit
        await this.redis.decr(key);
        return {
          allowed: false,
          current: current - 1,
          max: maxConcurrent
        };
      }

      return {
        allowed: true,
        current,
        max: maxConcurrent
      };
    } catch (error) {
      console.error('Error tracking concurrent operation in Redis:', error);
      return {
        allowed: true,
        current: 0,
        max: maxConcurrent,
        error: true
      };
    }
  }

  /**
   * End concurrent operation
   */
  async endOperation(userId, operation) {
    const key = `concurrent:${userId}:${operation}`;

    try {
      const current = await this.redis.decr(key);

      // Clean up if count reaches 0
      if (current <= 0) {
        await this.redis.del(key);
      }

      return current;
    } catch (error) {
      console.error('Error ending concurrent operation in Redis:', error);
      return 0;
    }
  }

  /**
   * Get concurrent operation count
   */
  async getConcurrentCount(userId, operation) {
    const key = `concurrent:${userId}:${operation}`;

    try {
      const count = await this.redis.get(key);
      return parseInt(count || '0', 10);
    } catch (error) {
      console.error('Error getting concurrent count from Redis:', error);
      return 0;
    }
  }

  /**
   * Reset quota for a user
   */
  async resetQuota(userId, operation, window) {
    const key = this.getKey(userId, operation, window);

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Error resetting quota in Redis:', error);
      return false;
    }
  }

  /**
   * Reset all quotas for a user
   */
  async resetAllQuotas(userId) {
    try {
      const keys = await this.redis.keys(`quota:${userId}:*`);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      return keys.length;
    } catch (error) {
      console.error('Error resetting all quotas in Redis:', error);
      return 0;
    }
  }

  /**
   * Get all quota information for a user
   */
  async getUserQuotas(userId, operations) {
    const quotas = {};

    try {
      for (const { operation, windows } of operations) {
        quotas[operation] = {};

        for (const { name, windowMs, limit } of windows) {
          const quota = await this.getQuota(userId, operation, windowMs);
          quotas[operation][name] = {
            ...quota,
            limit,
            remaining: Math.max(0, limit - quota.count)
          };
        }
      }

      return quotas;
    } catch (error) {
      console.error('Error getting user quotas from Redis:', error);
      return {};
    }
  }

  /**
   * Implement sliding window rate limiting (more accurate than fixed window)
   */
  async incrementSlidingWindow(userId, operation, windowMs, maxCount) {
    const key = `sliding:${userId}:${operation}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries
      await this.redis.zremrangebyscore(key, '-inf', windowStart);

      // Count current entries in window
      const count = await this.redis.zcard(key);

      if (count >= maxCount) {
        const ttl = await this.redis.ttl(key);
        const resetTime = Date.now() + (ttl * 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          current: count
        };
      }

      // Add new entry
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiry
      await this.redis.expire(key, Math.ceil(windowMs / 1000));

      return {
        allowed: true,
        remaining: maxCount - count - 1,
        resetTime: now + windowMs,
        current: count + 1
      };
    } catch (error) {
      console.error('Error in sliding window rate limit:', error);
      return {
        allowed: true,
        remaining: maxCount,
        resetTime: Date.now() + windowMs,
        error: true
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const info = await this.redis.info();
      const dbsize = await this.redis.dbsize();

      return {
        connected: true,
        dbsize,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) acc[key.trim()] = value.trim();
          return acc;
        }, {})
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup and close connection
   */
  async close() {
    try {
      await this.redis.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

/**
 * Factory function to create quota manager based on environment
 */
export async function createQuotaManager(useRedis = false) {
  if (useRedis || process.env.USE_REDIS_QUOTA === 'true') {
    console.log('🔴 Using Redis-based quota management');
    return new RedisQuotaManager();
  } else {
    console.log('💾 Using in-memory quota management');
    // Return the in-memory manager from advancedRateLimitMiddleware.js
    const { quotaManager } = await import('./advancedRateLimitMiddleware.js');
    return quotaManager;
  }
}

export default RedisQuotaManager;
