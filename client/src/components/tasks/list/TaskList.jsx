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

import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useGetWorkspaceTasksQuery } from "../../../redux/slices/api/taskApiSlice";
import { useGetWorkspaceMembersQuery } from "../../../redux/slices/api/workspaceApiSlice";
import { fetchExternalTasks } from "../../../slices/externalTasksSlice";
import TaskCard from "../cards/TaskCard";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { toast } from "sonner";
import TaskDialog from "../dialogs/TaskDialog";
import AddTask from "../dialogs/AddTask";
import {
  FaTasks,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StatCard from "../../shared/cards/StatCard";
import EmptyState from "../../shared/EmptyState";
import Spinner from "../../shared/Spinner";

// Component to render task with its subtasks recursively
const TaskItemWithSubtasks = ({ task, onUpdate, showSubtasks, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = showSubtasks && task.subtasks && task.subtasks.length > 0;
  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 12)}` : '';

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      {/* Task Item */}
      <div className="flex items-start gap-2">
        {hasSubtasks && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
          >
            {isExpanded ? (
              <FaChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
        <div className="flex-1">
          <div className="relative">
            {level > 0 && (
              <div className="absolute -left-4 top-6 flex items-center">
                <div className="w-3 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>
            )}
            <TaskCard
              key={task._id || task.googleTaskId}
              task={task}
              onUpdate={onUpdate}
              isSubtask={level > 0}
            />
          </div>
        </div>
      </div>

      {/* Subtasks */}
      {hasSubtasks && isExpanded && (
        <div className="mt-2 space-y-2">
          {task.subtasks.map((subtask) => (
            <TaskItemWithSubtasks
              key={subtask._id || subtask.googleTaskId}
              task={subtask}
              onUpdate={onUpdate}
              showSubtasks={showSubtasks}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TaskList = ({ tasks: propTasks, showBudgetDetails, workspace: propWorkspace, showSubtasks = false }) => {
  const [filter, setFilter] = useState("active");
  const dispatch = useDispatch();
  const {
    workspace: contextWorkspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useWorkspace();
  
  // Use prop workspace if provided, otherwise use context
  const workspace = propWorkspace || contextWorkspace;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddMainTaskOpen, setIsAddMainTaskOpen] = useState(false);
  const navigate = useNavigate();

  // Get workspace member role - only if we have a workspace with an ID
  const {
    data: workspaceData,
    isLoading: isMembersLoading,
    error: membersError,
  } = useGetWorkspaceMembersQuery(workspace?._id, {
    skip: !workspace?._id || isWorkspaceLoading,
  });

  // Check if user is a member or admin
  const userRole = workspaceData?.userRole || workspace?.userRole || "member";
  const isAdmin =
    userRole === "admin" ||
    userRole === "owner" ||
    workspace?.owner?._id === workspace?.currentUser;

  const {
    data,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch,
  } = useGetWorkspaceTasksQuery(
    {
      workspaceId: workspace?._id,
      filter,
    },
    {
      skip: !workspace?._id || isWorkspaceLoading || propTasks, // Skip if tasks provided as props
      refetchOnMountOrArgChange: true,
      pollingInterval: 0,
    },
  );

  // Use prop tasks if provided, otherwise use fetched data
  const tasks = propTasks || data?.tasks || [];
  const stats = data?.stats || {};

  // Handle task update
  const handleTaskUpdate = useCallback(async () => {
    if (!workspace?._id) return;

    try {
      // Only refetch AIVA tasks if the query is active (not skipped)
      if (!propTasks && workspace?._id && !isWorkspaceLoading) {
        await refetch();
      }
      // Always refetch Google tasks
      dispatch(fetchExternalTasks({ workspaceId: workspace._id }));
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      
      // Silently handle network connectivity errors without showing toast
      // Only show toast for actual user-actionable errors
      const isNetworkError = 
        err?.code === 'ERR_INTERNET_DISCONNECTED' ||
        err?.code === 'ERR_CONNECTION_REFUSED' ||
        err?.message?.includes('503') ||
        err?.message?.includes('network') ||
        err?.message?.toLowerCase().includes('fetch') ||
        err?.response?.status >= 500 ||
        err?.message?.includes('Cannot refetch a query that has not been started yet');

      if (!isNetworkError) {
        toast.error("Failed to refresh tasks");
      }
    }
  }, [workspace?._id, refetch, dispatch, propTasks, isWorkspaceLoading]);

  // Handle filter change
  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    try {
      // Only refetch if the query is active (not skipped)
      if (!propTasks && workspace?._id && !isWorkspaceLoading) {
        await refetch();
      }
    } catch (err) {
      console.error('Error refreshing tasks after filter change:', err);
    }
  };

  // Show loading state when workspace is loading
  if (isWorkspaceLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading workspace...</span>
      </div>
    );
  }

  // Show workspace error state
  if (workspaceError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{workspaceError.message || "Failed to load workspace"}</p>
        {workspaceError.status === 403 && (
          <p className="mt-2 text-sm">
            You do not have permission to access this workspace.
          </p>
        )}
      </div>
    );
  }

  // Show workspace selection message if no workspace is selected
  if (!workspace || !workspace._id) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        <p>Please select a workspace from the sidebar to view tasks</p>
        <p className="mt-2 text-sm">
          You can find your workspaces in the sidebar on the left
        </p>
      </div>
    );
  }

  // Show loading state when fetching members or tasks
  if (isMembersLoading || isTasksLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  // Show error state if there's an error loading tasks
  if (tasksError) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{tasksError.data?.message || "Failed to load tasks"}</p>
        <button
          onClick={() => {
            // Only refetch if the query is active (not skipped)
            if (!propTasks && workspace?._id && !isWorkspaceLoading) {
              refetch();
            }
          }}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddMainTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FaPlus />
            Add Task
          </button>
         
        </div>
      </div>

      {/* Add Main Task Dialog */}
      <AddTask
        isOpen={isAddMainTaskOpen}
        setOpen={setIsAddMainTaskOpen}
        onSuccess={handleTaskUpdate}
        taskType="main"
      />

      {/* Add Subtask Dialog */}
      <TaskDialog
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskCreated={handleTaskUpdate}
        workspaceId={workspace?._id}
      />

      {/* Task List */}
      <div className="mt-4">
        {isTasksLoading ? (
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : tasksError ? (
          <div className="text-center text-red-600 dark:text-red-400">
            {tasksError.data?.message || "Failed to load tasks"}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Get started by creating a new task"
            action={{
              label: "Create Task",
              onClick: () => navigate("/tasks/new"),
            }}
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItemWithSubtasks
                key={task._id || task.googleTaskId}
                task={task}
                onUpdate={handleTaskUpdate}
                showSubtasks={showSubtasks}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TaskList.displayName = "TaskList";
export { TaskList };
export default TaskList;
