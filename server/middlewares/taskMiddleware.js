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
   ⟁  DOMAIN       : MIDDLEWARE

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import Task from '../models/task.js';
import { Workspace } from '../models/workspace.js';
import mongoose from 'mongoose';

// Lazy-load ExternalTask to avoid circular dependency issues
const getExternalTaskModel = async () => {
  const { default: ExternalTask } = await import('../models/externalTask.js');
  return ExternalTask;
};

// Get task by ID and check user has access
export const getTaskById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Skip task lookup for bulk operations
  if (id === 'all') {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      res.status(400);
      throw new Error('Workspace ID is required for bulk operations');
    }

    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
      }

      // Check if user is workspace member
      const isMember = workspace.members.some(
        m => m.user.toString() === req.user._id.toString() && m.isActive
      );
      if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to access this workspace');
      }

      req.workspace = workspace;
      next();
      return;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        res.status(400);
        throw new Error('Invalid workspace ID format');
      }
      throw error;
    }
  }

  // For single task operations
  try {
    const task = await Task.findById(id)
      .populate('creator', 'name email')
      .populate('assignees', 'name email')
      .populate('workspace', 'name')
      .populate({
        path: 'activities.by',
        select: 'name email'
      });

    if (!task) {
      // Check if this is a Google ExternalTask (has same MongoDB ObjectID format)
      try {
        const ExternalTask = await getExternalTaskModel();
        console.log('[getTaskById] Task not found in Task collection, checking ExternalTask for id:', id);
        const externalTask = await ExternalTask.findById(id);
        console.log('[getTaskById] ExternalTask.findById result:', externalTask ? `found (isDeleted=${externalTask.isDeleted})` : 'null');

        if (externalTask) {
          // Resolve the workspace from ExternalTask's workspaceId field
          const workspace = await Workspace.findById(externalTask.workspaceId);
          if (!workspace) {
            res.status(404);
            throw new Error('Associated workspace not found');
          }

          // Check if user is workspace member
          const isMember = workspace.members.some(
            m => m.user.toString() === req.user._id.toString() && m.isActive
          );
          if (!isMember) {
            res.status(403);
            throw new Error('Not authorized to access this task');
          }

          // Mark as external task so controllers can handle it differently
          req.externalTask = externalTask;
          req.isExternalTask = true;
          req.workspace = workspace;
          req.task = externalTask; // Set req.task for consistency with regular tasks
          return next();
        }
      } catch (externalErr) {
        // Only swallow CastErrors (invalid ID format on ExternalTask lookup)
        // Re-throw any other errors (DB failures, auth errors, etc.)
        console.log('[getTaskById] ExternalTask lookup error:', externalErr.message);
        if (!(externalErr instanceof mongoose.Error.CastError)) {
          throw externalErr;
        }
      }

      res.status(404);
      throw new Error('Task not found');
    }

    // Get workspace to check permissions
    // Handle both regular tasks (workspace) and external tasks (workspaceId)
    const workspaceId = task.workspace || task.workspaceId;
    if (!workspaceId) {
      res.status(400);
      throw new Error('Task does not have a valid workspace reference');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Associated workspace not found');
    }

    // Check if user is workspace member
    const isMember = workspace.members.some(
      m => m.user.toString() === req.user._id.toString() && m.isActive
    );
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to access this task');
    }

    if (workspace.type === 'private') {
      // Check if user is a member of the private workspace
    } else {
      // Public workspace logic
    }

    req.task = task;
    req.workspace = workspace;
    next();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400);
      throw new Error('Invalid task ID format');
    }
    throw error;
  }
});

// Check if user can modify task
export const canModifyTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { workspaceId } = req.query;

  // For bulk operations, check workspace membership
  if (id === 'all') {
    if (!workspaceId) {
      res.status(400);
      throw new Error('Workspace ID is required for bulk operations');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const isMember = workspace.members.some(member =>
      member.user.toString() === req.user._id.toString() && member.isActive
    );

    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized to modify tasks in this workspace');
    }

    return next();
  }

  // For single task operations
  // Handle both regular tasks and Google external tasks
  const task = req.task || req.externalTask;
  
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  
  // Handle both regular tasks (workspace) and external tasks (workspaceId)
  const taskWorkspaceId = task.workspace || task.workspaceId;

  if (!taskWorkspaceId) {
    res.status(400);
    throw new Error('Task does not have a valid workspace reference');
  }

  const workspace = await Workspace.findById(taskWorkspaceId);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(member =>
    member.user.toString() === req.user._id.toString() && member.isActive
  );

  if (!isMember) {
    res.status(403);
    throw new Error('Not authorized to modify this task');
  }

  if (workspace.type === 'private') {
    // Check if user is a member of the private workspace
  } else {
    // Public workspace logic
  }

  next();
}); 