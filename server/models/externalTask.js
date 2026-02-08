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
import mongoose from 'mongoose';

const ExternalTaskSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },

  // Source information
  source: {
    type: String,
    enum: ['google-tasks', 'aiva'],
    required: true,
    default: 'google-tasks'
  },

  // If from Google Tasks
  googleAccountId: {
    type: String,
    trim: true,
    index: true
  },
  googleTaskId: {
    type: String,
    trim: true,
    sparse: true
  },
  googleTaskListId: {
    type: String,
    trim: true
  },
  googleTaskListName: {
    type: String,
    trim: true
  },

  // Task data
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    index: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['needsAction', 'completed'],
    default: 'needsAction'
  },

  // Google-specific fields
  notes: {
    type: String,
    trim: true
  },
  parent: {
    type: String,
    trim: true
  },
  position: {
    type: String
  },
  links: [{
    type: String,
    description: String
  }],

  // AIVA enhancements
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  convertedToAIVATask: {
    type: Boolean,
    default: false
  },
  aivaTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  aivaReminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }],
  aivaAttachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],

  // Display settings
  showInTaskList: {
    type: Boolean,
    default: true
  },
  colorCode: {
    type: String,
    default: '#4285F4'
  },
  isVisible: {
    type: Boolean,
    default: true
  },

  // Permissions
  isReadOnly: {
    type: Boolean,
    default: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },

  // Sync metadata
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'conflict', 'deleted', 'error'],
    default: 'synced'
  },
  syncError: {
    type: String
  },
  conflictData: {
    googleVersion: {
      title: String,
      notes: String,
      status: String,
      due: String,
      updated: String
    },
    aivaVersion: {
      title: String,
      notes: String,
      status: String,
      due: String
    },
    detectedAt: Date
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
ExternalTaskSchema.index({ workspaceId: 1, status: 1 });
ExternalTaskSchema.index({ workspaceId: 1, dueDate: 1 });
ExternalTaskSchema.index({ workspaceId: 1, googleAccountId: 1 });
ExternalTaskSchema.index({ googleTaskId: 1, googleTaskListId: 1 }, { sparse: true });
ExternalTaskSchema.index({ aivaTaskId: 1 }, { sparse: true });

// Methods
ExternalTaskSchema.methods.convertToAIVATask = async function (aivaTaskId) {
  this.convertedToAIVATask = true;
  this.aivaTaskId = aivaTaskId;
  return this.save();
};

ExternalTaskSchema.methods.markCompleted = async function () {
  this.status = 'completed';
  this.completedDate = new Date();
  return this.save();
};

ExternalTaskSchema.methods.isFromGoogle = function () {
  return this.source === 'google-tasks' && this.googleAccountId;
};

ExternalTaskSchema.methods.canUserEdit = function () {
  return this.canEdit && !this.isReadOnly;
};

// Statics
ExternalTaskSchema.statics.findActiveByWorkspace = function (workspaceId, filters = {}) {
  const query = {
    workspaceId,
    isDeleted: false,
    showInTaskList: true
  };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.googleAccountIds && filters.googleAccountIds.length > 0) {
    query.googleAccountId = { $in: filters.googleAccountIds };
  }

  if (filters.dueDate) {
    query.dueDate = { $lte: filters.dueDate };
  }

  return this.find(query).sort({ dueDate: 1, createdAt: -1 });
};

ExternalTaskSchema.statics.findByAccount = function (workspaceId, googleAccountId) {
  return this.find({
    workspaceId,
    googleAccountId,
    isDeleted: false
  }).sort({ dueDate: 1 });
};

ExternalTaskSchema.statics.findUnconverted = function (workspaceId, googleAccountId) {
  return this.find({
    workspaceId,
    googleAccountId,
    convertedToAIVATask: false,
    isDeleted: false
  });
};

ExternalTaskSchema.statics.getStats = async function (workspaceId, googleAccountId) {
  const query = {
    workspaceId,
    googleAccountId,
    isDeleted: false
  };

  const total = await this.countDocuments(query);
  const completed = await this.countDocuments({ ...query, status: 'completed' });
  const pending = await this.countDocuments({ ...query, status: 'needsAction' });
  const overdue = await this.countDocuments({
    ...query,
    status: 'needsAction',
    dueDate: { $lt: new Date() }
  });

  return { total, completed, pending, overdue };
};

const ExternalTask = mongoose.model('ExternalTask', ExternalTaskSchema);

export default ExternalTask;
