/*=================================================================
* Project: AIVA-WEB
* File: notificationRoutes.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Routes for managing user notifications, including creation,
* retrieval, and marking notifications as read.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications - Get all notifications for a user
router.get('/', protect, getNotifications);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router; 