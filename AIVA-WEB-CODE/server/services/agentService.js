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
