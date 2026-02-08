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

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : UI COMPONENTS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Follow design system • Handle props • Manage state

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const GoogleTaskDialog = ({ isOpen, onClose, task, workspaceId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'needsAction'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncWarning, setShowSyncWarning] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || task.notes || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'needsAction'
      });
    }
  }, [task]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const googleTaskId = task?.googleTaskId || task?._id?.toString()?.replace(/^google-/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        notes: formData.description.trim(),
        dueDate: formData.dueDate ? formData.dueDate : null,
        status: formData.status,
        googleAccountId: task.googleAccountId,
        googleTaskListId: task.googleTaskListId
      };

      console.log('[GoogleTaskDialog] Updating task:', updateData);

      // Update task directly in Google Tasks
      const response = await axios.put(
        `${API_URL}/google/tasks/${workspaceId}/${googleTaskId}`,
        updateData,
        { headers: getAuthHeader() }
      );

      console.log('[GoogleTaskDialog] Update response:', response.data);

      toast.success('Task updated successfully in Google Tasks');

      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('[GoogleTaskDialog] Error updating Google task:', error);
      console.error('[GoogleTaskDialog] Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await axios.post(
        `${API_URL}/google/sync/${workspaceId}/${task.googleAccountId}`,
        { syncType: 'tasks' },
        { headers: getAuthHeader() }
      );

      toast.success('Synced with Google Tasks');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/google/tasks/${workspaceId}/${googleTaskId}`,
        {
          status: 'completed',
          googleAccountId: task.googleAccountId,
          googleTaskListId: task.googleTaskListId
        },
        { headers: getAuthHeader() }
      );

      toast.success('Task marked as completed');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceSync = async (preferredVersion) => {
    setIsSubmitting(true);
    try {
      if (preferredVersion === 'google' && task.conflictData) {
        // Update form with Google version
        const googleData = task.conflictData.googleVersion;
        setFormData({
          title: googleData.title,
          description: googleData.notes || '',
          dueDate: googleData.due ? new Date(googleData.due).toISOString().split('T')[0] : '',
          status: googleData.status
        });

        // Update task with Google version
        await axios.put(
          `${API_URL}/google/tasks/${workspaceId}/${googleTaskId}`,
          {
            title: googleData.title,
            notes: googleData.notes || '',
            dueDate: googleData.due,
            status: googleData.status,
            googleAccountId: task.googleAccountId,
            googleTaskListId: task.googleTaskListId,
            forceSync: true
          },
          { headers: getAuthHeader() }
        );
      } else {
        // Force push AIVA version to Google
        await axios.put(
          `${API_URL}/google/tasks/${workspaceId}/${googleTaskId}`,
          {
            title: formData.title,
            notes: formData.description,
            dueDate: formData.dueDate,
            status: formData.status,
            googleAccountId: task.googleAccountId,
            googleTaskListId: task.googleTaskListId,
            forceSync: true
          },
          { headers: getAuthHeader() }
        );
      }

      toast.success('Conflict resolved and synced');
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve conflict');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this Google Task? It will be removed from Google Tasks.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.delete(
        `${API_URL}/google/tasks/${workspaceId}/${googleTaskId}?googleAccountId=${task.googleAccountId}&googleTaskListId=${task.googleTaskListId}`,
        { headers: getAuthHeader() }
      );

      toast.success('Task deleted from Google Tasks');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Google Task
                      </span>
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                      Edit Task
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Sync Warning */}
                {task?.syncStatus === 'conflict' && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Sync Conflict Detected
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          This task was modified in Google Tasks. Review changes below:
                        </p>

                        {task.conflictData && (
                          <div className="mt-3 space-y-2">
                            {task.conflictData.googleVersion.title !== task.conflictData.aivaVersion.title && (
                              <div className="text-xs">
                                <div className="font-medium text-yellow-800 dark:text-yellow-200">Title:</div>
                                <div className="text-red-600">Google: &quot;{task.conflictData.googleVersion.title}&quot;</div>
                                <div className="text-green-600">AIVA: &quot;{task.conflictData.aivaVersion.title}&quot;</div>
                              </div>
                            )}
                            {task.conflictData.googleVersion.status !== task.conflictData.aivaVersion.status && (
                              <div className="text-xs">
                                <div className="font-medium text-yellow-800 dark:text-yellow-200">Status:</div>
                                <div className="text-red-600">Google: {task.conflictData.googleVersion.status}</div>
                                <div className="text-green-600">AIVA: {task.conflictData.aivaVersion.status}</div>
                              </div>
                            )}
                            {task.conflictData.googleVersion.due !== task.conflictData.aivaVersion.due && (
                              <div className="text-xs">
                                <div className="font-medium text-yellow-800 dark:text-yellow-200">Due Date:</div>
                                <div className="text-red-600">Google: {task.conflictData.googleVersion.due ? new Date(task.conflictData.googleVersion.due).toLocaleDateString() : 'None'}</div>
                                <div className="text-green-600">AIVA: {task.conflictData.aivaVersion.due ? new Date(task.conflictData.aivaVersion.due).toLocaleDateString() : 'None'}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => handleForceSync('aiva')}
                            className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200"
                          >
                            Use AIVA Version
                          </button>
                          <button
                            type="button"
                            onClick={() => handleForceSync('google')}
                            className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200"
                          >
                            Use Google Version
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Task title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Add notes..."
                    />
                  </div>

                  {/* Due Date and Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="needsAction">To Do</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Task Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">List:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task?.googleTaskListName || 'My Tasks'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Synced:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task?.lastSyncedAt ? new Date(task.lastSyncedAt).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sync Status:</span>
                      <span className={`font-medium ${task?.syncStatus === 'synced' ? 'text-green-600 dark:text-green-400' :
                        task?.syncStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                        {task?.syncStatus || 'unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSyncNow}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50"
                      >
                        <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>

                      {formData.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={handleComplete}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                          Complete
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                      >
                        <CloudArrowUpIcon className="h-4 w-4" />
                        {isSubmitting ? 'Saving...' : 'Save & Sync'}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GoogleTaskDialog;
