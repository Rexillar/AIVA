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
import Habit from '../models/habit.js';
import { Workspace } from '../models/workspace.js';
import GamificationService from '../services/gamificationService.js';

// Validation helper
const validateHabitInput = (data) => {
  const errors = [];

  if (!data?.title || !data.title.trim()) {
    errors.push("Title is required");
  }

  if (!data?.workspace) {
    errors.push("Workspace ID is required");
  }

  if (data?.frequency && !['daily', 'weekly', 'custom'].includes(data.frequency)) {
    errors.push("Invalid frequency value");
  }

  if (data?.category && !['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'social', 'finance', 'creative', 'other'].includes(data.category)) {
    errors.push("Invalid category value");
  }

  if (data?.visibility && !['private', 'public'].includes(data.visibility)) {
    errors.push("Invalid visibility value");
  }

  return errors;
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = asyncHandler(async (req, res) => {
  const validationErrors = validateHabitInput(req.body);

  if (validationErrors.length > 0) {
    res.status(400);
    throw new Error(validationErrors.join(', '));
  }

  const { workspace: workspaceId, ...habitData } = req.body;

  // Verify workspace exists and user has access
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to create habits in this workspace');
  }

  const habit = await Habit.create({
    ...habitData,
    workspace: workspaceId,
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Habit created successfully',
    data: habit
  });
});

// @desc    Get all habits for a workspace
// @route   GET /api/habits/workspace/:workspaceId
// @access  Private
export const getWorkspaceHabits = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { isArchived = false, isActive, category, visibility } = req.query;

  // Verify workspace access
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this workspace');
  }

  const query = {
    workspace: workspaceId,
    isArchived: isArchived === 'true',
    isTrashed: false, // Default to not showing trashed items
  };

  // Filter by visibility
  if (visibility) {
    if (visibility === 'private') {
      // Show only user's private habits
      query.visibility = 'private';
      query.user = req.user._id;
    } else if (visibility === 'public') {
      // Show only public/team habits
      query.visibility = 'public';
    }
  } else {
    // Show both: user's private habits + all public habits
    query.$or = [
      { visibility: 'public' },
      { visibility: 'private', user: req.user._id }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (category) {
    query.category = category;
  }

  const habits = await Habit.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name email avatar');

  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits
  });
});

// @desc    Get user's habits
// @route   GET /api/habits/user
// @access  Private
export const getUserHabits = asyncHandler(async (req, res) => {
  const { workspaceId, isArchived = false } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const habits = await Habit.find({
    user: req.user._id,
    workspace: workspaceId,
    isArchived: isArchived === 'true',
    isTrashed: false
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits
  });
});

// @desc    Get habits due today
// @route   GET /api/habits/due-today
// @access  Private
export const getHabitsDueToday = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const habits = await Habit.getDueToday(req.user._id, workspaceId);

  res.status(200).json({
    success: true,
    count: habits.length,
    data: habits
  });
});

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
export const getHabitById = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('workspace', 'name');

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify access
  const workspace = await Workspace.findById(habit.workspace._id);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  res.status(200).json({
    success: true,
    data: habit
  });
});

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Only the habit creator can update
  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this habit');
  }

  const updatedHabit = await Habit.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Habit updated successfully',
    data: updatedHabit
  });
});

// @desc    Toggle habit completion for a date
// @route   POST /api/habits/:id/complete
// @access  Private
export const toggleHabitCompletion = asyncHandler(async (req, res) => {
  const { date, note } = req.body;

  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify workspace access
  const workspace = await Workspace.findById(habit.workspace);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  const completionDate = date ? new Date(date) : new Date();

  // Check if this completion is for today and if habit was not completed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = completionDate >= today;
  const wasCompletedToday = habit.isCompletedToday;

  habit.toggleCompletion(completionDate, note);

  await habit.save();

  // Award XP if habit was just completed today
  let rewards = null;
  if (isToday && !wasCompletedToday && habit.isCompletedToday) {
    // Calculate streak multiplier (1 + streak bonus)
    let streakMultiplier = 1;
    if (habit.currentStreak >= 7) streakMultiplier = 2;
    else if (habit.currentStreak >= 30) streakMultiplier = 3;
    else if (habit.currentStreak >= 3) streakMultiplier = 1.5;

    rewards = await GamificationService.awardHabitCompletionXP(req.user._id, streakMultiplier);

    // Check for new achievements
    const newAchievements = await GamificationService.checkAchievements(req.user._id);
    if (newAchievements.length > 0) {
      rewards.newAchievements = newAchievements;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Habit completion toggled',
    data: habit,
    rewards
  });
});

