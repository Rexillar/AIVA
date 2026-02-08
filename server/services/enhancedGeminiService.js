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
import Habit from '../models/habit.js';
import Task from '../models/task.js';
import ChatHistory from '../models/chatHistory.js';
import User from '../models/user.js';
import { Workspace } from '../models/workspace.js';
import Note from '../models/note.js';
import Notification from '../models/notification.js';
import Reminder from '../models/reminderModel.js';
import { enhancedAssistantPrompt } from '../utils/enhancedAssistantPrompt.js';

const apiKey = process.env.GEMINI_API_KEY;

// Session context cache (in-memory, per user)
const sessionContextCache = new Map();

// Context retention time (30 minutes)
const CONTEXT_RETENTION_MS = 30 * 60 * 1000;

/**
 * Build comprehensive context for the AI
 */
const buildEnhancedContext = async (userId, workspaceId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch recent tasks (last 7 days)
    const recentTasks = await Task.find({
      workspace: workspaceId,
      $or: [
        { creator: userId },
        { assignees: userId }
      ],
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .select('title stage priority dueDate completedAt')
      .limit(20)
      .lean();

    // Fetch active habits
    const activeHabits = await Habit.find({
      user: userId,
      workspace: workspaceId,
      isActive: true,
      isPaused: false,
      isArchived: false
    })
      .select('title category currentStreak totalCompletions completions frequency')
      .lean();

    // Fetch workspaces
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
      .select('name description isActive')
      .limit(10)
      .lean();

    // Fetch recent notes
    const recentNotes = await Note.find({
      user: userId,
      workspace: workspaceId
    })
      .select('title content tags createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Fetch unread notifications
    const unreadNotifications = await Notification.find({
      user: userId,
      isRead: false
    })
      .select('type message createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch upcoming reminders
    const upcomingReminders = await Reminder.find({
      user: userId,
      status: 'pending',
      date: { $gte: new Date() }
    })
      .select('title date time notifyBefore')
      .sort({ date: 1, time: 1 })
      .limit(10)
      .lean();

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
        completedToday: isCompletedToday,
        totalCompletions: habit.totalCompletions
      };
    });

    // Fetch chat history (last 20 messages)
    const chatHistory = await ChatHistory.findOne({
      user: userId,
      workspaceId: workspaceId
    }).lean();

    const recentMessages = chatHistory?.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.createdAt
    })) || [];

    // Calculate daily stats
    const completedTasksToday = recentTasks.filter(t =>
      t.stage === 'completed' &&
      t.completedAt &&
      new Date(t.completedAt) >= today
    ).length;

    const pendingTasksToday = recentTasks.filter(t =>
      t.dueDate &&
      new Date(t.dueDate) <= tomorrow &&
      t.stage !== 'completed'
    ).length;

    const completedHabitsToday = todayHabits.filter(h => h.completedToday).length;
    const totalHabitsToday = todayHabits.filter(h =>
      h.frequency === 'daily' ||
      (h.frequency === 'weekly' && isDueToday(h))
    ).length;

    return {
      currentTime: new Date().toISOString(),
      recentTasks: recentTasks.map(t => ({
        title: t.title,
        stage: t.stage,
        priority: t.priority,
        dueDate: t.dueDate,
        isOverdue: t.dueDate && new Date(t.dueDate) < today
      })),
      habits: todayHabits,
      workspaces: workspaces.map(w => ({
        name: w.name,
        description: w.description,
        isActive: w.isActive
      })),
      notes: recentNotes.map(n => ({
        title: n.title,
        tags: n.tags,
        updatedAt: n.updatedAt
      })),
      notifications: {
        unread: unreadNotifications.length,
        recent: unreadNotifications.slice(0, 5).map(n => ({
          type: n.type,
          message: n.message,
          createdAt: n.createdAt
        }))
      },
      reminders: upcomingReminders.map(r => ({
        title: r.title,
        date: r.date,
        time: r.time
      })),
      todayStats: {
        completedTasks: completedTasksToday,
        pendingTasks: pendingTasksToday,
        completedHabits: completedHabitsToday,
        totalHabits: totalHabitsToday,
        habitCompletionRate: totalHabitsToday > 0
          ? Math.round((completedHabitsToday / totalHabitsToday) * 100)
          : 0
      },
      recentConversation: recentMessages,
      sessionInfo: {
        userId: userId.toString(),
        workspaceId: workspaceId.toString()
      }
    };
  } catch (error) {
    console.error('Error building context:', error);
    return null;
  }
};

