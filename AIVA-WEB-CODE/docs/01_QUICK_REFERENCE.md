# ⚡ AIVA Quick Reference Guide

> **Instant answers to common questions and tasks**

---

## 📋 Table of Contents

1. [Command Cheat Sheet](#command-cheat-sheet)
2. [API Endpoints](#api-endpoints)
3. [Environment Variables](#environment-variables)
4. [File Locations](#file-locations)
5. [Common Patterns](#common-patterns)
6. [Error Codes](#error-codes)
7. [Testing Commands](#testing-commands)

---

## 🎯 Command Cheat Sheet

### Task Management

```bash
# Create
"create task: Buy groceries"
"add task Buy groceries with priority high"
"new task: Finish report by tomorrow"

# List
"show my tasks"
"list all tasks"
"what tasks do I have?"

# Complete
"complete task: Buy groceries"
"mark task complete: Buy groceries"
"finish task Buy groceries"

# Delete
"delete task: Buy groceries"
"remove task: Old task"
"delete all tasks"            # Requires confirmation

# Update
"update task: Buy groceries to priority high"
"change task: Buy groceries to due tomorrow"
"rename task: Old name to New name"

# Search
"find tasks with groceries"
"search tasks containing report"
```

### Habit Tracking

```bash
# Create
"create habit: Morning meditation"
"add habit Exercise daily"
"new habit: Drink water"

# List
"show my habits"
"list all habits"
"what habits do I have?"

# Mark Complete
"mark habit complete: Morning meditation"
"complete habit: Exercise"
"done habit Morning meditation"

# Delete
"delete habit: Old habit"
"remove habit: Not doing this"
"delete all habits"           # Requires confirmation

# Update
"pause habit: Vacation habit"
"resume habit: Back from vacation"
"archive habit: Old habit"
```

### Workspace Management

```bash
# Create
"create workspace: Marketing Team"
"add workspace Development"
"new workspace: Personal Projects"

# List
"show workspaces"
"list all workspaces"
"what workspaces do I have?"

# Switch
"switch to workspace: Marketing Team"
"change workspace to Development"
"use workspace Personal Projects"

# Members
"add user@email.com to workspace"
"invite user@email.com to Marketing Team"
"remove user@email.com from workspace"
"make user@email.com admin in Marketing Team"

# Delete
"delete workspace: Old Workspace"
"remove workspace: Not needed"
```

### Notes

```bash
# Create
"create note: Meeting notes"
"add note About project X"
"new note: Ideas"

# List
"show my notes"
"list all notes"
"what notes do I have?"

# Delete
"delete note: Old notes"
"remove note: Not needed"
"delete all notes"            # Requires confirmation

# Search
"find notes about project"
"search notes containing idea"
```

### Files

```bash
# Upload
"upload file: document.pdf"
"attach file: image.png"

# List
"show my files"
"list all files"

# Delete
"delete file: old-document.pdf"
"remove file: unused.png"
```

### AI Assistant

```bash
# Help
"help"
"what can you do?"
"show commands"

# Analysis
"what tasks are overdue?"
"summarize my progress"
"show my statistics"

# Planning
"help me plan my day"
"what should I focus on?"
"prioritize my tasks"
```

---

## 🔌 API Endpoints

### Authentication

```http
POST   /api/auth/signup          # Register new user
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Get current user
PUT    /api/auth/profile         # Update profile
```

### Tasks

```http
GET    /api/tasks                # List tasks
POST   /api/tasks                # Create task
GET    /api/tasks/:id            # Get task
PUT    /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task
PATCH  /api/tasks/:id/complete   # Mark complete
DELETE /api/tasks/bulk-delete    # Delete all tasks
```

### Habits

```http
GET    /api/habits               # List habits
POST   /api/habits               # Create habit
GET    /api/habits/:id           # Get habit
PUT    /api/habits/:id           # Update habit
DELETE /api/habits/:id           # Delete habit
POST   /api/habits/:id/complete  # Mark complete today
DELETE /api/habits/bulk-delete   # Delete all habits
```

### Workspaces

```http
GET    /api/workspaces           # List workspaces
POST   /api/workspaces           # Create workspace
GET    /api/workspaces/:id       # Get workspace
PUT    /api/workspaces/:id       # Update workspace
DELETE /api/workspaces/:id       # Delete workspace
POST   /api/workspaces/:id/members    # Add member
DELETE /api/workspaces/:id/members/:userId # Remove member
PUT    /api/workspaces/:id/members/:userId # Update role
```

### Notes

```http
GET    /api/notes                # List notes
POST   /api/notes                # Create note
GET    /api/notes/:id            # Get note
PUT    /api/notes/:id            # Update note
DELETE /api/notes/:id            # Delete note
```

### Files

```http
POST   /api/files/upload         # Upload file
GET    /api/files                # List files
GET    /api/files/:id            # Download file
DELETE /api/files/:id            # Delete file
```

### Chat / AI

```http
POST   /api/chat                 # Send message to AI
GET    /api/chat/history         # Get chat history
DELETE /api/chat/history         # Clear history
```

---

## 🌍 Environment Variables

### Required

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/aiva
MONGODB_URI_ATLAS=mongodb+srv://user:pass@cluster.mongodb.net/aiva

# Authentication
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=7d

# AI Service
GEMINI_API_KEY=your-google-gemini-api-key
```

### Optional

```bash
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Cache
REDIS_URL=redis://localhost:6379
USE_REDIS=false

# Storage (choose one)
STORAGE_BACKEND=gcs              # gcs, minio, or gridfs
GCS_BUCKET_NAME=aiva-files
GCS_PROJECT_ID=your-project-id
GCS_KEY_FILE=./config/gcs-key.json

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=aiva-files

# Email
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Frontend
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📁 File Locations

### Key Backend Files

```bash
server/
├── index.js                     # Main entry point
├── server.js                    # Express app setup
├── config/
│   ├── db.js                   # MongoDB connection
│   ├── gcs.js                  # Google Cloud Storage
│   └── socket.js               # Socket.io setup
├── controllers/
│   ├── authController.js       # Authentication
│   ├── taskController.js       # Task operations
│   ├── habitController.js      # Habit operations
│   ├── workspaceController.js  # Workspace operations
│   └── chatController.js       # AI chat
├── models/
│   ├── User.js                 # User schema
│   ├── Task.js                 # Task schema
│   ├── Habit.js                # Habit schema
│   ├── Workspace.js            # Workspace schema
│   └── ChatHistory.js          # Chat schema
├── services/
│   ├── intentClassifier.js     # Pattern matching (80+ intents)
│   ├── improvedGeminiService.js # AI orchestration
│   └── conversationStateTracker.js # State management
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── habitRoutes.js
│   └── workspaceRoutes.js
└── middlewares/
    ├── authMiddleware.js       # JWT verification
    └── errorHandler.js         # Error handling
```

### Key Frontend Files

```bash
client/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   ├── components/
│   │   ├── TaskList.jsx
│   │   ├── HabitTracker.jsx
│   │   ├── WorkspaceSelector.jsx
│   │   └── ChatInterface.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Habits.jsx
│   │   └── Workspaces.jsx
│   ├── redux/
│   │   ├── store.js            # Redux store
│   │   ├── slices/
│   │   │   ├── taskSlice.js
│   │   │   ├── habitSlice.js
│   │   │   └── workspaceSlice.js
│   └── services/
│       ├── api.js              # RTK Query API
│       └── socket.js           # Socket.io client
└── package.json
```

---

## 🎨 Common Patterns

### Adding New Intent Type

```javascript
// 1. Add to INTENT_TYPES (intentClassifier.js)
INTENT_TYPES: {
  MY_NEW_INTENT: 'my_new_intent',
}

// 2. Add patterns
patterns: {
  my_new_intent: [
    /^(do|perform)\s+my\s+action$/i,
    /^execute\s+(.+)$/i,
  ],
}

// 3. Add handler (improvedGeminiService.js)
if (intentType === INTENT_TYPES.MY_NEW_INTENT) {
  // Your logic here
  return response;
}
```

### Adding Confirmation Flow

```javascript
// 1. Detect intent (PRIORITY 3)
if (intentType === INTENT_TYPES.DELETE_ALL_ITEMS) {
  const count = await Item.countDocuments({ userId });
  
  if (count === 0) {
    return { response: "No items to delete." };
  }
  
  // Save state
  const confirmState = getConversationState(userId, workspaceId);
  confirmState.setState({
    type: STATE_TYPES.CONFIRMATION,
    action: 'delete_all_items',
    data: { count }
  });
  await saveConversationState(confirmState);
  
  return {
    response: `⚠️ You have ${count} items. Delete all? (yes/no)`
  };
}

// 2. Handle confirmation (PRIORITY 1)
if (conversationState?.action === 'delete_all_items') {
  if (isConfirming) {
    const { count } = conversationState.data;
    await Item.deleteMany({ userId });
    await clearConversationState(userId, workspaceId);
    return { response: `✅ Deleted ${count} items.` };
  }
}
```

### Adding API Endpoint

```javascript
// 1. Create route (routes/itemRoutes.js)
router.delete('/bulk-delete', authMiddleware, itemController.deleteAllItems);

// 2. Add controller (controllers/itemController.js)
exports.deleteAllItems = async (req, res) => {
  try {
    const result = await Item.deleteMany({ userId: req.userId });
    res.json({ 
      success: true, 
      count: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Register in index.js
app.use('/api/items', require('./routes/itemRoutes'));
```

---

## ❌ Error Codes

### HTTP Status Codes

```bash
200 OK                  # Success
201 Created             # Resource created
400 Bad Request         # Invalid input
401 Unauthorized        # Not authenticated
403 Forbidden           # Not authorized
404 Not Found           # Resource not found
409 Conflict            # Duplicate/conflict
422 Unprocessable       # Validation error
429 Too Many Requests   # Rate limited
500 Internal Error      # Server error
503 Service Unavailable # Service down
```

### Custom Error Codes

```javascript
// Authentication
AUTH_001: "Invalid credentials"
AUTH_002: "Token expired"
AUTH_003: "Token invalid"
AUTH_004: "User not found"

// Workspace
WORKSPACE_001: "Workspace not found"
WORKSPACE_002: "Not a member"
WORKSPACE_003: "Insufficient permissions"
WORKSPACE_004: "Cannot delete default workspace"

// Task
TASK_001: "Task not found"
TASK_002: "Task not in workspace"
TASK_003: "Invalid task data"

// Habit
HABIT_001: "Habit not found"
HABIT_002: "Already completed today"
HABIT_003: "Invalid habit data"

// AI
AI_001: "Gemini API error"
AI_002: "Rate limit exceeded"
AI_003: "Invalid intent"
```

---

## 🧪 Testing Commands

### Backend Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/intentClassifier.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run specific component
npm test TaskList.test.jsx

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Manual Testing

```bash
# Test intent classification
node -e "
const classifier = require('./services/intentClassifier');
const result = classifier.classifyIntent('delete all tasks');
console.log(result);
"

# Test database connection
node -e "
require('./config/db');
console.log('Connected to MongoDB');
"

# Test Gemini API
node -e "
const gemini = require('./services/geminiService');
gemini.chat('Hello').then(console.log);
"
```

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Main Docs** | [00_START_HERE.md](00_START_HERE.md) |
| **Architecture** | [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) |
| **API Reference** | [api/index.md](api/index.md) |
| **Contributing** | [development/contributing.md](development/contributing.md) |
| **Deployment** | [setup/DEPLOYMENT.md](setup/DEPLOYMENT.md) |
| **Changelog** | [releases/CHANGELOG.md](releases/CHANGELOG.md) |

---

**Last Updated:** January 9, 2026
**Version:** 2.0.0

🎉 **Need more detail?** Check the full documentation at [00_START_HERE.md](00_START_HERE.md)
