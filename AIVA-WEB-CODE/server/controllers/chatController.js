/*=================================================================
* Project: AIVA-WEB
* File: chatController.js
* Author: AI Integration - Chatbot Module
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Controller for chatbot interactions
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import { handleChatbotQuery } from '../services/unifiedChatbotService.js';

// @desc    Send message to AI assistant (UPGRADED with all 19 improvements)
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Use unified chatbot service with all improvements:
  // - Intent classification for fast routing
  // - Smart context management
  // - Redis caching
  // - Voice processing support
  // - Proactive suggestions
  const response = await handleChatbotQuery(message, req.user._id, req.body.workspaceId, {
    includeSuggestions: true
  });
  
  res.status(200).json(response);
});

export default { sendMessage };
