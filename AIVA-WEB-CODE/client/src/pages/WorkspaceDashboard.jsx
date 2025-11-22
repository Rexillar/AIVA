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

import { useGetWorkspaceTasksQuery } from "../redux/slices/api/taskApiSlice";
import { LoadingSpinner } from "../components/shared";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import Chart from "../components/dashboard/charts/Chart";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

import PropTypes from "prop-types";

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

const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();

  // Validate workspaceId before making the query
  const isValidWorkspaceId =
    workspaceId && /^[0-9a-fA-F]{24}$/.test(workspaceId);

  const {
    data: workspaceData,
    isLoading,
    error,
    refetch,
  } = useGetWorkspaceTasksQuery(
    {
      workspaceId,
    },
    {
      skip: !isValidWorkspaceId,
      refetchOnMountOrArgChange: true,
    },
  );

  // Handle invalid workspace ID
  if (!isValidWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">Invalid Workspace ID</h2>
          <p>
            The workspace ID format is invalid. Please check the URL and try
            again.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const errorMessage = error.data?.message || "Failed to load workspace data";
    toast.error(errorMessage);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500 p-4">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p>{errorMessage}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tasks = workspaceData?.tasks || [];
  const stats = workspaceData?.stats || {
    total: tasks.length,
    todo: tasks.filter((t) => t.stage === "todo").length,
    in_progress: tasks.filter((t) => t.stage === "in_progress").length,
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
    { name: "Completed", value: stats.completed || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workspaceData?.workspace?.name || "Workspace Dashboard"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Dashboard Overview
            </p>
          </div>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
      </div>

      {/* Recent Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                  Due:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
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
          {tasks.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No tasks available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
