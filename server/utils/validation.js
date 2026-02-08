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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Validate input data and ensure data integrity

   ⟁  WHY          : Prevent invalid data and security vulnerabilities

   ⟁  WHAT         : Input validation and sanitization utilities

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Data validated. Integrity ensured. Vulnerabilities prevented."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import mongoose from 'mongoose';

export const validateWorkspaceId = (workspaceId) => {
  if (!workspaceId) {
    return {
      isValid: false,
      message: 'Workspace ID is required'
    };
  }

  // Convert string ID to ObjectId if necessary
  try {
    if (typeof workspaceId === 'string') {
      workspaceId = new mongoose.Types.ObjectId(workspaceId);
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return {
        isValid: false,
        message: 'Invalid workspace ID format'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: 'Invalid workspace ID format'
    };
  }

  return {
    isValid: true,
    message: null
  };
};

export const validateTaskData = (taskData) => {
  const errors = [];

  // Required field validation
  if (!taskData.title?.trim()) {
    errors.push('Title is required');
  }

  // Due date validation (now required)
  if (!taskData.dueDate) {
    errors.push('Due date is required');
  } else {
    const date = new Date(taskData.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid due date format');
    }
  }

  // Priority validation
  if (taskData.priority) {
    const priority = taskData.priority.toLowerCase();
    if (!['low', 'medium', 'high'].includes(priority)) {
      errors.push('Priority must be low, medium, or high');
    }
  }

  // Stage validation
  if (taskData.stage) {
    const stage = taskData.stage.toLowerCase();
    if (!['todo', 'in_progress', 'review', 'completed'].includes(stage)) {
      errors.push('Stage must be todo, in_progress, review, or completed');
    }
  }

  // Description validation (optional)
  if (taskData.description && typeof taskData.description !== 'string') {
    errors.push('Description must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSubtaskData = (subtaskData) => {
  const errors = [];

  if (!subtaskData.title?.trim()) {
    errors.push('Subtask title is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateActivityData = (activityData) => {
  const errors = [];

  if (!activityData.content?.trim()) {
    errors.push('Content is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTaskInput = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Invalid priority value');
  }

  if (data.stage && !['todo', 'in_progress', 'review', 'completed'].includes(data.stage)) {
    errors.push('Invalid stage value');
  }

  if (data.dueDate) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid due date format');
    }
  }

  return errors;
};

export const validateSubtaskInput = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push('Subtask title is required');
  }

  return errors;
};

export const validateActivityInput = (data) => {
  const errors = [];

  if (!data.content?.trim()) {
    errors.push('Content is required');
  }

  return errors;
}; 