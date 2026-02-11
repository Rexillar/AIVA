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

   ⟁  PURPOSE      : Define task data structure and relationships

   ⟁  WHY          : Consistent task data modeling

   ⟁  WHAT         : MongoDB schema for tasks with encryption

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : AES-256-GCM
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-flow.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "Task data structured. Relationships defined. Security ensured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import mongoose from 'mongoose';
import { encryptionPlugin } from '../utils/encryption.js';

const activitySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  path: String,
  mimetype: String,
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Subtask title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  dueDate: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  category: {
    type: String,
    enum: ['research', 'writing', 'coding', 'reading', 'review', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'paused', 'completed'],
    default: 'not_started'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  dependencies: [{
    subtask: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, enum: ['blocks', 'blocked_by'], default: 'blocks' }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  reminders: [{
    time: Date,
    message: String,
    sent: { type: Boolean, default: false }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  stage: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return !isNaN(new Date(value).getTime());
      },
      message: 'Invalid due date format'
    },
    get: function (value) {
      if (!value) return null;
      // Return date at noon UTC
      const date = new Date(value);
      date.setUTCHours(12, 0, 0, 0);
      return date.toISOString();
    },
    set: function (value) {
      if (!value) return null;
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;
        // Store date at noon UTC
        date.setUTCHours(12, 0, 0, 0);
        return date;
      } catch (error) {
        return null;
      }
    }
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  labels: [{
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  focusTag: {
    type: String,
    enum: ['deep-work', 'creative', 'planning', 'review', 'communication', 'learning', 'other'],
    default: null
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    path: String,
    mimetype: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtasks: [subtaskSchema],
  activities: [activitySchema],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Unified Trash System
  isTrashed: {
    type: Boolean,
    default: false
  },
  trashedAt: Date,
  trashedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Deprecated: kept for backward compatibility during migration
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGoogleSynced: {
    type: Boolean,
    default: false
  },
  startDate: Date,
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedHours: Number,
  actualHours: Number,
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictPopulate: false
});

// Middleware to handle stage changes
taskSchema.pre('save', function (next) {
  if (this.isModified('stage')) {
    if (this.stage === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
      this.completedBy = this._modifiedBy; // Set by the controller
    } else if (this.stage !== 'completed') {
      this.completedAt = null;
      this.completedBy = null;
    }
  }
  next();
});

// Indexes for better query performance
taskSchema.index({ workspace: 1, isTrashed: 1 });
taskSchema.index({ workspace: 1, stage: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'labels.name': 1 });

// Virtual for progress calculation
taskSchema.virtual('progress').get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for status calculation
taskSchema.virtual('status').get(function () {
  if (this.isDeleted) return 'deleted';
  if (this.isArchived) return 'archived';
  if (this.stage === 'completed') return 'completed';
  if (this.dueDate && new Date(this.dueDate) < new Date()) return 'overdue';
  return 'active';
});

// Method to check if user can modify task
taskSchema.methods.canBeModifiedBy = function (userId) {
  return this.creator.equals(userId) ||
    this.assignees.some(assignee => assignee.equals(userId));
};

// Method to add activity
taskSchema.methods.addActivity = function (activity) {
  this.activities.push(activity);
  return this.save();
};

// Method to add subtask
taskSchema.methods.addSubtask = function (subtaskData) {
  this.subtasks.push(subtaskData);
  return this.save();
};

// Method to update subtask
taskSchema.methods.updateSubtask = function (subtaskId, updates) {
  const subtask = this.subtasks.id(subtaskId);
  if (!subtask) throw new Error('Subtask not found');

  // Handle status changes
  if (updates.status) {
    if (updates.status === 'completed') {
      subtask.completed = true;
      subtask.completedAt = new Date();
      subtask.progress = 100;
    } else if (subtask.status === 'completed' && updates.status !== 'completed') {
      subtask.completed = false;
      subtask.completedAt = null;
      subtask.progress = 0;
    }
  }

  // Handle progress updates
  if (updates.progress !== undefined) {
    subtask.progress = Math.min(Math.max(updates.progress, 0), 100);
    if (subtask.progress === 100) {
      subtask.completed = true;
      subtask.completedAt = new Date();
      subtask.status = 'completed';
    }
  }

  Object.assign(subtask, updates);
  subtask.updatedAt = new Date();

  // Update task progress based on subtask changes
  this.updateTaskProgress();

  return this.save();
};

// Method to delete subtask
taskSchema.methods.deleteSubtask = function (subtaskId) {
  const subtaskIndex = this.subtasks.findIndex(
    subtask => subtask._id.toString() === subtaskId
  );
  if (subtaskIndex === -1) throw new Error('Subtask not found');

  this.subtasks.splice(subtaskIndex, 1);
  return this.save();
};

// Method to complete subtask
taskSchema.methods.completeSubtask = function (subtaskId, userId) {
  const subtask = this.subtasks.id(subtaskId);
  if (!subtask) throw new Error('Subtask not found');

  subtask.completed = true;
  subtask.completedAt = new Date();
  subtask.completedBy = userId;
  subtask.status = 'completed';
  subtask.progress = 100;

  // Update task progress based on subtask completion
  this.updateTaskProgress();

  return this.save();
};

// Method to calculate and update task progress based on subtasks
taskSchema.methods.updateTaskProgress = function () {
  if (!this.subtasks || this.subtasks.length === 0) {
    this.progress = 0;
    return;
  }

  const totalSubtasks = this.subtasks.length;
  const completedSubtasks = this.subtasks.filter(st => st.completed).length;
  const inProgressSubtasks = this.subtasks.filter(st => st.status === 'in_progress').length;

  // Calculate progress based on completed and in-progress subtasks
  this.progress = Math.round(
    ((completedSubtasks + (inProgressSubtasks * 0.5)) / totalSubtasks) * 100
  );

  // Update task stage based on progress
  if (this.progress === 100) {
    this.stage = 'completed';
  } else if (this.progress > 0) {
    this.stage = 'in_progress';
  }
};

// Add methods to subtaskSchema
subtaskSchema.methods.updateProgress = function (progressValue) {
  this.progress = Math.min(Math.max(progressValue, 0), 100);
  if (this.progress === 100) {
    this.completed = true;
    this.completedAt = new Date();
    this.status = 'completed';
  }
  return this.progress;
};

subtaskSchema.methods.addNote = function (content, userId) {
  this.notes.push({
    content,
    createdBy: userId,
    createdAt: new Date()
  });
};

subtaskSchema.methods.addReminder = function (time, message) {
  this.reminders.push({
    time,
    message,
    sent: false
  });
};

subtaskSchema.methods.startWork = function () {
  if (this.status !== 'completed') {
    this.status = 'in_progress';
    this.startTime = new Date();
  }
};

subtaskSchema.methods.pauseWork = function () {
  if (this.status === 'in_progress') {
    this.status = 'paused';
    if (this.startTime) {
      const duration = Math.round((new Date() - this.startTime) / 1000 / 60); // Convert to minutes
      this.actualDuration = (this.actualDuration || 0) + duration;
    }
  }
};

subtaskSchema.methods.completeWork = function (userId) {
  this.completed = true;
  this.completedAt = new Date();
  this.completedBy = userId;
  this.status = 'completed';
  this.progress = 100;

  if (this.startTime) {
    const duration = Math.round((new Date() - this.startTime) / 1000 / 60); // Convert to minutes
    this.actualDuration = (this.actualDuration || 0) + duration;
  }
  this.endTime = new Date();
};

// Virtual for time tracking
subtaskSchema.virtual('timeSpent').get(function () {
  if (!this.startTime) return 0;
  if (this.endTime) {
    return Math.round((this.endTime - this.startTime) / 1000 / 60); // Convert to minutes
  }
  return Math.round((new Date() - this.startTime) / 1000 / 60); // Convert to minutes
});

// Virtual for remaining time
subtaskSchema.virtual('remainingTime').get(function () {
  if (!this.dueDate) return null;
  const now = new Date();
  return Math.round((this.dueDate - now) / 1000 / 60); // Convert to minutes
});

// Virtual for efficiency score
subtaskSchema.virtual('efficiencyScore').get(function () {
  if (!this.completed || !this.estimatedDuration || !this.actualDuration) return null;
  return Math.round((this.estimatedDuration / this.actualDuration) * 100);
});

// Apply encryption plugin for sensitive fields BEFORE creating model
taskSchema.plugin(encryptionPlugin, {
  encryptedFields: [
    'title',
    'description',
    'labels.name',
    'attachments.filename',
    'subtasks.title',
    'subtasks.description',
    'subtasks.notes.content',
    'activities.content',
    'comments.content'
  ]
});

const Task = mongoose.model('Task', taskSchema);

export default Task;