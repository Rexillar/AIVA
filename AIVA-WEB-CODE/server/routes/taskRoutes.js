/*=================================================================
* Project: AIVA-WEB
* File: taskRoutes.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Routes for managing tasks, including creation, updates, assignment,
* and status changes within workspaces.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { canModifyTask, getTaskById } from "../middlewares/taskMiddleware.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  createSubtask,
  deleteSubtask,
  postActivity,
  moveToTrash,
  restoreTask,
  getDashboardStats,
  duplicateTask,
  uploadTaskAttachments,
  deleteTaskAttachment,
  getWorkspaceTasks,
  updateSubtask,
  completeSubtask,
  addTaskComment,
  getTaskComments
} from "../controllers/taskController.js";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/dashboard')
  .get(getDashboardStats);

router.route('/workspace')
  .get(getTasks);

// Routes with :id parameter
router.use('/:id', getTaskById);

router.route('/:id')
  .get(getTask)
  .put(canModifyTask, updateTask)
  .delete(canModifyTask, deleteTask);

router.route('/:id/duplicate')
  .post(canModifyTask, duplicateTask);

router.route('/:id/subtask')
  .post(protect, canModifyTask, createSubtask);

router.route('/:id/subtask/:subtaskId')
  .put(protect, canModifyTask, updateSubtask)
  .delete(protect, canModifyTask, deleteSubtask);

router.route('/:id/subtask/:subtaskId/complete')
  .put(protect, canModifyTask, completeSubtask);

router.route('/:id/activity')
  .post(canModifyTask, postActivity);

router.route('/:id/trash')
  .put(canModifyTask, moveToTrash);

router.route('/:id/restore')
  .put(canModifyTask, restoreTask);

// Task attachments routes
router.route('/:id/attachments')
  .post(protect, (req, res, next) => { console.log(req.headers['content-type']); next(); }, upload.array('file'), uploadTaskAttachments);

router.route('/:id/attachments/:attachmentId')
  .delete(protect, deleteTaskAttachment);

// Task comments routes
router.route('/:id/comment')
  .post(protect, addTaskComment);

router.route('/:id/comments')
  .get(protect, getTaskComments);

export default router;