/*=================================================================
* Project: AIVA-WEB
* File: chatRoutes.js
* Author: Mohitraj Jadeja
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Routes for chat operations with rate limiting and authentication.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import {
  sendMessage
} from '../controllers/chatController.js';
import {
  sendEnhancedMessage,
  sendVoiceCommand,
  getDailySummary,
  clearContext
} from '../controllers/enhancedChatController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { chatLimiter, searchLimiter } from '../middlewares/rateLimitMiddleware.js';
import ChatHistory from '../models/ChatHistory.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Message routes
router.post('/:workspaceId/messages', chatLimiter, sendMessage);

// Original chatbot routes
router.post('/message', sendMessage);

// Enhanced AI chat routes
router.post('/enhanced', chatLimiter, sendEnhancedMessage);
router.post('/voice', chatLimiter, sendVoiceCommand);
router.get('/daily-summary', getDailySummary);
router.post('/clear-context', clearContext);

// GET /api/chat/history?workspaceId=...
router.get('/history', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }
    const history = await ChatHistory.find({ workspaceId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
