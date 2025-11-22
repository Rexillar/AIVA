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
