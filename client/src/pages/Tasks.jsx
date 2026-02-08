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

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { fetchExternalTasks } from "../slices/externalTasksSlice";

const Tasks = () => {
  const { workspace } = useWorkspace();
  const dispatch = useDispatch();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("all");

  // Redux state for external tasks
  const { tasks: externalTasks, loading: externalTasksLoading } = useSelector(
    (state) => state.externalTasks
  );

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

  // Fetch external Google Tasks when component mounts
  useEffect(() => {
    if (workspace?._id) {
      dispatch(fetchExternalTasks({
        workspaceId: workspace._id
      }));
    }
  }, [workspace?._id, dispatch]);

  // Extract workspace info from the response
  const name =
    workspaceData?.data?.name || workspace?.name || "Untitled Workspace";
  const description =
    workspaceData?.data?.description || workspace?.description;

  // Combine AIVA tasks with Google Tasks
  const allTasks = [
    ...(tasksData?.tasks || []).filter(t => !t.isGoogleSynced),
    ...(externalTasks || []).map(task => ({
      ...task,
      _id: `google-${task._id}`,
      isGoogleTask: true,
      title: task.title,
      description: task.notes || task.description,
      stage: task.status === 'completed' ? 'completed' : 'todo',
      dueDate: task.dueDate,
      priority: 'medium',
      taskType: 'regular'
    }))
  ];

  // Filter tasks based on search and type
  const filteredTasks = allTasks?.filter((task) => {
    if (!task || !task.title) {
      return false;
    }

    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTaskType === "all") return matchesSearch;
    if (selectedTaskType === "google") return matchesSearch && task.isGoogleTask;
    if (selectedTaskType === "aiva") return matchesSearch && !task.isGoogleTask;
    if (selectedTaskType === "budget")
      return matchesSearch && task.taskType === "budget";
    return matchesSearch && task.taskType !== "budget" && !task.isGoogleTask;
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
              {tasksData?.stats?.total || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              AIVA Tasks
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {tasksData?.tasks?.length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Tasks
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {externalTasks?.length || 0}
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
            <option value="aiva">AIVA Tasks Only</option>
            <option value="google">Google Tasks Only</option>
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
