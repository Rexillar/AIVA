/*=================================================================
* Project: AIVA-WEB
* File: gamificationRoutes.js
* Author: AI Integration - Gamification Module
* Date Created: October 25, 2025
* Last Modified: October 25, 2025
*=================================================================
* Description:
* Routes for gamification endpoints.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

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