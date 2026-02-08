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
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { Server } from 'socket.io';
import { getImprovedAIResponse } from './improvedGeminiService.js';

let io = null;

/**
 * Initialize WebSocket server
 */
export const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);

    // Store user session
    let userId = null;
    let workspaceId = null;

    // Handle authentication
    socket.on('authenticate', async (data) => {
      userId = data.userId;
      workspaceId = data.workspaceId;
      socket.join(`user-${userId}`);
      socket.join(`workspace-${workspaceId}`);

      socket.emit('authenticated', { success: true });
    });

    // Handle chat messages with streaming
    socket.on('chat-message', async (data) => {
      try {
        const { message, isVoice = false } = data;

        // Send typing indicator
        socket.emit('typing', { isTyping: true });

        // Get AI response (will implement streaming in next version)
        const response = await getImprovedAIResponse(
          message,
          userId,
          workspaceId,
          { isVoice }
        );

        // Simulate token streaming (for now, will integrate real streaming later)
        const words = response.reply.split(' ');
        let streamedText = '';

        for (let i = 0; i < words.length; i++) {
          streamedText += (i > 0 ? ' ' : '') + words[i];

          socket.emit('chat-stream', {
            token: words[i],
            partial: streamedText,
            isComplete: i === words.length - 1
          });

          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Send complete response
        socket.emit('chat-response', response);
        socket.emit('typing', { isTyping: false });

      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('chat-error', { error: error.message });
        socket.emit('typing', { isTyping: false });
      }
    });

    // Handle action execution updates
    socket.on('execute-action', async (data) => {
      try {
        const { action } = data;

        socket.emit('action-status', { status: 'executing' });

        // Execute action (import from improved service)
        const { executeAction } = await import('./enhancedGeminiService.js');
        const result = await executeAction(action, userId, workspaceId);

        socket.emit('action-result', result);
        socket.emit('action-status', { status: 'completed' });

        // Broadcast to workspace if successful
        if (result.success) {
          io.to(`workspace-${workspaceId}`).emit('workspace-update', {
            type: action.endpoint,
            userId
          });
        }

      } catch (error) {
        console.error('Action execution error:', error);
        socket.emit('action-error', { error: error.message });
        socket.emit('action-status', { status: 'failed' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Broadcast notification to user
 */
export const broadcastToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

/**
 * Broadcast notification to workspace
 */
export const broadcastToWorkspace = (workspaceId, event, data) => {
  if (io) {
    io.to(`workspace-${workspaceId}`).emit(event, data);
  }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (userId, isTyping) => {
  if (io) {
    io.to(`user-${userId}`).emit('typing', { isTyping });
  }
};

export default {
  initializeWebSocket,
  broadcastToUser,
  broadcastToWorkspace,
  sendTypingIndicator
};