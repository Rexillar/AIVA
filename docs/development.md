# Development Guide

This guide is for contributors who want to modify AIVA's source code or run the application in a development mode.

## Development Environment

You have two main options for development:

### Option 1: Hybrid (Recommended)
Run infrastructure (Database) in Docker, and run services (Backend/Frontend) locally on your machine. This gives you the fastest feedback loop (hot-reloading).

1.  Start MongoDB only:
    ```bash
    docker-compose up -d mongo
    ```
2.  **Backend**:
    ```bash
    cd server
    npm install
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

### Option 2: Full Docker
Run everything in Docker. Useful for testing final builds.
```bash
docker-compose up --build
```

## Project Structure

- `client/`: React frontend application (Vite).
- `server/`: Node.js/Express backend API.
- `docs/`: Project documentation.
- `docker/`: Docker-specific configuration files.

## Coding Standards

We enforce code quality to keep the project maintainable.

### Linting & Formatting
- **ESLint**: Used to catch errors.
- **Prettier**: Used to enforce code style.

Run linting before committing:
```bash
# In client or server directory
npm run lint
```

### Git Hooks
We may use tools like Husky to ensure commits meet our standards. Please respect these checks.
