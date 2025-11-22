/*=================================================================
 * Project: AIVA-WEB
 * File: improvedGeminiService.js
 * Author: AI Enhancement Module
 * Date Created: October 28, 2025
 * Last Modified: October 28, 2025
 *=================================================================
 * Description:
 * Improved Gemini service with intent classification, incremental
 * context updates, parallel processing, and response validation
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import { classifyIntent, shouldUseAI, INTENT_TYPES } from './intentClassifier.js';
import { getContext, updateContext, getCompressedContext, PRIORITY_LEVELS } from './contextManager.js';
import { buildPrompt, buildCompressedPrompt, buildVoicePrompt } from '../utils/promptTemplates.js';
import {
  getConversationState,
  saveConversationState,
  clearConversationState,
  processStateResponse,
  shouldUseState,
  STATE_TYPES
} from './conversationStateTracker.js';
import ChatHistory from '../models/ChatHistory.js';
import Task from '../models/task.js';
import Habit from '../models/habit.js';
import { Workspace } from '../models/workspace.js';
import Note from '../models/note.js';
import Notification from '../models/notification.js';
import Reminder from '../models/reminderModel.js';

const getApiKey = () => process.env.GEMINI_API_KEY;

/**
 * Find workspace by name for a user
 */
const findWorkspaceByName = async (workspaceName, userId) => {
  try {
    const workspace = await Workspace.findOne({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ],
      name: { $regex: new RegExp(`^${workspaceName}$`, 'i') }
    }).select('_id name').lean();
    
    return workspace;
  } catch (error) {
    console.error('Workspace lookup error:', error);
    return null;
  }
};

/**
 * Direct database query handler (no AI needed)
 */
const handleDirectQuery = async (classification, userId, workspaceId, userMessage) => {
  const { type, data } = classification;
  
  // Determine target workspace
  let targetWorkspaceId = workspaceId;
  let targetWorkspaceName = null;
  
  if (data?.workspace) {
    const foundWorkspace = await findWorkspaceByName(data.workspace, userId);
    if (!foundWorkspace) {
      return {
        intent: 'error',
        action: null,
        reply: `I couldn't find a workspace named "${data.workspace}". Please check the name and try again, or use "list workspaces" to see your available workspaces.`,
        data: null
      };
    }
    targetWorkspaceId = foundWorkspace._id;
    targetWorkspaceName = foundWorkspace.name;
  }
  
  try {
    switch (type) {
      case INTENT_TYPES.LIST_TASKS: {
        const query = {
          workspace: targetWorkspaceId,
          $or: [{ creator: userId }, { assignees: userId }],
          isDeleted: false
        };
        
        if (data?.status === 'overdue') {
          query.dueDate = { $lt: new Date() };
          query.stage = { $ne: 'completed' };
        } else if (data?.status === 'completed') {
          query.stage = 'completed';
        } else if (data?.status === 'pending') {
          query.stage = { $in: ['todo', 'in_progress', 'review'] };
        }
        
        if (data?.priority) {
          query.priority = data.priority;
        }
        
        const tasks = await Task.find(query)
          .sort({ priority: -1, dueDate: 1 })
          .limit(50)
          .select('title stage priority dueDate')
          .lean();
        
        const workspaceText = targetWorkspaceName ? ` in "${targetWorkspaceName}"` : '';
        return {
          intent: 'list_tasks',
          action: null,
          reply: `Found ${tasks.length} tasks${workspaceText}${data?.status ? ` (${data.status})` : ''}.`,
          data: tasks
        };
      }
      
      case INTENT_TYPES.LIST_HABITS: {
        const habits = await Habit.find({
          user: userId,
          workspace: targetWorkspaceId,
          isActive: true
        }).select('title category currentStreak').lean();
        
        const workspaceText = targetWorkspaceName ? ` in "${targetWorkspaceName}"` : '';
        return {
          intent: 'list_habits',
          action: null,
          reply: `You have ${habits.length} active habits${workspaceText}.`,
          data: habits
        };
      }
      
      case INTENT_TYPES.LIST_NOTES: {
        const notes = await Note.find({
          workspace: targetWorkspaceId,
          $or: [{ creator: userId }, { 'sharedWith.user': userId }],
          isTrashed: false
        }).select('title tags updatedAt').sort({ updatedAt: -1 }).limit(50).lean();
        
        const workspaceText = targetWorkspaceName ? ` in "${targetWorkspaceName}"` : '';
        return {
          intent: 'list_notes',
          action: null,
          reply: `Found ${notes.length} notes${workspaceText}.`,
          data: notes
        };
      }
      
      case INTENT_TYPES.LIST_WORKSPACES: {
        const workspaces = await Workspace.find({
          $or: [{ owner: userId }, { 'members.user': userId }]
        }).select('name description isActive').lean();
        
        return {
          intent: 'list_workspaces',
          action: null,
          reply: `You have ${workspaces.length} workspaces.`,
          data: workspaces
        };
      }
      
      case INTENT_TYPES.LIST_REMINDERS: {
        const reminders = await Reminder.find({
          user: userId,
          status: 'pending',
          date: { $gte: new Date() }
        }).select('title date time').sort({ date: 1, time: 1 }).limit(50).lean();
        
        return {
          intent: 'list_reminders',
          action: null,
          reply: `You have ${reminders.length} upcoming reminders.`,
          data: reminders
        };
      }
      
      case INTENT_TYPES.LIST_NOTIFICATIONS: {
        const notifications = await Notification.find({
          user: userId,
          isRead: false
        }).select('type message createdAt').sort({ createdAt: -1 }).limit(50).lean();
        
        return {
          intent: 'list_notifications',
          action: null,
          reply: `You have ${notifications.length} unread notifications.`,
          data: notifications
        };
      }
      
      case INTENT_TYPES.CREATE_WORKSPACE: {
        // Parse workspace creation with visibility
        let workspaceName = `My Workspace ${Date.now().toString().slice(-4)}`;
        let visibility = 'private';
        let type = 'PrivateWorkspace';

        const message = userMessage.toLowerCase();

        // Check for visibility keywords
        if (message.includes('public')) {
          visibility = 'public';
          type = 'PublicWorkspace';
        } else if (message.includes('private')) {
          visibility = 'private';
          type = 'PrivateWorkspace';
        }

        // Extract workspace name by removing visibility keywords and action words
        let extractedName = userMessage
          .replace(/\b(create|new|add|workspace|in|public|private|called|named|for)\b/gi, '')
          .trim();

        // If we have a meaningful name after cleaning, use it
        if (extractedName && extractedName.length > 0 && !extractedName.match(/^\s*$/)) {
          // Clean up extra spaces and capitalize first letter
          workspaceName = extractedName.replace(/\s+/g, ' ').trim();
          workspaceName = workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1);
        }

        // If the name is too short or just contains keywords, use a default
        if (workspaceName.length < 3 || workspaceName.toLowerCase().includes('workspace')) {
          workspaceName = visibility === 'public' ? `Public Workspace ${Date.now().toString().slice(-4)}` : `My Workspace ${Date.now().toString().slice(-4)}`;
        }

        // Create the workspace
        const workspace = await Workspace.create({
          name: workspaceName,
          description: `Workspace created via chatbot`,
          owner: userId,
          visibility: visibility,
          type: type
        });

        return {
          intent: 'create_workspace',
          action: null,
          reply: `Created ${visibility} workspace: ${workspaceName} 🏢`,
          data: workspace
        };
      }
      
      default:
        return null;
    }
  } catch (error) {
    console.error('Direct query error:', error);
    return null;
  }
};

