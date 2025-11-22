/*=================================================================
* Project: AIVA-WEB
* File: notification.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Notification model schema handling user notifications, read status,
* and relationships with various system events.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    notiType: {
      type: String,
      enum: ['alert', 'message'],
      default: 'alert'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: String,
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ notiType: 1 });

// Pre-save middleware to validate recipients are workspace members
notificationSchema.pre('save', async function(next) {
  if (this.isModified('recipients')) {
    const Workspace = mongoose.model('Workspace');
    const workspace = await Workspace.findById(this.workspace);
    
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const workspaceMembers = workspace.members.map(m => m.user.toString());
    const invalidRecipients = this.recipients.filter(
      recipient => !workspaceMembers.includes(recipient.toString())
    );

    if (invalidRecipients.length > 0) {
      throw new Error('Some recipients are not members of the workspace');
    }
  }
  next();
});

// Method to mark notification as read for a user
notificationSchema.methods.markAsRead = async function(userId) {
  if (!this.isRead.includes(userId)) {
    this.isRead.push(userId);
    await this.save();
  }
};

// Method to check if notification is read by user
notificationSchema.methods.isReadByUser = function(userId) {
  return this.isRead.some(id => id.toString() === userId.toString());
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;