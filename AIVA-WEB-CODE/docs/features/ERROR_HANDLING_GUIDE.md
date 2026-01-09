/*=================================================================
 * Project: AIVA-WEB
 * File: ERROR_HANDLING_GUIDE.md
 * Author: AI Enhancement Module
 * Date Created: January 9, 2026
 *=================================================================
 * Description:
 * Guide for handling API errors and service unavailability
 *=================================================================*/

# API Error Handling & Resilience Guide

## 🛡️ Implemented Features

### 1. **Circuit Breaker Pattern**
Prevents cascading failures by stopping requests after repeated failures.

**States:**
- `CLOSED` → Normal operation
- `OPEN` → Service unavailable, stop sending requests
- `HALF_OPEN` → Testing if service recovered

**Configuration:**
```javascript
threshold: 3 failures
timeout: 30 seconds
```

### 2. **Retry with Exponential Backoff**
Automatically retries failed requests with increasing delays.

**Configuration:**
```javascript
maxRetries: 3 attempts
baseDelay: 1000ms
delays: 1s → 2s → 4s
```

**Retries on:**
- 503 Service Unavailable
- 429 Rate Limit Exceeded

### 3. **Error-Specific Responses**

#### Service Overloaded (503)
```json
{
  "intent": "error",
  "reply": "The AI service is currently overloaded. You can try again in a moment or use the direct interface.",
  "error": "service_overloaded",
  "fallback": true
}
```

#### Rate Limit (429)
```json
{
  "intent": "error",
  "reply": "I'm receiving too many requests right now. Please wait a moment and try again.",
  "error": "rate_limit",
  "fallback": true
}
```

#### Circuit Open
```json
{
  "intent": "error",
  "reply": "The AI service is temporarily unavailable. Please try again in 30 seconds.",
  "error": "circuit_open",
  "fallback": true
}
```

### 4. **Intent-Specific Fallbacks**

Each intent type has a helpful fallback message:

```javascript
CREATE_TASK → "Try: 'Create a task for [name]' or use the task creation interface"
CREATE_HABIT → "Use the habits page directly"
LIST_TASKS → "Navigate to the Tasks page"
COMPLETE_TASK → "Use the direct action buttons in your lists"
```

## 🔍 Monitoring

### Check Circuit Breaker Status

The circuit breaker logs its state changes:

```bash
# Logs to watch
"Circuit breaker: OPEN after 3 failures"
"Circuit breaker: HALF_OPEN - attempting request"
"Retry attempt 2/3 after 2000ms..."
```

### Error Tracking

All errors are logged with context:

```javascript
console.error('Gemini API Error:', {
  status: 503,
  code: 503,
  message: "The model is overloaded. Please try again later."
});
```

## 🚀 Testing Error Handling

### Test Circuit Breaker

1. **Simulate failures:**
```bash
# Set invalid API key temporarily
export GEMINI_API_KEY="invalid-key"
```

2. **Make 3 requests rapidly:**
```
User: "create task test1"
User: "create task test2"
User: "create task test3"
```

3. **Observe circuit opens:**
```
✅ First failure: Retry attempts
✅ Second failure: Retry attempts
✅ Third failure: Circuit OPENS
❌ Fourth request: Immediately rejected with "Circuit breaker is OPEN"
```

4. **Wait 30 seconds:**
```
Circuit enters HALF_OPEN state
Next request tests if service recovered
```

### Test 503 Error (Your Case)

Your logs showed:
```
"error": {
  "code": 503,
  "message": "The model is overloaded. Please try again later.",
  "status": "UNAVAILABLE"
}
```

**System Response:**
1. ✅ Detected SERVICE_OVERLOADED
2. ✅ Attempted 3 retries with exponential backoff
3. ✅ Returned user-friendly message
4. ✅ Incremented circuit breaker failure count

## 📊 Performance Impact

### Before (Your Error)
```
❌ Request fails
❌ Raw error shown to user
❌ No retries
❌ No protection from repeated failures
```

### After (With Resilience)
```
✅ Automatic retry (1s, 2s, 4s delays)
✅ User-friendly error message
✅ Circuit breaker prevents server overload
✅ Graceful degradation
```

## 🔧 Configuration

### Adjust Retry Settings

```javascript
// server/services/improvedGeminiService.js

retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000)
// Change to:
retryWithBackoff(fn, maxRetries = 5, baseDelay = 500) // More aggressive
```

### Adjust Circuit Breaker

```javascript
class CircuitBreaker {
  constructor() {
    this.threshold = 3;  // Change to 5 for more tolerance
    this.timeout = 30000; // Change to 60000 for longer recovery
  }
}
```

## 🎯 Best Practices

### 1. Always Check Response Structure
```javascript
const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
if (!responseText) {
  return getFallbackResponse(classification, userMessage);
}
```

### 2. Provide Context in Errors
```javascript
error: 'service_overloaded',
errorMessage: error.message,
fallback: true
```

### 3. Log for Debugging
```javascript
console.error('AI Service Error:', {
  type: errorType,
  message: error.message,
  classification: classification?.type
});
```

### 4. Graceful Degradation
Always provide a way for users to complete their action:
- Direct UI links
- Alternative commands
- Clear next steps

## 🚨 Handling Your Specific Error

Your error logs:
```
POST /api/chat/message 200 4038.011 ms - 793
```

**4 seconds response time** - Service was slow before failing.

### Solution Applied:
1. ✅ **Retry Logic** - Attempts 3 times
2. ✅ **Circuit Breaker** - Stops after threshold
3. ✅ **Better Message** - User sees helpful text instead of raw error
4. ✅ **Fallback** - Suggests direct interface

## 🔮 Future Enhancements

### 1. Alternative AI Provider
```javascript
if (circuitBreaker.state === 'OPEN') {
  return await fallbackToAlternativeAI(userMessage);
}
```

### 2. Local LLM Fallback
```javascript
if (geminiUnavailable) {
  return await processWithLocalModel(userMessage);
}
```

### 3. Queue System
```javascript
if (serviceOverloaded) {
  await queueRequest(userMessage);
  return "Request queued. I'll process it when service is available.";
}
```

### 4. Metrics & Alerts
```javascript
// Track error rates
if (errorRate > 10%) {
  alertAdmins('High AI service error rate');
}
```

## 📝 Summary

Your 503 error is now handled gracefully with:

✅ **Automatic retries** (3 attempts with backoff)  
✅ **Circuit breaker** (prevents cascading failures)  
✅ **User-friendly messages** (no raw errors shown)  
✅ **Intent-specific fallbacks** (helpful guidance)  
✅ **Logging** (track issues for debugging)  
✅ **Graceful degradation** (system stays functional)  

The service will now handle API overload situations automatically and keep users informed! 🎉
