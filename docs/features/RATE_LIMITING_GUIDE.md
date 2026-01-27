# Rate Limiting and Quota Management System

## Overview

This document describes the comprehensive rate limiting, request size validation, and quota management system implemented to prevent self-DoS and abuse of the AIVA API.

## Features Implemented

### 1. **Multi-Layer Rate Limiting**
- **Per-Minute Limits**: 60 requests per minute per user
- **Per-Hour Limits**: 1000 requests per hour per user  
- **Per-Day Limits**: 10,000 requests per day per user

### 2. **AI Execution Caps**
Prevents unbounded AI API calls:
- **Per-Minute**: 10 AI calls
- **Per-Hour**: 100 AI calls
- **Per-Day**: 1000 AI calls
- **Concurrent**: Max 5 simultaneous AI operations per user

### 3. **Request Size Limits**
- **JSON Payload**: 5MB maximum (reduced from 10MB)
- **File Uploads**: 50MB maximum
- **Chat Messages**: 10,000 characters maximum
- **Query Strings**: 5000 characters maximum
- **Query Parameters**: 50 parameters maximum
- **Array Length**: 1000 items maximum
- **Object Depth**: 10 levels maximum
- **String Length**: 100KB maximum

### 4. **Operation-Specific Limits**
- **Task Creation**: 100 per hour
- **File Uploads**: 50 per hour (max 3 concurrent)
- **Workspace Creation**: 10 per day
- **Batch Operations**: 100 items maximum

## Architecture

### Middleware Stack

```
Request → Global Rate Limit → Hourly Rate Limit → Daily Rate Limit 
       → Query Validation → Body Validation → Size Monitoring
       → Route-Specific Limiters → Controller
```

### Components

#### 1. **advancedRateLimitMiddleware.js**
Core rate limiting and quota management:
- In-memory quota tracking (default)
- Concurrent operation tracking
- User-based quota management
- Multiple time window support

**Key Exports:**
- `globalRateLimit` - Per-minute rate limiter
- `hourlyRateLimit` - Per-hour rate limiter
- `dailyRateLimit` - Per-day rate limiter
- `aiExecutionLimiter` - AI-specific rate limiter
- `taskCreationLimiter` - Task creation limiter
- `fileUploadLimiter` - File upload limiter
- `workspaceCreationLimiter` - Workspace creation limiter
- `getUserQuota` - Get user quota information

#### 2. **requestSizeMiddleware.js**
Request size validation and sanitization:
- Content-Length validation
- JSON body structure validation
- Query parameter validation
- File size validation
- Batch operation validation
- Large request monitoring

**Key Exports:**
- `validateRequestSize(maxSize)` - General size validator
- `validateJsonBody(maxSize)` - JSON structure validator
- `validateQueryParams` - Query parameter validator
- `validateFileSize(maxSize)` - File size validator
- `validateChatMessage` - Chat message validator
- `validateBatchOperation(maxSize)` - Batch validator
- `monitorRequestSize` - Large request monitor

#### 3. **redisQuotaManager.js**
Redis-based quota management for production:
- Distributed rate limiting
- Redis-backed storage
- Sliding window algorithm
- Better scalability for multi-instance deployments

**Usage:**
Set environment variable: `USE_REDIS_QUOTA=true`

## Configuration

### Environment Variables

```bash
# Redis Configuration (optional, for production)
USE_REDIS_QUOTA=true          # Enable Redis-based quota management
REDIS_HOST=localhost           # Redis host
REDIS_PORT=6379               # Redis port
REDIS_PASSWORD=your_password   # Redis password (if required)
REDIS_DB=0                    # Redis database number
```

### Adjusting Limits

Edit limits in [advancedRateLimitMiddleware.js](../server/middlewares/advancedRateLimitMiddleware.js):

```javascript
const LIMITS = {
  // Request size limits
  MAX_JSON_SIZE: '5mb',
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  
  // Rate limits
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
  REQUESTS_PER_DAY: 10000,
  
  // AI limits
  AI_CALLS_PER_MINUTE: 10,
  AI_CALLS_PER_HOUR: 100,
  AI_CALLS_PER_DAY: 1000,
  
  // Concurrent limits
  MAX_CONCURRENT_AI_CALLS: 5,
  MAX_CONCURRENT_UPLOADS: 3,
};
```

## API Endpoints

### Quota Monitoring

#### GET `/api/quotas/current`
Get current user's quota information.

**Response:**
```json
{
  "success": true,
  "quotas": {
    "ai": {
      "minute": { "count": 5, "resetTime": 1704976800000 },
      "hour": { "count": 45, "resetTime": 1704980400000 },
      "day": { "count": 230, "resetTime": 1705063200000 },
      "concurrent": 2,
      "limits": {
        "minute": 10,
        "hour": 100,
        "day": 1000,
        "concurrent": 5
      }
    },
    "tasks": { ... },
    "uploads": { ... },
    "workspaces": { ... }
  }
}
```

#### GET `/api/quotas/status`
Get comprehensive quota status.

#### GET `/api/quotas/health`
Health check for quota system.

