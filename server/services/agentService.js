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


const { callGemini } = require('./geminiService'); // Assuming this exists
const { agentPrompt } = require('../prompts/agentPrompt');
const { executeAgentActions } = require('../controllers/agentController');
const { addToMemory } = require('../utils/agentState');
const ChatHistory = require('../models/ChatHistory'); // Assuming model exists

const runAgentTask = async (taskType, workspaceId, dispatch) => {
  const prompt = `${agentPrompt}\n\nTask: ${taskType}. Workspace ID: ${workspaceId}`;
  try {
    const geminiResponse = await callGemini(prompt);
    const { intent, actions, reply } = JSON.parse(geminiResponse);

    // Execute actions
    await executeAgentActions(actions, workspaceId, dispatch);

    // Store in memory
    addToMemory(intent, actions);

    // If reply exists, add to chat history
    if (reply) {
      await ChatHistory.create({ workspaceId, role: 'assistant', content: reply });
    }
  } catch (error) {
    console.error('Agent task failed:', error);
  }
};

module.exports = { runAgentTask };
