import asyncHandler from 'express-async-handler';
import {
  buildKnowledgeIndex,
  getRelatedKnowledge,
  searchKnowledge,
  exportKnowledge
} from '../services/knowledgeIndexService.js';
import DecisionLog from '../models/decisionLog.js';

// ─── Knowledge Index ───

export const getKnowledgeIndex = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const data = await buildKnowledgeIndex(workspaceId);
  res.json({ success: true, data });
});

export const getRelated = asyncHandler(async (req, res) => {
  const { workspaceId, topic } = req.query;
  if (!workspaceId || !topic) { res.status(400); throw new Error('workspaceId and topic required'); }
  const data = await getRelatedKnowledge(workspaceId, topic);
  res.json({ success: true, data });
});

export const search = asyncHandler(async (req, res) => {
  const { workspaceId, q } = req.query;
  if (!workspaceId || !q) { res.status(400); throw new Error('workspaceId and q required'); }
  const data = await searchKnowledge(workspaceId, q);
  res.json({ success: true, data });
});

export const exportKB = asyncHandler(async (req, res) => {
  const { workspaceId, format } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const data = await exportKnowledge(workspaceId, format || 'json');
  if (format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(data);
  }
  res.json({ success: true, data });
});

// ─── Decision Logs / Retrospectives ───

export const createDecisionLog = asyncHandler(async (req, res) => {
  const doc = await DecisionLog.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: doc });
});

export const getDecisionLogs = asyncHandler(async (req, res) => {
  const { workspaceId, type } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const filter = { workspace: workspaceId, isArchived: false };
  if (type) filter.type = type;

  // Respect visibility
  filter.$or = [
    { visibility: 'workspace' },
    { author: req.user._id }
  ];

  const docs = await DecisionLog.find(filter)
    .populate('author', 'name email')
    .sort({ isPinned: -1, createdAt: -1 });
  res.json({ success: true, count: docs.length, data: docs });
});

export const getDecisionLog = asyncHandler(async (req, res) => {
  const doc = await DecisionLog.findById(req.params.id)
    .populate('author', 'name email')
    .populate('relatedTasks', 'title')
    .populate('relatedNotes', 'title');
  if (!doc) { res.status(404); throw new Error('Not found'); }
  res.json({ success: true, data: doc });
});

export const updateDecisionLog = asyncHandler(async (req, res) => {
  const doc = await DecisionLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) { res.status(404); throw new Error('Not found'); }
  res.json({ success: true, data: doc });
});

export const deleteDecisionLog = asyncHandler(async (req, res) => {
  await DecisionLog.findByIdAndUpdate(req.params.id, { isArchived: true });
  res.json({ success: true, message: 'Archived' });
});
