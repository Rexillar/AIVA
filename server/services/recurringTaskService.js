import Task from '../models/task.js';
import cron from 'node-cron';

/**
 * Recurring Task Service
 * Checks every hour for tasks whose recurrence pattern requires a new occurrence.
 */
class RecurringTaskService {
  constructor() {
    this.cronJob = null;
  }

  start() {
    // Run every hour at minute 0
    this.cronJob = cron.schedule('0 * * * *', () => {
      this.generateDueOccurrences().catch(err =>
        console.error('[RecurringTasks] Generation failed:', err.message)
      );
    });
    console.log('[RecurringTasks] Scheduler started (hourly check)');
  }

  stop() {
    if (this.cronJob) this.cronJob.stop();
  }

  /**
   * Find all recurring tasks that need a new occurrence generated
   */
  async generateDueOccurrences() {
    const now = new Date();

    const recurringTasks = await Task.find({
      'recurrence.enabled': true,
      isDeleted: false,
      isTrash: false,
      $or: [
        { 'recurrence.endDate': null },
        { 'recurrence.endDate': { $gt: now } }
      ],
      $or: [
        { 'recurrence.maxOccurrences': null },
        { $expr: { $lt: ['$recurrence.occurrenceCount', '$recurrence.maxOccurrences'] } }
      ]
    }).lean();

    let created = 0;
    for (const task of recurringTasks) {
      const shouldCreate = this.shouldCreateOccurrence(task, now);
      if (shouldCreate) {
        await this.createOccurrence(task);
        created++;
      }
    }

    if (created > 0) {
      console.log(`[RecurringTasks] Created ${created} new occurrence(s)`);
    }
  }

  /**
   * Determine if a new occurrence is due based on the recurrence pattern
   */
  shouldCreateOccurrence(task, now) {
    const rec = task.recurrence;
    const lastGen = rec.lastGeneratedDate ? new Date(rec.lastGeneratedDate) : new Date(task.createdAt);
    const daysSinceLast = (now.getTime() - lastGen.getTime()) / (1000 * 60 * 60 * 24);

    switch (rec.pattern) {
      case 'daily':
        return daysSinceLast >= (rec.interval || 1);

      case 'weekly': {
        if (daysSinceLast < 1) return false; // max once per day
        const todayDow = now.getDay();
        if (rec.daysOfWeek && rec.daysOfWeek.length > 0) {
          return rec.daysOfWeek.includes(todayDow) && daysSinceLast >= 1;
        }
        return daysSinceLast >= (7 * (rec.interval || 1));
      }

      case 'biweekly':
        return daysSinceLast >= 14;

      case 'monthly': {
        const targetDay = rec.dayOfMonth || new Date(task.createdAt).getDate();
        return now.getDate() === targetDay &&
          (now.getMonth() !== lastGen.getMonth() || now.getFullYear() !== lastGen.getFullYear());
      }

      case 'custom':
        return daysSinceLast >= (rec.interval || 1);

      default:
        return false;
    }
  }

  /**
   * Create a new task occurrence from a recurring template task
   */
  async createOccurrence(templateTask) {
    const rec = templateTask.recurrence;

    // Calculate due date based on pattern
    const dueDate = new Date();
    switch (rec.pattern) {
      case 'daily':
        dueDate.setDate(dueDate.getDate() + (rec.interval || 1));
        break;
      case 'weekly':
      case 'biweekly':
        dueDate.setDate(dueDate.getDate() + (rec.pattern === 'biweekly' ? 14 : 7));
        break;
      case 'monthly':
        dueDate.setMonth(dueDate.getMonth() + 1);
        break;
      default:
        dueDate.setDate(dueDate.getDate() + (rec.interval || 1));
    }

    // Clone the task (without recurrence — the child is a one-off)
    const newTask = await Task.create({
      title: templateTask.title,
      description: templateTask.description,
      priority: templateTask.priority,
      stage: 'todo',
      dueDate,
      creator: templateTask.creator,
      assignees: templateTask.assignees || [],
      workspace: templateTask.workspace,
      labels: templateTask.labels || [],
      focusTag: templateTask.focusTag,
      estimatedHours: templateTask.estimatedHours,
      subtasks: (templateTask.subtasks || []).map(s => ({
        title: s.title,
        description: s.description,
        priority: s.priority,
        estimatedDuration: s.estimatedDuration,
        category: s.category,
        status: 'not_started',
        completed: false,
        createdBy: templateTask.creator
      })),
      recurrence: {
        enabled: false,
        parentTaskId: templateTask._id
      }
    });

    // Update the parent's tracking fields
    await Task.findByIdAndUpdate(templateTask._id, {
      'recurrence.lastGeneratedDate': new Date(),
      $inc: { 'recurrence.occurrenceCount': 1 }
    });

    return newTask;
  }
}

export const recurringTaskService = new RecurringTaskService();
export default recurringTaskService;