/**
 * Check if habit is due today
 */
const isDueToday = (habit) => {
  if (habit.frequency === 'daily') return true;

  if (habit.frequency === 'weekly' && habit.customFrequency?.days) {
    const today = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    return habit.customFrequency.days.includes(dayName);
  }

  return false;
};

/**
 * Execute AI-commanded actions
 */
const executeAction = async (action, userId, workspaceId) => {
  try {
    const { method, endpoint, body } = action;

    switch (endpoint) {
      // ===== HABITS API =====
      case '/api/habits':
        if (method === 'POST') {
          // Create new habit
          const habit = await Habit.create({
            ...body,
            user: userId,
            workspace: workspaceId
          });
          return { success: true, data: habit };
        } else if (method === 'DELETE' && body.title) {
          // Delete habit by title
          const habit = await Habit.findOneAndDelete({
            user: userId,
            workspace: workspaceId,
            title: new RegExp(body.title, 'i')
          });
          return { success: true, data: habit };
        } else if (method === 'PATCH' && body.habitId) {
          // Update habit
          const habit = await Habit.findByIdAndUpdate(
            body.habitId,
            body.updates,
            { new: true }
          );
          return { success: true, data: habit };
        }
        break;

      case '/api/completions':
        if (method === 'POST') {
          // Mark habit as complete
          const habit = await Habit.findOne({
            user: userId,
            workspace: workspaceId,
            title: new RegExp(body.habitName || body.habitTitle, 'i'),
            isActive: true
          });

          if (!habit) {
            return { success: false, error: 'Habit not found' };
          }

          habit.toggleCompletion(body.date || new Date(), body.note || '');
          await habit.save();
          return { success: true, data: habit };
        }
        break;

      // ===== TASKS API =====
      case '/api/tasks':
        if (method === 'POST') {
          // Create new task
          const task = await Task.create({
            ...body,
            creator: userId,
            workspace: workspaceId,
            assignees: [userId]
          });
          return { success: true, data: task };
        } else if (method === 'GET') {
          // List tasks with optional filters
          const query = {
            workspace: workspaceId,
            $or: [{ creator: userId }, { assignees: userId }],
            isDeleted: false
          };

          // Apply filters
          if (body.stage) query.stage = body.stage;
          if (body.priority) query.priority = body.priority;
          if (body.overdue) {
            query.dueDate = { $lt: new Date() };
            query.stage = { $ne: 'completed' };
          }

          const tasks = await Task.find(query)
            .sort({ dueDate: 1 })
            .limit(50);
          return { success: true, data: tasks };
        } else if (method === 'PATCH' && body.taskId) {
          // Update task
          const task = await Task.findByIdAndUpdate(
            body.taskId,
            body.updates,
            { new: true }
          );
          return { success: true, data: task };
        } else if (method === 'DELETE' && body.taskId) {
          // Delete task
          const task = await Task.findByIdAndUpdate(
            body.taskId,
            { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
            { new: true }
          );
          return { success: true, data: task };
        }
        break;

      // ===== WORKSPACES API =====
      case '/api/workspaces':
        if (method === 'POST') {
          // Create workspace
          const workspace = await Workspace.create({
            ...body,
            owner: userId,
            members: [{
              user: userId,
              role: 'owner',
              permissions: {
                canEditWorkspace: true,
                canDeleteWorkspace: true,
                canInviteMembers: true,
                canRemoveMembers: true,
                canManageRoles: true,
                canMoveToTrash: true
              }
            }]
          });
          return { success: true, data: workspace };
        } else if (method === 'GET') {
          // List user's workspaces
          const workspaces = await Workspace.find({
            $or: [
              { owner: userId },
              { 'members.user': userId }
            ],
            isDeleted: false
          }).limit(50);
          return { success: true, data: workspaces };
        } else if (method === 'PATCH' && body.workspaceId) {
          // Update workspace
          const workspace = await Workspace.findById(body.workspaceId);
          if (!workspace) {
            return { success: false, error: 'Workspace not found' };
          }
          if (!workspace.isOwner(userId)) {
            return { success: false, error: 'Only owner can update workspace' };
          }
          Object.assign(workspace, body.updates);
          await workspace.save();
          return { success: true, data: workspace };
        }
        break;

      // ===== NOTES API =====
      case '/api/notes':
        if (method === 'POST') {
          // Create note
          const note = await Note.create({
            ...body,
            creator: userId,
            workspace: workspaceId
          });
          return { success: true, data: note };
        } else if (method === 'GET') {
          // List notes
          const query = {
            workspace: workspaceId,
            isTrashed: false,
            $or: [
              { creator: userId },
              { 'sharedWith.user': userId }
            ]
          };

          // Search by title/content if provided
          if (body.search) {
            query.$and = [
              {
                $or: [
                  { title: { $regex: body.search, $options: 'i' } },
                  { content: { $regex: body.search, $options: 'i' } }
                ]
              }
            ];
          }

          const notes = await Note.find(query)
            .sort({ lastModified: -1 })
            .limit(50);
          return { success: true, data: notes };
        } else if (method === 'PATCH' && body.noteId) {
          // Update note
          const note = await Note.findById(body.noteId);
          if (!note) {
            return { success: false, error: 'Note not found' };
          }
          if (!(await note.canEdit(userId))) {
            return { success: false, error: 'Permission denied' };
          }
          Object.assign(note, body.updates);
          note.lastEditedBy = userId;
          note.lastEditedAt = new Date();
          await note.save();
          return { success: true, data: note };
        } else if (method === 'DELETE' && body.noteId) {
          // Delete (trash) note
          const note = await Note.findByIdAndUpdate(
            body.noteId,
            { isTrashed: true, trashedAt: new Date(), trashedBy: userId },
            { new: true }
          );
          return { success: true, data: note };
        }
        break;

      // ===== NOTIFICATIONS API =====
      case '/api/notifications':
        if (method === 'GET') {
          // Get user's notifications
          const query = { user: userId };
          if (body.unreadOnly) query.isRead = false;

          const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);
          return { success: true, data: notifications };
        } else if (method === 'PATCH' && body.notificationId) {
          // Mark as read
          const notification = await Notification.findByIdAndUpdate(
            body.notificationId,
            { isRead: true },
            { new: true }
          );
          return { success: true, data: notification };
        } else if (method === 'PATCH' && body.markAllRead) {
          // Mark all as read
          await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
          );
          return { success: true, message: 'All notifications marked as read' };
        } else if (method === 'DELETE') {
          // Clear old notifications
          const result = await Notification.deleteMany({
            user: userId,
            isRead: true,
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days old
          });
          return { success: true, message: `Cleared ${result.deletedCount} notifications` };
        }
        break;

      // ===== REMINDERS API =====
      case '/api/reminders':
        if (method === 'POST') {
          // Create reminder
          const reminder = await Reminder.create({
            ...body,
            user: userId
          });
          return { success: true, data: reminder };
        } else if (method === 'GET') {
          // List reminders
          const query = { user: userId, status: 'pending' };
          if (body.upcoming) {
            query.date = { $gte: new Date() };
          }

          const reminders = await Reminder.find(query)
            .sort({ date: 1, time: 1 })
            .limit(50);
          return { success: true, data: reminders };
        } else if (method === 'PATCH' && body.reminderId) {
          // Update reminder
          const reminder = await Reminder.findOneAndUpdate(
            { _id: body.reminderId, user: userId },
            body.updates,
            { new: true }
          );
          return { success: true, data: reminder };
        } else if (method === 'DELETE' && body.reminderId) {
          // Cancel reminder
          const reminder = await Reminder.findOneAndDelete({
            _id: body.reminderId,
            user: userId
          });
          return { success: true, data: reminder };
        }
        break;

      case '/api/analytics':
        if (method === 'GET') {
          // Get analytics
          const habitStats = await Habit.getUserStatistics(userId, workspaceId);
          const taskStats = await getTaskStatistics(userId, workspaceId);
          return {
            success: true,
            data: {
              habits: habitStats,
              tasks: taskStats
            }
          };
        }
        break;

      case '/api/daily-summary':
        // Generate daily summary
        const summary = await generateDailySummary(userId, workspaceId);
        return { success: true, data: summary };

      default:
        return { success: false, error: 'Unknown endpoint' };
    }

    return { success: false, error: 'Action not implemented' };
  } catch (error) {
    console.error('Error executing action:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get task statistics
 */
const getTaskStatistics = async (userId, workspaceId) => {
  const tasks = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }]
  });

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
 * Generate daily summary
 */
