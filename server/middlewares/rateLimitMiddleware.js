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

   ⟁  PURPOSE      : Prevent API abuse and ensure fair usage

   ⟁  WHY          : System stability and resource protection

   ⟁  WHAT         : Request rate limiting and quota management

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Abuse prevented. Resources protected. Fairness ensured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Large file upload limiter (stricter)
export const largeUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 large uploads per hour
  message: {
    success: false,
    message: 'Too many large file uploads, please try again later.'
  }
});

// Chat message rate limiter
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    success: false,
    message: 'You are sending messages too quickly. Please slow down.'
  }
});

// Workspace creation limiter
export const workspaceCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 workspaces per day
  message: {
    success: false,
    message: 'Workspace creation limit reached. Please try again tomorrow.'
  }
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: {
    success: false,
    message: 'Too many search requests. Please slow down.'
  }
});

// Speed limiter for expensive operations
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 requests per 15 minutes at full speed
  delayMs: (used, req) => {
    // New v2 behavior: calculate incremental delay
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500; // Increases 500ms per request over limit
  },
  maxDelayMs: 5000 // Maximum delay of 5 seconds
});

// Custom rate limiter by user ID (for authenticated routes)
export const createUserLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 30,
    message = 'Too many requests. Please try again later.'
  } = options;

  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?._id?.toString() || req.ip;
    },
    message: {
      success: false,
      message
    }
  });
};

// File size validator middleware
export const validateFileSize = (maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  return (req, res, next) => {
    if (req.file && req.file.size > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        message: `File size exceeds the maximum limit of ${maxSizeMB}MB`
      });
    }

    if (req.files) {
      const oversizedFiles = Object.values(req.files).filter(
        file => file.size > maxSizeBytes
      );

      if (oversizedFiles.length > 0) {
        return res.status(413).json({
          success: false,
          message: `One or more files exceed the maximum limit of ${maxSizeMB}MB`
        });
      }
    }

    next();
  };
};

// File type validator middleware
export const validateFileType = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const checkFile = (file) => {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      const mimeType = file.mimetype;

      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.substring(1);
        }
        return mimeType.startsWith(type);
      });

      return isAllowed;
    };

    if (req.file && !checkFile(req.file)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    if (req.files) {
      const invalidFiles = Object.values(req.files).filter(file => !checkFile(file));

      if (invalidFiles.length > 0) {
        return res.status(400).json({
          success: false,
          message: `One or more files have invalid types. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  };
};

// Workspace-based rate limiter
export const workspaceLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 50,
    action = 'perform this action'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspace;

    if (!workspaceId) {
      return next();
    }

    const key = `${workspaceId}:${req.user?._id}`;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: `Too many attempts to ${action} in this workspace. Please try again later.`
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Clean up old entries
    if (recentRequests.length > max * 2) {
      requests.set(key, recentRequests.slice(-max));
    }

    next();
  };
};

export default {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  largeUploadLimiter,
  chatLimiter,
  workspaceCreationLimiter,
  searchLimiter,
  speedLimiter,
  createUserLimiter,
  validateFileSize,
  validateFileType,
  workspaceLimiter
};