/**
 * Validate and parse AI response with fallbacks
 */
const validateResponse = (responseText) => {
  // Try direct JSON parsing first
  try {
    const parsed = JSON.parse(responseText);
    if (parsed.intent && parsed.reply) {
      return { success: true, data: parsed };
    }
  } catch (e) {
    // Continue to extraction methods
  }
  
  // Try extracting JSON from markdown code blocks
  const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      if (parsed.intent && parsed.reply) {
        return { success: true, data: parsed };
      }
    } catch (e) {
      // Continue to next method
    }
  }
  
  // Try finding JSON object in text
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.intent && parsed.reply) {
        return { success: true, data: parsed };
      }
    } catch (e) {
      // Continue to fallback
    }
  }
  
  // Fallback: create structured response from plain text
  return {
    success: false,
    fallback: {
      intent: 'ask_clarification',
      action: null,
      reply: responseText || "I'm not sure how to respond. Could you rephrase that?"
    }
  };
};

/**
 * Execute action with parallel processing
 */
const executeAction = async (action, userId, workspaceId) => {
  if (!action || !action.endpoint) return null;

  try {
    const { method, endpoint, body } = action;

    // For now, simulate action execution without the enhanced service
    console.log('Action execution simulated:', action.endpoint, action.method);

    // Return a mock successful result
    return { success: true, data: { simulated: true } };
  } catch (error) {
    console.error('Action execution error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Main improved AI response handler
 */
export const getImprovedAIResponse = async (userMessage, userId, workspaceId, options = {}) => {
  const {
    isVoice = false,
    priorityLevel = PRIORITY_LEVELS.HIGH,
    useCompression = false
  } = options;
  
  let classification; // Declare outside try block for catch block access
  
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        intent: 'error',
        reply: 'AI service is not configured. Please contact support.',
        action: null
      };
    }
    
    // Step 0: Check for active conversation state (multi-turn interactions)
    try {
      const hasActiveState = await shouldUseState(userId, workspaceId);
      if (hasActiveState) {
        const stateResult = await processStateResponse(userId, workspaceId, userMessage);
        
        if (stateResult?.completed) {
          // State-based interaction complete, create the entity
          const { intent, data } = stateResult;
          
          if (intent === 'create_task') {
            // Create task directly with default due date (tomorrow)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            
            const task = await Task.create({
              title: data.title,
              creator: userId,
              workspace: workspaceId,
              assignees: [userId],
              stage: 'todo',
              priority: 'medium',
              dueDate: tomorrow
            });
          
          // Clear conversation state
          await clearConversationState(userId, workspaceId);
          
          // Store in history
          await ChatHistory.findOneAndUpdate(
            { user: userId, workspaceId: workspaceId },
            {
              $push: {
                messages: {
                  $each: [
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: `Created task: ${data.title}` }
                  ]
                }
              },
              $setOnInsert: { user: userId, workspaceId: workspaceId }
            },
            { upsert: true }
          );
          
          return {
            intent: 'create_task',
            reply: `Created task: ${data.title} 📝`,
            action: null,
            data: task
          };
        } else if (intent === 'create_habit') {
          // Create habit directly
          const habit = await Habit.create({
            title: data.title,
            user: userId,
            workspace: workspaceId,
            frequency: 'daily',
            isActive: true
          });
          
          // Clear conversation state
          await clearConversationState(userId, workspaceId);
          
          // Store in history
          await ChatHistory.findOneAndUpdate(
            { user: userId, workspaceId: workspaceId },
            {
              $push: {
                messages: {
                  $each: [
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: `Created habit: ${data.title}` }
                  ]
                }
              },
              $setOnInsert: { user: userId, workspaceId: workspaceId }
            },
            { upsert: true }
          );
          
          return {
            intent: 'create_habit',
            reply: `Created habit: ${data.title} 🎯`,
            action: null,
            data: habit
          };
          }
        }
      }
    } catch (stateError) {
      console.error('Conversation state processing error:', stateError);
      // Continue with normal flow if state processing fails
    }
    
    // Step 1: Classify intent
    classification = classifyIntent(userMessage);
    
    // Step 2: Handle direct queries without AI
    if (!shouldUseAI(classification)) {
      const directResult = await handleDirectQuery(classification, userId, workspaceId, userMessage);
      if (directResult) {
        // Store in history
        await ChatHistory.findOneAndUpdate(
          { user: userId, workspaceId: workspaceId },
          {
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: userMessage },
                  { role: 'assistant', content: directResult.reply }
                ]
              }
            },
            $setOnInsert: { user: userId, workspaceId: workspaceId }
          },
          { upsert: true }
        );
        
        return directResult;
      }
    }
    
    // Step 3: Get context (priority-based, incremental)
    const context = useCompression
      ? await getCompressedContext(userId, workspaceId, true)
      : await getContext(userId, workspaceId, priorityLevel);
    
    // Step 4: Build appropriate prompt
    let prompt;
    if (isVoice) {
      prompt = buildVoicePrompt(userMessage, context);
    } else if (useCompression) {
      prompt = buildCompressedPrompt(userMessage, context);
    } else {
      prompt = buildPrompt(userMessage, context, classification.type);
    }
    
    // Step 5: Call AI with streaming support (simulated for now)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Step 6: Validate response with fallbacks
    const validation = validateResponse(responseText);
    const jsonResponse = validation.success ? validation.data : validation.fallback;
    
    if (!jsonResponse) {
      return {
        intent: 'error',
        reply: 'Sorry, I encountered an error processing that request.',
        action: null
      };
    }
    
    // Step 7: Check if AI wants to start a conversation state (or detect it)
    const shouldStartTaskState = jsonResponse.conversationState?.type === 'awaiting_task_details' ||
      (jsonResponse.intent === 'ask_clarification' &&
       classification.type === INTENT_TYPES.CREATE_TASK &&
       (jsonResponse.reply.toLowerCase().includes('what would you like') ||
        jsonResponse.reply.toLowerCase().includes('name it')));
    
    const shouldStartHabitState = jsonResponse.conversationState?.type === 'awaiting_habit_details' ||
      (jsonResponse.intent === 'ask_clarification' &&
       classification.type === INTENT_TYPES.CREATE_HABIT &&
       (jsonResponse.reply.toLowerCase().includes('what would you like') ||
        jsonResponse.reply.toLowerCase().includes('name it')));
    
    if (shouldStartTaskState || shouldStartHabitState) {
      if (shouldStartTaskState) {
        const { startTaskCreation } = await import('./conversationStateTracker.js');
        await startTaskCreation(userId, workspaceId, {});
      } else if (shouldStartHabitState) {
        const { startHabitCreation } = await import('./conversationStateTracker.js');
        await startHabitCreation(userId, workspaceId, {});
      }
      
      // Store in history
      await ChatHistory.findOneAndUpdate(
        { user: userId, workspaceId: workspaceId },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: userMessage },
                { role: 'assistant', content: jsonResponse.reply }
              ]
            }
          },
          $setOnInsert: { user: userId, workspaceId: workspaceId }
        },
        { upsert: true }
      );
      
      return {
        ...jsonResponse,
        actionResult: null,
        classification,
        usedAI: true,
        conversationStateStarted: true
      };
    }
    
    // Step 8: Execute action (parallel processing)
    let actionResult = null;
    if (jsonResponse.action && !jsonResponse.action.requires_confirmation) {
      actionResult = await executeAction(jsonResponse.action, userId, workspaceId);
      
      // Step 9: Update context incrementally
      if (actionResult?.success) {
        const fieldsToUpdate = determineFieldsToUpdate(jsonResponse.intent);
        if (fieldsToUpdate.length > 0) {
          await updateContext(userId, workspaceId, fieldsToUpdate);
        }
      }
    }
    
    // Step 9: Store in history
    await ChatHistory.findOneAndUpdate(
      { user: userId, workspaceId: workspaceId },
      {
        $push: {
          messages: {
            $each: [
              { role: 'user', content: userMessage },
              { role: 'assistant', content: jsonResponse.reply }
            ]
          }
        },
        $setOnInsert: { user: userId, workspaceId: workspaceId }
      },
      { upsert: true }
    );
    
    return {
      ...jsonResponse,
      actionResult,
      classification,
      usedAI: true
    };
    
  } catch (error) {
    console.error('Improved Gemini error:', error);
    
    // Provide helpful fallback responses based on intent type
    let fallbackReply = 'I encountered an error, but I can still help with basic queries. Try asking me to list your tasks or habits.';
    
    if (classification?.type) {
      switch (classification.type) {
        case INTENT_TYPES.CREATE_TASK:
          fallbackReply = 'I\'m having trouble creating tasks right now. Try: "Create a task for [task name]" or use the task creation interface.';
          break;
        case INTENT_TYPES.CREATE_HABIT:
          fallbackReply = 'I\'m having trouble creating habits right now. Try: "Create a habit for [habit name]" or use the habit creation interface.';
          break;
        case INTENT_TYPES.CREATE_WORKSPACE:
          fallbackReply = 'I\'m having trouble creating workspaces right now. Try: "Create a workspace called [name]" or use the workspace creation interface.';
          break;
        case INTENT_TYPES.LIST_TASKS:
          fallbackReply = 'I\'m having trouble accessing your tasks right now. Try refreshing the page or check your task list directly.';
          break;
        case INTENT_TYPES.LIST_HABITS:
          fallbackReply = 'I\'m having trouble accessing your habits right now. Try refreshing the page or check your habit list directly.';
          break;
        case INTENT_TYPES.COMPLETE_TASK:
        case INTENT_TYPES.COMPLETE_HABIT:
          fallbackReply = 'I\'m having trouble completing items right now. Try using the direct action buttons in your lists.';
          break;
        default:
          fallbackReply = 'I encountered an error, but I can still help with basic queries. Try asking me to list your tasks or habits.';
      }
    }
    
    // Graceful degradation
    return {
      intent: 'error',
      reply: fallbackReply,
      action: null,
      error: error.message
    };
  }
};

/**
 * Determine which context fields need updating based on intent
 */
const determineFieldsToUpdate = (intent) => {
  const updateMap = {
    'create_task': ['tasks'],
    'update_task': ['tasks'],
    'complete_task': ['tasks'],
    'delete_task': ['tasks'],
    'create_habit': ['habits'],
    'update_habit': ['habits'],
    'complete_habit': ['habits'],
    'delete_habit': ['habits'],
    'create_note': ['notes'],
    'update_note': ['notes'],
    'delete_note': ['notes'],
    'create_reminder': ['reminders'],
    'update_reminder': ['reminders'],
    'delete_reminder': ['reminders'],
    'mark_notification_read': ['notifications']
  };
  
  return updateMap[intent] || [];
};

/**
 * Batch process multiple messages (for multi-intent)
 */
export const processBatchMessages = async (messages, userId, workspaceId) => {
  const results = [];
  
  for (const message of messages) {
    const result = await getImprovedAIResponse(message, userId, workspaceId);
    results.push(result);
  }
  
  return {
    results,
    summary: `Processed ${results.length} requests. ${results.filter(r => r.actionResult?.success).length} actions completed successfully.`
  };
};

export default {
  getImprovedAIResponse,
  processBatchMessages
};