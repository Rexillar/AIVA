/*=================================================================
 * Project: AIVA-WEB
 * File: TaskCard.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Task card component for displaying task information in a compact format.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import {
  FaRegClock,
  FaUserCircle,
  FaEllipsisV,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaRegCommentDots,
  FaPaperclip,
} from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  useDuplicateTaskMutation,
  useMoveToTrashMutation,
  useUpdateTaskMutation,
} from "../../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import TaskDialog from "../dialogs/TaskDialog";
import SubtaskDialog from "../dialogs/SubtaskDialog";
import { priorityColors, stageColors } from "../../../utils/constants";

const TaskCard = ({ task, onUpdate, onMoveToTrash, isAdmin = false }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [duplicateTask] = useDuplicateTaskMutation();
  const [moveToTrash] = useMoveToTrashMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const formatDate = (date) => {
    if (!date) return "No due date";
    const formattedDate = format(new Date(date), "MMM dd, yyyy");
    const relativeDate = formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
    return { formattedDate, relativeDate };
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
      const taskId = task._id.toString();
      const workspaceId = (
        task.workspace?._id ||
        task.workspace ||
        task.workspaceId
      )?.toString();

      if (!workspaceId) {
        throw new Error("Workspace ID is missing");
      }

      await moveToTrash({
        taskId,
        workspaceId,
      }).unwrap();

      toast.success("Task moved to trash");
      setIsMenuOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      //console.error('Move to trash error:', error);
      toast.error(error?.data?.message || "Failed to move task to trash");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task?._id || (!task?.workspace && !task?.workspace?._id)) {
      toast.error("Invalid task or workspace ID");
      return;
    }

    const workspaceId = task.workspace?._id || task.workspace;

    try {
      await updateTask({
        taskId: task._id,
        workspaceId: workspaceId,
        updates: { stage: newStatus },
      }).unwrap();

      toast.success(`Task status updated to ${newStatus.replace("_", " ")}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update task status");
    }
  };

  const handleNavigateToTask = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const workspaceId = task.workspace?._id || task.workspace;
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/task/${task._id}`);
    } else {
      toast.error("Invalid workspace ID");
    }
  };

  if (!task) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
      </div>
    );
  }

  const { formattedDate, relativeDate } = formatDate(task.dueDate);

  // Calculate subtask stats
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((st) => st.completed || st.status === "completed")
      .length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400">
      {/* Card Header */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          {/* Priority and Stage Badges */}
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority]?.bg || "bg-gray-100"} ${priorityColors[task.priority]?.text || "text-gray-800"}`}
            >
              {task.priority}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${stageColors[task.stage]?.bg || "bg-gray-100"} ${stageColors[task.stage]?.text || "text-gray-800"}`}
            >
              {task.stage?.replace("_", " ")}
            </span>
          </div>

          {/* Menu Button */}
          <Menu as="div" className="relative">
            <Menu.Button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <FaEllipsisV className="w-4 h-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <FaEdit className="mr-3 w-4 h-4" />
                        Edit Task
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDuplicate();
                        }}
                      >
                        <FaEye className="mr-3 w-4 h-4" />
                        Duplicate
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                        onClick={handleMoveToTrash}
                        disabled={isLoading}
                      >
                        <FaTrash className="mr-3 w-4 h-4" />
                        {isLoading ? "Moving..." : "Move to Trash"}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Title and Description */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNavigateToTask(e);
          }}
          className="cursor-pointer mb-3"
        >
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Subtask Progress */}
        {task.subtasks?.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Subtasks: {completedSubtasks}/{totalSubtasks}
              </span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Metadata */}
        <div className="mt-4 space-y-3">
          {/* Due Date */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaRegClock className="w-4 h-4 mr-2" />
            <span>{formattedDate}</span>
            <span className="ml-2 text-xs">({relativeDate})</span>
          </div>

          {/* Assignees */}
          {task.assignees?.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <img
                    key={assignee._id}
                    src={
                      assignee.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=random`
                    }
                    alt={assignee.name}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                    title={assignee.name}
                  />
                ))}
                {task.assignees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {task.comments?.length > 0 && (
              <div className="flex items-center">
                <FaRegCommentDots className="w-4 h-4 mr-1" />
                <span>{task.comments.length}</span>
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center">
                <FaPaperclip className="w-4 h-4 mr-1" />
                <span>{task.attachments.length}</span>
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
    </div>
  );
};

export { TaskCard };
export default TaskCard;
