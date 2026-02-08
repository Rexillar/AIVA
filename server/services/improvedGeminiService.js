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

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import { classifyIntent, shouldUseAI, INTENT_TYPES } from './intentClassifier.js';
import { getContext, updateContext, getCompressedContext, PRIORITY_LEVELS } from './contextManager.js';
import { buildPrompt, buildCompressedPrompt, buildVoicePrompt } from '../utils/promptTemplates.js';
import {
  getConversationState,
  saveConversationState,
  clearConversationState,
  processStateResponse,
  shouldUseState,
  startExplicitChoice,
  isAmbiguousInput,
  STATE_TYPES
} from './conversationStateTracker.js';
import ChatHistory from '../models/chatHistory.js';
import Task from '../models/task.js';
import Habit from '../models/habit.js';
import { Workspace } from '../models/workspace.js';
import Note from '../models/note.js';
import Notification from '../models/notification.js';
import Reminder from '../models/reminderModel.js';

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('⚠️ GEMINI_API_KEY is not set in environment variables');
  } else {
    console.log(`✅ GEMINI_API_KEY loaded: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
  }
  return key;
};

/**
 * Circuit breaker for API calls
 */
class CircuitBreaker {
  constructor() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.threshold = 3; // Open circuit after 3 failures
    this.timeout = 30000; // Reset after 30 seconds
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: HALF_OPEN - attempting request');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.error(`Circuit breaker: OPEN after ${this.failureCount} failures`);
    }
  }
}

const circuitBreaker = new CircuitBreaker();

/**
 * Retry with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const is503 = error.message.includes('503') || error.message.includes('UNAVAILABLE');
      const is429 = error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED');

      if (isLastAttempt || (!is503 && !is429)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Get fallback response based on intent
 */
const getFallbackResponse = (classification, userMessage) => {
  const { type } = classification;

  // For create operations, provide guidance
  if (type === INTENT_TYPES.CREATE_TASK) {
    return {
      intent: 'error',
      reply: `I'm having trouble creating tasks right now. Try: "Create a task for [task name]" or use the task creation interface.`,
      action: null,
      fallback: true
    };
  }

  if (type === INTENT_TYPES.CREATE_HABIT) {
    return {
      intent: 'error',
      reply: `The AI service is temporarily unavailable. You can create a habit using the habits page directly.`,
      action: null,
      fallback: true
    };
  }

  // For list operations, suggest direct navigation
  if (type === INTENT_TYPES.LIST_TASKS) {
    return {
      intent: 'error',
      reply: `I can't process that right now. You can view your tasks by navigating to the Tasks page.`,
      action: null,
      fallback: true
    };
  }

  // Generic fallback
  return {
    intent: 'error',
    reply: `I'm experiencing temporary difficulties. Please try again in a moment, or use the navigation menu to access the feature you need.`,
    action: null,
    fallback: true
  };
};

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
 * Extract workspace mention from message
 * Handles patterns like "in workspace X", "in my workspace X", "in the workspace X"
 */
const extractWorkspaceMention = async (message, userId) => {
  const patterns = [
    /(?:in|to)\s+(?:the\s+)?(?:my\s+)?workspace\s+['""]?([^'""\s]+)['""]?/i,
    /(?:in|to)\s+['""]?([^'""\s]+)\s+workspace['""]?/i,
    /workspace\s+['""]?([0-9]+)['""]?/i  // For workspace IDs/numbers
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const workspaceName = match[1].trim();
      const workspace = await findWorkspaceByName(workspaceName, userId);
      return workspace;
    }
  }

  return null;
};

/**
 * Get current workspace info
 */
const getCurrentWorkspace = async (workspaceId) => {
  try {
    return await Workspace.findById(workspaceId).select('_id name').lean();
  } catch (error) {
    return null;
  }
};

/**
 * Detect workspace ambiguity and return confirmation dialog data
 */
