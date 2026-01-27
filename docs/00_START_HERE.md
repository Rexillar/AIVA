# 🚀 START HERE - AIVA Documentation Guide

> **Complete guide to understanding, building, and deploying AIVA**

---

## 📍 You Are Here

This is your entry point to AIVA documentation. Follow the learning paths below based on your role and goals.

---

## 🎯 Choose Your Path

### 🆕 Path 1: **New to AIVA** (15 minutes)

**Goal:** Understand what AIVA is and see it running

1. **[README.md](README.md)** - Project overview, key features, tech stack
2. **[setup/installation.md](setup/installation.md)** - Get AIVA running locally
3. **[Try AIVA]** - Create tasks, track habits, chat with AI
4. **[features/tasks.md](features/tasks.md)** - Learn task management commands
5. **[features/ai-assistant.md](features/ai-assistant.md)** - Discover AI capabilities

**Time:** 15 minutes | **Difficulty:** 🟢 Beginner

---

### 👨‍💻 Path 2: **Developer** (1 hour)

**Goal:** Understand architecture and start coding

1. **[ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)** - System architecture (7 layers)
2. **[architecture/overview.md](architecture/overview.md)** - Component breakdown
3. **[development/standards.md](development/standards.md)** - Code standards & patterns
4. **[architecture/data-models.md](architecture/data-models.md)** - Database schemas
5. **[development/contributing.md](development/contributing.md)** - Contribution workflow
6. **[architecture/INTENT_CLASSIFICATION_SYSTEM.md](architecture/INTENT_CLASSIFICATION_SYSTEM.md)** - AI intent system
7. **[architecture/CONFIRMATION_FLOW_SYSTEM.md](architecture/CONFIRMATION_FLOW_SYSTEM.md)** - Confirmation flows

**Time:** 1 hour | **Difficulty:** 🟡 Intermediate

---

### 🤖 Path 3: **AI System Deep Dive** (45 minutes)

**Goal:** Master the AI assistant architecture

1. **[architecture/CHATBOT_AI_ARCHITECTURE.md](architecture/CHATBOT_AI_ARCHITECTURE.md)** - Complete AI system overview
2. **[architecture/INTENT_CLASSIFICATION_SYSTEM.md](architecture/INTENT_CLASSIFICATION_SYSTEM.md)** - Pattern matching & Gemini bypass
3. **[architecture/CONFIRMATION_FLOW_SYSTEM.md](architecture/CONFIRMATION_FLOW_SYSTEM.md)** - State management & priority system
4. **[features/AMBIGUITY_DIALOG_INTEGRATION.md](features/AMBIGUITY_DIALOG_INTEGRATION.md)** - Workspace ambiguity resolution
5. **[features/ERROR_HANDLING_GUIDE.md](features/ERROR_HANDLING_GUIDE.md)** - Error handling patterns
6. **[COMPREHENSIVE_COMMAND_IMPLEMENTATION.md](COMPREHENSIVE_COMMAND_IMPLEMENTATION.md)** - All 37 new commands

**Time:** 45 minutes | **Difficulty:** 🔴 Advanced

---

### 🚢 Path 4: **DevOps / Deployment** (30 minutes)

**Goal:** Deploy AIVA to production

1. **[setup/environment.md](setup/environment.md)** - Environment configuration
2. **[setup/DEPLOYMENT.md](setup/DEPLOYMENT.md)** - General deployment guide
3. **[setup/DEPLOYMENT-CHECKLIST.md](setup/DEPLOYMENT-CHECKLIST.md)** - Pre-deployment checklist
4. **[setup/WINDOWS-DEPLOYMENT-GUIDE.md](setup/WINDOWS-DEPLOYMENT-GUIDE.md)** - Windows-specific guide
5. **[setup/AIVA-DEPLOYMENT-BLUEPRINT.md](setup/AIVA-DEPLOYMENT-BLUEPRINT.md)** - Complete deployment blueprint
6. **[setup/NAMECHEAP-DNS-GUIDE.md](setup/NAMECHEAP-DNS-GUIDE.md)** - DNS configuration

**Time:** 30 minutes | **Difficulty:** 🟡 Intermediate

---

### 🔌 Path 5: **API Integration** (30 minutes)

**Goal:** Integrate AIVA with external systems

1. **[api/index.md](api/index.md)** - API overview
2. **[architecture/api-design.md](architecture/api-design.md)** - API design principles
3. **[features/files.md](features/files.md)** - File upload/download APIs
4. **[features/workspaces.md](features/workspaces.md)** - Workspace APIs
5. **[features/notes.md](features/notes.md)** - Notes APIs

