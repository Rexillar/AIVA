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

import React from "react";
import { Card, LoadingSpinner } from "../shared";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUserFriends,
  FaCalendarAlt,
  FaChartLine,
  FaListAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

const COLORS = {
  todo: "#6B7280",
  in_progress: "#FBBF24",
  review: "#3B82F6",
  completed: "#10B981",
  overdue: "#EF4444",
};

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace("text", "bg")}/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </Card>
);

const TaskDistributionChart = ({ stats }) => {
  const data = [
    { name: "To Do", value: stats.todo || 0, color: COLORS.todo },
    {
      name: "In Progress",
      value: stats.inProgress || 0,
      color: COLORS.in_progress,
    },
    { name: "Review", value: stats.review || 0, color: COLORS.review },
    { name: "Completed", value: stats.completed || 0, color: COLORS.completed },
  ].filter((item) => item.value > 0);

  return (
    <Card title="Task Distribution" className="col-span-full lg:col-span-2">
      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

const CompletionRateChart = ({ rate }) => {
  const data = [{ value: rate }];

  return (
    <Card title="Completion Rate" className="col-span-1">
      <div className="p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: rate }, { value: 100 - rate }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={COLORS.completed} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {rate}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tasks Completed
          </p>
        </div>
      </div>
    </Card>
  );
};

const RecentActivity = ({ tasks }) => {
  if (!tasks?.length) {
    return (
      <Card title="Recent Activity" className="col-span-full lg:col-span-2">
        <div className="p-8 text-center">
          <FaListAlt className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Recent Activity
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start creating tasks to track your progress
          </p>
        </div>
      </Card>
    );
  }

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    )
    .slice(0, 5);

  return (
    <Card title="Recent Activity" className="col-span-full lg:col-span-2">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {recentTasks.map((task) => (
          <div
            key={task._id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.stage === "completed"
                      ? "bg-green-500"
                      : task.stage === "in_progress"
                        ? "bg-yellow-500"
                        : task.stage === "review"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                  }`}
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.stage === "completed"
                      ? "Completed"
                      : task.stage === "in_progress"
                        ? "In Progress"
                        : task.stage === "review"
                          ? "In Review"
                          : "To Do"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(
                  new Date(task.updatedAt || task.createdAt),
                  "MMM dd, HH:mm",
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WorkspaceSummary = ({ workspace, stats }) => (
  <Card title="Workspace Overview" className="col-span-full">
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {workspace?.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {workspace?.members?.length || 0} member
            {workspace?.members?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
            Active
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Tasks
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <FaTasks className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Tasks
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.activeTasksCount || 0}
              </p>
            </div>
            <FaClock className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats?.completionRate || 0}%
              </p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const WorkspaceDashboard = ({ workspace, stats, tasks }) => {
  if (!workspace) {
    return <LoadingSpinner />;
  }

  const tasksList = Array.isArray(tasks)
    ? tasks.map((task) => ({
        ...task,
        _id: task._id || task.id,
        id: task._id || task.id,
        date: task.dueDate || task.createdAt,
        stage: task.stage || "todo",
        priority: task.priority || "medium",
        title: task.title || "Untitled Task",
        updatedAt: task.updatedAt || task.createdAt,
        createdAt: task.createdAt || new Date().toISOString(),
      }))
    : [];

  const mappedStats = {
    total: stats?.total || tasksList.length || 0,
    completed:
      stats?.completed ||
      tasksList.filter((t) => t.stage === "completed").length ||
      0,
    inProgress:
      stats?.in_progress ||
      tasksList.filter((t) => t.stage === "in_progress").length ||
      0,
    review:
      stats?.review ||
      tasksList.filter((t) => t.stage === "review").length ||
      0,
    todo:
      stats?.todo || tasksList.filter((t) => t.stage === "todo").length || 0,
  };

  const activeTasks = mappedStats.inProgress + mappedStats.review || 0;
  const completionRate = mappedStats.total
    ? Math.round((mappedStats.completed / mappedStats.total) * 100)
    : 0;

  const overdueTasks =
    tasksList.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.stage !== "completed",
    ).length || 0;

  const dashboardStats = {
    ...mappedStats,
    recentTasks: tasksList.slice(0, 5),
    overdue: overdueTasks,
    completionRate,
    activeTasksCount: activeTasks,
  };

  return (
    <div className="space-y-6">
      {/* Workspace Summary */}
      <WorkspaceSummary workspace={workspace} stats={dashboardStats} />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={dashboardStats.total}
          icon={FaTasks}
          color="text-blue-600 dark:text-blue-400"
          subtext={`${dashboardStats.total} task${dashboardStats.total !== 1 ? "s" : ""} total`}
        />
        <StatCard
          title="In Progress"
          value={dashboardStats.inProgress}
          icon={FaClock}
          color="text-yellow-600 dark:text-yellow-400"
          subtext="Currently active tasks"
        />
        <StatCard
          title="In Review"
          value={dashboardStats.review}
          icon={FaListAlt}
          color="text-indigo-600 dark:text-indigo-400"
          subtext="Tasks awaiting review"
        />
        <StatCard
          title="Overdue"
          value={dashboardStats.overdue}
          icon={FaExclamationTriangle}
          color="text-red-600 dark:text-red-400"
          subtext="Past due date"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskDistributionChart stats={dashboardStats} />
        <CompletionRateChart rate={dashboardStats.completionRate} />
      </div>

      {/* Recent Activity */}
      <RecentActivity tasks={dashboardStats.recentTasks} />
    </div>
  );
};

export default WorkspaceDashboard;
