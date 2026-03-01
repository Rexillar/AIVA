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
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import Note from '../models/note.js';
import { Workspace } from '../models/workspace.js';
import { createNotification } from '../services/notificationService.js';
import { decryptDocument } from '../utils/encryption.js';
import fetch from 'node-fetch';

// Encrypted fields matching the Note model's encryptionPlugin config
const NOTE_ENCRYPTED_FIELDS = ['title', 'content', 'tags', 'attachments.filename', 'versionHistory.content'];

/**
 * Safely convert a Mongoose Note document to a plain object with decrypted fields.
 * - Uses the Mongoose document's decrypted getters for top-level fields
 * - Falls back to decryptDocument for plain objects
 */
const safeNoteToObject = (note) => {
  // Read decrypted values from the Mongoose document directly (post-init hook decrypts them)
  // Then build a plain object to avoid toObject() re-reading raw _doc values
  const obj = note.toObject();
  // Overwrite encrypted top-level fields with the decrypted values from the Mongoose document
  obj.title = note.title;
  obj.content = note.content;
  if (Array.isArray(note.tags)) {
    obj.tags = [...note.tags];
  }
  // For nested arrays, the post-init hook already mutated the sub-docs in-place
  // but toObject() might snapshot before that — use decryptDocument as safety net
  return decryptDocument(obj, NOTE_ENCRYPTED_FIELDS);
};

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
    isTrash: false,
    isDeleted: false
  }).sort({ updatedAt: -1 });

  // Convert to plain objects with decrypted fields + normalize flags
  const fixedNotes = notes.map(note => {
    const obj = safeNoteToObject(note);
    obj.isTrash = note.isTrash !== undefined ? note.isTrash : false;
    return obj;
  });

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
    data: safeNoteToObject(note)
  });
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = asyncHandler(async (req, res) => {
  const { title, content, workspace, mode, type, isTrash } = req.body;
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
    type: type || 'simple',
    isTrash: isTrash !== undefined ? isTrash : false,
  });

  // Re-fetch to trigger post-init decryption (create returns pre-save encrypted doc)
  const createdNote = await Note.findById(note._id);

  res.status(201).json({
    status: true,
    data: safeNoteToObject(createdNote || note)
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

  // Re-fetch to trigger post-init decryption (save re-encrypts in _doc)
  const updatedNote = await Note.findById(note._id);

  res.json({
    status: true,
    data: safeNoteToObject(updatedNote || note)
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
  note.isTrash = true;
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

  // Re-fetch for decryption
  const sharedNote = await Note.findById(note._id);

  res.json({
    status: true,
    data: safeNoteToObject(sharedNote || note)
  });
});

// @desc    List all notes with filters
// @route   GET /api/notes/list
// @access  Private
export const listNotes = asyncHandler(async (req, res) => {
  const { workspace } = req.query;
  const userId = req.user._id;

  if (!workspace) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const query = {
    workspace,
    isTrash: false,
    isDeleted: false
  };

  const notes = await Note.find(query)
    .populate('creator', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.json({
    status: true,
    count: notes.length,
    data: notes
  });
});

// @desc    Search notes by keyword
// @route   GET /api/notes/search
// @access  Private
export const searchNotes = asyncHandler(async (req, res) => {
  const { workspace, keyword } = req.query;
  const userId = req.user._id;

  if (!workspace) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  if (!keyword) {
    res.status(400);
    throw new Error('Search keyword is required');
  }

  const notes = await Note.find({
    workspace,
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } }
    ],
    isTrash: { $ne: true }
  })
    .populate('creator', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.json({
    status: true,
    count: notes.length,
    data: notes
  });
});

// @desc    Delete multiple notes
// @route   POST /api/notes/batch/delete
// @access  Private
export const deleteMultipleNotes = asyncHandler(async (req, res) => {
  const { noteIds, workspaceId } = req.body;
  const userId = req.user._id;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    res.status(400);
    throw new Error('Note IDs array is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const result = await Note.updateMany(
    {
      _id: { $in: noteIds },
      workspace: workspaceId
    },
    {
      $set: {
        isTrash: true,
        trashedAt: new Date(),
        trashedBy: userId
      }
    }
  );

  res.json({
    status: true,
    message: `Moved ${result.modifiedCount} note(s) to trash`,
    count: result.modifiedCount
  });
});

// @desc    Permanently delete multiple notes
// @route   DELETE /api/notes/batch/delete-permanent
// @access  Private
export const permanentlyDeleteMultipleNotes = asyncHandler(async (req, res) => {
  const { noteIds, workspaceId } = req.body;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    res.status(400);
    throw new Error('Note IDs array is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const result = await Note.deleteMany({
    _id: { $in: noteIds },
    workspace: workspaceId
  });

  res.json({
    status: true,
    message: `Permanently deleted ${result.deletedCount} note(s)`,
    count: result.deletedCount
  });
});

// @desc    Restore a note from trash
// @route   PUT /api/notes/:id/restore
// @access  Private
export const restoreNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;

  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check edit permission
  const canEdit = await note.canEdit(userId);
  if (!canEdit) {
    res.status(403);
    throw new Error('You do not have permission to restore this note');
  }

  // Restore note
  note.isTrash = false;
  note.trashedAt = null;
  note.trashedBy = null;
  await note.save();

  // Re-fetch for decryption
  const restoredNote = await Note.findById(note._id);

  res.json({
    status: true,
    message: 'Note restored successfully',
    data: safeNoteToObject(restoredNote || note)
  });
});

