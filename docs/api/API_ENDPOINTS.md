# 🦅 AIVA API Documentation

**Base URL**: `http://localhost:5000/api`  
**Version**: 2.0.0  
**Last Updated**: March 2026

This documentation details the REST API endpoints for the AIVA backend.

> **Tip**: A [Postman Collection](./AIVA_Postman_Collection.json) is available in this directory for quick import.

---

## 🔐 Authentication & Headers

All protected routes require the following headers:

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for all POST/PUT requests |
| `Authorization`| `Bearer <token>` | Required for all protected routes |

---

## 👤 User Authentication
**Base**: `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | None | Create new user account |
| POST | `/verify-otp` | None | Verify email OTP |
| POST | `/login` | None | Login and receive JWT |
| POST | `/logout` | Bearer | Logout current session |
| POST | `/reset-password-request` | None | Request password reset email |
| POST | `/reset-password` | None | Reset password with token |
| POST | `/resend-otp` | None | Resend OTP verification |
| GET | `/profile` | Bearer | Get current user profile |
| PUT | `/profile` | Bearer | Update user profile |
| PUT | `/change-password` | Bearer | Change password |
| POST | `/test-email` | None | Test email delivery (dev only) |

### Register
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@doe.com",
  "password": "Secret123!"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@doe.com",
  "password": "Secret123!"
}
```
**Response**: `{ success: true, data: { token, user } }`

---

## ✅ Tasks
**Base**: `/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all tasks (filterable by workspace) |
| POST | `/` | Bearer | Create a new task |
| GET | `/dashboard` | Bearer | Get dashboard stats |
| GET | `/workspace` | Bearer | Get workspace-specific tasks |
| GET | `/:id` | Bearer | Get single task |
| PUT | `/:id` | Bearer | Update task |
| DELETE | `/:id` | Bearer | Delete task |
| POST | `/:id/duplicate` | Bearer | Duplicate a task |
| POST | `/:id/subtask` | Bearer | Create subtask |
| PUT | `/:id/subtask/:subtaskId` | Bearer | Update subtask |
| PUT | `/:id/subtask/:subtaskId/complete` | Bearer | Toggle subtask completion |
| DELETE | `/:id/subtask/:subtaskId` | Bearer | Delete subtask |
| POST | `/:id/activity` | Bearer | Post activity log entry |
| PUT | `/:id/trash` | Bearer | Move task to trash |
| PUT | `/:id/restore` | Bearer | Restore from trash |
| POST | `/:id/attachments` | Bearer | Upload task attachment |
| DELETE | `/:id/attachments` | Bearer | Delete task attachment |
| POST | `/:id/comment` | Bearer | Add comment to task |
| GET | `/:id/comments` | Bearer | Get task comments |
| POST | `/batch/trash-completed` | Bearer | Trash all completed tasks |
| POST | `/batch/trash` | Bearer | Bulk trash tasks |
| POST | `/batch/restore-all` | Bearer | Restore all trashed tasks |

### Create Task
```json
POST /api/tasks
{
  "title": "Fix API Bug",
  "description": "Details...",
  "workspaceId": "ObjectId",
  "dueDate": "2026-03-15T00:00:00.000Z",
  "priority": "high",
  "stage": "todo",
  "assignees": ["UserId"]
}
```
**Priority**: `low` | `medium` | `high`  
**Stage**: `todo` | `in-progress` | `completed` | `archived`

---

## 🏢 Workspaces
**Base**: `/workspaces`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/private` | Bearer | Get user's private workspace |
| GET | `/private/all` | Bearer | Get all private workspaces |
| GET | `/public` | Bearer | Get all public workspaces |
| GET | `/invitations` | Bearer | Get pending invitations |
| GET | `/trash` | Bearer | Get trashed workspaces |
| GET | `/users/all` | Bearer | Get all users (admin) |
| GET | `/invitation/:token` | None | Get invitation details by token |
| GET | `/:id/members` | Bearer | Get workspace members |
| GET | `/:id/stats` | Bearer | Get workspace statistics |
| GET | `/:workspaceId/activity` | Bearer | Get workspace activity feed |
| GET | `/:workspaceId/files` | Bearer | Get workspace files |
| POST | `/:workspaceId/invitations` | Bearer | Create invitation |
| POST | `/:workspaceId/invite` | Bearer | Invite user to workspace |
| POST | `/:id/members` | Bearer | Add member |
| POST | `/:workspaceId/uploads` | Bearer | Upload workspace file |
| POST | `/:workspaceId/task/:taskId/uploads` | Bearer | Upload task attachment |
| PATCH | `/:id/members/:memberId` | Bearer | Update member role |
| DELETE | `/:id/members/:memberId` | Bearer | Remove member |
| PUT | `/:id/trash` | Bearer | Move workspace to trash |
| PUT | `/:id/restore` | Bearer | Restore from trash |
| DELETE | `/:id/delete-permanent` | Bearer | Permanently delete workspace |