const generateDailySummary = async (userId, workspaceId) => {
  const context = await buildEnhancedContext(userId, workspaceId);
  const { todayStats, habits, recentTasks } = context;

  const summary = {
    date: new Date().toISOString(),
    tasks: {
      completed: todayStats.completedTasks,
      pending: todayStats.pendingTasks,
      overdue: recentTasks.filter(t => t.isOverdue).length
    },
    habits: {
      completed: todayStats.completedHabits,
      total: todayStats.totalHabits,
      completionRate: todayStats.habitCompletionRate,
      topStreaks: habits
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 3)
        .map(h => ({ title: h.title, streak: h.streak }))
    },
    insights: generateInsights(context),
    encouragement: generateEncouragement(context)
  };

  return summary;
};

/**
 * Generate insights based on context
 */
const generateInsights = (context) => {
  const insights = [];
  const { todayStats, habits } = context;

  // Task insights
  if (todayStats.completedTasks > 3) {
    insights.push(`🎉 Great productivity! You completed ${todayStats.completedTasks} tasks today.`);
  } else if (todayStats.pendingTasks > 5) {
    insights.push(`📋 You have ${todayStats.pendingTasks} pending tasks. Consider prioritizing the most important ones.`);
  }

  // Habit insights
  if (todayStats.habitCompletionRate >= 80) {
    insights.push(`✨ Excellent habit consistency! ${todayStats.habitCompletionRate}% completion rate.`);
  } else if (todayStats.habitCompletionRate < 50) {
    insights.push(`💪 Your habit completion is at ${todayStats.habitCompletionRate}%. Small steps lead to big changes!`);
  }

  // Streak insights
  const highStreakHabits = habits.filter(h => h.streak >= 7);
  if (highStreakHabits.length > 0) {
    insights.push(`🔥 Amazing! You're on a ${highStreakHabits[0].streak}-day streak with "${highStreakHabits[0].title}"!`);
  }

  return insights.length > 0 ? insights : ['Keep going! Every day is a new opportunity to improve.'];
};

