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
import React, { useState } from "react";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";
import { Container } from "../components/shared/layout/Container";
import { Card } from "../components/shared/layout/Card";
import { SearchInput } from "../components/shared/inputs/SearchInput";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { ErrorBoundary } from "../components/shared/feedback/ErrorBoundary";
import { AddTask } from "../components/tasks/dialogs/AddTask";
import TaskList from "../components/tasks/list/TaskList";
import { useGetWorkspaceTasksQuery } from "../redux/slices/api/taskApiSlice";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";
import { FiDollarSign, FiPlus } from "react-icons/fi";

const Tasks = () => {
  const { workspace } = useWorkspace();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("all");

  // Get tasks data
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error,
  } = useGetWorkspaceTasksQuery(workspace?._id, { skip: !workspace?._id });

  // Get workspace data
  const { data: workspaceData } = useGetWorkspaceQuery(workspace?._id, {
    skip: !workspace?._id,
  });

  // Extract workspace info from the response
  const name =
    workspaceData?.data?.name || workspace?.name || "Untitled Workspace";
  const description =
    workspaceData?.data?.description || workspace?.description;

  // Filter tasks based on search and type
  const filteredTasks = tasksData?.tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTaskType === "all") return matchesSearch;
    if (selectedTaskType === "budget")
      return matchesSearch && task.taskType === "budget";
    return matchesSearch && task.taskType !== "budget";
  });

  if (isTasksLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading tasks...
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorBoundary error={error} />
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header with Workspace Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {name}
              </h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Task
              </button>
              <button
                onClick={() => setIsAddBudgetOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiDollarSign className="w-4 h-4 mr-2" />
                Add Budget Item
              </button>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            <p>Debug Info:</p>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(
                {
                  workspaceResponse: workspaceData,
                  extractedName: name,
                  extractedDescription: description,
                  tasksCount: filteredTasks?.length || 0,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Tasks
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {tasksData?.tasks?.length || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(query) => setSearchQuery(query)}
            />
          </div>
          <select
            value={selectedTaskType}
            onChange={(e) => setSelectedTaskType(e.target.value)}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="budget">Budget Items</option>
            <option value="regular">Regular Tasks</option>
          </select>
        </div>

        {/* Task List */}
        <Card>
          <TaskList
            tasks={filteredTasks || []}
            showBudgetDetails={
              selectedTaskType === "budget" || selectedTaskType === "all"
            }
            workspace={{
              name,
              description,
              _id: workspace?._id,
            }}
          />
        </Card>
      </div>

      {/* Add Task Modal */}
      <AddTask
        isOpen={isAddTaskOpen}
        setOpen={setIsAddTaskOpen}
        onSuccess={() => {
          setIsAddTaskOpen(false);
        }}
      />

      {/* Add Budget Item Modal */}
      <AddTask
        isOpen={isAddBudgetOpen}
        setOpen={setIsAddBudgetOpen}
        taskType="budget"
        onSuccess={() => {
          setIsAddBudgetOpen(false);
        }}
      />
    </Container>
  );
};

export default Tasks;