### Create Workspace
```json
POST /api/workspaces
{
  "name": "Dev Team",
  "description": "Development workspace",
  "visibility": "private"
}
```
**Visibility**: `private` | `public`

---

## 💬 Chat & AI
**Base**: `/chat`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/message` | Bearer | Send message to AI chatbot |
| POST | `/:workspaceId/messages` | Bearer | Workspace-scoped message |
| POST | `/enhanced` | Bearer | Enhanced AI with deep context |
| POST | `/voice` | Bearer | Voice command processing |
| POST | `/clear-context` | Bearer | Clear conversation context |
| GET | `/daily-summary` | Bearer | AI-generated daily summary |
| GET | `/history` | Bearer | Get chat history |

### Send Message
```json
POST /api/chat/message
{
  "message": "Create a task for tomorrow to review code",
  "workspaceId": "ObjectId",
  "contextData": {}
}
```

The AI chatbot is powered by the **Unified Chatbot Service** using **Gemini 2.5 Flash**. It supports **31+ intents** including:
- Task CRUD (create, update, delete, list, search)
- Habit management (create, complete, statistics)
- Reminder creation and management
- Scheduling and calendar queries
- Note operations
- Natural conversation and greetings

---

## 📝 Notes
**Base**: `/notes`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get workspace notes |
| POST | `/` | Bearer | Create note |
| GET | `/:id` | Bearer | Get single note |
| PUT | `/:id` | Bearer | Update note |
| DELETE | `/:id` | Bearer | Soft delete note |
| POST | `/:id/share` | Bearer | Share note with users |
| POST | `/:id/ai-format` | Bearer | **AI-powered content formatting** |
| PUT | `/:id/restore` | Bearer | Restore deleted note |
| POST | `/batch/delete` | Bearer | Batch delete notes |
| POST | `/batch/restore` | Bearer | Batch restore notes |
| DELETE | `/batch/delete-permanent` | Bearer | Permanently delete multiple notes |

### Create Note
```json
POST /api/notes
{
  "title": "Meeting Notes",
  "content": "<h1>Meeting</h1><p>Discussed roadmap...</p>",
  "workspaceId": "ObjectId",
  "tags": ["meeting", "roadmap"]
}
```

### AI Format Note Content
Format messy/unstructured data using Gemini AI. Produces clean HTML suitable for TipTap editor insertion.
```json
POST /api/notes/:id/ai-format
{
  "text": "Name: John, Age: 30, Role: Dev\nName: Jane, Age: 25, Role: PM",
  "outputFormat": "table",
  "customInstruction": "Sort by age ascending"
}
```
**Output Formats**: `auto` | `table` | `json` | `csv` | `list` | `markdown`

**Response**: `{ success: true, data: { formatted: "<table>...</table>", format: "table" } }`

> **Encryption**: All note fields (`title`, `content`, `tags`, `attachments.filename`, `versionHistory.content`) are **AES-256-GCM encrypted** at rest. The API transparently decrypts all data before sending to clients.

---

## 🧘 Habits
**Base**: `/habits`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all habits |
| POST | `/` | Bearer | Create habit |
| GET | `/user` | Bearer | Get user's habits |
| GET | `/due-today` | Bearer | Get today's due habits |
| GET | `/analytics/user` | Bearer | Get habit analytics |
| GET | `/workspace/:workspaceId` | Bearer | Get workspace habits |
| GET | `/:id` | Bearer | Get single habit |
| PUT | `/:id` | Bearer | Update habit |
| DELETE | `/:id` | Bearer | Delete habit |
| POST | `/:id/complete` | Bearer | Toggle daily completion |
| POST | `/:id/notes` | Bearer | Add habit note |
| DELETE | `/:id/notes/:noteId` | Bearer | Delete habit note |
| PATCH | `/:id/trash` | Bearer | Trash habit |
| PATCH | `/:id/restore` | Bearer | Restore habit |
| PATCH | `/:id/pause` | Bearer | Pause/resume habit |
| GET | `/:id/statistics` | Bearer | Get habit statistics |
| GET | `/:id/history` | Bearer | Get completion history |

### Create Habit
```json
POST /api/habits
{
  "title": "Morning Jog",
  "frequency": "daily",
  "workspaceId": "ObjectId",
  "description": "30 min jog",
  "color": "#6366f1"
}
```

---

## 🔔 Reminders
**Base**: `/reminders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all reminders |
| POST | `/create` | Bearer | Create reminder |
| GET | `/date/:date` | Bearer | Get reminders by date |
| PUT | `/:id` | Bearer | Update reminder |
| DELETE | `/:id` | Bearer | Delete reminder |

