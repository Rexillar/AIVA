import dotenv from 'dotenv';
// Load environment variables first - MUST be at the very top
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initializeGCS } from './config/gcs.js';
import { initializeGridFS } from './services/mongoFileService.js';
import { driveService } from './services/googleDriveService.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import canvasRoutes from './routes/canvasRoutes.js';
import { errorHandler, routeNotFound as notFound } from './middlewares/errorMiddleware.js';

// --- Server Startup ---
const startServer = () => {
  const app = express();
  const PORT = process.env.PORT || 8081;
  let isServerReady = false;

  // --- Health & Readiness Probes ---
  // Health probe for container orchestrator to check if the server is running
  app.get('/healthz', (req, res) => res.status(200).send('OK'));

  // --- Middleware ---
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://aiva-web-code-xljmvqyaoq-uc.a.run.app',
    'https://aiva-frontend-xljmvqyaoq-uc.a.run.app'
  ];

  // Skip body parsing for multipart uploads
  app.use('/api/workspace/:workspaceId/uploads', (req, res, next) => {
    if (req.method === 'POST' && req.headers['content-type']?.startsWith('multipart/')) {
      req._body = true; // Prevent Express from parsing the body
      next();
    } else {
      next();
    }
  });
  app.use('/api/workspace/:workspaceId/task/:taskId/uploads', (req, res, next) => {
    if (req.method === 'POST' && req.headers['content-type']?.startsWith('multipart/')) {
      req._body = true; // Prevent Express from parsing the body
      next();
    } else {
      next();
    }
  });

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static('uploads'));
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Readiness middleware for API routes
  app.use('/api', (req, res, next) => {
    if (isServerReady) {
      return next();
    }
    res.status(503).json({ error: 'Server is not ready yet. Please try again in a moment.' });
  });

  // --- Routes ---
  app.get('/', (req, res) => res.status(200).send('Server is running.'));
  app.get('/api/test', (req, res) => res.json({ status: "ok" }));
  app.get('/api', (req, res) => res.json({ status: true, message: 'AIVA API is running', version: '1.0.0' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/completions', completionRoutes);
  app.use('/api/canvas', canvasRoutes);

  // --- Production Build Serving ---
  if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
  }

  // --- Error Handling ---
  app.use(notFound);
  app.use(errorHandler);

  // --- Start Listening ---
  const server = createServer(app);
  const io = initializeSocket(server);
  global.io = io;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Post-listen initializations
    (async () => {
      try {
        // 1. Validate required environment variables
        const requiredEnvVars = ['MONGO_URI', 'GMAIL_USER', 'GMAIL_PASS', 'CLIENT_URL', 'GCP_PROJECT_ID'];
        const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingEnvVars.length > 0) {
          throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
        }

        // 2. Connect to the database
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected.');

        // 3. Connect to Google Cloud Storage
        console.log('Connecting to GCS...');
        await initializeGCS();
        console.log('GCS initialized.');

        // 4. Initialize GridFS for file storage
        console.log('Initializing GridFS...');
        const gridfsReady = initializeGridFS();
        if (gridfsReady) {
          console.log('GridFS initialized.');
        } else {
          console.warn('⚠️ GridFS initialization failed - file uploads may not work');
        }

        // 5. Initialize Google Drive service
        console.log('Initializing Google Drive...');
        const driveReady = await driveService.initialize();
        if (driveReady) {
          console.log('Google Drive initialized.');
        } else {
          console.warn('⚠️ Google Drive initialization failed - Drive integration may not work');
        }

        console.log('✅ Server is ready to accept connections.');
        isServerReady = true;

      } catch (error) {
        console.error('❌ FATAL: Failed during post-listen initialization.');
        console.error(error.message);
        process.exit(1);
      }
    })();
  });
};

startServer();