// @desc    Get habit statistics
// @route   GET /api/habits/:id/statistics
// @access  Private
export const getHabitStatistics = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify workspace access
  const workspace = await Workspace.findById(habit.workspace);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  // Calculate additional statistics
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const recentCompletions = habit.completions.filter(c =>
    c.completed && new Date(c.date) >= last30Days
  );

  const completionsByDay = {};
  recentCompletions.forEach(c => {
    const dayName = new Date(c.date).toLocaleDateString('en-US', { weekday: 'long' });
    completionsByDay[dayName] = (completionsByDay[dayName] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      ...habit.statistics.toObject(),
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      last30DaysCount: recentCompletions.length,
      completionsByDay,
      isCompletedToday: habit.isCompletedToday
    }
  });
});

// @desc    Get user habit analytics
// @route   GET /api/habits/analytics/user
// @access  Private
export const getUserHabitAnalytics = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const stats = await Habit.getUserStatistics(req.user._id, workspaceId);

  const habits = await Habit.find({
    user: req.user._id,
    workspace: workspaceId,
    isArchived: false
  });

  // Calculate completion rate for last 7 days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const dailyHabits = habits.filter(h => h.frequency === 'daily' && h.isActive && !h.isPaused);
  const expectedCompletions = dailyHabits.length * 7;

  const actualCompletions = dailyHabits.reduce((sum, habit) => {
    const recentCompletions = habit.completions.filter(c =>
      c.completed && new Date(c.date) >= last7Days
    );
    return sum + recentCompletions.length;
  }, 0);

  const weeklyCompletionRate = expectedCompletions > 0
    ? Math.round((actualCompletions / expectedCompletions) * 100)
    : 0;

  // Category breakdown
  const categoryBreakdown = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      weeklyCompletionRate,
      categoryBreakdown,
      habitsCompletedToday: habits.filter(h => h.isCompletedToday).length
    }
  });
});

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this habit');
  }

  // Soft delete
  habit.isTrashed = true;
  habit.trashedAt = new Date();
  habit.trashedBy = req.user._id;

  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit moved to trash successfully'
  });
});

// @desc    Restore habit from trash
// @route   PUT /api/habits/:id/restore
// @access  Private
export const restoreHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Check if user is the habit owner
  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to restore this habit');
  }

  habit.isTrashed = false;
  habit.trashedAt = null;
  habit.trashedBy = null;

  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit restored successfully',
    data: habit
  });
});

// @desc    Permanently delete habit
// @route   DELETE /api/habits/:id/permanent
// @access  Private
export const permanentlyDeleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to permanently delete this habit');
  }

  await habit.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Habit permanently deleted'
  });
});

// @desc    Add note to habit
// @route   POST /api/habits/:id/notes
// @access  Private
export const addHabitNote = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error('Note content is required');
  }

  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to add notes to this habit');
  }

  habit.notes.push({ content });
  await habit.save();

  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: habit
  });
});

// @desc    Delete note from habit
// @route   DELETE /api/habits/:id/notes/:noteId
// @access  Private
export const deleteHabitNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;

  const habit = await Habit.findById(id).populate('workspace');

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  const note = habit.notes.id(noteId);

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Check if user is the habit owner or workspace owner
  const isHabitOwner = habit.user.toString() === req.user._id.toString();
  const isWorkspaceOwner = habit.workspace.owner.toString() === req.user._id.toString();

  if (!isHabitOwner && !isWorkspaceOwner) {
    res.status(403);
    throw new Error('Not authorized to delete this note');
  }

  // Remove the note using pull
  habit.notes.pull(noteId);
  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
    data: habit
  });
});

// @desc    Get habit completion history
// @route   GET /api/habits/:id/history
// @access  Private
export const getHabitHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify workspace access
  const workspace = await Workspace.findById(habit.workspace);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  let completions = habit.completions;

  if (startDate || endDate) {
    completions = completions.filter(c => {
      const date = new Date(c.date);
      if (startDate && date < new Date(startDate)) return false;
      if (endDate && date > new Date(endDate)) return false;
      return true;
    });
  }

  res.status(200).json({
    success: true,
    count: completions.length,
    data: completions.sort((a, b) => new Date(b.date) - new Date(a.date))
  });
});

// @desc    Get habits for a workspace
// @route   GET /api/habits
// @access  Private
export const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ workspace: req.query.workspaceId, user: req.user._id });
  res.json(habits);
});

// @desc    Complete today's habit
// @route   POST /api/habits/:id/complete-today
// @access  Private
export const completeTodayHabit = asyncHandler(async (req, res) => {
  const { note } = req.body;

  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify workspace access
  const workspace = await Workspace.findById(habit.workspace);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  habit.toggleCompletion(today, note);
  await habit.save();

  // Award XP if habit was just completed
  if (habit.isCompletedToday) {
    try {
      await GamificationService.awardXP(
        req.user._id,
        'habit_completed',
        { habitId: habit._id, streak: habit.currentStreak }
      );
    } catch (error) {
      console.error('Gamification error:', error);
    }
  }

  res.status(200).json({
    success: true,
    message: habit.isCompletedToday ? 'Habit completed for today' : 'Habit completion removed',
    data: habit
  });
});