---

## 🎨 Canvas
**Base**: `/canvas`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all canvases |
| POST | `/` | Bearer | Create canvas |
| GET | `/deleted` | Bearer | Get deleted canvases |
| GET | `/:id` | Bearer | Get single canvas |
| PUT | `/:id` | Bearer | Update canvas (save state) |
| PUT | `/:id/restore` | Bearer | Restore deleted canvas |
| DELETE | `/:id` | Bearer | Soft delete canvas |
| DELETE | `/:id/permanent` | Bearer | Permanently delete canvas |

Canvas uses **fabric.js** for a full drawing/diagramming experience featuring shapes (rectangle, circle, diamond, parallelogram, hexagon, star, heart, etc.), connector tools, text/sticky notes, infinite canvas with grid, zoom, undo/redo, auto-save, dark mode, and export to PNG/SVG/PDF/AIVA formats.

---

## 📁 File Management
**Base**: `/files`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | Bearer | Upload file |
| GET | `/workspace/:workspaceId` | Bearer | Get workspace files |
| GET | `/trash/:workspaceId` | Bearer | Get trashed files |
| GET | `/:id/download` | Bearer | Download file |
| POST | `/:id/restore` | Bearer | Restore trashed file |

---

## 📂 Google Drive Integration
**Base**: `/drive`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload/:wId/:gId` | Bearer | Upload to Google Drive |
| POST | `/folders/:wId/:gId` | Bearer | Create Drive folder |
| POST | `/share` | Bearer | Share Drive file |
| POST | `/move` | Bearer | Move Drive file |
| GET | `/download/:wId/:gId/:fId` | Bearer | Download from Drive |
| GET | `/files/:wId/:gId` | Bearer | List Drive files |
| GET | `/search/:wId/:gId` | Bearer | Search Drive |
| GET | `/metadata/:wId/:gId/:fId` | Bearer | Get file metadata |
| GET | `/quota/:wId/:gId` | Bearer | Get storage quota |
| GET | `/workspace-files/:wId` | Bearer | Get workspace Drive files |
| GET | `/stats/:wId` | Bearer | Get storage stats |
| DELETE | `/files/:wId/:gId/:fId` | Bearer | Delete Drive file |
| PATCH | `/metadata/:wId/:gId/:fId` | Bearer | Update file metadata |

---

## 🌩️ Google Integration
**Base**: `/google`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth-url` | Bearer | Get Google OAuth URL |
| GET | `/callback` | None | OAuth callback handler |
| GET | `/accounts/:workspaceId` | Bearer | Get connected accounts |
| PATCH | `/accounts/:workspaceId/:accountId` | Bearer | Update account settings |
| DELETE | `/accounts/:workspaceId/:accountId` | Bearer | Disconnect account |
| POST | `/sync/:workspaceId/:accountId` | Bearer | Trigger sync |
| GET | `/sync-status/:workspaceId` | Bearer | Get sync status |
| GET | `/events/:workspaceId` | Bearer | Get calendar events |
| GET | `/tasks/:workspaceId` | Bearer | Get Google Tasks |
| PUT | `/tasks/:workspaceId/:taskId` | Bearer | Update Google Task |
| DELETE | `/tasks/:workspaceId/:taskId` | Bearer | Delete Google Task |
| POST | `/tasks/:workspaceId/:taskId/subtask` | Bearer | Create subtask |
| DELETE | `/events/:workspaceId/cleanup` | Bearer | Cleanup stale events |
| GET | `/proxy-image` | Bearer | Proxy profile images |
| POST | `/meet/create/:workspaceId` | Bearer | Create Google Meet |

