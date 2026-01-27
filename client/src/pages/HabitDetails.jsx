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


import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetHabitByIdQuery,
  useGetHabitStatisticsQuery,
  useGetHabitHistoryQuery,
  useToggleHabitCompletionMutation,
  useAddHabitNoteMutation,
  useDeleteHabitNoteMutation,
} from "../redux/slices/api/habitApiSlice";
import { LoadingSpinner } from "../components/shared/feedback/LoadingSpinner";
import { ConfirmDialog } from "../components/shared/modals/ConfirmDialog";
import {
  FaArrowLeft,
  FaFire,
  FaCheckCircle,
  FaTrophy,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import { useWorkspace } from "../components/workspace/provider/WorkspaceProvider";

const HabitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { workspace } = useWorkspace();

  const { data: habit, isLoading } = useGetHabitByIdQuery({
    id,
    workspaceId: habit?.workspace?._id || workspace?._id,
  });
  const { data: statistics } = useGetHabitStatisticsQuery({
    id,
    workspaceId: habit?.workspace?._id || workspace?._id,
  });
  const { data: history = [] } = useGetHabitHistoryQuery({
    id,
    workspaceId: habit?.workspace?._id || workspace?._id,
  });

  const [toggleCompletion] = useToggleHabitCompletionMutation();
  const [addNote] = useAddHabitNoteMutation();
  const [deleteNote] = useDeleteHabitNoteMutation();

  const handleToggleDate = async (date) => {
    try {
      await toggleCompletion({ id, date: date.toISOString() }).unwrap();
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      await addNote({ id, content: noteContent }).unwrap();
      setNoteContent("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote({ id, noteId: noteToDelete }).unwrap();
      setNoteToDelete(null);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Check if user can delete a note (habit owner or workspace owner)
  const canDeleteNote = () => {
    if (!user || !habit) return false;
    const isHabitOwner =
      habit.user === user._id || habit.user?._id === user._id;
    const isWorkspaceOwner =
      habit.workspace?.owner === user._id ||
      habit.workspace?.owner?._id === user._id;
    return isHabitOwner || isWorkspaceOwner;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Habit not found</p>
        <button
          onClick={() => navigate("/habits")}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Back to Habits
        </button>
      </div>
    );
  }

  // Generate last 30 days for calendar view
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const isDateCompleted = (date) => {
    return history.some((h) => {
      const hDate = new Date(h.date);
      return (
        h.completed &&
        hDate.getDate() === date.getDate() &&
        hDate.getMonth() === date.getMonth() &&
        hDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/habits")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{habit.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {habit.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 capitalize">
                {habit.category} • {habit.frequency}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FaFire className="text-orange-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Current Streak
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {habit.currentStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              days
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FaTrophy className="text-yellow-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Longest Streak
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {habit.longestStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              days
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Completions
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {habit.totalCompletions}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              days
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FaCalendarAlt className="text-indigo-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Completion Rate
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics?.completionRate || 0}%
            </p>
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {habit.description}
            </p>
          </div>
        )}

        {/* 30-Day Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Last 30 Days
          </h2>
          <div className="grid grid-cols-10 gap-2">
            {last30Days.map((date, index) => {
              const completed = isDateCompleted(date);
              return (
                <button
                  key={index}
                  onClick={() => handleToggleDate(date)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    completed
                      ? "bg-green-500 border-green-600"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                  title={date.toLocaleDateString()}
                >
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notes
          </h2>

          <form onSubmit={handleAddNote} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {habit.notes && habit.notes.length > 0 ? (
              habit.notes.map((note) => (
                <div
                  key={note._id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-start group"
                >
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {canDeleteNote() && (
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Delete note"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No notes yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default HabitDetails;
