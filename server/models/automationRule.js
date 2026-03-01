import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  isActive: { type: Boolean, default: true },

  // ── Trigger ──
  trigger: {
    event: {
      type: String,
      required: true,
      enum: [
        'task_completed',
        'task_created',
        'task_overdue',
        'task_stage_changed',
        'habit_completed',
        'habit_missed',
        'note_created',
        'schedule',          // cron-based
      ]
    },
    conditions: {
      stage: String,          // e.g. 'completed'
      priority: String,       // e.g. 'high'
      label: String,
      workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
      cronExpression: String  // for schedule triggers: '0 9 * * 1' = every Mon 9am
    }
  },

  // ── Action(s) ──
  actions: [{
    type: {
      type: String,
      required: true,
      enum: [
        'create_task',
        'create_task_from_template',
        'update_task_stage',
        'send_notification',
        'send_email',
        'add_activity_log',
        'create_reminder',
        'complete_habit',
        'tag_task'
      ]
    },
    params: mongoose.Schema.Types.Mixed   // action-specific parameters
  }],

  // ── Execution stats ──
  executionCount: { type: Number, default: 0 },
  lastExecutedAt: Date,
  lastError: String,

  // ── Limits ──
  maxExecutionsPerDay: { type: Number, default: 50 },
  executionsToday: { type: Number, default: 0 },
  executionResetDate: Date
}, { timestamps: true });

automationRuleSchema.index({ workspace: 1, isActive: 1 });
automationRuleSchema.index({ 'trigger.event': 1, isActive: 1 });

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema);
export default AutomationRule;
