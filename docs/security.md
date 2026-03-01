# Security Architecture

**Last Updated**: March 2026

AIVA implements defense-in-depth security across every layer — authentication, authorization, encryption, rate limiting, and input validation.

---

## Authentication

### JWT-Based Auth
- Users authenticate via `/api/auth/login` (email/password) or `/api/auth/google` (OAuth)
- Server returns a JWT containing `userId`, `email`, and `role`
- Token is sent as `Authorization: Bearer <token>` on all protected routes
- Token expiry and refresh handled by `authMiddleware.js`

### Google OAuth
- Optional sign-in with Google via OAuth 2.0
- Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Links Google account for Calendar, Tasks, Drive, and Gmail integration

---

## Authorization (RBAC)

### Workspace-Level Roles
| Role | Permissions |
|------|------------|
| **owner** | Full control — CRUD on all workspace resources, manage members, delete workspace |
| **admin** | Manage resources and members, cannot delete workspace or transfer ownership |
| **member** | CRUD on own resources, view shared resources |
| **viewer** | Read-only access to workspace resources |

### Middleware Stack
All protected routes pass through:
1. `authMiddleware.js` — Validates JWT, attaches `req.user`
2. `roleMiddleware.js` — Checks role-based permissions per route
3. `workspaceSecurityMiddleware.js` — Validates workspace membership and workspace-level role
4. `validationMiddleware.js` — Sanitizes and validates request body/params

---

## Encryption at Rest (AES-256-GCM)

### Overview
AIVA encrypts sensitive data **at the application layer** before it reaches MongoDB. Even if the database is compromised, encrypted fields are unreadable without the encryption key.

### Algorithm
- **Cipher**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Key**: 256-bit key from `ENCRYPTION_KEY` environment variable
- **IV**: Unique 16-byte random IV per encryption operation
- **Auth Tag**: 16-byte GCM authentication tag for integrity verification

### Encrypted Fields by Model

| Model | Encrypted Fields |
|-------|-----------------|
| **Note** | `title`, `content`, `tags`, `attachments.filename`, `versionHistory.content` |
| **Chat / ChatHistory** | `message`, `content`, `response` |
| **User** (partial) | Sensitive profile fields where applicable |

### Mongoose Encryption Plugin
The encryption is transparent to application code via a Mongoose plugin:

```javascript
// In model definition
noteSchema.plugin(encryptionPlugin, {
  fields: ['title', 'content', 'tags', 'attachments.filename', 'versionHistory.content']
});
```

- **On Save**: `pre('save')` hook encrypts marked fields automatically
- **On Read**: `post('init')` hook decrypts fields after document load
- **Format**: Encrypted values stored as `enc:<iv_hex>:<authTag_hex>:<ciphertext_hex>`

### Important Patterns

**`safeNoteToObject(note)`**: The standard helper for converting a Mongoose Note document to a plain object while preserving decrypted values:
```javascript
function safeNoteToObject(note) {
  const obj = {};
  for (const key of Object.keys(note.schema.paths)) {
    obj[key] = note[key]; // Reads from decrypted getters
  }
  return decryptDocument(obj, NOTE_ENCRYPTED_FIELDS);
}
```

**`.lean()` Bypass Warning**: Queries using `.lean()` return raw documents that bypass the `post('init')` decryption hook. Always use `decryptDocument()` on lean results:
```javascript
const notes = await Note.find({ workspace }).lean();
notes.forEach(n => decryptDocument(n, NOTE_ENCRYPTED_FIELDS));
```

**Nested Field Decryption**: The `decryptDocument()` utility handles dot-notation paths (e.g., `attachments.filename`) by iterating through arrays and decrypting each element's nested field.

---

## Rate Limiting

### Standard Rate Limiter
`rateLimitMiddleware.js` applies express-rate-limit on all API routes:
- **Window**: 15 minutes
- **Max Requests**: Configurable per route group

### Advanced Rate Limiter
`advancedRateLimitMiddleware.js` provides granular rate limiting:
- Per-user tracking (by JWT `userId`)
- Endpoint-specific limits
- Sliding window algorithm
- Burst protection

### AI Endpoint Limits
AI-powered endpoints (chat, formatting, intelligence) have stricter limits to control Gemini API costs.

---

## Request Security

### Helmet & CORS
- **Helmet**: Sets security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS**: Configured to allow only the frontend origin

### Request Size Limits
`requestSizeMiddleware.js` enforces payload size limits:
- Standard JSON: 10MB
- File uploads: Based on storage provider configuration

### Input Validation
`validationMiddleware.js` validates and sanitizes:
- Request body fields (type, length, format)
- URL parameters (ObjectId format)
- Query string parameters
- HTML content (XSS prevention via sanitization)

---

## Security Middleware Pipeline

Every protected request flows through this pipeline:

```
Request
  → securityMiddleware (Helmet, CORS, security headers)
  → requestSizeMiddleware (payload limits)
  → rateLimitMiddleware (global rate limit)
  → authMiddleware (JWT verification)
  → advancedRateLimitMiddleware (per-user limits)
  → roleMiddleware (RBAC check)
  → workspaceSecurityMiddleware (workspace membership)
  → validationMiddleware (input sanitization)
  → Controller handler
```

---

## Secrets Management

### Never Commit Secrets
The following must **never** be committed to version control:
- `.env` files (server or client)
- `gcs-key.json` (Google Cloud service account)
- Any file containing API keys, encryption keys, or passwords

### Required Secrets
| Variable | Purpose |
|----------|---------|
| `ENCRYPTION_KEY` | AES-256 encryption key for data at rest |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `MONGO_URI` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Docker Encryption
For Docker deployments, AIVA includes environment file encryption:
- `docker/encrypt-env.js` — Encrypts `.env` files for safe storage
- `docker/decrypt-env.js` — Decrypts at container startup

---

## Security Best Practices for Contributors

1. **Never** log encryption keys, JWT secrets, or user passwords
2. **Always** use `authMiddleware` on new routes
3. **Always** validate input with `validationMiddleware`
4. **Never** use `.lean()` on encrypted models without calling `decryptDocument()`
5. **Always** use parameterized queries — never concatenate user input into queries
6. **Test** rate limiting on new AI endpoints
7. **Review** workspace access control on any route that touches workspace data
