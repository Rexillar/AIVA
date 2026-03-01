import asyncHandler from 'express-async-handler';
import {
  detectScheduleConflicts,
  suggestBestDay,
  generateDailyPlan,
} from '../services/orchestrationService.js';
import ExternalCalendarEvent from '../models/externalCalendarEvent.js';

/**
 * GET /api/orchestration/conflicts?workspaceId=&lookAheadDays=7
 */
export const getConflicts = asyncHandler(async (req, res) => {
  const { workspaceId, lookAheadDays } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const conflicts = await detectScheduleConflicts(
    req.user._id,
    workspaceId,
    parseInt(lookAheadDays) || 7
  );
  res.json({ success: true, data: conflicts });
});

/**
 * GET /api/orchestration/suggest-day?workspaceId=&estimatedHours=2&lookAheadDays=14
 */
export const getSuggestedDay = asyncHandler(async (req, res) => {
  const { workspaceId, estimatedHours, lookAheadDays } = req.query;
  if (!workspaceId || !estimatedHours) {
    res.status(400);
    throw new Error('workspaceId and estimatedHours required');
  }
  const suggestion = await suggestBestDay(
    req.user._id,
    workspaceId,
    parseFloat(estimatedHours),
    parseInt(lookAheadDays) || 14
  );
  res.json({ success: true, data: suggestion });
});

/**
 * GET /api/orchestration/daily-plan?workspaceId=&date=2025-01-15
 */
export const getDailyPlan = asyncHandler(async (req, res) => {
  const { workspaceId, date } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }
  const plan = await generateDailyPlan(
    req.user._id,
    workspaceId,
    date || new Date().toISOString().slice(0, 10)
  );
  res.json({ success: true, data: plan });
});

/**
 * DELETE /api/orchestration/cleanup-events?workspaceId=&title=
 * Remove calendar events matching a title pattern (for cleaning up test data)
 */
export const cleanupEvents = asyncHandler(async (req, res) => {
  const { workspaceId, title } = req.query;
  if (!workspaceId || !title) {
    res.status(400);
    throw new Error('workspaceId and title are required');
  }
  const result = await ExternalCalendarEvent.deleteMany({
    workspaceId,
    title: { $regex: title, $options: 'i' },
  });
  res.json({ success: true, deletedCount: result.deletedCount });
});
