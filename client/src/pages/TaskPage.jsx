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

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetTasksQuery } from "../redux/slices/api/taskApiSlice";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";
import { TaskList, AddTask } from "../components/tasks";
import TaskCard from "../components/tasks/cards/TaskCard";
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
import { fetchExternalTasks } from "../slices/externalTasksSlice";

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
  const dispatch = useDispatch();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();

  // Redux state for external tasks
  const { tasks: externalTasks, loading: externalTasksLoading } = useSelector(
    (state) => state.externalTasks
  );

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

  // Fetch external Google Tasks when component mounts + auto-refresh every 2 minutes
  useEffect(() => {
    if (workspaceId) {
      // Initial fetch
      dispatch(fetchExternalTasks({
        workspaceId
      }));

      // Auto-refresh every 2 minutes to avoid rate limiting
      const intervalId = setInterval(() => {
        console.log('[TaskPage] Auto-refreshing Google Tasks...');
        dispatch(fetchExternalTasks({ workspaceId }));
      }, 120000); // 2 minutes (120 seconds)

      return () => clearInterval(intervalId);
    }
  }, [workspaceId, dispatch]);

  // Combine AIVA tasks with Google Tasks (avoiding duplicates)
  // STRATEGY: Show Google Tasks (external) and hide corresponding AIVA tasks (local)
  const allTasks = useMemo(() => {
    // Get all Google tasks
    const googleTasks = (externalTasks || []).map(task => ({
      ...task,
      isGoogleTask: true,
      stage: task.status === 'completed' ? 'completed' : 'todo',
      description: task.notes || task.description,
      priority: task.priority || 'medium',
      taskType: 'regular',
      workspace: task.workspace || workspaceId,
      workspaceId: task.workspaceId || workspaceId,
      parent: task.parent,
      subtasks: []
    }));

    // Create a set of AIVA Task IDs that are already shown as Google Tasks
    const linkedAivaTaskIds = new Set(
      googleTasks
        .filter(gt => gt.aivaTaskId)
        .map(gt => gt.aivaTaskId.toString())
    );

    // Process AIVA tasks - Hide if synced OR if linked by ID to a Google Task OR if Title matches (fuzzy fallback)
    const aivaTasks = (tasks || [])
      .filter(t => {
        // Hide if explicitly marked as synced
        if (t.isGoogleSynced) return false;

        // Hide if we have a Google Task that links to this AIVA task ID
        if (linkedAivaTaskIds.has(t._id)) return false;

        // Fallback: Fuzzy match by Title
        // If there's a Google Task with the EXACT same title, assume it's the synced version and hide local
        const hasTitleMatch = googleTasks.some(gt =>
          gt.title?.trim() === t.title?.trim()
        );
        if (hasTitleMatch) return false;

        return true;
      })
      .map(aivaTask => ({
        ...aivaTask,
        isGoogleTask: false,
        syncedWithGoogle: false, // If it's here, it's NOT synced (or we'd have hidden it)
        subtasks: aivaTask.subtasks || []
      }));

    return [...aivaTasks, ...googleTasks];
  }, [tasks, externalTasks, workspaceId]);


  // Organize tasks by list and attach subtasks to parents
  const organizedTasks = useMemo(() => {
    if (!allTasks?.length) return {};

    const tasksByList = {};
    const taskMap = new Map();

    // First pass: create task map
    allTasks.forEach(task => {
      taskMap.set(task.googleTaskId || task._id, task);
    });

    // Second pass: organize and attach subtasks to parents
    allTasks.forEach(task => {
      const listKey = task.googleTaskListName || 'AIVA Tasks';

      if (!tasksByList[listKey]) {
        tasksByList[listKey] = {
          name: listKey,
          tasks: [],
          isGoogleList: !!task.googleTaskListName
        };
      }

      // Only add root-level tasks (tasks without parent)
      if (!task.parent) {
        // For Google tasks, collect their subtasks
        if (task.isGoogleTask) {
          const subtasks = allTasks.filter(t => t.parent === (task.googleTaskId || task._id));
          task.subtasks = subtasks;
        }
        tasksByList[listKey].tasks.push(task);
      }
    });

    return tasksByList;
  }, [allTasks]);

  // Filter root-level tasks only (not subtasks)
  const filteredTasksByList = useMemo(() => {
    if (!organizedTasks || Object.keys(organizedTasks).length === 0) return {};

    const filterTask = (task) => {
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
    };

    const filtered = {};
    Object.entries(organizedTasks).forEach(([listKey, listData]) => {
      const filteredTasks = listData.tasks.filter(filterTask);
      if (filteredTasks.length > 0) {
        filtered[listKey] = {
          ...listData,
          tasks: filteredTasks
        };
      }
    });

    return filtered;
  }, [organizedTasks, searchTerm, filterPriority, filterStatus]);

  // Flatten all root tasks for stats
  const flattenedFilteredTasks = useMemo(() => {
    const allFilteredTasks = [];
    Object.values(filteredTasksByList).forEach(listData => {
      allFilteredTasks.push(...listData.tasks);
    });
    return allFilteredTasks;
  }, [filteredTasksByList]);

  // Calculate task statistics based on filtered tasks
  const getTaskStats = () => {
    if (!allTasks?.length) return null;

    // Get stats for all tasks (unfiltered) for the header stats
    const allStats = {
      byStatus: {
        todo: allTasks.filter((task) => task.stage === "todo").length,
        inProgress: allTasks.filter((task) => task.stage === "in_progress").length,
        review: allTasks.filter((task) => task.stage === "review").length,
        completed: allTasks.filter((task) => task.stage === "completed").length,
      },
      byPriority: {
        high: allTasks.filter((task) => task.priority === "high").length,
        medium: allTasks.filter((task) => task.priority === "medium").length,
        low: allTasks.filter((task) => task.priority === "low").length,
      },
    };

    // Get stats for filtered tasks for the charts (use flattened list)
    const filteredStats = {
      byStatus: {
        todo: flattenedFilteredTasks.filter((task) => task.stage === "todo").length,
        inProgress: flattenedFilteredTasks.filter((task) => task.stage === "in_progress")
          .length,
        review: flattenedFilteredTasks.filter((task) => task.stage === "review").length,
        completed: flattenedFilteredTasks.filter((task) => task.stage === "completed")
          .length,
      },
      byPriority: {
        high: flattenedFilteredTasks.filter((task) => task.priority === "high").length,
        medium: flattenedFilteredTasks.filter((task) => task.priority === "medium")
          .length,
        low: flattenedFilteredTasks.filter((task) => task.priority === "low").length,
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
            {allTasks?.length || 0}
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

      {/* Task List - 3-Column Grid by Task List */}
      <div className="space-y-6">
        {Object.entries(filteredTasksByList).length > 0 ? (
          Object.entries(filteredTasksByList).map(([listKey, listData]) => (
            <div key={listKey} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {listData.name}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({listData.tasks.length} {listData.tasks.length === 1 ? 'task' : 'tasks'})
                </span>
                {listData.isGoogleList && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                    Google Tasks
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listData.tasks.map((task) => (
                  <TaskCard
                    key={task._id || task.googleTaskId}
                    task={task}
                    onUpdate={refetch}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {allTasks?.length > 0
                ? "No tasks match your filters"
                : "No tasks found"}
            </div>
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
