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
import { getContext } from './contextManager.js';
import Habit from '../models/habit.js';
import Task from '../models/task.js';

/**
 * Analyze user patterns and generate suggestions
 */
export const generateProactiveSuggestions = async (userId, workspaceId) => {
  try {
    const context = await getContext(userId, workspaceId);
    const suggestions = [];

    // Check for incomplete habits
    const incompleteHabits = context.todayHabits?.filter(h => !h.completedToday) || [];
    if (incompleteHabits.length > 0) {
      suggestions.push({
        type: 'habit_reminder',
        priority: 'high',
        message: `You have ${incompleteHabits.length} habit${incompleteHabits.length > 1 ? 's' : ''} left to complete today: ${incompleteHabits.map(h => h.title).join(', ')}`,
        action: {
          type: 'list_habits',
          data: incompleteHabits
        }
      });
    }

    // Check for overdue tasks
    const overdueTasks = context.recentTasks?.filter(t => t.isOverdue) || [];
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'overdue_tasks',
        priority: 'high',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Would you like to reschedule or prioritize them?`,
        action: {
          type: 'list_tasks',
          filter: 'overdue',
          data: overdueTasks
        }
      });
    }

    // Check for streak opportunities
    const highStreakHabits = context.todayHabits?.filter(h => h.streak >= 7 && !h.completedToday) || [];
    if (highStreakHabits.length > 0) {
      suggestions.push({
        type: 'streak_protection',
        priority: 'medium',
        message: `Don't break your ${highStreakHabits[0].streak}-day streak on ${highStreakHabits[0].title}! 🔥`,
        action: {
          type: 'complete_habit',
          habitId: highStreakHabits[0].id
        }
      });
    }

    // Check for productivity milestones
    if (context.todayStats?.completedTasks >= 5) {
      suggestions.push({
        type: 'celebration',
        priority: 'low',
        message: `Amazing! You've completed ${context.todayStats.completedTasks} tasks today! 🎉`,
        action: null
      });
    }

    // Check for unread notifications
    if (context.notifications?.unread > 5) {
      suggestions.push({
        type: 'notifications',
        priority: 'medium',
        message: `You have ${context.notifications.unread} unread notifications. Would you like to review them?`,
        action: {
          type: 'list_notifications'
        }
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};

/**
 * Get time-based suggestions
 */
export const getTimeBasedSuggestions = async (userId, workspaceId) => {
  const hour = new Date().getHours();
  const suggestions = [];

  if (hour >= 6 && hour < 9) {
    // Morning suggestions
    suggestions.push({
      type: 'morning_routine',
      priority: 'medium',
      message: 'Good morning! Ready to start your day? Check your morning habits.',
      action: { type: 'list_habits' }
    });
  } else if (hour >= 12 && hour < 14) {
    // Midday suggestions
    suggestions.push({
      type: 'midday_check',
      priority: 'low',
      message: 'How\'s your day going? Take a moment to review your progress.',
      action: { type: 'daily_summary' }
    });
  } else if (hour >= 18 && hour < 21) {
    // Evening suggestions
    suggestions.push({
      type: 'evening_review',
      priority: 'medium',
      message: 'Time to wind down. Complete any remaining tasks and habits.',
      action: { type: 'daily_summary' }
    });
  }

  return suggestions;
};

/**
 * Analyze patterns for recommendations
 */
export const analyzePatterns = async (userId, workspaceId) => {
  try {
    const habits = await Habit.find({
      user: userId,
      workspace: workspaceId,
      isActive: true
    }).lean();

    const tasks = await Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false
    }).lean();

    const patterns = {
      mostProductiveDay: null,
      bestStreak: null,
      needsImprovement: [],
      recommendations: []
    };

    // Find best streak
    const sortedByStreak = habits.sort((a, b) => b.currentStreak - a.currentStreak);
    if (sortedByStreak.length > 0) {
      patterns.bestStreak = {
        habit: sortedByStreak[0].title,
        streak: sortedByStreak[0].currentStreak
      };
    }

    // Find habits needing improvement (low completion rate)
    const needsWork = habits.filter(h => {
      const completionRate = h.completions.length > 0
        ? h.completions.filter(c => c.completed).length / h.completions.length
        : 0;
      return completionRate < 0.5;
    });

    if (needsWork.length > 0) {
      patterns.needsImprovement = needsWork.map(h => ({
        habit: h.title,
        suggestion: `Consider adjusting the frequency or goal for ${h.title}`
      }));
    }

    // Generate recommendations
    if (tasks.filter(t => t.stage === 'completed').length > 10) {
      patterns.recommendations.push('You\'re completing tasks consistently! Consider setting more challenging goals.');
    }

    if (habits.length < 3) {
      patterns.recommendations.push('Build a stronger routine by adding 1-2 more habits.');
    }

    return patterns;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return null;
  }
};

export default {
  generateProactiveSuggestions,
  getTimeBasedSuggestions,
  analyzePatterns
};