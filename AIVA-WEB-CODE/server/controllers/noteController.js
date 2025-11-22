/*=================================================================
* Project: AIVA-WEB
* File: noteController.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Note controller handling note creation, updates, sharing,
* and note-related operations within workspaces.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import Note from '../models/note.js';
import { Workspace } from '../models/workspace.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get all notes for a workspace
// @route   GET /api/notes
// @access  Private
export const getWorkspaceNotes = asyncHandler(async (req, res) => {
  const { workspace } = req.query;
  const userId = req.user._id;

  // Validate workspace ID
  if (!workspace || !/^[0-9a-fA-F]{24}$/.test(workspace)) {
    res.status(400);
    throw new Error('Invalid workspace ID');
  }

  // Check workspace access
  const workspaceDoc = await Workspace.findById(workspace);
  if (!workspaceDoc) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspaceDoc.members.some(
    (m) => m.user.toString() === userId.toString() && m.isActive
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Access denied');
  }

  // Get notes and ensure proper defaults for existing notes
  const notes = await Note.find({
    workspace,
    $or: [
      { isTrashed: false },
      { isTrashed: { $exists: false } },
      { isTrashed: null }
    ]
  }).sort({ updatedAt: -1 });

  // Fix any notes that might have undefined isArchived
  const fixedNotes = notes.map(note => ({
    ...note.toObject(),
    isArchived: note.isArchived !== undefined ? note.isArchived : false,
    isTrashed: note.isTrashed !== undefined ? note.isTrashed : false,
  }));

  res.json({
    status: true,
    data: fixedNotes
  });
});

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
export const getNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;

  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check access
  const canAccess = await note.canAccess(userId);
  if (!canAccess) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({
    status: true,
    data: note
  });
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = asyncHandler(async (req, res) => {
  const { title, content, workspace, mode, type, isTrashed, isArchived } = req.body;
  const userId = req.user._id;

  // Validate workspace
  const workspaceDoc = await Workspace.findById(workspace);
  if (!workspaceDoc) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check workspace access
  const member = workspaceDoc.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!member || !member.isActive) {
    res.status(403);
    throw new Error('Access denied');
  }

  // Create note
  const note = await Note.create({
    title,
    content,
    workspace,
    creator: userId,
    mode: mode || 'text',
    type: type || 'simple', // Default to 'simple' if not specified
    isTrashed: isTrashed !== undefined ? isTrashed : false,
    isArchived: isArchived !== undefined ? isArchived : false,
  });

  res.status(201).json({
    status: true,
    data: note
  });
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;
  const updates = req.body;

  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check edit permission
  const canEdit = await note.canEdit(userId);
  if (!canEdit) {
    res.status(403);
    throw new Error('You do not have permission to edit this note');
  }

  // Update note
  Object.assign(note, updates);
  note.lastEditedBy = userId;
  note.lastEditedAt = new Date();
  await note.save();

  res.json({
    status: true,
    data: note
  });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;

  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check edit permission (only creator or workspace admin/owner can delete)
  const canEdit = await note.canEdit(userId);
  if (!canEdit) {
    res.status(403);
    throw new Error('You do not have permission to delete this note');
  }

  // Soft delete by marking as trashed
  note.isTrashed = true;
  note.trashedAt = new Date();
  note.trashedBy = userId;
  await note.save();

  res.json({
    status: true,
    message: 'Note moved to trash'
  });
});

// @desc    Share a note with users
// @route   POST /api/notes/:id/share
// @access  Private
export const shareNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;
  const { users } = req.body;

  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check if user can share (must be creator or have write permission)
  const canEdit = await note.canEdit(userId);
  if (!canEdit) {
    res.status(403);
    throw new Error('You do not have permission to share this note');
  }

  // Add users to sharedWith array
  const workspace = await Workspace.findById(note.workspace);
  const validUsers = users.filter(u => 
    workspace.members.some(m => m.user.toString() === u.toString() && m.isActive)
  );

  note.sharedWith = [
    ...note.sharedWith.filter(s => !validUsers.includes(s.user.toString())),
    ...validUsers.map(u => ({
      user: u,
      permission: 'read',
      sharedAt: new Date()
    }))
  ];

  await note.save();

  res.json({
    status: true,
    data: note
  });
}); 