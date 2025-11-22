/*=================================================================
* Project: AIVA-WEB
* File: notificationController.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Notification controller handling user notifications, including
* creation, retrieval, and status management.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ 
    user: req.user._id 
  })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();

  res.json({
    status: true,
    data: notifications
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({
    status: true,
    data: notification
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({
    status: true,
    message: 'Notification deleted successfully'
  });
}); 