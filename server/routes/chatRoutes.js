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
   ⟁  DOMAIN       : API ROUTES

   ⟁  PURPOSE      : Define API endpoints and route handlers

   ⟁  WHY          : Organized API structure and request routing

   ⟁  WHAT         : Express route definitions and middleware application

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. API structured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import express from 'express';
import {
  sendMessage
} from '../controllers/chatController.js';
import {
  sendEnhancedMessage,
  sendVoiceCommand,
  getDailySummary,
  clearContext
} from '../controllers/enhancedChatController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { chatLimiter, searchLimiter } from '../middlewares/rateLimitMiddleware.js';
import { aiExecutionLimiter } from '../middlewares/advancedRateLimitMiddleware.js';
import { validateChatMessage } from '../middlewares/requestSizeMiddleware.js';
import ChatHistory from '../models/chatHistory.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Message routes with AI limits
router.post('/:workspaceId/messages', chatLimiter, aiExecutionLimiter, validateChatMessage, sendMessage);

// Original chatbot routes
router.post('/message', aiExecutionLimiter, validateChatMessage, sendMessage);

// Enhanced AI chat routes
router.post('/enhanced', chatLimiter, aiExecutionLimiter, validateChatMessage, sendEnhancedMessage);
router.post('/voice', chatLimiter, aiExecutionLimiter, validateChatMessage, sendVoiceCommand);
router.get('/daily-summary', aiExecutionLimiter, getDailySummary);
router.post('/clear-context', clearContext);

// GET /api/chat/history?workspaceId=...
router.get('/history', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: 'workspaceId is required' });
    }
    const history = await ChatHistory.find({ workspaceId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
