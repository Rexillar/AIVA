import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getConflicts,
  getSuggestedDay,
  getDailyPlan,
  cleanupEvents,
} from '../controllers/orchestrationController.js';

const router = express.Router();

router.use(protect);

router.get('/conflicts', getConflicts);
router.get('/suggest-day', getSuggestedDay);
router.get('/daily-plan', getDailyPlan);
router.delete('/cleanup-events', cleanupEvents);

export default router;
