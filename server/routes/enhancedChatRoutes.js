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


/*=================================================================
* Project: AIVA-WEB
* File: enhancedChatRoutes.js
* Author: AI Enhancement Module
* Date Created: October 24, 2025
* Last Modified: October 24, 2025
*=================================================================
* Description:
* Routes for enhanced AI chat with voice commands and context awareness
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { chatLimiter } from '../middlewares/rateLimitMiddleware.js';
import { aiExecutionLimiter } from '../middlewares/advancedRateLimitMiddleware.js';
import { validateChatMessage } from '../middlewares/requestSizeMiddleware.js';
import {
  sendEnhancedMessage,
  sendVoiceCommand,
  getDailySummary,
  clearContext
} from '../controllers/enhancedChatController.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(protect);
router.use(chatLimiter);

// Enhanced chat endpoint with AI execution limits
router.post('/enhanced', aiExecutionLimiter, validateChatMessage, sendEnhancedMessage);

// Voice command endpoint with AI execution limits
router.post('/voice', aiExecutionLimiter, validateChatMessage, sendVoiceCommand);

// Daily summary endpoint with AI execution limits
router.get('/daily-summary', aiExecutionLimiter, getDailySummary);

// Clear context endpoint
router.post('/clear-context', clearContext);

export default router;