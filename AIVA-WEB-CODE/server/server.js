/*=================================================================
* Project: AIVA-WEB
* File: server.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: October 28, 2025
*=================================================================
* Description:
* Main server file that initializes Express server with Socket.IO for real-time collaboration,
* connects to database, and sets up API routes for the AIVA web application.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { generalRateLimit, cspMiddleware, securityLogger, sanitizeInput } from './middlewares/securityMiddleware.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import canvasRoutes from './routes/canvasRoutes.js';
import { reminderService } from './services/reminderService.js';
import { checkGCSConnection } from './services/gcsService.js';

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(securityLogger);
app.use(cspMiddleware);
app.use(generalRateLimit);
app.use(sanitizeInput);

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/canvas', canvasRoutes);

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
  await checkGCSConnection();
});