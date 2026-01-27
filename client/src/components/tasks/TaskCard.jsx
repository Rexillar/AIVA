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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, isValid, parseISO } from "date-fns";
import { FaRegClock, FaUserCircle, FaEllipsisV } from "react-icons/fa";
import { Menu, Dialog } from "@headlessui/react";
import {
  useDuplicateTaskMutation,
  useMoveToTrashMutation,
  useUpdateTaskMutation,
} from "../../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import TaskDialog from "../dialogs/TaskDialog";
import SubtaskDialog from "../dialogs/SubtaskDialog";
import { priorityColors, stageColors } from "../../../utils/constants";
import { isValidObjectId } from "mongoose";
import TaskInfo from "./TaskInfo";
import {
  CalendarIcon,
  ChevronRightIcon,
  FlagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TaskCard = ({ task, onUpdate }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [duplicateTask] = useDuplicateTaskMutation();
  const [moveToTrash] = useMoveToTrashMutation();
  const { user } = useSelector((state) => state.auth);
  const [updateTask] = useUpdateTaskMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date =
      typeof dateString === "string" ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, "MMM d, yyyy") : "";
  };

  const handleDuplicate = async () => {
    try {
      await duplicateTask(task._id).unwrap();
      toast.success("Task duplicated successfully");
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to duplicate task");
    }
    setIsMenuOpen(false);
  };

  const handleMoveToTrash = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      // Debug log the task object
      //console.log('Task object:', task);

      // Validate task object and extract taskId
      if (!task || !task._id) {
        //console.error('Invalid task object:', task);
        throw new Error("Task ID is missing");
      }

      // Ensure taskId is a string
      const taskId = task._id.toString();

      // Extract workspaceId - try all possible locations
      let workspaceId = null;

      // Try to get workspace ID from different possible locations
      if (task.workspace) {
        if (typeof task.workspace === "string") {
          workspaceId = task.workspace;
        } else if (task.workspace._id) {
          workspaceId = task.workspace._id;
        }
      }

      // If not found in workspace, try workspaceId property
      if (!workspaceId && task.workspaceId) {
        workspaceId = task.workspaceId;
      }

      // Ensure workspaceId is a string
      workspaceId = workspaceId ? workspaceId.toString() : null;

      // Validate workspace ID
      if (!workspaceId) {
        //console.error('Workspace ID not found in task:', task);
        throw new Error("Workspace ID is missing");
      }

      // Debug log the extracted IDs
      // console.log('Moving task to trash:', {
      //  taskId,
      //  workspaceId,
      //  taskObject: task
      // });

      // Call the mutation with validated IDs
      await moveToTrash({
        taskId,
        workspaceId,
      }).unwrap();

      // Handle success
      toast.success("Task moved to trash");
      setIsMenuOpen(false);

      // Call onUpdate if provided, but don't await it
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      // Log the full error for debugging
      //console.error('Move to trash error:', {
      //  error,
      //  taskObject: task
      //});

      // Show user-friendly error message
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to move task to trash",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    if (!task?._id) {
      toast.error("Task ID is missing");
      return;
    }

    const originalStage = task.stage;

    try {
      await updateTask({
        taskId: task._id,
        updates: {
          stage: newStatus,
        },
      }).unwrap();

      if (typeof onUpdate === "function") {
        onUpdate();
      }
    } catch (err) {
      // Revert the select value to the original stage
      event.target.value = originalStage;
      toast.error(err?.data?.message || "Failed to update task status");
    }
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (task?._id) {
      navigate(`/task/${task._id}`);
    }
  };

  const priorityColor = priorityColors[task.priority] || priorityColors.medium;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col h-full">
        {/* Card Header */}
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start gap-2">
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <button onClick={handleTitleClick} className="text-left w-full">
                <h3
                  className="text-base font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  title={task.title}
                >
                  {task.title}
                </h3>
              </button>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Menu Button */}
            <Menu as="div" className="relative flex-shrink-0">
              <Menu.Button
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <FaEllipsisV className="w-4 h-4" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/task/${task._id}`);
                      }}
                    >
                      View Task
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsInfoModalOpen(true);
                      }}
                    >
                      View Details
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit Task
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDuplicate();
                      }}
                    >
                      Duplicate Task
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      } w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMoveToTrash(e);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Moving to trash..." : "Move to Trash"}
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>

          {/* Task Meta Info */}
          <div className="mt-3 space-y-2">
            {/* Status and Priority */}
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[task.stage]?.bg || stageColors.todo.bg}`}
              >
                {task.stage?.replace("_", " ")}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor.bg} ${priorityColor.text}`}
              >
                <FlagIcon className="h-3 w-3 mr-1 inline" />
                {task.priority}
              </span>
            </div>

            {/* Due Date */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <FaRegClock className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Status Selector */}
            <div>
              <select
                value={task.stage}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleStatusChange(e);
                }}
                className="text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 py-1"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assignees */}
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.map((assignee) => (
                  <img
                    key={assignee._id}
                    src={
                      assignee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}`
                    }
                    alt={assignee.name}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                    title={assignee.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={task}
        onSuccess={onUpdate}
      />
      <SubtaskDialog
        isOpen={isSubtaskDialogOpen}
        onClose={() => setIsSubtaskDialogOpen(false)}
        parentTask={task}
        subtask={selectedSubtask}
        onSuccess={onUpdate}
      />

      {/* Task Info Modal */}
      <Dialog
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        className="relative z-50"
      >
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Full-screen container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Details
              </Dialog.Title>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
              <TaskInfo task={task} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

TaskCard.displayName = "TaskCard";

export { TaskCard };
export default TaskCard;
