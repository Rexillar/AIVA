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

   ⟁  PURPOSE      : Provide AI-powered features and responses

   ⟁  WHY          : Intelligent automation and assistance

   ⟁  WHAT         : Google Gemini API integration and processing

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : API Keys • TLS
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "AI powered. Intelligence delivered. Automation achieved."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import Habit from '../models/habit.js';
import ChatHistory from '../models/chatHistory.js';
import { assistantMasterPrompt } from '../utils/assistantPrompt.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
}

export const getAIResponse = async (userMessage, userId, workspaceId) => {
  try {
    if (!apiKey) {
      return { intent: 'ask_clarification', data: {}, reply: 'AI service is not configured. Please contact support.' };
    }

    // Fetch user data and memory
    const habits = await Habit.find({ user: userId, workspace: workspaceId }).limit(5);
    const chatHistory = await ChatHistory.findOne({ user: userId, workspace: workspaceId });
    const memory = chatHistory ? chatHistory.messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n') : '';

    const context = {
      habits: habits.map(h => ({ title: h.title, category: h.category, streak: h.currentStreak })),
      memory: memory
    };

    const prompt = `${assistantMasterPrompt}\n\nContext: ${JSON.stringify(context)}\n\nUser: ${userMessage}`;

    // Use REST API directly (v1beta with v1 body)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Details:', JSON.stringify(errorData, null, 2));
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonResponse = extractJSON(responseText);

    if (jsonResponse) {
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
      return jsonResponse;
    } else {
      return { intent: 'ask_clarification', data: {}, reply: 'I\'m not sure what you mean. Can you clarify?' };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return { intent: 'ask_clarification', data: {}, reply: 'Sorry, I encountered an error with the AI service. Please try again or check your API configuration.' };
  }
};

const extractJSON = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return null;
    }
  }
  return null;
};
