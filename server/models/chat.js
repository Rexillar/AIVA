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
   ⟁  DOMAIN       : DATA MODELS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-flow.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import mongoose from "mongoose";
import { encryptionPlugin } from '../utils/encryption.js';

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const readReceiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
});

const chatMessageSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  // Threaded replies
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null,
    index: true
  },
  threadCount: {
    type: Number,
    default: 0
  },
  // Message type
  messageType: {
    type: String,
    enum: ['text', 'file', 'system', 'code', 'mention'],
    default: 'text',
    index: true
  },
  // Admin-only messages
  isAdminOnly: {
    type: Boolean,
    default: false,
    index: true
  },
  // Mentions
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Attachments
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  // Reactions
  reactions: [reactionSchema],
  // Read receipts
  readBy: [readReceiptSchema],
  // Edit tracking
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Deletion (soft delete)
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Pinned messages
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
chatMessageSchema.index({ workspace: 1, createdAt: -1 });
chatMessageSchema.index({ workspace: 1, isAdminOnly: 1, createdAt: -1 });
chatMessageSchema.index({ workspace: 1, task: 1, createdAt: -1 });
chatMessageSchema.index({ workspace: 1, parentMessage: 1, createdAt: 1 });
chatMessageSchema.index({ workspace: 1, isPinned: 1, createdAt: -1 });
chatMessageSchema.index({ workspace: 1, isDeleted: 1, createdAt: -1 });

// Text search index for message content
chatMessageSchema.index({ content: 'text' });

// Virtual for reply count
chatMessageSchema.virtual('replyCount', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'parentMessage',
  count: true
});

// Method to add reaction
chatMessageSchema.methods.addReaction = function (userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );

  if (!existingReaction) {
    this.reactions.push({ user: userId, emoji });
  }
  return this.save();
};

// Method to remove reaction
chatMessageSchema.methods.removeReaction = function (userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  return this.save();
};

// Method to mark as read
chatMessageSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.find(
    r => r.user.toString() === userId.toString()
  );

  if (!alreadyRead) {
    this.readBy.push({ user: userId });
  }
  return this.save();
};

// Method to edit message
chatMessageSchema.methods.editMessage = function (newContent) {
  if (this.content !== newContent) {
    this.editHistory.push({ content: this.content });
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
  }
  return this.save();
};

// Static method to get chat with pagination
chatMessageSchema.statics.getPaginatedMessages = async function (filters, options = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const messages = await this.find(filters)
    .populate('sender', 'name email avatar')
    .populate('mentions', 'name email avatar')
    .populate('attachments')
    .populate({
      path: 'parentMessage',
      populate: { path: 'sender', select: 'name email avatar' }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(filters);

  return {
    messages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      hasMore: page * limit < total
    }
  };
};

// Static method to search messages
chatMessageSchema.statics.searchMessages = async function (workspaceId, searchQuery, options = {}) {
  const {
    page = 1,
    limit = 20,
    messageType,
    isAdminOnly,
    sender
  } = options;

  const filters = {
    workspace: workspaceId,
    isDeleted: false,
    $text: { $search: searchQuery }
  };

  if (messageType) filters.messageType = messageType;
  if (isAdminOnly !== undefined) filters.isAdminOnly = isAdminOnly;
  if (sender) filters.sender = sender;

  return this.getPaginatedMessages(filters, { page, limit, sortBy: 'score' });
};

// Apply encryption plugin for sensitive fields BEFORE creating model
chatMessageSchema.plugin(encryptionPlugin, {
  encryptedFields: [
    'content',
    'editHistory.content'
  ]
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
