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
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";
import { useGetWorkspaceTasksQuery } from "../redux/slices/api/taskApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import Chart from "../components/dashboard/charts/Chart";
import WorkspaceInvitations from "../components/workspace/management/WorkspaceInvitations";
import { HabitWidget } from "../components/dashboard/widgets/HabitWidget";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace("text", "bg")}/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
};

const Dashboard = () => {
  const { workspace, isLoading: workspaceLoading } = useWorkspace();
  const [retryCount, setRetryCount] = useState(0);

  const {
    data: workspaceData,
    isLoading: tasksLoading,
    error,
    refetch,
  } = useGetWorkspaceTasksQuery(
    {
      workspaceId: workspace?._id,
    },
    {
      skip: !workspace?._id || workspaceLoading,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    },
  );

  useEffect(() => {
    if (error) {
      //console.error('Dashboard data fetch error:', error);

      // Implement retry logic with exponential backoff
      if (retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        const timeoutId = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          refetch();
        }, retryDelay);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [error, retryCount, refetch]);

  // Show loading state while workspace is loading or initializing
  if (workspaceLoading || (tasksLoading && !workspaceData)) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show message if no workspace is selected
  if (!workspace) {
    return (
      <div className="flex-1 flex justify-center items-center text-gray-500 dark:text-gray-400">
        <p>Please select a workspace to view the dashboard</p>
      </div>
    );
  }

  // Extract data safely with fallbacks
  const tasks = workspaceData?.tasks || [];
  const stats = workspaceData?.stats || {
    total: tasks.length,
    todo: tasks.filter((t) => t.stage === "todo").length,
    in_progress: tasks.filter((t) => t.stage === "in_progress").length,
    review: tasks.filter((t) => t.stage === "review").length,
    completed: tasks.filter((t) => t.stage === "completed").length,
    overdue: tasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        t.dueDate &&
        !isNaN(dueDate.getTime()) &&
        dueDate < new Date() &&
        t.stage !== "completed"
      );
    }).length,
  };

  // Calculate active tasks and completion rate
  const activeTasks = (stats.in_progress || 0) + (stats.review || 0);
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Prepare chart data
  const chartData = [
    { name: "Todo", value: stats.todo || 0 },
    { name: "In Progress", value: stats.in_progress || 0 },
    { name: "Review", value: stats.review || 0 },
    { name: "Completed", value: stats.completed || 0 },
  ].filter((item) => item.value > 0);

  const hasData = tasks.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Workspace Invitations */}
        <div className="mb-6">
          <WorkspaceInvitations />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {workspace.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Dashboard Overview
              </p>
            </div>
            {error && (
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Tasks"
            value={stats.total}
            icon={FaTasks}
            color="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Active Tasks"
            value={activeTasks}
            icon={FaClock}
            color="text-yellow-600 dark:text-yellow-400"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={FaCheckCircle}
            color="text-green-600 dark:text-green-400"
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={FaExclamationTriangle}
            color="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Charts and Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Distribution
            </h2>
            {chartData.length > 0 ? (
              <div className="h-80">
                <Chart data={chartData} height={300} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No tasks available
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Completion Rate
            </h2>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {completionRate}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Task Completion Rate
                </p>
              </div>
            </div>
          </div>

          {/* Habit Widget */}
          <div className="h-full">
            <HabitWidget />
          </div>
        </div>

        {/* Recent Tasks */}
        {hasData ? (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Tasks
            </h2>
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.stage === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : task.stage === "review"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : task.stage === "in_progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {task.stage === "in_progress"
                      ? "In Progress"
                      : task.stage === "completed"
                        ? "Completed"
                        : task.stage === "review"
                          ? "In Review"
                          : "Todo"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Tasks Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create your first task to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
