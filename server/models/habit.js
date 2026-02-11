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
import { encryptionPlugin } from '../utils/encryption.js';

const completionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  note: {
    type: String,
    maxlength: 500
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
    required: true
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'social', 'finance', 'creative', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  customFrequency: {
    // For weekly: ['monday', 'wednesday', 'friday']
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    // For custom intervals: every X days
    interval: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  goal: {
    type: {
      type: String,
      enum: ['count', 'duration', 'boolean'],
      default: 'boolean'
    },
    target: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['times', 'minutes', 'hours', 'pages', 'items', 'custom'],
      default: 'times'
    },
    customUnit: String
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    time: {
      type: String, // Format: "HH:mm"
      validate: {
        validator: function (v) {
          return !v || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: 'Time must be in HH:mm format'
      }
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  color: {
    type: String,
    default: '#6366f1' // Indigo
  },
  icon: {
    type: String,
    default: '🎯'
  },
  completions: [completionSchema],
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  statistics: {
    completionRate: {
      type: Number,
      default: 0
    },
    averageCompletionsPerWeek: {
      type: Number,
      default: 0
    },
    lastCompletedDate: Date,
    missedDays: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  trashedAt: Date,
  trashedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: [{
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
habitSchema.index({ user: 1, workspace: 1, isTrashed: 1 });
habitSchema.index({ user: 1, workspace: 1, isArchived: 1 });
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ workspace: 1, isArchived: 1 });
habitSchema.index({ workspace: 1, visibility: 1, isArchived: 1 });
habitSchema.index({ 'completions.date': 1 });
habitSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if habit is completed today
habitSchema.virtual('isCompletedToday').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.completions.some(completion => {
    const completionDate = new Date(completion.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime() && completion.completed;
  });
});

// Virtual for days since started
habitSchema.virtual('daysSinceStart').get(function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = Math.abs(now - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to toggle completion for a specific date
habitSchema.methods.toggleCompletion = function (date, note = '') {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const existingCompletion = this.completions.find(c => {
    const cDate = new Date(c.date);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() === targetDate.getTime();
  });

  if (existingCompletion) {
    existingCompletion.completed = !existingCompletion.completed;
    if (note) existingCompletion.note = note;
  } else {
    this.completions.push({
      date: targetDate,
      completed: true,
      note: note
    });
  }

  this.calculateStreaks();
  this.calculateStatistics();
};

// Method to calculate current and longest streaks
habitSchema.methods.calculateStreaks = function () {
  const sortedCompletions = this.completions
    .filter(c => c.completed)
    .map(c => new Date(c.date))
    .sort((a, b) => b - a);

  if (sortedCompletions.length === 0) {
    this.currentStreak = 0;
    return;
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check current streak
  const mostRecent = new Date(sortedCompletions[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) {
    currentStreak = 1;

    for (let i = 1; i < sortedCompletions.length; i++) {
      const current = new Date(sortedCompletions[i]);
      const previous = new Date(sortedCompletions[i - 1]);
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);

      const diff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedCompletions.length; i++) {
    const current = new Date(sortedCompletions[i]);
    const previous = new Date(sortedCompletions[i - 1]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  this.currentStreak = currentStreak;
  this.longestStreak = Math.max(this.longestStreak, longestStreak);
  this.totalCompletions = sortedCompletions.length;
};

// Method to calculate statistics
habitSchema.methods.calculateStatistics = function () {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const daysSinceStart = Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));

  const completedDays = this.completions.filter(c => c.completed).length;

  // Calculate completion rate
  this.statistics.completionRate = Math.round((completedDays / daysSinceStart) * 100);

  // Calculate average completions per week
  const weeksSinceStart = Math.max(1, daysSinceStart / 7);
  this.statistics.averageCompletionsPerWeek = Math.round((completedDays / weeksSinceStart) * 10) / 10;

  // Update last completed date
  const sortedCompletions = this.completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedCompletions.length > 0) {
    this.statistics.lastCompletedDate = sortedCompletions[0].date;
  }

  // Calculate missed days (expected days - completed days)
  let expectedDays = 0;
  if (this.frequency === 'daily') {
    expectedDays = daysSinceStart;
  } else if (this.frequency === 'weekly' && this.customFrequency.days.length > 0) {
    expectedDays = Math.floor(daysSinceStart / 7) * this.customFrequency.days.length;
  }

  this.statistics.missedDays = Math.max(0, expectedDays - completedDays);
};

// Pre-save middleware to calculate streaks and statistics
habitSchema.pre('save', function (next) {
  if (this.isModified('completions')) {
    this.calculateStreaks();
    this.calculateStatistics();
  }
  next();
});

// Static method to get habits due today for a user
habitSchema.statics.getDueToday = async function (userId, workspaceId) {
  const today = new Date();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];

  const query = {
    user: userId,
    workspace: workspaceId,
    isActive: true,
    isPaused: false,
    isArchived: false,
    $or: [
      { frequency: 'daily' },
      {
        frequency: 'weekly',
        'customFrequency.days': dayName
      }
    ]
  };

  return this.find(query);
};

// Static method to get habit statistics for a user
habitSchema.statics.getUserStatistics = async function (userId, workspaceId) {
  const habits = await this.find({
    user: userId,
    workspace: workspaceId,
    isArchived: false
  });

  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.isActive && !h.isPaused).length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
  const averageStreak = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length)
    : 0;
  const longestStreakOverall = Math.max(...habits.map(h => h.longestStreak), 0);

  return {
    totalHabits,
    activeHabits,
    totalCompletions,
    averageStreak,
    longestStreakOverall
  };
};

// Apply encryption plugin for sensitive fields BEFORE creating model
habitSchema.plugin(encryptionPlugin, {
  encryptedFields: [
    'title',
    'description',
    'completions.note',
    'notes.content',
    'tags'
  ]
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
