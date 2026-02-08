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
import rateLimit from 'express-rate-limit';

// ============================================
// CONFIGURATION - Adjust these values as needed
// ============================================

const LIMITS = {
  // Request size limits
  MAX_JSON_SIZE: '5mb',          // Maximum JSON payload size
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB for file uploads
  MAX_URL_ENCODED_SIZE: '5mb',   // Maximum URL-encoded payload size

  // Rate limits per user
  REQUESTS_PER_MINUTE: 200,      // 200 requests per minute per user (increased from 60)
  REQUESTS_PER_HOUR: 5000,       // 5000 requests per hour per user (increased from 1000)
  REQUESTS_PER_DAY: 50000,       // 50,000 requests per day per user (increased from 10000)

  // AI/Task execution limits per user
  AI_CALLS_PER_MINUTE: 10,       // 10 AI calls per minute
  AI_CALLS_PER_HOUR: 100,        // 100 AI calls per hour
  AI_CALLS_PER_DAY: 1000,        // 1000 AI calls per day

  // Specific operation limits
  TASK_CREATES_PER_HOUR: 100,    // 100 task creations per hour
  FILE_UPLOADS_PER_HOUR: 50,     // 50 file uploads per hour
  WORKSPACE_CREATES_PER_DAY: 10, // 10 workspace creations per day

  // Concurrent operation limits
  MAX_CONCURRENT_AI_CALLS: 5,    // Max 5 concurrent AI calls per user
  MAX_CONCURRENT_UPLOADS: 3,     // Max 3 concurrent file uploads per user
};

// ============================================
// IN-MEMORY QUOTA STORAGE
// (Use Redis in production for distributed systems)
// ============================================

class QuotaManager {
  constructor() {
    this.quotas = new Map();
    this.concurrentOps = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  getKey(userId, operation, window) {
    return `${userId}:${operation}:${window}`;
  }

  getQuota(userId, operation, window) {
    const key = this.getKey(userId, operation, window);
    const quota = this.quotas.get(key);

    if (!quota) {
      return { count: 0, resetTime: Date.now() + window };
    }

    // Reset if expired
    if (Date.now() > quota.resetTime) {
      return { count: 0, resetTime: Date.now() + window };
    }

    return quota;
  }

  incrementQuota(userId, operation, window, maxCount) {
    const key = this.getKey(userId, operation, window);
    const quota = this.getQuota(userId, operation, window);

    if (quota.count >= maxCount) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: quota.resetTime
      };
    }

    quota.count++;
    this.quotas.set(key, quota);

