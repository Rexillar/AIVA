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
import clsx from "clsx";

const Badge = ({
  children,
  label,           // Backward compatibility
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,      // Icon support
  dot,             // Dot indicator for status
  ...props
}) => {
  // Support both label and children props for backward compatibility
  const content = children || label;

  const variants = {
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    info: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const dotColors = {
    primary: "bg-blue-500 dark:bg-blue-400",
    secondary: "bg-gray-500 dark:bg-gray-400",
    success: "bg-green-500 dark:bg-green-400",
    danger: "bg-red-500 dark:bg-red-400",
    warning: "bg-yellow-500 dark:bg-yellow-400",
    info: "bg-indigo-500 dark:bg-indigo-400",
    default: "bg-gray-500 dark:bg-gray-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            "w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0",
            dotColors[variant],
          )}
        />
      )}
      {Icon && (
        <Icon className={clsx("mr-1 flex-shrink-0", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      {content}
    </span>
  );
};

Badge.displayName = "Badge";
export { Badge };
export default Badge;
