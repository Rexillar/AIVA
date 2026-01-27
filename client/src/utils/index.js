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
  FaTrashAlt,
  FaUsers,
  FaStickyNote,
  FaCalendar,
  FaChartLine,
} from "react-icons/fa";

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return "Invalid Date";
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const dateFormatter = (dateString) => {
  const inputDate = new Date(dateString);
  if (isNaN(inputDate)) return "Invalid Date";

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// User utilities
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Navigation and UI constants
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
  {
    path: "/trashed",
    icon: FaTrashAlt,
    label: "Trash",
  },
];

// Styling constants
export const PRIORITY_STYLES = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-green-600 dark:text-green-400",
};

export const TASK_TYPE = {
  todo: "bg-yellow-500",
  in_progress: "bg-blue-500",
  review: "bg-purple-500",
  completed: "bg-green-500",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];

export * from "./constants";
export * from "./formatters";

// Add any additional utility exports here