    return {
      allowed: true,
      remaining: maxCount - quota.count,
      resetTime: quota.resetTime
    };
  }

  // Track concurrent operations
  startOperation(userId, operation) {
    const key = `${userId}:${operation}:concurrent`;
    const count = this.concurrentOps.get(key) || 0;
    this.concurrentOps.set(key, count + 1);
    return count + 1;
  }

  endOperation(userId, operation) {
    const key = `${userId}:${operation}:concurrent`;
    const count = this.concurrentOps.get(key) || 0;
    if (count > 0) {
      this.concurrentOps.set(key, count - 1);
    }
  }

  getConcurrentCount(userId, operation) {
    const key = `${userId}:${operation}:concurrent`;
    return this.concurrentOps.get(key) || 0;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, quota] of this.quotas.entries()) {
      if (now > quota.resetTime + 60000) { // Remove entries 1 minute after expiry
        this.quotas.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

const quotaManager = new QuotaManager();

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * General API rate limiter - applies to all API endpoints
 */
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: LIMITS.REQUESTS_PER_MINUTE,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID if authenticated, otherwise IP
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

/**
 * Hourly rate limiter
 */
export const hourlyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: LIMITS.REQUESTS_PER_HOUR,
  message: {
    success: false,
    message: 'Hourly request limit exceeded. Please try again later.',
    retryAfter: 3600
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

/**
 * Daily rate limiter
 */
export const dailyRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: LIMITS.REQUESTS_PER_DAY,
  message: {
    success: false,
    message: 'Daily request limit exceeded. Please try again tomorrow.',
    retryAfter: 86400
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

/**
 * AI execution rate limiter - prevents AI call abuse
 */
export const aiExecutionLimiter = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();

  // Check concurrent AI calls
  const concurrent = quotaManager.getConcurrentCount(userId, 'ai');
  if (concurrent >= LIMITS.MAX_CONCURRENT_AI_CALLS) {
    return res.status(429).json({
      success: false,
      message: `Maximum concurrent AI operations limit (${LIMITS.MAX_CONCURRENT_AI_CALLS}) reached. Please wait for current operations to complete.`,
      retryAfter: 5
    });
  }

  // Check per-minute limit
  const minuteQuota = quotaManager.incrementQuota(
    userId,
    'ai',
    60 * 1000,
    LIMITS.AI_CALLS_PER_MINUTE
  );

  if (!minuteQuota.allowed) {
    const resetIn = Math.ceil((minuteQuota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `AI call rate limit exceeded. ${LIMITS.AI_CALLS_PER_MINUTE} calls per minute allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.AI_CALLS_PER_MINUTE,
      remaining: minuteQuota.remaining
    });
  }

  // Check hourly limit
  const hourQuota = quotaManager.incrementQuota(
    userId,
    'ai',
    60 * 60 * 1000,
    LIMITS.AI_CALLS_PER_HOUR
  );

  if (!hourQuota.allowed) {
    const resetIn = Math.ceil((hourQuota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `Hourly AI call limit exceeded. ${LIMITS.AI_CALLS_PER_HOUR} calls per hour allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.AI_CALLS_PER_HOUR,
      remaining: hourQuota.remaining
    });
  }

  // Check daily limit
  const dayQuota = quotaManager.incrementQuota(
    userId,
    'ai',
    24 * 60 * 60 * 1000,
    LIMITS.AI_CALLS_PER_DAY
  );

  if (!dayQuota.allowed) {
    const resetIn = Math.ceil((dayQuota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `Daily AI call limit exceeded. ${LIMITS.AI_CALLS_PER_DAY} calls per day allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.AI_CALLS_PER_DAY,
      remaining: dayQuota.remaining
    });
  }

  // Track concurrent operation
  quotaManager.startOperation(userId, 'ai');

  // Add cleanup on response finish
  res.on('finish', () => {
    quotaManager.endOperation(userId, 'ai');
  });

  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit-Minute': LIMITS.AI_CALLS_PER_MINUTE,
    'X-RateLimit-Remaining-Minute': minuteQuota.remaining,
    'X-RateLimit-Limit-Hour': LIMITS.AI_CALLS_PER_HOUR,
    'X-RateLimit-Remaining-Hour': hourQuota.remaining,
    'X-RateLimit-Limit-Day': LIMITS.AI_CALLS_PER_DAY,
    'X-RateLimit-Remaining-Day': dayQuota.remaining
  });

  next();
};

/**
 * Task creation rate limiter
 */
export const taskCreationLimiter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();
  const quota = quotaManager.incrementQuota(
    userId,
    'task_create',
    60 * 60 * 1000, // 1 hour
    LIMITS.TASK_CREATES_PER_HOUR
  );

  if (!quota.allowed) {
    const resetIn = Math.ceil((quota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `Task creation limit exceeded. ${LIMITS.TASK_CREATES_PER_HOUR} tasks per hour allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.TASK_CREATES_PER_HOUR,
      remaining: quota.remaining
    });
  }

  res.set({
    'X-RateLimit-Limit': LIMITS.TASK_CREATES_PER_HOUR,
    'X-RateLimit-Remaining': quota.remaining
  });

  next();
};

/**
 * File upload rate limiter with concurrent upload tracking
 */
export const fileUploadLimiter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();

  // Check concurrent uploads
  const concurrent = quotaManager.getConcurrentCount(userId, 'upload');
  if (concurrent >= LIMITS.MAX_CONCURRENT_UPLOADS) {
    return res.status(429).json({
      success: false,
      message: `Maximum concurrent upload limit (${LIMITS.MAX_CONCURRENT_UPLOADS}) reached. Please wait for current uploads to complete.`,
      retryAfter: 10
    });
  }

  // Check hourly upload limit
  const quota = quotaManager.incrementQuota(
    userId,
    'upload',
    60 * 60 * 1000, // 1 hour
    LIMITS.FILE_UPLOADS_PER_HOUR
  );

  if (!quota.allowed) {
    const resetIn = Math.ceil((quota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `File upload limit exceeded. ${LIMITS.FILE_UPLOADS_PER_HOUR} uploads per hour allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.FILE_UPLOADS_PER_HOUR,
      remaining: quota.remaining
    });
  }

  // Track concurrent operation
  quotaManager.startOperation(userId, 'upload');

  // Add cleanup on response finish
  res.on('finish', () => {
    quotaManager.endOperation(userId, 'upload');
  });

  res.set({
    'X-RateLimit-Limit': LIMITS.FILE_UPLOADS_PER_HOUR,
    'X-RateLimit-Remaining': quota.remaining
  });

  next();
};

/**
 * Workspace creation rate limiter
 */
export const workspaceCreationLimiter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();
  const quota = quotaManager.incrementQuota(
    userId,
    'workspace_create',
    24 * 60 * 60 * 1000, // 24 hours
    LIMITS.WORKSPACE_CREATES_PER_DAY
  );

  if (!quota.allowed) {
    const resetIn = Math.ceil((quota.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      message: `Workspace creation limit exceeded. ${LIMITS.WORKSPACE_CREATES_PER_DAY} workspaces per day allowed.`,
      retryAfter: resetIn,
      limit: LIMITS.WORKSPACE_CREATES_PER_DAY,
      remaining: quota.remaining
    });
  }

  res.set({
    'X-RateLimit-Limit': LIMITS.WORKSPACE_CREATES_PER_DAY,
    'X-RateLimit-Remaining': quota.remaining
  });

  next();
};

/**
 * Request size validator middleware
 */
export const requestSizeValidator = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const contentType = req.get('content-type') || '';

  // Check for JSON payloads
  if (contentType.includes('application/json')) {
    const maxSize = parseInt(LIMITS.MAX_JSON_SIZE) * 1024 * 1024; // Convert to bytes
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: `Request payload too large. Maximum size: ${LIMITS.MAX_JSON_SIZE}`,
        maxSize: LIMITS.MAX_JSON_SIZE
      });
    }
  }

  // Check for file uploads
  if (contentType.includes('multipart/form-data')) {
    if (contentLength > LIMITS.MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size: ${Math.floor(LIMITS.MAX_FILE_SIZE / 1024 / 1024)}MB`,
        maxSize: `${Math.floor(LIMITS.MAX_FILE_SIZE / 1024 / 1024)}MB`
      });
    }
  }

  next();
};

/**
 * Get user quota information
 */
export const getUserQuota = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();
  const now = Date.now();

  const quotas = {
    ai: {
      minute: quotaManager.getQuota(userId, 'ai', 60 * 1000),
      hour: quotaManager.getQuota(userId, 'ai', 60 * 60 * 1000),
      day: quotaManager.getQuota(userId, 'ai', 24 * 60 * 60 * 1000),
      concurrent: quotaManager.getConcurrentCount(userId, 'ai'),
      limits: {
        minute: LIMITS.AI_CALLS_PER_MINUTE,
        hour: LIMITS.AI_CALLS_PER_HOUR,
        day: LIMITS.AI_CALLS_PER_DAY,
        concurrent: LIMITS.MAX_CONCURRENT_AI_CALLS
      }
    },
    tasks: {
      hour: quotaManager.getQuota(userId, 'task_create', 60 * 60 * 1000),
      limit: LIMITS.TASK_CREATES_PER_HOUR
    },
    uploads: {
      hour: quotaManager.getQuota(userId, 'upload', 60 * 60 * 1000),
      concurrent: quotaManager.getConcurrentCount(userId, 'upload'),
      limits: {
        hour: LIMITS.FILE_UPLOADS_PER_HOUR,
        concurrent: LIMITS.MAX_CONCURRENT_UPLOADS
      }
    },
    workspaces: {
      day: quotaManager.getQuota(userId, 'workspace_create', 24 * 60 * 60 * 1000),
      limit: LIMITS.WORKSPACE_CREATES_PER_DAY
    }
  };

  res.json({
    success: true,
    quotas
  });
};

// Export quota manager for testing and monitoring
export { quotaManager, LIMITS };
