# Developed Inventory

Generated: October 25, 2025

This document summarizes what has been developed in this repository. It groups features, projects, and key files by area to provide a quick reference for maintainers and new contributors.

## Overview
- Full-stack application with a React + Vite frontend and a Node/Express backend.
- Advanced AI/chatbot integration (Gemini/LLM services) with both server-side and client-side components.
- Workspace-centric collaboration features: tasks, notes, habits, reminders, notifications, file storage, and team management.
- Multiple storage integrations (GCS, MinIO, Mongo file storage) and email/scheduler integrations.

## Top-level docs & metadata
- `package.json` (root) — project manifest
- `package-lock.json` (root) — lockfile
- Docs and guides: `API_DOCUMENTATION.md`, `CHATBOT_API_EXPANSION_GUIDE.md`, `CHATBOT_EXPANSION_SUMMARY.md`, `ENHANCED_AI_README.md`, `ENHANCED_AI_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md`, `PROJECT_ANALYSIS_REPORT.md`, `QUICK_ACTION_GUIDE.md`, `UNIVERSAL_AI_ASSISTANT_UPDATE.md`, `VOICE_COMMAND_GUIDE.md`. (Note: These are in the root directory but should be moved to docs/)

## Client (frontend)
Project: `client/` — React (JSX) + Vite, Tailwind, Redux (RTK & RTK Query), many UI components and pages.

Key files & folders:
- Config & entry: `client/package.json`, `client/vite.config.js`, `client/index.html`, `client/src/main.jsx`, `client/src/index.js`, `client/src/App.jsx`, `client/src/index.css`, `client/.env`, `client/README.md`, `client/capacitor.config.json`.
- Pages: `client/src/pages/*` — Dashboard, Login, Register, Notes, Tasks, Workspace, Calendar, Profile, Users, Invitations, Habits, Task pages (e.g., `Dashboard.jsx`, `Workspace.jsx`, `Tasks.jsx`, `Notes.jsx`, `Note.jsx`, `TaskPage.jsx`).
- Components: `client/src/components/**` — layout/navigation (Sidebar, Navbar, AuthLayout), workspace UI (WorkspaceList, WorkspaceGrid, WorkspaceSelector), tasks (TaskList, TaskCard, TaskDialog, SubtaskDialog, AddTask, TaskChat), notes editor (NoteEditor, DiagramEditor), shared UI (Button, Input, Card, Modals, Chatbot UI), habits (HabitCard, HabitForm, HabitAnalytics), dashboard widgets and charts.
- Chatbot frontend: `client/src/components/shared/Chatbot/*` (Chatbot.jsx, executeAction.js), `client/src/components/shared/Chatbot/executeAction.js`.
- State & data: `client/src/store.js`, `client/src/redux/store.js`, `client/src/redux/slices/*` (authSlice, workspaceSlice, notificationSlice, habitSlice, themeSlice, settingsSlice), `client/src/redux/slices/api/*` (RTK Query slices for auth, user, task, note, upload, reminder, habit, completion, chat).
- Services & hooks: `client/src/services/*` (`authService.js`, `socket.js`), `client/src/hooks/*` (useTaskListState.js, useWorkspaceRestoration.js, useLastPosition.js).
- Utils & helpers: `client/src/utils/*` (assistantPrompt.js, executeAction.js, formatters.js, firebase.js, validation.js, constants.js, errorHandling.js, suppressWarnings.js).
- Styling: `client/tailwind.config.js`, `client/postcss.config.mjs`, `client/src/styles/theme.css`.

## Server (backend)
Project: `server/` — Node.js with Express. Many endpoints, services, and integrations including AI/LLM, storage, email, scheduler, and sockets.

