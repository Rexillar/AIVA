/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegClock, FaEllipsisV, FaCheck } from "react-icons/fa";
import { Menu } from "@headlessui/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useUpdateSubtaskMutation } from "../../../redux/slices/api/taskApiSlice";
import { PRIORITY_STYLES, stageColors } from "../../../utils/constants";

const SubtaskCard = ({ subtask, parentTaskId, onUpdate }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSubtask] = useUpdateSubtaskMutation();

  const formatDate = (date) => {
    if (!date) return "No due date";
    return format(new Date(date), "MMM dd, yyyy");
  };

  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (isLoading) return;

      try {
        setIsLoading(true);
        const updates = {
          stage: newStatus,
          completed: newStatus === "completed",
          completedAt: newStatus === "completed" ? new Date() : null,
        };

        // Add artificial delay for better visibility
        await new Promise((resolve) => setTimeout(resolve, 500));

        await updateSubtask({
          taskId: parentTaskId,
          subtaskId: subtask._id,
          updates,
        }).unwrap();

        if (onUpdate) onUpdate();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to update subtask status");
      } finally {
        setIsLoading(false);
      }
    },
    [subtask._id, parentTaskId, updateSubtask, onUpdate, isLoading],
  );

  const handleCheckboxClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      const newStatus = subtask.stage === "completed" ? "todo" : "completed";
      await handleStatusChange(newStatus);
    },
    [subtask.stage, handleStatusChange, isLoading],
  );

  const isCompleted = subtask.stage === "completed";

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 ${
        isLoading ? "opacity-75" : ""
      }`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start gap-2">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isLoading}
            className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"
            } ${
              isCompleted
                ? "border-green-500 bg-green-500 hover:bg-green-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {isCompleted && !isLoading && (
              <FaCheck className="w-3 h-3 text-white" />
            )}
            {isLoading && (
              <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h4
              className={`text-base font-medium truncate ${
                isCompleted
                  ? "text-gray-400 dark:text-gray-500 line-through"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {subtask.title}
            </h4>
            {subtask.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {subtask.description}
              </p>
            )}
          </div>
        </div>

        {/* Menu Button - Removed since we don't need delete functionality */}
      </div>

      {/* Task Meta Info */}
      <div className="mt-3 space-y-2">
        {/* Status and Priority */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[subtask.stage]?.bg || stageColors.todo.bg}`}
          >
            {subtask.stage?.replace("_", " ")}
          </span>
          {subtask.priority && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[subtask.priority]}`}
            >
              {subtask.priority}
            </span>
          )}
        </div>

        {/* Due Date */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <FaRegClock className="mr-1 h-3 w-3 flex-shrink-0" />
          <span className="truncate">{formatDate(subtask.dueDate)}</span>
        </div>
      </div>

      {/* Status Selector */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <select
          value={subtask.stage}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isLoading}
          className={`text-xs rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 py-1 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

SubtaskCard.displayName = "SubtaskCard";
export { SubtaskCard };
export default SubtaskCard;
