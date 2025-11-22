/*=================================================================
* Project: AIVA-WEB
* File: noteRoutes.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Routes for managing notes within workspaces, including creation,
* updates, deletion and retrieval operations.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import {
  getWorkspaceNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  shareNote
} from '../controllers/noteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Note routes
router.route('/')
  .get(getWorkspaceNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.post('/:id/share', shareNote);

export default router;