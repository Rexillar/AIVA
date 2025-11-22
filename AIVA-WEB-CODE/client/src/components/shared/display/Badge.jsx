/*=================================================================
 * Project: AIVA-WEB
 * File: Button.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Button component for displaying buttons.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React from "react";
import clsx from "clsx";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className,
  dot,
  ...props
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  const dotColors = {
    default: "bg-gray-500 dark:bg-gray-400",
    primary: "bg-blue-500 dark:bg-blue-400",
    success: "bg-green-500 dark:bg-green-400",
    warning: "bg-yellow-500 dark:bg-yellow-400",
    danger: "bg-red-500 dark:bg-red-400",
    info: "bg-indigo-500 dark:bg-indigo-400",
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
            "w-1.5 h-1.5 rounded-full mr-1.5",
            dotColors[variant],
          )}
        />
      )}
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
export { Badge };
export default Badge;
