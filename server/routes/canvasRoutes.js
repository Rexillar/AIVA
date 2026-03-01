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
   ⟁  DOMAIN       : API ROUTES

   ⟁  PURPOSE      : Define API endpoints and route handlers

   ⟁  WHY          : Organized API structure and request routing

   ⟁  WHAT         : Express route definitions and middleware application

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. API structured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import rateLimit from 'express-rate-limit';
import {
  createCanvas,
  getCanvases,
  getCanvasById,
  updateCanvas,
  deleteCanvas,
  permanentDeleteCanvas,
  restoreCanvas,
  getDeletedCanvases
} from '../controllers/canvasController.js';

const router = express.Router();

// Rate limiting for canvas operations
const canvasLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many canvas operations, please try again later.'
});

// Apply rate limiting to all routes
router.use(canvasLimiter);

// All routes require authentication
router.use(protect);

// @route   POST /api/canvas
// @desc    Create a new canvas
// @access  Private
router.post('/', asyncHandler(createCanvas));

// @route   GET /api/canvas
// @desc    Get all canvases for the current user
// @access  Private
router.get('/', asyncHandler(getCanvases));

// @route   GET /api/canvas/deleted
// @desc    Get deleted canvases for the current user
// @access  Private
router.get('/deleted', asyncHandler(getDeletedCanvases));

// @route   GET /api/canvas/:id
// @desc    Get a single canvas by ID
// @access  Private
router.get('/:id', asyncHandler(getCanvasById));

// @route   PUT /api/canvas/:id
// @desc    Update a canvas
// @access  Private
router.put('/:id', asyncHandler(updateCanvas));

// @route   PUT /api/canvas/:id/restore
// @desc    Restore a deleted canvas
// @access  Private
router.put('/:id/restore', asyncHandler(restoreCanvas));

// @route   DELETE /api/canvas/:id
// @desc    Soft delete a canvas
// @access  Private
router.delete('/:id', asyncHandler(deleteCanvas));

// @route   DELETE /api/canvas/:id/permanent
// @desc    Permanently delete a canvas
// @access  Private
router.delete('/:id/permanent', asyncHandler(permanentDeleteCanvas));

export default router;