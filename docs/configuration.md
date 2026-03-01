# Configuration

**Last Updated**: March 2026

All server-side configuration is done via environment variables in `server/.env`. The client uses Vite's build-time variables and a proxy to the backend.

---

## Server Environment Variables

### Core

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` (server.js) / `8081` (index.js) | HTTP server port |
| `NODE_ENV` | No | `development` | Set to `production` for production builds |
| `MONGODB_URI` / `MONGO_URI` | **Yes** | — | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JSON Web Tokens |
| `ENCRYPTION_KEY` | **Yes** | — | 256-bit hex key for AES-256-GCM field encryption |
| `CLIENT_URL` | No | `http://localhost:3000` | Frontend origin (used for CORS, emails, OAuth redirects) |
| `SERVER_URL` | No | `http://localhost:5000` | Backend origin (used for Google OAuth callback) |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |

### Google AI (Gemini)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key for all AI features (chat, formatting, intelligence, diagrams) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | — | Alternative Gemini key (fallback) |

### Google OAuth & Integrations

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | **Yes*** | — | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | **Yes*** | — | OAuth 2.0 client secret |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | No | Random | Encryption key for stored Google OAuth tokens |
| `GOOGLE_SYNC_ENABLED` | No | `true` | Set to `false` to disable Google Calendar/Tasks sync |

*Required only if using Google integrations (Calendar, Tasks, Drive, Gmail, Meet)

### Email (SMTP via Gmail)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GMAIL_USER` | **Yes*** | — | Gmail address for sending verification/reset emails |
| `GMAIL_PASS` | **Yes*** | — | Gmail app password (not account password) |

*Required only if email verification or password reset is enabled

### File Storage

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STORAGE_TYPE` | No | `google-drive` / `gridfs` | Storage backend: `google-drive`, `gridfs`, `gcs`, or `minio` |

#### Google Cloud Storage (if `STORAGE_TYPE=gcs`)
Requires a `server/config/gcs-key.json` service account key file.

#### MinIO (if `STORAGE_TYPE=minio`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MINIO_ENDPOINT` | No | `localhost` | MinIO server hostname |
| `MINIO_ACCESS_KEY` | No | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | No | `minioadmin` | MinIO secret key |

### Speech-to-Text

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WHISPER_MODEL_ID` | No | `Xenova/whisper-base` | HuggingFace Whisper model ID |
| `WHISPER_LANGUAGE` | No | `en` | Language for speech recognition |
| `WHISPER_QUANTIZED` | No | `true` | Use quantized model for lower memory |

### Redis (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | No | — | Redis connection URL for caching/rate limiting |
| `USE_REDIS_QUOTA` | No | `false` | Use Redis for API quota tracking (`true`/`false`) |

### Agent / Misc

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | No | — | Base URL for agent controller internal API calls |
| `JWT_TOKEN` | No | — | Static JWT for agent controller automation |
| `FRONTEND_URL` | No | `http://localhost:3000` | Alternative frontend URL (used in some email templates) |

---

## Client Configuration

### Vite Proxy
The client proxies API requests to the backend. Configured in `client/vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

### Tailwind CSS
Configured in `client/tailwind.config.js` — includes dark mode support via class strategy.

### PostCSS
Configured in `client/postcss.config.mjs` — processes Tailwind directives.

---

## Generating an Encryption Key

Generate a random 256-bit hex key:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

**Warning**: Changing `ENCRYPTION_KEY` after data has been encrypted will make existing encrypted data unreadable. Back up the key securely.

---

## Example `.env` File

```env
# Core
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aiva
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-64-char-hex-key-here

# Google AI
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_SYNC_ENABLED=true

# Email (optional)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Storage
STORAGE_TYPE=gridfs

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
```

---

## Docker Environment

For Docker deployments, AIVA includes encryption utilities for `.env` files:
- `docker/encrypt-env.js` — Encrypt your `.env` for safe distribution
- `docker/decrypt-env.js` — Decrypt at container startup
- See [Docker Guide](./docker.md) for details
