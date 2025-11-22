/*=================================================================
 * Project: AIVA-WEB
 * File: intentClassifier.js
 * Author: AI Enhancement Module
 * Date Created: October 28, 2025
 * Last Modified: October 28, 2025
 *=================================================================
 * Description:
 * Intent classification service for routing queries efficiently
 * without AI processing for simple, deterministic requests
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

/**
 * Intent categories with confidence levels
 */
export const INTENT_TYPES = {
  // Direct database queries (no AI needed)
  LIST_TASKS: 'list_tasks',
  LIST_HABITS: 'list_habits',
  LIST_NOTES: 'list_notes',
  LIST_WORKSPACES: 'list_workspaces',
  LIST_REMINDERS: 'list_reminders',
  LIST_NOTIFICATIONS: 'list_notifications',
  
  // Simple actions (pattern-based, no AI needed)
  COMPLETE_HABIT: 'complete_habit',
  COMPLETE_TASK: 'complete_task',
  CREATE_HABIT: 'create_habit',
  CREATE_TASK: 'create_task',
  CREATE_WORKSPACE: 'create_workspace',
  DELETE_HABIT: 'delete_habit',
  DELETE_TASK: 'delete_task',
  DELETE_WORKSPACE: 'delete_workspace',
  
  // Complex queries (requires AI)
  ANALYTICS: 'analytics',
  SUMMARY: 'summary',
  RECOMMENDATION: 'recommendation',
  CLARIFICATION: 'clarification',
  MULTI_INTENT: 'multi_intent',
  
  // Unknown (fallback to AI)
  UNKNOWN: 'unknown'
};

/**
 * Intent patterns for quick classification
 */
