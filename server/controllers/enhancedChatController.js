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
import {
  getEnhancedAIResponse,
  processVoiceCommand,
  clearSessionContext
} from '../services/enhancedGeminiService.js';

// @desc    Send message to enhanced AI assistant
// @route   POST /api/chat/enhanced
// @access  Private
export const sendEnhancedMessage = asyncHandler(async (req, res) => {
  const { message, workspaceId } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const response = await getEnhancedAIResponse(
    message,
    req.user._id,
    workspaceId
  );

  res.status(200).json({
    success: true,
    data: response
  });
});

// @desc    Process voice command
// @route   POST /api/chat/voice
// @access  Private
export const sendVoiceCommand = asyncHandler(async (req, res) => {
  const { transcript, workspaceId } = req.body;

  if (!transcript) {
    res.status(400);
    throw new Error('Voice transcript is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const response = await processVoiceCommand(
    transcript,
    req.user._id,
    workspaceId
  );

  res.status(200).json({
    success: true,
    data: response
  });
});

// @desc    Get daily summary
// @route   GET /api/chat/daily-summary
// @access  Private
export const getDailySummary = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const response = await getEnhancedAIResponse(
    'Give me my daily summary',
    req.user._id,
    workspaceId
  );

  res.status(200).json({
    success: true,
    data: response
  });
});

// @desc    Clear session context
// @route   POST /api/chat/clear-context
// @access  Private
export const clearContext = asyncHandler(async (req, res) => {
  const { workspaceId } = req.body;

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  clearSessionContext(req.user._id, workspaceId);

  res.status(200).json({
    success: true,
    message: 'Session context cleared'
  });
});

export default {
  sendEnhancedMessage,
  sendVoiceCommand,
  getDailySummary,
  clearContext
};