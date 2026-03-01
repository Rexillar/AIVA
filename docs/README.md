# AIVA Documentation

**Last Updated**: March 2026

Welcome to the AIVA documentation. AIVA is a full-stack AI-powered productivity platform featuring task management, note-taking with AI formatting, habit tracking, canvas drawing, knowledge management, workspace collaboration, and deep Google integrations.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Getting Started](./getting-started.md) | Installation and first run |
| [Architecture](./architecture.md) | System design, component breakdown, data flows |
| [Configuration](./configuration.md) | All environment variables |
| [Development Guide](./development.md) | Project structure and dev environment |
| [API Overview](./api.md) | API concepts, auth, response format |
| [API Endpoints](./API_ENDPOINTS.md) | Complete 200+ endpoint reference |
| [Security](./security.md) | Auth, RBAC, encryption, rate limiting |
| [Privacy Architecture](./PRIVACY_ARCHITECTURE.md) | Encryption at rest, workspace isolation, data policies |
| [Docker Guide](./docker.md) | Docker setup and deployment |
| [Gemini API Setup](./GEMINI_API_SETUP.md) | Configure Google Gemini for AI features |
| [Contributing](./contributing.md) | Workflow, conventions, PR guidelines |
| [FAQ](./faq.md) | Common questions and troubleshooting |

---

## Platform Overview

### Scale
- **35 page-level components** across the frontend
- **200+ API endpoints** across 20+ route groups
- **26 controllers**, **35 services**, **28 models**
- **30+ Redux slices** for state management
- **31+ AI intents** handled by the chatbot

### Key Features

#### Task Management
Full CRUD with priorities (urgent/high/medium/low), stages (open/in-progress/review/completed/blocked), due dates, recurring tasks, subtasks, workspace scoping, and AI-powered task creation via chat.

#### Notes with AI Formatting
Rich-text editor (TipTap) with tables, formatting, and an AI formatting panel (Ctrl+Shift+F) that converts messy data into clean tables, summaries, or structured documents using Gemini 2.5 Flash. Notes are encrypted at rest (AES-256-GCM).

#### Canvas
fabric.js-based infinite canvas with shapes, text, sticky notes, connectors, free draw, AI diagram generation, export (PNG/SVG/PDF/AIVA), dark mode, undo/redo, and auto-save.

#### AI Chat (31+ Intents)
Natural language chatbot powered by Gemini with deterministic CRUD handlers and AI fallback. Supports task/note/habit/reminder management, analytics, planning, knowledge queries, and diagram generation.

#### Knowledge Hub
Knowledge graph with concept linking, source citations, templates, and AI-powered knowledge extraction.

#### Intelligence Engine
Execution intelligence with productivity analytics, task predictions, workload analysis, and performance insights.

#### Work Orchestrator
AI-powered daily planning — suggests optimal task scheduling based on deadlines, priorities, and user patterns.

#### Workspace Collaboration
Multi-workspace support with role-based access (owner/admin/member/viewer), workspace invitations, shared resources, and workspace-scoped data isolation.

#### Google Integrations
- **Google Calendar**: Bidirectional event sync
- **Google Tasks**: Task sync with Google Tasks
- **Google Drive**: File management and sharing
- **Gmail**: Email management
- **Google Meet**: Meeting creation and management

#### Habits & Reminders
Habit tracking with streaks, frequency settings, and progress visualization. Reminder scheduling with notification delivery.

#### PWA & Offline
Progressive Web App with service worker, offline-first caching, background sync for writes, and install-to-home-screen.

#### Security
AES-256-GCM field-level encryption, JWT authentication, RBAC authorization, rate limiting (standard + advanced), input validation, Helmet security headers, and CORS protection.

---

## Architecture at a Glance

```
┌─────────────────────────────┐
│   Client (React + Vite)     │  Port 3000
│   - 35 Pages                │
│   - RTK Query + Redux       │
│   - TipTap Editor           │
│   - fabric.js Canvas        │
│   - Service Worker (PWA)    │
└──────────────┬──────────────┘
               │ HTTP / WebSocket
┌──────────────▼──────────────┐
│   Server (Express + Node)   │  Port 5000
│   - 26 Controllers          │
│   - 35 Services             │
│   - 10 Middlewares           │
│   - Socket.IO               │
└──────┬──────────┬───────────┘
       │          │
┌──────▼───┐ ┌───▼──────────┐
│ MongoDB  │ │ Google APIs   │
│ Atlas    │ │ - Gemini AI   │
│ 28 Models│ │ - Calendar    │
│ AES-256  │ │ - Tasks/Drive │
└──────────┘ └──────────────┘
```

---

## Recent Changes

### March 2026
- **AI Note Formatting**: Inline AI panel in NoteEditor for formatting messy data with Gemini
- **Table Rendering Fixes**: Theme-aware table headers (dark mode), sanitized HTML for clean TipTap insertion
- **Encrypted Note Title Fix**: All 6 note endpoints now correctly decrypt titles via `safeNoteToObject()`
- **Canvas Frame Tool Removed**: Cleaned up ~200 lines of frame tool code from FocusCanvas
- **Knowledge Hub Rewrite**: Full frontend rewrite with workspace-type awareness
- **Documentation Overhaul**: Complete rewrite of all 13 documentation files

### Earlier Updates
- Execution Intelligence Engine (590+ lines): Analytics, predictions, workload analysis
- 30+ deterministic CRUD intent handlers for the AI chatbot
- 13-gap backend implementation: models, services, controllers, routes, slices
- 5 Intelligence pages: Knowledge, Planner, Automation, Templates, Sources
- Perfect workspace integration across all routes
- PWA infrastructure with service worker and manifest
- Multi-backend file storage (GridFS, GCS, Google Drive, MinIO)
