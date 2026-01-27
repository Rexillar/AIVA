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
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  UserCircleIcon,
  TagIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  FlagIcon,
  PaperClipIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "../shared";
import { useSelector } from "react-redux";
import { priorityColors } from "../utils/constants.js";
import { useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const stageColors = {
  todo: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  in_progress: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  review: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
  },
  completed: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
};

// Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
};

// Helper function to format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "";
};

const TaskInfo = ({ task, onUpdate }) => {
  const { privateWorkspace } = useSelector((state) => state.auth);
  const isPrivateWorkspace = privateWorkspace?._id === task?.workspace;
  const [updateTask] = useUpdateTaskMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  if (!task) {
    return (
      <div className="text-center text-red-500 p-4">
        Task not found. Please check the ID or try reloading the page.
      </div>
    );
  }

  const priorityColor = priorityColors[task.priority] || priorityColors.medium;
  const stageColor = stageColors[task.stage] || stageColors.todo;

  const handleEdit = async () => {
    try {
      await updateTask({
        taskId: task._id,
        workspaceId: task.workspace,
        updates: editedTask,
      }).unwrap();

      toast.success("Task updated successfully");
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update task");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleInputChange}
                className="text-2xl font-semibold w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => (isEditing ? handleEdit() : setIsEditing(true))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isEditing ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <PencilIcon className="h-5 w-5" />
              )}
            </button>
            <div className="flex gap-2">
              <select
                value={editedTask.stage}
                onChange={handleInputChange}
                name="stage"
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${stageColor.bg} ${stageColor.text} ${stageColor.border} border`}
                disabled={!isEditing}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={editedTask.priority}
                onChange={handleInputChange}
                name="priority"
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${priorityColor.bg} ${priorityColor.text} ${priorityColor.border} border`}
                disabled={!isEditing}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <DocumentTextIcon className="h-5 w-5" />
            <h3 className="font-medium">Description</h3>
          </div>
          {isEditing ? (
            <textarea
              name="description"
              value={editedTask.description}
              onChange={handleInputChange}
              className="w-full min-h-[100px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Add a description..."
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {task.description || "No description provided"}
            </p>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dates Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="h-5 w-5" />
            <h3 className="font-medium">Dates</h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created
              </span>
              <div className="text-right">
                <span className="text-sm text-gray-900 dark:text-gray-100 block">
                  {formatDate(task.createdAt)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(task.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Due Date
              </span>
              <div className="text-right">
                {isEditing ? (
                  <input
                    type="date"
                    name="dueDate"
                    value={
                      editedTask.dueDate
                        ? new Date(editedTask.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    className="text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500"
                  />
                ) : (
                  <>
                    <span className="text-sm text-gray-900 dark:text-gray-100 block">
                      {formatDate(task.dueDate)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(task.dueDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assignees Section - Only show if not in private workspace */}
        {!isPrivateWorkspace && task.assignees && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <UserCircleIcon className="h-5 w-5" />
              <h3 className="font-medium">Assignees</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              {task.assignees?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {task.assignees.map((assignee) => (
                    <div
                      key={assignee._id}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={
                          assignee.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.name)}&background=random`
                        }
                        alt={assignee.name}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {assignee.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No assignees
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {task.subtasks?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-5 w-5" />
              <h3 className="font-medium">Progress</h3>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {task.progress || 0}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.progress >= 100
                  ? "bg-green-500"
                  : task.progress > 50
                    ? "bg-blue-500"
                    : "bg-blue-600"
              }`}
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {task.subtasks.filter((st) => st.completed).length} of{" "}
            {task.subtasks.length} subtasks completed
          </div>
        </div>
      )}

      {/* Attachments Section */}
      {task.attachments?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <PaperClipIcon className="h-5 w-5" />
            <h3 className="font-medium">Attachments</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {task.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <PaperClipIcon className="h-5 w-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {attachment.size}
                  </p>
                </div>
                <a
                  href={attachment.url}
                  download
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {task.tags?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <TagIcon className="h-5 w-5" />
            <h3 className="font-medium">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Activity Section */}
      {task.activities?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <h3 className="font-medium">Activity</h3>
          </div>
          <div className="space-y-4">
            {task.activities.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <img
                  src={
                    activity.user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user.name)}`
                  }
                  alt={activity.user.name}
                  className="h-8 w-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {activity.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskInfo;
