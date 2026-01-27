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

import React from "react";
import PropTypes from "prop-types";
import { HabitCard } from "./HabitCard";
import { LoadingSpinner } from "../shared/feedback/LoadingSpinner";
import { FaCheckCircle } from "react-icons/fa";

export const HabitList = ({
  habits = [],
  isLoading,
  onEdit,
  onDelete,
  onArchive,
  onPause,
  onBulkComplete,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Separate due today habits
  const today = new Date();
  const dueToday = habits.filter((habit) => {
    if (habit.frequency === "daily") return true;
    if (habit.frequency === "weekly") {
      const dayName = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][today.getDay()];
      return habit.customFrequency?.days?.includes(dayName);
    }
    return false;
  });
  const otherHabits = habits.filter((h) => !dueToday.includes(h));

  if (!habits || habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No habits found. Create your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Due Today Section */}
      {dueToday.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" /> Due Today –
              Let&apos;s crush these!
            </h3>
            <button
              onClick={() => onBulkComplete?.(dueToday.map((h) => h._id))}
              className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <FaCheckCircle />
              <span>Mark All Complete</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dueToday.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onPause={onPause}
                showNudge={true} // Pass prop to enable nudges in HabitCard
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Habits */}
      {otherHabits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Habits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherHabits.map((habit) => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onPause={onPause}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

HabitList.propTypes = {
  habits: PropTypes.array,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
  onPause: PropTypes.func,
  onBulkComplete: PropTypes.func,
};
export default HabitList;
