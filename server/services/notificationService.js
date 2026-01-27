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

   ⟁  PURPOSE      : Send notifications and alerts to users

   ⟁  WHY          : Real-time user communication

   ⟁  WHAT         : Email and in-app notification system

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Notifications sent. Users informed. Communication maintained."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Project: AIVA-WEB
* File: notificationService.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Service for managing system notifications, including creation
* and delivery of notifications to users.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import Notification from '../models/notification.js'; // Adjust the path as necessary

export const createTaskAssignmentNotifications = async ({ task, previousAssignees, actorId }) => {
    // Logic to create notifications for task assignments
    const notifications = [];

    for (const assignee of task.assignees) {
        if (!previousAssignees.includes(assignee.toString())) {
            const notification = new Notification({
                user: assignee,
                message: `You have been assigned to the task: ${task.title}`,
                task: task._id,
                createdBy: actorId,
                createdAt: new Date()
            });
            notifications.push(notification);
        }
    }

    await Notification.insertMany(notifications);
    return notifications;
};

// Habit-related notifications
export const createHabitNotification = async ({ user, habitId, type, streak }) => {
    let message = '';
    
    switch (type) {
        case 'streak_milestone':
            message = `🔥 Congratulations! You've reached a ${streak}-day streak!`;
            break;
        case 'reminder':
            message = `⏰ Reminder: Don't forget to complete your habit today!`;
            break;
        case 'streak_broken':
            message = `Your streak was broken. Start a new one today!`;
            break;
        default:
            message = 'Habit notification';
    }
    
    const notification = await Notification.create({
        user,
        text: message,
        notiType: 'alert',
        link: `/habits/${habitId}`,
        metadata: {
            type: 'habit',
            habitId,
            notificationType: type
        }
    });
    
    return notification;
}; 

export const createNotification = async (user, message, link) => {
  const notification = new Notification({
    user,
    message,
    link,
  });
  await notification.save();
  return notification;
};
