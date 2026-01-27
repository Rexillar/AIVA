# API Design

This document outlines the design principles, patterns, and conventions used in the AIVA Web Application API.

## Design Principles

### RESTful Architecture

The API follows REST (Representational State Transfer) principles:

- **Resources**: Everything is a resource (users, tasks, workspaces)
- **HTTP Methods**: Standard HTTP verbs for CRUD operations
- **Stateless**: No server-side sessions, all state in requests
- **Uniform Interface**: Consistent URL structure and response formats

### API Versioning

- Version prefix: `/api/v1/` (future-proofing)
- Current implementation uses `/api/` for v1
- Breaking changes will introduce new versions

## URL Structure

### Base URL
```
https://api.aiva-web.com/api
```

### Resource Patterns

#### Collection Resources
```
GET    /api/tasks           # List all tasks
POST   /api/tasks           # Create new task
```

#### Individual Resources
```
GET    /api/tasks/:id       # Get specific task
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

#### Sub-resources
```
GET    /api/tasks/:id/comments      # Get task comments
POST   /api/tasks/:id/comments      # Add comment
PUT    /api/tasks/:id/comments/:cid # Update comment
```

#### Actions
```
POST   /api/tasks/:id/duplicate     # Duplicate task
PUT    /api/tasks/:id/trash         # Move to trash
PUT    /api/tasks/:id/restore       # Restore from trash
```

## HTTP Methods

| Method | Usage | Safe | Idempotent |
|--------|-------|------|------------|
| GET    | Retrieve resources | Yes | Yes |
| POST   | Create resources | No | No |
| PUT    | Update/replace resources | No | Yes |
| PATCH  | Partial updates | No | No |
| DELETE | Remove resources | No | Yes |

## Request/Response Format

### Content Types

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

**Response Headers:**
```
Content-Type: application/json
X-Total-Count: 25
X-Page-Count: 3
Link: <https://api.example.com/tasks?page=2>; rel="next"
```

### Request Body

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "priority": "high",
  "dueDate": "2024-12-31",
  "assignees": ["user-id-1", "user-id-2"],
  "tags": ["documentation", "api"]
}
```

### Response Body

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "task-id-123",
    "title": "Complete project documentation",
    "status": "in_progress",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Task created successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "title": "Title is required",
      "dueDate": "Invalid date format"
    }
  }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [
    { "id": "task-1", "title": "Task 1" },
    { "id": "task-2", "title": "Task 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Authentication

### JWT Token Authentication

**Login Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Token Usage:**
```http
GET /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200  | OK | Successful GET, PUT, PATCH |
| 201  | Created | Successful POST |
| 204  | No Content | Successful DELETE |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Missing/invalid auth |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 409  | Conflict | Resource conflict |
| 422  | Unprocessable | Validation errors |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Error | Server error |

### Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "specific validation message"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/tasks",
    "requestId": "req-12345"
  }
}
```

## Filtering, Sorting, Pagination

### Filtering

```
GET /api/tasks?status=in_progress&priority=high&assignee=user123
GET /api/tasks?dueDate[gte]=2024-01-01&dueDate[lte]=2024-12-31
GET /api/tasks?tags[]=urgent&tags[]=bug
```

### Sorting

```
GET /api/tasks?sort=createdAt:desc
GET /api/tasks?sort=priority:asc,dueDate:desc
```

### Pagination

```
GET /api/tasks?page=1&limit=10
GET /api/tasks?offset=20&limit=10
```

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Caching

### Cache Headers

```http
Cache-Control: max-age=300, public
ETag: "task-123-version-1"
Last-Modified: Wed, 15 Jan 2024 10:30:00 GMT
```

### Conditional Requests

```http
GET /api/tasks/123
If-None-Match: "task-123-version-1"
If-Modified-Since: Wed, 15 Jan 2024 10:30:00 GMT
```

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh tokens | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update profile | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | List tasks | Yes |
| POST | `/tasks` | Create task | Yes |
| GET | `/tasks/:id` | Get task | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes |
| POST | `/tasks/:id/duplicate` | Duplicate task | Yes |
| POST | `/tasks/:id/comment` | Add comment | Yes |
| GET | `/tasks/:id/comments` | Get comments | Yes |
| POST | `/tasks/:id/subtask` | Create subtask | Yes |
| PUT | `/tasks/:id/subtask/:sid` | Update subtask | Yes |
| DELETE | `/tasks/:id/subtask/:sid` | Delete subtask | Yes |

### Workspace Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/workspaces` | List workspaces | Yes |
| POST | `/workspaces` | Create workspace | Yes |
| GET | `/workspaces/:id` | Get workspace | Yes |
| PUT | `/workspaces/:id` | Update workspace | Yes |
| DELETE | `/workspaces/:id` | Delete workspace | Yes |
| GET | `/workspaces/:id/members` | Get members | Yes |
| POST | `/workspaces/:id/members` | Add member | Yes |
| DELETE | `/workspaces/:id/members/:mid` | Remove member | Yes |

## WebSocket API

### Connection

```javascript
const socket = io('https://api.aiva-web.com', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Events

#### Client Events
```javascript
// Join workspace room
socket.emit('join-workspace', workspaceId);

// Send message
socket.emit('send-message', {
  workspaceId,
  content: 'Hello world'
});

// Task updates
socket.emit('task-update', {
  taskId,
  updates: { status: 'completed' }
});
```

#### Server Events
```javascript
// Receive messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Task updates
socket.on('task-updated', (task) => {
  console.log('Task updated:', task);
});

// Notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## SDK and Libraries

### JavaScript SDK

```javascript
import { AIVAClient } from '@aiva/sdk';

const client = new AIVAClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.aiva-web.com'
});

// Authenticate
await client.auth.login('user@example.com', 'password');

// Get tasks
const tasks = await client.tasks.list({
  status: 'in_progress',
  limit: 10
});

// Create task
const task = await client.tasks.create({
  title: 'New task',
  priority: 'high'
});
```

## Versioning Strategy

### API Versioning

- **URL Path Versioning**: `/api/v1/tasks`
- **Header Versioning**: `Accept: application/vnd.aiva.v1+json`
- **Query Parameter**: `/api/tasks?version=1`

### Deprecation Policy

1. **Announcement**: New version released with deprecation warnings
2. **Grace Period**: 6 months for migration
3. **Sunset**: Old version disabled after grace period

## Testing

### API Testing Tools

```bash
# Using curl
curl -X GET "https://api.aiva-web.com/api/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Using httpie
http GET https://api.aiva-web.com/api/tasks \
  Authorization:"Bearer <token>"
```

### Test Data

```json
{
  "users": [
    {
      "email": "test@example.com",
      "password": "testpass123"
    }
  ],
  "workspaces": [
    {
      "name": "Test Workspace",
      "type": "team"
    }
  ]
}
```

## Monitoring and Analytics

### API Metrics

- Request count and response times
- Error rates by endpoint
- Authentication success/failure rates
- Rate limit hits

### Logging

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "message": "Task created",
  "userId": "user-123",
  "taskId": "task-456",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

This API design provides a robust, scalable, and developer-friendly interface for the AIVA Web Application.