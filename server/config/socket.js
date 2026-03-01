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
import VoiceChannel from '../models/voiceChannel.js';
import * as meetingIntelligence from '../services/meetingIntelligenceService.js';
import { getSession, deleteSession } from '../services/speechToTextService.js';

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

      // Support both jwt.sign({ id }) and jwt.sign({ userId }) payload formats
      const userId = decoded.id || decoded.userId;
      const user = await User.findById(userId).select('-password');

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
      currentVoiceChannel: null, // Track active voice channel
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

    // === VOICE CHANNELS ===

    socket.on('voice:join_channel', async (data) => {
      try {
        const { workspaceId, channelId } = data;
        const userData = activeUsers.get(socket.userId);

        if (!userData) return;

        // If user is already in another channel, leave it first
        if (userData.currentVoiceChannel && userData.currentVoiceChannel !== channelId) {
          const oldChannel = await VoiceChannel.findByIdAndUpdate(
            userData.currentVoiceChannel,
            { $pull: { activeParticipants: socket.userId } },
            { new: true }
          ).populate('activeParticipants', 'name avatar');

          if (oldChannel) {
            io.to(`workspace:${workspaceId}`).emit('voice:channel_updated', {
              channelId: oldChannel._id,
              activeParticipants: oldChannel.activeParticipants
            });
          }
        }

        // Add user to the new channel
        const newChannel = await VoiceChannel.findByIdAndUpdate(
          channelId,
          { $addToSet: { activeParticipants: socket.userId } },
          { new: true }
        ).populate('activeParticipants', 'name avatar');

        if (newChannel) {
          userData.currentVoiceChannel = channelId;
          io.to(`workspace:${workspaceId}`).emit('voice:channel_updated', {
            channelId: newChannel._id,
            activeParticipants: newChannel.activeParticipants,
            activeMeetLink: newChannel.activeMeetLink
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join voice channel' });
      }
    });

    socket.on('voice:update_link', async (data) => {
      try {
        const { workspaceId, channelId, activeMeetLink } = data;

        const channel = await VoiceChannel.findById(channelId).populate('activeParticipants', 'name avatar');

        if (channel) {
          io.to(`workspace:${workspaceId}`).emit('voice:channel_updated', {
            channelId: channel._id,
            activeParticipants: channel.activeParticipants,
            activeMeetLink: activeMeetLink // Override with the newly generated link
          });
        }
      } catch (error) {
        console.error("Failed to broadcast voice link update:", error);
      }
    });

    socket.on('voice:leave_channel', async (data) => {
      try {
        const { workspaceId } = data;
        const userData = activeUsers.get(socket.userId);

        if (userData && userData.currentVoiceChannel) {
          const channelId = userData.currentVoiceChannel;
          let channel = await VoiceChannel.findByIdAndUpdate(
            channelId,
            { $pull: { activeParticipants: socket.userId } },
            { new: true }
          ).populate('activeParticipants', 'name avatar');

          // If the room is now empty, wipe the meet link AND trigger intelligence extraction
          if (channel && channel.activeParticipants.length === 0) {
            channel = await VoiceChannel.findByIdAndUpdate(
              channelId,
              { $set: { activeMeetLink: null } },
              { new: true }
            ).populate('activeParticipants', 'name avatar');

            // Trigger intelligence extraction if session was active
            if (meetingIntelligence.hasActiveSession(channelId)) {
              console.log(`[Meeting Intelligence] Room empty - extracting intelligence for channel: ${channelId}`);
              const intelligence = await meetingIntelligence.endSessionAndExtract(channelId, workspaceId);
              if (intelligence) {
                io.to(`workspace:${workspaceId}`).emit('meeting:intelligence_ready', {
                  channelId,
                  intelligence
                });
              }
            }
          }

          userData.currentVoiceChannel = null;

          if (channel) {
            io.to(`workspace:${workspaceId}`).emit('voice:channel_updated', {
              channelId: channel._id,
              activeParticipants: channel.activeParticipants
            });
          }
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to leave voice channel' });
      }
    });

    socket.on('meeting:stream_audio', async (data) => {
      try {
        const { workspaceId, channelId, audioBuffer, userId, username } = data;
        
        if (!workspaceId || !channelId || !audioBuffer) {
          console.warn('[Socket] Invalid audio stream data');
          socket.emit('meeting:transcript_error', {
            error: 'Invalid audio data received'
          });
          return;
        }

        // Create session ID with user identification for multi-speaker support
        const sessionId = `${workspaceId}:${channelId}:${userId || socket.id}`;
        const session = getSession(sessionId);

        // Store speaker info in session
        if (!session.speakerName) {
          session.speakerName = username || 'Unknown Speaker';
          session.userId = userId || socket.id;
        }

        if (!session.isActive) {
          // Start session if not already active
          if (!meetingIntelligence.hasActiveSession(channelId)) {
            await meetingIntelligence.startSession(workspaceId, channelId);
          }

          // Set up callbacks
          const onPartialResult = (partialText) => {
            socket.to(`workspace:${workspaceId}`).emit('meeting:transcript_partial', {
              channelId,
              text: partialText,
              speaker: session.speakerName,
              userId: session.userId,
              isFinal: false
            });
            socket.emit('meeting:transcript_partial', {
              channelId,
              text: partialText,
              speaker: session.speakerName,
              userId: session.userId,
              isFinal: false
            });
          };

          const onFinalResult = async (finalText, words) => {
            // Final result - save to database and broadcast with speaker info
            if (finalText && finalText.trim().length > 0) {
              console.log(`[Speech-to-Text] ${session.speakerName}: "${finalText}"`);

              // Save to database with speaker information
              await meetingIntelligence.saveTextChunk(channelId, finalText, new Date().toISOString(), {
                speaker: session.speakerName,
                userId: session.userId
              });

              // Broadcast to all workspace users with speaker identification
              socket.to(`workspace:${workspaceId}`).emit('meeting:transcript_chunk', {
                channelId,
                text: finalText,
                speaker: session.speakerName,
                userId: session.userId,
                timestamp: new Date().toISOString(),
                isFinal: true
              });

              // Also emit to the sender
              socket.emit('meeting:transcript_chunk', {
                channelId,
                text: finalText,
                speaker: session.speakerName,
                userId: session.userId,
                timestamp: new Date().toISOString(),
                isFinal: true
              });
            }
          };

          const onError = (error) => {
            console.error(`[Speech-to-Text] Stream error (${sessionId}):`, error.message);
            
            // Provide helpful feedback to user
            const errorMessage = error.message || 'Transcription service unavailable';
            socket.emit('meeting:transcript_error', {
              error: errorMessage,
              details: 'Whisper transcription failed. Check server logs for details.'
            });
          };

          // Start the recognition stream
          session.startSession(onPartialResult, onFinalResult, onError);
        }

        // Send audio chunk to Whisper service
        const buffer = Buffer.from(audioBuffer, 'base64');
        session.sendAudio(buffer);

      } catch (error) {
        console.error('[Socket] Error handling audio stream:', error);
        socket.emit('meeting:transcript_error', {
          error: error.message || 'Audio transcription failed'
        });
      }
    });

    socket.on('meeting:end_transcription', async (data) => {
      try {
        const { workspaceId, channelId, userId, username } = data;
        const sessionId = `${workspaceId}:${channelId}:${userId || socket.id}`;

        // Get the session
        const session = getSession(sessionId);
        
        if (!session) {
          console.log(`[Speech-to-Text] No session found for ${sessionId}`);
          return;
        }
        
        // Get final accurate transcription of the full recording
        console.log(`[Speech-to-Text] Getting final accurate transcription for ${username || 'user'}...`);
        const finalTranscript = await session.getFinalTranscription();
        
        // End the streaming session
        await session.endSession();
        deleteSession(sessionId);

        console.log(`[Speech-to-Text] ${username || 'User'} transcription ended. Final transcript: "${finalTranscript}"`);

        // Emit the final accurate transcription with speaker info
        socket.to(`workspace:${workspaceId}`).emit('meeting:transcript_final', {
          channelId,
          text: finalTranscript,
          speaker: session.speakerName || username || 'Unknown Speaker',
          userId: session.userId || userId,
          timestamp: new Date().toISOString(),
          isFinal: true
        });

        socket.emit('meeting:transcript_final', {
          channelId,
          text: finalTranscript,
          speaker: session.speakerName || username || 'Unknown Speaker',
          userId: session.userId || userId,
          timestamp: new Date().toISOString(),
          isFinal: true
        });

        // Run intelligence extraction on the final transcript
        const intelligence = await meetingIntelligence.endSessionAndExtract(channelId, workspaceId);

        // Broadcast intelligence results
        socket.to(`workspace:${workspaceId}`).emit('meeting:intelligence_ready', {
          channelId,
          intelligence
        });

        socket.emit('meeting:intelligence_ready', {
          channelId,
          intelligence
        });

      } catch (error) {
        console.error('[Socket] Error ending transcription:', error);
        socket.emit('error', { message: 'Failed to end transcription' });
      }
    });

    socket.on('meeting:save_transcript_chunk', async (data) => {
      try {
        const { workspaceId, channelId, text, timestamp } = data;

        if (!text) return;

        // Start session if not already active
        if (!meetingIntelligence.hasActiveSession(channelId)) {
          await meetingIntelligence.startSession(workspaceId, channelId);
        }

        // Save the locally-transcribed text to MongoDB
        await meetingIntelligence.saveTextChunk(channelId, text, timestamp);

        // Emit the chunk to *other* clients in the workspace so they see the live feed too
        // (Broadcast sends to everyone except the sender)
        socket.to(`workspace:${workspaceId}`).emit('meeting:transcript_chunk', {
          channelId,
          text,
          timestamp: timestamp || new Date().toISOString()
        });

      } catch (error) {
        console.error('[Socket] Error handling transcript chunk:', error);
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

    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`);

      const userData = activeUsers.get(socket.userId);
      if (userData) {
        if (userData.currentVoiceChannel) {
          try {
            let channel = await VoiceChannel.findByIdAndUpdate(
              userData.currentVoiceChannel,
              { $pull: { activeParticipants: socket.userId } },
              { new: true }
            ).populate('activeParticipants', 'name avatar');

            // If the room is now empty, wipe the meet link
            if (channel && channel.activeParticipants.length === 0) {
              channel = await VoiceChannel.findByIdAndUpdate(
                userData.currentVoiceChannel,
                { $set: { activeMeetLink: null } },
                { new: true }
              ).populate('activeParticipants', 'name avatar');
            }

            if (channel) {
              // Note: We'd need the workspace ID to broadcast strictly to the workspace,
              // but we can broadcast to all workspaces the user was part of just in case.
              userData.workspaces.forEach(workspaceId => {
                socket.to(`workspace:${workspaceId}`).emit('voice:channel_updated', {
                  channelId: channel._id,
                  activeParticipants: channel.activeParticipants
                });
              });
            }
          } catch (err) {
            console.error('Error leaving voice channel on disconnect', err);
          }
        }

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
