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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/**
 * Configuration for request size limits
 */
export const SIZE_LIMITS = {
  // JSON body limits
  DEFAULT_JSON: '5mb',
  CHAT_MESSAGE: '100kb',
  TASK_BODY: '50kb',
  NOTE_BODY: '1mb',

  // URL-encoded limits
  URL_ENCODED: '5mb',

  // File upload limits
  SMALL_FILE: 5 * 1024 * 1024,      // 5MB
  MEDIUM_FILE: 20 * 1024 * 1024,    // 20MB
  LARGE_FILE: 50 * 1024 * 1024,     // 50MB
  MAX_FILE: 100 * 1024 * 1024,      // 100MB (absolute maximum)

  // Array and string limits
  MAX_ARRAY_LENGTH: 1000,           // Maximum items in array
  MAX_STRING_LENGTH: 100000,        // 100KB string limit
  MAX_OBJECT_DEPTH: 10,             // Maximum nested object depth

  // Query parameter limits
  MAX_QUERY_PARAMS: 50,
  MAX_QUERY_STRING_LENGTH: 5000
};

/**
 * Parse size string (e.g., '5mb') to bytes
 */
function parseSize(size) {
  if (typeof size === 'number') return size;

  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = String(size).toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const [, value, unit = 'b'] = match;
  return parseFloat(value) * units[unit];
}

/**
 * Validate object depth to prevent deeply nested payload attacks
 */
function validateDepth(obj, maxDepth = SIZE_LIMITS.MAX_OBJECT_DEPTH, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    throw new Error(`Object nesting depth exceeds maximum of ${maxDepth} levels`);
  }

  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        validateDepth(obj[key], maxDepth, currentDepth + 1);
      }
    }
  }
}

/**
 * Validate array length to prevent memory exhaustion
 */
function validateArrays(obj) {
  if (Array.isArray(obj)) {
    if (obj.length > SIZE_LIMITS.MAX_ARRAY_LENGTH) {
      throw new Error(`Array length ${obj.length} exceeds maximum of ${SIZE_LIMITS.MAX_ARRAY_LENGTH}`);
    }
    obj.forEach(item => validateArrays(item));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(value => validateArrays(value));
  }
}

/**
 * Validate string lengths to prevent excessive memory usage
 */
function validateStrings(obj) {
  if (typeof obj === 'string') {
    if (obj.length > SIZE_LIMITS.MAX_STRING_LENGTH) {
      throw new Error(`String length ${obj.length} exceeds maximum of ${SIZE_LIMITS.MAX_STRING_LENGTH} characters`);
    }
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(value => validateStrings(value));
  }
}

/**
 * General request size validator
 */
export const validateRequestSize = (maxSize = SIZE_LIMITS.DEFAULT_JSON) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxBytes = parseSize(maxSize);

    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: `Request body too large. Maximum size: ${maxSize}`,
        current: `${Math.floor(contentLength / 1024)}KB`,
        max: maxSize
      });
    }

    next();
  };
};

/**
 * Validate JSON body structure and size
 */
export const validateJsonBody = (maxSize = SIZE_LIMITS.DEFAULT_JSON) => {
  return (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        // Validate depth
        validateDepth(req.body);

        // Validate arrays
        validateArrays(req.body);

        // Validate strings
        validateStrings(req.body);
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body structure',
        error: error.message
      });
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQueryParams = (req, res, next) => {
  const queryKeys = Object.keys(req.query);
  const queryString = req.url.split('?')[1] || '';

  // Check number of query parameters
  if (queryKeys.length > SIZE_LIMITS.MAX_QUERY_PARAMS) {
    return res.status(400).json({
      success: false,
      message: `Too many query parameters. Maximum ${SIZE_LIMITS.MAX_QUERY_PARAMS} allowed`,
      current: queryKeys.length,
      max: SIZE_LIMITS.MAX_QUERY_PARAMS
    });
  }

  // Check query string length
  if (queryString.length > SIZE_LIMITS.MAX_QUERY_STRING_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Query string too long. Maximum ${SIZE_LIMITS.MAX_QUERY_STRING_LENGTH} characters`,
      current: queryString.length,
      max: SIZE_LIMITS.MAX_QUERY_STRING_LENGTH
    });
  }

  next();
};

/**
 * File upload size validator
 */
export const validateFileSize = (maxSize = SIZE_LIMITS.MEDIUM_FILE) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const contentType = req.get('content-type') || '';

    // Only check for file uploads
    if (contentType.includes('multipart/form-data')) {
      if (contentLength > maxSize) {
        return res.status(413).json({
          success: false,
          message: `File too large. Maximum size: ${Math.floor(maxSize / 1024 / 1024)}MB`,
          current: `${Math.floor(contentLength / 1024 / 1024)}MB`,
          max: `${Math.floor(maxSize / 1024 / 1024)}MB`
        });
      }
    }

    next();
  };
};

/**
 * Chat message size validator
 */
export const validateChatMessage = (req, res, next) => {
  if (req.body && req.body.message) {
    const messageLength = req.body.message.length;
    const maxLength = 10000; // 10,000 characters for chat messages

    if (messageLength > maxLength) {
      return res.status(400).json({
        success: false,
        message: `Message too long. Maximum ${maxLength} characters allowed`,
        current: messageLength,
        max: maxLength
      });
    }
  }

  next();
};

/**
 * Batch operation validator
 */
export const validateBatchOperation = (maxBatchSize = 100) => {
  return (req, res, next) => {
    const batchFields = ['tasks', 'items', 'operations', 'ids', 'batch'];

    for (const field of batchFields) {
      if (req.body[field] && Array.isArray(req.body[field])) {
        if (req.body[field].length > maxBatchSize) {
          return res.status(400).json({
            success: false,
            message: `Batch size too large. Maximum ${maxBatchSize} items allowed`,
            current: req.body[field].length,
            max: maxBatchSize
          });
        }
      }
    }

    next();
  };
};

/**
 * Comprehensive request validator combining all checks
 */
export const comprehensiveValidator = (options = {}) => {
  const {
    maxSize = SIZE_LIMITS.DEFAULT_JSON,
    validateBody = true,
    validateQuery = true,
    validateDepth = true,
    validateArrays = true
  } = options;

  return (req, res, next) => {
    try {
      // Validate content length
      const contentLength = parseInt(req.get('content-length') || '0', 10);
      const maxBytes = parseSize(maxSize);

      if (contentLength > maxBytes) {
        return res.status(413).json({
          success: false,
          message: `Request too large. Maximum size: ${maxSize}`
        });
      }

      // Validate query parameters
      if (validateQuery) {
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length > SIZE_LIMITS.MAX_QUERY_PARAMS) {
          return res.status(400).json({
            success: false,
            message: `Too many query parameters (max: ${SIZE_LIMITS.MAX_QUERY_PARAMS})`
          });
        }
      }

      // Validate body structure
      if (validateBody && req.body && typeof req.body === 'object') {
        if (validateDepth) {
          validateDepth(req.body);
        }
        if (validateArrays) {
          validateArrays(req.body);
        }
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request structure',
        error: error.message
      });
    }
  };
};

/**
 * Monitoring middleware to log large requests
 */
export const monitorRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const warningThreshold = parseSize('3mb');

  if (contentLength > warningThreshold) {
    console.warn(`[REQUEST SIZE WARNING] Large request detected:`, {
      path: req.path,
      method: req.method,
      size: `${Math.floor(contentLength / 1024)}KB`,
      user: req.user ? req.user._id : 'anonymous',
      ip: req.ip
    });
  }

  next();
};
