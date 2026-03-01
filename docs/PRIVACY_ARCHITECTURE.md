# Privacy Architecture

**Last Updated**: March 2026

AIVA is designed with **privacy-by-default** at every layer. This document details how user data is protected, encrypted, isolated, and controlled.

---

## Core Privacy Principles

1. **Encrypt at Rest** — Sensitive fields encrypted with AES-256-GCM before reaching the database
2. **Workspace Isolation** — Users can only access resources within their authorized workspaces
3. **Minimal Data Exposure** — API responses include only the fields needed
4. **User Ownership** — Users own their data and can delete it at any time
5. **Offline-First** — PWA caches data locally; network calls are optional for cached views

---

## Application-Layer Encryption

### Why Application-Layer?
Unlike database-level encryption (MongoDB's encrypted storage engine), AIVA encrypts **individual fields** at the application layer. This means:
- Even database administrators cannot read sensitive content
- Compromised database backups contain only ciphertext
- Encryption is transparent to the application code via Mongoose plugins

### Algorithm: AES-256-GCM
| Property | Value |
|----------|-------|
| Cipher | AES-256-GCM |
| Key Length | 256 bits (32 bytes) |
| IV Length | 128 bits (16 bytes), random per operation |
| Auth Tag | 128 bits for integrity verification |
| Storage Format | `enc:<iv_hex>:<authTag_hex>:<ciphertext_hex>` |

### Encrypted Fields

| Model | Encrypted Fields | What They Protect |
|-------|-----------------|-------------------|
| **Note** | `title`, `content`, `tags`, `attachments.filename`, `versionHistory.content` | Note content, titles, tag names, attachment names, version history |
| **Chat / ChatHistory** | `message`, `content`, `response` | Conversation content with AI |
| **User** (select fields) | Sensitive profile attributes | Personal information |

### Encryption Flow

```
User Input → Controller → Mongoose pre('save') Hook → AES-256-GCM Encrypt → MongoDB

MongoDB → Mongoose post('init') Hook → AES-256-GCM Decrypt → Controller → API Response
```

### Key Management
- The `ENCRYPTION_KEY` environment variable holds the 256-bit key
- Never stored in code, version control, or logs
- Changing the key requires migrating all existing encrypted data
- Consider hardware security modules (HSM) for production deployments

---

## Workspace Isolation

### Multi-Workspace Architecture
AIVA supports unlimited workspaces per user. Each workspace is completely isolated:

| Aspect | Isolation |
|--------|-----------|
| Tasks | Scoped to workspace via `workspace` field |
| Notes | Scoped to workspace via `workspace` field |
| Canvas | Scoped to workspace via `workspace` field |
| Habits | Scoped to workspace via `workspace` field |
| Chat History | Scoped to workspace context |
| Files | Stored with workspace reference |

### Access Control
```
Request → authMiddleware (validate JWT)
       → workspaceSecurityMiddleware (verify membership + role)
       → Controller (workspace-scoped query)
```

### Workspace Types
| Type | Visibility | Access |
|------|-----------|--------|
| **Private** | Only visible to owner | Owner-only by default |
| **Shared** | Visible to members | Role-based (owner, admin, member, viewer) |

### Role Permissions
| Role | Create | Read | Update | Delete | Manage Members |
|------|--------|------|--------|--------|---------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Member | ✅ | ✅ | Own only | Own only | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## Data Minimization

### API Responses
- Passwords are never returned in API responses
- Sensitive internal fields (`__v`, encryption metadata) are stripped
- Populated references include only necessary fields

### Logging
- No sensitive data (passwords, tokens, encrypted content) is logged
- Error stack traces only shown in development mode
- Request bodies are not logged in production

---

## Authentication Security

### JWT Tokens
- Short-lived access tokens
- HTTP-only, secure cookies in production
- `SameSite` attribute set to prevent CSRF
- Token verification on every protected request

### Password Storage
- Passwords hashed with bcrypt (salt rounds: 10+)
- Never stored in plaintext
- Never returned in API responses

### Google OAuth Tokens
- Encrypted with separate `GOOGLE_TOKEN_ENCRYPTION_KEY`
- Stored in the database encrypted
- Automatically refreshed on expiry

---

## Network Security

### HTTPS
- All production deployments must use HTTPS
- Nginx configuration includes SSL/TLS settings
- HSTS header enforced via Helmet

### CORS
- Strict origin validation
- Only the configured `CLIENT_URL` is allowed
- Credentials mode enabled for cookie-based auth

### Security Headers (via Helmet)
- `Content-Security-Policy` — Prevents XSS and injection
- `X-Frame-Options: DENY` — Prevents clickjacking
- `X-Content-Type-Options: nosniff` — Prevents MIME type sniffing
- `Strict-Transport-Security` — Enforces HTTPS
- `Referrer-Policy: no-referrer` — Prevents referrer leakage

---

## Offline Privacy (PWA)

### Service Worker Caching
- `sw.js` implements offline-first caching strategy
- Static assets cached on install
- API responses cached with cache-first strategy for reads
- Background sync queues writes when offline

### Local Data
- Cached data is stored in the browser's Cache API
- No sensitive data stored in `localStorage` (only Redux state via persistence)
- Cache is cleared on logout

---

## File Storage Privacy

### Multi-Backend Storage
| Backend | Privacy Level |
|---------|--------------|
| **GridFS** | Files stored in MongoDB — same encryption and access control as other data |
| **Google Drive** | Files stored in user's Google Drive — governed by Google's privacy policy |
| **Google Cloud Storage** | Files in GCS bucket — access controlled by service account |
| **MinIO** | Self-hosted S3-compatible — full control over data location |

### File Access Control
- All file endpoints require authentication
- File access checks workspace membership
- No public file URLs — all served through authenticated API

---

## Soft Delete & Data Recovery

### Workspace Trash
- Deleted workspace items go to a "trash" collection
- Recoverable within retention period
- Permanent deletion clears all data including encrypted fields
- Managed via `/api/workspace-trash` endpoints

### User Data Deletion
- Users can delete their account and all associated data
- Cascading delete removes: tasks, notes, habits, reminders, canvas, chat history
- Encrypted data is destroyed (no recovery without the key)

---

## Third-Party Data Sharing

### Google Services
When users enable Google integrations:
- Calendar events synced bidirectionally
- Tasks synced with Google Tasks
- Drive files accessed with user's OAuth consent
- **AIVA never shares data with Google beyond what the user explicitly syncs**

### Gemini AI
- Chat messages and formatting requests are sent to Google's Gemini API
- Subject to [Google's AI data usage policies](https://ai.google.dev/terms)
- No persistent storage of prompts by Gemini (API mode)
- Users should avoid pasting highly sensitive data into AI features

---

## Compliance Considerations

While AIVA includes strong privacy controls, deployers should:
1. Conduct their own security assessment for production use
2. Ensure compliance with applicable regulations (GDPR, CCPA, etc.)
3. Implement additional controls as needed (audit logging, DPO appointment)
4. Review Google's terms for Gemini API and Google Workspace APIs
5. Consider data residency requirements when choosing MongoDB Atlas region
