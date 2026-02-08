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

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : API SERVICES

   ⟁  PURPOSE      : Handle client-server communication

   ⟁  WHY          : Reliable API integration and error handling

   ⟁  WHAT         : HTTP client and API request management

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Handle errors • Retry logic • Authentication

        "APIs called. Data fetched. Communication reliable."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No auth token found, skipping socket connection");
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || "/";

    this.socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });
  }

  // Workspace Methods
  joinWorkspace(workspaceId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join:workspace", workspaceId);
      console.log(`Joined workspace: ${workspaceId}`);
    }
  }

  leaveWorkspace(workspaceId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave:workspace", workspaceId);
      console.log(`Left workspace: ${workspaceId}`);
    }
  }

  // Chat Methods
  sendMessage(workspaceId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit("chat:send_message", {
        workspaceId,
        message,
      });
    }
  }

  editMessage(workspaceId, messageId, newContent) {
    if (this.socket && this.isConnected) {
      this.socket.emit("chat:edit_message", {
        workspaceId,
        messageId,
        newContent,
      });
    }
  }

  deleteMessage(workspaceId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("chat:delete_message", {
        workspaceId,
        messageId,
      });
    }
  }

  reactToMessage(workspaceId, messageId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit("chat:react", {
        workspaceId,
        messageId,
        emoji,
      });
    }
  }

  // Typing Indicators
  startTyping(workspaceId, taskId = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing:start", { workspaceId, taskId });
    }
  }

  stopTyping(workspaceId, taskId = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing:stop", { workspaceId, taskId });
    }
  }

  // Read Receipts
  markAsRead(workspaceId, messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("message:read", { workspaceId, messageId });
    }
  }

  // File Upload Events
  fileUploadStart(workspaceId, fileName) {
    if (this.socket && this.isConnected) {
      this.socket.emit("file:upload_start", { workspaceId, fileName });
    }
  }

  fileUploadComplete(workspaceId, file) {
    if (this.socket && this.isConnected) {
      this.socket.emit("file:upload_complete", { workspaceId, file });
    }
  }

  fileUploadProgress(workspaceId, fileName, progress) {
    if (this.socket && this.isConnected) {
      this.socket.emit("file:upload_progress", {
        workspaceId,
        fileName,
        progress,
      });
    }
  }

  // Status Updates
  changeStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit("status:change", status);
    }
  }

  // Presence
  sendPresencePing() {
    if (this.socket && this.isConnected) {
      this.socket.emit("presence:ping");
    }
  }

  // Task Updates
  updateTask(workspaceId, taskId, updates) {
    if (this.socket && this.isConnected) {
      this.socket.emit("task:update", {
        workspaceId,
        taskId,
        updates,
      });
    }
  }

  // Event Listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log("Socket.IO manually disconnected");
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
