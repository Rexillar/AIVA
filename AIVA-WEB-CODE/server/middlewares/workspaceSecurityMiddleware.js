/*=================================================================
* Project: AIVA-WEB
* File: workspaceSecurityMiddleware.js
* Author: Mohitraj Jadeja
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Workspace-level security middleware to prevent unauthorized
* access to workspace resources (files, tasks, notes, habits, chat)
* Defense-in-depth: blocks access even if controllers have bugs
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import { Workspace } from '../models/workspace.js';
import {
  createNotification
} from '../services/notificationService.js';
import mongoose from 'mongoose';

/**
 * Middleware to validate workspace access
 * Checks if user is a member of the workspace before allowing access
 * 
 * Usage: Apply to routes that require workspace access
 * router.get('/workspace/:workspaceId/files', validateWorkspaceAccess, getFiles);
 */
export const validateWorkspaceAccess = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  
  // Extract workspaceId from params, body, or query
  const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
  
  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    res.status(400);
    throw new Error('Invalid workspace ID format');
  }

  // Check if workspace exists and user is a member
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    isDeleted: false,
    $or: [
      { owner: userId },
      { 
        'members.user': userId,
        'members.isActive': true
      }
    ]
  }).select('_id name owner members');

  if (!workspace) {
    // Log unauthorized access attempt
    console.warn(`🚨 Unauthorized workspace access attempt:`, {
      userId: userId.toString(),
      workspaceId,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    res.status(403);
    throw new Error('Access denied: You do not have permission to access this workspace');
  }

  // Attach workspace to request for use in controllers
  req.workspace = workspace;
  
  // Log successful validation
  console.log(`✅ Workspace access validated:`, {
    userId: userId.toString(),
    workspaceId: workspace._id.toString(),
    workspaceName: workspace.name
  });

  next();
});

/**
 * Middleware to validate file access within workspace
 * Used for file-specific operations
 */
export const validateFileAccess = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const fileId = req.params.fileId || req.params.id;

  if (!fileId) {
    res.status(400);
    throw new Error('File ID is required');
  }

  // Import File model dynamically to avoid circular dependency
  const { default: File } = await import('../models/file.js');

  const file = await File.findById(fileId).populate('workspace');

  if (!file) {
    res.status(404);
    throw new Error('File not found');
  }

  // Check if user has access to the file's workspace
  const workspace = file.workspace;
  const hasAccess = workspace.owner.toString() === userId.toString() ||
    workspace.members.some(m => 
      m.user.toString() === userId.toString() && m.isActive
    );

  if (!hasAccess) {
    console.warn(`🚨 Unauthorized file access attempt:`, {
      userId: userId.toString(),
      fileId,
      workspaceId: workspace._id.toString(),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.status(403);
    throw new Error('Access denied: You do not have permission to access this file');
  }

  // Attach file to request
  req.file = file;
  req.workspace = workspace;

  next();
});

/**
 * Middleware to ensure list operations only return user's workspaces
 * Adds workspace filter to query
 */
export const filterByUserWorkspaces = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Get all workspace IDs the user belongs to
  const workspaces = await Workspace.find({
    isDeleted: false,
    $or: [
      { owner: userId },
      { 
        'members.user': userId,
        'members.isActive': true
      }
    ]
  }).select('_id');

  const workspaceIds = workspaces.map(w => w._id);

  // Attach workspace IDs to request
  req.userWorkspaceIds = workspaceIds;

  // If no workspaces found, prevent access
  if (workspaceIds.length === 0) {
    req.userWorkspaceIds = [];
  }

  next();
});

/**
 * Rate limiting for repeated unauthorized access attempts
 */
const unauthorizedAttempts = new Map();

export const trackUnauthorizedAttempts = (userId, workspaceId) => {
  const key = `${userId}-${workspaceId}`;
  const attempts = unauthorizedAttempts.get(key) || [];
  const now = Date.now();
  
  // Keep attempts from last hour
  const recentAttempts = attempts.filter(time => now - time < 3600000);
  recentAttempts.push(now);
  
  unauthorizedAttempts.set(key, recentAttempts);
  
  // If more than 5 attempts in an hour, log warning
  if (recentAttempts.length > 5) {
    console.error(`🚨 SECURITY ALERT: Multiple unauthorized access attempts:`, {
      userId,
      workspaceId,
      attemptCount: recentAttempts.length,
      timestamp: new Date().toISOString()
    });
  }
  
  return recentAttempts.length;
};

// Cleanup old attempts every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of unauthorizedAttempts.entries()) {
    const recentAttempts = attempts.filter(time => now - time < 3600000);
    if (recentAttempts.length === 0) {
      unauthorizedAttempts.delete(key);
    } else {
      unauthorizedAttempts.set(key, recentAttempts);
    }
  }
}, 3600000);

export default {
  validateWorkspaceAccess,
  validateFileAccess,
  filterByUserWorkspaces,
  trackUnauthorizedAttempts
};
