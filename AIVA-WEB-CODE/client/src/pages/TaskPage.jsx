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
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetTasksQuery } from "../redux/slices/api/taskApiSlice";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";
import { TaskList, AddTask } from "../components/tasks";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { FaPlus, FaSearch } from "react-icons/fa";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
);

const TaskPage = () => {
  const { workspaceId } = useParams();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();

  // Fetch workspace and tasks data
  const { data: workspaceData, isLoading: workspaceLoading } =
    useGetWorkspaceQuery(workspaceId);
  const workspace = workspaceData?.workspace;
  const {
    data: tasks,
    isLoading: tasksLoading,
    isError,
    error,
    refetch,
  } = useGetTasksQuery(
    {
      workspaceId,
    },
    {
      skip: !workspaceId,
    },
  );

  // Filter tasks based on search term and filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.stage?.toLowerCase().includes(searchLower) ||
        task.priority?.toLowerCase().includes(searchLower);

      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      const matchesStatus =
        filterStatus === "all" || task.stage === filterStatus;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, filterPriority, filterStatus]);

  // Calculate task statistics based on filtered tasks
  const getTaskStats = () => {
    if (!tasks?.length) return null;

    // Get stats for all tasks (unfiltered) for the header stats
    const allStats = {
      byStatus: {
        todo: tasks.filter((task) => task.stage === "todo").length,
        inProgress: tasks.filter((task) => task.stage === "in_progress").length,
        review: tasks.filter((task) => task.stage === "review").length,
        completed: tasks.filter((task) => task.stage === "completed").length,
      },
      byPriority: {
        high: tasks.filter((task) => task.priority === "high").length,
        medium: tasks.filter((task) => task.priority === "medium").length,
        low: tasks.filter((task) => task.priority === "low").length,
      },
    };

    // Get stats for filtered tasks for the charts
    const filteredStats = {
      byStatus: {
        todo: filteredTasks.filter((task) => task.stage === "todo").length,
        inProgress: filteredTasks.filter((task) => task.stage === "in_progress")
          .length,
        review: filteredTasks.filter((task) => task.stage === "review").length,
        completed: filteredTasks.filter((task) => task.stage === "completed")
          .length,
      },
      byPriority: {
        high: filteredTasks.filter((task) => task.priority === "high").length,
        medium: filteredTasks.filter((task) => task.priority === "medium")
          .length,
        low: filteredTasks.filter((task) => task.priority === "low").length,
      },
    };

    return {
      all: allStats,
      filtered: filteredStats,
    };
  };

  const stats = getTaskStats();

  // Chart data for status distribution (using filtered stats)
  const statusChartData = {
    labels: ["To Do", "In Progress", "Review", "Completed"],
    datasets: [
      {
        data: stats?.filtered
          ? [
              stats.filtered.byStatus.todo,
              stats.filtered.byStatus.inProgress,
              stats.filtered.byStatus.review,
              stats.filtered.byStatus.completed,
            ]
          : [0, 0, 0, 0],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // red-500
          "rgba(59, 130, 246, 0.8)", // blue-500
          "rgba(245, 158, 11, 0.8)", // yellow-500
          "rgba(16, 185, 129, 0.8)", // green-500
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for priority distribution (using filtered stats)
  const priorityChartData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks by Priority",
        data: stats?.filtered
          ? [
              stats.filtered.byPriority.high,
              stats.filtered.byPriority.medium,
              stats.filtered.byPriority.low,
            ]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // red-500
          "rgba(245, 158, 11, 0.8)", // yellow-500
          "rgba(16, 185, 129, 0.8)", // green-500
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "rgb(156, 163, 175)",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const handleTaskCreated = () => {
    refetch();
    setIsAddTaskOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsAddTaskOpen(true);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${workspaceId}/task/${taskId}`);
  };

  if (workspaceLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          {error?.data?.message || "Error loading tasks"}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Workspace Header with Add Task Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workspace?.name || "tasks"}
            </h1>
            {workspace?.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {workspace.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FaPlus />
            Add Task
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Quick Stats - using all stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Tasks
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {tasks?.length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Completed
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats?.all.byStatus.completed || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            In Progress
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats?.all.byStatus.inProgress || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            High Priority
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats?.all.byPriority.high || 0}
          </p>
        </div>
      </div>

      {/* Charts - using filtered stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Task Status Distribution {searchTerm && "(Filtered)"}
          </h3>
          <div className="h-64">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Task Priority Distribution {searchTerm && "(Filtered)"}
          </h3>
          <div className="h-64">
            <Bar data={priorityChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Tasks {filteredTasks.length > 0 && `(${filteredTasks.length})`}
        </h2>
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {tasks?.length > 0
              ? "No tasks match your filters"
              : "No tasks found"}
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      <AddTask
        isOpen={isAddTaskOpen}
        setOpen={setIsAddTaskOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default TaskPage;
