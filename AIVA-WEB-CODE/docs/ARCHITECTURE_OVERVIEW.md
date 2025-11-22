# Architecture Overview

This document provides a high-level overview of the AIVA architecture for maintainers and contributors.

Components
- Frontend (React + Vite): Located in `client/`, provides the UI using Redux and RTK Query.
- Backend (Node/Express): Located in `server/`, handles REST APIs, sockets, and business logic.
- Storage: Supports GCS, MinIO, optional GridFS via `services/storageService.js`.
- Authentication: JWT-based flows with refresh tokens and role-based middleware.
- Realtime: socket.io for notifications and collaborative features.

Data flow
1. Client sends API requests or socket events to backend.
2. Backend validates and sanitizes requests and uses services for business logic.
3. Services interact with models and storage, then return structured responses.
4. Subscriber systems (email, notifications) are triggered from the services layer.

Security
- Use helmet, csurf, and secure cookies. Validate and sanitize inputs. Files and storage are validated.

Deployment
- Docker images for client and server in `frontend.Dockerfile` and `backend.Dockerfile`.
- `docker-compose.yml` orchestrates services for local dev.
