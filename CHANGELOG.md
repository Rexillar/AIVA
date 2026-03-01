# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-01

### Added

- **Execution Intelligence Engine** — New analytics subsystem (`executionIntelligenceEngine.js`, 590+ lines) with productivity scoring, task predictions, workload analysis, and performance insights
- **AI Note Formatting** — Inline Gemini-powered panel in NoteEditor (Ctrl+Shift+F) to convert messy data into clean tables, summaries, bullet points; 6 output formats with custom instructions
- **Knowledge Hub** — Full-stack knowledge management with knowledge graph, concept linking, and AI-powered extraction (`knowledgeController`, `knowledgeIndexService`, `KnowledgePage`)
- **Work Orchestrator** — AI-powered daily planner that suggests optimal task scheduling based on deadlines, priorities, and patterns (`orchestrationController`, `orchestrationService`, `PlannerPage`)
- **Automation Engine** — Rule-based automation system with multi-action support (`automationController`, `automationEngine`, `AutomationPage`)
- **Template System** — Task template library for reusable workflows (`templateController`, `TemplatesPage`)
- **Source Citations** — Source reference management for knowledge items (`sourceController`, `SourcesPage`)
- **Gmail Integration** — Email management through Google API (`gmailController`, `gmailService`)
- **PWA Infrastructure** — Service worker (`sw.js`) with offline-first caching, background sync, manifest, install prompt, and offline status hook
- **7 new RTK Query API slices** — `automationApiSlice`, `gmailApiSlice`, `intelligenceApiSlice`, `knowledgeApiSlice`, `orchestrationApiSlice`, `sourceApiSlice`, `templateApiSlice`
- **6 new Mongoose models** — `automationRule`, `decisionLog`, `meetingTranscript`, `source`, `taskTemplate`, `voiceChannel`
- **7 new route files** — `automationRoutes`, `gmailRoutes`, `intelligenceRoutes`, `knowledgeRoutes`, `orchestrationRoutes`, `sourceRoutes`, `templateRoutes`
- **5 new pages** — KnowledgePage, PlannerPage, AutomationPage, TemplatesPage, SourcesPage with sidebar navigation
- **WorkspaceMeet page** — Google Meet integration page
- **Recurring task service** — `recurringTaskService.js` for scheduled task recurrence
- **Speech-to-text service** — `speechToTextService.js` using Whisper models
- **Meeting intelligence service** — `meetingIntelligenceService.js` for meeting analysis

### Fixed

- **Encrypted note titles** — All 6 note endpoints now correctly decrypt titles via `safeNoteToObject()` helper; `decryptDocument()` upgraded for nested fields and string arrays
- **Table rendering in dark mode** — Removed inline `#f3f4f6` background from Gemini prompt; added theme-aware CSS with `!important` overrides
- **Table insertion empty cells** — Sanitized HTML by stripping `<thead>`, `<tbody>`, `<colgroup>` wrappers and inter-tag whitespace before TipTap insertion
- **TipTap dependency conflicts** — Downgraded 5 packages from v3.19.0 to v2.11.5 to align with `@tiptap/core@^2.11.5` ecosystem
- **Reminder API routing** — Fixed route mounting for reminder endpoints
- **Canvas workspace scoping** — Canvas operations now properly scoped to workspace context
- **Workspace integration consistency** — All routes respect private vs. public workspace differentiation

### Changed

- **Canvas** — Removed frame tool entirely (~200 lines, 15+ edit points) from FocusCanvas; retained grid toggle
- **30+ deterministic CRUD handlers** — AI chatbot now uses deterministic handlers for task/note/habit/reminder CRUD instead of AI-only responses
- **Intent classifier** — Enhanced with workspace-aware context and improved accuracy
- **Unified chatbot service** — Expanded from ~4 working handlers to 31+ intent coverage
- **Workspace dashboard** — Updated with workspace-type awareness (private vs shared)
- **Sidebar navigation** — Added 5 Intelligence section links (Knowledge, Planner, Automation, Templates, Sources)
- **Note model encryption** — Fields encrypted: `title`, `content`, `tags`, `attachments.filename`, `versionHistory.content`

### Documentation

- Complete rewrite of all 13 documentation files based on comprehensive codebase audit
- **API_ENDPOINTS.md** — 550+ lines covering all 200+ endpoints across 20+ route groups
- **architecture.md** — ASCII architecture diagrams, component breakdown, data flow diagrams
- **security.md** — AES-256-GCM details, middleware pipeline, RBAC documentation
- **PRIVACY_ARCHITECTURE.md** — New file covering encryption at rest, workspace isolation, data policies
- **GEMINI_API_SETUP.md** — New comprehensive Gemini configuration guide
- **configuration.md** — Complete environment variable reference (30+ variables)
- All other docs (development, getting-started, api, docker, contributing, faq, README) fully rewritten

### Removed

- **Gamification system** — Removed `gamificationService.js`, `gamificationRoutes.js`
- **Redis quota manager** — Removed `redisQuotaManager.js` middleware
- **Server encryption docs** — Removed `server/docs/ENCRYPTION.md` (replaced by main docs)
- **Canvas frame tool** — Removed frame creation, frame state, keyboard shortcut, and all related logic

---

## [0.2.0] - Previous

- Initial Notes editor with Word-like features (#11)
- Basic task management
- Google Calendar/Tasks sync
- Workspace system
- AI chatbot (basic)

## [0.1.0] - Initial

- First commit
- Project README
