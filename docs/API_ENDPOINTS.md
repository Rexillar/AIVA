# 🦅 AIVA API Documentation

**Base URL**: `http://localhost:5000/api`
**Version**: 1.0.0

This documentation details the REST API endpoints for the AIVA backend. 

> **Tip**: A [Postman Collection](./AIVA_Postman_Collection.json) is available in this directory for quick import.

---

## 🔐 Authentication & Headers

All ID-specific routes require the following headers:

| Header | Value | Description |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Required for all POST/PUT requests |
| `Authorization`| `Bearer <token>` | Required for all protected routes |

---

## 👤 User Authentication
**Base URL**: `/auth`

### Register User
Create a new user account.
- **Endpoint**: `POST /register`
- **Auth**: None
- **Body**:
  ```json
  {
    "name": "John Doe",       // required, min 2 chars
    "email": "john@doe.com",  // required, valid email
    "password": "Secret123!"  // required, min 8 chars (1 upper, 1 lower, 1 number, 1 special)
  }
  ```

### Login
Authenticate user and receive a JWT token.
- **Endpoint**: `POST /login`
- **Auth**: None
- **Body**:
  ```json
  {
    "email": "john@doe.com",
    "password": "Secret123!"
  }
  ```

### Verify OTP
Verify email using the One-Time Password sent during registration or login.
- **Endpoint**: `POST /verify-otp`
- **Auth**: None
- **Body**:
  ```json
  {
    "email": "john@doe.com",
    "otp": "123456"
  }
  ```

### Get Profile
Get the currently logged-in user's profile.
- **Endpoint**: `GET /profile`
- **Auth**: Bearer Token

---

## ✅ Tasks
**Base URL**: `/tasks`

### Get All Tasks
Retrieve all tasks visible to the user (filtered by workspace if specified).
- **Endpoint**: `GET /`
- **Auth**: Bearer Token
- **Query Params**: 
  - `workspaceId`: (Optional) Filter by workspace
  - `includeStats`: (Optional) `true` to include dashboard stats

### Create Task
Create a new task in a workspace.
- **Endpoint**: `POST /`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "title": "Fix API Bug",       // required
    "description": "Details...",  // optional
    "workspaceId": "ObjectId",    // required
    "dueDate": "2023-12-31T...",  // required (ISO Date)
    "priority": "high",           // optional: 'low', 'medium', 'high'
    "assignees": ["UserId"]       // optional
  }
  ```

### Get Task Dashboard
Get statistical overview of tasks.
- **Endpoint**: `GET /dashboard`
- **Auth**: Bearer Token
- **Query Params**: `workspaceId` (required)

### Task Operations
- **Get Single**: `GET /:id`
- **Update**: `PUT /:id` (Same body as create)
- **Delete**: `DELETE /:id` (Soft delete)
- **Duplicate**: `POST /:id/duplicate`

### Subtasks
- **Create**: `POST /:id/subtask`
  - Body: `{ "title": "Subtask 1" }`
- **Update**: `PUT /:id/subtask/:subtaskId`
- **Complete**: `PUT /:id/subtask/:subtaskId/complete`

---

## 🏢 Workspaces
**Base URL**: `/workspaces`

### Get Workspaces
Get all workspaces the user belongs to.
- **Endpoint**: `GET /`
- **Auth**: Bearer Token

### Create Workspace
- **Endpoint**: `POST /`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "name": "Dev Team",       // required
    "description": "...",     // optional
    "visibility": "private"   // 'private' or 'public'
  }
  ```

### Manage Members
- **Get Members**: `GET /:id/members`
- **Invite Member**: `POST /:id/members`
  - Body: `{ "email": "alice@ex.com", "role": "member" }`
- **Remove Member**: `DELETE /:id/members/:memberId`

---

## 💬 Chat & AI
**Base URL**: `/chat`

### Send Message
Interact with the AIVA AI context.
- **Endpoint**: `POST /message`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "message": "Create a task for tomorrow",
    "workspaceId": "ObjectId",
    "contextData": {} // optional
  }
  ```

### Chat History
- **Endpoint**: `GET /history`
- **Query Params**: `workspaceId` (required)

---

## 🧘 Habits
**Base URL**: `/habits`

### Get Habits
- **Endpoint**: `GET /`
- **Auth**: Bearer Token

### Create Habit
- **Endpoint**: `POST /`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "title": "Morning Jog",
    "frequency": "daily",     // 'daily', 'weekly', 'custom'
    "workspaceId": "ObjectId"
  }
  ```

### Habit Actions
- **Complete Today**: `POST /:id/complete`
- **Analytics**: `GET /analytics/user`

---

## 📝 Notes
**Base URL**: `/notes`

### Get Workspace Notes
- **Endpoint**: `GET /`
- **Query Params**: `workspaceId` (required)

### Create Note
- **Endpoint**: `POST /`
- **Body**:
  ```json
  {
    "title": "Ideas",
    "content": "<h1>My Idea</h1>",
    "workspaceId": "ObjectId"
  }
  ```

---

## 📁 Uploads
**Base URL**: `/uploads`

### Upload File
- **Endpoint**: `POST /`
- **Auth**: Bearer Token
- **Header**: `Content-Type: multipart/form-data`
- **Body**: Form-data with key `file`

---

## 🌩️ Google Integration
**Base URL**: `/google`

- **Auth URL**: `POST /auth-url`
- **Sync**: `POST /sync/:workspaceId/:accountId`
- **Get Tasks**: `GET /tasks/:workspaceId`
- **Get Events**: `GET /events/:workspaceId`

---

## 📊 Quotas
**Base URL**: `/quotas`

- **Status**: `GET /status` (Check API usage limits)
