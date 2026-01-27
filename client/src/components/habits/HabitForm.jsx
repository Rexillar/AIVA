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

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import {
  useGetPrivateWorkspacesQuery,
  useGetPublicWorkspacesQuery,
} from "../../redux/slices/api/workspaceApiSlice";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const categoryOptions = [
  { value: "health", label: "Health", icon: "❤️" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "productivity", label: "Productivity", icon: "⚡" },
  { value: "learning", label: "Learning", icon: "📚" },
  { value: "mindfulness", label: "Mindfulness", icon: "🧘" },
  { value: "social", label: "Social", icon: "👥" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "creative", label: "Creative", icon: "🎨" },
  { value: "other", label: "Other", icon: "🎯" },
];

const colorOptions = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

const daysOfWeek = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export const HabitForm = ({
  habit = null,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { workspace } = useWorkspace();
  const { data: privateWorkspaces = [] } = useGetPrivateWorkspacesQuery();
  const { data: publicWorkspaces = [] } = useGetPublicWorkspacesQuery();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    frequency: "daily",
    customFrequency: {
      days: [],
      interval: 1,
    },
    reminder: {
      enabled: false,
      time: "09:00",
      days: [],
    },
    color: "#6366f1",
    icon: "🎯",
    workspace: workspace?._id || "",
    visibility: "private",
  });

  // Filter workspaces based on visibility
  const availableWorkspaces = useMemo(() => {
    if (formData.visibility === "private") {
      return privateWorkspaces;
    } else {
      return publicWorkspaces;
    }
  }, [formData.visibility, privateWorkspaces, publicWorkspaces]);

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || "",
        description: habit.description || "",
        category: habit.category || "other",
        frequency: habit.frequency || "daily",
        customFrequency: habit.customFrequency || { days: [], interval: 1 },
        reminder: habit.reminder || { enabled: false, time: "09:00", days: [] },
        color: habit.color || "#6366f1",
        icon: habit.icon || "🎯",
        workspace: habit.workspace?._id || workspace?._id || "",
        visibility: habit?.visibility || "private",
      });
    } else {
      // Update workspace field when workspace changes
      setFormData((prev) => ({
        ...prev,
        workspace: workspace?._id || "",
      }));
    }
  }, [habit, workspace]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If visibility changes, reset workspace selection
    if (name === "visibility") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        workspace: "", // Reset workspace when visibility changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCustomDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      customFrequency: {
        ...prev.customFrequency,
        days: prev.customFrequency.days.includes(day)
          ? prev.customFrequency.days.filter((d) => d !== day)
          : [...prev.customFrequency.days, day],
      },
    }));
  };

  const handleReminderDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      reminder: {
        ...prev.reminder,
        days: prev.reminder.days.includes(day)
          ? prev.reminder.days.filter((d) => d !== day)
          : [...prev.reminder.days, day],
      },
    }));
  };

  const handleReminderChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      reminder: {
        ...prev.reminder,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Please enter a habit title", {
        className:
          "bg-black text-red-400 font-medium rounded-lg border-none shadow-lg",
      });
      return;
    }

    if (!formData.workspace) {
      toast.error("⚠️ Please select a workspace for this habit", {
        className:
          "bg-black text-red-400 font-medium rounded-lg border-none shadow-lg",
        duration: 3000,
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {habit ? "Edit Habit" : "Create New Habit"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Habit Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Exercise for 30 minutes"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add more details about this habit..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Visibility & Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visibility Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Visibility <span className="text-red-500">*</span>
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="private">🔒 Private (Only You)</option>
            <option value="public">👥 Public (Team Members)</option>
          </select>
          <div
            className={`flex items-start space-x-2 rounded-md p-2 ${
              formData.visibility === "private"
                ? "bg-gray-50 dark:bg-gray-800/50"
                : "bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            <span className="text-sm">
              {formData.visibility === "private" ? "🔒" : "👥"}
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {formData.visibility === "private"
                ? "Only you can see and track this habit"
                : "All team members in this workspace can see and track this habit"}
            </p>
          </div>
        </div>

        {/* Workspace Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Workspace <span className="text-red-500">*</span>
          </label>
          <select
            name="workspace"
            value={formData.workspace}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${
              !formData.workspace
                ? "border-red-300 dark:border-red-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
            required
          >
            <option value="">⚠️ No workspace selected</option>
            {availableWorkspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.name}
              </option>
            ))}
          </select>
          {!formData.workspace && (
            <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                Please select a workspace for this habit
              </p>
            </div>
          )}
          {availableWorkspaces.length === 0 && (
            <div className="flex items-start space-x-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <span className="text-yellow-500 text-lg">ℹ️</span>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                No {formData.visibility} workspaces available.{" "}
                {formData.visibility === "private"
                  ? "Create a private workspace first."
                  : "You need to be a member of a public workspace."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, category: cat.value }))
              }
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.category === cat.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900"
                  : "border-gray-300 dark:border-gray-600 hover:border-indigo-300"
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-xs text-gray-700 dark:text-gray-300">
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frequency
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="frequency"
              value="daily"
              checked={formData.frequency === "daily"}
              onChange={handleChange}
              className="text-indigo-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Daily</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="frequency"
              value="weekly"
              checked={formData.frequency === "weekly"}
              onChange={handleChange}
              className="text-indigo-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Specific Days
            </span>
          </label>

          {formData.frequency === "weekly" && (
            <div className="ml-8 flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleCustomDayToggle(day.value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.customFrequency.days.includes(day.value)
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, color }))}
              className={`w-10 h-10 rounded-full border-2 ${
                formData.color === color
                  ? "border-gray-900 dark:border-white scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Reminder */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <label className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            checked={formData.reminder.enabled}
            onChange={(e) => handleReminderChange("enabled", e.target.checked)}
            className="text-indigo-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Reminder
          </span>
        </label>

        {formData.reminder.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Reminder Time
              </label>
              <input
                type="time"
                value={formData.reminder.time}
                onChange={(e) => handleReminderChange("time", e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Reminder Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleReminderDayToggle(day.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.reminder.days.includes(day.value)
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.workspace}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!formData.workspace ? "Please select a workspace first" : ""}
        >
          {isSubmitting ? "Saving..." : habit ? "Update Habit" : "Create Habit"}
        </button>
      </div>
    </form>
  );
};

HabitForm.propTypes = {
  habit: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    frequency: PropTypes.string,
    customFrequency: PropTypes.shape({
      days: PropTypes.arrayOf(PropTypes.string),
      interval: PropTypes.number,
    }),
    reminder: PropTypes.shape({
      enabled: PropTypes.bool,
      time: PropTypes.string,
      days: PropTypes.arrayOf(PropTypes.string),
    }),
    color: PropTypes.string,
    icon: PropTypes.string,
    workspace: PropTypes.shape({
      _id: PropTypes.string,
    }),
    visibility: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default HabitForm;