const detectWorkspaceAmbiguity = async (message, userId, currentWorkspaceId, intent) => {
  const mentionedWorkspace = await extractWorkspaceMention(message, userId);

  if (!mentionedWorkspace) {
    return null; // No workspace mentioned
  }

  const currentWorkspace = await getCurrentWorkspace(currentWorkspaceId);

  if (!currentWorkspace) {
    return null; // No current workspace
  }

  // Check if mentioned workspace is different from current
  if (mentionedWorkspace._id.toString() === currentWorkspace._id.toString()) {
    return null; // Same workspace, no ambiguity
  }

  // Extract task/item name from message
  const taskMatch = message.match(/(?:task|item)\s+['""]?([^'""\s]+)['""]?/i);
  const itemName = taskMatch ? taskMatch[1] : 'item';

  // Return ambiguity dialog data
  return {
    requiresExplicitChoice: true,
    choiceData: {
      title: "Choose Workspace",
      question: `Where would you like to ${intent} "${itemName}"?`,
      intent: intent,
      options: [
        {
          id: 'current_workspace',
          label: `${currentWorkspace.name} (Current)`,
          description: 'Use the workspace you\'re currently viewing',
          icon: '📍',
          workspaceId: currentWorkspace._id,
          workspaceName: currentWorkspace.name
        },
        {
          id: 'mentioned_workspace',
          label: mentionedWorkspace.name,
          description: 'Switch to the mentioned workspace',
          icon: '🔄',
          workspaceId: mentionedWorkspace._id,
          workspaceName: mentionedWorkspace.name
        }
      ]
    },
    mentionedWorkspace,
    currentWorkspace,
    itemName
  };
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

    // ==================== PRIORITY 1: CHECK CONFIRMATION STATES FIRST ====================
    // This MUST come before workspace ambiguity checks because "yes" is ambiguous
    const currentState = await getConversationState(userId, workspaceId);

    console.log(`🔍 Checking conversation state:`, {
      hasState: !!currentState,
      stateType: currentState?.type,
      action: currentState?.context?.action,
      message: userMessage
    });

    if (currentState?.type === STATE_TYPES.AWAITING_CONFIRMATION) {
      const action = currentState?.context?.action;

      if (action === 'delete_all_tasks' || action === 'delete_all_habits') {
        console.log(`⚠️ Confirmation pending for ${action} - processing user response...`);

        // User is responding to a confirmation prompt - be flexible with responses
        const userResponse = userMessage.trim().toLowerCase();

        // Check for confirmation (any phrase containing affirmative keywords)
        const isConfirming = /\b(yes|confirm|sure|ok|okay|do it|go ahead|proceed|delete|affirmative)\b/.test(userResponse);
        const isCancelling = /\b(no|cancel|abort|stop|nevermind|never mind|don't|dont|nope)\b/.test(userResponse);

        console.log(`🎯 User response analysis:`, {
          response: userResponse,
          isConfirming,
          isCancelling
        });

        if (isConfirming && !isCancelling) {
          console.log(`✅ Confirmation received - executing ${action}...`);

          if (action === 'delete_all_tasks') {
            // Delete all tasks in workspace
            const result = await Task.deleteMany({
              workspace: workspaceId,
              $or: [{ creator: userId }, { assignees: userId }]
            });

            await clearConversationState(userId, workspaceId);

            return {
              intent: 'delete_all_tasks_confirmed',
              reply: `✅ Successfully deleted ${result.deletedCount} task(s) from your workspace.`,
              action: {
                type: 'DELETE_ALL_TASKS',
                workspaceId: workspaceId,
                deletedCount: result.deletedCount
              },
              data: { deletedCount: result.deletedCount }
            };
          } else if (action === 'delete_all_habits') {
            // Delete all habits in workspace
            const result = await Habit.deleteMany({
              user: userId,
              workspace: workspaceId,
              isActive: true
            });

            await clearConversationState(userId, workspaceId);

            return {
              intent: 'delete_all_habits_confirmed',
              reply: `✅ Successfully deleted ${result.deletedCount} habit(s) from your workspace.`,
              action: {
                type: 'DELETE_ALL_HABITS',
                workspaceId: workspaceId,
                deletedCount: result.deletedCount
              },
              data: { deletedCount: result.deletedCount }
            };
          }
        } else if (isCancelling) {
          // User cancelled
          await clearConversationState(userId, workspaceId);
          return {
            intent: `${action}_cancelled`,
            reply: "Action cancelled.",
            action: null
          };
        } else {
          // Ambiguous response - ask again
          return {
            intent: 'confirmation_required',
            reply: "Please respond with 'yes' to confirm or 'cancel' to abort.",
            requiresConfirmation: true,
            action: null
          };
        }
      }
    }

    // ==================== PRIORITY 2: CHECK WORKSPACE AMBIGUITY STATES ====================
    // Step 0: Check for active conversation state (multi-turn interactions)
    try {
      const hasActiveState = await shouldUseState(userId, workspaceId);
      if (hasActiveState) {
        // Check if input is ambiguous (like "yes", "no", etc.)
        if (isAmbiguousInput(userMessage)) {
          return {
            intent: 'ask_clarification',
            reply: "I'm not sure which option you meant. Please select one explicitly from the options above, or type the specific name.",
            action: null,
            conversationStateActive: true
          };
        }

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

    // Step 2: Classify intent
    classification = classifyIntent(userMessage);

    console.log(`🎯 Intent Classification:`, {
      type: classification.type,
      confidence: classification.confidence,
      requiresAI: classification.requiresAI,
      shouldUseAI: shouldUseAI(classification),
      message: userMessage
    });

    // CRITICAL: Early logging for high-confidence commands
    const bypassGemini = !shouldUseAI(classification);
    if (bypassGemini) {
      console.log(`✅ HIGH CONFIDENCE - Will bypass Gemini for ${classification.type}`);
    }

    // Step 3: Check for workspace ambiguity (before executing any action)
    if (classification.type === INTENT_TYPES.CREATE_TASK ||
      classification.type === INTENT_TYPES.CREATE_HABIT ||
      classification.type === INTENT_TYPES.CREATE_NOTE) {

      const ambiguityCheck = await detectWorkspaceAmbiguity(
        userMessage,
        userId,
        workspaceId,
        classification.type === INTENT_TYPES.CREATE_TASK ? 'create task' :
          classification.type === INTENT_TYPES.CREATE_HABIT ? 'create habit' : 'create note'
      );

      if (ambiguityCheck) {
        // Save explicit choice state
        await startExplicitChoice(userId, workspaceId, {
          question: ambiguityCheck.choiceData.question,
          options: ambiguityCheck.choiceData.options,
          originalIntent: classification.type,
          contextData: {
            itemName: ambiguityCheck.itemName,
            userMessage: userMessage
          }
        });

        return {
          intent: 'workspace_ambiguity',
          reply: `You're currently in "${ambiguityCheck.currentWorkspace.name}", but you mentioned "${ambiguityCheck.mentionedWorkspace.name}". Where would you like me to ${ambiguityCheck.choiceData.intent} "${ambiguityCheck.itemName}"?`,
          requiresExplicitChoice: true,
          choiceData: ambiguityCheck.choiceData,
          action: null
        };
      }
    }

    // Step 4: Check for destructive actions requiring confirmation
    if (classification.type === INTENT_TYPES.DELETE_ALL_TASKS) {
      console.log(`🗑️ DELETE_ALL_TASKS detected - checking task count...`);

      // First, check how many tasks exist
      const taskCount = await Task.countDocuments({
        workspace: workspaceId,
        $or: [{ creator: userId }, { assignees: userId }],
        isDeleted: { $ne: true }
      });

      if (taskCount === 0) {
        return {
          intent: 'no_tasks_to_delete',
          reply: "There are no tasks in your current workspace to delete.",
          action: null
        };
      }

      // Ask for confirmation (state already checked above)
      const confirmState = await getConversationState(userId, workspaceId);
      confirmState.setState(STATE_TYPES.AWAITING_CONFIRMATION, {
        action: 'delete_all_tasks',
        workspaceId: workspaceId,
        taskCount: taskCount
      });
      await saveConversationState(confirmState);

      console.log(`💾 Saved confirmation state for ${taskCount} tasks`);

      return {
        intent: 'delete_all_tasks_confirmation',
        reply: `⚠️ You have **${taskCount} task(s)** in this workspace.\n\nAre you sure you want to delete all of them? This action cannot be undone.\n\n**Type 'yes' to confirm** or 'cancel' to abort.`,
        requiresConfirmation: true,
        action: null,
        data: { taskCount }
      };
    }

    if (classification.type === INTENT_TYPES.DELETE_ALL_HABITS) {
      console.log(`🗑️ DELETE_ALL_HABITS detected - checking habit count...`);

      // First, check how many habits exist
      const habitCount = await Habit.countDocuments({
        user: userId,
        workspace: workspaceId,
        isActive: true
      });

      if (habitCount === 0) {
        return {
          intent: 'no_habits_to_delete',
          reply: "There are no active habits in your current workspace to delete.",
          action: null
        };
      }

      // Ask for confirmation
      const confirmState = await getConversationState(userId, workspaceId);
      confirmState.setState(STATE_TYPES.AWAITING_CONFIRMATION, {
        action: 'delete_all_habits',
        workspaceId: workspaceId,
        habitCount: habitCount
      });
      await saveConversationState(confirmState);

      console.log(`💾 Saved confirmation state for ${habitCount} habits`);

      return {
        intent: 'delete_all_habits_confirmation',
        reply: `⚠️ You have **${habitCount} habit(s)** in this workspace.\n\nAre you sure you want to delete all of them? This action cannot be undone.\n\n**Type 'yes' to confirm** or 'cancel' to abort.`,
        requiresConfirmation: true,
        action: null,
        data: { habitCount }
      };
    }

    // Step 5: Handle direct queries without AI
    if (!shouldUseAI(classification)) {
      console.log(`🚫 Skipping Gemini API - attempting direct query for ${classification.type}`);
      const directResult = await handleDirectQuery(classification, userId, workspaceId, userMessage);
      if (directResult) {
        console.log(`✅ Direct query successful - returning result`);
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

      // CRITICAL: If shouldUseAI is false but no handler exists, return error instead of calling Gemini
      console.error(`❌ No handler for high-confidence intent: ${classification.type}`);
      return {
        intent: 'unhandled_intent',
        reply: `I understood your request as "${classification.type}" but this action isn't implemented yet. Please try a different command or rephrase your request.`,
        action: null,
        data: { intentType: classification.type }
      };
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

    // Step 5: Call AI with retry logic and circuit breaker
    let data;
    try {
      data = await circuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            const errorData = await response.json().catch(() => ({}));
            const errorCode = errorData.error?.code || response.status;
            const errorMessage = errorData.error?.message || response.statusText;

            console.error('Gemini API Error:', {
              status: response.status,
              code: errorCode,
              message: errorMessage
            });

            // Provide user-friendly error messages
            if (errorCode === 503 || errorMessage.includes('overloaded')) {
              throw new Error('SERVICE_OVERLOADED');
            } else if (errorCode === 429) {
              throw new Error('RATE_LIMIT_EXCEEDED');
            } else if (errorCode === 401 || errorCode === 403) {
              throw new Error('AUTHENTICATION_ERROR');
            } else {
              throw new Error(`API_ERROR: ${errorMessage}`);
            }
          }

          return await response.json();
        }, 3, 1000);
      });
    } catch (error) {
      console.error('AI Service Error:', error.message);

      // Return user-friendly fallback based on error type
      if (error.message === 'SERVICE_OVERLOADED') {
        return {
          intent: 'error',
          reply: `The AI service is currently overloaded. I've noted your request. You can try again in a moment or use the direct interface to ${classification.type === INTENT_TYPES.CREATE_TASK ? 'create tasks' : 'complete your action'}.`,
          action: null,
          error: 'service_overloaded',
          fallback: true
        };
      } else if (error.message === 'RATE_LIMIT_EXCEEDED') {
        return {
          intent: 'error',
          reply: `I'm receiving too many requests right now. Please wait a moment and try again.`,
          action: null,
          error: 'rate_limit',
          fallback: true
        };
      } else if (error.message.includes('Circuit breaker')) {
        return {
          intent: 'error',
          reply: `The AI service is temporarily unavailable. Please try again in 30 seconds or use the navigation menu.`,
          action: null,
          error: 'circuit_open',
          fallback: true
        };
      } else {
        return getFallbackResponse(classification, userMessage);
      }
    }

    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('Invalid AI response structure:', JSON.stringify(data));
      return getFallbackResponse(classification, userMessage);
    }

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

    // Check if error already has fallback response (from circuit breaker or retry logic)
    if (error.fallback) {
      return error;
    }

    // Provide helpful fallback responses based on intent type
    let fallbackReply = 'I encountered an error, but I can still help with basic queries. Try asking me to list your tasks or habits.';
    let errorType = 'general_error';

    // Check for specific error types
    if (error.message?.includes('SERVICE_OVERLOADED') || error.message?.includes('overloaded')) {
      errorType = 'service_overloaded';
      fallbackReply = 'The AI service is currently overloaded. You can try again in a moment or use the direct interface.';
    } else if (error.message?.includes('RATE_LIMIT')) {
      errorType = 'rate_limit';
      fallbackReply = 'Too many requests right now. Please wait a moment and try again.';
    } else if (error.message?.includes('Circuit breaker')) {
      errorType = 'circuit_open';
      fallbackReply = 'The AI service is temporarily unavailable. Please try again in 30 seconds.';
    } else if (classification?.type) {
      // Intent-specific fallbacks
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
      error: errorType,
      errorMessage: error.message,
      fallback: true
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