/*=================================================================
* Project: AIVA-WEB
* File: habitRoutes.js
* Author: AI Integration - Habit Tracker Module
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Routes for habit management including CRUD operations,
* completion tracking, and analytics endpoints.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import {
  createHabit,
  getWorkspaceHabits,
  getUserHabits,
  getHabitsDueToday,
  getHabitById,
  updateHabit,
  toggleHabitCompletion,
  getHabitStatistics,
  getUserHabitAnalytics,
  archiveHabit,
  pauseHabit,
  deleteHabit,
  addHabitNote,
  deleteHabitNote,
  getHabitHistory,
  getHabits
} from '../controllers/habitController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Analytics routes
router.get('/analytics/user', getUserHabitAnalytics);

// Due today route
router.get('/due-today', getHabitsDueToday);

// User habits route
router.get('/user', getUserHabits);

// Workspace habits route
router.get('/workspace/:workspaceId', getWorkspaceHabits);

// Main CRUD routes
router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .get(getHabitById)
  .put(updateHabit)
  .delete(deleteHabit);

// Habit action routes
router.post('/:id/complete', toggleHabitCompletion);
router.patch('/:id/archive', archiveHabit);
router.patch('/:id/pause', pauseHabit);

// Habit data routes
router.get('/:id/statistics', getHabitStatistics);
router.get('/:id/history', getHabitHistory);
router.post('/:id/notes', addHabitNote);
router.delete('/:id/notes/:noteId', deleteHabitNote);

export default router;