// @desc    Restore multiple notes from trash
// @route   POST /api/notes/batch/restore
// @access  Private
export const restoreMultipleNotes = asyncHandler(async (req, res) => {
  const { noteIds, workspaceId } = req.body;
  const userId = req.user._id;

  if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    res.status(400);
    throw new Error('Note IDs array is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const result = await Note.updateMany(
    {
      _id: { $in: noteIds },
      workspace: workspaceId
    },
    {
      $set: {
        isTrash: false,
        trashedAt: null,
        trashedBy: null
      }
    }
  );

  res.json({
    status: true,
    message: `Restored ${result.modifiedCount} note(s) from trash`,
    count: result.modifiedCount
  });
});

// @desc    AI Smart Format - parse & format unstructured text using Gemini
// @route   POST /api/notes/:id/ai-format
// @access  Private
export const aiFormatNoteContent = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user._id;
  const { text, outputFormat, customInstruction } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Text to format is required');
  }

  // Verify note exists and user has access
  const note = await Note.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const workspace = await Workspace.findById(note.workspace);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString() && m.isActive
  );
  if (!isMember) {
    res.status(403);
    throw new Error('Access denied');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503);
    throw new Error('AI service is not configured. Set GEMINI_API_KEY.');
  }

  // Build the formatting prompt
  const formatInstructions = {
    table: 'Format it as an HTML table with <table>, <thead>, <tbody>, <tr>, <th>, <td> tags. Use proper header row detection. Add style="border-collapse:collapse;width:100%" on the table and style="border:1px solid #d1d5db;padding:8px 12px" on each th and td. Do NOT add background-color or color styles — the app handles theming.',
    json: 'Format it as a pretty-printed JSON array of objects. Wrap the JSON in an HTML <pre><code> block.',
    csv: 'Format it as clean CSV text. Wrap it in an HTML <pre><code> block.',
    list: 'Format it as a clean HTML bulleted list with <ul> and <li> tags, grouping related fields per item.',
    markdown: 'Format it as a clean Markdown table. Wrap it in an HTML <pre><code> block.',
    auto: 'Detect the best output format (table, list, JSON, etc.) and format accordingly. Return the result as clean HTML.',
  };

  const selectedFormat = formatInstructions[outputFormat] || formatInstructions['auto'];

  const prompt = `You are a data formatting assistant. The user has pasted unstructured, messy text data that may contain records/entries in various inconsistent formats like:
- Key-value pairs (name: John age 21)
- Comma-separated values (Rahul,22,Ahmedabad,91)
- JSON-like objects ({"name":"Kunal" "age":20})
- Pipe-delimited (Neha | 23 | Vadodara | 95)
- Space-delimited, tab-delimited, mixed formats
- Any other arbitrary format

Your job:
1. Parse ALL the records/entries from the text, inferring column/field names from context
2. Normalize the data into a consistent structure
3. ${selectedFormat}
${customInstruction ? `4. Additional instruction: ${customInstruction}` : ''}

IMPORTANT RULES:
- Return ONLY the formatted HTML output, no explanations or markdown fences
- If data has inconsistent fields, fill missing ones with empty values
- Detect field names intelligently from the data patterns
- Support any number of records and any number of fields
- Make the output clean, readable, and ready to paste into a rich text editor
- For tables: add inline styles for borders (1px solid #d1d5db) and padding (8px 12px) on th and td elements
- Do NOT add any background-color or color inline styles on th or any elements — the app handles theming via CSS classes
- Keep the HTML clean with just structural inline styles (border, padding, border-collapse)

TEXT TO FORMAT:
${text}

OUTPUT:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AI Format] Gemini API Error:', errorData);
      res.status(502);
      throw new Error('AI service returned an error. Please try again.');
    }

    const data = await response.json();
    let formatted = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if Gemini wraps the output
    formatted = formatted.replace(/^```html\n?/i, '').replace(/\n?```$/i, '');
    formatted = formatted.replace(/^```\n?/, '').replace(/\n?```$/, '');
    formatted = formatted.trim();

    // ── Sanitize HTML for TipTap Table compatibility ──
    // TipTap needs flat: <table><tr><th|td>...</th|td></tr>...</table>
    // 1. Remove thead/tbody/tfoot/colgroup/col/caption wrapper tags
    formatted = formatted.replace(/<\/?(?:thead|tbody|tfoot|caption)[^>]*>/gi, '');
    formatted = formatted.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');
    formatted = formatted.replace(/<col[^>]*\/?>/gi, '');

    // 2. Strip ALL inline styles from table elements
    formatted = formatted.replace(/(<(?:table|tr|th|td)[^>]*?)\s+style\s*=\s*"[^"]*"/gi, '$1');
    formatted = formatted.replace(/(<(?:table|tr|th|td)[^>]*?)\s+style\s*=\s*'[^']*'/gi, '$1');

    // 3. Strip class/bgcolor/width/height/align/valign attributes from table elements
    formatted = formatted.replace(/(<(?:table|tr|th|td)[^>]*?)\s+(?:class|bgcolor|width|height|align|valign|cellpadding|cellspacing|border)\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, '$1');

    // 4. Remove ALL whitespace/newlines between HTML tags (critical for TipTap)
    formatted = formatted.replace(/>\s+</g, '><');

    // 5. Clean up any leftover whitespace in tags
    formatted = formatted.replace(/\s+>/g, '>');
    formatted = formatted.replace(/<\s+/g, '<');

    res.json({
      status: true,
      data: {
        formatted,
        originalText: text,
        outputFormat: outputFormat || 'auto'
      }
    });
  } catch (error) {
    if (!res.headersSent) {
      console.error('[AI Format] Error:', error.message);
      res.status(500);
      throw new Error(error.message || 'Failed to format content with AI');
    }
  }
});
