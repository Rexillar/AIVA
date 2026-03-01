import asyncHandler from 'express-async-handler';
import AutomationRule from '../models/automationRule.js';
import { automationEngine } from '../services/automationEngine.js';

export const createRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.create({ ...req.body, createdBy: req.user._id });

  // If schedule-based, register cron immediately
  if (rule.trigger.event === 'schedule') {
    automationEngine.registerCronJob(rule);
  }

  res.status(201).json({ success: true, data: rule });
});

export const getRules = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const rules = await AutomationRule.find({ workspace: workspaceId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: rules.length, data: rules });
});

export const getRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findById(req.params.id).populate('createdBy', 'name email');
  if (!rule) { res.status(404); throw new Error('Rule not found'); }
  res.json({ success: true, data: rule });
});

export const updateRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!rule) { res.status(404); throw new Error('Rule not found'); }

  // Re-register cron if schedule changed
  if (rule.trigger.event === 'schedule') {
    const oldJob = automationEngine.cronJobs.get(rule._id.toString());
    if (oldJob) oldJob.stop();
    if (rule.isActive) automationEngine.registerCronJob(rule);
  }

  res.json({ success: true, data: rule });
});

export const deleteRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByIdAndDelete(req.params.id);
  if (!rule) { res.status(404); throw new Error('Rule not found'); }

  // Stop cron if active
  const job = automationEngine.cronJobs.get(req.params.id);
  if (job) { job.stop(); automationEngine.cronJobs.delete(req.params.id); }

  res.json({ success: true, message: 'Rule deleted' });
});

export const toggleRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findById(req.params.id);
  if (!rule) { res.status(404); throw new Error('Rule not found'); }

  rule.isActive = !rule.isActive;
  await rule.save();

  // Start/stop cron
  if (rule.trigger.event === 'schedule') {
    const job = automationEngine.cronJobs.get(rule._id.toString());
    if (rule.isActive) {
      automationEngine.registerCronJob(rule);
    } else if (job) {
      job.stop();
      automationEngine.cronJobs.delete(rule._id.toString());
    }
  }

  res.json({ success: true, data: rule });
});

/**
 * Manually trigger a rule (for testing)
 */
export const triggerRule = asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findById(req.params.id);
  if (!rule) { res.status(404); throw new Error('Rule not found'); }
  await automationEngine.executeRule(rule, req.body || {});
  res.json({ success: true, message: 'Rule executed', executionCount: rule.executionCount + 1 });
});
