# Getting Started with AIVA

Get AIVA up and running on your local machine in under 10 minutes using Docker.

## Prerequisites

- **Docker**: You must have Docker installed and running.
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac/Linux)
- **Git**: To clone the repository.

## Installation

### 1. Clone the Repository

Clone the source code from GitHub:

```bash
git clone https://github.com/Rexillar/AIVA.git
cd AIVA
```

### 2. Configure Environment

AIVA comes with prepared example environment files. You simply need to verify they exist or create your own secrets file if necessary (usually handled automatically by Docker setup or scripts, but good to know).

For a quick start, the repository includes `.env.docker` which is pre-configured for the Docker environment.

### 3. Run with Docker Compose

We use Docker Compose to orchestrate the backend, frontend, and database services.

**To start AIVA:**

```bash
docker-compose up -d
```

*This command will pull the necessary images from Docker Hub or build them if locally configured, and start the services in the background.*

### 4. Access AIVA

Once the containers are running (give it a minute or two for the database to initialize):

- **Frontend (Application)**: Open [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: Running at [http://localhost:5000](http://localhost:5000)

## Stopping AIVA

To stop the application and remove the containers:

```bash
docker-compose down
```

## Next Steps

- Learn about the [Architecture](./architecture.md)
- Customize your [Configuration](./configuration.md)
- [Contribute](./development.md) to the code
