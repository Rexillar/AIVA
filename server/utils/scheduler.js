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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/backend/scheduler.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import Reminder from '../models/reminderModel.js';
import { emailService } from './emailService.js';

// Store scheduled tasks (timeoutIds)
const scheduledTasks = new Map();

/**
 * Schedule a reminder notification
 * @param {Object} reminderData - Reminder details
 */
export const scheduleReminder = (reminderData) => {
  try {
    const { reminderId, date, time, notifyBefore = 0, email } = reminderData;

    if (!reminderId || !date || !time || !email) {
      console.error('Missing required fields for scheduling reminder');
      return;
    }

    // Parse reminder date and time
    const reminderDate = new Date(date);
    const [hours, minutes] = time.split(':');
    reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Calculate notification time (subtract notifyBefore minutes)
    const notificationTime = new Date(reminderDate.getTime() - (notifyBefore * 60 * 1000));

    // Don't schedule if notification time is in the past
    if (notificationTime < new Date()) {
      console.log('Notification time is in the past, skipping scheduling');
      return;
    }

    // Calculate delay in milliseconds
    const delay = notificationTime.getTime() - Date.now();

    // Schedule the task using setTimeout
    const timeoutId = setTimeout(async () => {
      try {
        const reminder = await Reminder.findById(reminderId);
        if (reminder && reminder.status === 'pending') {
          await emailService.sendTaskReminder(
            email,
            reminder.title,
            [],
            reminder.description || 'Personal',
            reminder.date,
            reminder.time,
            reminderId
          );

          // Mark reminder as sent
          reminder.status = 'sent';
          await reminder.save();

          // Remove task from scheduled tasks
          scheduledTasks.delete(reminderId);
        }
      } catch (error) {
        console.error('Error sending scheduled reminder:', error);
      }
    }, delay);

    // Store the timeout ID
    scheduledTasks.set(reminderId, timeoutId);

    console.log(`Reminder scheduled for ${notificationTime}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
  }
};

/**
 * Cancel a scheduled reminder
 * @param {String} reminderId - Reminder ID
 */
export const cancelScheduledReminder = (reminderId) => {
  const timeoutId = scheduledTasks.get(reminderId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledTasks.delete(reminderId);
    console.log(`Cancelled scheduled reminder: ${reminderId}`);
  }
};

/**
 * Reschedule an existing reminder
 * @param {String} reminderId - Reminder ID
 * @param {Object} reminderData - New reminder details
 */
export const rescheduleReminder = (reminderId, reminderData) => {
  cancelScheduledReminder(reminderId);
  scheduleReminder({ ...reminderData, reminderId });
};

/**
 * Initialize all pending reminders on server start
 */
export const initializeScheduler = async () => {
  try {
    const pendingReminders = await Reminder.find({
      status: 'pending',
      date: { $gte: new Date() }
    }).populate('user', 'email');

    console.log(`Initializing ${pendingReminders.length} pending reminders`);

    for (const reminder of pendingReminders) {
      scheduleReminder({
        reminderId: reminder._id,
        date: reminder.date,
        time: reminder.time,
        notifyBefore: reminder.notifyBefore || 0,
        email: reminder.email || reminder.user?.email
      });
    }
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};

export default {
  scheduleReminder,
  cancelScheduledReminder,
  rescheduleReminder,
  initializeScheduler
};
