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
  getUserStats,
  getAchievements,
  getUserAchievements,
  awardXP,
  awardCoins,
  startFocusSession,
  endFocusSession,
  submitReflection,
  getFocusROI
} from '../controllers/gamificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user gamification stats
router.get('/stats', getUserStats);

// Get all available achievements
router.get('/achievements', getAchievements);

// Get user's earned achievements
router.get('/my-achievements', getUserAchievements);

// Award XP (admin/testing)
router.post('/award-xp', awardXP);

// Award coins (admin/testing)
router.post('/award-coins', awardCoins);

// Focus session management
router.post('/focus/start', startFocusSession);
router.post('/focus/end', endFocusSession);

// Reflection
router.post('/reflection', submitReflection);

// Focus ROI
router.get('/focus-roi', getFocusROI);

export default router;