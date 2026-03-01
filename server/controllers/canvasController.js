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
import { Canvas } from '../models/index.js';

// @desc    Create a new canvas
// @route   POST /api/canvas
// @access  Private
const createCanvas = asyncHandler(async (req, res) => {
  const { name, data, workspaceId } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Canvas name is required');
  }

  const canvas = await Canvas.create({
    name,
    data: data || null,
    owner: req.user._id,
    workspace: workspaceId || null
  });

  const populatedCanvas = await Canvas.findById(canvas._id)
    .populate('owner', 'name email')
    .populate('workspace', 'name');

  res.status(201).json({
    success: true,
    data: populatedCanvas
  });
});

// @desc    Get all canvases for the current user
// @route   GET /api/canvas
// @access  Private
const getCanvases = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  let query = { owner: req.user._id, isDeleted: false };

  if (workspaceId) {
    query.workspace = workspaceId;
  }

  const canvases = await Canvas.find(query)
    .populate('owner', 'name email')
    .populate('workspace', 'name')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: canvases.length,
    data: canvases
  });
});

// @desc    Get a single canvas by ID
// @route   GET /api/canvas/:id
// @access  Private
const getCanvasById = asyncHandler(async (req, res) => {
  const canvas = await Canvas.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isDeleted: false
  })
    .populate('owner', 'name email')
    .populate('workspace', 'name');

  if (!canvas) {
    res.status(404);
    throw new Error('Canvas not found');
  }

  res.status(200).json({
    success: true,
    data: canvas
  });
});

// @desc    Update a canvas
// @route   PUT /api/canvas/:id
// @access  Private
const updateCanvas = asyncHandler(async (req, res) => {
  const { name, data } = req.body;

  const canvas = await Canvas.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isDeleted: false
  });

  if (!canvas) {
    res.status(404);
    throw new Error('Canvas not found');
  }

  // Update fields
  if (name !== undefined) canvas.name = name;
  if (data !== undefined) canvas.data = data;

  const updatedCanvas = await canvas.save();

  const populatedCanvas = await Canvas.findById(updatedCanvas._id)
    .populate('owner', 'name email')
    .populate('workspace', 'name');

  res.status(200).json({
    success: true,
    data: populatedCanvas
  });
});

// @desc    Delete a canvas (soft delete)
// @route   DELETE /api/canvas/:id
// @access  Private
const deleteCanvas = asyncHandler(async (req, res) => {
  const canvas = await Canvas.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isDeleted: false
  });

  if (!canvas) {
    res.status(404);
    throw new Error('Canvas not found');
  }

  canvas.isDeleted = true;
  canvas.deletedAt = new Date();
  await canvas.save();

  res.status(200).json({
    success: true,
    message: 'Canvas deleted successfully'
  });
});

// @desc    Permanently delete a canvas
// @route   DELETE /api/canvas/:id/permanent
// @access  Private
const permanentDeleteCanvas = asyncHandler(async (req, res) => {
  const canvas = await Canvas.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!canvas) {
    res.status(404);
    throw new Error('Canvas not found');
  }

  res.status(200).json({
    success: true,
    message: 'Canvas permanently deleted'
  });
});

// @desc    Restore a deleted canvas
// @route   PUT /api/canvas/:id/restore
// @access  Private
const restoreCanvas = asyncHandler(async (req, res) => {
  const canvas = await Canvas.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isDeleted: true
  });

  if (!canvas) {
    res.status(404);
    throw new Error('Canvas not found');
  }

  canvas.isDeleted = false;
  canvas.deletedAt = null;
  await canvas.save();

  const populatedCanvas = await Canvas.findById(canvas._id)
    .populate('owner', 'name email')
    .populate('workspace', 'name');

  res.status(200).json({
    success: true,
    data: populatedCanvas
  });
});

// @desc    Get deleted canvases
// @route   GET /api/canvas/deleted
// @access  Private
const getDeletedCanvases = asyncHandler(async (req, res) => {
  const canvases = await Canvas.find({
    owner: req.user._id,
    isDeleted: true
  })
    .populate('owner', 'name email')
    .populate('workspace', 'name')
    .sort({ deletedAt: -1 });

  res.status(200).json({
    success: true,
    count: canvases.length,
    data: canvases
  });
});

export {
  createCanvas,
  getCanvases,
  getCanvasById,
  updateCanvas,
  deleteCanvas,
  permanentDeleteCanvas,
  restoreCanvas,
  getDeletedCanvases
};