# Docker & AIVA

AIVA relies heavily on Docker to ensure a consistent, reproducible, and easy-to-manage environment for both users and developers.

## Why Docker?

We chose Docker as our primary distribution and runtime mechanism for several reasons:

1.  **Consistency**: "It works on my machine" is a thing of the past. The environment is identical for every user.
2.  **Dependencies**: Users don't need to install specific versions of Node.js, MongoDB, or other tools. Docker handles it all.
3.  **Cleanliness**: AIVA runs in isolated containers, keeping your host system clean.

## Docker Hub vs. GitHub

It represents an important distinction in our workflow:

-   **GitHub** hosts the **Source Code**. This is where development happens. We do NOT commit build artifacts (like the `dist/` folders) here.
-   **Docker Hub** hosts the **Runnable Images**. These are pre-built, ready-to-run packages of the application.

When you run `docker-compose up`, your system pulls these pre-built images from Docker Hub (unless you explicitly build locally).

## Helper Scripts

To make things easier, we provide setup scripts that handle environment validation, secret decryption, and building:

-   **Windows**: `docker/setup.ps1`
-   **Linux/Mac**: `docker/setup.sh`

**Usage (Windows):**
```powershell
./docker/setup.ps1
```

## Standard Commands

Here are the most common Docker commands you'll use with AIVA:

### Start AIVA
Run the application in the background (detached mode):
```bash
docker-compose up -d
```

### view Logs
See what's happening inside the containers:
```bash
docker-compose logs -f
```

### Stop AIVA
Stop and remove the containers:
```bash
docker-compose down
```

### Rebuild Locally
If you are developing and want to force a rebuild of your local changes:
```bash
docker-compose up -d --build
```

## 🚢 Deployment to Docker Hub

This section explains how to prepare your application for production and push it to Docker Hub.

### 1. Secure Your Environment
Before deploying, you must secure your sensitive environment variables (like database passwords and API keys). AIVA provides tools to encrypt your `.env` file.

**Encrypt your environment:**
**Encrypt your environment:**
Run this command from the *project root* directory:
```bash
node docker/encrypt-env.js "YourStrongPassword"
```
*This acts as a pre-deployment step to ensure secrets are safe.*

### 2. Build Production Images
Build the Docker images for both the client and server.

```bash
docker-compose build
```

### 3. Tag & Push to Docker Hub

Once built, you need to tag your images with your Docker Hub username and push them.

**Login to Docker Hub:**
```bash
docker login
```

**Tag and Push (Example):**
Replace `yourusername` with your actual Docker Hub username.

```bash
# Tag the images
docker tag aiva-client yourusername/aiva-client:latest
docker tag aiva-server yourusername/aiva-server:latest

# Push to Docker Hub
docker push yourusername/aiva-client:latest
docker push yourusername/aiva-server:latest
```

### 4. Running in Production
To run AIVA on a remote server using your new images, you just need your `docker-compose.yml` and your encrypted environment config.

```bash
# Pull the latest images
docker-compose pull

# Start the services
docker-compose up -d
```