**Time:** 30 minutes | **Difficulty:** 🟡 Intermediate

---

## 📚 Documentation Structure

```
docs/
├── 00_START_HERE.md ⭐ YOU ARE HERE
├── README.md                        # Project overview
├── ARCHITECTURE_OVERVIEW.md         # Complete system architecture
│
├── setup/                           # 🚀 Getting Started
│   ├── installation.md             # Quick installation
│   ├── environment.md              # Environment config
│   ├── DEPLOYMENT.md               # Deployment guide
│   ├── DEPLOYMENT-CHECKLIST.md     # Pre-deploy checklist
│   ├── WINDOWS-DEPLOYMENT-GUIDE.md # Windows guide
│   ├── AIVA-DEPLOYMENT-BLUEPRINT.md # Complete blueprint
│   └── NAMECHEAP-DNS-GUIDE.md      # DNS setup
│
├── architecture/                    # 🏗️ System Architecture
│   ├── overview.md                 # Architecture overview
│   ├── CHATBOT_AI_ARCHITECTURE.md  # AI system design
│   ├── INTENT_CLASSIFICATION_SYSTEM.md # Intent patterns
│   ├── CONFIRMATION_FLOW_SYSTEM.md # Confirmation flows
│   ├── data-models.md              # Database schemas
│   └── api-design.md               # API design
│
├── development/                     # 👨‍💻 Development
│   ├── contributing.md             # How to contribute
│   ├── standards.md                # Code standards
│   ├── testing.md                  # Testing guide
│   └── inventory.md                # File inventory
│
├── features/                        # 🎯 Features
│   ├── tasks.md                    # Task management
│   ├── ai-assistant.md             # AI assistant
│   ├── workspaces.md               # Workspaces
│   ├── notes.md                    # Notes
│   ├── files.md                    # File management
│   ├── AMBIGUITY_DIALOG_INTEGRATION.md # Ambiguity handling
│   ├── ERROR_HANDLING_GUIDE.md     # Error handling
│   └── TEST_WORKSPACE_AMBIGUITY.md # Testing guide
│
├── api/                             # 🔌 API Reference
│   └── index.md                    # API documentation
│
├── governance/                      # 📋 Project Governance
│   ├── CODE_OF_CONDUCT.md          # Code of conduct
│   ├── CODING_STANDARDS.md         # Coding standards
│   ├── CONTRIBUTING.md             # Contribution guide
│   ├── STYLE_GUIDE.md              # Style guide
│   ├── TESTING_GUIDELINES.md       # Testing guidelines
│   ├── SECURITY.md                 # Security policy
│   └── RELEASE_PROCESS.md          # Release process
│
└── releases/                        # 📦 Releases
    └── CHANGELOG.md                # Version history
```

---

## 🎓 Core Concepts (Read First)

### 1. **System Architecture**

AIVA uses a 7-layer architecture:

```
Client → API Gateway → Business Logic → AI/Core Services → Data → Cache → External
```

**Key Components:**
- **Frontend:** React + Vite + Redux (client/)
- **Backend:** Node.js + Express + MongoDB (server/)
- **AI Services:** Intent Classifier + Gemini API
- **Storage:** MongoDB + Redis + GCS/MinIO

📖 **Learn more:** [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)

---

### 2. **AI Intent Classification**

AIVA processes 80% of commands locally without AI API calls:

```
User: "delete all tasks"
  ↓ Pattern Match (< 1ms)
  ✅ DELETE_ALL_TASKS (confidence: 0.95, requiresAI: false)
  ↓ Show Confirmation
User: "yes"
  ↓ Execute Deletion
  ✅ Deleted 42 tasks (0 API calls, $0 cost)
```

**80+ Intent Types:** Tasks, Habits, Notes, Workspaces, Files, etc.

📖 **Learn more:** [architecture/INTENT_CLASSIFICATION_SYSTEM.md](architecture/INTENT_CLASSIFICATION_SYSTEM.md)

---

### 3. **Confirmation Flow System**

Destructive actions require two-step confirmation:

```
Step 1: Command Detection → Count → Save State → Prompt
Step 2: "yes" Response → Execute → Clear State → Confirm
```

**Priority System:**
1. **PRIORITY 1:** Confirmations (must run first)
2. **PRIORITY 2:** Workspace ambiguity
3. **PRIORITY 3:** Intent classification

