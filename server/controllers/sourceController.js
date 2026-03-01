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

   ⟁  PURPOSE      : Manage sources and citations for research

   ⟁  WHY          : Enable research copilot workflow

   ⟁  WHAT         : CRUD operations for sources

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH

   ⟁  USAGE RULES  : Validate inputs • Check permissions • Log activities

        "Sources managed. Citations tracked. Research enabled."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import asyncHandler from 'express-async-handler';
import Source from '../models/source.js';
import Note from '../models/note.js';
import Task from '../models/task.js';
import { Workspace } from '../models/workspace.js';

// @desc    Create a new source
// @route   POST /api/sources
// @access  Private
export const createSource = asyncHandler(async (req, res) => {
  const { title, url, type, authors, publicationDate, doi, workspace } = req.body;

  if (!title || !workspace) {
    res.status(400);
    throw new Error('Title and workspace are required');
  }

  // Verify user has access to workspace
  const workspaceDoc = await Workspace.findById(workspace);
  if (!workspaceDoc) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const source = await Source.create({
    title,
    url,
    type: type || 'website',
    authors: authors || [],
    publicationDate,
    doi,
    workspace,
    addedBy: req.user._id,
  });

  // Generate citation formats
  source.generateCitations();
  await source.save();

  res.status(201).json({
    success: true,
    data: source,
  });
});

// @desc    Get all sources in a workspace
// @route   GET /api/sources?workspace=:workspaceId&type=:type&search=:query
// @access  Private
export const getSources = asyncHandler(async (req, res) => {
  const { workspace, type, search } = req.query;

  if (!workspace) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const query = { workspace };

  if (type) {
    query.type = type;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const sources = await Source.find(query)
    .populate('addedBy', 'name email')
    .populate('relatedNotes', 'title')
    .populate('relatedTasks', 'title')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: sources.length,
    data: sources,
  });
});

// @desc    Get single source
// @route   GET /api/sources/:id
// @access  Private
export const getSource = asyncHandler(async (req, res) => {
  const source = await Source.findById(req.params.id)
    .populate('addedBy', 'name email')
    .populate('relatedNotes', 'title content')
    .populate('relatedTasks', 'title');

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  res.json({
    success: true,
    data: source,
  });
});

// @desc    Update source
// @route   PATCH /api/sources/:id
// @access  Private
export const updateSource = asyncHandler(async (req, res) => {
  const { title, url, type, authors, publicationDate, doi, tags, credibilityScore } = req.body;

  const source = await Source.findById(req.params.id);

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  // Update fields
  if (title) source.title = title;
  if (url) source.url = url;
  if (type) source.type = type;
  if (authors) source.authors = authors;
  if (publicationDate) source.publicationDate = publicationDate;
  if (doi) source.doi = doi;
  if (tags) source.tags = tags;
  if (credibilityScore) source.credibilityScore = credibilityScore;

  // Regenerate citations if changed
  if (authors || publicationDate) {
    source.generateCitations();
  }

  const updated = await source.save();

  res.json({
    success: true,
    data: updated,
  });
});

// @desc    Delete source
// @route   DELETE /api/sources/:id
// @access  Private
export const deleteSource = asyncHandler(async (req, res) => {
  const source = await Source.findByIdAndDelete(req.params.id);

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  res.json({
    success: true,
    message: 'Source deleted successfully',
  });
});

// @desc    Link source to note
// @route   POST /api/sources/:sourceId/link/note/:noteId
// @access  Private
export const linkSourceToNote = asyncHandler(async (req, res) => {
  const { sourceId, noteId } = req.params;
  const { context, pageNum } = req.body;

  const source = await Source.findById(sourceId);
  const note = await Note.findById(noteId);

  if (!source || !note) {
    res.status(404);
    throw new Error('Source or note not found');
  }

  // Add to source's related notes
  if (!source.relatedNotes.includes(noteId)) {
    source.relatedNotes.push(noteId);
    await source.save();
  }

  // Add source reference to note if not already there
  if (!note.sources) {
    note.sources = [];
  }

  if (!note.sources.some(s => s.sourceId?.toString() === sourceId)) {
    note.sources.push({
      sourceId,
      context,
      pageNum,
    });
    await note.save();
  }

  res.json({
    success: true,
    message: 'Source linked to note',
    data: { note, source },
  });
});

// @desc    Unlink source from note
// @route   DELETE /api/sources/:sourceId/link/note/:noteId
// @access  Private
export const unlinkSourceFromNote = asyncHandler(async (req, res) => {
  const { sourceId, noteId } = req.params;

  const source = await Source.findById(sourceId);
  const note = await Note.findById(noteId);

  if (!source || !note) {
    res.status(404);
    throw new Error('Source or note not found');
  }

  // Remove from source's related notes
  source.relatedNotes = source.relatedNotes.filter(id => id.toString() !== noteId);
  await source.save();

  // Remove from note's sources
  if (note.sources) {
    note.sources = note.sources.filter(s => s.sourceId?.toString() !== sourceId);
    await note.save();
  }

  res.json({
    success: true,
    message: 'Source unlinked from note',
  });
});

// @desc    Get citations for a source in specific format
// @route   GET /api/sources/:id/citation?format=apa
// @access  Private
export const getCitation = asyncHandler(async (req, res) => {
  const { format = 'apa' } = req.query;
  const source = await Source.findById(req.params.id);

  if (!source) {
    res.status(404);
    throw new Error('Source not found');
  }

  const validFormats = ['apa', 'mla', 'chicago', 'harvard'];
  if (!validFormats.includes(format)) {
    res.status(400);
    throw new Error(`Invalid format. Use: ${validFormats.join(', ')}`);
  }

  res.json({
    success: true,
    format,
    citation: source.citations[format],
  });
});

// @desc    Batch import sources
// @route   POST /api/sources/batch/import
// @access  Private
export const batchImportSources = asyncHandler(async (req, res) => {
  const { sources, workspace } = req.body;

  if (!Array.isArray(sources) || sources.length === 0) {
    res.status(400);
    throw new Error('Sources array is required and must not be empty');
  }

  if (!workspace) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const createdSources = [];
  const errors = [];

  for (let i = 0; i < sources.length; i++) {
    try {
      const source = await Source.create({
        ...sources[i],
        workspace,
        addedBy: req.user._id,
      });
      source.generateCitations();
      await source.save();
      createdSources.push(source);
    } catch (error) {
      errors.push({
        index: i,
        error: error.message,
        source: sources[i],
      });
    }
  }

  res.json({
    success: true,
    created: createdSources.length,
    failed: errors.length,
    data: createdSources,
    errors: errors.length > 0 ? errors : undefined,
  });
});
