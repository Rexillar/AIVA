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
import Notification from '../models/notification.js';
import { sendEmail } from './emailService.js';

/**
 * Send habit reminder notifications
 */
export const sendHabitReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

    // Find habits with reminders enabled for current time and day
    const habits = await Habit.find({
      'reminder.enabled': true,
      'reminder.time': currentTime,
      'reminder.days': dayName,
      isActive: true,
      isPaused: false,
      isTrash: false,
      isDeleted: false
    }).populate('user', 'name email');

    for (const habit of habits) {
      // Check if already completed today
      if (!habit.isCompletedToday) {
        // Create notification
        await Notification.create({
          user: habit.user._id,
          text: `Reminder: Time to complete your habit "${habit.title}"`,
          notiType: 'alert',
          link: `/habits/${habit._id}`,
          metadata: {
            type: 'habit_reminder',
            habitId: habit._id,
            habitTitle: habit.title
          }
        });

        // Send email reminder if user has email
        if (habit.user.email) {
          await sendEmail({
            to: habit.user.email,
            subject: `Habit Reminder: ${habit.title}`,
            html: `
              <h2>Habit Reminder</h2>
              <p>Hi ${habit.user.name},</p>
              <p>This is a reminder to complete your habit: <strong>${habit.title}</strong></p>
              <p>Current streak: ${habit.currentStreak} days</p>
              <p>Keep up the great work!</p>
            `
          });
        }
      }
    }

    console.log(`Sent reminders for ${habits.length} habits`);
  } catch (error) {
    console.error('Error sending habit reminders:', error);
  }
};

/**
 * Check for broken streaks and send notifications
 */
export const checkBrokenStreaks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find habits that had a streak but weren't completed yesterday
    const habits = await Habit.find({
      isActive: true,
      isPaused: false,
      isTrash: false,
      isDeleted: false,
      currentStreak: { $gt: 0 }
    }).populate('user', 'name email');

    for (const habit of habits) {
      // Check if habit was due yesterday based on frequency
      const isDueYesterday = checkIfDueOnDate(habit, yesterday);

      if (isDueYesterday) {
        const wasCompletedYesterday = habit.completions.some(c => {
          const cDate = new Date(c.date);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === yesterday.getTime() && c.completed;
        });

        if (!wasCompletedYesterday && habit.currentStreak > 0) {
          // Streak was broken
          const oldStreak = habit.currentStreak;
          habit.currentStreak = 0;
          await habit.save();

          // Create notification
          await Notification.create({
            user: habit.user._id,
            text: `Your ${oldStreak}-day streak for "${habit.title}" was broken. Start a new one today!`,
            notiType: 'alert',
            link: `/habits/${habit._id}`,
            metadata: {
              type: 'streak_broken',
              habitId: habit._id,
              habitTitle: habit.title,
              brokenStreak: oldStreak
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking broken streaks:', error);
  }
};

/**
 * Check if a habit is due on a specific date
 */
const checkIfDueOnDate = (habit, date) => {
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

  if (habit.frequency === 'daily') {
    return true;
  } else if (habit.frequency === 'weekly') {
    return habit.customFrequency.days.includes(dayName);
  } else if (habit.frequency === 'custom') {
    // Check custom interval
    const daysSinceStart = Math.floor((date - new Date(habit.startDate)) / (1000 * 60 * 60 * 24));
    return daysSinceStart % habit.customFrequency.interval === 0;
  }

  return false;
};

/**
 * Calculate and update habit analytics
 */
export const updateHabitAnalytics = async (habitId) => {
  try {
    const habit = await Habit.findById(habitId);
    if (!habit) return;

    habit.calculateStreaks();
    habit.calculateStatistics();
    await habit.save();
  } catch (error) {
    console.error('Error updating habit analytics:', error);
  }
};

/**
 * Get habit insights for a user
 */
export const getHabitInsights = async (userId, workspaceId) => {
  try {
    const habits = await Habit.find({
      user: userId,
      workspace: workspaceId,
      isTrash: false,
      isDeleted: false
    });

    const insights = {
      bestPerformingHabit: null,
      needsAttention: [],
      streakLeader: null,
      totalCompletionsThisWeek: 0,
      totalCompletionsThisMonth: 0
    };

    // Find best performing habit
    let highestCompletionRate = 0;
    habits.forEach(habit => {
      if (habit.statistics.completionRate > highestCompletionRate) {
        highestCompletionRate = habit.statistics.completionRate;
        insights.bestPerformingHabit = {
          id: habit._id,
          title: habit.title,
          completionRate: habit.statistics.completionRate
        };
      }
    });

    // Find habits that need attention (low completion rate)
    insights.needsAttention = habits
      .filter(h => h.isActive && !h.isPaused && h.statistics.completionRate < 50)
      .map(h => ({
        id: h._id,
        title: h.title,
        completionRate: h.statistics.completionRate
      }))
      .slice(0, 3);

    // Find streak leader
    let longestCurrentStreak = 0;
    habits.forEach(habit => {
      if (habit.currentStreak > longestCurrentStreak) {
        longestCurrentStreak = habit.currentStreak;
        insights.streakLeader = {
          id: habit._id,
          title: habit.title,
          streak: habit.currentStreak
        };
      }
    });

    // Calculate completions this week/month
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    habits.forEach(habit => {
      habit.completions.forEach(completion => {
        if (completion.completed) {
          const compDate = new Date(completion.date);
          if (compDate >= weekAgo) {
            insights.totalCompletionsThisWeek++;
          }
          if (compDate >= monthAgo) {
            insights.totalCompletionsThisMonth++;
          }
        }
      });
    });

    return insights;
  } catch (error) {
    console.error('Error getting habit insights:', error);
    return null;
  }
};

/**
 * Create habit milestone notification
 */
export const createHabitMilestoneNotification = async (userId, habitId, milestoneType, value) => {
  try {
    const habit = await Habit.findById(habitId);
    if (!habit) return;

    let message = '';
    switch (milestoneType) {
      case 'streak':
        message = `🔥 Amazing! You've maintained a ${value}-day streak for "${habit.title}"!`;
        break;
      case 'completion':
        message = `🎉 Congratulations! You've completed "${habit.title}" ${value} times!`;
        break;
      case 'perfect_week':
        message = `⭐ Perfect week! You completed "${habit.title}" every day this week!`;
        break;
      default:
        message = `Great progress on "${habit.title}"!`;
    }

    await Notification.create({
      user: userId,
      text: message,
      notiType: 'alert',
      link: `/habits/${habitId}`,
      metadata: {
        type: 'habit_milestone',
        habitId,
        milestoneType,
        value
      }
    });
  } catch (error) {
    console.error('Error creating habit milestone notification:', error);
  }
};

/**
 * Generate habit completion heatmap data
 */
export const generateHabitHeatmap = (habit, startDate, endDate) => {
  const heatmapData = [];
  const start = new Date(startDate || habit.startDate);
  const end = new Date(endDate || new Date());

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const completion = habit.completions.find(c => {
      const cDate = new Date(c.date);
      return cDate.toISOString().split('T')[0] === dateStr;
    });

    heatmapData.push({
      date: dateStr,
      completed: completion ? completion.completed : false,
      note: completion?.note || ''
    });
  }

  return heatmapData;
};

export default {
  sendHabitReminders,
  checkBrokenStreaks,
  updateHabitAnalytics,
  getHabitInsights,
  createHabitMilestoneNotification,
  generateHabitHeatmap
};
