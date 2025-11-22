/*=================================================================
* Project: AIVA-WEB
* File: note.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Note model schema defining note properties, content management,
* and relationships with workspaces and users.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      // Allow HTML content
      get: (content) => content,
      set: (content) => content
    },
    type: {
      type: String,
      enum: ["sticky", "simple"],
      default: "simple",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      permission: {
        type: String,
        enum: ["read", "write"],
        default: "read",
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    tags: [String],
    attachments: [{
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: [{
      version: Number,
      content: String,
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      editedAt: {
        type: Date,
        default: Date.now,
      },
      comment: String,
    }],
    isArchived: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: Date,
    trashedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditedAt: Date,
    aiMetadata: {
      summary: String,
      keywords: [String],
      suggestedTags: [String],
      relatedNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      }],
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
noteSchema.index({ workspace: 1, isTrashed: 1 });
noteSchema.index({ creator: 1 });
noteSchema.index({ "sharedWith.user": 1 });
noteSchema.index({ tags: 1 });

// Middleware to update version and version history
noteSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.version += 1;
    this.versionHistory.push({
      version: this.version,
      content: this.content,
      editedBy: this.lastEditedBy,
      editedAt: new Date(),
    });
  }
  next();
});

// Method to check if user can access note
noteSchema.methods.canAccess = async function (userId) {
  const workspace = await mongoose.model("Workspace").findById(this.workspace);
  if (!workspace) return false;

  // Check workspace membership
  const isMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  if (!isMember) return false;

  // Creator has full access
  if (this.creator.toString() === userId.toString()) return true;

  // Check shared permissions
  const shared = this.sharedWith.find(
    (s) => s.user.toString() === userId.toString()
  );
  return !!shared;
};

// Method to check if user can edit note
noteSchema.methods.canEdit = async function (userId) {
  const workspace = await mongoose.model("Workspace").findById(this.workspace);
  if (!workspace) return false;

  // Creator and workspace admins/owner can edit
  if (
    this.creator.toString() === userId.toString() ||
    workspace.owner.toString() === userId.toString()
  ) {
    return true;
  }

  const member = workspace.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (member && member.role === "admin") return true;

  // Check write permission in sharedWith
  const shared = this.sharedWith.find(
    (s) => s.user.toString() === userId.toString()
  );
  return shared && shared.permission === "write";
};

const Note = mongoose.model("Note", noteSchema);

export default Note; 