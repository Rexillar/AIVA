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
 
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTaskListState } from "../../hooks/useTaskListState";
import { useGetTasksQuery } from "../../redux/slices/api/taskApiSlice";
import { useGetWorkspaceMembersQuery } from "../../redux/slices/api/workspaceApiSlice";
import TaskCard from "./cards/TaskCard";
import { LoadingSpinner } from "../shared/feedback/LoadingSpinner";
import { toast } from "sonner";
import { FaEdit, FaEye } from "react-icons/fa";

const TaskList = () => {
  const {
    workspace,
    workspaceId,
    isWorkspaceLoading,
    workspaceType,
    workspaceVisibility,
    isPrivateWorkspace,
  } = useTaskListState();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // Fetch tasks
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error: tasksError,
  } = useGetTasksQuery({ workspaceId }, { skip: !workspaceId });

  // Fetch members for team workspaces
  const { data: membersData, isLoading: isMembersLoading } =
    useGetWorkspaceMembersQuery(
      { workspaceId },
      { skip: !workspaceId || isPrivateWorkspace },
    );

  // Update tasks when data changes
  useEffect(() => {
    if (tasksData?.data) {
      setTasks(tasksData.data);
      setFilteredTasks(tasksData.data);
    }
  }, [tasksData]);

  // Handle task filtering
  useEffect(() => {
    if (!tasks.length) return;

    let filtered = [...tasks];
    switch (filter) {
      case "completed":
        filtered = filtered.filter((task) => task.status === "completed");
        break;
      case "active":
        filtered = filtered.filter((task) => task.status !== "completed");
        break;
      default:
        break;
    }
    setFilteredTasks(filtered);
  }, [filter, tasks]);

  // Show loading state
  if (isWorkspaceLoading || isTasksLoading || isMembersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (tasksError) {
    toast.error(tasksError?.data?.message || "Failed to load tasks");
    return (
      <div className="text-center text-red-500 p-4">
        Error loading tasks. Please try again later.
      </div>
    );
  }

  // Show empty state
  if (!filteredTasks.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No tasks found. Create a new task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex justify-end space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            workspace={workspace}
            members={membersData?.data}
            isPrivateWorkspace={isPrivateWorkspace}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