## Response Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit-Minute: 10
X-RateLimit-Remaining-Minute: 7
X-RateLimit-Limit-Hour: 100
X-RateLimit-Remaining-Hour: 85
X-RateLimit-Limit-Day: 1000
X-RateLimit-Remaining-Day: 945
```

## Error Responses

### 429 Too Many Requests

```json
{
  "success": false,
  "message": "AI call rate limit exceeded. 10 calls per minute allowed.",
  "retryAfter": 45,
  "limit": 10,
  "remaining": 0
}
```

### 413 Payload Too Large

```json
{
  "success": false,
  "message": "Request payload too large. Maximum size: 5mb",
  "current": "8192KB",
  "max": "5mb"
}
```

### 400 Invalid Request

```json
{
  "success": false,
  "message": "Invalid request body structure",
  "error": "Object nesting depth exceeds maximum of 10 levels"
}
```

## Route Protection

### Protected Routes

All routes automatically protected by global rate limiting:
- `/api/*` - All API routes

### AI-Protected Routes
These routes have additional AI execution limits:
- `POST /api/chat/enhanced`
- `POST /api/chat/voice`
- `POST /api/chat/message`
- `POST /api/chat/:workspaceId/messages`
- `GET /api/chat/daily-summary`

### Upload-Protected Routes
These routes have upload-specific limits:
- `POST /api/uploads`
- `POST /api/workspaces/:workspaceId/uploads`
- `POST /api/workspaces/:workspaceId/task/:taskId/uploads`

### Task-Protected Routes
These routes have task creation limits:
- `POST /api/tasks`

### Workspace-Protected Routes
These routes have workspace creation limits:
- `POST /api/workspaces`

## Usage Examples

### Client-Side Quota Checking

```javascript
// Check current quota before making AI call
async function checkQuotaBeforeAICall() {
  const response = await fetch('/api/quotas/current', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { quotas } = await response.json();
  
  if (quotas.ai.minute.remaining === 0) {
    const resetIn = quotas.ai.minute.resetTime - Date.now();
    console.log(`Rate limit reached. Reset in ${resetIn}ms`);
    return false;
  }
  
  return true;
}

// Make AI call with retry on rate limit
async function makeAICallWithRetry(message) {
  try {
    const response = await fetch('/api/chat/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, workspaceId })
    });
    
    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = data.retryAfter * 1000;
      console.log(`Rate limited. Retrying in ${retryAfter}ms`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return makeAICallWithRetry(message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('AI call failed:', error);
    throw error;
  }
}
```

### Server-Side Usage

```javascript
import { aiExecutionLimiter } from './middlewares/advancedRateLimitMiddleware.js';
import { validateChatMessage } from './middlewares/requestSizeMiddleware.js';

// Apply to route
router.post('/custom-ai-endpoint', 
  protect,                    // Authentication
  aiExecutionLimiter,         // AI rate limiting
  validateChatMessage,        // Message size validation
  myController               // Your controller
);
```

## Monitoring

### Logs

Large requests are automatically logged:
```
[REQUEST SIZE WARNING] Large request detected: {
  path: '/api/chat/enhanced',
  method: 'POST',
  size: '4096KB',
  user: '507f1f77bcf86cd799439011',
  ip: '192.168.1.1'
}
```

### Metrics

Monitor quota usage through the `/api/quotas/status` endpoint.

## Production Deployment

### Using Redis (Recommended)

1. Install Redis:
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
```

2. Start Redis:
```bash
redis-server
```

3. Configure environment:
```bash
USE_REDIS_QUOTA=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. The system will automatically use Redis for quota management.

### Load Balancing

When using multiple server instances behind a load balancer:
- **Must use Redis** for consistent rate limiting across instances
- In-memory quota management will not work correctly

## Testing

### Manual Testing

```bash
# Test rate limit
for i in {1..70}; do
  curl -H "Authorization: Bearer $TOKEN" \
       http://localhost:8081/api/quotas/current
done

# Test AI rate limit
for i in {1..15}; do
  curl -X POST \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"message":"test","workspaceId":"abc"}' \
       http://localhost:8081/api/chat/enhanced
done

# Test request size limit
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"'$(python3 -c "print('x'*100000)")'"...}' \
     http://localhost:8081/api/chat/message
```

## Migration Guide

### Existing Deployments

The new middleware is backward compatible. To migrate:

1. Update server dependencies (already installed)
2. Restart the server
3. Monitor logs for any issues
4. (Optional) Switch to Redis for production

No database changes required.

## Troubleshooting

### Issue: Rate limits too strict

**Solution:** Adjust limits in `advancedRateLimitMiddleware.js`

### Issue: Legitimate requests blocked

**Solution:** 
- Check quota status: `GET /api/quotas/current`
- Review logs for patterns
- Adjust specific limits as needed

### Issue: Redis connection errors

**Solution:**
- Verify Redis is running: `redis-cli ping`
- Check Redis configuration in environment variables
- System falls back to in-memory if Redis fails

### Issue: Memory usage growing

**Solution:**
- In-memory manager includes automatic cleanup
- Switch to Redis for better memory management
- Adjust cleanup interval if needed

## Security Considerations

1. **Rate limit bypass**: User authentication required for all quota tracking
2. **IP spoofing**: Uses authenticated user ID, not just IP
3. **Concurrent abuse**: Tracked separately from rate limits
4. **Payload bombs**: Multiple validation layers prevent
5. **Resource exhaustion**: Limits on all resource-intensive operations

## Performance Impact

- **In-memory**: ~0.1ms overhead per request
- **Redis**: ~1-2ms overhead per request
- **Negligible impact** on overall response time
- **Memory usage**: ~10KB per active user (in-memory)

## Future Enhancements

- [ ] Per-user custom limits (premium users)
- [ ] Adaptive rate limiting based on load
- [ ] Real-time monitoring dashboard
- [ ] Webhook notifications on quota exceeded
- [ ] GraphQL query complexity limiting
- [ ] Token bucket algorithm option

## Support

For issues or questions:
- Check logs: `/var/log/aiva/server.log`
- Monitor endpoint: `/api/quotas/health`
- Review quota: `/api/quotas/current`

---

**Last Updated:** January 10, 2026  
**Version:** 1.0.0  
**Author:** Mohitraj Jadeja
