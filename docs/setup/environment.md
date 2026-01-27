# Environment Configuration

This document explains all environment variables used in the AIVA Web Application and how to configure them for different deployment scenarios.

## Backend Environment Variables

### Required Variables

#### Database Configuration
```env
MONGO_URI=mongodb://localhost:27017/aiva-web
```
- **Description**: MongoDB connection string
- **Required**: Yes
- **Default**: None
- **Examples**:
  - Local: `mongodb://localhost:27017/aiva-web`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/aiva-web`

#### Authentication
```env
JWT_SECRET=your-super-secure-jwt-secret-here
```
- **Description**: Secret key for JWT token signing
- **Required**: Yes
- **Security**: Generate a strong, random string (256+ bits)

#### Email Configuration
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```
- **Description**: Gmail credentials for sending emails
- **Required**: Yes (for password reset, notifications)
- **Setup**: Use Gmail App Password, not regular password

#### Client Configuration
```env
CLIENT_URL=http://localhost:3000
```
- **Description**: Frontend application URL
- **Required**: Yes
- **Examples**: `http://localhost:3000`, `https://yourdomain.com`

### Optional Variables

#### Server Configuration
```env
NODE_ENV=development
PORT=8080
```
- **NODE_ENV**: Environment mode (`development`, `production`, `test`)
- **PORT**: Server port (default: 8080)

#### Google Cloud Platform
```env
GCP_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=your-storage-bucket-name
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_DRIVE_CREDENTIALS_PATH=./config/gcs-key.json
```
- **GCP_PROJECT_ID**: Google Cloud Project ID
- **GCS_BUCKET_NAME**: Cloud Storage bucket for file uploads
- **GOOGLE_AI_API_KEY**: API key for Google AI (Gemini)
- **GOOGLE_DRIVE_CREDENTIALS_PATH**: Path to service account key file

#### Storage Configuration
```env
STORAGE_TYPE=gridfs
```
- **Description**: Primary storage backend
- **Options**: `gridfs`, `gcs`, `minio`
- **Default**: `gridfs` (MongoDB GridFS)

#### MinIO Configuration (Alternative Storage)
```env
MINIO_ENDPOINT=minio.example.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=aiva-files
```

## Frontend Environment Variables

### Required Variables
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```
- **VITE_API_BASE_URL**: Backend API base URL
- **VITE_SOCKET_URL**: WebSocket server URL

## Environment File Locations

### Development
- Backend: `server/.env`
- Frontend: `client/.env`

### Production
- Environment variables should be set in your deployment platform
- Do not commit `.env` files to version control
- Use deployment platform secrets management

## Configuration Examples

### Local Development
```env
# server/.env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://localhost:27017/aiva-web
JWT_SECRET=dev-jwt-secret-key-change-in-production
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:3000
STORAGE_TYPE=gridfs

# client/.env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

### Production (Vercel + MongoDB Atlas)
```env
# Vercel Environment Variables
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/aiva-prod
JWT_SECRET=prod-jwt-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
CLIENT_URL=https://your-app.vercel.app
GCP_PROJECT_ID=your-gcp-project
GCS_BUCKET_NAME=your-prod-bucket
GOOGLE_AI_API_KEY=your-prod-ai-key
STORAGE_TYPE=gcs
```

### Docker Deployment
```env
# docker-compose.yml or docker run environment
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb://mongodb:27017/aiva-web
JWT_SECRET=prod-jwt-secret
CLIENT_URL=https://your-domain.com
# ... other variables
```

## Security Considerations

### JWT Secret
- Use a cryptographically secure random string
- Minimum 256 bits (64 characters)
- Rotate regularly in production
- Never commit to version control

### API Keys
- Store securely using environment variables
- Use restricted API keys when possible
- Rotate keys regularly
- Monitor usage for anomalies

### Database Credentials
- Use strong passwords
- Restrict database access by IP
- Use connection pooling
- Enable database authentication

### Email Configuration
- Use dedicated email service accounts
- Enable 2FA on email accounts
- Monitor for spam/abuse
- Use verified sender domains when possible

## Validation

The application validates environment variables on startup. Missing required variables will cause the server to exit with an error message.

### Required Variables Check
The server checks for these required variables:
- `MONGO_URI`
- `JWT_SECRET`
- `GMAIL_USER`
- `GMAIL_PASS`
- `CLIENT_URL`

### Optional Variables
- Missing optional variables use sensible defaults
- Some features may be disabled without optional variables

## Troubleshooting

### Common Issues

#### "Missing required environment variables"
- Check that all required variables are set
- Ensure `.env` file exists in the correct location
- Verify variable names match exactly (case-sensitive)

#### "Invalid JWT token"
- Check `JWT_SECRET` is set and matches between deployments
- Ensure the secret is the same across all server instances

#### "Database connection failed"
- Verify `MONGO_URI` format and credentials
- Check network connectivity
- Ensure MongoDB is running and accessible

#### "Email sending failed"
- Verify Gmail credentials
- Check that 2FA is enabled and App Password is used
- Confirm Gmail account allows less secure apps

### Environment-Specific Issues

#### Development
- Use `NODE_ENV=development` for detailed logging
- Local MongoDB should be running
- CORS should allow localhost origins

#### Production
- Use `NODE_ENV=production` for optimized performance
- Ensure all URLs use HTTPS
- Configure proper CORS origins
- Set up monitoring and logging

## Deployment Platforms

### Vercel
- Set environment variables in Vercel dashboard
- Use Vercel secrets for sensitive data
- Configure build commands and output directories

### Heroku
- Use `heroku config:set` to set variables
- Config vars are automatically available
- Use Heroku add-ons for MongoDB and Redis

### Docker
- Pass environment variables in docker-compose.yml
- Use Docker secrets for sensitive data
- Mount configuration files as volumes

### AWS/GCP
- Use AWS Systems Manager Parameter Store
- Use Google Cloud Secret Manager
- Configure IAM roles for secure access