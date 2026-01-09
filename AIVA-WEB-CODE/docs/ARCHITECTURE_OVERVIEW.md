# AIVA Architecture Overview

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [Data Flow](#data-flow)
4. [AI Integration](#ai-integration)
5. [Security](#security)
6. [Performance](#performance)
7. [Deployment](#deployment)

---

## System Architecture

AIVA follows a **modern microservices-inspired architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  React 18 + Vite + Redux Toolkit + Tailwind CSS            │
│  - Component-based UI (Pages, Components, Hooks)            │
│  - State management (Redux slices + RTK Query)              │
│  - Real-time updates (Socket.io client)                     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
│  Express.js + Middleware Stack                              │
│  - Authentication (JWT)                                      │
│  - Rate limiting                                             │
│  - CORS handling                                             │
│  - Request validation                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                    │
│  Controllers + Services                                      │
│  - Task Management (taskController.js)                      │
│  - Habit Tracking (habitController.js)                      │
│  - Workspace Management (workspaceController.js)            │
│  - AI Chat (chatController.js, enhancedChatController.js)   │
│  - File Management (fileController.js)                      │
│  - Notifications (notificationController.js)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────┬──────────────────────────────────────┐
│   AI SERVICES        │     CORE SERVICES                    │
│  ─────────────       │    ──────────────                    │
│  • Intent            │    • Storage Service (GCS/MinIO)     │
│    Classifier        │    • Email Service (Gmail SMTP)      │
│  • Gemini API        │    • Notification Service            │
│  • Context Manager   │    • Gamification Service            │
│  • State Tracker     │    • File Upload Service             │
└──────────────────────┴──────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  MongoDB + Mongoose ODM                                      │
│  - Collections: Users, Workspaces, Tasks, Habits, Notes,    │
│    ChatHistory, Notifications, Files, etc.                  │
│  - Indexes for performance                                   │
│  - Aggregation pipelines for analytics                      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      CACHE LAYER                            │
│  Redis (Production) / Memory (Development)                  │
│  - Conversation states (5min TTL)                           │
│  - User sessions (30min TTL)                                │
│  - Workspace data (15min TTL)                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│  • Google Cloud Storage (file storage)                      │
│  • Google Gemini 2.5-Flash AI (complex queries)            │
│  • Gmail SMTP (email notifications)                         │
│  • MinIO (optional self-hosted storage)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Frontend (React + Vite)

**Location:** `client/`

**Key Technologies:**
- **React 18**: Component-based UI with hooks
- **Vite**: Lightning-fast build tool and dev server
- **Redux Toolkit**: State management with slices
- **RTK Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first styling
- **Socket.io Client**: Real-time updates

**Directory Structure:**
```
client/
├── src/
│   ├── App.jsx                 # Root component
│   ├── main.jsx               # Entry point
│   ├── store.js               # Redux store configuration
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page-level components
│   ├── redux/                 # Redux slices (DEPRECATED - use slices/)
│   ├── slices/                # RTK Query API slices
│   ├── services/              # API service wrappers
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React Context providers
│   ├── utils/                 # Helper functions
│   └── styles/                # Global styles
├── public/                    # Static assets
└── vite.config.js            # Vite configuration
```

### Backend (Node.js + Express)

**Location:** `server/`

**Key Technologies:**
- **Node.js v22.21.0**: Runtime environment
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **Socket.io**: WebSocket server
- **JWT**: Authentication
- **Multer**: File uploads

**Directory Structure:**
```
server/
├── index.js                   # Application entry point
├── server.js                  # Express server configuration
├── config/
│   ├── db.js                 # MongoDB connection
│   ├── socket.js             # Socket.io configuration
│   ├── gcs.js                # Google Cloud Storage setup
│   └── gcs-key.json          # GCS credentials (gitignored)
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── taskController.js
│   ├── habitController.js
│   ├── chatController.js
│   ├── enhancedChatController.js
│   └── ...
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Task.js
│   ├── Habit.js
│   ├── Workspace.js
│   └── ...
├── routes/                   # Express routes
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── habitRoutes.js
│   └── ...
├── middlewares/              # Custom middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── ...
├── services/                 # Business logic
│   ├── intentClassifier.js       # AI intent detection
│   ├── improvedGeminiService.js  # Gemini AI integration
│   ├── contextManager.js         # AI context management
│   ├── conversationStateTracker.js # State management
│   ├── storageService.js         # File storage
│   ├── emailService.js           # Email notifications
│   └── ...
├── utils/                    # Utility functions
│   ├── promptTemplates.js
│   └── ...
└── uploads/                  # Temporary file uploads
```

---

## Data Flow

### User Request Flow

```
1. User Action (Frontend)
   ├─→ Redux dispatch (state update)
   └─→ RTK Query mutation/query
         ↓
2. HTTP Request (REST API)
   ├─→ Express route handler
   ├─→ Auth middleware (JWT validation)
   ├─→ Validation middleware
   └─→ Controller function
         ↓
3. Business Logic (Controllers + Services)
   ├─→ Service layer (business rules)
   ├─→ Database query (Mongoose)
   ├─→ External service calls (if needed)
   └─→ Response preparation
         ↓
4. Response (Backend → Frontend)
   ├─→ JSON response
   ├─→ WebSocket event (if real-time)
   └─→ Frontend state update
         ↓
5. UI Update (React)
   ├─→ Redux state updated
   ├─→ Components re-render
   └─→ User sees changes
```

### AI Chat Flow (Optimized)

```
1. User Message: "delete all tasks"
   ↓
2. Intent Classification (LOCAL - 0ms)
   ├─→ Pattern matching (regex)
   ├─→ Confidence: 0.95
   └─→ requiresAI: false ✅ NO API CALL
         ↓
3. Direct Execution
   ├─→ Count tasks (MongoDB query)
   ├─→ Save confirmation state (Redis)
   └─→ Return confirmation prompt
         ↓
4. User: "yes"
   ↓
5. Confirmation Handler (LOCAL - 0ms)
   ├─→ Detect pending confirmation
   ├─→ Validate response
   └─→ Execute deletion ✅ NO API CALL
         ↓
6. Response: "✅ Deleted 15 tasks"

─────────────────────────────────────────

Alternative: Complex Query
1. User Message: "What should I focus on today?"
   ↓
2. Intent Classification (LOCAL - 0ms)
   ├─→ Pattern: RECOMMENDATION
   ├─→ Confidence: 0.95
   └─→ requiresAI: true ⚠️ NEEDS AI
         ↓
3. Context Loading (MongoDB queries)
   ├─→ Today's tasks
   ├─→ Active habits
   ├─→ Recent activity
   └─→ Build prompt
         ↓
4. Gemini API Call (Network - ~500ms)
   ├─→ Circuit breaker protection
   ├─→ Retry logic (3 attempts)
   └─→ Parse AI response
         ↓
5. Response: "Based on your habits..."
```

---

## AI Integration

### Intent Classification System

**File:** `server/services/intentClassifier.js`

**Purpose:** Route 80% of queries without AI API calls

**How It Works:**
```javascript
// 1. User message arrives
const message = "delete all tasks";

// 2. Normalize input
const normalized = message.trim().toLowerCase();

// 3. Pattern matching (80+ intents)
for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      return {
        type: intentType,           // "DELETE_ALL_TASKS"
        confidence: 0.95,            // High confidence
        requiresAI: false,           // ✅ No API call needed
        data: extractData(match)     // { taskCount: 15 }
      };
    }
  }
}

// 4. No match = route to AI
return {
  type: 'UNKNOWN',
  confidence: 0.0,
  requiresAI: true  // ⚠️ Needs Gemini API
};
```

**Benefits:**
- ✅ **0ms latency** (local regex matching)
- ✅ **Zero cost** (no API calls)
- ✅ **95% accuracy** for common commands
- ✅ **Preserves API quota** for complex queries

### Gemini AI Integration

**File:** `server/services/improvedGeminiService.js`

**Model:** Gemini 2.5-Flash  
**Free Tier Limit:** 20 requests/minute

**When Gemini Is Used:**
1. **Analytics queries**: "How am I doing this week?"
2. **Recommendations**: "What should I focus on?"
3. **Complex parsing**: "Create task X tomorrow at 3pm in workspace Y"
4. **Multi-intent**: "Create task X and remind me about Y"
5. **Unknown intents**: Unrecognized patterns

**Circuit Breaker Protection:**
```javascript
const circuitBreaker = {
  state: 'CLOSED',           // CLOSED, OPEN, HALF_OPEN
  failureThreshold: 3,       // Failures before opening
  timeout: 30000,            // 30s timeout
  resetTimeout: 60000        // 60s before retry
};
```

**Retry Logic:**
```javascript
const retryConfig = {
  maxRetries: 3,
  backoff: [1000, 2000, 4000],  // Exponential: 1s, 2s, 4s
  retryOn: [429, 503]            // Rate limit, Service unavailable
};
```

### Context Management

**File:** `server/services/contextManager.js`

**Priority-Based Loading:**
```javascript
const PRIORITY_LEVELS = {
  CRITICAL: {
    tasks_today: true,          // Today's tasks
    current_workspace: true,    // Active workspace info
    user_profile: true          // User preferences
  },
  HIGH: {
    tasks_week: true,           // This week's tasks
    habits_today: true,         // Today's habits
    recent_activity: true       // Last 24h activity
  },
  MEDIUM: {
    tasks_month: true,          // This month's tasks
    completed_tasks: true,      // Recently completed
    workspace_members: true     // Team info
  },
  LOW: {
    analytics: true,            // Historical data
    archived_tasks: true        // Old tasks
  }
};
```

**Cache TTL:**
- Context data: 30 minutes
- User data: 30 minutes
- Workspace data: 15 minutes

---

## Security

### Authentication & Authorization

**JWT Token Flow:**
```
1. User Login
   ├─→ Validate credentials
   ├─→ Generate access token (15min TTL)
   ├─→ Generate refresh token (7d TTL)
   └─→ Return both tokens

2. Authenticated Request
   ├─→ Extract token from Authorization header
   ├─→ Verify JWT signature
   ├─→ Check expiration
   ├─→ Attach user to req.user
   └─→ Continue to controller

3. Token Refresh
   ├─→ Validate refresh token
   ├─→ Generate new access token
   └─→ Return new token
```

**Role-Based Access Control (RBAC):**
```javascript
const ROLES = {
  OWNER: ['read', 'write', 'delete', 'manage_members', 'delete_workspace'],
  ADMIN: ['read', 'write', 'delete', 'manage_members'],
  EDITOR: ['read', 'write'],
  VIEWER: ['read']
};

// Middleware usage
router.delete('/workspace/:id', 
  authMiddleware,
  requireRole(['OWNER']),
  deleteWorkspace
);
```

### Data Protection

**Encryption:**
- Passwords: bcrypt (10 rounds)
- Tokens: HMAC-SHA256
- Files: AES-256 (optional for GCS)

**Input Validation:**
```javascript
// Express-validator
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
body('taskTitle').trim().isLength({ min: 1, max: 200 }).escape()
```

**SQL/NoSQL Injection Prevention:**
```javascript
// Mongoose automatically escapes queries
const tasks = await Task.find({ 
  title: req.body.title  // Safe - Mongoose escapes
});

// Manual sanitization for regex
const escapedQuery = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

---

## Performance

### Database Optimization

**Indexes:**
```javascript
// Task model
taskSchema.index({ workspace: 1, creator: 1, isDeleted: 1 });
taskSchema.index({ dueDate: 1, stage: 1 });
taskSchema.index({ priority: -1 });

// Habit model
habitSchema.index({ user: 1, workspace: 1, isActive: 1 });
habitSchema.index({ user: 1, 'completionHistory.date': -1 });
```

**Query Optimization:**
```javascript
// ✅ GOOD (lean, select fields, limit)
const tasks = await Task.find({ workspace: workspaceId })
  .select('title stage priority dueDate')
  .limit(50)
  .lean();

// ❌ BAD (loads all fields, no limit)
const tasks = await Task.find({ workspace: workspaceId });
```

### Caching Strategy

**Redis Cache:**
```javascript
// Cache frequently accessed data
await redis.setex(`workspace:${workspaceId}`, 900, JSON.stringify(workspace));

// Cache with tags for invalidation
await setCache('user:123', userData, 1800, 'users');
await invalidateCacheByTag('users');  // Clear all user caches
```

### Real-Time Updates

**Socket.io Events:**
```javascript
// Server emits
io.to(workspaceId).emit('task:created', task);
io.to(workspaceId).emit('task:updated', task);
io.to(workspaceId).emit('notification:new', notification);

// Client listens
socket.on('task:created', (task) => {
  dispatch(addTask(task));
});
```

---

## Deployment

### Docker Deployment

**File:** `docker-compose.yml`

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: infra/frontend.Dockerfile
    ports:
      - "5173:5173"
    depends_on:
      - backend
  
  backend:
    build:
      context: .
      dockerfile: infra/backend.Dockerfile
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/aiva
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### Environment Variables

**Required:**
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/aiva
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173

# Email (Gmail SMTP)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# Storage (Google Cloud)
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production Considerations

**Scaling:**
- Horizontal: Multiple backend instances behind load balancer
- Redis: Redis Cluster for distributed caching
- MongoDB: Replica set for high availability

**Monitoring:**
- Logs: Winston + Elasticsearch + Kibana
- Metrics: Prometheus + Grafana
- Errors: Sentry
- Uptime: Pingdom

**CI/CD:**
- GitHub Actions for automated testing
- Docker Hub for image registry
- Blue-green deployment for zero downtime

---

## Additional Resources

- [Intent Classification System](./architecture/INTENT_CLASSIFICATION_SYSTEM.md)
- [Confirmation Flow System](./architecture/CONFIRMATION_FLOW_SYSTEM.md)
- [Chatbot AI Architecture](./architecture/CHATBOT_AI_ARCHITECTURE.md)
- [API Design](./architecture/api-design.md)
- [Data Models](./architecture/data-models.md)

---

**Last Updated:** January 9, 2026  
**Version:** 3.0  
**Maintainer:** AIVA Development Team
