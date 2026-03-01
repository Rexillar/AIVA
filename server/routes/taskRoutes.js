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

import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { canModifyTask, getTaskById } from "../middlewares/taskMiddleware.js";
import { taskCreationLimiter } from "../middlewares/advancedRateLimitMiddleware.js";
import { validateBatchOperation } from "../middlewares/requestSizeMiddleware.js";
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
  getTaskComments,
  trashCompletedTasks,
  bulkMoveToTrash,
  restoreAllTrashedTasks
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
  .post(taskCreationLimiter, validateBatchOperation(50), createTask);

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

// Batch operations
router.route('/batch/trash-completed')
  .post(protect, trashCompletedTasks);

router.route('/batch/trash')
  .post(protect, bulkMoveToTrash);

router.route('/batch/restore-all')
  .post(protect, restoreAllTrashedTasks);

export default router;