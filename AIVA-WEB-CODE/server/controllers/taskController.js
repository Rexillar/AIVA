/*=================================================================
* Project: AIVA-WEB
* File: taskController.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Task controller handling task creation, updates, assignments,
* and all task-related operations within workspaces.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import asyncHandler from 'express-async-handler';
import Task from '../models/task.js';
import { Workspace } from '../models/workspace.js';
import { createTaskAssignmentNotifications } from '../services/notificationService.js';
import GamificationService from '../services/gamificationService.js';

// Validation helper
const validateTaskInput = (data) => {
  const errors = [];
  
  // Required fields
  if (!data?.title || !data.title.trim()) {
    errors.push("Title is required");
  }
  if (!data?.workspace) {
    errors.push("Workspace ID is required");
  }
  
  // Field validations
  if (data?.priority && !['high', 'medium', 'low'].includes(data.priority)) {
    errors.push("Invalid priority value");
  }
  
  if (data?.stage && !['todo', 'in_progress', 'review', 'completed'].includes(data.stage)) {
    errors.push("Invalid stage value");
  }
  
  if (data?.dueDate) {
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push("Invalid due date format. Use ISO 8601 UTC format (YYYY-MM-DDTHH:mm:ss.sssZ)");
    }
  }
  
  if (data?.assignees !== undefined && !Array.isArray(data.assignees)) {
    errors.push("Assignees must be an array");
  }
  
  if (data?.labels !== undefined && !Array.isArray(data.labels)) {
    errors.push("Labels must be an array");
  }
  
  return errors;
};

// @desc    Upload task attachments
// @route   POST /api/tasks/:id/attachments
// @access  Private
const uploadTaskAttachments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Assuming you are using a file upload middleware like multer
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Process and save the uploaded files
    req.files.forEach(file => {
        task.attachments.push({
            filename: file.originalname,
            path: file.path,
            url: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date(),
            uploadedBy: req.user._id
        });
    });

    await task.save();

    res.status(200).json({ success: true, data: task.attachments });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority, assignees, workspaceId, dueDate } = req.body;

    if (!title || !workspaceId || !dueDate) {
        return res.status(400).json({ 
            success: false, 
            message: 'Title, workspace ID, and due date are required' 
        });
    }

    // Check if workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        return res.status(404).json({ 
            success: false, 
            message: 'Workspace not found' 
        });
    }

    // Create task
    const task = await Task.create({
        title: title.trim(),
        description: description?.trim(),
        workspace: workspaceId,
        creator: req.user._id,
        priority: priority || 'medium',
        stage: 'todo',
        dueDate: new Date(dueDate),
        assignees: assignees || []
    });

    res.status(201).json({ 
        success: true, 
        data: task 
    });
});

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;

    // Get tasks for the workspace
    const tasks = await Task.find({ 
        workspace: workspaceId,
        isTrashed: false 
    });

    // Calculate stats
    const stats = {
        total: tasks.length,
        todo: tasks.filter(task => task.stage === 'todo').length,
        in_progress: tasks.filter(task => task.stage === 'in_progress').length,
        review: tasks.filter(task => task.stage === 'review').length,
        completed: tasks.filter(task => task.stage === 'completed').length,
        overdue: tasks.filter(task => 
            task.dueDate && 
            new Date(task.dueDate) < new Date() && 
            task.stage !== 'completed'
        ).length,
        completionRate: tasks.length > 0 
            ? Math.round((tasks.filter(t => t.stage === 'completed').length / tasks.length) * 100)
            : 0,
        activeTasksCount: tasks.filter(task => task.stage !== 'completed').length
    };

    res.json({
        success: true,
        data: stats
    });
});

// @desc    Create a subtask
// @route   POST /api/tasks/:id/subtask
// @access  Private
const createSubtask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  // Validate input
  if (!title?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Subtask title is required'
    });
  }

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const subtask = {
    title: title.trim(),
    description: description?.trim(),
    createdBy: req.user._id,
    completed: false
  };

  await task.addSubtask(subtask);

  res.status(201).json({
    success: true,
    message: 'Subtask created successfully',
    data: subtask
  });
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { workspaceId, includeStats } = req.query;
    console.log('Getting tasks for workspace:', workspaceId);

    try {
        // Validate workspace access
        if (!workspaceId) {
            res.status(400);
            throw new Error('Workspace ID is required');
        }

        const workspace = await Workspace.findById(workspaceId)
            .populate('members.user', 'name email');
        
        if (!workspace) {
            res.status(404);
            throw new Error('Workspace not found');
        }

        // Check if user is a member of the workspace
        const isMember = workspace.members.some(
            m => m.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            const error = new Error('Not authorized to access this workspace');
            error.status = 403;
            throw error;
        }

        // Get tasks
        const tasks = await Task.find({
            workspace: workspaceId,
            ...(req.query.filter === 'trash' 
                ? { $or: [{ isArchived: true }, { isDeleted: true }] }
                : { isDeleted: false, isArchived: false })
        })
        .populate('creator', 'name email avatar')
        .populate('assignees', 'name email avatar')
        .populate('workspace', 'name type')
        .sort({ createdAt: -1 });

        // Calculate stats if requested
        let stats = null;
        if (includeStats) {
            stats = {
                total: tasks.length,
                todo: tasks.filter(t => t.stage === 'todo').length,
                in_progress: tasks.filter(t => t.stage === 'in_progress').length,
                review: tasks.filter(t => t.stage === 'review').length,
                completed: tasks.filter(t => t.stage === 'completed').length,
                archived: tasks.filter(t => t.isArchived === true).length,
                deleted: tasks.filter(t => t.isDeleted === true).length,
                trashCount: tasks.filter(t => t.isArchived === true || t.isDeleted === true).length
            };
        }

        // Process tasks to ensure consistent format
        const processedTasks = tasks.map(task => ({
            ...task.toObject(),
            id: task._id,
            date: task.dueDate || task.createdAt,
            stage: task.stage || 'todo',
            priority: task.priority || 'medium',
            title: task.title || 'Untitled Task'
        }));

        res.json({
            status: true,
            tasks: processedTasks,
            stats
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(error.status || 500);
        throw new Error(error.message || 'Error fetching tasks');
    }
});

// @desc    Get a task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
        .populate('creator', 'name email avatar')
        .populate('assignees', 'name email avatar')
        .populate('workspace', 'name type');

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.json({
        success: true,
        data: task
    });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { workspaceId } = req.query;

    if (!id || !workspaceId) {
        return res.status(400).json({
            success: false,
            message: 'Task ID and workspace ID are required'
        });
    }

    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    // Permanently delete the task
    await Task.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: 'Task deleted permanently'
    });
});

// @desc    Duplicate a task
// @route   POST /api/tasks/:id/duplicate
// @access  Private
const duplicateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const originalTask = await Task.findById(id);
    if (!originalTask) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Create a new task with the same properties
    const duplicatedTask = new Task({
        title: originalTask.title,
      description: originalTask.description,
        workspace: originalTask.workspace,
        creator: req.user._id,
      priority: originalTask.priority,
      stage: originalTask.stage,
      assignees: originalTask.assignees,
      dueDate: originalTask.dueDate,
      labels: originalTask.labels,
        assets: originalTask.assets,
        activities: originalTask.activities,
        subtasks: originalTask.subtasks,
    });

    await duplicatedTask.save();

    res.status(201).json({ success: true, data: duplicatedTask });
});

// @desc    Move task to trash
// @route   PUT /api/tasks/:id/trash
// @access  Private
const moveToTrash = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { workspaceId } = req.query;

  // Validate required fields
  if (!id || !workspaceId) {
    return res.status(400).json({
      success: false,
      message: 'Task ID and workspace ID are required'
    });
  }

  try {
    // Find the task
    const task = await Task.findOne({
      _id: id,
      workspace: workspaceId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update task status using findByIdAndUpdate to ensure atomic operation
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          isArchived: true,
          isDeleted: true,
          archivedAt: new Date(),
          archivedBy: req.user._id
        }
      },
      { new: true }
    )
    .populate('creator', 'name email avatar')
    .populate('assignees', 'name email avatar')
    .populate('workspace', 'name type')
    .populate('createdBy', 'name email avatar');

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update task'
      });
    }

    res.json({
      success: true,
      message: 'Task moved to trash successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error moving task to trash:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move task to trash',
      error: error.message
    });
  }
});

// @desc    Post activity
// @route   POST /api/tasks/:id/activity
// @access  Private
const postActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const activity = {
        content,
        by: req.user._id,
        createdAt: new Date()
    };

    task.activities.push(activity);
    await task.save();

    res.status(201).json({ success: true, data: activity });
});

// @desc    Restore a task from trash
// @route   POST /api/tasks/:id/restore
// @access  Private
const restoreTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { workspaceId } = req.body;

    if (!id || !workspaceId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Task ID and workspace ID are required' 
        });
    }

    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({ 
            success: false, 
            message: 'Task not found' 
        });
    }

    if (!task.isArchived && !task.isDeleted) {
        return res.status(400).json({ 
            success: false, 
            message: 'Task is not in trash' 
        });
    }

    // Restore the task
    task.isArchived = false;
    task.isDeleted = false;
    task.trashedAt = null;
    task.trashedBy = null;
    
    await task.save();

    // Fetch the updated task with populated fields
    const updatedTask = await Task.findById(id)
        .populate('creator', 'name email avatar')
        .populate('assignees', 'name email avatar')
        .populate('workspace', 'name type');

    res.status(200).json({
        success: true,
        message: 'Task restored successfully',
        data: updatedTask
    });
});

// @desc    Delete a subtask
// @route   DELETE /api/tasks/:id/subtask/:subtaskId
// @access  Private
const deleteSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  try {
    await task.deleteSubtask(subtaskId);
    res.status(200).json({
      success: true,
      message: 'Subtask deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete subtask'
    });
  }
});

// @desc    Delete a task attachment
// @route   DELETE /api/tasks/:taskId/attachments/:attachmentId
// @access  Private
const deleteTaskAttachment = asyncHandler(async (req, res) => {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Find the attachment and remove it
    const attachmentIndex = task.attachments.findIndex(att => att._id.toString() === attachmentId);
    if (attachmentIndex === -1) {
        return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    task.attachments.splice(attachmentIndex, 1);
    await task.save();
    
    res.status(200).json({ success: true, message: 'Attachment deleted successfully' });
});

// @desc    Get tasks for a specific workspace
// @route   GET /api/tasks/workspace/:workspaceId
// @access  Private
const getWorkspaceTasks = asyncHandler(async (req, res) => {
    const { workspaceId, filter, includeArchived, includeDeleted } = req.query;

    // Validate workspace ID
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        return res.status(404).json({ 
            success: false, 
            message: 'Workspace not found' 
        });
    }

    // Check if user is a member of the workspace
    const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) {
        return res.status(403).json({ 
            success: false, 
            message: 'Not authorized to access this workspace' 
        });
    }

    // Set filter condition based on filter parameter
    let filterCondition = {
        workspace: workspaceId
    };

    if (filter === 'trash') {
        // For trash, show tasks that are either archived or deleted
        filterCondition.$or = [
            { isArchived: true },
            { isDeleted: true }
        ];
    } else {
        // For active tasks, exclude archived and deleted
        filterCondition.isArchived = false;
        filterCondition.isDeleted = false;
    }

    // Fetch tasks for the workspace
    const tasks = await Task.find(filterCondition)
        .populate('creator', 'name email avatar')
        .populate('assignees', 'name email avatar')
        .populate('workspace', 'name type')
        .sort({ updatedAt: -1 });

    // Calculate stats
    const stats = {
        total: tasks.length,
        todo: tasks.filter(task => task.stage === 'todo').length,
        in_progress: tasks.filter(task => task.stage === 'in_progress').length,
        review: tasks.filter(task => task.stage === 'review').length,
        completed: tasks.filter(task => task.stage === 'completed').length,
        archived: tasks.filter(task => task.isArchived === true).length,
        deleted: tasks.filter(task => task.isDeleted === true).length,
        overdue: tasks.filter(task => 
            task.dueDate && 
            new Date(task.dueDate) < new Date() && 
            task.stage !== 'completed'
        ).length,
        completionRate: tasks.length > 0 
            ? Math.round((tasks.filter(t => t.stage === 'completed').length / tasks.length) * 100)
            : 0,
        activeTasksCount: tasks.filter(task => task.stage !== 'completed').length,
        trashCount: tasks.filter(task => task.isArchived === true || task.isDeleted === true).length
    };

    res.json({
        success: true,
        tasks,
        stats
    });
});

// @desc    Update a subtask
// @route   PUT /api/tasks/:id/subtask/:subtaskId
// @access  Private
const updateSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;
  const updates = req.body;

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  try {
    const updatedTask = await task.updateSubtask(subtaskId, {
      ...updates,
      updatedAt: new Date()
    });

    // Populate the updated task with necessary fields
    await updatedTask.populate([
      { path: 'creator', select: 'name email avatar' },
      { path: 'assignees', select: 'name email avatar' },
      { path: 'workspace', select: 'name type' }
    ]);

    const updatedSubtask = updatedTask.subtasks.id(subtaskId);
    res.status(200).json({
      success: true,
      message: 'Subtask updated successfully',
      data: {
        subtask: updatedSubtask,
        task: updatedTask
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to update subtask'
    });
  }
});

// @desc    Complete a subtask
// @route   PUT /api/tasks/:id/subtask/:subtaskId/complete
// @access  Private
const completeSubtask = asyncHandler(async (req, res) => {
  const { id, subtaskId } = req.params;

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  try {
    const updatedTask = await task.completeSubtask(subtaskId, req.user._id);

    // Populate the updated task with necessary fields
    await updatedTask.populate([
      { path: 'creator', select: 'name email avatar' },
      { path: 'assignees', select: 'name email avatar' },
      { path: 'workspace', select: 'name type' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Subtask marked as completed',
      data: updatedTask
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to complete subtask'
    });
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check if task is being marked as completed
    const wasCompleted = task.stage === 'completed';
    const willBeCompleted = req.body.stage === 'completed';

    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true }
    )
    .populate('creator', 'name email avatar')
    .populate('assignees', 'name email avatar')
    .populate('workspace', 'name type');

    // Award XP if task was just completed
    let rewards = null;
    if (!wasCompleted && willBeCompleted) {
        // Determine difficulty based on priority or subtasks count
        let difficulty = 'medium';
        if (updatedTask.priority === 'high' || (updatedTask.subtasks && updatedTask.subtasks.length > 3)) {
            difficulty = 'hard';
        } else if (updatedTask.priority === 'low' || (updatedTask.subtasks && updatedTask.subtasks.length === 0)) {
            difficulty = 'easy';
        }

        rewards = await GamificationService.awardTaskCompletionXP(req.user._id, difficulty);

        // Check for new achievements
        const newAchievements = await GamificationService.checkAchievements(req.user._id);
        if (newAchievements.length > 0) {
            rewards.newAchievements = newAchievements;
        }
    }

    res.json({
        success: true,
        data: updatedTask,
        rewards
    });
});

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comment
// @access  Private
const addTaskComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user has access to the workspace
  const workspace = await Workspace.findById(task.workspace);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if user is a member of the workspace
  const isMember = workspace.members.some(member =>
    member.user.toString() === req.user._id.toString()
  );

  if (!isMember && workspace.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to comment on this task');
  }

  // Add the comment
  const newComment = {
    content: comment.trim(),
    author: req.user._id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  task.comments.push(newComment);
  await task.save();

  // Populate the comment author
  await task.populate('comments.author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: task.comments[task.comments.length - 1]
  });
});

// @desc    Get task comments
// @route   GET /api/tasks/:id/comments
// @access  Private
const getTaskComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('comments.author', 'name email avatar')
    .select('comments workspace');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Check if user has access to the workspace
  const workspace = await Workspace.findById(task.workspace);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if user is a member of the workspace
  const isMember = workspace.members.some(member =>
    member.user.toString() === req.user._id.toString()
  );

  if (!isMember && workspace.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view task comments');
  }

  res.status(200).json({
    success: true,
    data: task.comments || []
  });
});

// Export all functions
export {
  createTask,
  getTasks,
  getTask,
  createSubtask,
  deleteSubtask,
  postActivity,
  moveToTrash,
  restoreTask,
  deleteTask,
  duplicateTask,
  getDashboardStats,
  deleteTaskAttachment,
  getWorkspaceTasks,
  uploadTaskAttachments,
  updateSubtask,
  updateTask,
  createTaskAssignmentNotifications,
  completeSubtask,
  addTaskComment,
  getTaskComments
};
