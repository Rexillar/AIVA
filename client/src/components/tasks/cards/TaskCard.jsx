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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import {
  FaRegClock,
  FaUserCircle,
  FaEllipsisV,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaRegCommentDots,
  FaPaperclip,
} from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  useDuplicateTaskMutation,
  useMoveToTrashMutation,
  useUpdateTaskMutation,
} from "../../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import TaskDialog from "../dialogs/TaskDialog";
import GoogleTaskDialog from "../dialogs/GoogleTaskDialog";
import SubtaskDialog from "../dialogs/SubtaskDialog";
import { priorityColors, stageColors } from "../../../utils/constants";

const TaskCard = ({ task, onUpdate, onMoveToTrash, isAdmin = false, isSubtask = false }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGoogleEditDialogOpen, setIsGoogleEditDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [duplicateTask] = useDuplicateTaskMutation();
  const [moveToTrash] = useMoveToTrashMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Extract workspace ID from task
  const workspaceId = (
    task.workspace?._id ||
    task.workspace ||
    task.workspaceId
  )?.toString();


  const formatDate = (date) => {
    if (!date) return "No due date";
    const formattedDate = format(new Date(date), "MMM dd, yyyy");
    const relativeDate = formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
    return { formattedDate, relativeDate };
  };

  const handleDuplicate = async () => {
    try {
      await duplicateTask(task._id).unwrap();
      toast.success("Task duplicated successfully");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to duplicate task");
    }
    setIsMenuOpen(false);
  };

  const handleMoveToTrash = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const taskId = task._id.toString();

      if (!workspaceId) {
        throw new Error("Workspace ID is missing");
      }

      // Check if this is a Google Task (has googleTaskId or source property)
      // But also verify it has the required Google account information
      const isGoogleTask = task.isGoogleTask || task.source === 'google-tasks' || task.googleTaskId;
      const hasGoogleCredentials = task.googleAccountId && task.googleTaskListId;

      if (isGoogleTask && hasGoogleCredentials) {
        // Handle Google Task deletion using the google tasks API endpoint
        // Extract the actual task ID (remove 'google-' prefix if present)
        const actualTaskId = taskId.replace('google-', '');

        // Get required parameters
        const googleAccountId = task.googleAccountId;
        const googleTaskListId = task.googleTaskListId;

        console.log('[TaskCard] Deleting Google task with params:', {
          taskId: actualTaskId,
          googleAccountId,
          googleTaskListId
        });

        // Build query parameters for Google Task deletion
        const queryParams = new URLSearchParams({
          googleAccountId,
          googleTaskListId
        });

        const response = await fetch(`/api/google/tasks/${workspaceId}/${actualTaskId}?${queryParams}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete Google Task');
        }

        toast.success("Google Task and any subtasks deleted successfully");
      } else if (isGoogleTask && !hasGoogleCredentials) {
        // Task is marked as Google task but missing credentials - treat as regular AIVA task
        console.warn('[TaskCard] Task marked as Google task but missing credentials, deleting as regular task:', {
          taskId,
          hasGoogleAccountId: !!task.googleAccountId,
          hasGoogleTaskListId: !!task.googleTaskListId
        });

        await moveToTrash({
          taskId,
          workspaceId,
        }).unwrap();

        toast.success("Task moved to trash");
      } else {
        // Handle regular AIVA task deletion
        await moveToTrash({
          taskId,
          workspaceId,
        }).unwrap();

        toast.success("Task moved to trash");
      }

      setIsMenuOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Move to trash error:', error);
      toast.error(error?.message || error?.data?.message || "Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task?._id || (!task?.workspace && !task?.workspace?._id)) {
      toast.error("Invalid task or workspace ID");
      return;
    }

    const workspaceId = task.workspace?._id || task.workspace;

    try {
      await updateTask({
        taskId: task._id,
        workspaceId: workspaceId,
        updates: { stage: newStatus },
      }).unwrap();

      toast.success(`Task status updated to ${newStatus.replace("_", " ")}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update task status");
    }
  };

  const handleNavigateToTask = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const workspaceId = task.workspace?._id || task.workspace;
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/task/${task._id}`);
    } else {
      toast.error("Invalid workspace ID");
    }
  };

  if (!task) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
      </div>
    );
  }

  const { formattedDate, relativeDate } = formatDate(task.dueDate);

  // Calculate subtask stats
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((st) => st.completed || st.status === "completed")
      .length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full border ${task.isGoogleTask ? 'border-blue-400 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700'} hover:border-blue-500 dark:hover:border-blue-400`}>
      {/* Card Header */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          {/* Priority and Stage Badges */}
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            {task.isGoogleTask && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </span>
            )}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority]?.bg || "bg-gray-100 dark:bg-gray-700"} ${priorityColors[task.priority]?.text || "text-gray-800 dark:text-gray-300"}`}
            >
              {task.priority}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${stageColors[task.stage]?.bg || "bg-gray-100 dark:bg-gray-700"} ${stageColors[task.stage]?.text || "text-gray-800 dark:text-gray-300"}`}
            >
              {task.stage?.replace("_", " ")}
            </span>
          </div>

          {/* Menu Button */}
          <Menu as="div" className="relative">
            <Menu.Button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <FaEllipsisV className="w-4 h-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                          } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (task.isGoogleTask) {
                            setIsGoogleEditDialogOpen(true);
                          } else {
                            setIsEditDialogOpen(true);
                          }
                        }}
                      >
                        <FaEdit className="mr-3 w-4 h-4" />
                        Edit Task
                      </button>
                    )}
                  </Menu.Item>
                  {!task.isGoogleTask && (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDuplicate();
                          }}
                        >
                          <FaEye className="mr-3 w-4 h-4" />
                          Duplicate
                        </button>
                      )}
                    </Menu.Item>
                  )}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${active ? "bg-gray-100 dark:bg-gray-700" : ""
                          } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                        onClick={handleMoveToTrash}
                        disabled={isLoading}
                      >
                        <FaTrash className="mr-3 w-4 h-4" />
                        {isLoading ? "Deleting..." : (task.isGoogleTask ? "Delete" : "Move to Trash")}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Title and Description */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavigateToTask(e);
          }}
          className="cursor-pointer mb-3"
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Subtask Progress */}
        {task.subtasks?.length > 0 && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                📋 {completedSubtasks}/{totalSubtasks} subtasks
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Metadata */}
        <div className="mt-4 space-y-3">
          {/* Due Date */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaRegClock className="w-4 h-4 mr-2" />
            <span>{formattedDate}</span>
            <span className="ml-2 text-xs">({relativeDate})</span>
          </div>

          {/* Owner/Assignees - Show Google Account for Google Tasks */}
          {task.isGoogleTask && task.googleAccount ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <img
                  src={
                    task.googleAccount.avatar ||
                    task.googleAccount.picture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(task.googleAccount.name || task.googleAccount.email)}&background=4285F4`
                  }
                  alt={task.googleAccount.name || task.googleAccount.email}
                  className="w-6 h-6 rounded-full border-2 border-blue-500 dark:border-blue-400"
                  title={`${task.googleAccount.name || ''} (${task.googleAccount.email}) - Google Account`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {task.googleAccount.name || task.googleAccount.email}
              </span>
            </div>
          ) : task.assignees?.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <img
                    key={assignee._id}
                    src={
                      assignee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=random`
                    }
                    alt={assignee.name}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                    title={assignee.name}
                  />
                ))}
                {task.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {task.comments?.length > 0 && (
              <div className="flex items-center">
                <FaRegCommentDots className="w-4 h-4 mr-1" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center">
                <FaPaperclip className="w-4 h-4 mr-1" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={task}
        onSuccess={onUpdate}
      />
      <GoogleTaskDialog
        isOpen={isGoogleEditDialogOpen}
        onClose={() => setIsGoogleEditDialogOpen(false)}
        task={task}
        workspaceId={workspaceId}
        onSuccess={onUpdate}
      />
      <SubtaskDialog
        isOpen={isSubtaskDialogOpen}
        onClose={() => setIsSubtaskDialogOpen(false)}
        parentTask={task}
        subtask={selectedSubtask}
        onSuccess={onUpdate}
      />
    </div>
  );
};

export { TaskCard };
export default TaskCard;
