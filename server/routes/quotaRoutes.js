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
import { protect } from '../middlewares/authMiddleware.js';
import { getUserQuota } from '../middlewares/advancedRateLimitMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * GET /api/quotas/current
 * Get current user's quota information
 */
router.get('/current', getUserQuota);

/**
 * GET /api/quotas/status
 * Get comprehensive quota status for the current user
 */
router.get('/status', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.user._id.toString();
  const quotaManager = req.app.get('quotaManager');

  if (!quotaManager) {
    return res.status(500).json({
      success: false,
      message: 'Quota manager not available'
    });
  }

  const now = Date.now();

  const response = {
    success: true,
    userId,
    timestamp: now,
    quotas: {
      requests: {
        minute: quotaManager.getQuota(userId, 'request', 60 * 1000),
        hour: quotaManager.getQuota(userId, 'request', 60 * 60 * 1000),
        day: quotaManager.getQuota(userId, 'request', 24 * 60 * 60 * 1000)
      },
      ai: {
        minute: quotaManager.getQuota(userId, 'ai', 60 * 1000),
        hour: quotaManager.getQuota(userId, 'ai', 60 * 60 * 1000),
        day: quotaManager.getQuota(userId, 'ai', 24 * 60 * 60 * 1000),
        concurrent: quotaManager.getConcurrentCount(userId, 'ai')
      },
      tasks: {
        hour: quotaManager.getQuota(userId, 'task_create', 60 * 60 * 1000)
      },
      uploads: {
        hour: quotaManager.getQuota(userId, 'upload', 60 * 60 * 1000),
        concurrent: quotaManager.getConcurrentCount(userId, 'upload')
      },
      workspaces: {
        day: quotaManager.getQuota(userId, 'workspace_create', 24 * 60 * 60 * 1000)
      }
    }
  };

  res.json(response);
});

/**
 * GET /api/quotas/health
 * Health check for quota system
 */
router.get('/health', (req, res) => {
  const quotaManager = req.app.get('quotaManager');

  res.json({
    success: true,
    quotaSystem: quotaManager ? 'active' : 'inactive',
    type: process.env.USE_REDIS_QUOTA === 'true' ? 'redis' : 'in-memory',
    timestamp: Date.now()
  });
});

export default router;
