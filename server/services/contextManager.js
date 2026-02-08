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

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import Habit from '../models/habit.js';
import Task from '../models/task.js';
import ChatHistory from '../models/chatHistory.js';
import { Workspace } from '../models/workspace.js';
import Note from '../models/note.js';
import Notification from '../models/notification.js';
import Reminder from '../models/reminderModel.js';

// Context priority levels
export const PRIORITY_LEVELS = {
  CRITICAL: 1,    // Active session data (current workspace, today's tasks/habits)
  HIGH: 2,        // Recent activity (last 24 hours)
  MEDIUM: 3,      // Weekly data (last 7 days)
  LOW: 4          // Historical data (analytics, trends)
};

// Context cache with metadata
const contextCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Context structure with update tracking
 */
class ContextData {
  constructor(userId, workspaceId) {
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.timestamp = Date.now();
    this.lastAccessed = Date.now();
    this.updateCount = 0;

    // Priority-based data storage
    this.critical = {};
    this.high = {};
    this.medium = {};
    this.low = {};

    // Track which fields have been loaded
    this.loadedFields = new Set();

    // Track field usage for optimization
    this.fieldUsage = {};
  }

  markFieldAccessed(field) {
    this.lastAccessed = Date.now();
    this.fieldUsage[field] = (this.fieldUsage[field] || 0) + 1;
  }

  isStale() {
    return Date.now() - this.timestamp > CACHE_TTL;
  }

  shouldPreload(field) {
    return this.fieldUsage[field] >= 3; // Preload fields used 3+ times
  }
}

/**
 * Build critical context (always loaded)
 */
const buildCriticalContext = async (userId, workspaceId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeWorkspace, todayTasks, activeHabits] = await Promise.all([
    Workspace.findById(workspaceId).select('name description isActive').lean(),
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      dueDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      isDeleted: false
    }).select('title stage priority dueDate').limit(20).lean(),
    Habit.find({
      user: userId,
      workspace: workspaceId,
      isActive: true,
      isPaused: false
    }).select('title category currentStreak completions frequency').lean()
  ]);

  // Check today's habit completions
  const todayHabits = activeHabits.map(habit => {
    const isCompletedToday = habit.completions.some(c => {
      const cDate = new Date(c.date);
      cDate.setHours(0, 0, 0, 0);
      return cDate.getTime() === today.getTime() && c.completed;
    });

    return {
      id: habit._id,
      title: habit.title,
      category: habit.category,
      streak: habit.currentStreak,
      completedToday: isCompletedToday
    };
  });

  return {
    workspace: activeWorkspace,
    todayTasks: todayTasks.map(t => ({
      id: t._id,
      title: t.title,
      stage: t.stage,
      priority: t.priority,
      dueDate: t.dueDate
    })),
    todayHabits,
    currentTime: new Date().toISOString()
  };
};

/**
 * Build high priority context (recent activity)
 */
const buildHighPriorityContext = async (userId, workspaceId) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [recentMessages, unreadNotifications] = await Promise.all([
    ChatHistory.findOne({
      user: userId,
      workspaceId: workspaceId
    }).select('messages').lean().then(history =>
      history?.messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content.substring(0, 200), // Truncate long messages
        timestamp: m.createdAt
      })) || []
    ),
    Notification.find({
      user: userId,
      isRead: false,
      createdAt: { $gte: last24Hours }
    }).select('type message createdAt').limit(5).lean()
  ]);

  return {
    recentConversation: recentMessages,
    notifications: {
      unread: unreadNotifications.length,
      recent: unreadNotifications.map(n => ({
        type: n.type,
        message: n.message,
        createdAt: n.createdAt
      }))
    }
  };
};

/**
 * Build medium priority context (weekly data)
 */
const buildMediumPriorityContext = async (userId, workspaceId) => {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [recentTasks, recentNotes, upcomingReminders] = await Promise.all([
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      createdAt: { $gte: last7Days },
      isDeleted: false
    }).select('title stage priority dueDate completedAt').limit(30).lean(),
    Note.find({
      user: userId,
      workspace: workspaceId,
      isTrashed: false
    }).select('title tags updatedAt').sort({ updatedAt: -1 }).limit(10).lean(),
    Reminder.find({
      user: userId,
      status: 'pending',
      date: { $gte: new Date() }
    }).select('title date time').sort({ date: 1, time: 1 }).limit(10).lean()
  ]);

  return {
    recentTasks: recentTasks.map(t => ({
      title: t.title,
      stage: t.stage,
      priority: t.priority,
      dueDate: t.dueDate,
      isOverdue: t.dueDate && new Date(t.dueDate) < new Date()
    })),
    notes: recentNotes.map(n => ({
      title: n.title,
      tags: n.tags,
      updatedAt: n.updatedAt
    })),
    reminders: upcomingReminders.map(r => ({
      title: r.title,
      date: r.date,
      time: r.time
    }))
  };
};

/**
 * Build low priority context (analytics/historical)
 */
const buildLowPriorityContext = async (userId, workspaceId) => {
  const [allWorkspaces, taskStats, habitStats] = await Promise.all([
    Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    }).select('name isActive').limit(10).lean(),
    getTaskStatistics(userId, workspaceId),
    Habit.getUserStatistics(userId, workspaceId)
  ]);

  return {
    workspaces: allWorkspaces.map(w => ({ name: w.name, isActive: w.isActive })),
    taskStats,
    habitStats
  };
};

/**
 * Get task statistics
 */
