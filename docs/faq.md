# Frequently Asked Questions (FAQ)

### 1. Where is the `dist` folder?
We **do not** commit build artifacts (`dist` or `build` folders) to the source repository. This keeps the repo clean and secure. You must build the project yourself (preferably using Docker) to generate these files.

### 2. Why do I need Docker?
Docker ensures that AIVA runs in exactly the same environment on your machine as it does on ours. It handles installing the database, setting up the network, and managing Node.js versions for you. Without Docker, you would have to manually install MongoDB, Node.js, and configure them to talk to each other.

### 3. Can I run AIVA without Docker?
**Yes**, but it is more manual work. You will need to:
1.  Install and run MongoDB locally.
2.  Install Node.js (v18+).
3.  Configure `.env` files in both `server/` and `client/` directories to point to your local Mongo instance.
4.  Run `npm install` and `npm run dev` in both directories manually.

See the [Development Guide](./development.md) for more details.

### 4. How do I update AIVA?
1.  Pull the latest changes: `git pull origin main`
2.  Rebuild your Docker images: `docker-compose up -d --build`

### 5. I found a bug, what should I do?
Please check if the issue already exists on GitHub. If not, open a new Issue describing the problem, how to reproduce it, and what you expected to happen.
