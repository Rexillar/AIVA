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
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExternalTasks } from "../slices/externalTasksSlice";

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
  const dispatch = useDispatch();

  // Validate workspaceId before making the query
  const isValidWorkspaceId =
    workspaceId && /^[0-9a-fA-F]{24}$/.test(workspaceId);

  // Redux state for external tasks
  const { tasks: externalTasks } = useSelector(
    (state) => state.externalTasks
  );

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

  // Combine AIVA tasks with Google Tasks with Deduplication
  const allTasks = useMemo(() => {
    const aivaTasksRaw = workspaceData?.tasks || [];

    // Map Google Tasks first
    const googleTasks = (externalTasks || []).map(task => ({
      ...task,
      isGoogleTask: true,
      stage: task.status === 'completed' ? 'completed' : 'todo',
      description: task.notes || task.description,
      priority: task.priority || 'medium',
      taskType: 'regular'
    }));

    // Identify ID-linked tasks
    const linkedAivaTaskIds = new Set(
      googleTasks
        .filter(gt => gt.aivaTaskId)
        .map(gt => gt.aivaTaskId.toString())
    );

    // Apply strict deduplication to AIVA tasks
    const aivaTasks = aivaTasksRaw.filter(t => {
      // 1. Hide if explicitly marked as synced
      if (t.isGoogleSynced) return false;

      // 2. Hide if ID linked
      if (linkedAivaTaskIds.has(t._id)) return false;

      // 3. Hide if Fuzzy Title Match
      const hasTitleMatch = googleTasks.some(gt => gt.title?.trim() === t.title?.trim());
      if (hasTitleMatch) return false;

      return true;
    });

    return [...aivaTasks, ...googleTasks];
  }, [workspaceData?.tasks, externalTasks]);

  // Fetch external Google Tasks when component mounts
  useEffect(() => {
    if (workspaceId && isValidWorkspaceId) {
      dispatch(fetchExternalTasks({ workspaceId }));
    }
  }, [workspaceId, isValidWorkspaceId, dispatch]);

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

  const stats = {
    total: allTasks.length,
    todo: allTasks.filter((t) => t.stage === "todo").length,
    in_progress: allTasks.filter((t) => t.stage === "in_progress").length,
    review: allTasks.filter((t) => t.stage === "review").length,
    completed: allTasks.filter((t) => t.stage === "completed").length,
    overdue: allTasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return (
        t.dueDate &&
        !isNaN(dueDate.getTime()) &&
        dueDate < new Date() &&
        t.stage !== "completed"
      );
    }).length,
  };

  // Calculate active tasks (Todo + In Progress + In Review)
  const activeTasks = (stats.todo || 0) + (stats.in_progress || 0) + (stats.review || 0);
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
          {allTasks.slice(0, 5).map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {task.isGoogleTask && (
                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    Google
                  </span>
                )}
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
          {allTasks.length === 0 && (
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
