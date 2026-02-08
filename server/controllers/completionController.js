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
import Completion from '../models/Completion.js';

// @desc    Get completions for a workspace
// @route   GET /api/completions
// @access  Private
const getCompletions = asyncHandler(async (req, res) => {
  const completions = await Completion.find({ workspace: req.query.workspaceId, user: req.user.id });
  res.json(completions);
});

// @desc    Create a new completion
// @route   POST /api/completions
// @access  Private
const createCompletion = asyncHandler(async (req, res) => {
  const { habit, date } = req.body;
  const completion = await Completion.create({
    habit,
    user: req.user.id,
    workspace: req.body.workspaceId,
    date: date || new Date(),
  });
  res.status(201).json(completion);
});

export { getCompletions, createCompletion };
