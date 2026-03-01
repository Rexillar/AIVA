# Frequently Asked Questions

**Last Updated**: March 2026

---

## General

### What is AIVA?
AIVA (AI Virtual Assistant) is a full-stack productivity platform with AI-powered task management, note-taking, habit tracking, canvas drawing, knowledge management, and Google integrations. It features a 31+ intent AI chatbot, end-to-end encryption, workspace collaboration, and a Progressive Web App for offline access.

### What tech stack does AIVA use?
- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit (RTK Query), TipTap editor, fabric.js canvas
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO
- **AI**: Google Gemini 2.5 Flash
- **Auth**: JWT + Google OAuth 2.0
- **Encryption**: AES-256-GCM at the application layer

### Is AIVA free?
AIVA is open source. However, you'll need:
- A MongoDB instance (Atlas free tier works)
- A Gemini API key (free tier available)
- Optionally, Google Cloud credentials for integrations

---

## Setup & Installation

### Do I need Docker?
No. Docker is optional. You can run the server and client directly with Node.js. See [Getting Started](./getting-started.md).

### What Node.js version do I need?
Node.js 18 or higher (LTS recommended).

### How do I generate an encryption key?
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
This produces a 64-character hex string for the `ENCRYPTION_KEY` environment variable.

### Can I use a local MongoDB instead of Atlas?
Yes. Set `MONGODB_URI=mongodb://localhost:27017/aiva` in your `.env` file. You can run MongoDB locally or in Docker.

### How do I set up Google integrations?
1. Create a Google Cloud project
2. Enable Calendar, Tasks, Drive, and Gmail APIs
3. Create OAuth 2.0 credentials
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
See [Gemini API Setup](./GEMINI_API_SETUP.md) for more.

---

## AI Features

### What AI model does AIVA use?
Google Gemini 2.5 Flash, accessed via the REST API (not the SDK).

### What can the AI chatbot do?
The chatbot handles 31+ intents including:
- Create, update, delete, list tasks
- Create and manage notes, habits, reminders
- Analytics and productivity insights
- Daily planning and scheduling
- Knowledge base queries
- Canvas diagram generation
- And more — see [API Endpoints](./API_ENDPOINTS.md)

### What is AI Note Formatting?
The note editor includes an AI format panel (Ctrl+Shift+F) that can:
- Convert messy pasted data into clean tables
- Format text as summaries, bullet points, or structured documents
- Clean up and restructure existing note content
- Output in multiple formats: table, summary, bullet list, etc.

### How much does the Gemini API cost?
The free tier includes 15 RPM and 1,500 requests/day — sufficient for personal use. See [Google's pricing](https://ai.google.dev/pricing) for paid plans.

---

## Canvas

### What can I draw on the canvas?
- Shapes (rectangle, circle, triangle, diamond, star, arrow, line, hexagon, pentagon)
- Text and sticky notes
- Connectors between objects
- Free draw with color picker
- AI-generated diagrams from text descriptions

### What export formats are supported?
PNG, SVG, PDF, and AIVA format (JSON for re-importing).

### Is the canvas infinite?
Yes — infinite grid with zoom (mouse wheel or pinch) and pan (middle-click drag or Space+drag).

---

## Notes & Encryption

### Are my notes encrypted?
Yes. Note `title`, `content`, `tags`, `attachments.filename`, and `versionHistory.content` are encrypted with AES-256-GCM before storage in MongoDB.

### What happens if I lose the encryption key?
Encrypted data becomes permanently unreadable. **Back up your `ENCRYPTION_KEY` securely.**

### Why do I see `enc:` prefixed text?
This means a decryption error occurred. Check that `ENCRYPTION_KEY` in your `.env` matches the key used when the data was created.

### Can I use `.lean()` queries on encrypted models?
Not directly. The `post('init')` decryption hook is bypassed by `.lean()`. Use the `decryptDocument()` utility on lean results.

---

## Workspaces

### How do workspaces work?
Each user has a default private workspace. Additional workspaces can be created for collaboration. All resources (tasks, notes, habits, canvas, etc.) are scoped to a workspace.

### What workspace roles exist?
| Role | Permissions |
|------|------------|
| Owner | Full control |
| Admin | Manage resources and members |
| Member | CRUD on own resources |
| Viewer | Read-only |

### Can I invite people to my workspace?
Yes. Use the workspace invitation system to invite by email. Invitees receive an email link to accept.

---

## PWA & Offline

### Can I use AIVA offline?
Yes. AIVA is a Progressive Web App with:
- Service worker caching for offline access to cached pages
- Background sync for queuing writes when offline
- Install-to-home-screen on mobile and desktop

### How do I install AIVA as a PWA?
Click the install icon in your browser's address bar (Chrome, Edge) or use "Add to Home Screen" on mobile.

---

## Troubleshooting

### Server won't start
- Check that `MONGODB_URI` is correct and accessible
- Ensure all required env variables are set (see [Configuration](./configuration.md))
- Check for port conflicts on 5000

### AI features return errors
- Verify `GEMINI_API_KEY` is set and valid
- Check server console for Gemini API error details
- Ensure you haven't exceeded Google's rate limits

### Login fails after restart
- JWT tokens expire — log in again to get a fresh token
- If using cookies, ensure `CLIENT_URL` matches the browser origin

### Tasks/notes don't persist
- Check MongoDB connection in server logs
- Verify the workspace context is set in the frontend
- Check browser console for API errors

### Dark mode looks wrong
- Ensure Tailwind's dark mode (`dark:` variants) is used
- Avoid inline background colors in dynamic content
- The AI format panel auto-adapts to the current theme
