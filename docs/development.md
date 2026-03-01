# Development Guide

**Last Updated**: March 2026

This guide covers setting up AIVA for local development, understanding the project structure, and contributing code.

---

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **MongoDB**: Atlas account or local instance
- **Git**: For version control
- **Docker** (optional): For MongoDB or full-stack containerized development

---

## Development Environment

### Option 1: Hybrid (Recommended)

Run MongoDB in Docker (or use Atlas), and run backend/frontend locally for hot-reloading.

1. **Start MongoDB** (if using Docker):
   ```bash
   docker-compose up -d mongo
   ```

2. **Backend**:
   ```bash
   cd server
   npm install
   cp .env.example .env   # Edit with your secrets
   npm run dev
   ```
   Server starts on `http://localhost:5000`

3. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Client starts on `http://localhost:3000` with Vite proxy to backend

### Option 2: Full Docker

Run everything in Docker — useful for testing production builds:
```bash
docker-compose up --build
```

---

## Project Structure

```
AIVA/
├── client/                     # React frontend (Vite)
│   ├── public/                 # Static assets, PWA manifest, service worker
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js              # Service worker (offline-first)
│   │   └── assets/            # Images, icons
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── notes/         # NoteEditor (TipTap + AI Format panel)
│   │   │   ├── chat/          # Chat interface components
│   │   │   ├── tasks/         # Task management components
│   │   │   ├── workspace/     # Workspace UI (sidebar, dashboard)
│   │   │   └── ...
│   │   ├── pages/             # 35 page-level components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tasks.jsx / TaskPage.jsx / TaskDetails.jsx
│   │   │   ├── Notes.jsx / Note.jsx
│   │   │   ├── Habits.jsx / HabitDetails.jsx
│   │   │   ├── Calendar.jsx / WorkspaceCalendar.jsx
│   │   │   ├── FocusCanvas.jsx        # fabric.js canvas
│   │   │   ├── Drive.jsx              # Google Drive integration
│   │   │   ├── KnowledgePage.jsx      # Knowledge Hub
│   │   │   ├── PlannerPage.jsx        # AI daily planner
│   │   │   ├── AutomationPage.jsx     # Automation rules
│   │   │   ├── TemplatesPage.jsx      # Task templates
│   │   │   ├── SourcesPage.jsx        # Source citations
│   │   │   ├── AIAssistant.jsx        # AI chat interface
│   │   │   ├── WorkspaceDashboard.jsx
│   │   │   ├── WorkspaceMeet.jsx      # Google Meet
│   │   │   └── ...
│   │   ├── redux/             # Redux store & slices
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── api/       # 18 RTK Query API slices
│   │   │       ├── authSlice.js
│   │   │       ├── themeSlice.js
│   │   │       └── ...
│   │   ├── services/          # API service helpers
│   │   ├── context/           # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # Global styles
│   ├── vite.config.js         # Vite config with API proxy
│   ├── tailwind.config.js     # Tailwind configuration
│   └── package.json
│
├── server/                    # Node.js/Express backend
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   ├── socket.js         # Socket.IO setup
│   │   ├── gcs.js            # Google Cloud Storage config
│   │   └── gcs-key.json      # GCS service account key
│   ├── controllers/          # 26 route handlers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── noteController.js       # Includes AI format endpoint
│   │   ├── chatController.js
│   │   ├── canvasController.js
│   │   ├── intelligenceController.js
│   │   ├── knowledgeController.js
│   │   ├── orchestrationController.js
│   │   ├── automationController.js
│   │   └── ...
│   ├── middlewares/          # 10 middleware modules
│   │   ├── authMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── advancedRateLimitMiddleware.js
│   │   ├── securityMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── workspaceSecurityMiddleware.js
│   │   ├── requestSizeMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── taskMiddleware.js
│   ├── models/               # 28 Mongoose models
│   │   ├── user.js
│   │   ├── task.js
│   │   ├── note.js           # Encrypted fields: title, content, tags, etc.
│   │   ├── workspace.js
│   │   ├── canvas.js
│   │   ├── habit.js
│   │   ├── automationRule.js
│   │   └── ...
│   ├── routes/               # 25 route files (17 actively mounted)
│   │   ├── index.js          # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── canvasRoutes.js
│   │   └── ...
│   ├── services/             # 35 service modules
│   │   ├── unifiedChatbotService.js   # Main AI chatbot (31+ intents)
│   │   ├── intentClassifier.js        # Gemini-based NLU
│   │   ├── executionIntelligenceEngine.js  # Analytics engine
│   │   ├── knowledgeIndexService.js   # Knowledge graph builder
│   │   ├── orchestrationService.js    # Work planner
│   │   ├── automationEngine.js        # Rule automation
│   │   ├── geminiService.js           # Gemini API wrapper
│   │   ├── googleSyncService.js       # Google Calendar/Tasks sync
│   │   ├── storageService.js          # Multi-backend file storage
│   │   └── ...
│   ├── utils/
│   │   ├── encryption.js     # AES-256-GCM encryption utilities
│   │   └── ...
│   ├── prompts/              # AI prompt templates
│   ├── server.js             # Express app setup
│   ├── index.js              # Entry point (starts server)
│   └── package.json
│
├── docs/                     # Documentation
├── docker/                   # Docker utilities
├── launcher/                 # Desktop launcher scripts
└── docker-hub/               # Docker Hub deployment files
```

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI components |
| Frontend | Vite | Build tool with HMR |
| Frontend | Tailwind CSS | Utility-first styling |
| Frontend | Redux Toolkit / RTK Query | State management & API caching |
| Frontend | TipTap | Rich-text editor for notes |
| Frontend | fabric.js | Canvas drawing/diagramming |
| Backend | Express | HTTP server framework |
| Backend | Mongoose | MongoDB ODM |
| Backend | Socket.IO | Real-time WebSocket events |
| Backend | node-fetch | HTTP client for Gemini API |
| AI | Gemini 2.5 Flash | LLM for chat, intelligence, formatting |
| Auth | JSON Web Tokens | Stateless authentication |
| Crypto | AES-256-GCM | Application-level field encryption |
| PWA | Service Worker | Offline caching & background sync |

