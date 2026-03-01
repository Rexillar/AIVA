/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { classifyIntent, shouldUseAI } from './intentClassifier.js';
import { getContext, updateContext, PRIORITY_LEVELS } from './contextManager.js';
import { getImprovedAIResponse } from './improvedGeminiService.js';
import { processEnhancedVoiceCommand } from './enhancedVoiceProcessor.js';
import { generateProactiveSuggestions, getTimeBasedSuggestions } from './proactiveSuggestions.js';
import { getProactiveNudge, detectExecutionGaps } from './executionIntelligenceEngine.js';
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

    // Add intelligence-powered nudge + proactive suggestions
    if (includeSuggestions) {
      try {
        const [nudge, gaps, legacySuggestions] = await Promise.all([
          getProactiveNudge(userId, workspaceId).catch(() => null),
          detectExecutionGaps(userId, workspaceId).catch(() => null),
          generateProactiveSuggestions(userId, workspaceId).catch(() => [])
        ]);

        // Intelligence nudge — single highest-priority insight
        if (nudge) {
          response.nudge = nudge;
        }

        // Execution gaps — velocity & scheduling issues
        if (gaps) {
          response.executionGaps = {
            velocity: gaps.velocity,
            alerts: [
              ...(gaps.tomorrowOverload ? [{ type: 'overload', message: gaps.tomorrowOverload.message }] : []),
              ...(gaps.unplannedDays || []).map(d => ({ type: 'unplanned', message: `${d} has no tasks scheduled` })),
              ...(gaps.stuckTasks || []).map(t => ({ type: 'stuck', message: `"${t.title}" stuck in-progress for ${t.daysStuck} days` }))
            ].slice(0, 3)
          };
        }

        // Legacy suggestions as fallback
        response.suggestions = (legacySuggestions || []).slice(0, 3);
      } catch (err) {
        // Intelligence layer is non-blocking — never fail the response
        console.warn('Intelligence enrichment failed:', err.message);
        response.suggestions = [];
      }
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
    const [context, suggestions, timeBased, nudge, gaps] = await Promise.all([
      getContext(userId, workspaceId, PRIORITY_LEVELS.HIGH),
      generateProactiveSuggestions(userId, workspaceId),
      getTimeBasedSuggestions(userId, workspaceId),
      getProactiveNudge(userId, workspaceId).catch(() => null),
      detectExecutionGaps(userId, workspaceId).catch(() => null)
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
      intelligence: {
        nudge,
        velocity: gaps?.velocity || null,
        alerts: gaps ? [
          ...(gaps.tomorrowOverload ? [gaps.tomorrowOverload.message] : []),
          ...(gaps.stuckTasks || []).map(t => `"${t.title}" stuck for ${t.daysStuck}d`)
        ].slice(0, 3) : []
      },
      suggestions: [...suggestions, ...timeBased].sort((a, b) => {
        const priority = { high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      }).slice(0, 5),
      quickActions: [
        { label: 'List Tasks', query: 'show my tasks' },
        { label: 'Complete Habit', query: 'what habits are left?' },
        { label: 'Daily Summary', query: 'how did I do today?' },
        { label: 'Execution Report', query: 'show my execution report' }
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