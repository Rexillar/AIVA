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
import { emailService } from './emailService.js';
import User from '../models/user.js';
import Task from '../models/task.js';
import { format, addHours, isBefore, startOfDay, endOfDay } from 'date-fns';

class ReminderService {
  constructor() {
    this.scheduleAllReminders();
  }

  async scheduleAllReminders() {
    // Schedule task due reminders
    setInterval(async () => {
      await this.sendTaskDueReminders();
    }, 15 * 60 * 1000); // Check every 15 minutes

    // Schedule daily digests
    setInterval(async () => {
      await this.sendDailyDigests();
    }, 60 * 60 * 1000); // Check every hour

    // Schedule weekly reports
    setInterval(async () => {
      await this.sendWeeklyReports();
    }, 60 * 60 * 1000); // Check every hour
  }

  async sendTaskDueReminders() {
    try {
      // Get all users with task due reminders enabled
      const users = await User.find({
        'preferences.reminders.taskDue.enabled': true
      });

      for (const user of users) {
        const advanceNotice = user.preferences.reminders.taskDue.advanceNotice;
        const checkTime = addHours(new Date(), advanceNotice);

        // Find tasks due within the advance notice period
        const tasks = await Task.find({
          assignees: user._id,
          dueDate: {
            $gt: new Date(),
            $lte: checkTime
          },
          'reminderSent': { $ne: true }
        }).populate('workspace');

        for (const task of tasks) {
          await emailService.sendTaskReminder({
            email: user.email,
            taskTitle: task.title,
            subtasks: task.subtasks || [],
            workspaceName: task.workspace.name,
            dueDate: format(task.dueDate, 'PPP'),
            reminderTime: format(new Date(), 'PPP'),
            taskId: task._id
          });

          // Mark reminder as sent
          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (error) {
      //console.error('Error sending task due reminders:', error);
    }
  }

  async sendDailyDigests() {
    try {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();

      // Get all users with daily digest enabled and scheduled for current hour
      const users = await User.find({
        'preferences.reminders.dailyDigest.enabled': true,
        'preferences.reminders.dailyDigest.time': {
          $regex: `^${currentHour.toString().padStart(2, '0')}:`
        }
      });

      for (const user of users) {
        const [scheduledHour, scheduledMinute] = user.preferences.reminders.dailyDigest.time.split(':');

        // Only send if within the same minute
        if (parseInt(scheduledMinute) === currentMinute) {
          const tasks = await Task.find({
            assignees: user._id,
            dueDate: {
              $gte: startOfDay(new Date()),
              $lte: endOfDay(new Date())
            }
          }).populate('workspace');

          if (tasks.length > 0) {
            await emailService.sendEmail(
              user.email,
              'Daily Task Digest',
              this.generateDailyDigestEmail(tasks)
            );
          }
        }
      }
    } catch (error) {
      //console.error('Error sending daily digests:', error);
    }
  }

  async sendWeeklyReports() {
    try {
      const currentDay = new Date().toLocaleLowerCase();
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();

      // Get all users with weekly report enabled for current day and hour
      const users = await User.find({
        'preferences.reminders.weeklyReport.enabled': true,
        'preferences.reminders.weeklyReport.day': currentDay,
        'preferences.reminders.weeklyReport.time': {
          $regex: `^${currentHour.toString().padStart(2, '0')}:`
        }
      });

      for (const user of users) {
        const [scheduledHour, scheduledMinute] = user.preferences.reminders.weeklyReport.time.split(':');

        // Only send if within the same minute
        if (parseInt(scheduledMinute) === currentMinute) {
          const tasks = await Task.find({
            assignees: user._id,
            updatedAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }).populate('workspace');

          if (tasks.length > 0) {
            await emailService.sendEmail(
              user.email,
              'Weekly Task Report',
              this.generateWeeklyReportEmail(tasks)
            );
          }
        }
      }
    } catch (error) {
      //console.error('Error sending weekly reports:', error);
    }
  }

  generateDailyDigestEmail(tasks) {
    const tasksByWorkspace = tasks.reduce((acc, task) => {
      const workspace = task.workspace.name;
      if (!acc[workspace]) acc[workspace] = [];
      acc[workspace].push(task);
      return acc;
    }, {});

    let html = '<h1>Your Daily Task Digest</h1>';

    for (const [workspace, workspaceTasks] of Object.entries(tasksByWorkspace)) {
      html += `<h2>${workspace}</h2><ul>`;
      for (const task of workspaceTasks) {
        html += `
          <li>
            <strong>${task.title}</strong>
            <br>Due: ${format(task.dueDate, 'PPP')}
            <br>Status: ${task.stage}
          </li>
        `;
      }
      html += '</ul>';
    }

    return html;
  }

  generateWeeklyReportEmail(tasks) {
    const completed = tasks.filter(t => t.stage === 'completed');
    const inProgress = tasks.filter(t => t.stage === 'in_progress');
    const todo = tasks.filter(t => t.stage === 'todo');

    let html = '<h1>Your Weekly Task Report</h1>';

    html += `
      <h2>Summary</h2>
      <p>
        Completed: ${completed.length}<br>
        In Progress: ${inProgress.length}<br>
        To Do: ${todo.length}
      </p>

      <h2>Completed Tasks</h2>
      <ul>
        ${completed.map(task => `
          <li>
            <strong>${task.title}</strong>
            <br>Workspace: ${task.workspace.name}
            <br>Completed on: ${format(task.updatedAt, 'PPP')}
          </li>
        `).join('')}
      </ul>

      <h2>In Progress Tasks</h2>
      <ul>
        ${inProgress.map(task => `
          <li>
            <strong>${task.title}</strong>
            <br>Workspace: ${task.workspace.name}
            <br>Due: ${format(task.dueDate, 'PPP')}
          </li>
        `).join('')}
      </ul>

      <h2>Upcoming Tasks</h2>
      <ul>
        ${todo.map(task => `
          <li>
            <strong>${task.title}</strong>
            <br>Workspace: ${task.workspace.name}
            <br>Due: ${format(task.dueDate, 'PPP')}
          </li>
        `).join('')}
      </ul>
    `;

    return html;
  }
}

export const reminderService = new ReminderService(); 