---

## Coding Standards

### ESLint
ESLint is configured for both client and server. Run before committing:
```bash
cd client && npm run lint
cd server && npm run lint
```

### Commit Messages
We use **Conventional Commits**:
```
feat(notes): add AI formatting endpoint
fix(encryption): handle nested field decryption
docs: update API endpoints documentation
```

### Git Hooks
Configured via `commitlint.config.cjs` and `lint-staged.config.js`:
- **commitlint**: Enforces conventional commit format
- **lint-staged**: Runs ESLint on staged files

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Model** (if new data): Create in `server/models/`
2. **Controller**: Add handler in `server/controllers/`
3. **Route**: Define route in `server/routes/`
4. **Mount**: Add to `server/routes/index.js` or `server/server.js`
5. **RTK Query**: Add mutation/query in `client/src/redux/slices/api/`
6. **Frontend**: Consume via RTK Query hooks in components

### Adding a New Page

1. Create page component in `client/src/pages/`
2. Add route in the router configuration
3. Add sidebar navigation link if needed
4. Create any needed API slices in `client/src/redux/slices/api/`

### Working with Encryption

The Note model encrypts: `title`, `content`, `tags`, `attachments.filename`, `versionHistory.content`

- **Writing**: Mongoose encryption plugin auto-encrypts on `.save()`
- **Reading**: `post('init')` hook auto-decrypts on `.find()/.findById()`
- **Gotcha**: `.lean()` queries bypass decryption — use `decryptDocument()` utility
- **Gotcha**: `.toObject()` reads raw `_doc` (encrypted) — use `safeNoteToObject()` helper

### Working with Gemini AI

The Gemini API key is set via `GEMINI_API_KEY` in `server/.env`. The service uses the REST API directly:
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  { method: 'POST', body: JSON.stringify({ contents: [...] }) }
);
```

---

## Environment Variables

See [Configuration](./configuration.md) for the complete list of required environment variables.