const INTENT_PATTERNS = {
  // List intents
  [INTENT_TYPES.LIST_TASKS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?tasks?$/i,
    /^what(\s+are)?\s+my\s+tasks?$/i,
    /^tasks?$/i,
    /^(show|list|display|get|view)\s+(all\s+)?tasks?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i,
    /^tasks?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.LIST_HABITS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?habits?$/i,
    /^what(\s+are)?\s+my\s+habits?$/i,
    /^habits?$/i,
    /^(show|list|display|get|view)\s+(all\s+)?habits?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i,
    /^habits?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.LIST_NOTES]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?notes?$/i,
    /^what(\s+are)?\s+my\s+notes?$/i,
    /^notes?$/i,
    /^(show|list|display|get|view)\s+(all\s+)?notes?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i,
    /^notes?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.LIST_WORKSPACES]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?workspaces?$/i,
    /^workspaces?$/i
  ],
  [INTENT_TYPES.LIST_REMINDERS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?reminders?$/i,
    /^reminders?$/i
  ],
  [INTENT_TYPES.LIST_NOTIFICATIONS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?notifications?$/i,
    /^notifications?$/i,
    /^what'?s\s+new$/i
  ],
  
  // Completion intents
  [INTENT_TYPES.COMPLETE_HABIT]: [
    /^(mark|complete|done|finish|finished)\s+(.+?)\s+(habit\s+)?(as\s+)?(done|complete|finished)$/i,
    /^(.+?)\s+(habit\s+)?(is\s+)?(done|complete|finished)$/i,
    /^(completed|done\s+with|finished\s+with)\s+(.+?)(\s+habit)?$/i
  ],
  [INTENT_TYPES.COMPLETE_TASK]: [
    /^(mark|complete|done|finish|finished)\s+(.+?)\s+(task\s+)?(as\s+)?(done|complete|finished)$/i,
    /^(.+?)\s+(task\s+)?(is\s+)?(done|complete|finished)$/i,
    /^(completed|done\s+with|finished\s+with)\s+(.+?)(\s+task)?$/i
  ],
  
  // Creation intents - Task patterns FIRST (more specific)
  [INTENT_TYPES.CREATE_TASK]: [
    /^(add|create|new)\s+(a\s+)?task\s+(called\s+|named\s+|for\s+|to\s+)?(.+)$/i,
    /^(add\s+the\s+task|create\s+task|new\s+task)\s+(to\s+)?(.+)$/i,
    /^(create|add|new)\s+(a\s+)?(new\s+)?task$/i,
    /^(remind\s+me\s+to|todo|task\s+to)\s+(.+)$/i,
    /^(purchase|buy|get|order|fetch|grab)\s+(.+)$/i,
    /^(.+?)\s+(by|for|on|before)\s+(tomorrow|today|tonight|next\s+\w+)$/i
  ],
  // Creation intents - Habit patterns (require explicit habit keyword)
  [INTENT_TYPES.CREATE_HABIT]: [
    /^(add|create|new|start)\s+(a\s+)?habit\s+(called\s+|named\s+|for\s+)?(.+)$/i,
    /^(track|begin\s+tracking|start\s+tracking)\s+(.+?)(\s+as\s+a\s+habit|\s+habit)$/i,
    /^(track|monitor)\s+(.+?)(\s+daily|\s+regularly|\s+every\s+day)$/i
  ],
  [INTENT_TYPES.CREATE_WORKSPACE]: [
    /^(create|new|add)\s+(?:a\s+)?workspace(?:\s+(?:called|named|for))?\s*(.+)?$/i,
    /^workspace\s+(create|new|add)\s*(.+)?$/i,
    /^(create|new|add)\s+(.+?)\s+workspace$/i
  ],
  
  // Deletion intents
  [INTENT_TYPES.DELETE_HABIT]: [
    /^(delete|remove|stop)\s+(.+?)\s+habit$/i,
    /^(stop\s+tracking)\s+(.+?)(\s+habit)?$/i
  ],
  [INTENT_TYPES.DELETE_TASK]: [
    /^(delete|remove|cancel)\s+(.+?)\s+task$/i
  ],
  [INTENT_TYPES.DELETE_WORKSPACE]: [
    /^(delete|remove|stop)\s+(.+?)\s+workspace$/i
  ],
  
  // Analytics intents (require AI)
  [INTENT_TYPES.ANALYTICS]: [
    /^(how|what)(\s+am\s+i|\s+did\s+i|\s+have\s+i)?\s+(doing|done|accomplished|progressing)$/i,
    /^(show|get|display)\s+(my\s+)?(progress|stats|statistics|analytics)$/i,
    /^(what's|what\s+is)\s+my\s+(progress|performance)$/i
  ],
  
  // Summary intents (require AI)
  [INTENT_TYPES.SUMMARY]: [
    /^(daily|today'?s?|end\s+of\s+day)\s+(summary|recap|report|review)$/i,
    /^(summarize|recap|review)\s+(my\s+)?(day|today|progress)$/i,
    /^what\s+did\s+i\s+(do|accomplish)\s+(today)?$/i
  ],
  
  // Recommendation intents (require AI)
  [INTENT_TYPES.RECOMMENDATION]: [
    /^(what\s+should\s+i|suggest|recommend|help\s+me\s+with)$/i,
    /^(motivate|encourage|inspire)\s+me$/i,
    /^give\s+me\s+(advice|tips|suggestions)$/i
  ]
};

/**
 * Classify user message intent
 */
export const classifyIntent = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      type: INTENT_TYPES.UNKNOWN,
      confidence: 0,
      requiresAI: true,
      data: null
    };
  }

  const normalizedMessage = message.trim().toLowerCase();
  
  // Check for multi-intent (contains 'and' or multiple commands)
  if (isMultiIntent(normalizedMessage)) {
    return {
      type: INTENT_TYPES.MULTI_INTENT,
      confidence: 0.9,
      requiresAI: true,
      data: { intents: splitMultiIntent(normalizedMessage) }
    };
  }

  // Try to match against patterns
  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        const data = extractIntentData(intentType, match, normalizedMessage);
        const requiresAI = [
          INTENT_TYPES.ANALYTICS,
          INTENT_TYPES.SUMMARY,
          INTENT_TYPES.RECOMMENDATION
        ].includes(intentType);
        
        return {
          type: intentType,
          confidence: 0.95,
          requiresAI,
          data
        };
      }
    }
  }

  // No pattern matched - requires AI processing
  return {
    type: INTENT_TYPES.UNKNOWN,
    confidence: 0,
    requiresAI: true,
    data: null
  };
};

/**
 * Check if message contains multiple intents
 */
