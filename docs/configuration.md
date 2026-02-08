# Configuration

AIVA is configured primarily using Environment Variables. These allow you to customize the application without modifying the code.

## ⚠️ Security Warning

**NEVER commit `.env` files containing real secrets (API keys, passwords) to version control.**
We provide `.env.example` or `.env.docker` files as templates. Copy them to `.env` and fill in your private details locally.

## Environment Variables

### Core Configuration

| Variable | Description | Default (Docker) |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode (development/production) | `production` |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | URL of the frontend for CORS | `http://localhost:3000` |

### Database & Auth

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | Connection string for MongoDB |
| `JWT_SECRET` | Secret key for signing auth tokens |
| `JWT_EXPIRE` | Token expiration time (e.g., `30d`) |

### Third-Party Services (Optional)

| Variable | Description |
| :--- | :--- |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for Google Integration |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
| `OPENAI_API_KEY` | Key for AI features (if applicable) |

## Docker Configuration

When running with Docker Compose, environment variables are often loaded from the `.env` file in the root directory or defined directly in `docker-compose.yml`.

To override settings, create a `.env` file in the project root:

```ini
# .env
MONGO_URI=mongodb://my-custom-mongo:27017/aiva
JWT_SECRET=super_secret_key_change_this
```
