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


import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Store active users and their workspaces
const activeUsers = new Map();
const typingUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userEmail = user.email;
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      userName: socket.userName,
      userEmail: socket.userEmail,
      workspaces: new Set(),
      status: 'online',
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // === WORKSPACE MANAGEMENT ===

    socket.on('join:workspace', async (workspaceId) => {
      try {
        socket.join(`workspace:${workspaceId}`);

        const userData = activeUsers.get(socket.userId);
        if (userData) {
          userData.workspaces.add(workspaceId);
        }

        // Notify workspace members
        socket.to(`workspace:${workspaceId}`).emit('user:joined', {
          userId: socket.userId,
          userName: socket.userName,
          workspaceId,
          timestamp: new Date()
        });

        // Send list of online users in workspace
        const onlineUsers = getWorkspaceOnlineUsers(workspaceId);
        socket.emit('workspace:online_users', {
          workspaceId,
          users: onlineUsers
        });

        console.log(`User ${socket.userName} joined workspace: ${workspaceId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join workspace' });
      }
    });

    socket.on('leave:workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);

      const userData = activeUsers.get(socket.userId);
      if (userData) {
        userData.workspaces.delete(workspaceId);
      }

      socket.to(`workspace:${workspaceId}`).emit('user:left', {
        userId: socket.userId,
        userName: socket.userName,
        workspaceId,
        timestamp: new Date()
      });
    });

    // === CHAT MESSAGING ===

    socket.on('chat:send_message', async (data) => {
      try {
        const { workspaceId, message, taskId, parentMessageId } = data;

        // Broadcast to workspace
        io.to(`workspace:${workspaceId}`).emit('chat:new_message', {
          ...message,
          sender: {
            _id: socket.userId,
            name: socket.userName,
            email: socket.userEmail
          },
          timestamp: new Date()
        });

        // Send notifications to mentioned users
        if (message.mentions && message.mentions.length > 0) {
          message.mentions.forEach(userId => {
            io.to(`user:${userId}`).emit('notification:mention', {
              type: 'mention',
              messageId: message._id,
              workspaceId,
              taskId,
              mentionedBy: {
                id: socket.userId,
                name: socket.userName
              }
            });
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:edit_message', (data) => {
      const { workspaceId, messageId, newContent } = data;

      io.to(`workspace:${workspaceId}`).emit('chat:message_edited', {
        messageId,
        newContent,
        editedBy: socket.userId,
        editedAt: new Date()
      });
    });

    socket.on('chat:delete_message', (data) => {
      const { workspaceId, messageId } = data;

      io.to(`workspace:${workspaceId}`).emit('chat:message_deleted', {
        messageId,
        deletedBy: socket.userId,
        deletedAt: new Date()
      });
    });

    socket.on('chat:react', (data) => {
      const { workspaceId, messageId, emoji } = data;

      io.to(`workspace:${workspaceId}`).emit('chat:reaction_added', {
        messageId,
        reaction: {
          user: socket.userId,
          userName: socket.userName,
          emoji
        }
      });
    });

    // === TYPING INDICATORS ===

    socket.on('typing:start', (data) => {
      const { workspaceId, taskId } = data;
      const key = `${workspaceId}:${taskId || 'general'}`;

      if (!typingUsers.has(key)) {
        typingUsers.set(key, new Set());
      }
      typingUsers.get(key).add(socket.userId);

      socket.to(`workspace:${workspaceId}`).emit('typing:user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        taskId,
        workspaceId
      });

      // Auto-clear after 3 seconds
      setTimeout(() => {
        const users = typingUsers.get(key);
        if (users) {
          users.delete(socket.userId);
          socket.to(`workspace:${workspaceId}`).emit('typing:user_stopped', {
            userId: socket.userId,
            taskId,
            workspaceId
          });
        }
      }, 3000);
    });

    socket.on('typing:stop', (data) => {
      const { workspaceId, taskId } = data;
      const key = `${workspaceId}:${taskId || 'general'}`;

      const users = typingUsers.get(key);
      if (users) {
        users.delete(socket.userId);
      }

      socket.to(`workspace:${workspaceId}`).emit('typing:user_stopped', {
        userId: socket.userId,
        taskId,
        workspaceId
      });
    });

    // === READ RECEIPTS ===

    socket.on('message:read', (data) => {
      const { workspaceId, messageId, messageIds } = data;

      io.to(`workspace:${workspaceId}`).emit('message:read_receipt', {
        userId: socket.userId,
        messageId,
        messageIds,
        readAt: new Date()
      });
    });

    // === FILE UPLOAD EVENTS ===

    socket.on('file:upload_start', (data) => {
      const { workspaceId, fileName } = data;

      socket.to(`workspace:${workspaceId}`).emit('file:upload_started', {
        userId: socket.userId,
        userName: socket.userName,
        fileName,
        timestamp: new Date()
      });
    });

    socket.on('file:upload_complete', (data) => {
      const { workspaceId, file } = data;

      io.to(`workspace:${workspaceId}`).emit('file:uploaded', {
        file,
        uploadedBy: {
          id: socket.userId,
          name: socket.userName
        },
        timestamp: new Date()
      });
    });

    socket.on('file:upload_progress', (data) => {
      const { workspaceId, fileName, progress } = data;

      socket.to(`workspace:${workspaceId}`).emit('file:progress', {
        userId: socket.userId,
        fileName,
        progress
      });
    });

    // === PRESENCE & STATUS ===

    socket.on('status:change', (status) => {
      const userData = activeUsers.get(socket.userId);
      if (userData) {
        userData.status = status;
        userData.lastSeen = new Date();

        // Notify all workspaces user is in
        userData.workspaces.forEach(workspaceId => {
          socket.to(`workspace:${workspaceId}`).emit('user:status_changed', {
            userId: socket.userId,
            status,
            timestamp: new Date()
          });
        });
      }
    });

    socket.on('presence:ping', () => {
      const userData = activeUsers.get(socket.userId);
      if (userData) {
        userData.lastSeen = new Date();
      }
    });

    // === TASK UPDATES (Real-time collaboration) ===

    socket.on('task:update', (data) => {
      const { workspaceId, taskId, updates } = data;

      socket.to(`workspace:${workspaceId}`).emit('task:updated', {
        taskId,
        updates,
        updatedBy: {
          id: socket.userId,
          name: socket.userName
        },
        timestamp: new Date()
      });
    });

    // === DISCONNECT ===

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`);

      const userData = activeUsers.get(socket.userId);
      if (userData) {
        // Notify all workspaces
        userData.workspaces.forEach(workspaceId => {
          socket.to(`workspace:${workspaceId}`).emit('user:offline', {
            userId: socket.userId,
            userName: socket.userName,
            lastSeen: new Date()
          });
        });

        activeUsers.delete(socket.userId);
      }

      // Clear typing indicators
      typingUsers.forEach((users, key) => {
        users.delete(socket.userId);
      });
    });
  });

  // Helper function to get online users in workspace
  const getWorkspaceOnlineUsers = (workspaceId) => {
    const users = [];
    activeUsers.forEach((userData, userId) => {
      if (userData.workspaces.has(workspaceId)) {
        users.push({
          userId,
          userName: userData.userName,
          status: userData.status,
          lastSeen: userData.lastSeen
        });
      }
    });
    return users;
  };

  console.log('✅ Socket.IO initialized successfully');

  return io;
};

export const getIO = () => {
  if (!global.io) {
    throw new Error('Socket.IO not initialized');
  }
  return global.io;
};

export const emitToWorkspace = (workspaceId, event, data) => {
  if (global.io) {
    global.io.to(`workspace:${workspaceId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user:${userId}`).emit(event, data);
  }
};
