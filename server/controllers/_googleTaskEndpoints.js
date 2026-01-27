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

   ⟁  PURPOSE      : Integrate with Google services and sync data

   ⟁  WHY          : Unified external service integration

   ⟁  WHAT         : Google API integration and data synchronization

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Services integrated. Data synchronized. Ecosystems unified."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Backend endpoints for updating and deleting Google Tasks
*=================================================================*/

// Add these to googleIntegrationController.js

import googleSyncService from '../services/googleSyncService.js';
import ExternalTask from '../models/externalTask.js';

/**
 * @desc    Update external Google Task
 * @route   PUT /api/google/tasks/:workspaceId/:taskId
 * @access  Private
 */
export const updateExternalTask = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    const { title, notes, dueDate, status } = req.body;
    const userId = req.user._id.toString();
    
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find the task
    const task = await ExternalTask.findOne({
      _id: taskId.replace('google-', ''),
      workspaceId
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Update task in database
    task.title = title || task.title;
    task.notes = notes !== undefined ? notes : task.notes;
    task.description = notes !== undefined ? notes : task.description;
    task.dueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate;
    task.status = status || task.status;
    task.syncStatus = 'pending'; // Mark for sync
    task.lastSyncedAt = new Date();
    
    await task.save();
    
    // If bidirectional sync is enabled, push to Google Tasks
    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (integration) {
      const account = integration.getAccountById(task.googleAccountId);
      
      if (account && account.syncSettings.tasks.syncDirection === 'bidirectional') {
        try {
          await googleSyncService.pushTaskUpdate(task, account);
          task.syncStatus = 'synced';
          await task.save();
        } catch (error) {
          console.error('Error pushing to Google:', error);
          task.syncStatus = 'conflict';
          task.syncError = error.message;
          await task.save();
        }
      }
    }
    
    res.json({ 
      success: true,
      task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating external task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * @desc    Delete external Google Task
 * @route   DELETE /api/google/tasks/:workspaceId/:taskId
 * @access  Private
 */
export const deleteExternalTask = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    const userId = req.user._id.toString();
    
    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find the task
    const task = await ExternalTask.findOne({
      _id: taskId.replace('google-', ''),
      workspaceId
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get integration for sync
    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (integration) {
      const account = integration.getAccountById(task.googleAccountId);
      
      // If bidirectional sync, delete from Google Tasks too
      if (account && account.syncSettings.tasks.syncDirection === 'bidirectional') {
        try {
          await googleSyncService.deleteTaskFromGoogle(task, account);
        } catch (error) {
          console.error('Error deleting from Google:', error);
          // Continue with local deletion even if Google delete fails
        }
      }
    }
    
    // Soft delete from database
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.syncStatus = 'deleted';
    await task.save();
    
    res.json({ 
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
