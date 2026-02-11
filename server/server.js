/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : UNKNOWN

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : UNKNOWN
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : UNKNOWN

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { generalRateLimit, cspMiddleware, securityLogger, sanitizeInput } from './middlewares/securityMiddleware.js';
import {
  globalRateLimit,
  hourlyRateLimit,
  dailyRateLimit
} from './middlewares/advancedRateLimitMiddleware.js';
import {
  validateQueryParams,
  monitorRequestSize,
  validateJsonBody
} from './middlewares/requestSizeMiddleware.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import canvasRoutes from './routes/canvasRoutes.js';
import quotaRoutes from './routes/quotaRoutes.js';
import googleIntegrationRoutes from './routes/googleIntegrationRoutes.js';
import googleIntegrationRoutes from './routes/googleIntegrationRoutes.js';
import driveRoutes from './routes/driveRoutes.js';
import trashRoutes from './routes/trashRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import { reminderService } from './services/reminderService.js';
import { checkGCSConnection } from './services/gcsService.js';
import { quotaManager } from './middlewares/advancedRateLimitMiddleware.js';
import syncScheduler from './services/syncScheduler.js';

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Client runs on port 3000
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Request size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Security middleware
app.use(securityLogger);
app.use(cspMiddleware);

// Advanced rate limiting (multiple layers)
app.use(globalRateLimit);        // Per-minute limit
app.use(hourlyRateLimit);        // Per-hour limit
app.use(dailyRateLimit);         // Per-day limit

// Request validation
app.use(validateQueryParams);    // Validate query parameters
app.use(validateJsonBody('5mb')); // Validate JSON body structure
app.use(monitorRequestSize);     // Monitor large requests
app.use(sanitizeInput);          // Input sanitization

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.github.com", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Store quota manager in app for access in routes
app.set('quotaManager', quotaManager);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/canvas', canvasRoutes);
app.use('/api/quotas', quotaRoutes);
app.use('/api/google', googleIntegrationRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/notes', noteRoutes);

// Socket.IO real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a canvas room for collaboration
  socket.on('join-canvas', (canvasId) => {
    socket.join(`canvas-${canvasId}`);
    console.log(`User ${socket.id} joined canvas ${canvasId}`);
  });

  // Handle canvas updates from clients
  socket.on('canvas-update', (data) => {
    const { canvasId, type, element, elementId } = data;

    // Broadcast to all other clients in the same canvas room
    socket.to(`canvas-${canvasId}`).emit('canvas-update', {
      type,
      element,
      elementId,
      userId: socket.id
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Real-time collaboration enabled with Socket.IO');
  console.log('Reminder service initialized');

  // Start Google sync scheduler
  if (process.env.GOOGLE_SYNC_ENABLED !== 'false') {
    syncScheduler.start();
  }
  await checkGCSConnection();
});
