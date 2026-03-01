# Docker Guide

**Last Updated**: March 2026

AIVA supports full Docker containerization for development, testing, and production deployment.

---

## Project Docker Files

```
AIVA/
├── client/Dockerfile           # Frontend container (Nginx-served React build)
├── server/Dockerfile           # Backend container (Node.js)
├── launcher/docker-compose.yml # Local launcher compose
├── docker-hub/
│   ├── docker-compose.yml      # Docker Hub deployment compose
│   └── hub.env.example         # Example environment file
└── docker/
    ├── setup.sh                # Linux/Mac setup script
    ├── setup.ps1               # Windows PowerShell setup script
    ├── encrypt-env.js          # Encrypt .env files for safe storage
    └── decrypt-env.js          # Decrypt .env at container startup
```

---

## Quick Start with Docker

### 1. Configure Environment
```bash
cp docker-hub/hub.env.example .env
```

Edit `.env` with your values (see [Configuration](./configuration.md)):
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aiva
JWT_SECRET=your-secret
ENCRYPTION_KEY=your-64-char-hex-key
GEMINI_API_KEY=your-gemini-key
```

### 2. Build & Run
```bash
docker-compose up --build
```

Or use the Docker Hub images (pre-built):
```bash
cd docker-hub
docker-compose up
```

### 3. Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## Dockerfiles

### Client Dockerfile
Multi-stage build:
1. **Build stage**: `node:18-alpine` — installs deps, runs `npm run build`
2. **Serve stage**: `nginx:alpine` — serves static files with custom `nginx.conf`

The Nginx config (`client/nginx.conf`) handles:
- SPA routing (all paths → `index.html`)
- API proxy pass to backend container
- Gzip compression
- Static asset caching

### Server Dockerfile
Single-stage `node:18-alpine`:
- Installs production dependencies
- Copies server source
- Exposes port 5000
- Runs `node index.js`

---

## Docker Compose

### Development Compose (`launcher/docker-compose.yml`)
Includes:
- **client** — React dev server with hot reload
- **server** — Node.js with file watching
- **mongo** — MongoDB local instance (optional)

### Production Compose (`docker-hub/docker-compose.yml`)
Includes:
- **client** — Nginx serving production build
- **server** — Node.js production server
- Environment variables from `.env` file

---

## Environment Encryption

For secure environment distribution, AIVA includes encryption utilities:

### Encrypt `.env`
```bash
node docker/encrypt-env.js
```
Prompts for a passphrase and encrypts `.env` → `.env.encrypted`

### Decrypt `.env`
```bash
node docker/decrypt-env.js
```
Prompts for the passphrase and decrypts `.env.encrypted` → `.env`

### Usage in CI/CD
1. Encrypt locally: `node docker/encrypt-env.js`
2. Commit `.env.encrypted` (safe — encrypted with AES)
3. In CI/CD pipeline: `node docker/decrypt-env.js` with the passphrase as a secret
4. Container starts with decrypted `.env`

---

## Setup Scripts

### Linux/Mac
```bash
chmod +x docker/setup.sh
./docker/setup.sh
```

### Windows (PowerShell)
```powershell
.\docker\setup.ps1
```

These scripts:
1. Check Docker installation
2. Create `.env` from template if not present
3. Build and start containers
4. Verify services are healthy

---

## Common Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Stop all services
docker-compose down

# Rebuild a specific service
docker-compose up --build server

# Remove all data (⚠️ destructive)
docker-compose down -v

# Shell into a running container
docker-compose exec server sh
docker-compose exec client sh
```

---

## Production Deployment

### Using Docker Hub Images

1. Pull pre-built images from Docker Hub
2. Configure `docker-hub/docker-compose.yml` with your environment
3. Run `docker-compose up -d`

See [docker-hub/INSTRUCTIONS.md](../docker-hub/INSTRUCTIONS.md) for detailed Docker Hub deployment instructions.

### Environment Variables in Production
- Use Docker secrets or encrypted `.env` files
- Never commit plain-text `.env` files
- Set `NODE_ENV=production` for the server
- Ensure `CORS_ORIGIN` matches your production frontend URL

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| MongoDB connection fails | Check `MONGODB_URI` is accessible from inside the container. For local MongoDB, use `host.docker.internal` instead of `localhost` |
| CORS errors | Ensure `CORS_ORIGIN` in server `.env` matches the client URL |
| Port conflicts | Change `PORT` mapping in docker-compose.yml |
| Build fails on client | Clear `node_modules` and rebuild: `docker-compose build --no-cache client` |
| Container restarts in loop | Check logs: `docker-compose logs server` — usually a missing env variable |
