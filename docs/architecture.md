# System Architecture

**Last Updated**: March 2026

AIVA is built as a modular, full-stack application with a React frontend, Node.js/Express backend, MongoDB database, and deep integrations with Google services and Gemini AI.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER / BROWSER                           │
│                    (PWA — Offline-capable)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                     FRONTEND CLIENT                              │
│  React 18 • Vite • Tailwind CSS • Redux Toolkit (RTK Query)     │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Dashboard  │ │   Tasks    │ │   Notes    │ │   Canvas     │ │
│  │ Calendar   │ │   Habits   │ │  AI Editor │ │  (fabric.js) │ │
│  │ Planner    │ │ Templates  │ │ Knowledge  │ │   Drive      │ │
│  │ Automation │ │  Sources   │ │   Gmail    │ │   Meet       │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (port 5000)
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND SERVER                               │
│  Node.js • Express • Socket.IO                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 MIDDLEWARE LAYER                           │   │
│  │  Auth (JWT) • Rate Limiting • Validation • Security       │   │
│  │  Request Size • Role-Based Access • Workspace Security    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 CONTROLLER LAYER (26 controllers)         │   │
│  │  Auth • Tasks • Notes • Habits • Chat • Canvas • Drive    │   │
│  │  Reminders • Templates • Automation • Intelligence        │   │
│  │  Knowledge • Sources • Orchestration • Gmail • Workspace  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 SERVICE LAYER (35 services)               │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐       │   │
│  │  │ AI Engine        │  │ Integration Services      │       │   │
│  │  │ • Gemini 2.5     │  │ • Google OAuth            │       │   │
│  │  │ • Intent Class.  │  │ • Calendar Sync           │       │   │
│  │  │ • Context Mgr    │  │ • Tasks Sync              │       │   │
│  │  │ • Unified Chat   │  │ • Gmail                   │       │   │
│  │  │ • Voice Proc.    │  │ • Drive                   │       │   │
│  │  └─────────────────┘  └──────────────────────────┘       │   │
│  │                                                           │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐       │   │
│  │  │ Intelligence     │  │ Core Services             │       │   │
│  │  │ • Exec. Engine   │  │ • Encryption (AES-256)    │       │   │
│  │  │ • Knowledge Idx  │  │ • Notification            │       │   │
│  │  │ • Orchestration  │  │ • Scheduler               │       │   │
│  │  │ • Automation     │  │ • Storage (Multi-backend) │       │   │
│  │  │ • Meeting Intel  │  │ • Email                   │       │   │
│  │  └─────────────────┘  └──────────────────────────┘       │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────┬───────────────────────────┘
               │                      │
