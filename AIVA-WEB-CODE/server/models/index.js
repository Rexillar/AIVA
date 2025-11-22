/*=================================================================
* Project: AIVA-WEB
* File: db.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Database configuration and connection setup for MongoDB using
* Mongoose with GridFS for file storage.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import User from './user.js';
import { Workspace } from './workspace.js';
import Task from './task.js';
import Note from './note.js';
import Notification from './notification.js';
import WorkspaceInvitation from './workspaceInvitation.js';
import ChatMessage from './chat.js';
import File from './file.js';
import AuditLog from './auditLog.js';
import Achievement from './achievement.js';
import Canvas from './canvas.js';

export {
  User,
  Workspace,
  Task,
  Note,
  Notification,
  WorkspaceInvitation,
  ChatMessage,
  File,
  AuditLog,
  Achievement,
  Canvas
}; 