Key files & folders:
- Entry & config: `server/package.json`, `server/index.js`, `server/server.js`, `server/.env`, `server/config/*` (`db.js`, `gcs.js`, `gcs-key.json`, `socket.js`).
- Routes: `server/routes/*` — modular routes: `authRoutes.js`, `chatRoutes.js`, `completionRoutes.js`, `enhancedChatRoutes.js`, `fileRoutes.js`, `habitRoutes.js`, `noteRoutes.js`, `notificationRoutes.js`, `reminderRoutes.js`, `taskRoutes.js`, `uploadRoutes.js`, `workspaceRoutes.js`, plus `server/routes/chat.js`.
- Controllers: `server/controllers/*` — `authController.js`, `chatController.js`, `completionController.js`, `enhancedChatController.js`, `fileController.js`, `habitController.js`, `invitationController.js`, `noteController.js`, `notificationController.js`, `reminderController.js`, `taskController.js`, `userController.js`, `workspaceController.js`, `workspaceTrashController.js`, `agentController.js`.
- Models: `server/models/*` — user, workspace, workspaceInvitation, task, note, chat, chatHistory, Completion, file, habit, reminderModel, notification, Referral, Token, auditLog, and `models/index.js` (likely Mongoose schemas/exports).
- Services: `server/services/*` — AI & assistant: `geminiService.js`, `enhancedGeminiService.js`, `agentService.js`.
  - Storage/file: `gcsService.js`, `gcsFileService.js`, `mongoFileService.js`, `minioService.js`, `googleDriveService.js`, `storageService.js`.
  - Email & notifications: `emailService.js`, `notificationService.js`, `reminderService.js`.
  - Scheduler & helpers: `scheduler.js`, `storageService.js`.
- Middlewares: `server/middlewares/*` — `authMiddleware.js`, `errorMiddleware.js`, `rateLimitMiddleware.js`, `roleMiddleware.js`, `taskMiddleware.js`, `workspaceSecurityMiddleware.js`.
- Prompts & utils: `server/prompts/agentPrompt.js`, `server/utils/*` (`generateToken.js`, `generateOTP.js`, `tokenUtils.js`, `validation.js`, `fileUpload.js`, `upload.js`, `emailService.js`, `scheduler.js`, `enhancedAssistantPrompt.js`, `assistantPrompt.js`, `agentState.js`).
- Uploads & storage docs: `server/uploads/*`, `server/test-storage.js`, `server/STORAGE_CONFIG.md`.

## Features & integrations implemented
- Authentication and role-based access control (routes + `authMiddleware`, `roleMiddleware`).
- Real-time features via sockets (`server/config/socket.js`, `client/src/services/socket.js`).
- Chat and enhanced chat endpoints with LLM backends (`geminiService.js`, `enhancedGeminiService.js`) and server-side prompt orchestration.
- Task management: tasks, subtasks, kanban/board view, file attachments, task-level chat.
- Notes with visual diagram editor and templates (client `DiagramEditor`, docs in `client/docs/VISUAL_DIAGRAM_EDITOR.md`).
- Habits tracking with analytics UI and backend `habitService`.
- Workspace collaboration: create/manage workspaces, team invites, member management, workspace trash.
- File upload & storage across GCS/MinIO/Mongo (controllers, service adapters, `gcs-key.json`).
- Email sending and scheduler-based reminders.
- Notifications (persisted + real-time) and a frontend notification center.

## Utilities & developer helpers
- `server/test-storage.js` — storage testing script
- Validation utilities, token generators, OTP, scheduler utilities, and other helpers under `server/utils/` and `client/src/utils/`.

## Docs & guides available in repo
- Developer and feature docs: `API_DOCUMENTATION.md`, `CHATBOT_API_EXPANSION_GUIDE.md`, `CHATBOT_EXPANSION_SUMMARY.md`, `ENHANCED_AI_README.md`, `ENHANCED_AI_IMPLEMENTATION.md`, `IMPLEMENTATION_SUMMARY.md`, `PROJECT_ANALYSIS_REPORT.md`, `QUICK_ACTION_GUIDE.md`, `VISUAL_INTEGRATION_GUIDE.md`, `DIAGRAM_FEATURES.md`, `ERASER_DIAGRAM_FEATURES.md`, `client/docs/VISUAL_DIAGRAM_EDITOR.md`, `VOICE_COMMAND_GUIDE.md`, `STORAGE_CONFIG.md`.

## How to explore the codebase (quick pointers)
- Frontend: open `client/` and inspect `src/pages/` and `src/components/` for UI and feature wiring; `src/redux/slices/api/` contains RTK Query endpoints that show API surface the frontend consumes.
- Backend: inspect `server/routes/` to see endpoint signatures, then open the corresponding `server/controllers/` and `server/services/` to see business logic and integrations.
- AI/chat: check `server/services/geminiService.js` and `server/services/enhancedGeminiService.js` plus `server/prompts/` and `server/controllers/enhancedChatController.js`.
- Storage & uploads: check `server/config/gcs.js`, `server/services/gcsFileService.js`, `server/services/storageService.js`, and `server/uploads/`.