const isMultiIntent = (message) => {
  const multiIntentIndicators = [
    ' and ',
    ' then ',
    ' also ',
    ' plus ',
    ';',
    ','
  ];
  
  return multiIntentIndicators.some(indicator => message.includes(indicator));
};

/**
 * Split multi-intent message
 */
const splitMultiIntent = (message) => {
  // Split by common separators
  const parts = message.split(/\s+(and|then|also|plus)\s+|[;,]/i)
    .filter(part => part && !['and', 'then', 'also', 'plus'].includes(part.trim()));
  
  return parts.map(part => part.trim());
};

/**
 * Extract relevant data from matched pattern
 */
const extractIntentData = (intentType, match, fullMessage) => {
  switch (intentType) {
    case INTENT_TYPES.COMPLETE_HABIT:
    case INTENT_TYPES.COMPLETE_TASK:
      // Extract habit/task name from match groups
      const name = match[2] || match[1];
      return { name: name?.trim() };
    
    case INTENT_TYPES.CREATE_HABIT:
      // Extract habit details
      const habitName = match[3] || match[2];
      return { name: habitName?.trim() };
    
    case INTENT_TYPES.CREATE_TASK:
      // Extract task details
      const taskName = match[3] || match[2];
      return { name: taskName?.trim() };
    
    case INTENT_TYPES.CREATE_WORKSPACE:
      // Extract workspace name (parsing happens in handleDirectQuery)
      const workspaceText = match[2] || match[1] || '';
      return { name: workspaceText.trim() };
    
    case INTENT_TYPES.DELETE_HABIT:
    case INTENT_TYPES.DELETE_TASK:
      // Extract item name
      const itemName = match[2];
      return { name: itemName?.trim() };
    
    case INTENT_TYPES.LIST_TASKS:
    case INTENT_TYPES.LIST_HABITS:
    case INTENT_TYPES.LIST_NOTES:
    case INTENT_TYPES.LIST_WORKSPACES:
    case INTENT_TYPES.LIST_REMINDERS:
    case INTENT_TYPES.LIST_NOTIFICATIONS:
      // Check for filters and workspace
      return extractFiltersAndWorkspace(fullMessage);
    
    default:
      return null;
  }
};

/**
 * Extract filters and workspace from list queries
 */
const extractFiltersAndWorkspace = (message) => {
  const result = {};
  
  // Check for status filters
  if (/\b(pending|incomplete|not\s+done)\b/i.test(message)) {
    result.status = 'pending';
  } else if (/\b(complete|completed|done|finished)\b/i.test(message)) {
    result.status = 'completed';
  } else if (/\b(overdue|late)\b/i.test(message)) {
    result.status = 'overdue';
  }
  
  // Check for priority filters
  if (/\b(high|urgent|important)\s+priority\b/i.test(message)) {
    result.priority = 'high';
  } else if (/\b(medium)\s+priority\b/i.test(message)) {
    result.priority = 'medium';
  } else if (/\b(low)\s+priority\b/i.test(message)) {
    result.priority = 'low';
  }
  
  // Check for time filters
  if (/\b(today|today'?s)\b/i.test(message)) {
    result.timeframe = 'today';
  } else if (/\b(tomorrow)\b/i.test(message)) {
    result.timeframe = 'tomorrow';
  } else if (/\b(this\s+week|week)\b/i.test(message)) {
    result.timeframe = 'week';
  }
  
  // Extract workspace name
  const workspaceMatch = message.match(/(?:in|from|of)\s+(?:workspace\s+)?["']?([^"'\s]+)["']?/i);
  if (workspaceMatch) {
    result.workspace = workspaceMatch[1].trim();
  }
  
  return Object.keys(result).length > 0 ? result : null;
};

/**
 * Get confidence level description
 */
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  if (confidence >= 0.5) return 'low';
  return 'none';
};

/**
 * Determine if query should be routed to AI
 */
export const shouldUseAI = (classification) => {
  // Always use AI for these cases
  if (classification.requiresAI) return true;
  if (classification.confidence < 0.8) return true;
  if (classification.type === INTENT_TYPES.UNKNOWN) return true;
  
  // Use direct database for high-confidence simple queries
  return false;
};

export default {
  classifyIntent,
  getConfidenceLevel,
  shouldUseAI,
  INTENT_TYPES
};