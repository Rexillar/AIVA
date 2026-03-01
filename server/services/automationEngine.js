import AutomationRule from '../models/automationRule.js';
import Task from '../models/task.js';
import TaskTemplate from '../models/taskTemplate.js';
import Habit from '../models/habit.js';
import Note from '../models/note.js';
import Notification from '../models/notification.js';
import cron from 'node-cron';

/**
 * Automation Engine
 * Processes event-driven and schedule-based automation rules.
 */
class AutomationEngine {
  constructor() {
    this.cronJobs = new Map();
  }

  /**
   * Initialize automation engine — load all active schedule-based rules
   */
  async start() {
    try {
      const scheduleRules = await AutomationRule.find({
        isActive: true,
        'trigger.event': 'schedule'
      });

      for (const rule of scheduleRules) {
        this.registerCronJob(rule);
      }

      console.log(`[AutomationEngine] Started with ${scheduleRules.length} schedule rule(s)`);
    } catch (err) {
      console.error('[AutomationEngine] Failed to start:', err.message);
    }
  }

  /**
   * Register a cron-based automation rule
   */
  registerCronJob(rule) {
    const cronExpr = rule.trigger.conditions?.cronExpression;
    if (!cronExpr || !cron.validate(cronExpr)) {
      console.warn(`[AutomationEngine] Invalid cron for rule ${rule._id}: ${cronExpr}`);
      return;
    }

    const job = cron.schedule(cronExpr, () => {
      this.executeRule(rule).catch(err =>
        console.error(`[AutomationEngine] Cron execution failed for ${rule._id}:`, err.message)
      );
    });

    this.cronJobs.set(rule._id.toString(), job);
  }

  /**
   * Process an event and check if any automation rules should fire
   */
  async processEvent(eventType, eventData) {
    try {
      const rules = await AutomationRule.find({
        'trigger.event': eventType,
        isActive: true,
        workspace: eventData.workspaceId
      });

      for (const rule of rules) {
        if (this.matchesConditions(rule, eventData)) {
          // Check daily execution limit
          if (!this.canExecute(rule)) continue;
          await this.executeRule(rule, eventData);
        }
      }
    } catch (err) {
      console.error(`[AutomationEngine] processEvent(${eventType}) error:`, err.message);
    }
  }

  /**
   * Check if event data matches rule conditions
   */
  matchesConditions(rule, eventData) {
    const conds = rule.trigger.conditions || {};
    if (conds.stage && eventData.stage !== conds.stage) return false;
    if (conds.priority && eventData.priority !== conds.priority) return false;
    if (conds.label && !eventData.labels?.some(l => l.name === conds.label)) return false;
    return true;
  }

  /**
   * Check rate limit
   */
  canExecute(rule) {
    const today = new Date().toDateString();
    if (rule.executionResetDate?.toDateString() !== today) {
      rule.executionsToday = 0;
      rule.executionResetDate = new Date();
    }
    return rule.executionsToday < rule.maxExecutionsPerDay;
  }

  /**
   * Execute all actions of a rule
   */
  async executeRule(rule, eventData = {}) {
    try {
      for (const action of rule.actions) {
        await this.executeAction(action, rule, eventData);
      }

      await AutomationRule.findByIdAndUpdate(rule._id, {
        lastExecutedAt: new Date(),
        $inc: { executionCount: 1, executionsToday: 1 },
        lastError: null
      });
    } catch (err) {
      await AutomationRule.findByIdAndUpdate(rule._id, {
        lastError: err.message,
        lastExecutedAt: new Date()
      });
      throw err;
    }
  }

  /**
   * Execute a single automation action
   */
  async executeAction(action, rule, eventData) {
    const p = action.params || {};

    switch (action.type) {
      case 'create_task': {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (p.relativeDueDays || 1));
        await Task.create({
          title: p.title || 'Auto-generated task',
          description: p.description || `Created by automation: ${rule.name}`,
          priority: p.priority || 'medium',
          stage: 'todo',
          dueDate,
          creator: rule.createdBy,
          workspace: rule.workspace,
          labels: p.labels || []
        });
        break;
      }

      case 'create_task_from_template': {
        const template = await TaskTemplate.findById(p.templateId);
        if (!template) break;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (template.relativeDueDays || 7));
        await Task.create({
          title: template.taskTitle,
          description: template.taskDescription,
          priority: template.priority,
          stage: template.stage,
          dueDate,
          creator: rule.createdBy,
          workspace: rule.workspace,
          labels: template.labels || [],
          focusTag: template.focusTag,
          estimatedHours: template.estimatedHours,
          subtasks: (template.subtasks || []).map(s => ({
            title: s.title,
            description: s.description,
            priority: s.priority,
            estimatedDuration: s.estimatedDuration,
            category: s.category,
            status: 'not_started',
            completed: false,
            createdBy: rule.createdBy
          })),
          templateId: template._id
        });
        await TaskTemplate.findByIdAndUpdate(template._id, {
          $inc: { usageCount: 1 },
          lastUsedAt: new Date()
        });
        break;
      }

      case 'update_task_stage': {
        if (eventData.taskId) {
          await Task.findByIdAndUpdate(eventData.taskId, {
            stage: p.stage || 'in_progress'
          });
        }
        break;
      }

      case 'send_notification': {
        await Notification.create({
          user: p.userId || rule.createdBy,
          workspace: rule.workspace,
          type: 'automation',
          title: p.title || `Automation: ${rule.name}`,
          message: p.message || 'An automation rule was triggered.',
          read: false
        });
        break;
      }

      case 'add_activity_log': {
        if (eventData.taskId) {
          await Task.findByIdAndUpdate(eventData.taskId, {
            $push: {
              activities: {
                content: p.message || `Automation: ${rule.name}`,
                by: rule.createdBy
              }
            }
          });
        }
        break;
      }

      case 'tag_task': {
        if (eventData.taskId && p.label) {
          await Task.findByIdAndUpdate(eventData.taskId, {
            $addToSet: {
              labels: { name: p.label, color: p.color || '#F59E0B' }
            }
          });
        }
        break;
      }

      default:
        console.warn(`[AutomationEngine] Unknown action type: ${action.type}`);
    }
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    for (const [id, job] of this.cronJobs) {
      job.stop();
    }
    this.cronJobs.clear();
  }
}

export const automationEngine = new AutomationEngine();
export default automationEngine;
