# Installation Guide

This guide will help you set up the AIVA Web Application on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (version 18 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **MongoDB** (Database)
  - Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud-hosted)
  - Start MongoDB service after installation

- **Git** (Version control)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Optional but Recommended

- **Visual Studio Code** (IDE)
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)
  - Install recommended extensions for React and Node.js development

- **Postman** or **Insomnia** (API testing)
  - For testing API endpoints during development

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jadeja-mohitrajsinh/AIVA-LANDINGPAGE.git
cd AIVA-LANDINGPAGE/AIVA-WEB-CODE
```

### 2. Install Dependencies

The project has two main parts: client (frontend) and server (backend). Install dependencies for both.

#### Backend Dependencies

```bash
cd server
npm install
```

#### Frontend Dependencies

```bash
cd ../client
npm install
```

### 3. Environment Configuration

Before running the application, you need to configure environment variables.

#### Backend Environment (.env)

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database
MONGO_URI=mongodb://localhost:27017/aiva-web
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/aiva-web

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000

# Google Cloud Platform (for file storage and AI)
GCP_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=your-storage-bucket-name

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Optional: Google Drive Integration
GOOGLE_DRIVE_CREDENTIALS_PATH=./config/gcs-key.json
STORAGE_TYPE=gridfs  # Options: gridfs, gcs, minio
```

#### Frontend Environment (.env)

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

### 4. Google Cloud Setup (Optional but Recommended)

For full functionality, set up Google Cloud services:

1. Create a Google Cloud Project
2. Enable the following APIs:
   - Google Cloud Storage API
   - Google Drive API
   - Google AI (Gemini) API
3. Create a service account and download the JSON key file
4. Place the key file at `server/config/gcs-key.json`
5. Create a Cloud Storage bucket for file uploads

### 5. Database Setup

Ensure MongoDB is running and accessible. The application will automatically create collections as needed.

### 6. Start the Application

#### Development Mode

Start both frontend and backend in development mode.

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 7. Verify Installation

1. Open http://localhost:3000 in your browser
2. Try registering a new account
3. Check the browser console and server logs for any errors
4. Test basic functionality like creating a task or workspace

## Building Standalone Executable

To create a standalone executable that runs the full MERN application without visible terminals:

### Prerequisites
- **Python** (version 3.8 or higher)
  - Download from [python.org](https://python.org/)
  - Verify installation: `python --version`

- **PyInstaller** (for building exe)
  ```bash
  pip install pyinstaller
  ```

- **PyWebView** (for native window)
  ```bash
  pip install pywebview
  ```

### Build Command

From the project root directory:

```bash
pyinstaller --onefile --noconsole --icon client/public/3.png run-app.py
```

This creates `dist/run-app.exe`, a single executable file that:

- Automatically kills any existing Node processes
- Starts the backend server (port 8080) hidden
- Starts the frontend server (port 3000) hidden  
- Opens the application in a full-screen native window
- Uses the project's logo as the app icon

### Usage

- Double-click `run-app.exe` to launch
- The app runs in kiosk mode (full-screen, no browser UI)
- Requires Node.js to be installed on the target machine
- No installation or setup needed beyond running the exe

### Distribution

Share `run-app.exe` with anyone who has Node.js installed. It's a complete, portable application.

### Common Issues

#### Port Already in Use
If port 3000 or 8080 is already in use:
- Change the port in the respective `.env` file
- Or kill the process using the port: `npx kill-port 3000`

#### MongoDB Connection Issues
- Ensure MongoDB is running: `brew services start mongodb/brew/mongodb-community` (macOS)
- Check the MONGO_URI in your `.env` file
- Verify network connectivity for MongoDB Atlas

#### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Ensure all environment variables are set correctly

#### Email Not Working
- Use an App Password instead of your regular Gmail password
- Enable 2FA on your Gmail account first
- Check Gmail settings for less secure app access

### Getting Help

If you encounter issues:
1. Check the [Development Documentation](../development/)
2. Review server logs for error messages
3. Check browser developer tools for frontend errors
4. Create an issue on the GitHub repository

## Next Steps

After successful installation:
- Read the [Architecture Overview](../architecture/)
- Explore [API Documentation](../api/)
- Learn about [Features](../features/)
- Set up [Development Environment](../development/)