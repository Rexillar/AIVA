/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  I N T E L L I G E N C E   R O U T E S  ──◈──

   ◉  Execution Intelligence API Endpoints
   ◉  Proactive • Predictive • Data-Driven

   ⟁  SYSTEM LAYER : API ROUTES
   ⟁  DOMAIN       : INTELLIGENCE ENGINE

   ⟁  ENDPOINTS:
   ⟁    GET /api/intelligence/report   → Full execution intelligence report
   ⟁    GET /api/intelligence/nudge    → Single proactive insight
   ⟁    GET /api/intelligence/gaps     → Execution gaps + suggestions
   ⟁    GET /api/intelligence/focus    → Focus window analytics
   ⟁    GET /api/intelligence/burnout  → Burnout risk assessment
   ⟁    GET /api/intelligence/habits   → Habit execution health

   ⟁  TECH STACK   : Node.js • Express
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS         : /docs/api/intelligence.md

        "Routes defined. Intelligence accessible. Execution optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getIntelligenceReport,
  getNudge,
  getExecutionGaps,
  getFocusAnalytics,
  getBurnoutAssessment,
  getHabitHealth
} from '../controllers/intelligenceController.js';

const router = express.Router();

// All intelligence routes require authentication
router.use(protect);

// Full execution intelligence report (aggregated)
router.get('/report', getIntelligenceReport);

// Quick proactive nudge (single insight for chat/dashboard)
router.get('/nudge', getNudge);

// Execution gaps and orchestration suggestions
router.get('/gaps', getExecutionGaps);

// Focus window analytics (completion patterns, productivity hours)
router.get('/focus', getFocusAnalytics);

// Burnout risk assessment
router.get('/burnout', getBurnoutAssessment);

// Habit execution health
router.get('/habits', getHabitHealth);

export default router;
