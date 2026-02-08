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

const AttendeeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  name: String,
  responseStatus: {
    type: String,
    enum: ['needsAction', 'declined', 'tentative', 'accepted'],
    default: 'needsAction'
  },
  isAIVAUser: {
    type: Boolean,
    default: false
  },
  aivaUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false });

const ExternalCalendarEventSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },

  // Source information
  source: {
    type: String,
    enum: ['google', 'aiva'],
    required: true,
    index: true
  },

  // If from Google
  googleAccountId: {
    type: String,
    trim: true,
    index: true
  },
  googleEventId: {
    type: String,
    trim: true,
    sparse: true
  },
  googleCalendarId: {
    type: String,
    trim: true
  },

  // Event data (normalized)
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  timeZone: {
    type: String,
    default: 'UTC'
  },

  // Meeting information
  meetingLink: {
    type: String,
    trim: true
  },
  meetingProvider: {
    type: String,
    enum: ['google-meet', 'zoom', 'teams', 'other'],
    trim: true
  },

  // Attendees
  attendees: [AttendeeSchema],
  organizer: {
    email: String,
    name: String,
    isAIVAUser: Boolean,
    aivaUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Recurrence
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrenceRule: {
    type: String
  },
  recurringEventId: {
    type: String
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

  // AIVA enhancements
  linkedTaskId: {
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
  aivaNotes: {
    type: String,
    trim: true
  },

  // Display settings
  colorCode: {
    type: String,
    default: '#4285F4'
  },
  isVisible: {
    type: Boolean,
    default: true
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

// Compound indexes for efficient queries
ExternalCalendarEventSchema.index({ workspaceId: 1, startTime: 1, endTime: 1 });
ExternalCalendarEventSchema.index({ workspaceId: 1, source: 1, googleAccountId: 1 });
ExternalCalendarEventSchema.index({ googleEventId: 1, googleCalendarId: 1 }, { sparse: true });
ExternalCalendarEventSchema.index({ linkedTaskId: 1 }, { sparse: true });

// Methods
ExternalCalendarEventSchema.methods.linkToTask = async function (taskId) {
  this.linkedTaskId = taskId;
  return this.save();
};

ExternalCalendarEventSchema.methods.addReminder = async function (reminderId) {
  if (!this.aivaReminders.includes(reminderId)) {
    this.aivaReminders.push(reminderId);
    return this.save();
  }
  return this;
};

ExternalCalendarEventSchema.methods.isFromGoogle = function () {
  return this.source === 'google' && this.googleAccountId;
};

ExternalCalendarEventSchema.methods.canUserEdit = function (userId) {
  if (this.source === 'aiva') return true;
  if (this.source === 'google') return this.canEdit;
  return false;
};

// Statics
ExternalCalendarEventSchema.statics.findByDateRange = function (workspaceId, startDate, endDate, filters = {}) {
  const query = {
    workspaceId,
    isDeleted: false,
    $or: [
      { startTime: { $gte: startDate, $lte: endDate } },
      { endTime: { $gte: startDate, $lte: endDate } },
      { $and: [{ startTime: { $lte: startDate } }, { endTime: { $gte: endDate } }] }
    ]
  };

  if (filters.source) {
    query.source = filters.source;
  }

  if (filters.googleAccountIds && filters.googleAccountIds.length > 0) {
    query.googleAccountId = { $in: filters.googleAccountIds };
  }

  if (filters.isVisible !== undefined) {
    query.isVisible = filters.isVisible;
  }

  return this.find(query).sort({ startTime: 1 });
};

ExternalCalendarEventSchema.statics.findUpcomingForAccount = function (workspaceId, googleAccountId, limit = 10) {
  return this.find({
    workspaceId,
    googleAccountId,
    source: 'google',
    startTime: { $gte: new Date() },
    isDeleted: false
  })
    .sort({ startTime: 1 })
    .limit(limit);
};

ExternalCalendarEventSchema.statics.detectDuplicates = async function (workspaceId, eventData) {
  const timeWindow = 5 * 60 * 1000; // 5 minutes

  return this.find({
    workspaceId,
    title: eventData.title,
    startTime: {
      $gte: new Date(eventData.startTime.getTime() - timeWindow),
      $lte: new Date(eventData.startTime.getTime() + timeWindow)
    },
    isDeleted: false
  });
};

const ExternalCalendarEvent = mongoose.model('ExternalCalendarEvent', ExternalCalendarEventSchema);

export default ExternalCalendarEvent;
