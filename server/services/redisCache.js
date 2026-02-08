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
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import Redis from 'ioredis';

// Redis client configuration
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  })
  : null;

// Fallback to in-memory cache if Redis unavailable
const memoryCache = new Map();

// Cache TTL configurations
export const TTL_CONFIG = {
  CONTEXT: 30 * 60, // 30 minutes
  SESSION: 60 * 60, // 1 hour
  ANALYTICS: 10 * 60, // 10 minutes
  CONVERSATION: 24 * 60 * 60 // 24 hours
};

/**
 * Get from cache
 */
export const getCache = async (key, namespace = 'default') => {
  const fullKey = `${namespace}:${key}`;

  try {
    if (redisClient) {
      const data = await redisClient.get(fullKey);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryCache.get(fullKey) || null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set cache with TTL
 */
export const setCache = async (key, value, ttl = TTL_CONFIG.CONTEXT, namespace = 'default') => {
  const fullKey = `${namespace}:${key}`;

  try {
    const serialized = JSON.stringify(value);

    if (redisClient) {
      await redisClient.setex(fullKey, ttl, serialized);
    } else {
      memoryCache.set(fullKey, value);
      // Simulate TTL in memory
      setTimeout(() => memoryCache.delete(fullKey), ttl * 1000);
    }

    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete from cache
 */
export const deleteCache = async (key, namespace = 'default') => {
  const fullKey = `${namespace}:${key}`;

  try {
    if (redisClient) {
      await redisClient.del(fullKey);
    } else {
      memoryCache.delete(fullKey);
    }
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * Clear namespace
 */
export const clearNamespace = async (namespace) => {
  try {
    if (redisClient) {
      const keys = await redisClient.keys(`${namespace}:*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } else {
      for (const key of memoryCache.keys()) {
        if (key.startsWith(`${namespace}:`)) {
          memoryCache.delete(key);
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = () => {
  return redisClient !== null && redisClient.status === 'ready';
};

export default {
  getCache,
  setCache,
  deleteCache,
  clearNamespace,
  isRedisAvailable,
  TTL_CONFIG
};