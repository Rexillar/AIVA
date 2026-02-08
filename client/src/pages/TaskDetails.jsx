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

import React from "react";
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import {
  useGetTaskQuery,
  useUpdateTaskMutation,
  useUpdateTaskSubtasksMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
} from "../redux/slices/api/taskApiSlice";
import { useGetWorkspaceQuery } from "../redux/slices/api/workspaceApiSlice";
import {
  FaTasks,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaArrowLeft,
  FaPlus,
  FaChevronDown,
  FaTimes,
  FaComments,
  FaFile,
} from "react-icons/fa";
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
import { Pie } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentWorkspace,
  setNavigationState,
  clearNavigationState,
} from "../redux/slices/workspaceSlice";
import { fetchExternalTasks } from "../slices/externalTasksSlice";
import TaskChat from "../components/tasks/TaskChat";
import FileUpload from "../components/common/FileUpload";
import TaskAssets from "../components/tasks/TaskAssets";

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

// Add Task Modal Component
const AddSubtaskModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }
    onAdd(title.trim());
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Subtask
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter subtask title..."
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Subtask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskDetails = () => {
  const { taskId, workspaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { tasks: externalTasks } = useSelector((state) => state.externalTasks);
  const navigationState = useSelector(
    (state) => state.workspace.navigationState,
  );
  const [activeTab, setActiveTab] = useState("details");
  const [updateTask] = useUpdateTaskMutation();
  const [updateTaskSubtasks] = useUpdateTaskSubtasksMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [updatingSubtaskIds, setUpdatingSubtaskIds] = useState(new Set());
  const [lastToggleTime, setLastToggleTime] = useState({});

  const isValidWorkspaceId = Boolean(workspaceId && workspaceId.length === 24);
  const isValidMongoId = Boolean(taskId && /^[0-9a-fA-F]{24}$/.test(taskId));
  const isGoogleTaskId = Boolean(taskId && !isValidMongoId);

  // Fetch external tasks to get Google Tasks subtasks or Google task details
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchExternalTasks({ workspaceId }));
    }
  }, [workspaceId, dispatch]);

  // Effect to handle navigation state persistence
  useEffect(() => {
    if (taskId && workspaceId) {
      dispatch(
        setNavigationState({
          lastPath: location.pathname,
          lastWorkspaceId: workspaceId,
          lastTaskId: taskId,
        }),
      );
    }
  }, [taskId, workspaceId, location.pathname, dispatch]);

  // Effect to restore navigation on page load
  useEffect(() => {
    const shouldRestoreNavigation =
      !taskId && !workspaceId && navigationState?.lastPath;
    if (shouldRestoreNavigation) {
      // Check if the saved state is not too old (e.g., within 24 hours)
      const isStateValid =
        navigationState.timestamp &&
        Date.now() - navigationState.timestamp < 24 * 60 * 60 * 1000;

      if (isStateValid) {
        //console.log('Restoring navigation to:', navigationState.lastPath);
        navigate(navigationState.lastPath, { replace: true });
      } else {
        // Clear expired navigation state
        dispatch(clearNavigationState());
      }
    }
  }, [navigationState, taskId, workspaceId, navigate, dispatch]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Only clear navigation state if navigating away from task details
      if (!location.pathname.includes("/task/")) {
        dispatch(clearNavigationState());
      }
    };
  }, [dispatch, location]);

  // Add workspace query with proper options
  const { data: workspaceData, isLoading: isWorkspaceLoading } =
    useGetWorkspaceQuery(workspaceId, {
      skip: !isValidWorkspaceId,
      refetchOnMountOrArgChange: true,
    });

  // Effect to handle workspace persistence
  useEffect(() => {
    if (
      workspaceData &&
      (!currentWorkspace || currentWorkspace._id !== workspaceId)
    ) {
      // Store workspace data in Redux
      dispatch(setCurrentWorkspace(workspaceData.data || workspaceData));

      // Also store in localStorage as backup
      localStorage.setItem(
        "lastWorkspace",
        JSON.stringify(workspaceData.data || workspaceData),
      );
    }
  }, [workspaceData, currentWorkspace, workspaceId, dispatch]);

  // Effect to restore workspace on page load
  useEffect(() => {
    if (!currentWorkspace && isValidWorkspaceId) {
      // Try to restore from localStorage
      const savedWorkspace = localStorage.getItem("lastWorkspace");
      if (savedWorkspace) {
        try {
          const parsedWorkspace = JSON.parse(savedWorkspace);
          if (parsedWorkspace._id === workspaceId) {
            dispatch(setCurrentWorkspace(parsedWorkspace));
          }
        } catch (error) {
          //console.error('Error parsing saved workspace:', error);
        }
      }
    }
  }, [currentWorkspace, workspaceId, dispatch, isValidWorkspaceId]);

  const {
    data: taskData,
    isLoading: isTaskLoading,
    error,
    refetch,
  } = useGetTaskQuery(
    { taskId, workspaceId },
    {
      skip: !taskId || !isValidWorkspaceId || isGoogleTaskId, // Skip if it's a Google task
      // Let RTK Query handle caching normally
    },
  );

  // Merge Google Task subtasks if this is a Google Task OR fetch Google task if it's a Google task ID
  const task = useMemo(() => {
    // If it's a Google task ID, fetch from externalTasks
    if (isGoogleTaskId) {
      const googleTask = (externalTasks || []).find(t => t._id === taskId || t.googleTaskId === taskId);
      if (!googleTask) return null;

      // Find subtasks from external tasks
      const googleSubtasks = (externalTasks || []).filter(
        t => t.parent === taskId
      ).map(subtask => ({
        ...subtask,
        _id: subtask._id || subtask.googleTaskId,
        completed: subtask.status === 'completed',
        isGoogleTask: true
      }));

      return {
        ...googleTask,
        subtasks: googleSubtasks,
        isGoogleTask: true
      };
    }

    if (!taskData) return null;

    // Check if this is a Google Task and needs subtasks from externalTasks
    if (taskData.isGoogleTask || taskData.source === 'google-tasks' || taskData.googleTaskId) {
      const googleTaskId = taskData.googleTaskId || taskData._id;

      // Find subtasks from external tasks
      const googleSubtasks = (externalTasks || []).filter(
        t => t.parent === googleTaskId
      ).map(subtask => ({
        ...subtask,
        _id: subtask._id || `google-${subtask.googleTaskId}`,
        title: subtask.title,
        status: subtask.status === 'completed' ? 'completed' : 'needsAction',
        completed: subtask.status === 'completed'
      }));

      // For Google tasks, use subtasks from externalTasks only
      return {
        ...taskData,
        subtasks: googleSubtasks,
        isGoogleTask: true
      };
    }

    return taskData;
  }, [taskData, externalTasks, isGoogleTaskId, taskId]);

  // Effect to set default active tab based on task type
  useEffect(() => {
    if (task) {
      // If it's a Google task and current tab is "chat", switch to "details"
      if ((task.isGoogleTask || isGoogleTaskId) && activeTab === "chat") {
        setActiveTab("details");
      }
    }
  }, [task, isGoogleTaskId, activeTab]);

  // Update loading state to include both task and workspace loading
  // For Google tasks, wait until external tasks are loaded
  const isLoading = isTaskLoading || isWorkspaceLoading || (isGoogleTaskId && !externalTasks.length);

  // Get workspace name and description from the response with proper fallback
  const workspaceInfo = useMemo(() =>
    currentWorkspace || workspaceData?.data || workspaceData || {},
    [currentWorkspace, workspaceData]
  );
  const workspaceName =
    workspaceInfo?.name ||
    workspaceInfo?.workspace?.name ||
    "Untitled Workspace";
  const workspaceDescription =
    workspaceInfo?.description || workspaceInfo?.workspace?.description;

  // For debugging
  useEffect(() => {
    if (workspaceData) {
      // console.log('Workspace Data:', workspaceData);
      // console.log('Workspace Info:', workspaceInfo);
      // console.log('Workspace Name:', workspaceName);
      // console.log('Workspace Description:', workspaceDescription);
    }
  }, [workspaceData, workspaceInfo, workspaceName, workspaceDescription]);

  // Filter out duplicate subtasks by _id
  const uniqueSubtasks = useMemo(() =>
    task?.subtasks?.filter((subtask, index, self) =>
      index === self.findIndex(s => s._id === subtask._id)
    ) || [],
    [task?.subtasks]
  );

  // Calculate statistics - uses 'task' directly from query
  const taskStats = useMemo(() => {
    if (!uniqueSubtasks.length) return null;

    const total = uniqueSubtasks.length;
    const completed = uniqueSubtasks.filter(
      (st) => st.status === "completed",
    ).length;

    // For Google tasks, only count todo and completed (no in_progress or review)
    const isGoogleTask = task.isGoogleTask || isGoogleTaskId;
    const inProgress = isGoogleTask ? 0 : uniqueSubtasks.filter(
      (st) => st.status === "in_progress",
    ).length;
    const review = isGoogleTask ? 0 : uniqueSubtasks.filter((st) => st.status === "review").length;

    // For Google tasks, count needsAction/not_started as todo. For regular tasks, count not_started/todo/needsAction as todo
    const todo = uniqueSubtasks.filter((st) => {
      if (isGoogleTask) {
        return st.status === "needsAction" || st.status === "not_started";
      } else {
        return st.status === "not_started" || st.status === "todo" || st.status === "needsAction";
      }
    }).length;

    return {
      total,
      completed,
      inProgress,
      review,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [task?.subtasks, task?.isGoogleTask, isGoogleTaskId]);

  // Chart data
  const subtaskStatusData = useMemo(() => ({
    labels: task?.isGoogleTask || isGoogleTaskId ? ["To Do", "Completed"] : ["To Do", "In Progress", "Review", "Completed"],
    datasets: [
      {
        data: taskStats
          ? task?.isGoogleTask || isGoogleTaskId
            ? [taskStats.todo, taskStats.completed]
            : [
              taskStats.todo,
              taskStats.inProgress,
              taskStats.review,
              taskStats.completed,
            ]
          : task?.isGoogleTask || isGoogleTaskId ? [0, 0] : [0, 0, 0, 0],
        backgroundColor: task?.isGoogleTask || isGoogleTaskId
          ? [
            "rgba(239, 68, 68, 0.8)", // red-500 for To Do
            "rgba(16, 185, 129, 0.8)", // green-500 for Completed
          ]
          : [
            "rgba(239, 68, 68, 0.8)", // red-500
            "rgba(59, 130, 246, 0.8)", // blue-500
            "rgba(168, 85, 247, 0.8)", // purple-500
            "rgba(16, 185, 129, 0.8)", // green-500
          ],
        borderColor: task?.isGoogleTask || isGoogleTaskId
          ? [
            "rgba(239, 68, 68, 1)",
            "rgba(16, 185, 129, 1)",
          ]
          : [
            "rgba(239, 68, 68, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(168, 85, 247, 1)",
            "rgba(16, 185, 129, 1)",
          ],
        borderWidth: 1,
      },
    ],
  }), [taskStats, task?.isGoogleTask, isGoogleTaskId]);

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
          filter: (legendItem, data) => {
            // Show all legend items, even with 0 values
            return true;
          },
        },
      },
    },
  };

  // SIMPLIFIED HANDLERS - No local state, just API calls + refetch

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({
        taskId,
        workspaceId,
        updates: { stage: newStatus },
      }).unwrap();
      toast.success("Task status updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleAddSubtask = async (title) => {
    if (!title.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }

    try {
      await createSubtask({
        taskId,
        workspaceId,
        title: title.trim(),
      }).unwrap();

      toast.success("Subtask added successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add subtask");
    }
  };

  const handleSubtaskStatusToggle = async (subtaskId) => {
    if (!subtaskId || updatingSubtaskIds.has(subtaskId)) {
      return;
    }

    // Debounce
    const now = Date.now();
    const lastTime = lastToggleTime[subtaskId] || 0;
    if (now - lastTime < 1000) {
      return;
    }
    setLastToggleTime(prev => ({ ...prev, [subtaskId]: now }));

    const subtask = task?.subtasks?.find((st) => st._id === subtaskId);
    if (!subtask) {
      toast.error("Subtask not found");
      return;
    }

    const newStatus = subtask.status === "completed" ? "todo" : "completed";

    setUpdatingSubtaskIds((prev) => new Set([...prev, subtaskId]));

    // Check if this is a Google task - update through Google API
    if (task.isGoogleTask || isGoogleTaskId) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/google/tasks/${workspaceId}/${subtaskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus === 'completed' ? 'completed' : 'needsAction',
            googleAccountId: task.googleAccountId || subtask.googleAccountId,
            googleTaskListId: task.googleTaskListId || subtask.googleTaskListId,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update Google task');
        }

        toast.success(`Subtask marked as ${newStatus}`);
        // Refetch external tasks to update UI
        dispatch(fetchExternalTasks({ workspaceId }));
      } catch (error) {
        console.error('Error updating Google task subtask:', error);
        toast.error(error.message || 'Failed to update subtask');
      } finally {
        setUpdatingSubtaskIds((prev) => {
          const next = new Set(prev);
          next.delete(subtaskId);
          return next;
        });
      }
      return;
    }

    const updatedSubtasks = task.subtasks.map((st) =>
      st._id === subtaskId ? { ...st, status: newStatus } : st
    );

    try {
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks,
      }).unwrap();

      toast.success(`Subtask marked as ${newStatus}`);
      await refetch();

    } catch (error) {
      toast.error(error?.data?.message || "Failed to update subtask status");
    } finally {
      setUpdatingSubtaskIds((prev) => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }
  };

  const handleEditSubtask = async (subtaskId) => {
    if (!editValue.trim()) {
      toast.error("Subtask title cannot be empty");
      return;
    }

    try {
      const updatedSubtasks = task.subtasks.map((st) =>
        st._id === subtaskId ? { ...st, title: editValue.trim() } : st,
      );

      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks,
      }).unwrap();

      toast.success("Subtask updated successfully");
      setEditingSubtask(null);
      setEditValue("");
      await refetch();

    } catch (error) {
      toast.error(error?.data?.message || "Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const updatedSubtasks = task.subtasks.filter(
        (st) => st._id !== subtaskId,
      );

      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks,
      }).unwrap();

      toast.success("Subtask deleted successfully");
      await refetch();

    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete subtask");
    }
  };

  const handleSubtaskStatusChange = async (subtaskId, newStatus) => {
    if (updatingSubtaskIds.has(subtaskId)) {
      return;
    }

    setUpdatingSubtaskIds((prev) => new Set([...prev, subtaskId]));

    // Check if this is a Google task - update through Google API
    if (task.isGoogleTask || isGoogleTaskId) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const token = localStorage.getItem('token');

        const subtask = task?.subtasks?.find((st) => st._id === subtaskId);
        if (!subtask) {
          toast.error("Subtask not found");
          return;
        }

        const response = await fetch(`${API_URL}/google/tasks/${workspaceId}/${subtaskId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus === 'completed' ? 'completed' : 'needsAction',
            googleAccountId: task.googleAccountId || subtask.googleAccountId,
            googleTaskListId: task.googleTaskListId || subtask.googleTaskListId,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update Google task');
        }

        toast.success(`Subtask status updated to ${newStatus}`);
        // Refetch external tasks to update UI
        dispatch(fetchExternalTasks({ workspaceId }));
      } catch (error) {
        console.error('Error updating Google task subtask:', error);
        toast.error(error.message || 'Failed to update subtask');
      } finally {
        setUpdatingSubtaskIds((prev) => {
          const next = new Set(prev);
          next.delete(subtaskId);
          return next;
        });
      }
      return;
    }

    const updatedSubtasks = task.subtasks.map((st) =>
      st._id === subtaskId ? { ...st, status: newStatus } : st
    );

    try {
      await updateTaskSubtasks({
        taskId,
        workspaceId,
        subtasks: updatedSubtasks,
      }).unwrap();

      toast.success(`Subtask status updated to ${newStatus}`);
      await refetch();

    } catch (error) {
      toast.error("Failed to update subtask status");
    } finally {
      setUpdatingSubtaskIds((prev) => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }
  };


  // NOW the conditional returns - all hooks are already called above
  // Handle invalid IDs with more specific error messages
  if (!taskId || !isValidWorkspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid ID Format</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {!taskId
              ? "Task ID is missing"
              : !isValidWorkspaceId
                ? `Invalid workspace ID format: ${workspaceId}`
                : "Invalid ID format"}
          </p>
        </div>
        <button
          onClick={() => {
            const targetPath = `/workspace/${workspaceId}/tasks`;
            //console.log('Navigating to:', targetPath); // Debug log
            navigate(targetPath, { replace: true });
          }}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft /> Return to Tasks
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading task details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Task</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error?.data?.message || "Unable to load task details"}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              const targetPath = `/workspace/${workspaceId}/tasks`;
              //console.log('Navigating to:', targetPath); // Debug log
              navigate(targetPath, { replace: true });
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <FaArrowLeft /> Return to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-gray-500 text-center mb-4">
          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p>The requested task could not be found.</p>
        </div>
        <button
          onClick={() => {
            const targetPath = `/workspace/${workspaceId}/tasks`;
            //console.log('Navigating to:', targetPath); // Debug log
            navigate(targetPath, { replace: true });
          }}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <FaArrowLeft /> Return to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const targetPath = `/workspace/${workspaceId}/tasks`;
              //console.log('Navigating to:', targetPath); // Debug log
              navigate(targetPath, { replace: true });
            }}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to {workspaceName}
          </button>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400 block">
              Workspace: {workspaceName}
            </span>
            {workspaceDescription && (
              <span className="text-xs text-gray-400 dark:text-gray-500 block mt-1">
                {workspaceDescription}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h1>

            {task.description && (
              <p className="text-gray-600 dark:text-gray-300">
                {task.description}
              </p>
            )}

            <span
              className={`px-2 py-1 text-xs rounded-full ${task.priority === "high"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : task.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                }`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Task Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completion Rate
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {taskStats?.completionRate || 0}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Subtasks
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {taskStats?.total || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In Progress
              </h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {taskStats?.inProgress || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {taskStats?.completed || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Subtask Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Subtask Distribution
          </h2>
          <div className="h-64">
            <Pie data={subtaskStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("details")}
              className={`${activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <FaTasks className="w-4 h-4" />
              Subtasks
            </button>
            {/* Only show Chat tab for non-Google tasks */}
            {!(task.isGoogleTask || isGoogleTaskId) && (
              <button
                onClick={() => setActiveTab("chat")}
                className={`${activeTab === "chat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <FaComments className="w-4 h-4" />
                Chat
              </button>
            )}
            <button
              onClick={() => setActiveTab("files")}
              className={`${activeTab === "files"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <FaFile className="w-4 h-4" />
              Files
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "details" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Subtasks
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 transition-colors duration-200"
                >
                  <FaPlus className="w-3 h-3" /> Add Subtask
                </button>
              </div>

              {task.subtasks?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {task.subtasks.map((subtask) => (
                    <div
                      key={subtask._id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col h-full">
                        {/* Header with Status and Actions */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() =>
                              handleSubtaskStatusToggle(subtask._id)
                            }
                            disabled={updatingSubtaskIds.has(subtask._id)}
                            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${updatingSubtaskIds.has(subtask._id)
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"
                              } ${subtask.status === "completed"
                                ? "border-green-500 bg-green-500 hover:bg-green-600"
                                : "border-gray-300 dark:border-gray-600"
                              }`}
                          >
                            {updatingSubtaskIds.has(subtask._id) ? (
                              <div className="w-3 h-3 border-2 border-white dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                            ) : subtask.status === "completed" ? (
                              <FaCheck className="w-3 h-3 text-white" />
                            ) : null}
                          </button>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {editingSubtask !== subtask._id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingSubtask(subtask._id);
                                    setEditValue(subtask.title);
                                  }}
                                  className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubtask(subtask._id)
                                  }
                                  className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Title/Edit Section */}
                        <div className="flex-grow">
                          {editingSubtask === subtask._id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) =>
                                  e.key === "Enter" &&
                                  handleEditSubtask(subtask._id)
                                }
                                placeholder="Enter subtask title..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditSubtask(subtask._id)}
                                  className="flex-1 px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors duration-200"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSubtask(null);
                                    setEditValue("");
                                  }}
                                  className="flex-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p
                              className={`text-sm mb-3 ${subtask.status === "completed"
                                  ? "text-gray-400 dark:text-gray-500 line-through"
                                  : "text-gray-900 dark:text-white"
                                }`}
                            >
                              {subtask.title}
                            </p>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div className="relative mt-3">
                          <select
                            value={subtask.status || "todo"}
                            onChange={(e) =>
                              handleSubtaskStatusChange(
                                subtask._id,
                                e.target.value,
                              )
                            }
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none transition-colors duration-200"
                          >
                            <option value="todo">Todo</option>
                            {/* Only show additional status options for non-Google tasks */}
                            {!(task.isGoogleTask || isGoogleTaskId) && (
                              <>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                              </>
                            )}
                            <option value="completed">Completed</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <FaChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No subtasks available
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaPlus className="w-4 h-4" /> Create your first subtask
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Only render chat tab for non-Google tasks */}
          {activeTab === "chat" && !(task.isGoogleTask || isGoogleTaskId) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Task Discussion
              </h2>
              <TaskChat taskId={taskId} />
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  File Management
                </h2>
                <FileUpload taskId={taskId} workspaceId={workspaceId} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Attached Files
                </h3>
                <TaskAssets taskId={taskId} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Subtask Modal */}
      <AddSubtaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubtask}
      />
    </div>
  );
};

export default TaskDetails;
