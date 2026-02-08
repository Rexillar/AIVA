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
  getAuthUrl,
  handleCallback,
  getAccounts,
  updateAccountSettings,
  disconnectAccount,
  triggerSync,
  getExternalEvents,
  getExternalTasks,
  getSyncStatus,
  updateExternalTask,
  deleteExternalTask,
  proxyProfileImage,
  cleanupStaleEvents
} from '../controllers/googleIntegrationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// OAuth flow
router.post('/auth-url', protect, getAuthUrl);
router.get('/callback', handleCallback); // GET route, no auth required (comes from Google)

// Account management
router.get('/accounts/:workspaceId', protect, getAccounts);
router.patch('/accounts/:workspaceId/:accountId', protect, updateAccountSettings);
router.delete('/accounts/:workspaceId/:accountId', protect, disconnectAccount);

// Sync operations
router.post('/sync/:workspaceId/:accountId', protect, triggerSync);
router.get('/sync-status/:workspaceId', protect, getSyncStatus);

// Data retrieval
router.get('/events/:workspaceId', protect, getExternalEvents);
router.get('/tasks/:workspaceId', protect, getExternalTasks);

// Task manipulation
router.put('/tasks/:workspaceId/:taskId', protect, updateExternalTask);
router.delete('/tasks/:workspaceId/:taskId', protect, deleteExternalTask);

// Image proxy to bypass CORS
router.get('/proxy-image', proxyProfileImage);

// Cleanup stale events
router.delete('/events/:workspaceId/cleanup', protect, cleanupStaleEvents);

export default router;
