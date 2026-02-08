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

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../workspace/provider/WorkspaceProvider";
import {
  useGetHabitsDueTodayQuery,
  useToggleHabitCompletionMutation,
} from "../../../redux/slices/api/habitApiSlice";
import {
  FaCheckCircle,
  FaCircle,
  FaFire,
  FaArrowRight,
  FaList,
  FaTasks,
  FaLightbulb,
  FaQuestionCircle,
} from "react-icons/fa";

export const HabitWidget = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [checklistMode, setChecklistMode] = useState(false);
  const [showReflection, setShowReflection] = useState(false); // New state for reflection prompt

  const { data: habits = [] } = useGetHabitsDueTodayQuery(
    { workspaceId: workspace?._id },
    { skip: !workspace?._id },
  );

  const [toggleCompletion] = useToggleHabitCompletionMutation();

  const handleToggle = async (habitId) => {
    try {
      await toggleCompletion({
        id: habitId,
        date: new Date().toISOString(),
      }).unwrap();
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    }
  };

  const handleMarkAllComplete = async () => {
    const uncompleted = habits.filter((h) => !isCompletedToday(h));
    for (const habit of uncompleted) {
      await handleToggle(habit._id);
    }
  };

  const isCompletedToday = (habit) => {
    const today = new Date();
    return habit.completions?.some((c) => {
      const compDate = new Date(c.date);
      return (
        c.completed &&
        compDate.getDate() === today.getDate() &&
        compDate.getMonth() === today.getMonth() &&
        compDate.getFullYear() === today.getFullYear()
      );
    });
  };

  const completedCount = habits.filter(isCompletedToday).length;
  const uncompletedHabits = habits.filter((h) => !isCompletedToday(h));

  // Compute EOD insights
  const eodInsights = useMemo(() => {
    if (!habits.length) return null;
    const completed = habits.filter(isCompletedToday).length;
    const total = habits.length;
    const streaks = habits.reduce((acc, h) => {
      if (h.currentStreak > 0) acc[h.title] = h.currentStreak;
      return acc;
    }, {});
    const missed = habits.filter((h) => !isCompletedToday(h));
    const patterns = [];
    if (missed.length > 0) {
      patterns.push(
        `You skipped ${missed.length} habit(s) today. Often happens in evenings—try shifting to mornings?`,
      );
    }
    if (completed === total) {
      patterns.push("Perfect day! Strong consistency. Keep it up.");
    } else {
      patterns.push(
        "Good progress. Focus on completing the rest to maintain streaks.",
      );
    }
    return {
      completed,
      total,
      streaks,
      patterns,
      reflectionPrompt: "What moment today made you feel most focused?",
    };
  }, [habits]);

  if (!workspace) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {checklistMode ? "EOD Checklist" : "Today's Habits"}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChecklistMode(!checklistMode)}
            className={`p-2 rounded-lg ${checklistMode ? "bg-indigo-100 dark:bg-indigo-900" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            title={checklistMode ? "Switch to overview" : "Switch to checklist"}
          >
            {checklistMode ? <FaTasks /> : <FaList />}
          </button>
          <button
            onClick={() => navigate("/habits")}
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center space-x-1"
          >
            <span>View All</span>
            <FaArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-300">
            {completedCount} of {habits.length} completed
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {habits.length > 0
              ? Math.round((completedCount / habits.length) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{
              width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Habit List or Checklist */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No habits scheduled for today
          </p>
        ) : checklistMode ? (
          // EOD Checklist Mode: Only show uncompleted habits
          <>
            {uncompletedHabits.length === 0 ? (
              <p className="text-sm text-green-500 text-center py-4">
                🎉 All habits completed for today!
              </p>
            ) : (
              uncompletedHabits.map((habit) => (
                <div
                  key={habit._id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <button
                    onClick={() => handleToggle(habit._id)}
                    className="text-gray-400 hover:text-green-500"
                  >
                    <FaCircle size={20} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {habit.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {habit.category}
                    </p>
                  </div>
                  {habit.currentStreak > 0 && (
                    <div className="flex items-center space-x-1 text-orange-500">
                      <FaFire size={14} />
                      <span className="text-sm">{habit.currentStreak}</span>
                    </div>
                  )}
                </div>
              ))
            )}
            {uncompletedHabits.length > 0 && (
              <button
                onClick={handleMarkAllComplete}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark All Complete
              </button>
            )}
          </>
        ) : (
          // Default Overview Mode
          habits.slice(0, 5).map((habit) => {
            const completed = isCompletedToday(habit);
            return (
              <div
                key={habit._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/habits/${habit._id}`)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(habit._id);
                    }}
                    className={`flex-shrink-0 p-1 rounded-full ${
                      completed
                        ? "text-green-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    {completed ? (
                      <FaCheckCircle size={20} />
                    ) : (
                      <FaCircle size={20} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        completed
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {habit.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {habit.category}
                    </p>
                  </div>
                </div>
                {habit.currentStreak > 0 && (
                  <div className="flex items-center space-x-1 text-orange-500">
                    <FaFire size={14} />
                    <span className="text-sm font-medium">
                      {habit.currentStreak}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {habits.length > 5 && !checklistMode && (
        <button
          onClick={() => navigate("/habits")}
          className="w-full mt-3 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-center py-2"
        >
          View {habits.length - 5} more habits
        </button>
      )}

      {/* EOD Insights (only in checklist mode after some completion) */}
      {checklistMode && eodInsights && uncompletedHabits.length === 0 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
            EOD Summary
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            {eodInsights.completed}/{eodInsights.total} completed.
          </p>
          {Object.keys(eodInsights.streaks).length > 0 && (
            <p className="text-sm text-green-700 dark:text-green-300">
              Streaks:{" "}
              {Object.entries(eodInsights.streaks)
                .map(([k, v]) => `${k}: ${v} days`)
                .join(", ")}
              .
            </p>
          )}
          <p className="text-sm text-green-700 dark:text-green-300">
            {eodInsights.patterns[0]}
          </p>
          <button
            onClick={() => setShowReflection(!showReflection)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <FaQuestionCircle className="mr-1" /> Reflect
          </button>
          {showReflection && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
              {eodInsights.reflectionPrompt}
            </p>
          )}
        </div>
      )}

      {/* Midday Nudge (if not all completed) */}
      {checklistMode && uncompletedHabits.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
            <FaLightbulb className="mr-2" /> Ready to mark{" "}
            {uncompletedHabits[0]?.title} as done? Let&apos;s keep the momentum!
          </p>
        </div>
      )}
    </div>
  );
};

export default HabitWidget;
