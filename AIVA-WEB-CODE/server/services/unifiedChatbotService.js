/*=================================================================
 * Project: AIVA-WEB
 * File: unifiedChatbotService.js
 * Author: AI Enhancement Module
 * Date Created: October 28, 2025
 * Last Modified: October 28, 2025
 *=================================================================
 * Description:
 * Unified chatbot service integrating all improvements:
 * intent classification, context management, Redis caching,
 * voice processing, WebSocket streaming, and proactive suggestions
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import { classifyIntent, shouldUseAI } from './intentClassifier.js';
import { getContext, updateContext, PRIORITY_LEVELS } from './contextManager.js';
import { getImprovedAIResponse } from './improvedGeminiService.js';
import { processEnhancedVoiceCommand } from './enhancedVoiceProcessor.js';
import { generateProactiveSuggestions, getTimeBasedSuggestions } from './proactiveSuggestions.js';
import { broadcastToUser } from './websocketStreaming.js';
import { getCache, setCache, TTL_CONFIG } from './redisCache.js';

/**
 * Main unified chatbot handler
 */
export const processUnifiedChat = async ({ userId, message, sessionId, workspaceId, options = {} }) => {
  return handleChatbotQuery(message, userId, workspaceId, { ...options, sessionId });
};

export const handleChatbotQuery = async (userMessage, userId, workspaceId, options = {}) => {
  const {
    isVoice = false,
    streamResponse = false,
    includeSuggestions = true
  } = options;

  try {
    // Check cache first
    const cacheKey = `${userId}-${workspaceId}-${userMessage}`;
    const cached = await getCache(cacheKey, 'chat');
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Process based on input type
    let response;
    if (isVoice) {
      response = await processEnhancedVoiceCommand(userMessage, userId, workspaceId);
    } else {
      response = await getImprovedAIResponse(userMessage, userId, workspaceId, options);
    }

    // Add proactive suggestions if requested
    if (includeSuggestions) {
      const suggestions = await generateProactiveSuggestions(userId, workspaceId);
      response.suggestions = suggestions.slice(0, 3); // Top 3 suggestions
    }

    // Cache successful responses
    if (response.intent !== 'error') {
      await setCache(cacheKey, response, TTL_CONFIG.CONVERSATION, 'chat');
    }

    // Broadcast via WebSocket if streaming enabled
    if (streamResponse) {
      broadcastToUser(userId, 'chat-response', response);
    }

    return response;
  } catch (error) {
    console.error('Unified chatbot error:', error);
    return {
      intent: 'error',
      reply: 'I encountered an error. Please try again.',
      action: null,
      error: error.message
    };
  }
};

/**
 * Get personalized dashboard data
 */
export const getDashboardData = async (userId, workspaceId) => {
  try {
    const [context, suggestions, timeBased] = await Promise.all([
      getContext(userId, workspaceId, PRIORITY_LEVELS.HIGH),
      generateProactiveSuggestions(userId, workspaceId),
      getTimeBasedSuggestions(userId, workspaceId)
    ]);

    return {
      todayStats: {
        tasks: {
          total: context.todayTasks?.length || 0,
          completed: context.todayTasks?.filter(t => t.stage === 'completed').length || 0
        },
        habits: {
          total: context.todayHabits?.length || 0,
          completed: context.todayHabits?.filter(h => h.completedToday).length || 0
        }
      },
      suggestions: [...suggestions, ...timeBased].sort((a, b) => {
        const priority = { high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      }).slice(0, 5),
      quickActions: [
        { label: 'List Tasks', query: 'show my tasks' },
        { label: 'Complete Habit', query: 'what habits are left?' },
        { label: 'Daily Summary', query: 'how did I do today?' }
      ]
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    return null;
  }
};

export default {
  handleChatbotQuery,
  getDashboardData
};