/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useState, useCallback } from "react";
import { useGetWorkspaceTasksQuery } from "../../../redux/slices/api/taskApiSlice";
import { useGetWorkspaceMembersQuery } from "../../../redux/slices/api/workspaceApiSlice";
import TaskCard from "../cards/TaskCard";
import { LoadingSpinner } from "../../shared/feedback/LoadingSpinner";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import { toast } from "sonner";
import TaskDialog from "../dialogs/TaskDialog";
import {
  FaTasks,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StatCard from "../../shared/cards/StatCard";
import EmptyState from "../../shared/EmptyState";
import Spinner from "../../shared/Spinner";

const TaskList = () => {
  const [filter, setFilter] = useState("active");
  const {
    workspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useWorkspace();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
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
      skip: !workspace?._id || isWorkspaceLoading,
      refetchOnMountOrArgChange: true,
      pollingInterval: 0,
    },
  );

  const tasks = data?.tasks || [];
  const stats = data?.stats || {};

  // Handle task update
  const handleTaskUpdate = useCallback(async () => {
    if (!workspace?._id) return;

    try {
      await refetch();
    } catch (err) {
      //console.error('Error refreshing tasks:', err);
      toast.error("Failed to refresh tasks");
    }
  }, [workspace?._id, refetch]);

  // Handle filter change
  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    try {
      await refetch();
    } catch (err) {
      //console.error('Error refreshing tasks after filter change:', err);
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
          onClick={() => refetch()}
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
        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FaPlus />
          Add Task
        </button>
      </div>

      {/* Task Dialog */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdate={handleTaskUpdate}
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