const getTaskStatistics = async (userId, workspaceId) => {
  const tasks = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    isDeleted: false
  }).select('stage dueDate').lean();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.stage === 'completed').length,
    inProgress: tasks.filter(t => t.stage === 'in_progress').length,
    todo: tasks.filter(t => t.stage === 'todo').length,
    overdue: tasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) < today &&
      t.stage !== 'completed'
    ).length
  };
};

/**
 * Get or build context with priority-based loading
 */
export const getContext = async (userId, workspaceId, priority = PRIORITY_LEVELS.CRITICAL) => {
  const cacheKey = `${userId}-${workspaceId}`;
  let context = contextCache.get(cacheKey);

  // Create new context if doesn't exist or is stale
  if (!context || context.isStale()) {
    context = new ContextData(userId, workspaceId);
    contextCache.set(cacheKey, context);
  }

  // Load data based on priority
  if (priority >= PRIORITY_LEVELS.CRITICAL && !context.loadedFields.has('critical')) {
    context.critical = await buildCriticalContext(userId, workspaceId);
    context.loadedFields.add('critical');
  }

  if (priority >= PRIORITY_LEVELS.HIGH && !context.loadedFields.has('high')) {
    context.high = await buildHighPriorityContext(userId, workspaceId);
    context.loadedFields.add('high');
  }

  if (priority >= PRIORITY_LEVELS.MEDIUM && !context.loadedFields.has('medium')) {
    context.medium = await buildMediumPriorityContext(userId, workspaceId);
    context.loadedFields.add('medium');
  }

  if (priority >= PRIORITY_LEVELS.LOW && !context.loadedFields.has('low')) {
    context.low = await buildLowPriorityContext(userId, workspaceId);
    context.loadedFields.add('low');
  }

  return {
    ...context.critical,
    ...context.high,
    ...context.medium,
    ...context.low
  };
};

/**
 * Incremental context update - only refresh changed data
 */
export const updateContext = async (userId, workspaceId, updatedFields) => {
  const cacheKey = `${userId}-${workspaceId}`;
  let context = contextCache.get(cacheKey);

  if (!context) {
    // No cached context, build from scratch
    return await getContext(userId, workspaceId);
  }

  context.updateCount++;

  // Update only specified fields
  for (const field of updatedFields) {
    switch (field) {
      case 'tasks':
        context.critical.todayTasks = await buildCriticalContext(userId, workspaceId).then(c => c.todayTasks);
        context.medium.recentTasks = await buildMediumPriorityContext(userId, workspaceId).then(c => c.recentTasks);
        break;

      case 'habits':
        context.critical.todayHabits = await buildCriticalContext(userId, workspaceId).then(c => c.todayHabits);
        break;

      case 'conversation':
        context.high.recentConversation = await buildHighPriorityContext(userId, workspaceId).then(c => c.recentConversation);
        break;

      case 'notifications':
        context.high.notifications = await buildHighPriorityContext(userId, workspaceId).then(c => c.notifications);
        break;

      case 'notes':
        context.medium.notes = await buildMediumPriorityContext(userId, workspaceId).then(c => c.notes);
        break;

      case 'reminders':
        context.medium.reminders = await buildMediumPriorityContext(userId, workspaceId).then(c => c.reminders);
        break;

      case 'stats':
        context.low = await buildLowPriorityContext(userId, workspaceId);
        break;
    }

    context.markFieldAccessed(field);
  }

  context.timestamp = Date.now();

  return {
    ...context.critical,
    ...context.high,
    ...context.medium,
    ...context.low
  };
};

/**
 * Get compressed context for API calls (reduce token usage)
 */
export const getCompressedContext = async (userId, workspaceId, includeHistory = false) => {
  const context = await getContext(userId, workspaceId, PRIORITY_LEVELS.HIGH);

  return {
    workspace: context.workspace?.name,
    todayTasks: context.todayTasks?.length || 0,
    todayHabits: {
      total: context.todayHabits?.length || 0,
      completed: context.todayHabits?.filter(h => h.completedToday).length || 0
    },
    unreadNotifications: context.notifications?.unread || 0,
    ...(includeHistory && {
      recentMessages: context.recentConversation?.slice(-5).map(m => ({
        role: m.role,
        summary: m.content.substring(0, 100)
      }))
    })
  };
};

/**
 * Preload context for likely next queries
 */
export const preloadContext = async (userId, workspaceId) => {
  const cacheKey = `${userId}-${workspaceId}`;
  const context = contextCache.get(cacheKey);

  if (!context) return;

  // Preload fields that are frequently accessed
  const fieldsToPreload = Object.entries(context.fieldUsage)
    .filter(([_, count]) => count >= 3)
    .map(([field, _]) => field);

  if (fieldsToPreload.length > 0) {
    await updateContext(userId, workspaceId, fieldsToPreload);
  }
};

/**
 * Clear context cache for user
 */
export const clearContext = (userId, workspaceId) => {
  const cacheKey = `${userId}-${workspaceId}`;
  contextCache.delete(cacheKey);
};

/**
 * Get context usage statistics
 */
export const getContextStats = (userId, workspaceId) => {
  const cacheKey = `${userId}-${workspaceId}`;
  const context = contextCache.get(cacheKey);

  if (!context) return null;

  return {
    age: Date.now() - context.timestamp,
    updateCount: context.updateCount,
    loadedFields: Array.from(context.loadedFields),
    fieldUsage: context.fieldUsage,
    isStale: context.isStale()
  };
};

export default {
  getContext,
  updateContext,
  getCompressedContext,
  preloadContext,
  clearContext,
  getContextStats
};