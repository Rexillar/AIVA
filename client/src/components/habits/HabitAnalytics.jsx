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
import { useWorkspace } from "../workspace/provider/WorkspaceProvider";
import { useGetUserHabitAnalyticsQuery } from "../../redux/slices/api/habitApiSlice";
import {
  FaChartBar,
  FaFire,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export const HabitAnalytics = () => {
  const { workspace } = useWorkspace();
  const {
    data: analytics,
    isLoading,
    error,
  } = useGetUserHabitAnalyticsQuery(
    { workspaceId: workspace?._id },
    { skip: !workspace?._id },
  );

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Select a workspace to view analytics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No analytics data available yet. Start tracking habits to see
          insights!
        </p>
      </div>
    );
  }

  const categoryData = {
    labels: Object.keys(analytics.categoryBreakdown || {}),
    datasets: [
      {
        label: "Habits per Category",
        data: Object.values(analytics.categoryBreakdown || {}),
        backgroundColor: [
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
        ],
      },
    ],
  };

  const weeklyData = {
    labels: ["This Week"],
    datasets: [
      {
        label: "Weekly Completion Rate (%)",
        data: [analytics.weeklyCompletionRate || 0],
        backgroundColor: "#10b981",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
        <FaChartBar className="mr-2" />
        Habit Analytics
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <FaCheckCircle className="text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Habits
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.totalHabits || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <FaFire className="text-orange-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Avg Streak
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.averageStreak || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <FaCalendarAlt className="text-indigo-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Weekly Rate
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.weeklyCompletionRate || 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <FaCheckCircle className="text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Habits
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.activeHabits || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Completion Rate
          </h3>
          <Bar
            data={weeklyData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Habits by Category
          </h3>
          <Doughnut data={categoryData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Insights
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            • You have {analytics.habitsCompletedToday || 0} habits completed
            today.
          </li>
          <li>
            • Longest streak overall: {analytics.longestStreakOverall || 0}{" "}
            days.
          </li>
          <li>
            • Focus on categories with lower completion to balance your routine.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HabitAnalytics;
