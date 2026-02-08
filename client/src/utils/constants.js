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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide frontend utility functions

   ⟁  WHY          : Code reusability and consistent behavior

   ⟁  WHAT         : Helper functions for frontend operations

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : LOW
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Utilities provided. Code simplified. Development efficient."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import {
  FaTasks,
  FaUsers,
  FaStickyNote,
  FaCalendar,
  FaChartLine,
} from "react-icons/fa";

// Navigation Links
export const SIDEBAR_LINKS = [
  {
    path: "/dashboard",
    icon: FaChartLine,
    label: "Dashboard",
  },
  {
    path: "/tasks",
    icon: FaTasks,
    label: "Tasks",
  },
  {
    path: "/team",
    icon: FaUsers,
    label: "Team",
  },
  {
    path: "/note",
    icon: FaStickyNote,
    label: "Notes",
  },
  {
    path: "/calendar",
    icon: FaCalendar,
    label: "Calendar",
  },
];

// Task Priority Styles
export const PRIORITY_STYLES = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-green-600 dark:text-green-400",
};

// Task Stage Colors
export const stageColors = {
  todo: {
    bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    text: "text-blue-700 dark:text-blue-400",
  },
  in_progress: {
    bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  review: {
    bg: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    text: "text-purple-700 dark:text-purple-400",
  },
  completed: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    text: "text-green-700 dark:text-green-400",
  },
};

// Task Type Background Colors
export const TASK_TYPE = {
  todo: "bg-yellow-500",
  in_progress: "bg-blue-500",
  review: "bg-purple-500",
  completed: "bg-green-500",
};

// Task Priority Colors
export const priorityColors = {
  high: {
    bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    text: "text-red-700 dark:text-red-400",
  },
  medium: {
    bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  low: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    text: "text-green-700 dark:text-green-400",
  },
};

// Background Colors
export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];