---

## 📧 Gmail Integration
**Base**: `/gmail`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/inbox` | Bearer | Get inbox messages |
| GET | `/unread` | Bearer | Get unread count |
| GET | `/labels` | Bearer | Get Gmail labels |
| GET | `/search` | Bearer | Search emails |
| GET | `/messages/:id` | Bearer | Get single email |
| GET | `/threads/:id` | Bearer | Get email thread |

---

## 🧠 Intelligence & Analytics
**Base**: `/intelligence`

Powered by the **Execution Intelligence Engine** — analyzes user patterns using Gemini AI.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/report` | Bearer | Full intelligence report |
| GET | `/nudge` | Bearer | Smart productivity nudge |
| GET | `/gaps` | Bearer | Execution gap analysis |
| GET | `/focus` | Bearer | Focus analytics |
| GET | `/burnout` | Bearer | Burnout risk assessment |
| GET | `/habits` | Bearer | Habit health analysis |

---

## 📚 Knowledge Hub
**Base**: `/knowledge`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/index` | Bearer | Get knowledge index (topics, connections) |
| GET | `/related` | Bearer | Get related items for a topic |
| GET | `/search` | Bearer | Semantic search across knowledge |
| GET | `/export` | Bearer | Export knowledge base |

Auto-indexes notes, tasks, habits, and sources to build a connected knowledge graph with topic extraction and relationship mapping.

---

## 📖 Sources
**Base**: `/sources`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all sources |
| POST | `/` | Bearer | Create source citation |
| GET | `/:id` | Bearer | Get single source |
| PATCH | `/:id` | Bearer | Update source |
| DELETE | `/:id` | Bearer | Delete source |
| GET | `/:id/citation` | Bearer | Get formatted citation |
| POST | `/:sourceId/link/note/:noteId` | Bearer | Link source to note |
| DELETE | `/:sourceId/link/note/:noteId` | Bearer | Unlink source from note |
| POST | `/batch/import` | Bearer | Batch import sources |

---

## 📋 Templates
**Base**: `/templates`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all templates |
| POST | `/` | Bearer | Create template |
| GET | `/:id` | Bearer | Get single template |
| PUT | `/:id` | Bearer | Update template |
| DELETE | `/:id` | Bearer | Delete template |
| POST | `/:id/create-task` | Bearer | Create task from template |

---

## ⚙️ Automation Rules
**Base**: `/automation`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Bearer | Get all automation rules |
| POST | `/` | Bearer | Create automation rule |
| GET | `/:id` | Bearer | Get single rule |
| PUT | `/:id` | Bearer | Update rule |
| DELETE | `/:id` | Bearer | Delete rule |
| PUT | `/:id/toggle` | Bearer | Enable/disable rule |
| POST | `/:id/trigger` | Bearer | Manually trigger rule |

### Create Automation Rule
```json
POST /api/automation
{
  "name": "Auto-archive completed",
  "trigger": { "type": "task_completed", "conditions": {} },
  "actions": [{ "type": "move_to_stage", "params": { "stage": "archived" } }],
  "workspaceId": "ObjectId",
  "enabled": true
}
```

---

## 📅 Work Orchestration
**Base**: `/orchestration`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/conflicts` | Bearer | Detect scheduling conflicts |
| GET | `/suggest-day` | Bearer | AI-suggested daily plan |
| GET | `/daily-plan` | Bearer | Get structured daily plan |
| DELETE | `/cleanup-events` | Bearer | Cleanup stale events |

---

## 📊 Quotas & Rate Limits
**Base**: `/quotas`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/current` | Bearer | Get current usage quotas |
| GET | `/status` | Bearer | Check API usage limits |
| GET | `/health` | Bearer | API health check |

### Rate Limiting
- **Standard endpoints**: 100 requests/minute
- **AI/Gemini endpoints**: 30 requests/minute
- **Auth endpoints**: 10 requests/5 minutes
- **File uploads**: 20 requests/minute

A `429 Too Many Requests` response includes a `Retry-After` header.

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

### Pagination
List endpoints support pagination:
```
GET /api/tasks?page=1&limit=20&sort=-createdAt
```
