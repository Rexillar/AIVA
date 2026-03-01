import asyncHandler from 'express-async-handler';
import * as gmailService from '../services/gmailService.js';

/**
 * GET /api/gmail/inbox?workspaceId=&maxResults=20&pageToken=&query=
 */
export const getInbox = asyncHandler(async (req, res) => {
  const { workspaceId, maxResults, pageToken, query } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }

  const result = await gmailService.listInboxMessages(req.user._id, workspaceId, {
    maxResults: parseInt(maxResults) || 20,
    pageToken,
    query,
  });
  res.json({ success: true, data: result });
});

/**
 * GET /api/gmail/messages/:id?workspaceId=
 */
export const getEmailMessage = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }

  const message = await gmailService.getMessage(req.user._id, workspaceId, req.params.id);
  res.json({ success: true, data: message });
});

/**
 * GET /api/gmail/threads/:id?workspaceId=
 */
export const getEmailThread = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }

  const thread = await gmailService.getThread(req.user._id, workspaceId, req.params.id);
  res.json({ success: true, data: thread });
});

/**
 * GET /api/gmail/unread?workspaceId=
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }

  const counts = await gmailService.getUnreadCount(req.user._id, workspaceId);
  res.json({ success: true, data: counts });
});

/**
 * GET /api/gmail/labels?workspaceId=
 */
export const getLabels = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) { res.status(400); throw new Error('workspaceId required'); }

  const labels = await gmailService.getLabels(req.user._id, workspaceId);
  res.json({ success: true, data: labels });
});

/**
 * GET /api/gmail/search?workspaceId=&q=search+terms&maxResults=20
 */
export const searchEmails = asyncHandler(async (req, res) => {
  const { workspaceId, q, maxResults } = req.query;
  if (!workspaceId || !q) { res.status(400); throw new Error('workspaceId and q required'); }

  const result = await gmailService.searchEmails(
    req.user._id,
    workspaceId,
    q,
    parseInt(maxResults) || 20
  );
  res.json({ success: true, data: result });
});