┌──────────────▼──────────┐ ┌─────────▼───────────────────────────┐
│     MongoDB Atlas        │ │         External Services            │
│  28 Collections          │ │  • Google APIs (OAuth, Calendar,     │
│  AES-256-GCM Encryption  │ │    Tasks, Drive, Gmail, Meet)        │
│  Mongoose ODM            │ │  • Gemini 2.5 Flash (AI/LLM)        │
│                          │ │  • SMTP (Email Service)              │
└──────────────────────────┘ └─────────────────────────────────────┘
```

---

## Components

### 1. Frontend Client

- **Tech Stack**: React 18, Vite, Tailwind CSS, Redux Toolkit with RTK Query
- **State Management**: RTK Query for API caching + Redux slices for UI state
- **Pages**: 35 page components covering Dashboard, Tasks, Notes, Habits, Calendar, Canvas, Drive, Gmail, Knowledge Hub, Planner, Automation, Templates, Sources, and more
- **Editor**: TipTap rich-text editor with Table, TextAlign, Highlight, Color, Subscript/Superscript extensions
- **Canvas**: fabric.js-based infinite canvas with shapes, connectors, text, sticky notes, grid, zoom, and AI diagram generation
- **PWA**: Full offline-first PWA with service worker, manifest, and background sync
- **Real-time**: Socket.IO for notifications and real-time collaboration
- **Theming**: Dark/light mode with Tailwind's `dark:` class strategy

### 2. Backend Server

- **Tech Stack**: Node.js, Express, ESM modules
- **Authentication**: JWT-based with OTP email verification, password reset flow
- **Encryption**: AES-256-GCM application-level encryption for sensitive fields (notes, workspaces, chat history)
- **AI**: Gemini 2.5 Flash via REST API for:
  - Natural language intent classification (31+ intents)
  - Deterministic command execution (task CRUD, habit management, reminders, etc.)
  - Content formatting (notes AI formatter)
  - Intelligence analysis (burnout, focus, gaps, habits)
  - Daily summaries and proactive suggestions
  - Diagram generation from prompts
- **Middleware**: 10 middleware modules (auth, rate limiting, validation, security, workspace security, role-based access, request size limits, error handling)
- **Services**: 35 service modules covering AI, integrations, storage, scheduling, and domain logic
- **Controllers**: 26 controller modules with comprehensive CRUD + business logic

### 3. Database

- **Tech Stack**: MongoDB Atlas with Mongoose ODM
- **Models**: 28 collections covering Users, Tasks, Notes, Habits, Workspaces, Canvas, Chat, Files, Google integrations, Automation rules, Templates, Sources, Reminders, Notifications, and more
- **Encryption**: Mongoose encryption plugin applies AES-256-GCM to sensitive document fields
- **Persistence**: Docker volumes for local development; MongoDB Atlas for production

### 4. Integrations

| Service | Purpose |
|---------|---------|
| **Google Calendar** | Two-way sync of events and tasks |
| **Google Tasks** | CRUD operations on external tasks |
| **Google Drive** | File upload/download/share/search |
| **Gmail** | Read inbox, search emails, thread view |
| **Google Meet** | Create instant meeting rooms |
| **Gemini 2.5 Flash** | AI/LLM for chat, intelligence, formatting |
| **SMTP** | Email notifications, OTP, password reset |

---

## Communication

- **REST API**: Frontend ↔ Backend via RESTful endpoints (25 route groups, 200+ endpoints)
- **Real-time**: Socket.IO for push notifications, chat updates, and collaboration events
- **Proxy**: Vite dev server proxies `/api` requests to `localhost:5000`

---

## Data Flow

### Chat/AI Request Flow
```
User Message → Frontend → POST /api/chat/message
  → authMiddleware (JWT validation)
  → chatController.sendMessage()
    → unifiedChatbotService
      → intentClassifier (Gemini-based NLU)
      → Deterministic handler (if known intent)
        OR Gemini conversation (if general chat)
    → Response with action result + AI message
  ← { success: true, data: { message, action, result } }
```

### Encryption Flow
```
Write: Controller → Mongoose .save() → encryptionPlugin pre-save hook
  → AES-256-GCM encrypt(field) → MongoDB stores ciphertext

Read: MongoDB → Mongoose .find() → post-init hook → decrypt(field)
  → Controller receives plaintext → API response
```

### Note AI Formatting Flow
```
User pastes messy data → AI Format Panel (Ctrl+Shift+F)
  → POST /api/notes/:id/ai-format { text, outputFormat }
  → Gemini 2.5 Flash formats to clean HTML
  → Server-side sanitization (strip thead/tbody, inline styles, whitespace)
  → Client-side sanitization (sanitizeTableHtml)
  → TipTap editor .insertContent(cleanHtml)
```

---

## Security Layers

1. **Authentication**: JWT with configurable expiration
2. **Authorization**: Role-based (Owner > Admin > Member > Viewer) + workspace-scoped
3. **Encryption at Rest**: AES-256-GCM for sensitive fields
4. **Encryption in Transit**: HTTPS/TLS
5. **Rate Limiting**: Tiered per endpoint type (standard, AI, auth, uploads)
6. **Input Validation**: Express-validator middleware
7. **Security Headers**: Helmet.js + custom headers
8. **CORS**: Configurable origin whitelist

---

## File Storage Architecture

AIVA supports multiple storage backends (configured via `STORAGE_PROVIDER`):

| Backend | Use Case |
|---------|----------|
| **MongoDB GridFS** | Default — files stored in the database |
| **MinIO/S3** | Self-hosted object storage |
| **Google Cloud Storage** | Cloud-native storage |
| **Local Filesystem** | Development only |
