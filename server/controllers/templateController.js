import asyncHandler from 'express-async-handler';
import TaskTemplate from '../models/taskTemplate.js';
import Task from '../models/task.js';

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await TaskTemplate.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: template });
});

export const getTemplates = asyncHandler(async (req, res) => {
  const { workspaceId, category } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const filter = { workspace: workspaceId, isArchived: false };
  if (category) filter.category = category;
  const templates = await TaskTemplate.find(filter)
    .populate('createdBy', 'name email')
    .sort({ usageCount: -1 });
  res.json({ success: true, count: templates.length, data: templates });
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await TaskTemplate.findById(req.params.id).populate('createdBy', 'name email');
  if (!template) { res.status(404); throw new Error('Template not found'); }
  res.json({ success: true, data: template });
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await TaskTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!template) { res.status(404); throw new Error('Template not found'); }
  res.json({ success: true, data: template });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await TaskTemplate.findByIdAndUpdate(req.params.id, { isArchived: true });
  res.json({ success: true, message: 'Template archived' });
});

/**
 * Create a task from a template
 */
export const createTaskFromTemplate = asyncHandler(async (req, res) => {
  const { workspaceId, overrides } = req.body;
  const template = await TaskTemplate.findById(req.params.id);
  if (!template) { res.status(404); throw new Error('Template not found'); }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (overrides?.relativeDueDays || template.relativeDueDays || 7));

  const task = await Task.create({
    title: overrides?.title || template.taskTitle,
    description: overrides?.description || template.taskDescription,
    priority: overrides?.priority || template.priority,
    stage: template.stage,
    dueDate: overrides?.dueDate || dueDate,
    creator: req.user._id,
    workspace: workspaceId || template.workspace,
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
      createdBy: req.user._id
    })),
    templateId: template._id
  });

  // Update usage stats
  template.usageCount++;
  template.lastUsedAt = new Date();
  await template.save();

  res.status(201).json({ success: true, data: task });
});
