/*=================================================================
 * Project: AIVA-WEB
 * File: HabitCard.jsx
 * Author: AI Integration - Habit Tracker Module
 * Date Created: October 21, 2025
 * Last Modified: October 21, 2025
 *=================================================================
 * Description:
 * Habit card component with completion toggle and streak display
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useToggleHabitCompletionMutation } from "../../redux/slices/api/habitApiSlice";
import {
  FaFire,
  FaCheckCircle,
  FaCircle,
  FaPause,
  FaArchive,
  FaEllipsisV,
  FaClock,
  FaLightbulb,
} from "react-icons/fa";

const categoryIcons = {
  health: "❤️",
  fitness: "💪",
  productivity: "⚡",
  learning: "📚",
  mindfulness: "🧘",
  social: "👥",
  finance: "💰",
  creative: "🎨",
  other: "🎯",
};

export const HabitCard = ({
  habit,
  onEdit,
  onDelete,
  onArchive,
  onPause,
  showNudge = false,
}) => {
  const navigate = useNavigate();
  const [toggleCompletion, { isLoading }] = useToggleHabitCompletionMutation();
  const [showMenu, setShowMenu] = useState(false);

  const handleCompletionToggle = async (e) => {
    e.stopPropagation();
    try {
      await toggleCompletion({
        id: habit._id,
        date: new Date().toISOString(),
      }).unwrap();
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/habits/${habit._id}`);
  };

  const handleMenuAction = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  const isCompletedToday = habit.completions?.some((c) => {
    const today = new Date();
    const compDate = new Date(c.date);
    return (
      c.completed &&
      compDate.getDate() === today.getDate() &&
      compDate.getMonth() === today.getMonth() &&
      compDate.getFullYear() === today.getFullYear()
    );
  });

  // Compute nudge message based on patterns
  const nudgeMessage = useMemo(() => {
    if (!showNudge) return null;
    const missedCount =
      habit.completions?.filter((c) => !c.completed).length || 0;
    if (missedCount > 2)
      return `You've missed this ${missedCount} times recently. Try a different time?`;
    if (habit.currentStreak === 0) return "Streak broken—start fresh today!";
    return null;
  }, [habit, showNudge]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
      style={{ borderLeft: `4px solid ${habit.color || "#6366f1"}` }}
      title={nudgeMessage || ""}
    >
      {/* Nudge Icon */}
      {nudgeMessage && (
        <div
          className="absolute top-2 right-12 text-yellow-500"
          title={nudgeMessage}
        >
          <FaLightbulb size={16} />
        </div>
      )}

      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
        >
          <FaEllipsisV />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
            <button
              onClick={(e) => handleMenuAction(e, () => onEdit?.(habit))}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Edit
            </button>
            <button
              onClick={(e) => handleMenuAction(e, () => onPause?.(habit._id))}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {habit.isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={(e) => handleMenuAction(e, () => onArchive?.(habit._id))}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Archive
            </button>
            <button
              onClick={(e) => handleMenuAction(e, () => onDelete?.(habit._id))}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">
            {habit.icon || categoryIcons[habit.category]}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {habit.title}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {habit.category}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  habit.visibility === "private"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                }`}
              >
                {habit.visibility === "private" ? "🔒 Private" : "👥 Team"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {habit.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Current Streak */}
          <div className="flex items-center space-x-1">
            <FaFire className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {habit.currentStreak || 0} day
              {habit.currentStreak !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Total Completions */}
          <div className="flex items-center space-x-1">
            <FaCheckCircle className="text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {habit.totalCompletions || 0}
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Completion Rate
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: habit.color || "#6366f1" }}
          >
            {habit.statistics?.completionRate || 0}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${habit.statistics?.completionRate || 0}%`,
            backgroundColor: habit.color || "#6366f1",
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Frequency */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <FaClock />
          <span className="capitalize">{habit.frequency}</span>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2">
          {habit.isPaused && (
            <span className="flex items-center space-x-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
              <FaPause size={10} />
              <span>Paused</span>
            </span>
          )}
          {habit.isArchived && (
            <span className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
              <FaArchive size={10} />
              <span>Archived</span>
            </span>
          )}
        </div>

        {/* Completion Toggle */}
        <button
          onClick={handleCompletionToggle}
          disabled={isLoading || habit.isPaused}
          className={`p-3 rounded-full transition-all ${
            isCompletedToday
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          } ${habit.isPaused ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCompletedToday ? (
            <FaCheckCircle className="text-white" size={20} />
          ) : (
            <FaCircle className="text-gray-400" size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

HabitCard.propTypes = {
  habit: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
    visibility: PropTypes.string,
    completions: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
      }),
    ),
    currentStreak: PropTypes.number,
    totalCompletions: PropTypes.number,
    statistics: PropTypes.shape({
      completionRate: PropTypes.number,
    }),
    frequency: PropTypes.string,
    isPaused: PropTypes.bool,
    isArchived: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
  onPause: PropTypes.func,
  showNudge: PropTypes.bool, // New prop
};

export default HabitCard;
