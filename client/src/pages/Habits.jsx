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

import React, { useState, useMemo } from "react";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";
import {
  useGetWorkspaceHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useArchiveHabitMutation,
  usePauseHabitMutation,
} from "../redux/slices/api/habitApiSlice";
import { HabitList } from "../components/habits/HabitList";
import { HabitForm } from "../components/habits/HabitForm";
import { HabitAnalytics } from "../components/habits/HabitAnalytics";
import {
  FaPlus,
  FaFilter,
  FaChartBar,
  FaBolt,
  FaChevronDown,
  FaChevronUp,
  FaArchive,
  FaPlay,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/shared/modals/ConfirmDialog";

const Habits = () => {
  const { workspace } = useWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    title: "",
    category: "other",
    frequency: "daily",
  });
  const [filters, setFilters] = useState({
    isArchived: false,
    category: undefined,
    isActive: true,
    visibility: "all",
  });
  const [showTodaySummary, setShowTodaySummary] = useState(true); // New state for summary toggle
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  const { data: habits = [], isLoading } = useGetWorkspaceHabitsQuery(
    {
      workspaceId: workspace?._id,
      ...filters,
    },
    { skip: !workspace?._id },
  );

  const [createHabit, { isLoading: isCreating }] = useCreateHabitMutation();
  const [updateHabit, { isLoading: isUpdating }] = useUpdateHabitMutation();
  const [deleteHabit] = useDeleteHabitMutation();
  const [archiveHabit] = useArchiveHabitMutation();
  const [pauseHabit] = usePauseHabitMutation();

  const handleCreateOrUpdate = async (habitData) => {
    try {
      if (selectedHabit) {
        await updateHabit({ id: selectedHabit._id, ...habitData }).unwrap();
      } else {
        await createHabit(habitData).unwrap();
      }
      setShowForm(false);
      setSelectedHabit(null);
    } catch (error) {
      console.error("Failed to save habit:", error);
    }
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    if (!quickAddData.title.trim()) {
      toast.error("Please enter a habit title", {
        className:
          "bg-black text-red-400 font-medium rounded-lg border-none shadow-lg",
      });
      return;
    }
    try {
      await createHabit({
        ...quickAddData,
        workspace: workspace?._id,
        visibility: "private",
      }).unwrap();
      setShowQuickAdd(false);
      setQuickAddData({ title: "", category: "other", frequency: "daily" });
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleEdit = (habit) => {
    setSelectedHabit(habit);
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    setHabitToDelete(habitId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabit(habitToDelete).unwrap();
      setHabitToDelete(null);
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const handleArchive = async (habitId) => {
    try {
      await archiveHabit(habitId).unwrap();
    } catch (error) {
      console.error("Failed to archive habit:", error);
    }
  };

  const handlePause = async (habitId) => {
    try {
      await pauseHabit(habitId).unwrap();
    } catch (error) {
      console.error("Failed to pause habit:", error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedHabit(null);
  };

  // Compute today summary data
  const todaySummary = useMemo(() => {
    if (!habits.length) return null;
    const today = new Date();
    const dueToday = habits.filter((h) => {
      if (h.frequency === "daily") return true;
      if (h.frequency === "weekly") {
        const dayName = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ][today.getDay()];
        return h.customFrequency?.days?.includes(dayName);
      }
      return false;
    });
    const completedToday = dueToday.filter((h) =>
      h.completions?.some((c) => {
        const compDate = new Date(c.date);
        return (
          c.completed &&
          compDate.getDate() === today.getDate() &&
          compDate.getMonth() === today.getMonth() &&
          compDate.getFullYear() === today.getFullYear()
        );
      }),
    ).length;
    const progress =
      dueToday.length > 0
        ? Math.round((completedToday / dueToday.length) * 100)
        : 0;
    const easiestHabit =
      dueToday.find((h) => h.currentStreak > 0) || dueToday[0]; // Suggest easiest based on streak or first
    return {
      dueToday,
      progress,
      suggestion: easiestHabit
        ? `Start with ${easiestHabit.title} to build momentum.`
        : "No habits due today—great job staying on track!",
    };
  }, [habits]);

  if (!workspace) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Workspace Selected
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please select a workspace from the sidebar to view and manage your
            habits.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Habits can be private (only you) or public (team members).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Habit Tracker
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Build better habits, one day at a time
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAnalytics
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              <FaChartBar />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              title="Quick add a simple habit"
            >
              <FaBolt />
              <span>Quick Add</span>
            </button>

            <button
              onClick={() => {
                if (!workspace) {
                  toast.error(
                    "⚠️ Please select a workspace from the sidebar first",
                    {
                      className:
                        "bg-black text-red-400 font-medium rounded-lg border-none shadow-lg",
                      duration: 3000,
                    },
                  );
                  return;
                }
                setShowForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              title={
                !workspace ? "Select a workspace first" : "Create new habit"
              }
            >
              <FaPlus />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Today Summary Banner */}
        {!showAnalytics && todaySummary && showTodaySummary && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Today Summary</h3>
                <p className="text-sm opacity-90">
                  {todaySummary.dueToday.length} habits due •{" "}
                  {todaySummary.progress}% complete
                </p>
                <p className="text-sm mt-1">{todaySummary.suggestion}</p>
              </div>
              <button
                onClick={() => setShowTodaySummary(false)}
                className="text-white hover:text-gray-200"
                title="Hide summary"
              >
                <FaChevronUp />
              </button>
            </div>
          </div>
        )}

        {!showAnalytics && todaySummary && !showTodaySummary && (
          <button
            onClick={() => setShowTodaySummary(true)}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FaChevronDown className="inline mr-2" /> Show Today Summary
          </button>
        )}

        {/* Analytics View */}
        {showAnalytics && (
          <div className="animate-fadeIn">
            <HabitAnalytics />
          </div>
        )}

        {/* Filters */}
        {!showAnalytics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              <FaFilter className="text-gray-400" />

              <select
                value={filters.visibility || "all"}
                onChange={(e) =>
                  setFilters({ ...filters, visibility: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Habits</option>
                <option value="private">Private Only</option>
                <option value="public">Team Only</option>
              </select>

              <select
                value={filters.category || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value || undefined,
                  })
                }
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="productivity">Productivity</option>
                <option value="learning">Learning</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="social">Social</option>
                <option value="finance">Finance</option>
                <option value="creative">Creative</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Toggle Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-2">
                  <FaArchive className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Archived
                  </span>
                </div>
                <div
                  className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${filters.isArchived ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-500"}`}
                >
                  <input
                    type="checkbox"
                    checked={filters.isArchived}
                    onChange={(e) =>
                      setFilters({ ...filters, isArchived: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${filters.isArchived ? "translate-x-4" : "translate-x-0"}`}
                  ></span>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-2">
                  <FaPlay className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Only
                  </span>
                </div>
                <div
                  className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${filters.isActive ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-500"}`}
                >
                  <input
                    type="checkbox"
                    checked={filters.isActive}
                    onChange={(e) =>
                      setFilters({ ...filters, isActive: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${filters.isActive ? "translate-x-4" : "translate-x-0"}`}
                  ></span>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Today Only
                  </span>
                </div>
                <div
                  className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${filters.dueToday ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-500"}`}
                >
                  <input
                    type="checkbox"
                    checked={filters.dueToday || false}
                    onChange={(e) =>
                      setFilters({ ...filters, dueToday: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${filters.dueToday ? "translate-x-4" : "translate-x-0"}`}
                  ></span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Habit List */}
        {!showAnalytics && (
          <HabitList
            habits={habits}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onPause={handlePause}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <HabitForm
                habit={selectedHabit}
                onSubmit={handleCreateOrUpdate}
                onCancel={handleCloseForm}
                isSubmitting={isCreating || isUpdating}
              />
            </div>
          </div>
        )}

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Add Habit
              </h2>
              <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Habit title"
                  value={quickAddData.title}
                  onChange={(e) =>
                    setQuickAddData({ ...quickAddData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={quickAddData.category}
                  onChange={(e) =>
                    setQuickAddData({
                      ...quickAddData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="health">Health</option>
                  <option value="fitness">Fitness</option>
                  <option value="productivity">Productivity</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={quickAddData.frequency}
                  onChange={(e) =>
                    setQuickAddData({
                      ...quickAddData,
                      frequency: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setHabitToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Habit"
          message="Are you sure you want to delete this habit? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Habits;
