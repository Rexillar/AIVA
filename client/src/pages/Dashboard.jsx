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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";
import { useGetWorkspaceTasksQuery } from "../redux/slices/api/taskApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendarAlt,
  FaFlag,
  FaRocket,
  FaBrain,
  FaCog,
  FaLightbulb,
  FaTrophy,
  FaTarget,
  FaTrendingUp,
  FaUsers,
  FaStar,
  FaFire,
  FaBolt,
  FaCalendarCheck,
  FaListUl,
  FaFilter,
  FaDownload,
  FaShare,
  FaBell,
  FaSearch,
  FaPlus,
  FaMinus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Chart from "../components/dashboard/charts/Chart";
import WorkspaceInvitations from "../components/workspace/management/WorkspaceInvitations";
import { HabitWidget } from "../components/dashboard/widgets/HabitWidget";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";
import { toast } from "sonner";

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${onClick ? 'hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <FaTrendingUp className={`w-3 h-3 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs last week
            </span>
          </div>
        )}
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
  trend: PropTypes.number,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
};

// AI Insights Component
const AIInsights = ({ tasks, stats }) => {
  const insights = useMemo(() => {
    const insights = [];

    // Productivity insights
    if (stats.completed > 0) {
      const completionRate = Math.round((stats.completed / stats.total) * 100);
      if (completionRate >= 80) {
        insights.push({
          type: 'success',
          icon: FaTrophy,
          title: 'High Performer!',
          message: `You're completing ${completionRate}% of tasks - excellent productivity!`,
        });
      } else if (completionRate >= 60) {
        insights.push({
          type: 'info',
          icon: FaTarget,
          title: 'Good Progress',
          message: `You're on track with ${completionRate}% completion rate.`,
        });
      }
    }

    // Overdue tasks insight
    if (stats.overdue > 0) {
      insights.push({
        type: 'warning',
        icon: FaExclamationTriangle,
        title: 'Attention Needed',
        message: `${stats.overdue} tasks are overdue. Consider reprioritizing.`,
      });
    }

    // Workload balance
    const activeTasks = stats.in_progress + stats.review;
    if (activeTasks > 10) {
      insights.push({
        type: 'warning',
        icon: FaClock,
        title: 'Heavy Workload',
        message: `${activeTasks} active tasks. Consider breaking them down.`,
      });
    }

    // Priority distribution
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.stage !== 'completed').length;
    if (highPriorityTasks > 0) {
      insights.push({
        type: 'info',
        icon: FaFlag,
        title: 'Priority Focus',
        message: `${highPriorityTasks} high-priority tasks need attention.`,
      });
    }

    return insights;
  }, [tasks, stats]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <FaBrain className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Insights
        </h2>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${insight.type === 'success'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : insight.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
          >
            <div className="flex items-start">
              <insight.icon className={`w-4 h-4 mt-0.5 mr-2 ${insight.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : insight.type === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Productivity Trends Component
const ProductivityTrends = ({ tasks }) => {
  const trends = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const dailyStats = last7Days.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt || task.dueDate);
        return format(taskDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });

      const completedTasks = dayTasks.filter(task => task.stage === 'completed');

      return {
        date: format(date, 'MMM dd'),
        created: dayTasks.length,
        completed: completedTasks.length,
      };
    });

    return dailyStats;
  }, [tasks]);

  const chartData = trends.map(day => ({
    name: day.date,
    'Tasks Created': day.created,
    'Tasks Completed': day.completed,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaChartLine className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Productivity Trends
          </h2>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</span>
      </div>
      <div className="h-64">
        <Chart
          data={chartData}
          height={250}
          showLegend={true}
          type="line"
        />
      </div>
    </div>
  );
};

// Priority Distribution Component
const PriorityDistribution = ({ tasks }) => {
  const priorityStats = useMemo(() => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: tasks.filter(task => task.priority === priority).length,
      color: priority === 'urgent' ? '#ef4444' :
        priority === 'high' ? '#f97316' :
          priority === 'medium' ? '#eab308' : '#22c55e'
    })).filter(item => item.value > 0);
  }, [tasks]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <FaFlag className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Priority Distribution
        </h2>
      </div>
      <div className="h-64">
        <Chart
          data={priorityStats}
          height={250}
          type="pie"
        />
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics = ({ tasks, stats }) => {
  const metrics = useMemo(() => {
    const totalTasks = stats.total;
    const completedTasks = stats.completed;
    const overdueTasks = stats.overdue;
    const activeTasks = stats.in_progress + stats.review;

    // Calculate velocity (tasks completed per day over last 7 days)
    const last7Days = subDays(new Date(), 7);
    const recentCompleted = tasks.filter(task =>
      task.stage === 'completed' &&
      new Date(task.updatedAt || task.createdAt) > last7Days
    ).length;
    const velocity = Math.round(recentCompleted / 7 * 100) / 100;

    // Calculate efficiency (completed vs total active)
    const efficiency = activeTasks > 0 ? Math.round((completedTasks / (completedTasks + activeTasks)) * 100) : 0;

    // Calculate on-time delivery rate
    const completedOnTime = tasks.filter(task =>
      task.stage === 'completed' &&
      task.dueDate &&
      new Date(task.dueDate) >= new Date(task.updatedAt || task.createdAt)
    ).length;
    const onTimeRate = completedTasks > 0 ? Math.round((completedOnTime / completedTasks) * 100) : 0;

    return {
      velocity,
      efficiency,
      onTimeRate,
      overdueRate: totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0
    };
  }, [tasks, stats]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <FaRocket className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {metrics.velocity}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Tasks/Day (Velocity)
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {metrics.efficiency}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Efficiency Rate
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {metrics.onTimeRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            On-Time Delivery
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {metrics.overdueRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Overdue Rate
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { workspace, isLoading: workspaceLoading } = useWorkspace();
  const [retryCount, setRetryCount] = useState(0);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState(['low', 'medium', 'high', 'urgent']);

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

  // Extract and filter data
  const allTasks = useMemo(() => workspaceData?.tasks || [], [workspaceData]);
  const filteredTasks = useMemo(() => {
    let tasks = allTasks;

    // Filter by time range
    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = subDays(new Date(), days);
      tasks = tasks.filter(task =>
        new Date(task.createdAt || task.dueDate) > cutoffDate
      );
    }

    // Filter by priorities
    tasks = tasks.filter(task =>
      selectedPriorities.includes(task.priority || 'medium')
    );

    return tasks;
  }, [allTasks, timeRange, selectedPriorities]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const tasks = filteredTasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.stage === "completed").length;
    const todo = tasks.filter((t) => t.stage === "todo").length;
    const in_progress = tasks.filter((t) => t.stage === "in_progress").length;
    const review = tasks.filter((t) => t.stage === "review").length;

    const overdue = tasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        t.dueDate &&
        !isNaN(dueDate.getTime()) &&
        dueDate < new Date() &&
        t.stage !== "completed"
      );
    }).length;

    // Calculate trends (comparing with previous period)
    const currentPeriod = tasks;
    const previousPeriod = allTasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.dueDate);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const currentCutoff = subDays(new Date(), days);
      const previousCutoff = subDays(currentCutoff, days);
      return taskDate > previousCutoff && taskDate <= currentCutoff;
    });

    const currentCompleted = currentPeriod.filter(t => t.stage === 'completed').length;
    const previousCompleted = previousPeriod.filter(t => t.stage === 'completed').length;
    const completionTrend = previousCompleted > 0
      ? Math.round(((currentCompleted - previousCompleted) / previousCompleted) * 100)
      : 0;

    return {
      total,
      completed,
      todo,
      in_progress,
      review,
      overdue,
      completionTrend,
      active: in_progress + review,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [filteredTasks, allTasks, timeRange]);

  // Prepare chart data
  const chartData = [
    { name: "Todo", value: stats.todo, color: "#6b7280" },
    { name: "In Progress", value: stats.in_progress, color: "#f59e0b" },
    { name: "Review", value: stats.review, color: "#3b82f6" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const hasData = filteredTasks.length > 0;

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
            value={stats.active}
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
                  {stats.completionRate}%
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
              {filteredTasks.slice(0, 5).map((task) => (
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
                    className={`px-3 py-1 rounded-full text-xs font-medium ${task.stage === "completed"
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
