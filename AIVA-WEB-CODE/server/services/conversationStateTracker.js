/*=================================================================
 * Project: AIVA-WEB
 * File: conversationStateTracker.js
 * Author: AI Enhancement Module
 * Date Created: October 28, 2025
 * Last Modified: October 28, 2025
 *=================================================================
 * Description:
 * Conversation state tracking service for multi-turn interactions
 * Maintains context across messages for complex tasks like creation
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import { getCache, setCache, deleteCache, TTL_CONFIG } from './redisCache.js';

/**
 * Conversation state types
 */
export const STATE_TYPES = {
  IDLE: 'idle',
  AWAITING_TASK_DETAILS: 'awaiting_task_details',
  AWAITING_HABIT_DETAILS: 'awaiting_habit_details',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  AWAITING_CLARIFICATION: 'awaiting_clarification'
};

/**
 * State structure
 */
class ConversationState {
  constructor(userId, workspaceId) {
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.type = STATE_TYPES.IDLE;
    this.context = {};
    this.createdAt = Date.now();
    this.lastUpdated = Date.now();
  }

  setState(type, context = {}) {
    this.type = type;
    this.context = { ...this.context, ...context };
    this.lastUpdated = Date.now();
  }

  addContext(key, value) {
    this.context[key] = value;
    this.lastUpdated = Date.now();
  }

  getContext(key) {
    return this.context[key];
  }

  clear() {
    this.type = STATE_TYPES.IDLE;
    this.context = {};
    this.lastUpdated = Date.now();
  }

  isIdle() {
    return this.type === STATE_TYPES.IDLE;
  }

  isExpired(ttl = 5 * 60 * 1000) { // 5 minutes default
    return Date.now() - this.lastUpdated > ttl;
  }

  toJSON() {
    return {
      userId: this.userId,
      workspaceId: this.workspaceId,
      type: this.type,
      context: this.context,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated
    };
  }

  static fromJSON(data) {
    const state = new ConversationState(data.userId, data.workspaceId);
    state.type = data.type;
    state.context = data.context;
    state.createdAt = data.createdAt;
    state.lastUpdated = data.lastUpdated;
    return state;
  }
}

/**
 * Get conversation state
 */
export const getConversationState = async (userId, workspaceId) => {
  try {
    const cacheKey = `conv-state-${userId}-${workspaceId}`;
    const cached = await getCache(cacheKey, 'conversation');
    
    if (cached) {
      const state = ConversationState.fromJSON(cached);
      
      // Clear expired states
      if (state.isExpired()) {
        await deleteCache(cacheKey, 'conversation');
        return new ConversationState(userId, workspaceId);
      }
      
      return state;
    }
    
    return new ConversationState(userId, workspaceId);
  } catch (error) {
    console.error('Error getting conversation state:', error);
    return new ConversationState(userId, workspaceId);
  }
};

/**
 * Save conversation state
 */
export const saveConversationState = async (state) => {
  try {
    const cacheKey = `conv-state-${state.userId}-${state.workspaceId}`;
    await setCache(cacheKey, state.toJSON(), TTL_CONFIG.CONVERSATION, 'conversation');
    return true;
  } catch (error) {
    console.error('Error saving conversation state:', error);
    return false;
  }
};

/**
 * Clear conversation state
 */
export const clearConversationState = async (userId, workspaceId) => {
  try {
    const cacheKey = `conv-state-${userId}-${workspaceId}`;
    await deleteCache(cacheKey, 'conversation');
    return true;
  } catch (error) {
    console.error('Error clearing conversation state:', error);
    return false;
  }
};

/**
 * Update state for task creation
 */
export const startTaskCreation = async (userId, workspaceId, initialData = {}) => {
  const state = await getConversationState(userId, workspaceId);
  state.setState(STATE_TYPES.AWAITING_TASK_DETAILS, {
    intent: 'create_task',
    step: 'title',
    data: initialData
  });
  await saveConversationState(state);
  return state;
};

/**
 * Update state for habit creation
 */
export const startHabitCreation = async (userId, workspaceId, initialData = {}) => {
  const state = await getConversationState(userId, workspaceId);
  state.setState(STATE_TYPES.AWAITING_HABIT_DETAILS, {
    intent: 'create_habit',
    step: 'title',
    data: initialData
  });
  await saveConversationState(state);
  return state;
};

/**
 * Process user response in current state
 */
export const processStateResponse = async (userId, workspaceId, userMessage) => {
  const state = await getConversationState(userId, workspaceId);
  
  if (state.isIdle()) {
    return null; // No active state
  }

  const { type, context } = state;
  
  // Handle task creation state
  if (type === STATE_TYPES.AWAITING_TASK_DETAILS) {
    const step = context.step;
    const data = context.data || {};
    
    if (step === 'title') {
      // User provided task title
      data.title = userMessage;
      state.addContext('data', data);
      state.addContext('step', 'complete');
      await saveConversationState(state);
      
      return {
        completed: true,
        intent: 'create_task',
        data: data
      };
    }
  }
  
  // Handle habit creation state
  if (type === STATE_TYPES.AWAITING_HABIT_DETAILS) {
    const step = context.step;
    const data = context.data || {};
    
    if (step === 'title') {
      // User provided habit title
      data.title = userMessage;
      state.addContext('data', data);
      state.addContext('step', 'complete');
      await saveConversationState(state);
      
      return {
        completed: true,
        intent: 'create_habit',
        data: data
      };
    }
  }
  
  return null;
};

/**
 * Check if message should be processed with state
 */
export const shouldUseState = async (userId, workspaceId) => {
  const state = await getConversationState(userId, workspaceId);
  return !state.isIdle() && !state.isExpired();
};

export default {
  STATE_TYPES,
  ConversationState,
  getConversationState,
  saveConversationState,
  clearConversationState,
  startTaskCreation,
  startHabitCreation,
  processStateResponse,
  shouldUseState
};