📖 **Learn more:** [architecture/CONFIRMATION_FLOW_SYSTEM.md](architecture/CONFIRMATION_FLOW_SYSTEM.md)

---

### 4. **Data Models**

**Core Models:**
- **User:** Authentication, profile, preferences
- **Workspace:** Collaboration, permissions, members
- **Task:** Todo items, subtasks, progress
- **Habit:** Tracking, streaks, completions
- **Note:** Rich text, sharing, tagging
- **ChatHistory:** Conversations, context, state

📖 **Learn more:** [architecture/data-models.md](architecture/data-models.md)

---

### 5. **Real-time Updates**

Socket.io provides instant synchronization:

```javascript
// Task created → emit event
io.to(workspaceId).emit('task:created', task);

// All clients receive update → Redux state updated → UI re-renders
```

**Events:** task:*, habit:*, workspace:*, notification:*

📖 **Learn more:** [architecture/api-design.md](architecture/api-design.md)

---

## ⚡ Quick Reference

### Most Common Commands

```bash
# Tasks
"create task: Buy groceries"
"complete task: Buy groceries"
"delete all tasks"
"show my tasks"

# Habits
"create habit: Morning meditation"
"mark habit complete: Morning meditation"
"show my habits"

# Workspaces
"create workspace: Marketing Team"
"add user@email.com to workspace"
"list all workspaces"

# Notes
"create note: Meeting notes"
"show all notes"

# AI Assistant
"what tasks are overdue?"
"summarize my progress"
"help me plan my day"
```

📖 **Full command list:** [features/ai-assistant.md](features/ai-assistant.md)

---

### Environment Variables

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/aiva
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key

# Optional
REDIS_URL=redis://localhost:6379
GCS_BUCKET_NAME=aiva-storage
GMAIL_USER=your-email@gmail.com
```

📖 **Complete list:** [setup/environment.md](setup/environment.md)

---

### File Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── services/
│   └── package.json
│
└── server/          # Node.js backend
    ├── controllers/ # Request handlers
    ├── models/      # Mongoose schemas
    ├── routes/      # API routes
    ├── services/    # Business logic
    └── index.js     # Entry point
```

📖 **Complete structure:** [development/inventory.md](development/inventory.md)

---

## 🆘 Need Help?

### Common Issues

**Problem:** "delete all tasks" not working
- **Solution:** Check pattern order in intentClassifier.js (bulk before singular)
- **Docs:** [architecture/INTENT_CLASSIFICATION_SYSTEM.md](architecture/INTENT_CLASSIFICATION_SYSTEM.md#troubleshooting)

**Problem:** "yes" confirmation shows ambiguity error
- **Solution:** Check priority system (confirmations must be PRIORITY 1)
- **Docs:** [architecture/CONFIRMATION_FLOW_SYSTEM.md](architecture/CONFIRMATION_FLOW_SYSTEM.md#troubleshooting)

**Problem:** High Gemini API usage
- **Solution:** Verify intent patterns match correctly (should bypass 80% of requests)
- **Docs:** [architecture/INTENT_CLASSIFICATION_SYSTEM.md](architecture/INTENT_CLASSIFICATION_SYSTEM.md#gemini-api-bypass-strategy)

---

### Support Channels

- 📧 **Email:** support@aiva.com
- 💬 **Discord:** https://discord.gg/aiva
- 🐛 **Bug Reports:** GitHub Issues
- 📖 **Docs:** You're reading them!

---

## 🎯 Next Steps

Based on your role, start here:

| Role | Next Action | Time |
|------|-------------|------|
| **User** | [setup/installation.md](setup/installation.md) | 5 min |
| **Developer** | [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) | 20 min |
| **AI Engineer** | [architecture/CHATBOT_AI_ARCHITECTURE.md](architecture/CHATBOT_AI_ARCHITECTURE.md) | 30 min |
| **DevOps** | [setup/DEPLOYMENT.md](setup/DEPLOYMENT.md) | 15 min |
| **Contributor** | [development/contributing.md](development/contributing.md) | 10 min |

---

## 📈 Documentation Quality

✅ **100% Coverage** - All systems documented
✅ **Code Examples** - Real working code snippets  
✅ **Diagrams** - Architecture visualizations
✅ **Troubleshooting** - Common issues & solutions
✅ **Up-to-date** - Reflects current codebase (Jan 2026)

---

**Last Updated:** January 9, 2026
**Version:** 2.0.0
**Contributors:** 8 developers, 1500+ commits

---

🎉 **Ready to start?** Pick a path above and dive in!