/**
 * Generate encouragement message
 */
const generateEncouragement = (context) => {
  const { todayStats, habits } = context;
  const missedHabits = habits.filter(h => !h.completedToday && isDueToday(h));

  if (todayStats.habitCompletionRate === 100) {
    return "Perfect day! You've completed all your habits. 🌟";
  } else if (missedHabits.length > 0) {
    return `You still have ${missedHabits.length} habit${missedHabits.length > 1 ? 's' : ''} to complete today. You've got this! 💪`;
  } else {
    return "Great work today! Keep up the momentum. 🚀";
  }
};

/**
 * Enhanced AI response with context and action execution
 */
export const getEnhancedAIResponse = async (userMessage, userId, workspaceId) => {
  try {
    if (!apiKey) {
      return {
        intent: 'error',
        reply: 'AI service is not configured. Please contact support.',
        action: null
      };
    }

    // Build or retrieve context
    const cacheKey = `${userId}-${workspaceId}`;
    let context = sessionContextCache.get(cacheKey);

    if (!context || Date.now() - context.timestamp > CONTEXT_RETENTION_MS) {
      context = {
        data: await buildEnhancedContext(userId, workspaceId),
        timestamp: Date.now()
      };
      sessionContextCache.set(cacheKey, context);
    }

    // Prepare prompt with enhanced context
    const prompt = `${enhancedAssistantPrompt}

CURRENT CONTEXT:
${JSON.stringify(context.data, null, 2)}

USER MESSAGE: ${userMessage}

Remember: You can directly control tasks and habits. Always provide actionable responses with appropriate API calls.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Details:', JSON.stringify(errorData, null, 2));
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonResponse = extractJSON(responseText);

    if (!jsonResponse) {
      return {
        intent: 'ask_clarification',
        reply: "I'm not sure what you mean. Can you clarify?",
        action: null
      };
    }

    // Execute action if present
    let actionResult = null;
    if (jsonResponse.action && !jsonResponse.action.requires_confirmation) {
      actionResult = await executeAction(jsonResponse.action, userId, workspaceId);

      // Update context after action
      if (actionResult.success) {
        context.data = await buildEnhancedContext(userId, workspaceId);
        context.timestamp = Date.now();
        sessionContextCache.set(cacheKey, context);
      }
    }

    // Store in history
    await ChatHistory.findOneAndUpdate(
      { user: userId, workspaceId: workspaceId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: jsonResponse.reply }
            ]
          }
        },
        $setOnInsert: { user: userId, workspaceId: workspaceId }
      },
      { upsert: true }
    );

    return {
      ...jsonResponse,
      actionResult,
      contextUpdate: actionResult?.success ? true : false
    };
  } catch (error) {
    console.error('Enhanced Gemini error:', error);
    return {
      intent: 'error',
      reply: 'Sorry, I encountered an error. Please try again.',
      action: null
    };
  }
};

/**
 * Extract JSON from response
 */
const extractJSON = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Voice command processing
 */
export const processVoiceCommand = async (transcript, userId, workspaceId) => {
  // Convert voice transcript to text command
  const normalizedCommand = transcript.toLowerCase().trim();

  // Quick command patterns
  const quickPatterns = {
    'complete': /^(mark|complete|done|finish)\s+(.+)$/i,
    'add_task': /^(add|create|new)\s+task\s+(.+)$/i,
    'add_habit': /^(add|create|new)\s+habit\s+(.+)$/i,
    'delete_item': /^(delete|remove)\s+(.+)$/i,
    'list_tasks': /^(show|list|display)\s+(my\s+)?(all\s+)?tasks?$/i,
    'list_notes': /^(show|list|display)\s+(my\s+)?(all\s+)?notes?$/i,
    'list_workspaces': /^(show|list|display)\s+(my\s+)?(all\s+)?workspaces?$/i,
    'list_reminders': /^(show|list|display)\s+(my\s+)?(all\s+)?reminders?$/i,
    'search_notes': /^(search|find)\s+(notes?\s+)?(for\s+)?(.+)$/i,
    'create_note': /^(add|create|new)\s+note\s+(.+)$/i,
    'create_workspace': /^(add|create|new)\s+workspace\s+(.+)$/i,
    'create_reminder': /^(remind|reminder)\s+(me\s+)?(to\s+)?(.+)$/i,
    'switch_workspace': /^(switch|change)\s+(to\s+)?workspace\s+(.+)$/i,
    'notifications': /^(notifications?|what'?s new|any messages?|check messages?)$/i,
    'summary': /^(summary|show|daily|report)$/i,
    'status': /^(status|how|progress)$/i
  };

  // Match patterns
  for (const [action, pattern] of Object.entries(quickPatterns)) {
    const match = normalizedCommand.match(pattern);
    if (match) {
      switch (action) {
        case 'complete':
          return await getEnhancedAIResponse(`Mark ${match[2]} as done`, userId, workspaceId);
        case 'add_task':
          return await getEnhancedAIResponse(`Add a new task: ${match[2]}`, userId, workspaceId);
        case 'add_habit':
          return await getEnhancedAIResponse(`Add a new habit: ${match[2]}`, userId, workspaceId);
        case 'delete_item':
          return await getEnhancedAIResponse(`Delete ${match[2]}`, userId, workspaceId);
        case 'list_tasks':
          return await getEnhancedAIResponse('Show all my tasks', userId, workspaceId);
        case 'list_notes':
          return await getEnhancedAIResponse('Show all my notes', userId, workspaceId);
        case 'list_workspaces':
          return await getEnhancedAIResponse('List all my workspaces', userId, workspaceId);
        case 'list_reminders':
          return await getEnhancedAIResponse('Show my reminders', userId, workspaceId);
        case 'search_notes':
          return await getEnhancedAIResponse(`Find notes about ${match[4]}`, userId, workspaceId);
        case 'create_note':
          return await getEnhancedAIResponse(`Create note: ${match[2]}`, userId, workspaceId);
        case 'create_workspace':
          return await getEnhancedAIResponse(`Create workspace: ${match[2]}`, userId, workspaceId);
        case 'create_reminder':
          return await getEnhancedAIResponse(`Remind me to ${match[4]}`, userId, workspaceId);
        case 'switch_workspace':
          return await getEnhancedAIResponse(`Switch to workspace ${match[3]}`, userId, workspaceId);
        case 'notifications':
          return await getEnhancedAIResponse('Show my notifications', userId, workspaceId);
        case 'summary':
          return await getEnhancedAIResponse('Give me my daily summary', userId, workspaceId);
        case 'status':
          return await getEnhancedAIResponse('Show my progress today', userId, workspaceId);
      }
    }
  }

  // Fallback to normal processing
  return await getEnhancedAIResponse(transcript, userId, workspaceId);
};

/**
 * Clear session context
 */
export const clearSessionContext = (userId, workspaceId) => {
  const cacheKey = `${userId}-${workspaceId}`;
  sessionContextCache.delete(cacheKey);
};

export default {
  getEnhancedAIResponse,
  processVoiceCommand,
  clearSessionContext
};