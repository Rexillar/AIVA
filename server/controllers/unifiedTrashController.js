
import asyncHandler from 'express-async-handler';
import Task from '../models/task.js';
import Note from '../models/note.js';
import { Canvas } from '../models/index.js'; // Canvas is exported from index.js? Check import in canvasController.
import Habit from '../models/habit.js';
import { Workspace } from '../models/workspace.js';

// @desc    Get all trashed items (Tasks, Notes, Canvas, Habits)
// @route   GET /api/trash
// @access  Private
export const getTrashItems = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    if (!workspaceId) {
        res.status(400);
        throw new Error('Workspace ID is required');
    }

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

    // 1. Get Trashed Tasks
    const tasks = await Task.find({
        workspace: workspaceId,
        $or: [
            { isTrashed: true },
            { isDeleted: true } // Backward compatibility
        ]
    }).select('title description stage priority isTrashed trashedAt trashedBy deletedAt isDeleted source googleAccount creator');

    // 2. Get Trashed Notes
    const notes = await Note.find({
        workspace: workspaceId,
        isTrashed: true
    }).select('title content type isTrashed trashedAt trashedBy creator tags');

    // 3. Get Trashed Canvases
    const canvases = await Canvas.find({
        workspace: workspaceId, // Canvas model has workspace field? YES.
        $or: [
            { isTrashed: true },
            { isDeleted: true }
        ]
        // Owner check might be needed if canvases are private to owner? 
        // canvasController.js used dummyUserId, but also had workspace field.
        // Assuming workspace based access for now.
    }).select('name data isTrashed trashedAt trashedBy deletedAt isDeleted owner');

    // 4. Get Trashed Habits
    const habits = await Habit.find({
        workspace: workspaceId,
        isTrashed: true
    }).select('title description category frequency isTrashed trashedAt trashedBy user');

    // Format and combine
    const formattedTasks = tasks.map(item => ({
        _id: item._id,
        type: 'task',
        title: item.title,
        description: item.description,
        originalData: item,
        trashedAt: item.trashedAt || item.deletedAt,
        params: { stage: item.stage, priority: item.priority }
    }));

    const formattedNotes = notes.map(item => ({
        _id: item._id,
        type: 'note',
        title: item.title,
        description: item.content ? item.content.substring(0, 100) : '',
        originalData: item,
        trashedAt: item.trashedAt,
        params: { noteType: item.type }
    }));

    const formattedCanvases = canvases.map(item => ({
        _id: item._id,
        type: 'canvas',
        title: item.name,
        description: 'Canvas Board',
        originalData: item,
        trashedAt: item.trashedAt || item.deletedAt
    }));

    const formattedHabits = habits.map(item => ({
        _id: item._id,
        type: 'habit',
        title: item.title,
        description: item.description,
        originalData: item,
        trashedAt: item.trashedAt,
        params: { category: item.category, frequency: item.frequency }
    }));

    const allTrash = [
        ...formattedTasks,
        ...formattedNotes,
        ...formattedCanvases,
        ...formattedHabits
    ].sort((a, b) => new Date(b.trashedAt) - new Date(a.trashedAt));

    res.status(200).json({
        success: true,
        count: allTrash.length,
        data: allTrash
    });
});
