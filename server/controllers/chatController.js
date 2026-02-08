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
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import { handleChatbotQuery } from '../services/unifiedChatbotService.js';
import { processExplicitChoice, isAmbiguousInput } from '../services/conversationStateTracker.js';
import Task from '../models/task.js';
import Habit from '../models/habit.js';
import Note from '../models/note.js';

// @desc    Send message to AI assistant (UPGRADED with all 19 improvements)
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, selectedOptionId, contextData } = req.body;
  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Handle explicit choice selection (from confirmation dialog)
  if (selectedOptionId) {
    const choiceResult = await processExplicitChoice(req.user._id, req.body.workspaceId, selectedOptionId);

    if (choiceResult?.error) {
      res.status(400).json({ reply: choiceResult.error, intent: 'error' });
      return;
    }

    if (choiceResult?.completed) {
      const { selectedOption, originalIntent, contextData: stateContext } = choiceResult;

      // Execute action based on selected workspace
      let result;
      const targetWorkspaceId = selectedOption.workspaceId;
      const itemName = stateContext.itemName;

      if (originalIntent === 'CREATE_TASK') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);

        const task = await Task.create({
          title: itemName,
          creator: req.user._id,
          workspace: targetWorkspaceId,
          assignees: [req.user._id],
          stage: 'todo',
          priority: 'medium',
          dueDate: tomorrow
        });

        result = {
          intent: 'create_task',
          reply: `✅ Created task "${itemName}" in ${selectedOption.workspaceName}`,
          data: task
        };
      } else if (originalIntent === 'CREATE_HABIT') {
        const habit = await Habit.create({
          title: itemName,
          user: req.user._id,
          workspace: targetWorkspaceId,
          frequency: 'daily',
          isActive: true
        });

        result = {
          intent: 'create_habit',
          reply: `✅ Created habit "${itemName}" in ${selectedOption.workspaceName}`,
          data: habit
        };
      } else if (originalIntent === 'CREATE_NOTE') {
        const note = await Note.create({
          title: itemName,
          creator: req.user._id,
          workspace: targetWorkspaceId,
          content: ''
        });

        result = {
          intent: 'create_note',
          reply: `✅ Created note "${itemName}" in ${selectedOption.workspaceName}`,
          data: note
        };
      }

      res.status(200).json(result);
      return;
    }
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

