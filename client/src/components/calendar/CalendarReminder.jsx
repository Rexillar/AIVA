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

import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaClock,
  FaEnvelope,
  FaTimes,
  FaTrash,
  FaRegCalendarAlt,
  FaListUl,
} from "react-icons/fa";
import { format } from "date-fns";

const ReminderForm = ({
  date,
  workspace,
  onClose,
  onSubmit,
  defaultType = "reminder",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: format(new Date(), "HH:mm"),
    email: true,
    notifyBefore: "30",
    type: defaultType,
    color: "#3B82F6",
    priority: "medium",
    stage: "todo",
    labels: [],
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (defaultType) {
      setFormData((prev) => ({ ...prev, type: defaultType }));
    }
  }, [defaultType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workspace) return;

    onSubmit({
      ...formData,
      date,
      workspaceId: workspace._id,
      notifyBefore: parseInt(formData.notifyBefore),
    });
  };

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#EF4444", label: "Red" },
    { value: "#F59E0B", label: "Yellow" },
  ];

  const priorityOptions = [
    { value: "high", label: "High", color: "bg-red-500", icon: "🔴" },
    { value: "medium", label: "Medium", color: "bg-orange-500", icon: "🟡" },
    { value: "low", label: "Low", color: "bg-blue-500", icon: "🔵" },
  ];

  const stageOptions = [
    { value: "todo", label: "To Do", color: "border-yellow-500", icon: "📋" },
    {
      value: "in_progress",
      label: "In Progress",
      color: "border-blue-500",
      icon: "🔄",
    },
    {
      value: "review",
      label: "Review",
      color: "border-purple-500",
      icon: "👀",
    },
    {
      value: "completed",
      label: "Completed",
      color: "border-green-500",
      icon: "✅",
    },
  ];

  const labelOptions = [
    { name: "Bug", color: "#EF4444" },
    { name: "Feature", color: "#3B82F6" },
    { name: "Documentation", color: "#8B5CF6" },
    { name: "UI/UX", color: "#10B981" },
    { name: "Backend", color: "#F59E0B" },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "task":
        return "purple";
      case "reminder":
        return "blue";
      case "event":
        return "green";
      default:
        return "blue";
    }
  };

  const toggleLabel = (label) => {
    const exists = formData.labels.find((l) => l.name === label.name);
    if (exists) {
      setFormData({
        ...formData,
        labels: formData.labels.filter((l) => l.name !== label.name),
      });
    } else {
      setFormData({
        ...formData,
        labels: [...formData.labels, label],
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-${getTypeColor(formData.type)}-50 dark:bg-${getTypeColor(formData.type)}-900/20`}
        >
          <div>
            <h2
              className={`text-lg font-semibold text-${getTypeColor(formData.type)}-800 dark:text-${getTypeColor(formData.type)}-300`}
            >
              Add{" "}
              {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(date, "MMMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "reminder" })}
              className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors
                ${
                  formData.type === "reminder"
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <FaBell className="w-5 h-5" />
              <span className="text-xs font-medium">Reminder</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "task" })}
              className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors
                ${
                  formData.type === "task"
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <FaListUl className="w-5 h-5" />
              <span className="text-xs font-medium">Task</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "event" })}
              className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors
                ${
                  formData.type === "event"
                    ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              <FaRegCalendarAlt className="w-5 h-5" />
              <span className="text-xs font-medium">Event</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              placeholder="Enter title"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              placeholder="Add a description"
              rows="3"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <div className="flex items-center space-x-2">
              <FaClock className="w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Task-specific fields */}
          {formData.type === "task" && (
            <>
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priority: option.value })
                      }
                      className={`p-2 rounded-lg flex items-center justify-center space-x-2 transition-all
                        ${
                          formData.priority === option.value
                            ? `${option.color} text-white`
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <span>{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {stageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, stage: option.value })
                      }
                      className={`p-2 rounded-lg flex items-center justify-center space-x-2 transition-all border-2
                        ${
                          formData.stage === option.value
                            ? option.color
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                    >
                      <span>{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {labelOptions.map((label) => (
                    <button
                      key={label.name}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                        ${
                          formData.labels.find((l) => l.name === label.name)
                            ? "text-white"
                            : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      style={{
                        backgroundColor: formData.labels.find(
                          (l) => l.name === label.name,
                        )
                          ? label.color
                          : undefined,
                      }}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: color.value })
                  }
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === color.value
                      ? "border-gray-900 dark:border-white scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          {/* Notify Before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notify Before
            </label>
            <div className="flex items-center space-x-2">
              <FaBell className="w-5 h-5 text-gray-400" />
              <select
                value={formData.notifyBefore}
                onChange={(e) =>
                  setFormData({ ...formData, notifyBefore: e.target.value })
                }
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              >
                <option value="5">5 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>

          {/* Email Notification */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email-notify"
              checked={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="email-notify"
              className="flex items-center text-sm text-gray-700 dark:text-gray-300"
            >
              <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
              Send email notification
            </label>
          </div>

          {/* Workspace Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adding to workspace:{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {workspace?.name}
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!workspace}
              className={`px-6 py-2 bg-${getTypeColor(formData.type)}-600 text-white rounded-lg hover:bg-${getTypeColor(formData.type)}-700 focus:outline-none focus:ring-2 focus:ring-${getTypeColor(formData.type)}-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Add{" "}
              {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
