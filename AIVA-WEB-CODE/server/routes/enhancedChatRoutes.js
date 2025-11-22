/*=================================================================
* Project: AIVA-WEB
* File: enhancedChatRoutes.js
* Author: AI Enhancement Module
* Date Created: October 24, 2025
* Last Modified: October 24, 2025
*=================================================================
* Description:
* Routes for enhanced AI chat with voice commands and context awareness
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { chatLimiter } from '../middlewares/rateLimitMiddleware.js';
import {
  sendEnhancedMessage,
  sendVoiceCommand,
  getDailySummary,
  clearContext
} from '../controllers/enhancedChatController.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(protect);
router.use(chatLimiter);

// Enhanced chat endpoint
router.post('/enhanced', sendEnhancedMessage);

// Voice command endpoint
router.post('/voice', sendVoiceCommand);

// Daily summary endpoint
router.get('/daily-summary', getDailySummary);

// Clear context endpoint
router.post('/clear-context', clearContext);

export default router;