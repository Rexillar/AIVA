# Getting Started

**Last Updated**: March 2026

Get AIVA running locally in under 10 minutes.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Comes with Node.js |
| MongoDB | 6+ | Atlas (cloud) or local instance |
| Git | Any | For cloning the repo |
| Docker | 24+ | **Optional** — for containerized setup |

---

## Quick Start (Non-Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/aiva.git
cd aiva
```

### 2. Set Up the Backend
```bash
cd server
npm install
```

Create `server/.env` with your configuration (see [Configuration](./configuration.md)):
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aiva
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-64-char-hex-encryption-key
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:3000
```

Generate an encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the server:
```bash
npm run dev
```
Server runs on `http://localhost:5000`.

### 3. Set Up the Frontend
```bash
cd ../client
npm install
npm run dev
```
Client runs on `http://localhost:3000` with automatic API proxy to port 5000.

### 4. Open the App
Navigate to **http://localhost:3000** in your browser. Create an account and start using AIVA.

---

## Quick Start (Docker)

### 1. Clone & Configure
```bash
git clone https://github.com/your-org/aiva.git
cd aiva
```

Copy and edit the environment file:
```bash
cp docker-hub/hub.env.example .env
# Edit .env with your values
```

### 2. Start with Docker Compose
```bash
docker-compose up --build
```

Or use the Docker Hub images:
```bash
cd docker-hub
docker-compose up
```

### 3. Access the App
Navigate to **http://localhost:3000**.

---

## Optional Setup

### Google Integrations
To enable Google Calendar, Tasks, Drive, Gmail, and Meet:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable required APIs (Calendar, Tasks, Drive, Gmail)
3. Create OAuth 2.0 credentials
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`
5. See [Gemini API Setup](./GEMINI_API_SETUP.md) for AI-specific setup

### Email Verification
To enable email verification and password reset:
1. Create a Gmail App Password (Settings → Security → App Passwords)
2. Add `GMAIL_USER` and `GMAIL_PASS` to `.env`

### PWA / Offline Mode
AIVA is a Progressive Web App out of the box:
- Installable from the browser's address bar
- Service worker caches assets for offline access
- Background sync queues writes when offline

---

## Verify Installation

After starting both server and client:

| Check | Expected |
|-------|----------|
| `http://localhost:5000/api/health` | `{ "status": "ok" }` or server response |
| `http://localhost:3000` | AIVA landing page / login screen |
| Create account | Registration completes, redirects to dashboard |
| Create a task | Task persists after page refresh |
| Open AI chat | Gemini responds (requires valid `GEMINI_API_KEY`) |

---

## Project Launcher (Windows)

For Windows users, AIVA includes a desktop launcher:
```
launcher/
├── manager.js          # Process manager
├── AivaControl.vbs     # VBS script to start AIVA
├── aiva-pids.json      # Process tracking
└── docker-compose.yml  # Docker launcher config
```

Double-click `AivaControl.vbs` to start both server and client.

---

## Next Steps

- [Architecture](./architecture.md) — Understand how AIVA is built
- [Development Guide](./development.md) — Set up for contributing
- [API Endpoints](./API_ENDPOINTS.md) — Full API reference
- [Configuration](./configuration.md) — All environment variables
- [Gemini API Setup](./GEMINI_API_SETUP.md) — Configure AI features