// @desc    Complete multiple habits today
// @route   POST /api/habits/batch/complete-today
// @access  Private
export const completeMultipleHabitsToday = asyncHandler(async (req, res) => {
  const { habitIds, workspaceId } = req.body;

  if (!habitIds || !Array.isArray(habitIds) || habitIds.length === 0) {
    res.status(400);
    throw new Error('Habit IDs array is required');
  }

  if (!workspaceId) {
    res.status(400);
    throw new Error('Workspace ID is required');
  }

  const habits = await Habit.find({
    _id: { $in: habitIds },
    workspace: workspaceId
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedHabits = [];
  for (const habit of habits) {
    if (!habit.isCompletedToday) {
      habit.toggleCompletion(today);
      await habit.save();
      completedHabits.push(habit);

      // Award XP
      try {
        await GamificationService.awardXP(
          req.user._id,
          'habit_completed',
          { habitId: habit._id, streak: habit.currentStreak }
        );
      } catch (error) {
        console.error('Gamification error:', error);
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `Completed ${completedHabits.length} habit(s) for today`,
    count: completedHabits.length,
    data: completedHabits
  });
});

// @desc    Undo habit completion for today
// @route   POST /api/habits/:id/undo-completion
// @access  Private
export const undoHabitCompletion = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Verify workspace access
  const workspace = await Workspace.findById(habit.workspace);
  const isMember = workspace.members.some(
    member => member.user.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to access this habit');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Remove today's completion
  habit.completions = habit.completions.filter(c => {
    const cDate = new Date(c.date);
    cDate.setHours(0, 0, 0, 0);
    return cDate.getTime() !== today.getTime();
  });

  habit.recalculateStreaks();
  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit completion undone for today',
    data: habit
  });
});

// @desc    Pause habit
// @route   PUT /api/habits/:id/pause
// @access  Private
export const pauseHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pause this habit');
  }

  habit.isActive = false;
  habit.pausedAt = new Date();
  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit paused successfully',
    data: habit
  });
});

// @desc    Resume habit
// @route   PUT /api/habits/:id/resume
// @access  Private
export const resumeHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to resume this habit');
  }

  habit.isActive = true;
  habit.pausedAt = null;
  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit resumed successfully',
    data: habit
  });
});

// @desc    Pause multiple habits
// @route   POST /api/habits/batch/pause
// @access  Private
export const pauseMultipleHabits = asyncHandler(async (req, res) => {
  const { habitIds, workspaceId } = req.body;

  if (!habitIds || !Array.isArray(habitIds) || habitIds.length === 0) {
    res.status(400);
    throw new Error('Habit IDs array is required');
  }

  const result = await Habit.updateMany(
    {
      _id: { $in: habitIds },
      workspace: workspaceId,
      user: req.user._id
    },
    {
      $set: { isActive: false, pausedAt: new Date() }
    }
  );

  res.status(200).json({
    success: true,
    message: `Paused ${result.modifiedCount} habit(s)`,
    count: result.modifiedCount
  });
});

// @desc    Archive habit
// @route   PUT /api/habits/:id/archive
// @access  Private
export const archiveHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (habit.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to archive this habit');
  }

  habit.isArchived = true;
  habit.archivedAt = new Date();
  await habit.save();

  res.status(200).json({
    success: true,
    message: 'Habit archived successfully',
    data: habit
  });
});

// @desc    Archive multiple habits
// @route   POST /api/habits/batch/archive
// @access  Private
export const archiveMultipleHabits = asyncHandler(async (req, res) => {
  const { habitIds, workspaceId } = req.body;

  if (!habitIds || !Array.isArray(habitIds) || habitIds.length === 0) {
    res.status(400);
    throw new Error('Habit IDs array is required');
  }

  const result = await Habit.updateMany(
    {
      _id: { $in: habitIds },
      workspace: workspaceId,
      user: req.user._id
    },
    {
      $set: { isArchived: true, archivedAt: new Date() }
    }
  );

  res.status(200).json({
    success: true,
    message: `Archived ${result.modifiedCount} habit(s)`,
    count: result.modifiedCount
  });
});

// @desc    Delete multiple habits
// @route   POST /api/habits/batch/delete
// @access  Private
export const deleteMultipleHabits = asyncHandler(async (req, res) => {
  const { habitIds, workspaceId } = req.body;

  if (!habitIds || !Array.isArray(habitIds) || habitIds.length === 0) {
    res.status(400);
    throw new Error('Habit IDs array is required');
  }

  const result = await Habit.deleteMany({
    _id: { $in: habitIds },
    workspace: workspaceId,
    user: req.user._id
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} habit(s)`,
    count: result.deletedCount
  });
});
