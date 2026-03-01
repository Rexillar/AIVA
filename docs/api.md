# API Overview

**Last Updated**: March 2026

This document provides a conceptual overview of the AIVA API. For the complete endpoint reference with request/response examples, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).

---

## Base URL

```
http://localhost:5000/api
```

All API routes are prefixed with `/api`.

---

## Authentication

### Obtaining a Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response includes a JWT token (also set as an HTTP-only cookie):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id": "...", "email": "...", "name": "..." }
}
```

### Using the Token
Include the JWT in the `Authorization` header on all protected routes:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google for OAuth sign-in. On success, redirects back with a session cookie.

---

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

Or for list endpoints:
```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

### Error Response
```json
{
  "message": "Error description",
  "stack": "..." // Only in development mode
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

All endpoints are rate-limited per user:
- **Standard endpoints**: ~100 requests / 15 minutes
- **AI endpoints** (chat, intelligence, formatting): Stricter limits to manage Gemini API costs
- **Auth endpoints** (login, register): Aggressive limits to prevent brute force

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703001600
```

---

## Route Groups

AIVA exposes 200+ endpoints across these route groups:

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/auth` | Login, register, Google OAuth, password reset |
| Users | `/api/users` | Profile, settings, achievements |
| Workspaces | `/api/workspaces` | Workspace CRUD, members, roles |
| Tasks | `/api/tasks` | Task CRUD, status, priority, recurring |
| Notes | `/api/notes` | Note CRUD, sharing, AI formatting |
| Habits | `/api/habits` | Habit tracking with streaks |
| Reminders | `/api/reminders` | Reminder scheduling |
| Canvas | `/api/canvas` | Canvas drawing save/load |
| Chat | `/api/chat` | AI chatbot (31+ intents) |
| Enhanced Chat | `/api/enhanced-chat` | Streaming AI chat |
| Files | `/api/files` | File upload/download (multi-backend) |
| Notifications | `/api/notifications` | Push & in-app notifications |
| Google | `/api/google` | Calendar, Tasks, Drive sync |
| Gmail | `/api/gmail` | Email management |
| Drive | `/api/drive` | Google Drive operations |
| Intelligence | `/api/intelligence` | Analytics & insights engine |
| Knowledge | `/api/knowledge` | Knowledge graph & hub |
| Sources | `/api/sources` | Source citation management |
| Templates | `/api/templates` | Task template library |
| Automation | `/api/automation` | Rule-based automation |
| Orchestration | `/api/orchestration` | Work planning & scheduling |
| Quotas | `/api/quotas` | API usage quotas |
| Completion | `/api/completion` | AI text completions |
| Workspace Trash | `/api/workspace-trash` | Soft-delete recovery |
| Invitations | `/api/invitations` | Workspace invitations |

---

## Real-Time Events (Socket.IO)

AIVA uses Socket.IO for real-time updates:

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');

// Listen for task updates
socket.on('task:updated', (task) => { ... });
socket.on('task:created', (task) => { ... });
socket.on('notification:new', (notification) => { ... });
```

---

## Encrypted Fields

Some API responses contain auto-decrypted fields. The following fields are encrypted at rest but returned decrypted in API responses:

- **Notes**: `title`, `content`, `tags`, `attachments.filename`, `versionHistory.content`
- **Chat**: `message`, `content`, `response`

If you see values starting with `enc:` in a response, this indicates a decryption issue — please report it.

---

## Full Reference

For the complete list of all 200+ endpoints with detailed request/response examples, see:

→ **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**
